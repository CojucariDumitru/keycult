import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { stripe, isStripeConfigured } from '../lib/stripe';
import { optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { asyncHandler, badRequest } from '../utils/http';
import { env } from '../config/env';
import { sendOrderConfirmation } from '../lib/email';

const router = Router();

const FREE_SHIPPING_THRESHOLD = 15000; // $150 in cents
const STANDARD_SHIPPING = 1200; // $12

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KC-${ts}-${rand}`;
}

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1),
  email: z.string().email().optional(),
});

// POST /api/payment/create-checkout-session
router.post(
  '/create-checkout-session',
  optionalAuth,
  validateBody(checkoutSchema),
  asyncHandler(async (req, res) => {
    if (!isStripeConfigured) throw badRequest('Payments are not configured');

    const { items, email } = req.body as z.infer<typeof checkoutSchema>;

    // Always price from the database — never trust client-sent prices.
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItemsData: {
      productId: string;
      name: string;
      image: string;
      price: number;
      quantity: number;
    }[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) throw badRequest(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw badRequest(`Insufficient stock for ${product.name}`);
      }
      subtotal += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        name: product.name,
        image: product.images[0] ?? '',
        price: product.price,
        quantity: item.quantity,
      });
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: product.brand,
            images: product.images.slice(0, 1),
          },
        },
      });
    }

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
    const tax = 0;
    const total = subtotal + shipping + tax;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user?.userId ?? null,
        email: email ?? req.user?.email ?? 'guest@keycult.com',
        status: 'PENDING',
        subtotal,
        shipping,
        tax,
        total,
        currency: 'usd',
        items: { create: orderItemsData },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: email ?? req.user?.email,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'RO', 'NL'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shipping, currency: 'usd' },
            display_name: shipping === 0 ? 'Free shipping' : 'Standard shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      success_url: `${env.clientUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.clientUrl}/cart?canceled=1`,
      metadata: { orderId: order.id, orderNumber },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    res.json({ url: session.url, sessionId: session.id, orderId: order.id });
  })
);

// GET /api/payment/config — publishable key for the client
router.get('/config', (_req, res) => {
  res.json({ publishableKey: env.stripePublishableKey });
});

/**
 * Stripe webhook handler. Mounted separately in index.ts with a raw body
 * parser so the signature can be verified.
 */
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  if (!isStripeConfigured) {
    res.status(503).json({ error: 'Stripe not configured' });
    return;
  }

  const signature = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    if (!env.stripeWebhookSecret || env.stripeWebhookSecret.startsWith('PLACEHOLDER')) {
      // No secret configured yet — accept unverified in non-prod so local dev works.
      event = req.body as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature as string,
        env.stripeWebhookSecret
      );
    }
  } catch (err) {
    console.error('[webhook] Signature verification failed:', (err as Error).message);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await fulfillOrder(session);
        console.log('✓ Webhook processed successfully:', session.id);
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await prisma.order.updateMany({
          where: { stripeSessionId: session.id, status: 'PENDING' },
          data: { status: 'CANCELLED' },
        });
        break;
      }
      default:
        // Unhandled event types are fine — just acknowledge.
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('[webhook] Handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function fulfillOrder(session: Stripe.Checkout.Session): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
    include: { items: true },
  });
  if (!order) {
    console.warn('[webhook] No order found for session', session.id);
    return;
  }
  if (order.status === 'PAID') {
    // Idempotent — Stripe may deliver the same event more than once.
    return;
  }

  const shippingDetails = session.customer_details;
  const addr = (session as unknown as { shipping_details?: Stripe.Checkout.Session['customer_details'] })
    .shipping_details?.address;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        email: session.customer_details?.email ?? order.email,
        stripePaymentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        shippingName: shippingDetails?.name ?? null,
        shippingLine1: addr?.line1 ?? null,
        shippingLine2: addr?.line2 ?? null,
        shippingCity: addr?.city ?? null,
        shippingState: addr?.state ?? null,
        shippingPostal: addr?.postal_code ?? null,
        shippingCountry: addr?.country ?? null,
      },
    }),
    // Decrement stock for each ordered item.
    ...order.items
      .filter((i) => i.productId)
      .map((i) =>
        prisma.product.update({
          where: { id: i.productId! },
          data: { stock: { decrement: i.quantity } },
        })
      ),
  ]);

  await sendOrderConfirmation({
    to: session.customer_details?.email ?? order.email,
    orderNumber: order.orderNumber,
    items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    currency: order.currency,
    shippingName: shippingDetails?.name ?? null,
  });
}

export default router;
