import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "../route";

/** PATCH /api/addresses/:id — edit one of the caller's own addresses. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const { id } = await params;
  const userId = session.user.id;

  // Ownership check before mutating anything.
  const existing = await prisma.address.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = addressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Promoting to primary demotes the others first.
  if (parsed.data.isPrimary) {
    await prisma.address.updateMany({ where: { userId }, data: { isPrimary: false } });
  }
  const { landmark, phone, ...rest } = parsed.data;
  const address = await prisma.address.update({
    where: { id },
    data: {
      ...rest,
      landmark: landmark?.trim() || null,
      phone: phone.trim(),
    },
  });
  return NextResponse.json({ address });
}

/** DELETE /api/addresses/:id — remove the caller's own address. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const { id } = await params;
  // Scope delete to the owner so users can't remove others' addresses.
  const result = await prisma.address.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
