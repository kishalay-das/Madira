"use client";

import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Bottle } from "@/components/bottle";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { useCart } from "@/store/cart";

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView?: (p: Product) => void;
}) {
  const add = useCart((s) => s.add);

  return (
    <div className="group luxe-card glass-dark relative flex flex-col overflow-hidden rounded-[var(--radius-luxe)]">
      {/* Bottle stage */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, ${product.palette.liquid}22, transparent 60%), linear-gradient(180deg, var(--stage-top), var(--stage-bottom))`,
        }}
      >
        {product.badge && (
          <div className="absolute left-4 top-4 z-10">
            <Badge tone={product.badge}>{product.badge}</Badge>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[78%] w-auto transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:scale-[1.06]">
            <Bottle product={product} className="drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" />
          </div>
        </div>
        {/* reflection */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--stage-fade)] to-transparent" />

        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 translate-y-4 items-center gap-2 rounded-full border border-gold/40 bg-night/80 px-4 py-2 text-xs text-cream opacity-0 backdrop-blur-md transition-all duration-500 hover:bg-gold hover:text-ink group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Eye size={14} /> Quick View
          </button>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-gold">
            {product.categoryLabel}
          </p>
          <Stars value={product.rating} size={12} />
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-2 font-display text-lg leading-snug text-cream transition-colors group-hover:text-gold-bright">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted">
          {product.distillery} · {product.volume}
          {product.abv > 0 ? ` · ${product.abv}% ABV` : ""}
        </p>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            {product.compareAt && (
              <span className="mr-2 text-sm text-muted-2 line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
            <span className="font-display text-xl text-cream">
              {formatPrice(product.price)}
            </span>
          </div>
          <button
            onClick={() => add(product)}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-all duration-500 hover:bg-gold hover:text-ink"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
