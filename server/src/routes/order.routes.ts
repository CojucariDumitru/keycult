import { Router } from 'express';
import { z } from 'zod';
import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { asyncHandler, notFound, forbidden } from '../utils/http';

const router = Router();

const orderInclude = { items: true } satisfies Prisma.OrderInclude;

// GET /api/orders  — the signed-in user's orders
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  })
);

// GET /api/orders/by-session/:sessionId  — used by the order-success page
router.get(
  '/by-session/:sessionId',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: req.params.sessionId },
      include: orderInclude,
    });
    if (!order) throw notFound('Order not found');
    res.json({ order });
  })
);

// GET /api/orders/:id  — single order (owner or admin)
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: orderInclude,
    });
    if (!order) throw notFound('Order not found');
    if (order.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw forbidden('You do not have access to this order');
    }
    res.json({ order });
  })
);

/* ------------------------------- Admin views ------------------------------- */

// GET /api/orders/admin/all
router.get(
  '/admin/all',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const where: Prisma.OrderWhereInput = {};
    if (status && Object.values(OrderStatus).includes(String(status) as OrderStatus)) {
      where.status = String(status) as OrderStatus;
    }
    const orders = await prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ orders });
  })
);

// PATCH /api/orders/:id/status  (admin)
router.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  validateBody(z.object({ status: z.nativeEnum(OrderStatus) })),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: (req.body as { status: OrderStatus }).status },
      include: orderInclude,
    });
    res.json({ order });
  })
);

export default router;
