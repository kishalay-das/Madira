import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "@/components/admin/admin-client";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  // Each admin module (orders, customers, coupons, reviews, blog) fetches its
  // own paginated page from /api/admin/* on mount, so we only fetch here what
  // the Dashboard renders: KPIs, the analytics slice, the product catalog
  // (low-stock list + product tab seed counts) and category options.
  const [products, revenueAgg, orderCount, customerCount, cats, analyticsOrders] =
    await Promise.all([
      prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "asc" } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.category.findMany({
        select: {
          slug: true,
          name: true,
          hue: true,
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      }),
      // Lightweight slice for dashboard analytics (trends, segment split,
      // best sellers). Capped so the query stays cheap on large catalogs.
      prisma.order.findMany({
      select: {
        total: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            product: { select: { name: true, slug: true, segment: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  const revenue = Number(revenueAgg._sum.total ?? 0);
  const totalCatProducts = cats.reduce((s, c) => s + c._count.products, 0) || 1;
  const topCategories = cats
    .map((c) => ({
      c: c.name,
      hue: c.hue,
      pct: Math.round((c._count.products / totalCatProducts) * 100),
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  /* ---- Dashboard analytics (derived from the analytics order slice) ---- */
  const DAY = 86_400_000;
  const now = Date.now();
  const segmentOf = (its: { product: { segment: string } | null }[]) =>
    its.some((it) => it.product?.segment === "STANDARD") ? "STANDARD" : "PREMIUM";

  // 14-day revenue + order-count sparkline series (index 0 = 13 days ago).
  const revenueByDay = Array.from({ length: 14 }, () => 0);
  const ordersByDay = Array.from({ length: 14 }, () => 0);
  // Revenue attributed per storefront segment.
  const revenueBySegment = { PREMIUM: 0, STANDARD: 0 };
  // 30-day rolling windows for trend deltas.
  let revThis = 0;
  let revPrev = 0;
  let ordThis = 0;
  let ordPrev = 0;
  // Best sellers by units.
  const productAgg = new Map<
    string,
    { name: string; slug: string; units: number; revenue: number; segment: string }
  >();

  for (const o of analyticsOrders) {
    const total = Number(o.total);
    const ts = o.createdAt.getTime();
    const ageDays = Math.floor((now - ts) / DAY);

    revenueBySegment[segmentOf(o.items)] += total;

    if (ageDays < 14) {
      const idx = 13 - ageDays;
      revenueByDay[idx] += total;
      ordersByDay[idx] += 1;
    }
    if (ageDays < 30) {
      revThis += total;
      ordThis += 1;
    } else if (ageDays < 60) {
      revPrev += total;
      ordPrev += 1;
    }

    for (const it of o.items) {
      if (!it.product) continue;
      const key = it.product.slug;
      const prev = productAgg.get(key) ?? {
        name: it.product.name,
        slug: it.product.slug,
        units: 0,
        revenue: 0,
        segment: it.product.segment === "STANDARD" ? "STANDARD" : "PREMIUM",
      };
      prev.units += it.quantity;
      prev.revenue += it.quantity * Number(it.unitPrice);
      productAgg.set(key, prev);
    }
  }

  const pctDelta = (cur: number, prev: number) =>
    prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? 100 : 0;
  const revenueTrend = pctDelta(revThis, revPrev);
  const ordersTrend = pctDelta(ordThis, ordPrev);
  const topProducts = [...productAgg.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, 6);

  return (
    <AdminClient
      data={{
        kpis: {
          revenue,
          orders: orderCount,
          customers: customerCount,
          aov: orderCount ? revenue / orderCount : 0,
          revenueTrend,
          ordersTrend,
        },
        revenueByDay,
        ordersByDay,
        revenueBySegment,
        topProducts,
        topCategories,
        products: products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          distillery: p.distillery,
          categoryLabel: p.categoryLabel,
          price: Number(p.price),
          stock: p.stock,
          images: p.images,
          palette: {
            glass: p.paletteGlass,
            liquid: p.paletteLiquid,
            label: p.paletteLabel,
          },
          category: p.category?.slug ?? "whiskey",
          segment: p.segment === "STANDARD" ? "STANDARD" : "PREMIUM",
        })),
        // These lists are loaded per-page by each module from /api/admin/*;
        // the server only needs to seed the dashboard + product tab.
        orders: [],
        customers: [],
        coupons: [],
        reviews: [],
        categoryOptions: cats.map((c) => ({ slug: c.slug, name: c.name })),
        blog: [],
      }}
    />
  );
}
