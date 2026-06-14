import { Resend } from 'resend';
import { env } from '../config/env';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

const money = (cents: number, currency = 'usd') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);

interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderEmailData {
  to: string;
  orderNumber: string;
  items: OrderEmailItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shippingName?: string | null;
}

function orderConfirmationHtml(data: OrderEmailData): string {
  const rows = data.items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #1f1f1f;color:#e5e5e5;">
          ${i.name} <span style="color:#777;">× ${i.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #1f1f1f;text-align:right;color:#e5e5e5;">
          ${money(i.price * i.quantity, data.currency)}
        </td>
      </tr>`
    )
    .join('');

  return `
  <div style="background:#0a0a0a;padding:40px 0;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">
      <div style="padding:32px;border-bottom:1px solid #222;">
        <div style="font-size:24px;font-weight:800;letter-spacing:4px;color:#fff;">KEY<span style="color:#7c5cff;">CULT</span></div>
      </div>
      <div style="padding:32px;">
        <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">Order confirmed</h1>
        <p style="color:#999;margin:0 0 24px;line-height:1.6;">
          Thanks${data.shippingName ? `, ${data.shippingName}` : ''} — we've received your order.
          Your confirmation number is <strong style="color:#fff;">${data.orderNumber}</strong>.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${rows}
          <tr><td style="padding:12px 0;color:#999;">Subtotal</td><td style="padding:12px 0;text-align:right;color:#e5e5e5;">${money(data.subtotal, data.currency)}</td></tr>
          <tr><td style="padding:4px 0;color:#999;">Shipping</td><td style="padding:4px 0;text-align:right;color:#e5e5e5;">${data.shipping === 0 ? 'Free' : money(data.shipping, data.currency)}</td></tr>
          <tr><td style="padding:4px 0;color:#999;">Tax</td><td style="padding:4px 0;text-align:right;color:#e5e5e5;">${money(data.tax, data.currency)}</td></tr>
          <tr><td style="padding:16px 0 0;color:#fff;font-weight:700;font-size:18px;">Total</td><td style="padding:16px 0 0;text-align:right;color:#7c5cff;font-weight:700;font-size:18px;">${money(data.total, data.currency)}</td></tr>
        </table>
      </div>
      <div style="padding:24px 32px;border-top:1px solid #222;color:#666;font-size:13px;">
        KEYCULT · Premium mechanical keyboards · This is a portfolio demo store.
      </div>
    </div>
  </div>`;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping order confirmation email');
    return;
  }
  try {
    await resend.emails.send({
      from: env.emailFrom,
      to: data.to,
      subject: `KEYCULT — Order ${data.orderNumber} confirmed`,
      html: orderConfirmationHtml(data),
    });
    console.log(`[email] Order confirmation sent to ${data.to}`);
  } catch (err) {
    // Email failures must never break order processing.
    console.error('[email] Failed to send order confirmation:', err);
  }
}

export async function sendOrderShipped(to: string, orderNumber: string): Promise<void> {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: env.emailFrom,
      to,
      subject: `KEYCULT — Order ${orderNumber} shipped`,
      html: `<div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:32px;">
        <h2>Your order ${orderNumber} is on the way 🚀</h2>
        <p style="color:#999;">Thanks for shopping with KEYCULT.</p>
      </div>`,
    });
  } catch (err) {
    console.error('[email] Failed to send shipped email:', err);
  }
}
