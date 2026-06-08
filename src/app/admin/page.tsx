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

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  const [
    products,
    orders,
    customers,
    coupons,
    revenueAgg,
    orderCount,
    customerCount,
    cats,
  ] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "asc" } }),
    prisma.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { id: true, name: true, tier: true, orders: { select: { total: true } } },
    }),
    prisma.coupon.findMany({ orderBy: { redemptions: "desc" } }),
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

  return (
    <AdminClient
      data={{
        kpis: {
          revenue,
          orders: orderCount,
          customers: customerCount,
          aov: orderCount ? revenue / orderCount : 0,
        },
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
        })),
        orders: orders.map((o) => ({
          id: o.id,
          number: o.number,
          customer: o.user?.name ?? o.user?.email ?? "Guest",
          total: Number(o.total),
          status: o.status,
          statusLabel: titleCase(o.status),
        })),
        customers: customers
          .map((c) => ({
            name: c.name ?? "Member",
            tier: titleCase(c.tier),
            orders: c.orders.length,
            spend: c.orders.reduce((s, o) => s + Number(o.total), 0),
          }))
          .sort((a, b) => b.spend - a.spend)
          .slice(0, 8),
        coupons: coupons.map((c) => ({
          code: c.code,
          description: c.description ?? "",
          redemptions: c.redemptions,
          active: c.active,
        })),
        categoryOptions: cats.map((c) => ({ slug: c.slug, name: c.name })),
      }}
    />
  );
}
