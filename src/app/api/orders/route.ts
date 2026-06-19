import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FREE_SHIPPING = 150;
const SHIPPING_FEE = 12;
const GIFT_FEE = 9;
const COD_FEE = 1; // cash-on-delivery handling surcharge
const TAX_RATE = 0.08;

const orderSchema = z.object({
  items: z
    .array(z.object({ slug: z.string(), qty: z.number().int().min(1).max(99) }))
    .min(1),
  deliverySlot: z.enum(["priority", "standard", "scheduled"]).default("standard"),
  giftWrap: z.boolean().default(false),
  paymentMethod: z.enum(["card", "wallet", "cod"]).default("card"),
  couponCode: z.string().trim().max(40).optional(),
  addressId: z.string().optional(),
  // Optional delivery pin from the browser Geolocation API (may be absent if
  // the customer denied permission or is on an insecure/unsupported context).
  deliveryLat: z.number().min(-90).max(90).optional(),
  deliveryLng: z.number().min(-180).max(180).optional(),
  deliveryAccuracy: z.number().min(0).max(100000).optional(),
});

const slotMap = {
  priority: "PRIORITY",
  standard: "STANDARD",
  scheduled: "SCHEDULED",
} as const;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const {
    items,
    deliverySlot,
    giftWrap,
    paymentMethod,
    couponCode,
    addressId,
    deliveryLat,
    deliveryLng,
    deliveryAccuracy,
  } = parsed.data;
  // Only persist a pin when we have a complete coordinate pair.
  const hasPin = deliveryLat != null && deliveryLng != null;

  // A delivery address is required, and must belong to this user.
  let validAddressId: string | null = null;
  if (addressId) {
    const addr = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
      select: { id: true },
    });
    validAddressId = addr?.id ?? null;
  }
  if (!validAddressId) {
    return NextResponse.json(
      { error: "A delivery address is required to place an order." },
      { status: 422 }
    );
  }

  // Recompute everything from the DB — never trust client prices.
  const products = await prisma.product.findMany({
    where: { slug: { in: items.map((i) => i.slug) } },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lineItems = items
    .map((i) => {
      const p = bySlug.get(i.slug);
      return p ? { product: p, qty: i.qty } : null;
    })
    .filter((x): x is { product: (typeof products)[number]; qty: number } => !!x);

  if (lineItems.length === 0) {
    return NextResponse.json({ error: "No valid items" }, { status: 422 });
  }

  // Stock availability — never let an order exceed what's on hand. The
  // authoritative re-check happens inside the transaction (guards against
  // concurrent orders); this pre-check returns a friendly message.
  const unavailable = lineItems.filter((li) => li.product.stock < li.qty);
  if (unavailable.length > 0) {
    return NextResponse.json(
      {
        error: "Some items are out of stock",
        items: unavailable.map((li) => ({
          slug: li.product.slug,
          name: li.product.name,
          available: li.product.stock,
        })),
      },
      { status: 409 }
    );
  }

  const subtotal = lineItems.reduce(
    (sum, li) => sum + Number(li.product.price) * li.qty,
    0
  );

  // Coupon
  let discount = 0;
  let couponId: string | null = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });
    if (
      coupon?.active &&
      (!coupon.expiresAt || coupon.expiresAt > new Date())
    ) {
      if (coupon.percentOff) discount = (subtotal * coupon.percentOff) / 100;
      else if (coupon.amountOff) discount = Math.min(Number(coupon.amountOff), subtotal);
      couponId = coupon.id;
    }
  }

  const discounted = subtotal - discount;
  const shipping = discounted >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  const giftFee = giftWrap ? GIFT_FEE : 0;
  const codFee = paymentMethod === "cod" ? COD_FEE : 0;
  const tax = +(discounted * TAX_RATE).toFixed(2);
  const total = +(discounted + shipping + giftFee + tax + codFee).toFixed(2);

  const number = `NOC-${100000 + Math.floor(Math.random() * 899999)}`;

  // Sentinel thrown inside the transaction when a concurrent order drained
  // stock between our pre-check and the decrement — rolls everything back.
  const OUT_OF_STOCK = "OUT_OF_STOCK";

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Decrement stock atomically. `updateMany` with a `stock >= qty` guard
      // only matches (and decrements) when enough is on hand; count 0 means a
      // concurrent order beat us to it.
      for (const li of lineItems) {
        const res = await tx.product.updateMany({
          where: { id: li.product.id, stock: { gte: li.qty } },
          data: { stock: { decrement: li.qty } },
        });
        if (res.count === 0) throw new Error(OUT_OF_STOCK);
      }

      const created = await tx.order.create({
      data: {
        number,
        userId: session.user.id,
        addressId: validAddressId,
        deliveryLat: hasPin ? deliveryLat : null,
        deliveryLng: hasPin ? deliveryLng : null,
        deliveryAccuracy: hasPin ? deliveryAccuracy ?? null : null,
        status: "PROCESSING",
        deliverySlot: slotMap[deliverySlot],
        giftWrap,
        paymentMethod,
        subtotal,
        discount,
        shipping,
        codFee,
        tax,
        total,
        couponId,
        items: {
          create: lineItems.map((li) => ({
            productId: li.product.id,
            quantity: li.qty,
            unitPrice: li.product.price,
          })),
        },
      },
    });

    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { redemptions: { increment: 1 } },
      });
    }

    // Award loyalty points (1 per dollar)
    await tx.user.update({
      where: { id: session.user.id },
      data: { loyaltyPoints: { increment: Math.floor(total) } },
    });

    return created;
    });
  } catch (e) {
    if (e instanceof Error && e.message === OUT_OF_STOCK) {
      return NextResponse.json(
        { error: "Some items just went out of stock. Please review your cart." },
        { status: 409 }
      );
    }
    throw e;
  }

  return NextResponse.json(
    {
      order: {
        number: order.number,
        subtotal,
        discount,
        shipping,
        giftFee,
        codFee,
        paymentMethod,
        tax,
        total,
      },
    },
    { status: 201 }
  );
}
