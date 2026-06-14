import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, badRequest, unauthorized } from '../utils/http';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenTtlMs,
} from '../utils/jwt';
import { env } from '../config/env';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: (env.isProd ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: refreshTokenTtlMs(),
    path: '/',
  };
}

async function issueTokens(user: { id: string; email: string; role: 'USER' | 'ADMIN' }) {
  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshTokenTtlMs()),
    },
  });

  return { accessToken, refreshToken };
}

const publicUser = (u: { id: string; email: string; name: string; role: string; createdAt: Date }) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  createdAt: u.createdAt,
});

// POST /api/auth/register
router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body as z.infer<typeof registerSchema>;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw badRequest('An account with this email already exists');

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const { accessToken, refreshToken } = await issueTokens(user);
    res.cookie('refreshToken', refreshToken, cookieOptions());
    res.status(201).json({ user: publicUser(user), accessToken });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw unauthorized('Invalid email or password');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw unauthorized('Invalid email or password');

    const { accessToken, refreshToken } = await issueTokens(user);
    res.cookie('refreshToken', refreshToken, cookieOptions());
    res.json({ user: publicUser(user), accessToken });
  })
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = (req.cookies?.refreshToken as string) || (req.body?.refreshToken as string);
    if (!token) throw unauthorized('No refresh token');

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw unauthorized('Invalid refresh token');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw unauthorized('Refresh token expired');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw unauthorized('User no longer exists');

    // Rotate: delete old, issue new.
    await prisma.refreshToken.delete({ where: { token } }).catch(() => undefined);
    const tokens = await issueTokens(user);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions());
    res.json({ user: publicUser(user), accessToken: tokens.accessToken });
  })
);

// POST /api/auth/logout
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken as string;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie('refreshToken', { ...cookieOptions(), maxAge: undefined });
    res.json({ success: true });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw unauthorized('User not found');
    res.json({ user: publicUser(user) });
  })
);

export default router;
