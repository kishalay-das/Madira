import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { isAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { orderInclude, serializeOrder } from "@/lib/admin-serialize";
import { parsePageParams } from "@/lib/pagination";

/**
 * GET /api/admin/orders — paginated, filtered order list for the admin console.
 *
 * Query: page, pageSize, segment (PREMIUM|STANDARD), status, payment,
 * range (all|7d|30d|90d), q (number/customer/email). All filtering happens
 * server-side so pagination reflects the full filtered set.
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = new URL(request.url).searchParams;
  const { page, pageSize, skip, take } = parsePageParams(sp, { defaultSize: 20 });

  const segment = sp.get("segment") === "STANDARD" ? "STANDARD" : "PREMIUM";
  const status = sp.get("status");
  const payment = sp.get("payment");
  const range = sp.get("range");
  const q = sp.get("q")?.trim();

  const where: Prisma.OrderWhereInput = {
    // Segment is derived from line items: STANDARD if any item is STANDARD.
    items:
      segment === "STANDARD"
        ? { some: { product: { segment: "STANDARD" } } }
        : { none: { product: { segment: "STANDARD" } } },
  };

  if (status && status !== "ALL") where.status = status as Prisma.OrderWhereInput["status"];
  if (payment && payment !== "ALL") where.paymentMethod = payment;

  if (range && range !== "all") {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    where.createdAt = { gte: cutoff };
  }

  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [rows, total, premiumCount, standardCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.order.count({ where }),
    // Segment tab counts are independent of the active segment/page.
    prisma.order.count({ where: { items: { none: { product: { segment: "STANDARD" } } } } }),
    prisma.order.count({ where: { items: { some: { product: { segment: "STANDARD" } } } } }),
  ]);

  return NextResponse.json({
    items: rows.map(serializeOrder),
    total,
    page,
    pageSize,
    counts: { PREMIUM: premiumCount, STANDARD: standardCount },
  });
}
