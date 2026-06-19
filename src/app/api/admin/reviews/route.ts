import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { reviewInclude, serializeReview } from "@/lib/admin-serialize";
import { parsePageParams } from "@/lib/pagination";

/**
 * GET /api/admin/reviews — paginated review list for the admin console.
 *
 * Query: page, pageSize. Newest first.
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = new URL(request.url).searchParams;
  const { page, pageSize, skip, take } = parsePageParams(sp, { defaultSize: 20 });

  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      include: reviewInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.review.count(),
  ]);

  return NextResponse.json({
    items: rows.map(serializeReview),
    total,
    page,
    pageSize,
  });
}
