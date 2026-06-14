import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { asyncHandler, notFound } from '../utils/http';
import { uploadImage, isCloudinaryConfigured } from '../lib/cloudinary';

const router = Router();

const CATEGORIES = ['PHONE', 'LAPTOP', 'AUDIO', 'TV', 'GAMING', 'SMART_HOME', 'WEARABLE', 'ACCESSORY'] as const;

// GET /api/products  — list with filters, search, sort, pagination
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(String(req.query.limit ?? '12'), 10) || 12));
    const skip = (page - 1) * limit;

    const { category, search, sort, minPrice, maxPrice, featured } = req.query;

    const where: Prisma.ProductWhereInput = {};
    if (category && CATEGORIES.includes(String(category).toUpperCase() as never)) {
      where.category = String(category).toUpperCase() as never;
    }
    if (featured === 'true') where.featured = true;
    if (search) {
      const q = String(search);
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Math.round(Number(minPrice) * 100);
      if (maxPrice) where.price.lte = Math.round(Number(maxPrice) * 100);
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: limit }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

// GET /api/products/featured
router.get(
  '/featured',
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      where: { featured: true },
      orderBy: { rating: 'desc' },
      take: 8,
    });
    res.json({ products });
  })
);

// GET /api/products/categories  — counts per category
router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const grouped = await prisma.product.groupBy({
      by: ['category'],
      _count: { _all: true },
    });
    res.json({
      categories: grouped.map((g) => ({ category: g.category, count: g._count._all })),
    });
  })
);

// GET /api/products/:slug  — by slug (falls back to id)
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
    });
    if (!product) throw notFound('Product not found');

    const related = await prisma.product.findMany({
      where: { category: product.category, id: { not: product.id } },
      take: 4,
      orderBy: { rating: 'desc' },
    });

    res.json({ product, related });
  })
);

/* ----------------------------- Admin endpoints ----------------------------- */

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'slug must be kebab-case'),
  brand: z.string().min(1),
  description: z.string().min(10),
  price: z.number().int().positive(), // cents
  oldPrice: z.number().int().positive().nullable().optional(),
  category: z.enum(CATEGORIES),
  images: z.array(z.string().url()).min(1),
  stock: z.number().int().min(0),
  featured: z.boolean().optional().default(false),
  rating: z.number().min(0).max(5).optional().default(0),
  reviewCount: z.number().int().min(0).optional().default(0),
  specs: z.record(z.string()).optional(),
});

// POST /api/products  (admin)
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validateBody(productSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof productSchema>;
    const product = await prisma.product.create({ data: data as Prisma.ProductCreateInput });
    res.status(201).json({ product });
  })
);

// PUT /api/products/:id  (admin)
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validateBody(productSchema.partial()),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body as Prisma.ProductUpdateInput,
    });
    res.json({ product });
  })
);

// DELETE /api/products/:id  (admin)
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

// POST /api/products/upload  (admin) — upload a base64/remote image to Cloudinary
router.post(
  '/upload',
  requireAuth,
  requireAdmin,
  validateBody(z.object({ image: z.string().min(10) })),
  asyncHandler(async (req, res) => {
    if (!isCloudinaryConfigured) {
      res.status(503).json({ error: 'Image hosting is not configured' });
      return;
    }
    const url = await uploadImage((req.body as { image: string }).image);
    res.json({ url });
  })
);

export default router;
