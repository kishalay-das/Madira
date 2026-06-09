# Database

PostgreSQL accessed through **Prisma 6**. Schema lives in `prisma/schema.prisma`; migrations in
`prisma/migrations/`; seed data in `prisma/seed.ts`.

## Connection

The datasource reads a single env var:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

No `directUrl` is configured — the app uses one connection string for both queries and migrations.
The generated client targets two binaries so the same build runs locally and in the Alpine Docker
image / serverless runtime:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}
```

## Enums

| Enum | Values |
| --- | --- |
| `Role` | `CUSTOMER`, `ADMIN` |
| `MembershipTier` | `NONE`, `SILVER`, `GOLD`, `PLATINUM` |
| `OrderStatus` | `PENDING`, `PROCESSING`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED` |
| `DeliverySlot` | `PRIORITY`, `STANDARD`, `SCHEDULED` |

## Models

### User
Account + membership. Passwords are stored as a bcrypt hash in `passwordHash` (nullable to allow
future OAuth). Each user gets a unique `referralCode` and a `CUSTOMER` role by default.

Key fields: `email` (unique), `name`, `passwordHash`, `role`, `tier`, `loyaltyPoints`,
`referralCode` (unique).
Relations: `addresses`, `orders`, `reviews`, `wishlist`.

### Category
Catalog grouping. `hue` is a hex accent color used in the UI; `count` is a cached product tally.
Key fields: `slug` (unique), `name`, `tagline`, `hue`, `count`. Relation: `products`.

### Product
The core catalog item. Combines commerce fields, tasting metadata, media, and procedural bottle
palette.

- **Commerce:** `price` `Decimal(10,2)`, optional `compareAt`, `stock`, `badge`, `tags[]`.
- **Spirit metadata:** `distillery`, `abv`, `volume`, `origin`, `age`, `notes[]`, `pairings[]`,
  `noseNote`, `palateNote`, `finishNote`.
- **Media:** `images String[]` (up to 4 Cloudinary photo URLs), `video String? @db.Text` (optional
  Cloudinary video URL).
- **Procedural bottle:** `paletteGlass`, `paletteLiquid`, `paletteLabel` (hex) drive the SVG bottle.
- **Ratings cache:** `rating`, `reviewsCount`.
- Indexed on `categoryId` and `slug`.

Relations: `category`, `orderItems`, `reviews`, `wishlistItems`.

### Address
Customer shipping addresses. `onDelete: Cascade` from `User`. `isPrimary` flags the default.
Relation: `orders`.

### Order
A placed order with a unique human `number`, status, delivery options, money breakdown, and an
optional coupon.
Key fields: `number` (unique), `status`, `deliverySlot`, `scheduledFor`, `giftWrap`, `subtotal`,
`discount`, `shipping`, `tax`, `total`. Indexed on `userId`.
Relations: `user`, `address?`, `coupon?`, `items`.

### OrderItem
Line items. Stores `quantity` and a snapshot `unitPrice` so historical orders keep their price even
if the product changes. `onDelete: Cascade` from `Order`.

### Review
Product reviews: `rating` (int), `title`, `body`, `verified`. Cascades from `Product`. Indexed on
`productId`. The product's `rating`/`reviewsCount` are maintained as a cache when reviews change.

### WishlistItem
Join row between `User` and `Product` with a `@@unique([userId, productId])` constraint so a
product can't be wishlisted twice. Cascades from both sides.

### Coupon
Discount codes: `code` (unique), `percentOff` **or** `amountOff` `Decimal(10,2)`, `active`,
`expiresAt`, `redemptions`. Relation: `orders`.

## Migrations

History under `prisma/migrations/`:

| Migration | Purpose |
| --- | --- |
| `20260603071706_init` | Initial schema |
| `20260608075548_product_image` | Single product image field |
| `20260608090000_product_images` | Move to `images String[]` (multi‑photo) |
| `20260608100000_product_video` | Add optional `video` field |
| `20260608112828_init` | Schema consolidation |

### Workflow

```bash
# create + apply a new migration during development
npm run db:migrate            # prisma migrate dev

# apply pending migrations without generating new ones (CI / prod)
npx prisma migrate deploy

# wipe, re-migrate, and re-seed (destructive)
npm run db:reset
```

In CI, the GitHub Actions deploy job runs `npx prisma migrate deploy` against the production (Neon)
database before the Vercel deploy. See [deployment.md](deployment.md).

## Seeding

`prisma/seed.ts` (run via `npm run db:seed`, configured as `tsx prisma/seed.ts`) loads:

- Categories with accent hues
- A catalog of products with full metadata and procedural palettes
- Two demo users (admin + customer), password **`nocturne8`**, hashed with bcrypt (cost 10)
- Coupons

To attach real images/video to seeded products, run the media script afterward — see
[media.md](media.md):

```bash
npx tsx scripts/seed-media.ts
```

## Data dumps

Database dumps (`dump.sql`, `*.dump`) are **gitignored** — they contain user data and bcrypt
hashes and must never be committed. To move local data into a cloud database (e.g. Neon):

```bash
# dump from the local Docker Postgres
docker exec -t <db_container> pg_dump -U postgres --no-owner --no-acl --clean --if-exists -d <db> > dump.sql

# import into the target
psql "$DATABASE_URL" < dump.sql
```
