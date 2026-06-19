import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parsePageParams } from "@/lib/pagination";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(120),
  body: z.string().min(4).max(1000),
});

/**
 * GET /api/products/:slug/reviews — paginated reviews for a product.
 *
 * Query: page, pageSize (default 8). Newest first. Returns the same shape the
 * product page maps to the `ProductReview` type.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sp = new URL(request.url).searchParams;
  const { page, pageSize, skip, take } = parsePageParams(sp, { defaultSize: 8 });

  const where = { product: { slug } };
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      name: r.user?.name ?? "Member",
      rating: r.rating,
      title: r.title,
      body: r.body,
      verified: r.verified,
    })),
    total,
    page,
    pageSize,
  });
}

/** POST /api/products/:slug/reviews — add a review and refresh the aggregate. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const { slug } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prisma.review.create({
    data: {
      productId: product.id,
      userId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      verified: true,
    },
  });

  // Recompute the product's aggregate rating from all its reviews.
  const agg = await prisma.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: product.id },
    data: {
      rating: Number((agg._avg.rating ?? 0).toFixed(1)),
      reviewsCount: agg._count,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
