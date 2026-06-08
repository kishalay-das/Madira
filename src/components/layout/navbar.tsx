"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/data";
import { useCart } from "@/store/cart";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SearchOverlay } from "./search-overlay";

const links = [
  { label: "Shop All", href: "/shop" },
  { label: "Whiskey", href: "/shop?category=whiskey" },
  { label: "Wine", href: "/shop?category=wine" },
  { label: "Champagne", href: "/shop?category=champagne" },
  { label: "Collections", href: "/#collections" },
  { label: "Membership", href: "/#membership" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const openCart = useCart((s) => s.open);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    !href.includes("?") && !href.includes("#") && pathname === href;

  return (
    <>
      {/* Announcement bar — gracefully collapses on scroll */}
      <div
        className={cn(
          "relative z-50 overflow-hidden border-b bg-void transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled ? "max-h-0 border-transparent opacity-0" : "max-h-12 border-hairline opacity-100"
        )}
      >
        <div className="flex whitespace-nowrap py-2.5 text-[0.66rem] uppercase tracking-[0.28em] text-gold/80">
          <div className="animate-marquee flex shrink-0">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex items-center">
                <Marquee /> <Marquee /> <Marquee />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 1. DESKTOP VERSION (The "Floating Capsule" Design) */}
      <header
        className="fixed left-0 right-0 z-50 hidden lg:flex justify-center px-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          top: scrolled ? "1.5rem" : "3.5rem"
        }}
      >
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-2 p-2 rounded-full border border-gold/15 transition-all duration-500 relative group overflow-hidden hover:border-gold/30 hover:shadow-[0_0_30px_rgba(200,162,75,0.18)]"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px) saturate(120%)",
            WebkitBackdropFilter: "blur(20px) saturate(120%)",
            boxShadow: "var(--glass-shadow), 0 8px 32px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Subtle gold inner highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative z-10"
          >
            <Link href="/" className="flex items-center gap-2.5 pl-4 pr-6 group/logo">
              <motion.div
                whileHover={{ scale: 1.15, rotate: 20 }}
                className="w-5 h-5 bg-gradient-to-br from-gold/60 via-amber-600 to-gold rounded-full group-hover/logo:from-gold/80 group-hover/logo:to-gold transition-all duration-300 shadow-[0_0_12px_rgba(200,162,75,0.5)]"
              />
              <span className="text-sm font-medium text-cream tracking-wide group-hover/logo:text-gold transition-colors duration-300">
                NOCTURNE
              </span>
            </Link>
          </motion.div>

          <div className="flex items-center relative z-10">
            {links.map((l, idx) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05, duration: 0.4 }}
              >
                <Link
                  href={l.href}
                  className={cn(
                    "relative px-4 py-2.5 text-xs uppercase tracking-wider transition-all duration-300 rounded-full group/nav-item overflow-hidden block",
                    isActive(l.href)
                      ? "text-gold"
                      : "text-parchment/70 hover:text-cream"
                  )}
                >
                  {/* Active state animated underline */}
                  {isActive(l.href) && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-gradient-to-r from-gold/25 to-gold/10 rounded-full -z-10 shadow-[inset_0_1px_2px_rgba(200,162,75,0.15)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div
            className="ml-2 flex items-center gap-1 backdrop-blur-md rounded-full p-1.5 border border-gold/15 relative z-10 transition-all duration-300"
            style={{ background: "rgba(200, 162, 75, 0.04)" }}
          >
            <ThemeToggle className="border-none hover:bg-white/10 text-cream/70 hover:text-cream" />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-cream/70 hover:text-cream rounded-full transition-all duration-300 relative group/icon hover:bg-white/10"
              aria-label="Search"
            >
              <Search size={16} className="relative z-10" />
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/account"
                className="p-2.5 text-cream/70 hover:text-cream rounded-full transition-all duration-300 relative group/icon flex items-center justify-center hover:bg-white/10"
                aria-label="Account"
              >
                <User size={16} className="relative z-10" />
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCart}
              className="relative p-2.5 text-cream/70 hover:text-cream rounded-full transition-all duration-300 group/icon hover:bg-white/10"
              aria-label="Cart"
            >
              <ShoppingBag size={16} className="relative z-10" />
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-gold to-gold-bright rounded-full flex items-center justify-center text-[0.6rem] font-bold text-void animate-pulse"
                >
                  {count > 9 ? "9+" : count}
                </motion.span>
              )}
            </motion.button>
          </div>
        </motion.nav>
      </header>

      {/* 2. MOBILE VERSION (Sticky Header) */}
      <header
        className="lg:hidden sticky top-0 z-50 w-full border-b border-gold/15 h-16 flex items-center justify-between px-4"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px) saturate(120%)",
          WebkitBackdropFilter: "blur(20px) saturate(120%)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          className="text-cream hover:text-gold transition-colors p-2"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <Link href="/" className="font-display text-lg text-cream hover:text-gold transition-colors tracking-[0.2em]">
          NOCTURNE
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-cream hover:text-gold transition-colors p-2"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button
            onClick={openCart}
            className="text-cream relative hover:text-gold transition-colors p-2"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-1 text-[0.6rem] font-semibold text-ink shadow-[0_1px_4px_rgba(200,162,75,0.4)]">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile drawer — premium luxury app feel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[70] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="glass-dark absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col border-r border-hairline"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* glow accent */}
              <div className="pointer-events-none absolute -left-10 top-0 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.16),transparent_70%)]" />

              <div className="relative flex items-center justify-between border-b border-hairline p-6">
                <div>
                  <span className="block font-display text-xl tracking-[0.3em] text-cream">
                    NOCTURNE
                  </span>
                  <span className="text-[0.55rem] uppercase tracking-[0.4em] text-gold">
                    Premium Spirits
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-cream transition-colors hover:border-gold/40 hover:text-gold"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative flex-1 overflow-y-auto p-6">
                <ul className="space-y-1">
                  {links.map((l, i) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        className="group flex items-center justify-between border-b border-hairline/70 py-4 text-cream transition-colors hover:text-gold"
                      >
                        <span className="flex items-baseline gap-3">
                          <span className="font-display text-xs text-gold/60">
                            0{i + 1}
                          </span>
                          <span className="font-display text-xl">{l.label}</span>
                        </span>
                        <ArrowUpRight
                          size={18}
                          className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>

                <p className="eyebrow mt-8">Appearance</p>
                <div className="mt-4">
                  <ThemeToggle variant="full" />
                </div>

                <p className="eyebrow mt-8">Categories</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/shop?category=${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl border border-hairline px-3 py-2.5 text-xs text-parchment transition-colors hover:border-gold/40 hover:text-cream"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative border-t border-hairline p-6">
                <Link
                  href="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="shimmer flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-bright to-gold text-sm font-medium text-ink"
                >
                  Shop the Collection <ArrowUpRight size={16} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function NavLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "group relative py-1 text-[0.78rem] font-medium uppercase tracking-[0.16em] transition-colors duration-300",
          active ? "text-gold" : "text-parchment hover:text-cream"
        )}
      >
        {label}
        <span
          className={cn(
            "absolute -bottom-1 left-1/2 h-px -translate-x-1/2 bg-gradient-to-r from-transparent via-gold to-transparent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
          )}
        />
      </Link>
    </li>
  );
}

function Marquee() {
  return (
    <>
      <span className="mx-6">Complimentary delivery over $150</span>
      <span className="text-gold/40">✦</span>
      <span className="mx-6">90-minute concierge delivery in select cities</span>
      <span className="text-gold/40">✦</span>
      <span className="mx-6">Authenticated rare bottles</span>
      <span className="text-gold/40">✦</span>
    </>
  );
}
