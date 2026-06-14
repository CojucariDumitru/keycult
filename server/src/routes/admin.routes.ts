import { Router } from 'express';
import { OrderStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/http';

const router = Router();

router.use(requireAuth, requireAdmin);

const PAID_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

// GET /api/admin/stats — dashboard KPIs
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const paidWhere = { status: { in: PAID_STATUSES } };

    const [
      revenueAgg,
      orderCount,
      paidOrderCount,
      productCount,
      customerCount,
      lowStock,
      recentOrders,
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: paidWhere }),
      prisma.order.count(),
      prisma.order.count({ where: paidWhere }),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    // Top selling products (by quantity across paid orders).
    const topItems = await prisma.orderItem.groupBy({
      by: ['name'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    // Revenue for the last 7 days.
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);
    const recentPaid = await prisma.order.findMany({
      where: { ...paidWhere, createdAt: { gte: since } },
      select: { total: true, createdAt: true },
    });
    const byDay = new Map<string, number>();
    for (let d = 0; d < 7; d++) {
      const day = new Date(since);
      day.setDate(since.getDate() + d);
      byDay.set(day.toISOString().slice(0, 10), 0);
    }
    for (const o of recentPaid) {
      const key = o.createdAt.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + o.total);
    }

    res.json({
      kpis: {
        revenue: revenueAgg._sum?.total ?? 0,
        orders: orderCount,
        paidOrders: paidOrderCount,
        products: productCount,
        customers: customerCount,
        lowStock,
      },
      revenueByDay: Array.from(byDay.entries()).map(([date, total]) => ({ date, total })),
      topProducts: topItems.map((t) => ({ name: t.name, sold: t._sum.quantity ?? 0 })),
      recentOrders,
    });
  })
);

export default router;
