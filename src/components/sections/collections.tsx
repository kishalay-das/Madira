import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { collections, getProduct } from "@/lib/data";
import type { Collection, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bottle } from "@/components/bottle";
import { Reveal, SectionHeading } from "@/components/ui/reveal";

type Variant = "hero" | "wide" | "standard";

interface CardConfig {
  slug: string;
  product: string;
  badge: string;
  blurb: string;
  variant: Variant;
  span: string;
}

/* Editorial, magazine-style composition over a 3-column grid:
   one 2×2 hero, two stacked standards, one 2×1 wide, one standard. */
const layout: CardConfig[] = [
  {
    slug: "rare-whiskeys",
    product: "yamazaki-18",
    badge: "Rare & Allocated",
    blurb:
      "Single casks and aged expressions, hand-selected and authenticated for the serious collector.",
    variant: "hero",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    slug: "collectors-editions",
    product: "clase-azul-reposado",
    badge: "Collector's Choice",
    blurb: "Numbered bottlings and hand-finished decanters.",
    variant: "standard",
    span: "",
  },
  {
    slug: "imported-wines",
    product: "sassicaia-bolgheri",
    badge: "Sommelier Selection",
    blurb: "Old-world estates, cellared in flawless condition.",
    variant: "standard",
    span: "",
  },
  {
    slug: "limited-releases",
    product: "krug-grande-cuvee",
    badge: "Limited Release",
    blurb:
      "Here today, allocated tomorrow — the bottles connoisseurs quietly compete for.",
    variant: "wide",
    span: "md:col-span-2",
  },
  {
    slug: "luxury-gift-packs",
    product: "nocturne-reserve-gift",
    badge: "Exclusive Import",
    blurb: "Wrapped, ribboned and ready to astonish.",
    variant: "standard",
    span: "",
  },
];

export function Collections() {
  const cards = layout
    .map((cfg) => {
      const data = collections.find((c) => c.slug === cfg.slug);
      const product = getProduct(cfg.product);
      if (!data || !product) return null;
      return { cfg, data, product };
    })
    .filter(Boolean) as { cfg: CardConfig; data: Collection; product: Product }[];

  return (
    <section id="collections" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(67,18,28,0.1),transparent)]" />
      <div className="container-luxe relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            align="left"
            eyebrow="Premium Collections"
            title={<>Reserved for the discerning</>}
            description="Allocations, numbered editions and old-world rarities — curated into collections worth exploring."
          />
          <Reveal>
            <Link
              href="/shop"
              className="group hidden items-center gap-2 whitespace-nowrap text-xs uppercase tracking-[0.18em] text-gold md:inline-flex"
            >
              View all collections
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid auto-rows-[300px] grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[252px] md:grid-cols-3">
          {cards.map(({ cfg, data, product }, i) => (
            <Reveal
              key={cfg.slug}
              delay={(i % 3) * 0.08}
              className={cn(cfg.span, "min-h-0")}
            >
              <CollectionCard
                data={data}
                product={product}
                badge={cfg.badge}
                blurb={cfg.blurb}
                variant={cfg.variant}
                index={i + 1}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionCard({
  data,
  product,
  badge,
  blurb,
  variant,
  index,
}: {
  data: Collection;
  product: Product;
  badge: string;
  blurb: string;
  variant: Variant;
  index: number;
}) {
  const isHero = variant === "hero";
  const isWide = variant === "wide";

  return (
    <Link
      href="/shop"
      className="luxe-card group relative flex h-full overflow-hidden rounded-[var(--radius-luxe)] border border-hairline"
    >
      {/* Base panel + accent wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 110% at 88% 0%, ${data.accent}55, transparent 58%), var(--panel-grad)`,
        }}
      />
      {/* Subtle texture */}
      <div className="lux-texture absolute inset-0 opacity-50 mix-blend-overlay" />

      {/* Bottle imagery */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 top-0 flex items-center justify-center",
          isHero
            ? "right-[-3%] w-[50%]"
            : isWide
            ? "right-[-2%] w-[42%]"
            : "right-[-8%] w-[52%]"
        )}
      >
        {/* pedestal glow */}
        <div
          className="absolute h-1/2 w-3/4 rounded-full blur-2xl transition-opacity duration-700 group-hover:opacity-90"
          style={{ background: `radial-gradient(circle, ${data.accent}66, transparent 70%)`, opacity: 0.5 }}
        />
        <div
          className={cn(
            "relative transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:scale-[1.07]",
            isHero ? "h-[86%]" : "h-[80%]"
          )}
        >
          <Bottle
            product={product}
            className="drop-shadow-[0_30px_45px_rgba(0,0,0,0.55)]"
          />
        </div>
      </div>

      {/* Legibility scrims */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(95deg, var(--color-night) 8%, transparent 62%), linear-gradient(0deg, var(--color-night) 2%, transparent 55%)",
        }}
      />

      {/* Inner gold frame */}
      <div className="pointer-events-none absolute inset-3 rounded-2xl border border-gold/10 transition-colors duration-700 group-hover:border-gold/30" />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-5 md:p-7">
        <div className="flex items-start justify-between gap-3">
          <span className="font-display text-sm text-gold/50">
            {String(index).padStart(2, "0")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-night/40 px-3 py-1 text-[0.56rem] uppercase tracking-[0.16em] text-gold backdrop-blur-sm">
            <Sparkles size={10} />
            {badge}
          </span>
        </div>

        <div className={cn(isHero ? "max-w-[78%]" : "max-w-[68%]")}>
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-gold">
            {data.count} bottles
          </p>
          <h3
            className={cn(
              "mt-2 font-display leading-tight text-cream",
              isHero ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
            )}
          >
            {data.title}
          </h3>
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed text-muted",
              isHero || isWide ? "block" : "hidden sm:block"
            )}
          >
            {blurb}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-parchment transition-colors duration-500 group-hover:text-gold">
            Discover
            <ArrowUpRight
              size={15}
              className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
