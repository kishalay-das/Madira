import { NextResponse } from "next/server";
import { getCategories } from "@/lib/queries";

/** GET /api/categories — all catalog categories. */
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ count: categories.length, categories });
  } catch (err) {
    console.error("GET /api/categories failed:", err);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
