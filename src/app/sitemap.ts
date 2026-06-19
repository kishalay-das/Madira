import type { MetadataRoute } from "next";
import { getProductSlugs, getCategories } from "@/lib/queries";
import { SITE_URL as BASE } from "@/lib/site";

// Generated at request time (not build) so it can read live data from the DB.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Public, indexable routes. Account/admin/login/register and the cart are
  // intentionally excluded (private or transactional).
  const routes: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1 },
    { path: "/shop", priority: 0.9 },
    { path: "/our-story", priority: 0.6 },
    { path: "/authenticity-promise", priority: 0.6 },
    { path: "/sustainability", priority: 0.5 },
    { path: "/responsible-drinking", priority: 0.5 },
    { path: "/press", priority: 0.4 },
    { path: "/contact", priority: 0.5 },
    { path: "/faqs", priority: 0.5 },
    { path: "/shipping-policy", priority: 0.4 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/cookies", priority: 0.3 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = routes.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));

  // Live product + category pages from the database. Falls back to just the
  // static routes if the DB is unreachable, so the sitemap never 500s.
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [slugs, categories] = await Promise.all([
      getProductSlugs(),
      getCategories(),
    ]);
    const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
      url: `${BASE}/product/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${BASE}/shop?category=${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    dynamicRoutes = [...categoryRoutes, ...productRoutes];
  } catch {
    dynamicRoutes = [];
  }

  return [...staticRoutes, ...dynamicRoutes];
}
