# Configuration

All runtime configuration is via environment variables. Copy the template and fill it in:

```bash
cp .env.example .env
```

`.env*` is **gitignored** — never commit it (it holds the DB password, `AUTH_SECRET`, and Cloudinary
secrets).

## Variables

| Variable | Required | Scope | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | Server | PostgreSQL connection string used by Prisma (queries **and** migrations). |
| `AUTH_SECRET` | ✅ | Server | Signs/encrypts Auth.js JWTs. Generate with `openssl rand -hex 32`. |
| `AUTH_TRUST_HOST` | ✅ (prod) | Server | `"true"` so Auth.js trusts the deployment host behind a proxy / on Vercel. |
| `NEXT_PUBLIC_SITE_URL` | ➖ | Client+Server | Public base URL for metadata/sitemap/OpenGraph. See note below. |
| `CLOUDINARY_CLOUD_NAME` | ⬤ | Server | Cloudinary account — needed for media uploads. |
| `CLOUDINARY_API_KEY` | ⬤ | Server | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | ⬤ | Server | Cloudinary API secret. |

✅ always required · ⬤ required only for media uploads/seeding · ➖ optional

### `.env.example`

```bash
# PostgreSQL connection (used by Prisma)
DATABASE_URL="postgresql://nocturne:nocturne@localhost:5432/nocturne?schema=public"

# Public site URL (used for metadata, sitemap, OpenGraph)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Auth.js (NextAuth v5) — generate with: openssl rand -hex 32
AUTH_SECRET="replace-with-a-long-random-string"
AUTH_TRUST_HOST="true"

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Notes per variable

### `DATABASE_URL`
- **Local (Docker):** `postgresql://nocturne:nocturne@localhost:5432/nocturne?schema=public`.
- **Production (Neon):** the Neon connection string. The schema has no `directUrl`, so this one URL
  serves both migrations and the app. If you use Neon's pooled endpoint at runtime, run migrations
  against the **direct** (non‑`-pooler`) endpoint.

### `AUTH_SECRET` / `AUTH_TRUST_HOST`
Required wherever the app runs — including the Docker `web` container and the Vercel project. A
missing `AUTH_SECRET` causes `/api/auth/session` to 500. See [authentication.md](authentication.md).

### `NEXT_PUBLIC_SITE_URL`
Prefixed `NEXT_PUBLIC_`, so it's exposed to the browser. **Currently the codebase hardcodes the
base URL** (`https://nocturne.example`) in `src/app/layout.tsx`, `sitemap.ts`, and `robots.ts` —
this variable is **not yet wired in**, so changing it alone has no effect until those files are
updated to read `process.env.NEXT_PUBLIC_SITE_URL`. Set it to your real domain in production once
wired.

### `CLOUDINARY_*`
Only needed for the admin media uploader (`/api/admin/upload`) and the `scripts/seed-media.ts`
script. `cloudinaryConfigured()` returns a clean error when these are absent rather than crashing.
See [media.md](media.md).

## Where each environment reads config

| Environment | Reads from |
| --- | --- |
| Local dev | `.env` |
| Docker | `docker-compose.yml` service `environment:` blocks (+ `.env`) |
| GitHub Actions (migrate step) | GitHub **Environment `secrets`** → `DATABASE_URL` |
| Vercel (runtime) | Vercel Project → Settings → **Environment Variables** |

> **Two separate places in production.** The CI migrate step reads **GitHub** secrets; the running
> app reads **Vercel** env vars. Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`,
> `CLOUDINARY_*`, and `NEXT_PUBLIC_SITE_URL` in **both** as needed. See [deployment.md](deployment.md).
