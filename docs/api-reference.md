# API Reference

All endpoints live under `src/app/api/*` as App Router `route.ts` handlers and return JSON.
Bodies are validated with **zod**; authentication is enforced with Auth.js `auth()` and, for admin
routes, `requireAdmin()` from `src/lib/admin-guard.ts`.

Auth column legend:
- **Public** — no session required
- **Auth** — any signed‑in user
- **Admin** — signed‑in user with `role = ADMIN`

| Endpoint | Methods | Auth |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | GET, POST | Public (Auth.js handler) |
| `/api/auth/register` | POST | Public |
| `/api/products` | GET | Public |
| `/api/products/[slug]` | GET | Public |
| `/api/products/[slug]/reviews` | POST | Auth |
| `/api/categories` | GET | Public |
| `/api/coupons` | GET | Public |
| `/api/orders` | POST | Auth |
| `/api/wishlist` | POST | Auth |
| `/api/addresses` | POST | Auth |
| `/api/addresses/[id]` | DELETE | Auth |
| `/api/admin/products` | POST | Admin |
| `/api/admin/products/[id]` | PATCH, DELETE | Admin |
| `/api/admin/orders/[id]` | PATCH | Admin |
| `/api/admin/upload` | POST | Admin |

---

## Auth

### `GET|POST /api/auth/[...nextauth]`
The Auth.js (NextAuth v5) catch‑all handler — powers sign‑in, sign‑out, session, and CSRF. Not
called directly; the client uses `signIn` / `signOut`. See [authentication.md](authentication.md).

### `POST /api/auth/register`
Create a customer account.

```json
// request
{ "name": "Ada", "email": "ada@example.com", "password": "••••••••" }
```
Hashes the password with bcrypt, creates a `User` with role `CUSTOMER`. Returns the created user
(without the hash) or a validation/conflict error if the email is taken.

---

## Catalog (public)

### `GET /api/products`
List products. Supports filtering/sorting via query params (e.g. category, search, sort) handled by
the storefront catalog. Returns an array of products with media and palette fields.

### `GET /api/products/[slug]`
Fetch a single product by `slug`, including reviews and related data used by the detail page.

### `GET /api/categories`
List all categories (slug, name, tagline, hue, count).

### `GET /api/coupons`
List active coupons / validate a code for the cart's discount UI.

---

## Reviews

### `POST /api/products/[slug]/reviews` — Auth
Add a review to a product.

```json
// request
{ "rating": 5, "title": "Sublime", "body": "Notes of oak and dried fig." }
```
Creates a `Review` tied to the signed‑in user and refreshes the product's cached
`rating` / `reviewsCount`.

---

## Orders

### `POST /api/orders` — Auth
Place an order from the cart.

```json
// request (shape)
{
  "items": [{ "productId": "…", "quantity": 2 }],
  "addressId": "…",
  "deliverySlot": "STANDARD",
  "giftWrap": false,
  "couponCode": "WELCOME10"
}
```
Computes `subtotal`, `discount`, `shipping`, `tax`, `total` server‑side, snapshots each line's
`unitPrice` into `OrderItem`, generates a unique order `number`, and returns the created order.

---

## Wishlist

### `POST /api/wishlist` — Auth
Toggle a product in the signed‑in user's wishlist.

```json
{ "productId": "…" }
```
Adds the `WishlistItem` if absent, removes it if present (the `@@unique([userId, productId])`
constraint guarantees one row per product).

---

## Addresses

### `POST /api/addresses` — Auth
Create a shipping address for the current user.

```json
{ "label": "Home", "line1": "1 Park Ave", "line2": null, "city": "NYC", "postalCode": "10001", "country": "US", "isPrimary": true }
```

### `DELETE /api/addresses/[id]` — Auth
Delete one of the current user's addresses. Ownership is checked before deletion.

---

## Admin

All require `role = ADMIN`; otherwise they return `401/403` via `requireAdmin()`.

### `POST /api/admin/products` — Admin
Create a product. Body matches the `Product` editor form (name, slug, pricing, metadata, palette,
images, video, category).

### `PATCH /api/admin/products/[id]` — Admin
Update a product (partial). Used by the admin product editor.

### `DELETE /api/admin/products/[id]` — Admin
Delete a product.

### `PATCH /api/admin/orders/[id]` — Admin
Update an order's status (e.g. `PENDING → PROCESSING → IN_TRANSIT → DELIVERED`).

### `POST /api/admin/upload` — Admin
Upload an image or video to Cloudinary and return the secure URL. See [media.md](media.md).

> **Production note:** Vercel serverless functions cap the request body at **4.5 MB**. Large video
> or photo uploads routed through `/api/admin/upload` will fail in production at that ceiling — for
> big media, upload the file directly from the browser to Cloudinary instead of proxying it through
> the function. See [media.md](media.md) and [deployment.md](deployment.md).
