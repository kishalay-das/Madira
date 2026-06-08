"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { QuickView } from "./quick-view";
import { Reveal } from "@/components/ui/reveal";

export function ProductShowcase({
  products,
  columns = 4,
}: {
  products: Product[];
  columns?: 3 | 4;
}) {
  const [active, setActive] = useState<Product | null>(null);
  const cols =
    columns === 3
      ? "xs:grid-cols-2 lg:grid-cols-3"
      : "xs:grid-cols-2 lg:grid-cols-4";

  return (
    <>
      <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${cols}`}>
        {products.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 0.08}>
            <ProductCard product={p} onQuickView={setActive} />
          </Reveal>
        ))}
      </div>
      <QuickView product={active} onClose={() => setActive(null)} />
    </>
  );
}
