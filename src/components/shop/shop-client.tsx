"use client";

import { useMemo, useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import type { Category, CategorySlug, Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { QuickView } from "@/components/product/quick-view";
import { formatPrice } from "@/lib/utils";

type Sort = "popular" | "rating" | "price-asc" | "price-desc" | "newest";

const sortOptions: { value: Sort; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
];

const PRICE_MAX = 2000;

export function ShopClient({
  initialCategory,
  initialQuery,
  products,
  categories,
}: {
  initialCategory?: string;
  initialQuery?: string;
  products: Product[];
  categories: Category[];
}) {
  const [active, setActive] = useState<CategorySlug | "all">(
    (initialCategory as CategorySlug) || "all"
  );
  const [query, setQuery] = useState(initialQuery ?? "");
  const [sort, setSort] = useState<Sort>("popular");
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [quick, setQuick] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice);
    if (active !== "all") list = list.filter((p) => p.category === active);
    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.distillery.toLowerCase().includes(term) ||
          p.categoryLabel.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term))
      );
    }
    switch (sort) {
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list = [...list].sort((a) => (a.badge === "New" ? -1 : 1));
        break;
      default:
        list = [...list].sort((a, b) => b.reviews - a.reviews);
    }
    return list;
  }, [active, sort, maxPrice, products, query]);

  const Filters = (
    <div className="space-y-8">
      <div>
        <h3 className="text-[0.7rem] uppercase tracking-[0.22em] text-gold">Search</h3>
        <div className="relative mt-4">
          <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bottles…"
            className="h-10 w-full rounded-full border border-hairline bg-night/60 pl-9 pr-8 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-gold"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-[0.7rem] uppercase tracking-[0.22em] text-gold">Category</h3>
        <ul className="mt-4 space-y-1">
          <FilterRow label="All Spirits" count={products.length} activeState={active === "all"} onClick={() => setActive("all")} />
          {categories.map((c) => (
            <FilterRow
              key={c.slug}
              label={c.name}
              count={products.filter((p) => p.category === c.slug).length}
              activeState={active === c.slug}
              onClick={() => setActive(c.slug)}
            />
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-[0.7rem] uppercase tracking-[0.22em] text-gold">Max Price</h3>
        <input
          type="range"
          min={50}
          max={PRICE_MAX}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-4 w-full accent-[var(--color-gold)]"
        />
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>$50</span>
          <span className="text-cream">{formatPrice(maxPrice)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 glass-dark rounded-[var(--radius-luxe)] p-6">{Filters}</div>
        </aside>

        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-5">
            <p className="text-sm text-muted">
              <span className="text-cream">{filtered.length}</span> bottles
              {active !== "all" && (
                <> in <span className="text-gold">{categories.find((c) => c.slug === active)?.name}</span></>
              )}
              {query.trim() && (
                <> for “<span className="text-gold">{query.trim()}</span>”</>
              )}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex h-10 items-center gap-2 rounded-full border border-hairline px-4 text-xs text-parchment lg:hidden"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
              <label className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="appearance-none rounded-full border border-hairline bg-night px-5 py-2.5 pr-10 text-xs text-cream focus:border-gold focus:outline-none"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value} className="bg-night">
                      {o.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">▾</span>
              </label>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <p className="py-24 text-center text-muted">No bottles match your filters.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-6 lg:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={setQuick} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="glass-dark absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-[var(--radius-luxe)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl text-cream">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X size={20} className="text-cream" />
              </button>
            </div>
            {Filters}
          </div>
        </div>
      )}

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}

function FilterRow({
  label,
  count,
  activeState,
  onClick,
}: {
  label: string;
  count: number;
  activeState: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
          activeState ? "bg-gold/10 text-gold" : "text-parchment hover:text-cream"
        }`}
      >
        {label}
        <span className="text-xs text-muted">{count}</span>
      </button>
    </li>
  );
}
