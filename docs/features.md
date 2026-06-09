# Features

A walkthrough of what Nocturne does, by area. Routes are App Router pages under `src/app/`.

## Storefront

### Landing page (`/`)
A composed, animated marketing page built from sections in `src/components/sections/`:

| Section | Component | Purpose |
| --- | --- | --- |
| Hero | `hero.tsx` | Cinematic intro with the brand statement |
| Categories | `categories.tsx` | Browse by spirit category (accent‑hued tiles) |
| Best sellers | `best-sellers.tsx` | Top products |
| Collections | `collections.tsx` | Curated groupings |
| Occasions | `occasions.tsx` | Shop by moment (gifting, celebrations…) |
| Membership | `membership.tsx` | Tiered membership pitch (Silver/Gold/Platinum) |
| Recommendations | `recommendations.tsx` | Personalized picks |
| Reviews | `reviews.tsx` | Social proof / testimonials |
| App promo | `app-promo.tsx` | Mobile app call‑to‑action |

### Shop / catalog (`/shop`)
Client catalog (`src/components/shop/shop-client.tsx`) with category filtering, search, and sorting.
Cards (`product-card.tsx`) show the product, price, badge, and a **quick view** (`quick-view.tsx`)
for an add‑to‑cart without leaving the grid.

### Product detail (`/product/[slug]`)
`product-detail.tsx` renders the full page:
- **Media gallery** — up to four uploaded Cloudinary photos plus an optional video, with a
  hover **magnifier**. Falls back to the procedural SVG bottle when no media exists. See
  [media.md](media.md).
- **Tasting profile** — nose / palate / finish notes, ABV, volume, origin, age, pairings.
- **Reviews** — `reviews-panel.tsx`; signed‑in users can post a rating + review.
- **Add to cart** and **wishlist** actions.
- The page is `force-dynamic` because it reads the session.

### Cart & checkout (`/cart`)
The cart is a client‑side **Zustand** store (`src/store/cart.ts`) persisted to `localStorage`. The
slide‑out **cart drawer** (`src/components/cart/cart-drawer.tsx`) shows line items, quantity steppers,
a subtotal, and a **free‑shipping progress bar** (threshold **$150**). Checkout collects the
delivery slot, address, gift‑wrap, and an optional coupon, then creates an order via
`POST /api/orders`, which computes discount/shipping/tax/total server‑side.

### Accounts
- **Register** (`/register`) — self‑signup, creates a `CUSTOMER`.
- **Login** (`/login`) — Credentials sign‑in; supports `callbackUrl`.
- **Account dashboard** (`/account`, `account-client.tsx`) — order history, addresses, wishlist,
  membership tier, and loyalty points.

## Admin console (`/admin`)

Guarded — only `role = ADMIN` (others are redirected). `admin-client.tsx` provides:

- **Dashboard metrics** — products, orders, customers, coupons, revenue aggregate.
- **Product management** — create / edit / delete products, including pricing, tasting metadata,
  procedural bottle palette, images, and video. Backed by `/api/admin/products[/:id]`.
- **Media uploads** — push images/video to Cloudinary via `/api/admin/upload`.
- **Order management** — advance order status (`PENDING → PROCESSING → IN_TRANSIT → DELIVERED`,
  or `CANCELLED`) via `PATCH /api/admin/orders/[id]`.

The admin page is marked `robots: { index: false, follow: false }` so it's never indexed.

## Commerce mechanics

- **Coupons** — percentage or fixed‑amount discounts with optional expiry; validated against the
  cart and applied at checkout.
- **Delivery slots** — `PRIORITY`, `STANDARD`, `SCHEDULED` (with `scheduledFor`).
- **Gift wrap** — per‑order flag.
- **Membership tiers & loyalty points** — stored on the user (`tier`, `loyaltyPoints`) and surfaced
  in the account area and membership section.
- **Wishlist** — toggle products; one row per product enforced by a unique constraint.
- **Reviews** — drive each product's cached `rating` / `reviewsCount`.

## Cross‑cutting

- **SEO** — `src/app/sitemap.ts` and `robots.ts` generate the sitemap and robots policy; pages set
  metadata/OpenGraph. (Base URL is currently a constant in code — see
  [configuration.md](configuration.md) for wiring `NEXT_PUBLIC_SITE_URL`.)
- **Loading & error states** — `loading.tsx` and `not-found.tsx` provide route‑level fallbacks.
- **Animation** — `motion` powers page/section transitions and the cart drawer.
