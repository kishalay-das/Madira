import { BadgeCheck, Quote } from "lucide-react";
import { reviews } from "@/lib/data";
import { Stars } from "@/components/ui/stars";
import { Reveal, SectionHeading } from "@/components/ui/reveal";

export function Reviews() {
  return (
    <section id="reviews" className="container-luxe py-24 md:py-32">
      <SectionHeading
        eyebrow="The Verdict"
        title={<>Loved by collectors & connoisseurs</>}
        description="Rated 4.9 out of 5 across 12,000+ verified deliveries worldwide."
      />

      <div className="mt-16 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
        {reviews.map((r, i) => (
          <Reveal key={r.id} delay={(i % 3) * 0.06}>
            <figure className="luxe-card glass-dark relative break-inside-avoid rounded-[var(--radius-luxe)] p-7">
              <Quote size={28} className="text-gold/30" />
              <figcaption className="mt-3 flex items-center justify-between">
                <Stars value={r.rating} />
                {r.verified && (
                  <span className="inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.16em] text-emerald">
                    <BadgeCheck size={13} /> Verified
                  </span>
                )}
              </figcaption>
              <h3 className="mt-4 font-display text-lg text-cream">{r.title}</h3>
              <blockquote className="mt-2 text-sm leading-relaxed text-parchment/80">
                “{r.body}”
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-hairline pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-burgundy/40 font-display text-sm text-cream">
                  {r.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm text-cream">{r.name}</p>
                  <p className="text-[0.7rem] text-muted">
                    {r.location} · {r.product}
                  </p>
                </div>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
