import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { bestSellers } from "@/lib/data";
import { ProductShowcase } from "@/components/product/product-showcase";
import { Reveal } from "@/components/ui/reveal";

export function BestSellers() {
  return (
    <section id="best-sellers" className="container-luxe py-24 md:py-32">
      <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-4">Most Coveted</p>
          <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl md:text-5xl">
            This season&apos;s best sellers
          </h2>
        </div>
        <Link
          href="/shop"
          className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-gold"
        >
          View all
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <div className="mt-14">
        <ProductShowcase products={bestSellers} columns={4} />
      </div>
    </section>
  );
}
