import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/coupons?code=VIP10 — validate a coupon code. */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.toUpperCase();
  if (!code) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  const valid =
    !!coupon?.active && (!coupon.expiresAt || coupon.expiresAt > new Date());

  return NextResponse.json({
    valid,
    code,
    percentOff: valid ? coupon?.percentOff ?? null : null,
    amountOff: valid && coupon?.amountOff != null ? Number(coupon.amountOff) : null,
    description: valid ? coupon?.description ?? null : null,
  });
}
