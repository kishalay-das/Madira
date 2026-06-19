import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { serializeCoupon } from "@/lib/admin-serialize";
import { parsePageParams } from "@/lib/pagination";

/**
 * GET /api/admin/coupons — paginated coupon list for the admin console.
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = new URL(request.url).searchParams;
  const { page, pageSize, skip, take } = parsePageParams(sp, { defaultSize: 20 });

  const [rows, total] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { redemptions: "desc" }, skip, take }),
    prisma.coupon.count(),
  ]);

  return NextResponse.json({
    items: rows.map(serializeCoupon),
    total,
    page,
    pageSize,
  });
}

const createSchema = z.object({
  code: z.string().trim().min(1).max(40),
  description: z.string().max(200).optional(),
  percentOff: z.number().int().min(0).max(100).nullable().optional(),
  amountOff: z.number().min(0).max(100000).nullable().optional(),
  active: z.boolean().optional().default(true),
  expiresAt: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const d = parsed.data;

  const code = d.code.toUpperCase();

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json(
      { error: "A coupon with that code already exists." },
      { status: 409 }
    );
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      description: d.description ?? null,
      percentOff: d.percentOff ?? null,
      amountOff: d.amountOff ?? null,
      active: d.active,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
    },
  });

  return NextResponse.json({ coupon: { id: coupon.id, code: coupon.code } }, { status: 201 });
}
