import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { isAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { productInclude, serializeProduct } from "@/lib/admin-serialize";
import { parsePageParams } from "@/lib/pagination";

/**
 * GET /api/admin/products — paginated, segment-filtered product list for the
 * admin console.
 *
 * Query: page, pageSize, segment (PREMIUM|STANDARD), q (name/distillery/
 * categoryLabel). All filtering happens server-side so pagination reflects the
 * full filtered set.
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = new URL(request.url).searchParams;
  const { page, pageSize, skip, take } = parsePageParams(sp, { defaultSize: 20 });

  const segment = sp.get("segment") === "STANDARD" ? "STANDARD" : "PREMIUM";
  const q = sp.get("q")?.trim();

  const where: Prisma.ProductWhereInput = {
    segment,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { distillery: { contains: q, mode: "insensitive" } },
            { categoryLabel: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total, premiumCount, standardCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: "asc" },
      skip,
      take,
    }),
    prisma.product.count({ where }),
    // Segment tab counts are independent of the search query / active segment.
    prisma.product.count({ where: { segment: "PREMIUM" } }),
    prisma.product.count({ where: { segment: "STANDARD" } }),
  ]);

  return NextResponse.json({
    items: rows.map(serializeProduct),
    total,
    page,
    pageSize,
    counts: { PREMIUM: premiumCount, STANDARD: standardCount },
  });
}

const csv = z
  .array(z.string().trim().min(1))
  .max(20)
  .optional()
  .default([]);

const createSchema = z.object({
  name: z.string().min(2).max(120),
  segment: z.enum(["PREMIUM", "STANDARD"]).default("PREMIUM"),
  categorySlug: z.string().min(1),
  price: z.number().positive().max(1_000_000),
  compareAt: z.number().positive().max(1_000_000).optional(),
  stock: z.number().int().min(0).max(1_000_000).default(0),
  distillery: z.string().max(120).optional(),
  abv: z.number().min(0).max(80).optional(),
  volume: z.string().max(40).optional(),
  origin: z.string().max(120).optional(),
  age: z.string().max(40).optional(),
  badge: z
    .enum(["Best Seller", "Limited", "New", "Rare", "Award Winner"])
    .optional(),
  description: z.string().max(4000).optional(),
  noseNote: z.string().max(500).optional(),
  palateNote: z.string().max(500).optional(),
  finishNote: z.string().max(500).optional(),
  tags: csv,
  notes: csv,
  pairings: csv,
  paletteGlass: z.string().max(32).optional(),
  paletteLiquid: z.string().max(32).optional(),
  paletteLabel: z.string().max(32).optional(),
  // up to 4 hosted photo URLs + an optional video URL
  images: z.array(z.string().max(2048)).max(4).optional().default([]),
  video: z.string().max(2048).nullable().optional(),
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

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

  const category = await prisma.category.findUnique({
    where: { slug: d.categorySlug },
  });
  if (!category) {
    return NextResponse.json({ error: "Unknown category" }, { status: 422 });
  }

  let slug = slugify(d.name);
  if (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slug}-${Math.floor(Math.random() * 9999)}`;
  }

  const product = await prisma.product.create({
    data: {
      slug,
      name: d.name,
      segment: d.segment,
      distillery: d.distillery || d.name,
      description: d.description || `${d.name} — a fine addition to the cellar.`,
      categoryId: category.id,
      categoryLabel: category.name,
      price: d.price,
      compareAt: d.compareAt ?? null,
      abv: d.abv ?? 40,
      volume: d.volume || "700ml",
      origin: d.origin || "—",
      age: d.age || null,
      stock: d.stock,
      badge: d.badge ?? null,
      images: d.images,
      video: d.video || null,
      tags: d.tags,
      notes: d.notes,
      pairings: d.pairings,
      noseNote: d.noseNote || null,
      palateNote: d.palateNote || null,
      finishNote: d.finishNote || null,
      paletteGlass: d.paletteGlass || category.hue,
      paletteLiquid: d.paletteLiquid || category.hue,
      paletteLabel: d.paletteLabel || "#e9d8a6",
    },
  });

  return NextResponse.json({ product: { id: product.id, slug } }, { status: 201 });
}
