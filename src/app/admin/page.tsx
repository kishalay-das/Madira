import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "@/components/admin/admin-client";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
  robots: { index: false, follow: false },
};

const titleCase = (s: string) =>
  s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const fmtMonth = (d: Date) =>
  d.toLocaleDateString("en-US", { year: "numeric", month: "short" });

type AddrParts = {
  line1: string;
  line2: string | null;
  landmark?: string | null;
  city: string;
  postalCode: string;
  country: string;
};
const oneLineAddress = (a: AddrParts) =>
  [
    a.line1,
    a.line2,
    a.landmark ? `near ${a.landmark}` : null,
    `${a.city} ${a.postalCode}`,
    a.country,
  ]
    .filter(Boolean)
    .join(", ");

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  const [
    products,
    orders,
    customers,
    coupons,
    reviews,
    revenueAgg,
    orderCount,
    customerCount,
    cats,
    blogPosts,
    analyticsOrders,
  ] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "asc" } }),
    prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        address: true,
        coupon: { select: { code: true } },
        items: { include: { product: { select: { name: true, slug: true, segment: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        loyaltyPoints: true,
        referralCode: true,
        createdAt: true,
        addresses: {
          select: {
            label: true,
            line1: true,
            line2: true,
            city: true,
            postalCode: true,
            country: true,
          },
        },
        orders: {
          select: { number: true, total: true, status: true, createdAt: true },
        },
      },
    }),
    prisma.coupon.findMany({ orderBy: { redemptions: "desc" } }),
    prisma.review.findMany({
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
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
    prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } }),
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
        orders: orders.map((o) => ({
          id: o.id,
          number: o.number,
          segment: o.items.some((it) => it.product?.segment === "STANDARD")
            ? "STANDARD"
            : "PREMIUM",
          customer: o.user?.name ?? o.user?.email ?? "Guest",
          customerEmail: o.user?.email ?? "",
          total: Number(o.total),
          subtotal: Number(o.subtotal),
          discount: Number(o.discount),
          shipping: Number(o.shipping),
          tax: Number(o.tax),
          status: o.status,
          statusLabel: titleCase(o.status),
          deliverySlot: titleCase(o.deliverySlot),
          paymentMethod: o.paymentMethod,
          codFee: Number(o.codFee),
          giftWrap: o.giftWrap,
          date: fmtDate(o.createdAt),
          createdAt: o.createdAt.toISOString(),
          couponCode: o.coupon?.code ?? null,
          address: o.address ? oneLineAddress(o.address) : null,
          deliveryPhone: o.address?.phone ?? null,
          deliveryLat: o.deliveryLat ?? null,
          deliveryLng: o.deliveryLng ?? null,
          deliveryAccuracy: o.deliveryAccuracy ?? null,
          items: o.items.map((it) => ({
            name: it.product?.name ?? "Item",
            slug: it.product?.slug ?? "",
            quantity: it.quantity,
            unitPrice: Number(it.unitPrice),
          })),
        })),
        customers: customers
          .map((c) => {
            const sorted = [...c.orders].sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
            const orderCount = c.orders.length;
            const spend = c.orders.reduce((s, o) => s + Number(o.total), 0);
            const aov = orderCount ? spend / orderCount : 0;
            const last = sorted[0]?.createdAt ?? null;
            const daysSinceLast = last ? (now - last.getTime()) / DAY : null;

            // Derived insight tags for at-a-glance segmentation.
            const tags: string[] = [];
            if (orderCount === 0) tags.push("New");
            if (spend >= 1000) tags.push("VIP");
            else if (spend >= 400) tags.push("High spender");
            if (daysSinceLast != null && daysSinceLast > 90) tags.push("At risk");

            return {
              id: c.id,
              name: c.name ?? "Member",
              email: c.email,
              tier: titleCase(c.tier),
              loyaltyPoints: c.loyaltyPoints,
              referralCode: c.referralCode,
              memberSince: fmtMonth(c.createdAt),
              orders: orderCount,
              spend,
              aov,
              lastPurchase: last ? fmtDate(last) : null,
              tags,
              addresses: c.addresses.map((a) => ({
                label: a.label,
                line: oneLineAddress(a),
              })),
              recentOrders: sorted.slice(0, 8).map((o) => ({
                number: o.number,
                total: Number(o.total),
                statusLabel: titleCase(o.status),
                date: fmtDate(o.createdAt),
              })),
            };
          })
          .sort((a, b) => b.spend - a.spend),
        coupons: coupons.map((c) => ({
          id: c.id,
          code: c.code,
          description: c.description ?? "",
          percentOff: c.percentOff,
          amountOff: c.amountOff != null ? Number(c.amountOff) : null,
          active: c.active,
          expiresAt: c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : null,
          redemptions: c.redemptions,
        })),
        reviews: reviews.map((r) => ({
          id: r.id,
          product: r.product?.name ?? "Product",
          productSlug: r.product?.slug ?? "",
          author: r.user?.name ?? "Member",
          rating: r.rating,
          title: r.title,
          body: r.body,
          verified: r.verified,
          date: fmtDate(r.createdAt),
        })),
        categoryOptions: cats.map((c) => ({ slug: c.slug, name: c.name })),
        blog: blogPosts.map((b) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          excerpt: b.excerpt ?? "",
          content: b.content,
          coverImage: b.coverImage,
          author: b.author,
          tags: b.tags,
          published: b.published,
          date: fmtDate(b.publishedAt),
        })),
      }}
    />
  );
}
