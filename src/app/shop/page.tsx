import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/shop-client";
import { getCategories, getProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Shop the Collection",
  description:
    "Browse and filter the world's finest whiskey, wine, champagne and rare spirits — authenticated and delivered with concierge care.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="container-luxe pb-24 pt-12 md:pt-16">
      <header className="mb-12 text-center">
        <p className="eyebrow mb-4">The Collection</p>
        <h1 className="font-display text-4xl tracking-tight text-cream md:text-5xl">
          Browse the Cellar
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Every bottle hand-selected, authenticated and stored in perfect
          conditions until it reaches your door.
        </p>
        <div className="gold-rule mx-auto mt-8 w-24" />
      </header>

      <ShopClient
        key={`${category ?? "all"}_${q ?? ""}`}
        initialCategory={category}
        initialQuery={q}
        products={products}
        categories={categories}
      />
    </div>
  );
}
