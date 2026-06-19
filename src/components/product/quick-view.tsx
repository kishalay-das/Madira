"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Loader2, ShoppingBag, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Bottle } from "@/components/bottle";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";

export function QuickView({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [wished, setWished] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);

  // Reset the heart whenever a different product is opened.
  useEffect(() => {
    setWished(false);
  }, [product?.slug]);

  async function toggleWishlist() {
    if (!product) return;
    setWishBusy(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: product.slug }),
      });
      if (res.status === 401) {
        router.push(`/login?callbackUrl=/product/${product.slug}`);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setWished(data.wishlisted);
      }
    } finally {
      setWishBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-dark relative z-10 grid max-h-[92vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-[var(--radius-luxe)] md:grid-cols-2"
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 24, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-night/60 text-parchment transition-colors hover:text-cream"
            >
              <X size={16} />
            </button>

            <div
              className="relative flex items-center justify-center p-6 md:p-8"
              style={{
                background: `radial-gradient(120% 80% at 50% 10%, ${product.palette.liquid}33, transparent 60%)`,
              }}
            >
              {product.badge && (
                <div className="absolute left-5 top-5">
                  <Badge tone={product.badge}>{product.badge}</Badge>
                </div>
              )}
              {product.stock <= 0 && (
                <div className="absolute right-5 top-5 rounded-full border border-burgundy/40 bg-night/80 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-wider text-burgundy backdrop-blur-md">
                  Out of stock
                </div>
              )}
              <div className={`h-48 animate-float sm:h-60 md:h-72 ${product.stock <= 0 ? "opacity-50 grayscale" : ""}`}>
                <Bottle product={product} className="drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]" />
              </div>
            </div>

            <div className="flex flex-col p-7 md:p-9">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-gold">
                {product.categoryLabel}
              </p>
              <h2 className="mt-2 font-display text-2xl text-cream md:text-3xl">
                {product.name}
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <Stars value={product.rating} showValue />
                <span className="text-xs text-muted">{product.reviews} reviews</span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-parchment/80">
                {product.description}
              </p>

              <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-hairline py-4 text-center">
                <div>
                  <dt className="text-[0.6rem] uppercase tracking-widest text-muted">ABV</dt>
                  <dd className="mt-1 font-display text-cream">{product.abv}%</dd>
                </div>
                <div>
                  <dt className="text-[0.6rem] uppercase tracking-widest text-muted">Volume</dt>
                  <dd className="mt-1 font-display text-cream">{product.volume}</dd>
                </div>
                <div>
                  <dt className="text-[0.6rem] uppercase tracking-widest text-muted">Origin</dt>
                  <dd className="mt-1 text-xs text-cream">{product.origin}</dd>
                </div>
              </dl>

              <div className="mt-auto flex items-center justify-between pt-6">
                <div>
                  <span className="font-display text-2xl text-cream">
                    {formatPrice(product.price)}
                  </span>
                  {product.stock > 0 && product.stock < 10 && (
                    <span className="mt-1 block text-xs text-burgundy">
                      Only {product.stock} left
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleWishlist}
                    disabled={wishBusy}
                    aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10 disabled:opacity-60"
                  >
                    {wishBusy ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Heart size={18} className={wished ? "fill-current" : ""} />
                    )}
                  </button>
                  <Button
                    variant="gold"
                    disabled={product.stock <= 0}
                    onClick={() => {
                      add(product);
                      onClose();
                    }}
                  >
                    <ShoppingBag size={16} /> {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
              <Link
                href={`/product/${product.slug}`}
                className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-gold"
                onClick={onClose}
              >
                View full details →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
