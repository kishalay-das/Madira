import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parsePageParams } from "@/lib/pagination";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userId = session.user.id;
  const sp = new URL(request.url).searchParams;
  const { page, pageSize, skip, take } = parsePageParams(sp, { defaultSize: 10 });

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      // Stable tiebreaker so offset pages never skip/duplicate on equal timestamps.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  const items = orders.map((o) => ({
    id: o.number,
    date: fmtDate(o.createdAt),
    status: titleCase(o.status),
    total: Number(o.total),
    items: o._count.items,
  }));

  return NextResponse.json({ items, total, page, pageSize });
}
