import { NextResponse } from "next/server";
import { getProducts, type ProductSort } from "@/lib/queries";
import { getMode, segmentForMode } from "@/lib/mode";

/**
 * GET /api/products
 * Query params: category, sort (popular|rating|price-asc|price-desc|newest), q, limit
 * Results are scoped to the active storefront (premium/standard) via the
 * `nocturne-mode` cookie — so search matches what the shopper is browsing.
 * Backed by PostgreSQL via Prisma.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const sort = (searchParams.get("sort") as ProductSort) ?? undefined;
  const limitParam = Number(searchParams.get("limit") ?? 0);
  const limit = limitParam > 0 ? limitParam : undefined;

  try {
    const segment = segmentForMode(await getMode());
    const products = await getProducts({ category, q, sort, limit, segment });
    return NextResponse.json({ count: products.length, products });
  } catch (err) {
    console.error("GET /api/products failed:", err);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}
