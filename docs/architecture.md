# Architecture

## Tech stack

| Layer | Choice | Version |
| --- | --- | --- |
| Framework | Next.js (App Router, RSC) | 16.2.7 |
| UI runtime | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS v4 + design tokens | ^4 |
| ORM | Prisma | 6.16.2 |
| Database | PostgreSQL (Docker local / Neon prod) | 16 |
| Auth | Auth.js / NextAuth | ^5.0.0‑beta.31 |
| Media | Cloudinary | ^2.10.0 |
| Client state | Zustand | ^5.0.14 |
| Animation | motion | ^12.40.0 |
| Icons | lucide-react | — |
| Password hashing | bcryptjs | — |
| Validation | zod | — |

## Rendering model

The app is **App Router with React Server Components by default**. Pages fetch data on the server
via Prisma query helpers; interactive pieces (cart drawer, galleries, forms, admin tables) are
client components marked `"use client"`.

- **Server Components** read directly from the database through `src/lib/queries.ts` — no client
  fetch round‑trip for the initial render of catalog/product pages.
- **Client Components** handle interactivity and talk to the REST API under `src/app/api/*` for
  mutations (add review, manage wishlist/addresses, place order, admin CRUD).
- The product detail page is forced dynamic (`export const dynamic = "force-dynamic"`) because it
  reads the session via `auth()` (cookies), which is incompatible with static generation.

## Folder layout

```
src/
├── app/                      # App Router routes
│   ├── (storefront pages)/   # /, /shop, /product/[slug], /cart, /account, /login, /register
│   ├── admin/                # admin console (guarded)
│   └── api/                  # REST endpoints (route.ts handlers)
├── components/
│   ├── account/              # account dashboard UI
│   ├── admin/                # admin tables, product editor, uploader
│   ├── auth/                 # login/register forms
│   ├── cart/                 # cart drawer
│   ├── layout/               # header, footer, nav
│   ├── product/              # product detail, gallery, magnifier
│   ├── sections/             # landing-page sections (hero, reviews, etc.)
│   ├── shop/                 # catalog grid + filters
│   ├── theme/                # theme helpers
│   ├── ui/                   # primitives (Button, etc.)
│   └── bottle.tsx            # procedural SVG bottle renderer
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   ├── queries.ts            # server-side data fetchers
│   ├── data.ts               # static/reference data
│   ├── types.ts              # shared TS types
│   ├── utils.ts              # helpers (formatPrice, cn, …)
│   ├── cloudinary.ts         # Cloudinary SDK config + upload helpers
│   └── admin-guard.ts        # server-side admin authorization
├── store/
│   └── cart.ts               # Zustand cart store
├── auth.ts                   # Auth.js (NextAuth v5) config — handlers, auth(), signIn/out
└── middleware.ts             # (if present) route protection

prisma/
├── schema.prisma             # data model
├── migrations/               # SQL migration history
└── seed.ts                   # seed script (categories, products, users, coupons)

scripts/
└── seed-media.ts             # uploads images + generates/uploads video per product
```

## Request & data flow

### Reading (catalog, product, account dashboards)

```
Browser → Next.js Server Component → src/lib/queries.ts → Prisma → PostgreSQL
                                   → rendered HTML/RSC payload → Browser
```

### Mutating (reviews, wishlist, orders, admin CRUD)

```
Client Component → fetch('/api/…') → route.ts handler
   → auth()/admin-guard authorization
   → zod validation
   → Prisma write → PostgreSQL
   → JSON response → Client Component updates UI
```

### Cart

The cart lives entirely client‑side in a **Zustand** store (`src/store/cart.ts`) and is persisted
to `localStorage`, so it survives reloads without a server round‑trip. It only touches the server
at checkout, when an `Order` is created via `POST /api/orders`. The cart drawer
(`src/components/cart/cart-drawer.tsx`) reads `items`, `subtotal()`, and quantity mutators from the
store and shows a free‑shipping progress bar (threshold `$150`).

## Key design decisions

- **Server‑first data fetching.** Catalog and product pages render from the database on the server
  for fast first paint and good SEO, avoiding a client fetch waterfall.
- **REST for mutations, not Server Actions everywhere.** Mutations go through explicit
  `/api/*` route handlers so the same endpoints back both the storefront and the admin console.
- **Procedural bottle art + uploaded media.** Each product has a deterministic SVG "bottle" derived
  from its palette (`paletteGlass/Liquid/Label`) used as a lightweight thumbnail, plus up to four
  uploaded Cloudinary photos and an optional video for the detail gallery. See [media.md](media.md).
- **Decimal money in the DB, formatted at the edge.** Prices are `Decimal(10,2)` in Postgres and
  rendered with `formatPrice()` so currency math stays exact.
- **Single Prisma client.** `src/lib/prisma.ts` memoizes the client on `globalThis` to avoid
  connection exhaustion during dev hot‑reload.
