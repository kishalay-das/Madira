import type { MetadataRoute } from "next";
import { getProductSlugs, getCategories, getBlogSlugs } from "@/lib/queries";
import { SITE_URL as BASE } from "@/lib/site";

// Revalidated daily. Using a stable constant rather than new Date() so
// crawlers only see lastModified change when content actually changes
// (on-demand revalidation from admin mutations keeps this fresh).
export const revalidate = 86400;

// Stable build-time stamp used for entries without a per-record timestamp.
// On-demand revalidation (revalidatePath) from admin routes keeps content
// current; this constant simply avoids reporting every entry as changed on
// every crawl.
const BUILD_DATE = new Date("2026-06-19T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Public, indexable routes. Account/admin/login/register and the cart are
  // intentionally excluded (private or transactional).
  const routes: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1 },
    { path: "/shop", priority: 0.9 },
    { path: "/blog", priority: 0.7 },
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
    lastModified: BUILD_DATE,
    changeFrequency: "weekly",
    priority,
  }));

  // Live product + category pages from the database. Falls back to just the
  // static routes if the DB is unreachable, so the sitemap never 500s.
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [slugs, categories, blogSlugs] = await Promise.all([
      getProductSlugs(),
      getCategories(),
      getBlogSlugs(),
    ]);
    const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
      url: `${BASE}/product/${slug}`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${BASE}/shop?category=${c.slug}`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
    dynamicRoutes = [...categoryRoutes, ...blogRoutes, ...productRoutes];
  } catch {
    dynamicRoutes = [];
  }

  return [...staticRoutes, ...dynamicRoutes];
}
