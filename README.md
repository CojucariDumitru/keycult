# KEYCULT — Electronics, Unlocked

> A full-stack electronics marketplace (portfolio project): React + TypeScript storefront with **light & dark themes**, Express + Prisma API, Stripe checkout, transactional email, and a complete admin panel.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-5-2d3748?logo=prisma&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-4169e1?logo=postgresql&logoColor=white">
  <img alt="Stripe" src="https://img.shields.io/badge/Stripe-Checkout-635bff?logo=stripe&logoColor=white">
</p>

---

## 🔗 Live Demo

| | URL |
|---|---|
| **Frontend** | https://keycult.vercel.app |
| **API** | https://keycult-api.onrender.com |

> ⚠️ The backend runs on Render's free tier. After ~15 min of inactivity it spins down — **the first request can take ~30–60 seconds** to wake up. Subsequent requests are fast.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@keycult.dev` | `Admin1234!` |
| **Customer** | `john@example.com` | `Test1234!` |

The login page has one-click buttons that fill these in for you.

## 💳 Test Payment

Checkout uses **Stripe test mode** — no real money moves. On the Stripe page enter:

| Field | Value |
|---|---|
| Card | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| ZIP | Any 5 digits |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand, Framer Motion |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **Database** | PostgreSQL (Neon, serverless) |
| **Auth** | JWT access + refresh tokens (httpOnly cookie rotation), bcrypt |
| **Payments** | Stripe Checkout + webhooks |
| **Email** | Resend (transactional order confirmations) |
| **Images** | Cloudinary (admin uploads) + resilient placeholder fallback |
| **Hosting** | Vercel (frontend) · Render (API) · Neon (DB) |

---

## ✨ Features

**Storefront**
- Marketplace homepage: hero slider, category tiles, deals, promo banners, brand strip
- **Light & dark themes** with a no-flash toggle (persisted)
- Mega-menu category navigation + search with category scope
- 36-product electronics catalog (phones, laptops, audio, TV, gaming, smart home, wearables, accessories)
- Catalog with **filter sidebar (category + price), search, sorting, and pagination**
- Product cards with discount %, ratings, old→new pricing, and wishlist
- Product detail pages with image gallery, specs, stock state, and related items
- Persistent cart **and wishlist** (localStorage) with slide-out cart drawer
- **Stripe Checkout** with shipping collection and free-shipping threshold
- Order confirmation page that polls for webhook fulfillment
- Customer accounts: register, login, profile, order history

**Admin panel** (`/admin`, admin-only)
- Dashboard with KPIs (revenue, orders, products, customers), 7-day revenue chart, top sellers, recent orders
- Product CRUD (create / edit / delete) with image URLs and spec editor
- Order management with expandable details and status updates

**Engineering**
- Type-safe end to end (shared TS types)
- JWT auth with refresh-token rotation and transparent client-side refresh
- Server-side price validation (cart prices are never trusted from the client)
- Idempotent Stripe webhook handling with stock decrement + email
- Zod request validation, rate limiting, Helmet, central error handling
- Prisma migrations + idempotent seed (20 products, 2 users)

---

## 🏗 Architecture

```
                    ┌──────────────────────────┐
   Browser  ──────▶ │  React SPA (Vercel)      │
                    │  Vite · Tailwind · Query │
                    └───────────┬──────────────┘
                                │  HTTPS / JSON (Bearer + refresh cookie)
                                ▼
                    ┌──────────────────────────┐
                    │  Express API (Render)    │
                    │  Prisma · JWT · Zod      │
                    └───┬───────┬───────┬──────┘
                        │       │       │
        ┌───────────────┘       │       └────────────────┐
        ▼                       ▼                        ▼
┌───────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Neon Postgres │     │  Stripe (pay +   │     │ Resend / Cloud-  │
│  (eu-central) │     │  webhooks)       │     │ inary            │
└───────────────┘     └──────────────────┘     └──────────────────┘
```

The Stripe webhook (`POST /api/payment/webhook`) is what flips an order from
`PENDING` to `PAID`, decrements stock, and triggers the confirmation email.

---

## 📦 Local Development

### Prerequisites
- Node.js 18+
- A PostgreSQL database (a free [Neon](https://neon.tech) project works great)
- Stripe test keys, plus optional Resend & Cloudinary accounts

### 1. Backend

```bash
cd server
cp .env.example .env        # then fill in DATABASE_URL, Stripe keys, etc.
npm install
npx prisma migrate deploy   # create tables
npm run seed                # 36 products + admin + customer
npm run dev                 # http://localhost:5000
```

Generate JWT secrets with `openssl rand -hex 32`.

### 2. Frontend

```bash
cd client
cp .env.example .env.development   # defaults point at http://localhost:5000/api
npm install
npm run dev                        # http://localhost:5173
```

### 3. Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
# paste the printed whsec_... into server/.env as STRIPE_WEBHOOK_SECRET
```

---

## 🚀 Deployment

- **Database** — Neon (managed Postgres). Migrations run via `prisma migrate deploy`.
- **API** — Render web service (see [`render.yaml`](./render.yaml)). Secrets are set as
  dashboard env vars (`sync: false`), never committed.
- **Frontend** — Vercel, root directory `client`, framework preset **Vite**.
  Set `VITE_API_URL` to the Render URL + `/api`.

After the API is live, add a Stripe webhook destination pointing at
`https://<render-url>/api/payment/webhook` and put its signing secret into the
Render `STRIPE_WEBHOOK_SECRET` env var.

---

## 📁 Project Structure

```
keycult/
├── server/                 # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── config/         # env loading
│       ├── lib/            # prisma, stripe, cloudinary, email
│       ├── middleware/     # auth, validation, errors
│       ├── routes/         # auth, products, orders, payment, admin
│       ├── utils/          # jwt, http helpers
│       └── index.ts
├── client/                 # React + Vite SPA
│   └── src/
│       ├── components/      # Navbar, Footer, CartDrawer, ProductCard, ...
│       ├── pages/           # Home, Shop, ProductDetail, Cart, admin/*, ...
│       ├── store/           # auth, cart, toast
│       ├── lib/             # api client, hooks, stripe, formatters
│       └── types/
├── render.yaml             # Render Blueprint (no secrets)
└── README.md
```

---

## 📝 Notes

This is a **portfolio demo**, not a real shop. All payment keys are Stripe **test**
keys (`sk_test_` / `pk_test_`) that cannot process real money. Products and imagery
are illustrative.

## 📄 License

MIT — free to learn from and build upon.
