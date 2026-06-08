import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FREE_SHIPPING = 150;
const SHIPPING_FEE = 12;
const GIFT_FEE = 9;
const TAX_RATE = 0.08;

const orderSchema = z.object({
  items: z
    .array(z.object({ slug: z.string(), qty: z.number().int().min(1).max(99) }))
    .min(1),
  deliverySlot: z.enum(["priority", "standard", "scheduled"]).default("standard"),
  giftWrap: z.boolean().default(false),
  couponCode: z.string().trim().max(40).optional(),
  addressId: z.string().optional(),
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
  const { items, deliverySlot, giftWrap, couponCode, addressId } = parsed.data;

  // Validate the address belongs to this user (if supplied).
  let validAddressId: string | null = null;
  if (addressId) {
    const addr = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
      select: { id: true },
    });
    validAddressId = addr?.id ?? null;
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
  const tax = +(discounted * TAX_RATE).toFixed(2);
  const total = +(discounted + shipping + giftFee + tax).toFixed(2);

  const number = `NOC-${100000 + Math.floor(Math.random() * 899999)}`;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        number,
        userId: session.user.id,
        addressId: validAddressId,
        status: "PROCESSING",
        deliverySlot: slotMap[deliverySlot],
        giftWrap,
        subtotal,
        discount,
        shipping,
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

  return NextResponse.json(
    {
      order: {
        number: order.number,
        subtotal,
        discount,
        shipping,
        giftFee,
        tax,
        total,
      },
    },
    { status: 201 }
  );
}
