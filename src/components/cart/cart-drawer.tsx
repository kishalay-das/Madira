"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Bottle } from "@/components/bottle";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";

const FREE_SHIPPING = 150;

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotal } = useCart();
  const pathname = usePathname();

  // Auto-close the drawer once the user is on the cart/checkout page.
  useEffect(() => {
    if (pathname === "/cart") close();
  }, [pathname, close]);

  const total = subtotal();
  const remaining = Math.max(0, FREE_SHIPPING - total);
  const progress = Math.min(100, (total / FREE_SHIPPING) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm" onClick={close} />
          <motion.aside
            className="glass-dark absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-hairline"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-hairline p-6">
              <h2 className="font-display text-xl text-cream">
                Your Cellar <span className="text-muted">({items.length})</span>
              </h2>
              <button onClick={close} aria-label="Close cart" className="text-parchment hover:text-cream">
                <X size={20} />
              </button>
            </div>

            {/* Free-shipping progress */}
            {items.length > 0 && (
              <div className="border-b border-hairline px-6 py-4">
                <p className="text-xs text-parchment">
                  {remaining > 0 ? (
                    <>
                      Add <span className="text-gold">{formatPrice(remaining)}</span> for complimentary delivery
                    </>
                  ) : (
                    <span className="text-gold">✦ You&apos;ve unlocked complimentary delivery</span>
                  )}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-graphite">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                  <ShoppingBag size={40} className="text-muted-2" />
                  <p className="text-muted">Your cellar is empty.</p>
                  <Button href="/shop" variant="outline" onClick={close}>
                    Explore the Collection
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-[color:var(--color-hairline)]">
                  {items.map(({ product, qty }) => (
                    <li key={product.id} className="flex gap-4 p-5">
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={close}
                        className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `radial-gradient(circle at 50% 20%, ${product.palette.liquid}33, transparent 70%)` }}
                      >
                        <div className="h-20">
                          <Bottle product={product} />
                        </div>
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-display text-sm leading-tight text-cream">{product.name}</p>
                            <p className="mt-0.5 text-[0.68rem] text-muted">{product.volume}</p>
                          </div>
                          <button
                            onClick={() => remove(product.id)}
                            aria-label="Remove item"
                            className="text-muted-2 transition-colors hover:text-burgundy"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center rounded-full border border-hairline">
                            <button
                              onClick={() => setQty(product.id, qty - 1)}
                              className="flex h-9 w-9 items-center justify-center text-parchment hover:text-gold"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-7 text-center text-xs tabular-nums text-cream">{qty}</span>
                            <button
                              onClick={() => setQty(product.id, qty + 1)}
                              className="flex h-9 w-9 items-center justify-center text-parchment hover:text-gold"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-display text-sm text-cream">
                            {formatPrice(product.price * qty)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-hairline p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-display text-lg text-cream">{formatPrice(total)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">Taxes & delivery calculated at checkout.</p>
                <Button href="/cart" variant="gold" size="lg" className="mt-4 w-full" onClick={close}>
                  Proceed to Checkout
                </Button>
                <button onClick={close} className="mt-3 w-full text-center text-xs uppercase tracking-[0.2em] text-muted hover:text-gold">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
