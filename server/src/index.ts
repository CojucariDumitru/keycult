import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { notFoundHandler, errorHandler } from './middleware/error';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import paymentRoutes, { stripeWebhookHandler } from './routes/payment.routes';

const app = express();

app.set('trust proxy', 1);

// --- Security & infra middleware ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = new Set(
  [env.clientUrl, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean)
);
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / curl (no origin) and any configured client URL.
      if (!origin || allowedOrigins.has(origin)) return cb(null, true);
      return cb(null, true); // permissive for a public demo API
    },
    credentials: true,
  })
);

app.use(morgan(env.isProd ? 'tiny' : 'dev'));
app.use(cookieParser());

// --- Stripe webhook needs the RAW body, so mount it BEFORE express.json() ---
app.post('/api/payment/webhook', express.raw({ type: '*/*' }), stripeWebhookHandler);

// --- JSON parsing for everything else ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic rate limiting on the API surface.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (_req, res) => {
  res.json({ name: 'KEYCULT API', status: 'running', docs: '/api/health' });
});

// --- Error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`\n🔑 KEYCULT API running on port ${env.port} [${env.nodeEnv}]`);
  console.log(`   Health: http://localhost:${env.port}/api/health\n`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));

export default app;
