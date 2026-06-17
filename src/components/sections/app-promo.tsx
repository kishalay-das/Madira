import { Apple, Bell, MapPin, Play, Wine } from "lucide-react";
import { Bottle } from "@/components/bottle";
import { products } from "@/lib/data";
import { Reveal } from "@/components/ui/reveal";

const phoneProduct = products.find((p) => p.slug === "hibiki-harmony-master")!;

export function AppPromo() {
  return (
    <section id="app" className="container-luxe py-24 md:py-32">
      <div className="relative grid grid-cols-1 items-center gap-12 overflow-hidden rounded-[var(--radius-luxe)] border border-hairline bg-[image:var(--panel-grad)] p-10 md:grid-cols-2 md:p-16">
        <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.14),transparent_70%)]" />

        <Reveal>
          <p className="eyebrow">The SipSipGo App</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-cream sm:text-4xl md:text-5xl text-balance">
            Your cellar, in your pocket
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            Track deliveries in real time, scan labels for instant tasting notes,
            and get first alert on allocated drops — wherever you are.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { Icon: MapPin, t: "Live concierge delivery tracking" },
              { Icon: Bell, t: "Instant alerts on limited releases" },
              { Icon: Wine, t: "AI label scanner & tasting notes" },
            ].map(({ Icon, t }) => (
              <li key={t} className="flex items-center gap-3 text-sm text-parchment">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold">
                  <Icon size={16} />
                </span>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#" className="flex items-center gap-3 rounded-2xl border border-hairline bg-night/60 px-5 py-3 transition-colors hover:border-gold/40">
              <Apple size={24} className="text-cream" />
              <span className="text-left">
                <span className="block text-[0.6rem] uppercase tracking-widest text-muted">Download on the</span>
                <span className="block text-sm text-cream">App Store</span>
              </span>
            </a>
            <a href="#" className="flex items-center gap-3 rounded-2xl border border-hairline bg-night/60 px-5 py-3 transition-colors hover:border-gold/40">
              <Play size={22} className="text-cream" />
              <span className="text-left">
                <span className="block text-[0.6rem] uppercase tracking-widest text-muted">Get it on</span>
                <span className="block text-sm text-cream">Google Play</span>
              </span>
            </a>
          </div>
        </Reveal>

        {/* Phone mockups */}
        <Reveal delay={0.1} className="relative flex justify-center">
          <div className="relative flex items-end gap-4">
            <PhoneFrame className="hidden translate-y-6 sm:block">
              <div className="flex h-full flex-col p-4">
                <p className="text-[0.55rem] uppercase tracking-widest text-gold">Arriving in 14 min</p>
                <div className="mt-3 h-1 w-full rounded-full bg-graphite">
                  <div className="h-full w-2/3 rounded-full bg-gold" />
                </div>
                <div className="mt-4 flex-1 rounded-xl border border-hairline bg-night/60 p-3">
                  <div className="h-20" style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.6))" }}>
                    <Bottle product={phoneProduct} />
                  </div>
                  <p className="mt-2 text-center text-[0.6rem] text-cream">{phoneProduct.name}</p>
                </div>
              </div>
            </PhoneFrame>

            <PhoneFrame>
              <div className="flex h-full flex-col p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs tracking-[0.2em] text-cream">SipSipGo</span>
                  <Bell size={12} className="text-gold" />
                </div>
                <div className="mt-3 h-28 rounded-xl bg-[radial-gradient(circle_at_50%_20%,rgba(200,162,75,0.4),transparent_70%)] p-2">
                  <div className="mx-auto h-full w-10">
                    <Bottle product={products[0]} />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {products.slice(1, 5).map((p) => (
                    <div key={p.id} className="flex flex-col items-center rounded-lg border border-hairline bg-night/50 p-1.5">
                      <div className="h-10 w-6">
                        <Bottle product={p} />
                      </div>
                      <span className="mt-1 text-[0.5rem] text-muted">{p.distillery}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PhoneFrame>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative h-80 w-40 rounded-[2rem] border-[6px] border-[#1b1b22] bg-night shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ${className}`}
    >
      <div className="absolute left-1/2 top-2 h-1 w-12 -translate-x-1/2 rounded-full bg-graphite" />
      <div className="h-full overflow-hidden rounded-[1.5rem]">{children}</div>
    </div>
  );
}
