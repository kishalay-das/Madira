import type { MetadataRoute } from "next";
import { products } from "@/lib/data";

// Keep in sync with metadataBase in layout.tsx.
const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kubo-demo-fawn.vercel.app"
).replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
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

  const staticRoutes = routes.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));

  const productRoutes = products.map((p) => ({
    url: `${BASE}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
