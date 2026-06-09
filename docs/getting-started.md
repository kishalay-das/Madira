# Getting Started

Two ways to run Nocturne locally:

1. **Docker Compose** — the whole stack (Postgres + migrations + seed + web) with one command.
2. **Manual** — run Postgres yourself and start the Next.js dev server with hot reload.

Use Docker for a quick "does it work" look; use the manual setup for day‑to‑day development.

---

## Prerequisites

- **Node.js 20+** and npm
- **Docker + Docker Compose** (for the containerized path, or just for Postgres)
- A **Cloudinary** account (optional locally — only the admin media uploader needs it)

---

## Option A — Docker Compose (full stack)

```bash
docker compose up --build
```

This brings up three services defined in `docker-compose.yml`:

| Service | Role |
| --- | --- |
| `db` | `postgres:16-alpine`, data persisted in the `pgdata` volume |
| `migrate` | One‑shot: runs `prisma migrate deploy && prisma db seed`, then exits |
| `web` | The Next.js app in standalone production mode |

When it settles, open **http://localhost:3000**.

> The `web` container needs `AUTH_SECRET` (and Cloudinary keys if you use uploads) in its
> environment — these are wired in `docker-compose.yml`. See [configuration.md](configuration.md).

To reset everything (including the database volume):

```bash
docker compose down -v
```

---

## Option B — Manual (recommended for development)

### 1. Install dependencies

```bash
npm install
```

`postinstall` runs `prisma generate` automatically.

### 2. Start a Postgres database

Either run the bundled Postgres only:

```bash
docker compose up -d db
```

…or point at any Postgres instance of your own.

### 3. Configure environment

```bash
cp .env.example .env
```

Then edit `.env` — at minimum set `DATABASE_URL` and `AUTH_SECRET`. Generate a secret with:

```bash
openssl rand -hex 32
```

Full variable reference: [configuration.md](configuration.md).

### 4. Apply migrations and seed

```bash
npm run db:migrate     # prisma migrate dev — creates tables
npm run db:seed        # loads categories, products, demo users, coupons
```

### 5. Run the dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Demo accounts

The seed (`prisma/seed.ts`) creates two logins. Both use the password **`nocturne8`**.

| Role | Email | Password | Can access |
| --- | --- | --- | --- |
| Admin | `admin@nocturne.club` | `nocturne8` | Storefront **and** `/admin` |
| Customer | `demo@nocturne.club` | `nocturne8` | Storefront, account, orders |

You can also self‑register at `/register` (creates a `CUSTOMER`).

---

## Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server (hot reload) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` — create/apply a dev migration |
| `npm run db:seed` | Seed the database (`tsx prisma/seed.ts`) |
| `npm run db:reset` | `prisma migrate reset --force` — wipe + re‑migrate + re‑seed |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

### Seed product media (optional)

After seeding, you can populate each product with real Cloudinary images and a generated video:

```bash
npx tsx scripts/seed-media.ts
```

Requires Cloudinary credentials in `.env`. Details in [media.md](media.md).
