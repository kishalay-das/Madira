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
  { label: "Whiskey", href: "/shop?category=whiskey", type: "whiskey" },
  { label: "Wine", href: "/shop?category=wine", type: "wine" },
  { label: "Champagne", href: "/shop?category=champagne", type: "champagne" },
  { label: "Collections", href: "/#collections" },
  { label: "Membership", href: "/#membership" },
] as const;

interface DropdownItem {
  name: string;
  desc: string;
  href: string;
}

interface DropdownSection {
  title: string;
  items: DropdownItem[];
}

interface DropdownCategory {
  title: string;
  subtitle: string;
  quote: string;
  author: string;
  sections: DropdownSection[];
}

const DROPDOWN_DATA: Record<"whiskey" | "wine" | "champagne", DropdownCategory> = {
  whiskey: {
    title: "The Whiskey Vault",
    subtitle: "Aged Single Malts & Rare Reserves",
    quote: "“Whiskey is liquid sunshine.”",
    author: "George Bernard Shaw",
    sections: [
      {
        title: "Tasting Profiles",
        items: [
          { name: "Smoky & Peaty", desc: "Islay character, rich oak, peat fire smoke", href: "/shop?category=whiskey&profile=smoky" },
          { name: "Rich Sherry Cask", desc: "Dark chocolate, dried fruits, sweet spice", href: "/shop?category=whiskey&profile=sherry" },
          { name: "Smooth Caramel", desc: "Vanilla bean, butterscotch, toasted oak", href: "/shop?category=whiskey&profile=smooth" },
        ],
      },
      {
        title: "Featured Collections",
        items: [
          { name: "Rare Single Malts", desc: "18+ Year Speyside & Highland classics", href: "/shop?category=whiskey&style=single-malt" },
          { name: "Small Batch Bourbon", desc: "Kentucky's finest copper-pot distillates", href: "/shop?category=whiskey&style=bourbon" },
          { name: "Distiller's Releases", desc: "Highly allocated, limited-run expressions", href: "/shop?category=whiskey&style=limited" },
        ],
      },
    ],
  },
  wine: {
    title: "The Wine Cellar",
    subtitle: "Vintages of Distinction & Character",
    quote: "“Penicillin cures, but wine makes people happy.”",
    author: "Alexander Fleming",
    sections: [
      {
        title: "Tasting Profiles",
        items: [
          { name: "Bold & Structured", desc: "Full-bodied Cabernet, firm tannins, dark fruit", href: "/shop?category=wine&profile=bold" },
          { name: "Crisp & Mineral", desc: "Chablis, Sauvignon Blanc, refreshing citrus", href: "/shop?category=wine&profile=crisp" },
          { name: "Elegant & Floral", desc: "Pinot Noir, delicate red berries, forest floor", href: "/shop?category=wine&profile=elegant" },
        ],
      },
      {
        title: "Premium Regions",
        items: [
          { name: "Bordeaux Grand Cru", desc: "Historic estates and classic blends", href: "/shop?category=wine&region=bordeaux" },
          { name: "Napa Valley Reserves", desc: "Rich Cabernet Sauvignon and Chardonnay", href: "/shop?category=wine&region=napa" },
          { name: "Tuscan Classics", desc: "Chianti Classico, Brunello, Super Tuscans", href: "/shop?category=wine&region=tuscany" },
        ],
      },
    ],
  },
  champagne: {
    title: "The Champagne Salon",
    subtitle: "Effervescence & Celebrated Vintages",
    quote: "“In victory, you deserve Champagne. In defeat, you need it.”",
    author: "Napoleon Bonaparte",
    sections: [
      {
        title: "Tasting Profiles",
        items: [
          { name: "Brut Prestige", desc: "Dry, crisp apple, brioche, fine mousse", href: "/shop?category=champagne&profile=brut" },
          { name: "Blanc de Blancs", desc: "100% Chardonnay, bright citrus, chalky mineral", href: "/shop?category=champagne&profile=blanc" },
          { name: "Rosé Millésimé", desc: "Wild strawberry, delicate pink hue, red currant", href: "/shop?category=champagne&profile=rose" },
        ],
      },
      {
        title: "Occasion Curation",
        items: [
          { name: "Grand Celebrations", desc: "Magnums and Jeroboams of historic cuvées", href: "/shop?category=champagne&curation=grand" },
          { name: "Intimate Toasts", desc: "Exclusive grower Champagnes & half-bottles", href: "/shop?category=champagne&curation=intimate" },
          { name: "Limited Gift Packs", desc: "Prestige gift sets with luxury glassware", href: "/shop?category=champagne&curation=gift" },
        ],
      },
    ],
  },
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Luxury interactive states
  const [logoHovered, setLogoHovered] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<"whiskey" | "wine" | "champagne" | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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
        className="fixed left-0 right-0 z-50 hidden lg:flex flex-col items-center px-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          top: scrolled ? "2rem" : "4.5rem"
        }}
        onMouseLeave={() => {
          setHoveredIdx(null);
          setActiveDropdown(null);
        }}
      >
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onMouseMove={handleMouseMove}
          className="flex items-center gap-2 p-2 rounded-full border border-gold/15 transition-all duration-500 relative group hover:border-gold/30 hover:shadow-[0_0_30px_rgba(200,162,75,0.18)]"
          style={{
            background: "var(--nav-glass-bg)",
            backdropFilter: "var(--nav-glass-blur)",
            WebkitBackdropFilter: "var(--nav-glass-blur)",
            boxShadow: "var(--glass-shadow), 0 8px 32px rgba(0, 0, 0, 0.12)",
          }}
        >
          {/* Subtle gold inner highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent rounded-full pointer-events-none" />

          {/* Dynamic Caustics Glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full"
            style={{
              background: `radial-gradient(130px circle at ${mousePos.x}px ${mousePos.y}px, rgba(200, 162, 75, 0.12) 0%, rgba(227, 194, 112, 0.05) 50%, transparent 100%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full"
            style={{
              background: `radial-gradient(80px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.04) 0%, transparent 100%)`,
            }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative z-10"
          >
            <Link
              href="/"
              className="flex items-center gap-2.5 pl-4 pr-6 group/logo"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
            >
              <LiquidDecanter hovered={logoHovered} id="desktop" className="w-5.5 h-5.5" />
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
                onMouseEnter={() => {
                  setHoveredIdx(idx);
                  if ("type" in l && l.type) {
                    setActiveDropdown(l.type);
                  } else {
                    setActiveDropdown(null);
                  }
                }}
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
                  {/* Hover capsule indicator (liquid pill) */}
                  {hoveredIdx === idx && (
                    <motion.div
                      layoutId="navbar-hover-bubble"
                      className="absolute inset-0 bg-gradient-to-b from-gold/12 via-amber-600/6 to-gold/2 rounded-full -z-10 border border-gold/10 shadow-[0_2px_8px_rgba(200,162,75,0.06)]"
                      transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    />
                  )}
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

        {/* Dropdown panel */}
        <AnimatePresence>
          {activeDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 w-full max-w-4xl rounded-3xl border border-gold/15 p-6 shadow-2xl glass-dark relative overflow-hidden z-40"
              onMouseEnter={() => {
                const categoryIdx = links.findIndex((l) => "type" in l && l.type === activeDropdown);
                if (categoryIdx !== -1) setHoveredIdx(categoryIdx);
              }}
            >
              {/* Subtle gold inner highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent pointer-events-none" />

              {/* Ambient liquid glow in dropdown background */}
              <div
                className="pointer-events-none absolute -right-12 -bottom-12 w-64 h-64 rounded-full opacity-60"
                style={{
                  background: "radial-gradient(circle, rgba(200, 162, 75, 0.06) 0%, transparent 70%)"
                }}
              />

              <div className="grid grid-cols-12 gap-8 relative z-10 text-left">
                {/* Left columns */}
                <div className="col-span-8 grid grid-cols-2 gap-8">
                  {DROPDOWN_DATA[activeDropdown].sections.map((sec, sIdx) => (
                    <div key={sIdx}>
                      <p className="eyebrow mb-4 text-[0.65rem] tracking-[0.25em] text-gold">{sec.title}</p>
                      <ul className="space-y-4">
                        {sec.items.map((item, iIdx) => (
                          <li key={iIdx}>
                            <Link
                              href={item.href}
                              onClick={() => {
                                setActiveDropdown(null);
                                setHoveredIdx(null);
                              }}
                              className="group/item block"
                            >
                              <p className="text-sm font-medium text-cream group-hover/item:text-gold transition-colors duration-200">
                                {item.name}
                              </p>
                              <p className="text-xs text-parchment/60 group-hover/item:text-parchment/80 transition-colors duration-200 mt-1">
                                {item.desc}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="col-span-1 flex justify-center items-stretch">
                  <div className="w-px bg-gradient-to-b from-gold/20 via-gold/10 to-transparent" />
                </div>

                {/* Right column */}
                <div className="col-span-3 flex flex-col justify-between py-1">
                  <div>
                    <p className="eyebrow text-[0.6rem] text-muted tracking-[0.3em] uppercase">Nocturne Vault</p>
                    <p className="mt-3 font-display italic text-sm text-cream/90 leading-relaxed">
                      {DROPDOWN_DATA[activeDropdown].quote}
                    </p>
                    <p className="mt-2 text-[0.65rem] uppercase tracking-widest text-gold/80">
                      — {DROPDOWN_DATA[activeDropdown].author}
                    </p>
                  </div>
                  <div className="text-[0.66rem] text-parchment/40 uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-pulse" />
                    {DROPDOWN_DATA[activeDropdown].subtitle}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. MOBILE VERSION (Sticky Header) */}
      <header
        className="lg:hidden sticky top-0 z-50 w-full border-b border-gold/15 h-16 flex items-center justify-between px-4"
        style={{
          background: "var(--nav-glass-bg)",
          backdropFilter: "var(--nav-glass-blur)",
          WebkitBackdropFilter: "var(--nav-glass-blur)",
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
        <Link href="/" className="flex items-center gap-2 group/logo">
          <LiquidDecanter hovered={false} id="mobile-sticky" className="w-5 h-5" />
          <span className="font-display text-base text-cream hover:text-gold transition-colors tracking-[0.2em]">
            NOCTURNE
          </span>
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
                <div className="flex items-center gap-3">
                  <LiquidDecanter hovered={true} id="mobile-drawer" className="w-6 h-6" />
                  <div>
                    <span className="block font-display text-xl tracking-[0.3em] text-cream">
                      NOCTURNE
                    </span>
                    <span className="text-[0.55rem] uppercase tracking-[0.4em] text-gold">
                      Premium Spirits
                    </span>
                  </div>
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

function LiquidDecanter({
  hovered,
  className,
  id = "decanter",
}: {
  hovered: boolean;
  className?: string;
  id?: string;
}) {
  const clipId = `bottle-liquid-clip-${id}`;
  const gradId = `liquid-grad-${id}`;

  return (
    <div className={cn("relative w-6 h-6 flex items-center justify-center shrink-0", className)}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gold"
      >
        <defs>
          <linearGradient id={gradId} x1="12" y1="8" x2="12" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5d061" />
            <stop offset="40%" stopColor="#c8a24b" />
            <stop offset="100%" stopColor="#69460b" />
          </linearGradient>
          <clipPath id={clipId}>
            <path d="M10.5 5.5h3v2.5l2.3 2.7c1.4 1.8 2.2 3.8 2.2 6.8 0 3.3-2.7 6-6 6s-6-2.7-6-6c0-3 .8-5 2.2-6.8l2.3-2.7V5.5z" />
          </clipPath>
        </defs>

        <motion.path
          d="M10 4.5h4v3.5l2.5 3c1.5 1.8 2.5 4.2 2.5 7a7 7 0 0 1-14 0c0-2.8 1-5.2 2.5-7l2.5-3V4.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            scale: hovered ? 1.05 : 1,
            rotate: hovered ? [0, -4, 4, -2, 2, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M9.5 2h5v2h-5z"
          fill="currentColor"
          animate={{
            y: hovered ? -1.5 : 0,
            scale: hovered ? 1.05 : 1,
          }}
          transition={{
            duration: 0.3,
          }}
        />

        <g clipPath={`url(#${clipId})`}>
          <motion.g
            animate={{
              rotate: hovered ? [-4, 4, -2, 2, 0] : 0,
              y: hovered ? [-1, 0.5, -0.2, 0] : 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="origin-[12px_17px]"
          >
            <rect x="3" y="13" width="18" height="11" fill={`url(#${gradId})`} />
            <motion.path
              d="M 0 13 Q 3 11, 6 13 T 12 13 T 18 13 T 24 13 T 30 13 T 36 13 V 20 H 0 Z"
              fill={`url(#${gradId})`}
              animate={{
                x: hovered ? [-24, 0] : [-12, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: hovered ? 1.2 : 2.5,
                ease: "linear",
              }}
            />
          </motion.g>
        </g>
      </svg>
    </div>
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
