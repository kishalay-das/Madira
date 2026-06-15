/**
 * Idempotently upsert the 30 standard-storefront products by slug.
 *
 * Safe to run against any database (local or Neon) — it never touches the
 * premium catalog and re-running just updates the same standard rows.
 *
 *   npx tsx scripts/seed-standard.ts
 */
import { PrismaClient } from "@prisma/client";
import { standardProducts } from "../src/lib/data";

const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const byCat = new Map(cats.map((c) => [c.slug, c.id]));

  let upserted = 0;
  const skipped: string[] = [];

  for (const p of standardProducts) {
    const categoryId = byCat.get(p.category);
    if (!categoryId) {
      skipped.push(`${p.slug} (missing category "${p.category}")`);
      continue;
    }

    const data = {
      name: p.name,
      distillery: p.distillery,
      description: p.description,
      images: p.images ?? [],
      video: p.video ?? null,
      segment: "STANDARD",
      categoryId,
      categoryLabel: p.categoryLabel,
      price: p.price,
      compareAt: p.compareAt ?? null,
      abv: p.abv,
      volume: p.volume,
      origin: p.origin,
      age: p.age ?? null,
      rating: p.rating,
      reviewsCount: p.reviews,
      stock: p.stock,
      badge: p.badge ?? null,
      tags: p.tags,
      notes: p.notes,
      pairings: p.pairings,
      noseNote: p.tasting.nose,
      palateNote: p.tasting.palate,
      finishNote: p.tasting.finish,
      paletteGlass: p.palette.glass,
      paletteLiquid: p.palette.liquid,
      paletteLabel: p.palette.label,
    };

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
    upserted++;
  }

  console.log(`Upserted ${upserted} standard products.`);
  if (skipped.length) console.warn(`Skipped: ${skipped.join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
