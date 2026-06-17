import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { getMode, segmentForMode } from "@/lib/mode";
import { ProductDetail } from "@/components/product/product-detail";

// Renders per request: reads the session (cookies) for wishlist + review state.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not Found" };
  const image = product.images?.[0];
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      url: `/product/${product.slug}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Each product belongs to one storefront. If the shopper is in the other
  // mode (e.g. toggled to Premium while viewing a Standard bottle), send them
  // to that storefront's catalog instead of a mismatched product page.
  const mode = await getMode();
  if ((product.segment ?? "PREMIUM") !== segmentForMode(mode)) {
    redirect("/shop");
  }

  const session = await auth();
  const [related, reviewRows, wished] = await Promise.all([
    getRelatedProducts(product),
    prisma.review.findMany({
      where: { product: { slug } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    session?.user
      ? prisma.wishlistItem.findFirst({
          where: { userId: session.user.id, product: { slug } },
          select: { id: true },
        })
      : null,
  ]);

  const SITE = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://kubo-demo-fawn.vercel.app"
  ).replace(/\/+$/, "");
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: product.distillery || "Madeera" },
    ...(product.images?.length
      ? { image: product.images.map((src) => new URL(src, SITE).toString()) }
      : {}),
    ...(product.reviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE}/product/${product.slug}`,
      priceCurrency: "USD",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Madeera" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <ProductDetail
      product={product}
      related={related}
      reviews={reviewRows.map((r) => ({
        id: r.id,
        name: r.user?.name ?? "Member",
        rating: r.rating,
        title: r.title,
        body: r.body,
        verified: r.verified,
      }))}
      wishlisted={!!wished}
      isAuthed={!!session?.user}
    />
    </>
  );
}
