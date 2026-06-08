import { NextResponse } from "next/server";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

/** GET /api/products/:slug — single product + related items. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const related = await getRelatedProducts(product);
    return NextResponse.json({ product, related });
  } catch (err) {
    console.error(`GET /api/products/${slug} failed:`, err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
