import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const csv = z.array(z.string().trim().min(1)).max(20);

const patchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  categorySlug: z.string().min(1).optional(),
  price: z.number().positive().max(1_000_000).optional(),
  compareAt: z.number().positive().max(1_000_000).nullable().optional(),
  stock: z.number().int().min(0).max(1_000_000).optional(),
  distillery: z.string().max(120).optional(),
  abv: z.number().min(0).max(80).optional(),
  volume: z.string().max(40).optional(),
  origin: z.string().max(120).optional(),
  age: z.string().max(40).nullable().optional(),
  badge: z
    .enum(["Best Seller", "Limited", "New", "Rare", "Award Winner"])
    .nullable()
    .optional(),
  description: z.string().max(4000).optional(),
  noseNote: z.string().max(500).nullable().optional(),
  palateNote: z.string().max(500).nullable().optional(),
  finishNote: z.string().max(500).nullable().optional(),
  tags: csv.optional(),
  notes: csv.optional(),
  pairings: csv.optional(),
  paletteGlass: z.string().max(32).optional(),
  paletteLiquid: z.string().max(32).optional(),
  paletteLabel: z.string().max(32).optional(),
  images: z.array(z.string().max(2048)).max(4).optional(),
  video: z.string().max(2048).nullable().optional(),
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
  const { categorySlug, ...rest } = parsed.data;

  const data: Prisma.ProductUpdateInput = { ...rest };

  // If the category changed, relink it and refresh the display label.
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (!category) {
      return NextResponse.json({ error: "Unknown category" }, { status: 422 });
    }
    data.category = { connect: { id: category.id } };
    data.categoryLabel = category.name;
  }

  try {
    await prisma.product.update({ where: { id }, data });
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete — product may have existing orders." },
      { status: 409 }
    );
  }
}
