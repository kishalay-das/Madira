import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { categories, products } from "../src/lib/data";

const prisma = new PrismaClient();

async function main() {
  // Skip if the catalog is already seeded — keeps `docker compose up` safe to
  // re-run without wiping existing data. Use `npm run db:reset` to force a wipe.
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`Already seeded (${existing} products) — skipping.`);
    return;
  }

  // Idempotent reset
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // --- Users ---
  const passwordHash = await bcrypt.hash("nocturne8", 10);
  await prisma.user.create({
    data: {
      email: "admin@nocturne.club",
      name: "Nocturne Admin",
      passwordHash,
      role: "ADMIN",
      tier: "PLATINUM",
      loyaltyPoints: 24800,
    },
  });
  await prisma.user.create({
    data: {
      email: "demo@nocturne.club",
      name: "Alexandra Vance",
      passwordHash,
      role: "CUSTOMER",
      tier: "GOLD",
      loyaltyPoints: 12480,
    },
  });

  // --- Coupons ---
  await prisma.coupon.createMany({
    data: [
      { code: "VIP10", description: "10% off for members", percentOff: 10 },
      { code: "WELCOME25", description: "$25 off your first order", amountOff: 25 },
      { code: "FESTIVE", description: "Free gift wrap", percentOff: 0 },
    ],
  });

  const categoryId: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.create({
      data: {
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        hue: c.hue,
        count: c.count,
      },
    });
    categoryId[c.slug] = row.id;
  }

  for (const p of products) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        distillery: p.distillery,
        description: p.description,
        images: p.images ?? [],
        categoryId: categoryId[p.category],
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
      },
    });
  }

  console.log(
    `Seeded ${categories.length} categories, ${products.length} products, 2 users, 3 coupons.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
