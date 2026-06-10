import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  // Check existence before opening the transaction so we can return 404 cleanly.
  const review = await prisma.review.findUnique({
    where: { id },
    select: { productId: true },
  });
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const { productId } = review;

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id } });

    const agg = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        reviewsCount: agg._count,
        rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
