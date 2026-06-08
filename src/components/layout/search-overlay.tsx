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
            className="fixed inset-x-0 mx-auto top-4 md:top-28 z-[96] w-[95%] md:w-[92%] max-w-2xl p-4 md:p-6 rounded-3xl border border-gold/20 shadow-2xl transition-all duration-500 overflow-hidden"
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(20px) saturate(120%)",
              WebkitBackdropFilter: "blur(20px) saturate(120%)",
              boxShadow: "var(--glass-shadow), 0 20px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(200, 162, 75, 0.12)",
            }}
          >
            {/* Subtle gold inner highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent rounded-t-3xl pointer-events-none" />

            <div className="relative">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  goToAll();
                }}
                className="flex items-center gap-3 rounded-full border border-gold/15 bg-void/30 px-4 py-1.5 focus-within:border-gold/40 focus-within:shadow-[0_0_15px_rgba(200,162,75,0.08)] transition-all duration-300"
              >
                <Search size={18} className="shrink-0 text-gold/80" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search whiskey, wine, champagne…"
                  className="h-10 flex-1 bg-transparent text-sm text-cream placeholder:text-muted-2 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-base"
                  style={{ outline: "none", boxShadow: "none" }}
                />
                {loading && <Loader2 size={16} className="shrink-0 animate-spin text-muted" />}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-parchment/70 hover:bg-white/10 hover:text-cream transition-colors"
                >
                  <X size={16} />
                </button>
              </form>

              {!showResults && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted">Popular:</span>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQ(s)}
                      className="rounded-full border border-gold/15 px-3 py-1 text-xs text-parchment/80 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 hover:border-gold/40 hover:text-gold hover:bg-gold/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {showResults && (
                <div className="mt-5 max-h-[50vh] overflow-y-auto pr-1">
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
                            className="flex items-center gap-3 rounded-xl border border-gold/10 bg-void/20 p-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:scale-[1.01] hover:border-gold/30 hover:bg-gold/5 hover:shadow-[0_4px_20px_rgba(200,162,75,0.06)]"
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
                      className="mt-4 w-full rounded-xl border border-gold/20 py-2.5 text-center text-xs uppercase tracking-[0.2em] text-gold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gold/10 hover:border-gold/40"
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
