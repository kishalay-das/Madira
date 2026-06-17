import type { MetadataRoute } from "next";

// Keep in sync with metadataBase in layout.tsx.
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kubo-demo-fawn.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/api/", "/cart"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
