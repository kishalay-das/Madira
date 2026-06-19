/**
 * Canonical site origin, resolved in priority order:
 *   1. NEXT_PUBLIC_SITE_URL — explicit override (set this once a custom domain
 *      is connected, e.g. https://bottleexpress.com)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's stable production domain
 *      (auto-set on Vercel; avoids hardcoding the deploy URL)
 *   3. a sane local/demo fallback
 *
 * Used by metadataBase, canonical URLs, the sitemap and robots so every
 * absolute URL points at one consistent origin.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://kubo-demo-fawn.vercel.app")
).replace(/\/+$/, "");
