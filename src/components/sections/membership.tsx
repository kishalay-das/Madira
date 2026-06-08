import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const benefits = [
  "Early access to allocated & limited bottles",
  "Exclusive member-only pricing year-round",
  "Priority 90-minute concierge delivery",
  "Complimentary gift wrapping on every order",
  "Invitations to private virtual tastings",
  "A dedicated personal spirits advisor",
];

export function Membership() {
  return (
    <section id="membership" className="container-luxe py-24 md:py-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-[var(--radius-luxe)] border border-gold/20">
          {/* Luxe backdrop */}
          <div className="absolute inset-0 bg-[image:var(--panel-grad)]" />
          <div className="pointer-events-none absolute -left-16 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.18),transparent_70%)]" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_90%_20%,rgba(110,31,46,0.25),transparent_60%)]" />

          <div className="relative grid grid-cols-1 gap-10 p-9 md:grid-cols-2 md:p-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[0.62rem] uppercase tracking-[0.24em] text-gold">
                <Crown size={14} /> Nocturne VIP
              </span>
              <h2 className="mt-6 font-display text-3xl leading-tight text-cream sm:text-4xl md:text-5xl text-balance">
                A membership for the truly initiated
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-parchment/80">
                Join an exclusive circle with first pour on the world&apos;s rarest
                releases, preferred pricing and white-glove service worthy of your
                cellar.
              </p>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-4xl text-gold-gradient">$240</span>
                <span className="text-sm text-muted">/ year · cancel anytime</span>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button variant="gold" size="lg">Become a Member</Button>
                <Button variant="outline" size="lg">Compare Tiers</Button>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-px self-center overflow-hidden rounded-2xl border border-hairline sm:grid-cols-2">
              {benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 bg-night/40 p-5 backdrop-blur-sm"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Check size={12} />
                  </span>
                  <span className="text-sm text-parchment">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
