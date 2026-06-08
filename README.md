# NOCTURNE — Premium Spirits Delivery

A world-class, ultra-premium alcohol delivery web application. Dark luxury theme
with gold, burgundy and emerald accents, glassmorphism, smooth Framer-Motion
micro-interactions, and a concierge-level shopping experience — built to feel
like a luxury fashion house, not a discount liquor store.

> **21+ only.** This is a design/engineering reference. Please drink responsibly.

---

## ✨ Highlights

- **Full luxury landing page** — full-screen parallax hero, featured categories,
  best sellers, premium collections, AI "Picked for You", occasion shopping, VIP
  membership, verified reviews, and a mobile-app showcase.
- **Procedurally rendered bottles** — every product's bottle is generated from an
  SVG palette (glass / liquid / label). Zero image dependencies → always crisp,
  instant loading, perfect imagery performance.
- **Shop** — live category filtering, price range, 5-way sorting, quick-view modal.
- **Product page** — drag-to-rotate 360° bottle, tasting notes, distillery info,
  food pairings, related products, wishlist, add-to-cart.
- **One-page checkout** — address, delivery scheduling, gift wrapping, multiple
  payment methods, promo codes (`VIP10`), live order summary.
- **User dashboard** — profile, order history, wishlist, saved addresses,
  membership status, loyalty points, referral program.
- **Admin console** — KPI dashboard with revenue chart, product/inventory table,
  orders, customers, coupons (visit `/admin`).
- **PWA + SEO** — web manifest, theme color, dynamic `sitemap.xml` / `robots.txt`,
  rich OpenGraph metadata, `prefers-reduced-motion` support.

## 🧱 Tech Stack

| Layer       | Choice                                             |
| ----------- | -------------------------------------------------- |
| Framework   | **Next.js 16** (App Router, RSC, standalone build) |
| Language    | **TypeScript**                                     |
| Styling     | **Tailwind CSS v4** + custom luxury design system  |
| Animation   | **Motion** (Framer Motion)                         |
| Icons       | **lucide-react**                                   |
| State       | **Zustand** (persisted cart)                       |
| Database    | **PostgreSQL** + **Prisma ORM** (schema included)  |
| Deployment  | **Docker** + docker-compose                        |

## 🚀 Getting Started

```bash
cp .env.example .env          # DATABASE_URL + AUTH_SECRET
docker compose up -d db       # PostgreSQL
npm install                   # also runs `prisma generate`
npm run db:migrate            # create tables
npm run db:seed               # catalog + demo users + coupons
npm run dev
# open http://localhost:3000  ·  sign in with the demo accounts below
```

See **Backend** below for demo credentials and the full API. Production build:

```bash
npm run build && npm start
```

### Key routes

| Route                | Description                    |
| -------------------- | ------------------------------ |
| `/`                  | Luxury landing page            |
| `/shop`              | Catalog with filters & sorting |
| `/shop?category=…`   | Pre-filtered category          |
| `/product/[slug]`    | Product detail + 360° view     |
| `/cart`              | One-page checkout              |
| `/account`           | User dashboard                 |
| `/admin`             | Admin console                  |
| `/api/products`      | Sample REST endpoint           |

## 🗄️ Backend (PostgreSQL + Prisma + Auth.js)

The catalog, accounts, orders, reviews and admin are **fully database-backed**.
Schema: [`prisma/schema.prisma`](prisma/schema.prisma) (Users, Products,
Categories, Orders, OrderItems, Addresses, Reviews, Wishlist, Coupons,
memberships & loyalty).

### One-time setup

```bash
cp .env.example .env                 # DATABASE_URL + AUTH_SECRET
docker compose up -d db              # start PostgreSQL
npm install                          # runs `prisma generate`
npm run db:migrate                   # apply migrations
npm run db:seed                      # seed catalog + users + coupons
npm run dev
```

Helper scripts: `db:migrate`, `db:seed`, `db:reset`, `db:studio`.

### Demo accounts (seeded)

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Admin    | `admin@nocturne.club` | `nocturne8` |
| Customer | `demo@nocturne.club`  | `nocturne8` |

### Authentication

[Auth.js v5](src/auth.ts) (credentials, JWT sessions, bcrypt). `/login`,
`/register`, role on the session. `/account` requires sign-in; `/admin` requires
the `ADMIN` role (guarded in the server components).

### REST API

| Endpoint                          | Method | Notes                                   |
| --------------------------------- | ------ | --------------------------------------- |
| `/api/products`                   | GET    | category / q / sort / limit (DB)        |
| `/api/products/[slug]`            | GET    | product + related                       |
| `/api/categories`                 | GET    | all categories                          |
| `/api/coupons?code=`              | GET    | validate a coupon                       |
| `/api/auth/register`              | POST   | create account (zod + bcrypt)           |
| `/api/auth/[...nextauth]`         | —      | Auth.js handlers                        |
| `/api/orders`                     | POST   | place order — **prices recomputed server-side**, coupon + loyalty (auth) |
| `/api/wishlist`                   | POST   | toggle wishlist item (auth)             |
| `/api/addresses` / `[id]`         | POST/DELETE | manage own addresses (auth)        |
| `/api/products/[slug]/reviews`    | POST   | add review + refresh rating (auth)      |
| `/api/admin/products` / `[id]`    | POST/PATCH/DELETE | product CRUD (**ADMIN**)     |
| `/api/admin/orders/[id]`          | PATCH  | update order status (**ADMIN**)         |

All mutations validate input with **zod** and enforce auth/role on the server;
order totals, discounts, tax and loyalty are always recomputed from the DB —
client prices are never trusted.

## 🐳 Docker

```bash
docker compose up --build
# web → http://localhost:3000, postgres → :5432
```

The Dockerfile uses Next.js `output: "standalone"` for a minimal production image.

## 🎨 Design System

Defined in [`src/app/globals.css`](src/app/globals.css) via Tailwind v4 `@theme`:

- **Surfaces:** `void`, `night`, `charcoal`, `graphite`
- **Accents:** `gold`, `gold-bright`, `champagne`
- **Jewels:** `burgundy`, `emerald`
- **Type:** Playfair Display (headings) · Inter (body)
- **Utilities:** `.glass`, `.glass-dark`, `.shimmer`, `.luxe-card`,
  `.text-gold-gradient`, `.gold-rule`, `.container-luxe`

## 📁 Project Structure

```
src/
  app/                 # routes (landing, shop, product, cart, account, admin, api)
  components/
    bottle.tsx         # procedural SVG bottle renderer
    layout/            # navbar, footer
    cart/              # cart drawer, checkout
    product/           # card, quick view, detail, showcase
    sections/          # landing page sections
    account/ admin/    # dashboards
    ui/                # button, badge, stars, reveal
  lib/                 # data, types, utils
  store/               # zustand cart
prisma/                # PostgreSQL schema
```

---

Crafted with concierge care. 🥃
