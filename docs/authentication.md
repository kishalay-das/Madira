# Authentication & Authorization

Auth is handled by **Auth.js (NextAuth v5, `next-auth@5 beta`)** with a **Credentials** provider and
**JWT** sessions. The config lives in `src/auth.ts`.

## How it works

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [ Credentials({ … }) ],
  callbacks: { jwt, session },
});
```

- **Credentials provider** — `authorize()` validates `{ email, password }` with zod (email format +
  password ≥ 8 chars), looks the user up by lowercased email, and verifies the password against
  `passwordHash` with `bcrypt.compare`. On success it returns `{ id, email, name, role }`.
- **JWT sessions** — there is no server session store. The user id and `role` are copied into the
  token in the `jwt` callback and surfaced on `session.user` in the `session` callback, so every
  request can read the role without a database hit.
- **`trustHost: true`** — required behind proxies / on Vercel. Mirrored by the `AUTH_TRUST_HOST`
  env var.
- **Sign‑in page** — custom at `/login`; unauthenticated access to protected pages redirects there.

The catch‑all route `src/app/api/auth/[...nextauth]/route.ts` re‑exports `handlers` to wire Auth.js
into the App Router.

## Roles

Two roles, from the `Role` enum (`src/auth.ts` carries the type through the token/session):

| Role | Granted | Access |
| --- | --- | --- |
| `CUSTOMER` | Default for every new account | Storefront, cart, account, orders, reviews, wishlist |
| `ADMIN` | Set manually / via seed | Everything above **plus** `/admin` and all `/api/admin/*` |

## Registration

`POST /api/auth/register` creates a `CUSTOMER`: it validates input, bcrypt‑hashes the password
(cost 10), and stores the `User`. Sign‑in afterward goes through the Credentials provider. There is
no admin self‑signup — promote a user by setting `role = ADMIN` (e.g. in Prisma Studio or the seed).

## Guarding routes

There is **no `middleware.ts`** — authorization is enforced per‑route on the server.

### Pages (Server Components)

Protected pages call `auth()` and redirect. Example from `src/app/admin/page.tsx`:

```ts
const session = await auth();
if (!session?.user) redirect("/login?callbackUrl=/admin");
if (session.user.role !== "ADMIN") redirect("/");
```

### Admin API routes

Admin API handlers use the helper in `src/lib/admin-guard.ts`:

```ts
// src/lib/admin-guard.ts
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}
```

Usage in a handler (e.g. `POST /api/admin/products`):

```ts
if (!(await isAdmin())) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### User API routes

Customer‑scoped routes (orders, wishlist, addresses, reviews) call `auth()` directly, reject when
there's no session, and scope all reads/writes to `session.user.id` so users can only touch their
own data.

## Secrets

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Signs/encrypts the JWT — **required**. Generate with `openssl rand -hex 32`. |
| `AUTH_TRUST_HOST` | `"true"` so Auth.js trusts the deployment host (proxies / Vercel). |

These must be present in every environment, including the Docker `web` container and the Vercel
project. See [configuration.md](configuration.md).
