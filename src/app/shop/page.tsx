import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/shop-client";
import {
  getCategories,
  getProducts,
  countProducts,
  getShopFacets,
  type ProductSort,
} from "@/lib/queries";
import { getMode, segmentForMode } from "@/lib/mode";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const PRICE_MAX = 2000;
const SORTS: ProductSort[] = ["popular", "rating", "price-asc", "price-desc", "newest"];

export const metadata: Metadata = {
  title: "Shop the Collection",
  description:
    "Browse and filter the world's finest whiskey, wine, champagne and rare spirits — authenticated and delivered with concierge care.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    maxPrice?: string;
    page?: string;
  }>;
}) {
  const { category, q, sort: sortRaw, maxPrice: maxPriceRaw, page: pageRaw } =
    await searchParams;
  const mode = await getMode();
  const segment = segmentForMode(mode);

  const sort = (SORTS.includes(sortRaw as ProductSort) ? sortRaw : "popular") as ProductSort;
  const maxPriceNum = Number(maxPriceRaw);
  const maxPrice =
    Number.isFinite(maxPriceNum) && maxPriceNum > 0 && maxPriceNum < PRICE_MAX
      ? maxPriceNum
      : undefined;
  const pageNum = Number(pageRaw);
  const page = Number.isFinite(pageNum) && pageNum >= 1 ? Math.floor(pageNum) : 1;

  const filter = { segment, category, q, sort, maxPrice };
  const [products, total, categories, facets] = await Promise.all([
    getProducts({ ...filter, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    countProducts(filter),
    getCategories(),
    getShopFacets(segment),
  ]);

  const isPremium = mode === "premium";

  return (
    <div className="container-luxe pb-24 pt-12 md:pt-16">
      <header className="mb-12 text-center">
        <p className="eyebrow mb-4">{isPremium ? "The Collection" : "Shop"}</p>
        <h1 className="font-display text-4xl tracking-tight text-cream md:text-5xl">
          {isPremium ? "Browse the Cellar" : "Everyday Essentials"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          {isPremium
            ? "Every bottle hand-selected, authenticated and stored in perfect conditions until it reaches your door."
            : "Popular bottles at everyday prices — beer, wine, spirits and more, delivered fast."}
        </p>
        <div className="gold-rule mx-auto mt-8 w-24" />
      </header>

      <ShopClient
        key={mode}
        category={category ?? "all"}
        query={q ?? ""}
        sort={sort}
        maxPrice={maxPrice ?? PRICE_MAX}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        products={products}
        categories={categories}
        facets={facets}
      />
    </div>
  );
}
