import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { CategorySlug } from "@/lib/types";
import { AccountClient } from "@/components/account/account-client";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your profile, orders, wishlist, membership and rewards.",
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");
  const userId = session.user.id;

  const [user, orders, addresses, wishlist] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        tier: true,
        loyaltyPoints: true,
        referralCode: true,
        createdAt: true,
        _count: { select: { orders: true, wishlist: true } },
      },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
    prisma.address.findMany({ where: { userId }, orderBy: { isPrimary: "desc" } }),
    prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { category: true } } },
    }),
  ]);

  return (
    <div className="container-luxe pb-24 pt-12">
      <AccountClient
        user={{
          name: user?.name ?? session.user.name ?? "Member",
          email: user?.email ?? session.user.email ?? "",
          tier: user?.tier ?? "NONE",
          loyaltyPoints: user?.loyaltyPoints ?? 0,
          referralCode: user?.referralCode ?? "",
          memberSince: user?.createdAt ? String(user.createdAt.getFullYear()) : "—",
          orderCount: user?._count.orders ?? 0,
          wishlistCount: user?._count.wishlist ?? 0,
        }}
        orders={orders.map((o) => ({
          id: o.number,
          date: fmtDate(o.createdAt),
          status: titleCase(o.status),
          total: Number(o.total),
          items: o._count.items,
        }))}
        addresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          line: [a.line1, a.line2, `${a.city} ${a.postalCode}`, a.country]
            .filter(Boolean)
            .join(", "),
          primary: a.isPrimary,
        }))}
        wishlist={wishlist.map((w) => ({
          id: w.product.id,
          slug: w.product.slug,
          name: w.product.name,
          price: Number(w.product.price),
          distillery: w.product.distillery,
          category: (w.product.category?.slug ?? "whiskey") as CategorySlug,
          images: w.product.images,
          palette: {
            glass: w.product.paletteGlass,
            liquid: w.product.paletteLiquid,
            label: w.product.paletteLabel,
          },
        }))}
      />
    </div>
  );
}
