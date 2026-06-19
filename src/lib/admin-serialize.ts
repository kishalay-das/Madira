/**
 * Shared serializers + Prisma query shapes for the admin console.
 *
 * Both the initial admin page render (`src/app/admin/page.tsx`) and the
 * paginated admin GET endpoints (`/api/admin/*`) use these so a row looks
 * identical whether it arrives as a server prop or via a page fetch.
 */
import type { Prisma } from "@prisma/client";
import type {
  AdminOrder,
  AdminProduct,
  AdminCustomer,
  AdminCoupon,
  AdminReview,
  AdminBlogPost,
} from "@/components/admin/types";

export const DAY = 86_400_000;

export const titleCase = (s: string) =>
  s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const fmtMonth = (d: Date) =>
  d.toLocaleDateString("en-US", { year: "numeric", month: "short" });

type AddrParts = {
  line1: string;
  line2: string | null;
  landmark?: string | null;
  city: string;
  postalCode: string;
  country: string;
};
export const oneLineAddress = (a: AddrParts) =>
  [
    a.line1,
    a.line2,
    a.landmark ? `near ${a.landmark}` : null,
    `${a.city} ${a.postalCode}`,
    a.country,
  ]
    .filter(Boolean)
    .join(", ");

const segmentOf = (segment: string | null | undefined) =>
  segment === "STANDARD" ? "STANDARD" : "PREMIUM";

/* ------------------------------------------------------------------ *
 * Orders
 * ------------------------------------------------------------------ */
export const orderInclude = {
  user: { select: { name: true, email: true } },
  address: true,
  coupon: { select: { code: true } },
  items: { include: { product: { select: { name: true, slug: true, segment: true } } } },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function serializeOrder(o: OrderRow): AdminOrder {
  return {
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
  };
}

/* ------------------------------------------------------------------ *
 * Products
 * ------------------------------------------------------------------ */
export const productInclude = { category: true } satisfies Prisma.ProductInclude;
type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export function serializeProduct(p: ProductRow): AdminProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    distillery: p.distillery,
    categoryLabel: p.categoryLabel,
    price: Number(p.price),
    stock: p.stock,
    images: p.images,
    palette: { glass: p.paletteGlass, liquid: p.paletteLiquid, label: p.paletteLabel },
    category: p.category?.slug ?? "whiskey",
    segment: segmentOf(p.segment),
  };
}

/* ------------------------------------------------------------------ *
 * Customers
 * ------------------------------------------------------------------ */
export const customerSelect = {
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
      landmark: true,
      city: true,
      postalCode: true,
      country: true,
    },
  },
  orders: { select: { number: true, total: true, status: true, createdAt: true } },
} satisfies Prisma.UserSelect;

type CustomerRow = Prisma.UserGetPayload<{ select: typeof customerSelect }>;

export function serializeCustomer(c: CustomerRow, now: number): AdminCustomer {
  const sorted = [...c.orders].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  const orderCount = c.orders.length;
  const spend = c.orders.reduce((s, o) => s + Number(o.total), 0);
  const aov = orderCount ? spend / orderCount : 0;
  const last = sorted[0]?.createdAt ?? null;
  const daysSinceLast = last ? (now - last.getTime()) / DAY : null;

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
    addresses: c.addresses.map((a) => ({ label: a.label, line: oneLineAddress(a) })),
    recentOrders: sorted.slice(0, 8).map((o) => ({
      number: o.number,
      total: Number(o.total),
      statusLabel: titleCase(o.status),
      date: fmtDate(o.createdAt),
    })),
  };
}

/* ------------------------------------------------------------------ *
 * Coupons
 * ------------------------------------------------------------------ */
export function serializeCoupon(c: Prisma.CouponGetPayload<object>): AdminCoupon {
  return {
    id: c.id,
    code: c.code,
    description: c.description ?? "",
    percentOff: c.percentOff,
    amountOff: c.amountOff != null ? Number(c.amountOff) : null,
    active: c.active,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : null,
    redemptions: c.redemptions,
  };
}

/* ------------------------------------------------------------------ *
 * Reviews
 * ------------------------------------------------------------------ */
export const reviewInclude = {
  product: { select: { name: true, slug: true } },
  user: { select: { name: true } },
} satisfies Prisma.ReviewInclude;

type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

export function serializeReview(r: ReviewRow): AdminReview {
  return {
    id: r.id,
    product: r.product?.name ?? "Product",
    productSlug: r.product?.slug ?? "",
    author: r.user?.name ?? "Member",
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: r.verified,
    date: fmtDate(r.createdAt),
  };
}

/* ------------------------------------------------------------------ *
 * Blog
 * ------------------------------------------------------------------ */
export function serializeBlogPost(b: Prisma.BlogPostGetPayload<object>): AdminBlogPost {
  return {
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
  };
}
