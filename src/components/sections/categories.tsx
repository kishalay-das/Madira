import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/data";
import type { CategorySlug } from "@/lib/types";
import { Bottle } from "@/components/bottle";
import { Reveal, SectionHeading } from "@/components/ui/reveal";

/* Representative bottle artwork per category (self-contained SVG imagery —
   realistic spirit palettes so each card instantly reads as its category). */
type DisplayBottle = {
  palette: { glass: string; liquid: string; label: string };
  name: string;
  category: CategorySlug;
  distillery: string;
  images?: string[];
};

const bottleFor: Record<CategorySlug, DisplayBottle> = {
  whiskey: { palette: { glass: "#2a160c", liquid: "#a8521a", label: "#efe2c4" }, name: "Whiskey", category: "whiskey", distillery: "Single Malt", images: ["/bottles/macallan-rare-cask-25.png"] },
  wine: { palette: { glass: "#160810", liquid: "#3a0f1c", label: "#cdb98c" }, name: "Wine", category: "wine", distillery: "Grand Cru", images: ["/bottles/opus-one-napa.png"] },
  champagne: { palette: { glass: "#241a08", liquid: "#e4cf86", label: "#0e0a04" }, name: "Champagne", category: "champagne", distillery: "Grande Marque", images: ["/bottles/dom-perignon-vintage.png"] },
  vodka: { palette: { glass: "#10202b", liquid: "#e8f0f6", label: "#0c1822" }, name: "Vodka", category: "vodka", distillery: "Crystalline", images: ["/bottles/grey-goose-magnum.png"] },
  gin: { palette: { glass: "#0f2419", liquid: "#d3e6da", label: "#e8e0cd" }, name: "Gin", category: "gin", distillery: "Botanical", images: ["/bottles/monkey-47-gin.png"] },
  rum: { palette: { glass: "#1d0f08", liquid: "#7a3812", label: "#e2c98f" }, name: "Rum", category: "rum", distillery: "Aged Reserve", images: ["/bottles/diplomatico-reserva.png"] },
  tequila: { palette: { glass: "#123048", liquid: "#dcc079", label: "#f2f4f7" }, name: "Tequila", category: "tequila", distillery: "Highland Agave", images: ["/bottles/clase-azul-reposado.png"] },
  // craft-beer & gift-boxes keep the procedural bottle (no real product image)
  "craft-beer": { palette: { glass: "#2e1f06", liquid: "#caa13e", label: "#14223a" }, name: "Craft Beer", category: "craft-beer", distillery: "Small Batch" },
  "gift-boxes": { palette: { glass: "#1a0c12", liquid: "#6e1f2e", label: "#e9d8a6" }, name: "Gift Box", category: "gift-boxes", distillery: "Curated" },
};

export function Categories() {
  return (
    <section id="categories" className="container-luxe py-24 md:py-32">
      <SectionHeading
        eyebrow="Curated Categories"
        title={<>Explore the cellar</>}
        description="From peated single malts to grower champagnes, every category is hand-selected and authenticated by our team of sommeliers and spirits specialists."
      />

      <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 3) * 0.06}>
            <Link
              href={`/shop?category=${c.slug}`}
              className="luxe-card group relative flex h-52 flex-col overflow-hidden rounded-[var(--radius-luxe)] border border-hairline sm:h-56 md:h-60"
            >
              {/* Accent wash + panel base */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(120% 110% at 86% 0%, ${c.hue}55, transparent 58%), var(--panel-grad)`,
                }}
              />
              {/* Subtle texture */}
              <div className="lux-texture absolute inset-0 opacity-50 mix-blend-overlay" />

              {/* Bottle imagery */}
              <div className="pointer-events-none absolute bottom-0 right-[-12%] top-0 flex w-[58%] items-center justify-center">
                <div
                  className="absolute h-1/2 w-3/4 rounded-full blur-2xl transition-opacity duration-700 group-hover:opacity-90"
                  style={{ background: `radial-gradient(circle, ${c.hue}66, transparent 70%)`, opacity: 0.45 }}
                />
                <div className="relative h-[76%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:scale-[1.08]">
                  <Bottle
                    product={bottleFor[c.slug]}
                    className="drop-shadow-[0_24px_36px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>

              {/* Legibility scrim */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(95deg, var(--color-night) 4%, transparent 64%), linear-gradient(0deg, var(--color-night) 0%, transparent 52%)",
                }}
              />

              {/* Inner gold frame */}
              <div className="pointer-events-none absolute inset-3 rounded-2xl border border-gold/10 transition-colors duration-700 group-hover:border-gold/30" />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-6">
                <div className="flex items-start justify-between">
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">
                    {c.count} labels
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-muted transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold"
                  />
                </div>
                <div className="max-w-[64%]">
                  <h3 className="font-display text-xl leading-tight text-cream md:text-2xl">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted">{c.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    Shop now
                    <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
