"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bottle } from "@/components/bottle";
import { products } from "@/lib/data";

const hero = products.find((p) => p.slug === "macallan-rare-cask-25")!;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yBottle = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const glow = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  return (
    <section ref={ref} className="homepage-hero relative min-h-[100svh] overflow-hidden">
      {/* Ambient glows */}
      <motion.div
        style={{ opacity: glow }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vh] w-[120vh] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.14),transparent_60%)]" />
      </motion.div>

      {/* Vertical hairlines */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="container-luxe relative h-full">
          <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
          <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
        </div>
      </div>

      <div className="container-luxe relative grid min-h-[100svh] grid-cols-1 items-center gap-8 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Copy */}
        <motion.div style={{ y: yText, opacity }} className="relative z-10 text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="eyebrow"
          >
            ✦ Madeera — The Art of Fine Spirits
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-hero font-medium tracking-tight text-cream text-balance"
          >
            Premium Spirits,
            <br />
            <span className="text-gold-gradient">Delivered to Your Doorstep</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-parchment/80 lg:mx-0 md:text-lg"
          >
            A private cellar at your fingertips. Discover rare whiskeys, grand cru
            wines and collector&apos;s champagnes — authenticated, beautifully
            presented and delivered with concierge care.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <Button href="/shop" variant="gold" size="lg">
              Shop Now <ArrowRight size={18} />
            </Button>
            <Button href="/#collections" variant="outline" size="lg">
              Explore Collection
            </Button>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-start"
          >
            {[
              { Icon: ShieldCheck, label: "100% Authenticated" },
              { Icon: Truck, label: "90-min Concierge Delivery" },
              { Icon: Sparkles, label: "Hand-Curated Cellar" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-muted">
                <Icon size={16} className="text-gold" />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottle showcase */}
        <motion.div
          style={{ y: yBottle }}
          className="relative z-10 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Pedestal glow */}
            <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.22),transparent_65%)] blur-2xl animate-pulse-glow" />
            <div className="relative h-[40vh] max-h-[560px] animate-float xs:h-[46vh] sm:h-[54vh] lg:h-[60vh]">
              <Bottle product={hero} className="drop-shadow-[0_50px_60px_rgba(0,0,0,0.7)]" />
            </div>
            {/* Floating spec card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="glass absolute right-0 top-6 hidden rounded-2xl p-4 text-left sm:block sm:top-10"
            >
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold">Featured</p>
              <p className="mt-1 font-display text-sm text-cream">{hero.name}</p>
              <p className="mt-1 text-xs text-muted">{hero.age} · {hero.origin}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1.05 }}
              className="glass absolute left-0 bottom-10 hidden rounded-2xl p-4 text-left sm:block sm:bottom-16"
            >
              <p className="font-display text-2xl text-gold-gradient">$1,850</p>
              <p className="text-xs text-muted">Allocated · 6 in stock</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 text-center"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em] text-muted">Scroll</span>
        <div className="mx-auto mt-2 h-10 w-px bg-gradient-to-b from-gold to-transparent" />
      </motion.div>
    </section>
  );
}
