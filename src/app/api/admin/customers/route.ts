import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { customerSelect, serializeCustomer } from "@/lib/admin-serialize";
import { parsePageParams } from "@/lib/pagination";

const TAGS = ["VIP", "High spender", "At risk", "New"] as const;

/**
 * GET /api/admin/customers — paginated, filtered customer list for the admin
 * console.
 *
 * Query: page, pageSize, q (name/email), tag (VIP|High spender|At risk|New).
 *
 * Tags (VIP / High spender / At risk / New) are NOT DB columns — they are
 * derived per-customer from order spend & recency in `serializeCustomer`.
 * A DB-level WHERE can't express them, so we fetch every customer, serialize
 * (computing tags), then filter by search + tag, sort, and slice the page here.
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = new URL(request.url).searchParams;
  const { page, pageSize, skip, take } = parsePageParams(sp, { defaultSize: 20 });

  const q = sp.get("q")?.trim().toLowerCase();
  const tagParam = sp.get("tag");
  const tag = TAGS.find((t) => t === tagParam) ?? null;

  const rows = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: customerSelect,
  });

  const now = Date.now();
  const all = rows.map((c) => serializeCustomer(c, now));

  // Search filter (name/email, case-insensitive).
  const searchFiltered = q
    ? all.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      )
    : all;

  // Tag pill counts over the search-filtered set so pills reflect the search.
  const tagCounts = TAGS.reduce<Record<string, number>>((acc, t) => {
    acc[t] = searchFiltered.filter((c) => c.tags.includes(t)).length;
    return acc;
  }, {});

  // Tag filter, then sort by lifetime spend descending (matches admin page).
  const filtered = (tag ? searchFiltered.filter((c) => c.tags.includes(tag)) : searchFiltered)
    .sort((a, b) => b.spend - a.spend);

  const pageSlice = filtered.slice(skip, skip + take);

  return NextResponse.json({
    items: pageSlice,
    total: filtered.length,
    page,
    pageSize,
    tagCounts,
    totalAll: searchFiltered.length,
  });
}
