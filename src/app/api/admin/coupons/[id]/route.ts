import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  description: z.string().max(200).nullable().optional(),
  percentOff: z.number().int().min(0).max(100).nullable().optional(),
  amountOff: z.number().min(0).max(100000).nullable().optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const { expiresAt, ...rest } = parsed.data;

  const data: Record<string, unknown> = { ...rest };
  if (expiresAt !== undefined) {
    data.expiresAt = expiresAt ? new Date(expiresAt) : null;
  }

  try {
    await prisma.coupon.update({ where: { id }, data });
  } catch {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  try {
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete — coupon is linked to existing orders." },
      { status: 409 }
    );
  }
}
