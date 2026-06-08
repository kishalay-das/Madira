"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Search, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Bottle } from "@/components/bottle";

const SUGGESTIONS = ["Whisky", "Champagne", "Wine", "Rum", "Gin", "Tequila"];

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on open; reset state on close (deferred so it isn't a sync setState)
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setQ("");
      setResults([]);
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounced live search (all state updates happen inside the timeout)
  useEffect(() => {
    const term = q.trim();
    const t = setTimeout(async () => {
      if (term.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(term)}&limit=6`
        );
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, term.length < 2 ? 0 : 220);
    return () => clearTimeout(t);
  }, [q]);

  function goToAll() {
    const term = q.trim();
    if (!term) return;
    router.push(`/shop?q=${encodeURIComponent(term)}`);
    onClose();
  }

  const showResults = q.trim().length >= 2;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="glass-dark absolute inset-x-0 top-0 border-b border-hairline"
            initial={{ y: -32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -32, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container-luxe py-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  goToAll();
                }}
                className="flex items-center gap-3"
              >
                <Search size={20} className="shrink-0 text-gold" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search whiskey, wine, champagne…"
                  className="h-11 flex-1 bg-transparent text-base text-cream placeholder:text-muted-2 focus:outline-none md:text-lg"
                />
                {loading && <Loader2 size={18} className="shrink-0 animate-spin text-muted" />}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-parchment transition-colors hover:text-cream"
                >
                  <X size={20} />
                </button>
              </form>

              {!showResults && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted">Popular:</span>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQ(s)}
                      className="rounded-full border border-hairline px-3 py-1 text-xs text-parchment transition-colors hover:border-gold/40 hover:text-gold"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {showResults && (
                <div className="mt-4 max-h-[62vh] overflow-y-auto">
                  {results.length === 0 && !loading ? (
                    <p className="py-8 text-center text-sm text-muted">
                      No bottles match “{q.trim()}”.
                    </p>
                  ) : (
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {results.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/product/${p.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-xl border border-hairline bg-night/40 p-3 transition-colors hover:border-gold/40"
                          >
                            <div className="h-14 w-10 shrink-0">
                              <Bottle product={p} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-cream">{p.name}</p>
                              <p className="truncate text-xs text-muted">{p.categoryLabel}</p>
                            </div>
                            <span className="shrink-0 font-display text-sm text-cream">
                              {formatPrice(p.price)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {results.length > 0 && (
                    <button
                      onClick={goToAll}
                      className="mt-3 w-full rounded-xl border border-hairline py-2.5 text-center text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold/10"
                    >
                      View all results →
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
