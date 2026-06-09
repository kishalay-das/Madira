# Nocturne — Documentation

Nocturne is a premium spirits / luxury alcohol e‑commerce and delivery web app. It pairs a
cinematic, dark "members‑club" front end with a full commerce backend: catalog, cart, checkout,
orders, reviews, wishlist, coupons, accounts, and an admin console for managing products, media,
and orders.

This folder is the source of truth for how the project is built, run, and deployed.

## Documentation map

| Doc | What's inside |
| --- | --- |
| [getting-started.md](getting-started.md) | Run locally — Docker one‑liner or manual Node setup, demo accounts |
| [architecture.md](architecture.md) | Tech stack, folder layout, request/data flow, key decisions |
| [database.md](database.md) | Prisma schema, every model, migrations, seeding, media script |
| [api-reference.md](api-reference.md) | Every REST endpoint — method, auth, body, response |
| [authentication.md](authentication.md) | Auth.js v5 setup, roles, session, route guards |
| [features.md](features.md) | Feature‑by‑feature walkthrough of the storefront and admin |
| [media.md](media.md) | Cloudinary image/video uploads, the bottle renderer, gallery magnifier |
| [design-system.md](design-system.md) | Theme tokens, typography, reusable UI components |
| [deployment.md](deployment.md) | Vercel + GitHub Actions CI/CD, Docker, Neon, troubleshooting |
| [configuration.md](configuration.md) | Every environment variable, what it does, where it's needed |

## At a glance

- **Framework:** Next.js 16 (App Router, React Server Components) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + custom design tokens
- **Database:** PostgreSQL via Prisma 6 (local Docker for dev, Neon for prod)
- **Auth:** Auth.js / NextAuth v5 (credentials, JWT sessions, bcrypt)
- **Media:** Cloudinary (images + video, `q_auto` compression)
- **State:** Zustand (cart), React Server Components for data
- **Animation:** `motion` (Framer Motion successor)
- **Deploy:** Vercel (native Next.js build) via GitHub Actions; Docker available for self‑hosting

## Quick start

```bash
# fastest path — full stack in Docker (db + migrate + seed + web)
docker compose up --build
# → http://localhost:3000
```

See [getting-started.md](getting-started.md) for the manual setup and demo login credentials.

> **Heads‑up on Next.js version:** this repo pins a build of Next.js whose APIs and file
> conventions can differ from older releases. Before changing framework‑level code, consult the
> bundled guides in `node_modules/next/dist/docs/` and heed any deprecation notices.
