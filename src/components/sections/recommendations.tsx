import { Sparkles } from "lucide-react";
import { products } from "@/lib/data";
import { ProductShowcase } from "@/components/product/product-showcase";
import { Reveal } from "@/components/ui/reveal";

const picks = products.filter((p) =>
  ["p9", "p4", "p11", "p6"].includes(p.id)
);

export function Recommendations() {
  return (
    <section id="recommendations" className="container-luxe py-24 md:py-32">
      <div className="glass-dark relative overflow-hidden rounded-[var(--radius-luxe)] p-8 md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(28,92,70,0.3),transparent_70%)]" />
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="eyebrow">Powered by Madeera AI</p>
              <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
                Picked for you
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            Our taste engine studies your palate — the styles you browse, rate and
            collect — to surface bottles you&apos;ll genuinely love. The more you
            explore, the sharper it gets.
          </p>
        </Reveal>

        <div className="mt-12">
          <ProductShowcase products={picks} columns={4} />
        </div>
      </div>
    </section>
  );
}
