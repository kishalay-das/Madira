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
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description },
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

  return (
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
  );
}
