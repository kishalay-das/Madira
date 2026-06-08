import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { occasions, getProduct } from "@/lib/data";
import { Bottle } from "@/components/bottle";
import { Reveal, SectionHeading } from "@/components/ui/reveal";

/* Representative bottle artwork per occasion (self-contained SVG imagery). */
const productForOccasion: Record<string, string> = {
  party: "grey-goose-magnum",
  wedding: "dom-perignon-vintage",
  corporate: "nocturne-reserve-gift",
  anniversary: "opus-one-napa",
  celebration: "krug-grande-cuvee",
};

export function Occasions() {
  return (
    <section id="occasions" className="container-luxe py-24 md:py-32">
      <SectionHeading
        eyebrow="Shop by Occasion"
        title={<>For every moment worth marking</>}
        description="Tell us the occasion and our concierge will compose the perfect selection — wrapped, ribboned and delivered on schedule."
      />

      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {occasions.map((o, i) => {
          const product = getProduct(productForOccasion[o.slug]);
          return (
            <Reveal key={o.slug} delay={(i % 5) * 0.05}>
              <Link
                href="/shop"
                className="luxe-card group relative flex h-64 flex-col justify-end overflow-hidden rounded-[var(--radius-luxe)] border border-hairline sm:h-72 lg:h-80"
              >
                {/* Accent wash + panel base */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(130% 90% at 50% 6%, ${o.accent}4d, transparent 60%), var(--panel-grad)`,
                  }}
                />
                {/* Subtle texture */}
                <div className="lux-texture absolute inset-0 opacity-50 mix-blend-overlay" />

                {/* Bottle imagery (centered, top) */}
                {product && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[62%] items-center justify-center">
                    <div
                      className="absolute h-2/3 w-2/3 rounded-full blur-2xl transition-opacity duration-700 group-hover:opacity-90"
                      style={{ background: `radial-gradient(circle, ${o.accent}66, transparent 70%)`, opacity: 0.5 }}
                    />
                    <div className="relative h-[88%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.07]">
                      <Bottle
                        product={product}
                        className="drop-shadow-[0_26px_38px_rgba(0,0,0,0.55)]"
                      />
                    </div>
                  </div>
                )}

                {/* Legibility scrim (bottom-weighted) */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(0deg, var(--color-night) 8%, transparent 58%)",
                  }}
                />

                {/* Accent dot */}
                <span
                  className="absolute right-4 top-4 z-10 h-2.5 w-2.5 rounded-full"
                  style={{ background: o.accent, boxShadow: `0 0 16px ${o.accent}` }}
                />

                {/* Inner gold frame */}
                <div className="pointer-events-none absolute inset-3 rounded-2xl border border-gold/10 transition-colors duration-700 group-hover:border-gold/30" />

                {/* Content */}
                <div className="relative z-10 p-5 md:p-6">
                  <h3 className="font-display text-lg leading-tight text-cream">
                    {o.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted">{o.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    Shop now
                    <ArrowUpRight size={12} />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
