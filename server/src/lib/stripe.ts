import Stripe from 'stripe';
import { env } from '../config/env';

// A single shared Stripe client. If the key is absent (e.g. local without
// Stripe configured) the routes that need it will surface a clear error.
// Omit apiVersion so the SDK uses its pinned default — avoids type drift.
export const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey)
  : (null as unknown as Stripe);

export const isStripeConfigured = Boolean(env.stripeSecretKey);
