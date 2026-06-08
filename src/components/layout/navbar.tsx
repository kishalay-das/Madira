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

      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled
            ? "glass-dark border-b border-hairline shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)]"
            : "border-b border-transparent"
        )}
      >
        <nav
          className={cn(
            "container-luxe flex items-center justify-between gap-2 transition-all duration-500",
            scrolled ? "h-16 lg:h-[4.5rem]" : "h-[4.25rem] lg:h-24"
          )}
        >
          {/* Left: mobile menu + nav */}
          <div className="flex flex-1 items-center gap-7">
            <button
              className="-ml-2.5 flex h-11 w-11 items-center justify-center rounded-full text-cream transition-colors hover:bg-[var(--hover-soft)] hover:text-gold lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
              {links.slice(0, 3).map((l) => (
                <NavLink key={l.href} {...l} active={isActive(l.href)} />
              ))}
            </ul>
          </div>

          {/* Center: logo — kept in the flex flow between two equal flex-1 rails
              so it stays optically centred but never overlaps the nav links. */}
          <Link
            href="/"
            aria-label="Nocturne — home"
            className="group shrink-0 px-3 text-center sm:px-6"
          >
            <span className="block whitespace-nowrap font-display text-xl leading-none tracking-[0.2em] text-cream transition-colors duration-500 group-hover:text-gold-bright xs:text-2xl sm:tracking-[0.3em] md:text-[1.7rem] md:tracking-[0.3em] xl:text-[1.85rem] xl:tracking-[0.34em]">
              NOCTURNE
            </span>
            <span className="mt-1.5 flex items-center justify-center gap-2 text-[0.5rem] uppercase tracking-[0.34em] text-gold sm:text-[0.58rem] sm:tracking-[0.46em]">
              <span className="hidden h-px w-5 bg-gradient-to-r from-transparent to-gold/70 sm:block" />
              Premium Spirits
              <span className="hidden h-px w-5 bg-gradient-to-l from-transparent to-gold/70 sm:block" />
            </span>
          </Link>

          {/* Right: nav + actions */}
          <div className="flex flex-1 items-center justify-end gap-4 lg:gap-5">
            <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
              {links.slice(3).map((l) => (
                <NavLink key={l.href} {...l} active={isActive(l.href)} />
              ))}
            </ul>
            <div className="flex items-center gap-0.5 text-cream sm:gap-1">
              <ThemeToggle className="hidden sm:flex" />
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover-soft)] hover:text-gold"
              >
                <Search size={19} />
              </button>
              <Link
                href="/account"
                aria-label="Account"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover-soft)] hover:text-gold"
              >
                <User size={19} />
              </Link>
              <button
                aria-label="Cart"
                onClick={openCart}
                className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover-soft)] hover:text-gold"
              >
                <ShoppingBag size={19} />
                {count > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-1 text-[0.6rem] font-semibold text-ink shadow-[0_2px_8px_rgba(200,162,75,0.5)]">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
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
