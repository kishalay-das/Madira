import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/shop-client";
import { getCategories, getProducts } from "@/lib/queries";
import { getMode, segmentForMode } from "@/lib/mode";

export const dynamic = "force-dynamic";

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
  const mode = await getMode();
  const [products, categories] = await Promise.all([
    getProducts({ segment: segmentForMode(mode) }),
    getCategories(),
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
        key={`${mode}_${category ?? "all"}_${q ?? ""}`}
        initialCategory={category}
        initialQuery={q}
        products={products}
        categories={categories}
      />
    </div>
  );
}
