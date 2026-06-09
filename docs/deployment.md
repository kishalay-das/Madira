# Deployment

Nocturne deploys to **Vercel** (native Next.js build) via **GitHub Actions**, against a **Neon**
PostgreSQL database. A Docker setup is also included for self‑hosting.

> **Vercel runs Next.js natively** — it does **not** use the `Dockerfile` / `docker-compose.yml`.
> Those are for local development and non‑Vercel self‑hosting. On Vercel, the build is driven by the
> Next.js framework preset.

## Production topology

```
GitHub push (main)
   └─► GitHub Actions (.github/workflows/deploy.yaml)
         ├─ npm ci
         ├─ prisma migrate deploy   → Neon Postgres
         └─ vercel --prod           → Vercel (builds & serves Next.js)
                                        media → Cloudinary
```

## CI/CD — `.github/workflows/deploy.yaml`

Triggers on push to `main`. The job declares `environment: secrets` because the GitHub
**Environment** holding the secrets is named `secrets`.

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: secrets                 # GitHub Environment that holds the secrets
    env:
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      - name: Deploy to Vercel (production)
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes
```

### Required GitHub secrets

Stored in the GitHub Environment named **`secrets`** (Repository → Settings → Environments →
`secrets` → Environment secrets). The job must declare `environment: secrets` to read them.

| Secret | Used for |
| --- | --- |
| `DATABASE_URL` | `prisma migrate deploy` against Neon |
| `VERCEL_TOKEN` | Authenticates the `vercel` CLI |
| `VERCEL_ORG_ID` | Target Vercel org/team (from `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | Target Vercel project (from `.vercel/project.json`) |

> **GitHub secrets ≠ Vercel env vars.** The migrate step runs in the Actions runner and reads
> **GitHub** secrets. The deployed app's runtime config (e.g. `DATABASE_URL`, `AUTH_SECRET`,
> `CLOUDINARY_*`, `NEXT_PUBLIC_SITE_URL`) must **also** be set in the **Vercel** project
> (Project → Settings → Environment Variables). See [configuration.md](configuration.md).

`VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` come from `.vercel/project.json`, created by running
`npx vercel link` locally. `.vercel/` is gitignored.

## Database — Neon

Production uses a Neon Postgres instance; `DATABASE_URL` points at it. The schema has **no
`directUrl`**, so the same URL is used for both migrations and runtime queries. If you switch to
Neon's pooled endpoint for the app, run migrations against the **direct** (non‑`-pooler`) endpoint.

To migrate existing local data to Neon, see the dump/restore steps in [database.md](database.md).

## Self‑hosting with Docker

`docker compose up --build` runs the full stack (`db` + one‑shot `migrate` + `web`). The `web`
service builds the app in Next.js **standalone** mode. Notes baked into the Dockerfile:

- `npm ci --ignore-scripts` in the deps stage (so `prisma generate` doesn't run before the schema
  is copied), then an explicit `npx prisma generate` in the builder stage.
- The `web` container needs `AUTH_SECRET` (and `CLOUDINARY_*` for uploads) in its environment.

This path has **no 4.5 MB upload limit** — relevant for admin media uploads (see below).

## Troubleshooting

### "DATABASE_URL resolved to an empty string" in Actions
The migrate step can't see the secret. Confirm:
1. The secret exists in the GitHub Environment named **`secrets`** (not just Repository secrets).
2. The job declares `environment: secrets`.
3. `DATABASE_URL` is passed in that step's `env:` block (it is, above).

### Deploy blocked: "commit author did not have contributing access… Hobby Plan does not support collaboration for private repositories"
Vercel attributes the deployment to the **Git commit author**, and that identity isn't a member of
the Vercel account — on Hobby, private‑repo collaboration is disabled. Fixes (no upgrade needed):

- Set your local Git identity to the **email on the Vercel account owner** and re‑commit/re‑push, so
  the deploy is attributed to the owner:
  ```bash
  git config user.email "<vercel-account-owner-email>"
  ```
- Remove any extra `Co-Authored-By:` trailer from the commit (a co‑author not on the account can
  also trip this check).
- Ensure `VERCEL_TOKEN` belongs to that same account owner.
- Or deploy from a prebuilt artifact so attribution isn't tied to the Git author:
  `vercel build` then `vercel deploy --prebuilt --prod`.
- Last resort: upgrade to Pro.

### Admin media uploads fail in production (but work locally)
Vercel caps the function **request body at 4.5 MB**. Upload large images/video **directly from the
browser to Cloudinary** and send only the URL to the app. See [media.md](media.md).

## Security checklist

- **Never commit `.env`** — it holds the DB password, `AUTH_SECRET`, and Cloudinary secrets.
  (`.env*` is gitignored.)
- **Never commit `dump.sql` / `*.dump`** — they contain user data and bcrypt hashes (gitignored).
- **Rotate any leaked tokens.** If a database/API token ever lands in a backup file (e.g.
  `~/.claude.json.bak`), rotate it and delete the backup.
- **Mask secrets** when echoing connection strings in logs or docs.
