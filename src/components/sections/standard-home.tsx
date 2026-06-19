import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Package,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tag,
  Truck,
  Zap,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { getProducts, getCategories } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bottle } from "@/components/bottle";
import { ProductShowcase } from "@/components/product/product-showcase";

/* ────────────────────────────────────────────────────────────────────────
   BottleExpress — Standard storefront landing.
   A clean, modern, product-forward layout (accent token renders blue in the
   standard skin). Server component; all sub-parts are server-safe.
   ──────────────────────────────────────────────────────────────────────── */

function stage(liquid: string) {
  return {
    background: `radial-gradient(110% 90% at 50% 100%, ${liquid}28, transparent 65%), linear-gradient(180deg, var(--stage-top) 0%, var(--stage-bottom) 100%)`,
  };
}

function SectionHead({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-cream md:text-3xl">
          {title}
        </h2>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium uppercase tracking-wider text-gold transition-colors hover:text-gold-bright"
        >
          {linkLabel} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

/* ─── Clean product card ──────────────────────────────────────────────── */
function ProductCardLite({ product }: { product: Product }) {
  const saving =
    product.compareAt && product.compareAt > product.price
      ? product.compareAt - product.price
      : null;
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-[var(--surface)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[var(--card-hover-shadow)]"
    >
      <div className="relative flex h-48 items-end justify-center" style={stage(product.palette.liquid)}>
        {saving && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-wide text-ink">
            Save {formatPrice(saving)}
          </span>
        )}
        <div className="relative z-10 flex h-40 w-24 items-end justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:scale-105">
          <Bottle product={product} className="drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--surface)] to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[0.58rem] font-medium uppercase tracking-[0.18em] text-gold">
          {product.categoryLabel}
        </p>
        <p className="line-clamp-2 text-sm font-medium leading-snug text-cream group-hover:text-gold-bright">
          {product.name}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-gold">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <span className="text-xs text-muted-2 line-through">{formatPrice(product.compareAt)}</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[0.7rem] text-muted">
            <Star size={11} className="fill-gold text-gold" />
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Hero spotlight ──────────────────────────────────────────────────── */
function HeroSpotlight({ product }: { product: Product }) {
  return (
    <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-[2rem] border border-hairline bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-elevated)] p-8 lg:min-h-[460px]">
      {/* accent glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: product.palette.liquid }}
      />
      {/* concentric rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.5]">
        <div className="h-72 w-72 rounded-full border border-hairline" />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
        <div className="h-[22rem] w-[22rem] rounded-full border border-hairline" />
      </div>

      {/* main bottle */}
      <div className="relative z-10 flex h-72 w-44 items-end justify-center animate-float lg:h-80">
        <Bottle product={product} className="drop-shadow-[0_30px_50px_rgba(0,0,0,0.55)]" />
      </div>

      {/* free-delivery pill */}
      <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-wide text-gold">
        <Truck size={12} /> Free over {formatPrice(50)}
      </span>

      {/* floating price card */}
      <Link
        href={`/product/${product.slug}`}
        className="group absolute bottom-6 left-6 flex items-center gap-3 rounded-2xl border border-hairline bg-[var(--background)]/80 px-4 py-3 backdrop-blur-md transition-colors hover:border-gold/40"
      >
        <span className="min-w-0">
          <span className="block max-w-[11rem] truncate text-xs text-parchment">{product.name}</span>
          <span className="block text-lg font-semibold text-gold">{formatPrice(product.price)}</span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-transform group-hover:translate-x-0.5">
          <ArrowRight size={15} />
        </span>
      </Link>
    </div>
  );
}

/* ─── main ────────────────────────────────────────────────────────────── */
export async function StandardHome() {
  const [products, categories] = await Promise.all([
    getProducts({ segment: "STANDARD" }),
    getCategories(),
  ]);

  const byCat = (slug: string) => products.filter((p) => p.category === slug);
  const bestSellers = products.filter((p) => p.badge === "Best Seller");
  const hero = (bestSellers[0] ?? products[0]) as Product | undefined;

  const deals = [...products]
    .sort((a, b) => {
      const sa = a.compareAt ? a.compareAt - a.price : 0;
      const sb = b.compareAt ? b.compareAt - b.price : 0;
      return sb - sa || a.price - b.price;
    })
    .slice(0, 5);

  const popular = products
    .slice()
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 8);

  const liveCats = categories
    .map((c) => ({ ...c, items: byCat(c.slug) }))
    .filter((c) => c.items.length > 0);
  const sectionCats = liveCats.filter((c) => c.items.length >= 4).slice(0, 3);

  return (
    <div className="bg-[var(--background)] text-cream">
      {/* ═══ 1 · HERO ════════════════════════════════════════════════ */}
      <section className="container-luxe py-10 md:py-16">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-gold">
              <Zap size={13} /> Same-day delivery
            </span>
            <h1 className="mt-6 text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-cream sm:text-[3.4rem] lg:text-[4rem]">
              Great bottles,
              <br />
              <span className="text-gold">honest prices</span>,
              <br className="hidden sm:block" /> delivered fast.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-parchment">
              Beer, wine and spirits for every occasion — no luxury markup. Order
              before 2&nbsp;pm and we&apos;ll have it at your door today.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/shop" variant="gold" size="lg">
                Shop all products <ArrowRight size={16} />
              </Button>
              <Button href="/shop?sort=price-asc" variant="outline" size="lg">
                Today&apos;s deals
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-muted">
              {[
                { Icon: Clock, label: "Same-day delivery" },
                { Icon: ShieldCheck, label: "21+ verified" },
                { Icon: Tag, label: "Everyday low prices" },
              ].map(({ Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <Icon size={14} className="text-gold" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* spotlight */}
          {hero && <HeroSpotlight product={hero} />}
        </div>

        {/* category chips */}
        {liveCats.length > 0 && (
          <div className="no-scrollbar mt-10 flex gap-2.5 overflow-x-auto pb-1">
            {liveCats.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                className="group flex shrink-0 items-center gap-2 rounded-full border border-hairline bg-[var(--surface)] px-4 py-2.5 text-sm text-parchment transition-colors hover:border-gold/40 hover:text-gold"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: c.hue }} />
                {c.name}
                <span className="text-xs text-muted-2">{c.count}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ═══ 2 · TOP DEALS ═══════════════════════════════════════════ */}
      {deals.length > 0 && (
        <section className="border-y border-hairline bg-[var(--surface)]">
          <div className="container-luxe py-14 md:py-20">
            <SectionHead
              eyebrow="Best value"
              title="Top deals right now"
              href="/shop?sort=price-asc"
              linkLabel="See all deals"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {deals.map((p) => (
                <ProductCardLite key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 3 · HOW IT WORKS ════════════════════════════════════════ */}
      <section className="container-luxe py-14 md:py-20">
        <div className="mb-10 text-center">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold">
            How it works
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-cream md:text-3xl">
            From cart to doorstep in three steps
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              Icon: ShoppingBag,
              title: "Order online",
              body: "Browse beer, wine and spirits and check out in just a couple of minutes.",
            },
            {
              Icon: PackageCheck,
              title: "We pack & verify",
              body: "Your order is carefully packed and prepared for an age-checked handover.",
            },
            {
              Icon: Truck,
              title: "Same-day delivery",
              body: "Order before 2 pm and we'll have it at your door today, fully tracked.",
            },
          ].map(({ Icon, title, body }, i) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-2xl border border-hairline bg-[var(--surface)] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--card-hover-shadow)]"
            >
              <span className="pointer-events-none absolute right-4 top-2 text-6xl font-bold leading-none tracking-tighter text-cream/[0.04]">
                {i + 1}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Icon size={22} />
              </span>
              <h3 className="relative mt-5 text-lg font-semibold text-cream">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 4 · POPULAR ═════════════════════════════════════════════ */}
      {popular.length > 0 && (
        <section className="border-t border-hairline bg-[var(--surface)]">
          <div className="container-luxe py-14 md:py-20">
            <SectionHead
              eyebrow="Trending"
              title="Popular right now"
              href="/shop"
              linkLabel="View all"
            />
            <ProductShowcase products={popular} columns={4} />
          </div>
        </section>
      )}

      {/* ═══ 5 · PER-CATEGORY ROWS ═══════════════════════════════════ */}
      {sectionCats.map((c, idx) => (
        <section
          key={c.slug}
          className={
            idx % 2 === 0
              ? "border-t border-hairline"
              : "border-t border-hairline bg-[var(--surface)]"
          }
        >
          <div className="container-luxe py-14 md:py-20">
            <SectionHead
              eyebrow={c.tagline}
              title={c.name}
              href={`/shop?category=${c.slug}`}
              linkLabel={`All ${c.name.toLowerCase()}`}
            />
            <ProductShowcase products={c.items.slice(0, 4)} columns={4} />
          </div>
        </section>
      ))}

      {/* ═══ 6 · VALUE PROPS ═════════════════════════════════════════ */}
      <section className="border-t border-hairline bg-[var(--surface)]">
        <div className="container-luxe py-14 md:py-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                Icon: Tag,
                heading: "Everyday low prices",
                body: "Honest pricing with no hidden fees — great bottles without the luxury markup.",
              },
              {
                Icon: Package,
                heading: "Fast local delivery",
                body: "Same-day or next-day in most areas, tracked from our warehouse to your door.",
              },
              {
                Icon: ShieldCheck,
                heading: "Age-verified at the door",
                body: "Every order is ID-checked on delivery, so you can shop with total confidence.",
              },
            ].map(({ Icon, heading, body }) => (
              <div
                key={heading}
                className="flex flex-col gap-4 rounded-2xl border border-hairline bg-[var(--surface-elevated)] p-6 transition-shadow hover:shadow-[var(--card-hover-shadow)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="mb-2 text-base font-semibold text-cream">{heading}</h3>
                  <p className="text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7 · CLOSING CTA ═════════════════════════════════════════ */}
      <section className="border-t border-hairline bg-[image:var(--panel-grad)]">
        <div className="container-luxe py-20 text-center md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-gold">
            <Truck size={12} /> {products.length} lines in stock
          </span>
          <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-cream md:text-5xl">
            Ready to stock up?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-parchment">
            Beer, wine and spirits at honest prices — all in one place, delivered
            fast.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/shop" variant="gold" size="lg">
              Browse the full range <ArrowRight size={16} />
            </Button>
            <Button href="/shop?category=craft-beer" variant="outline" size="lg">
              Explore beer
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Star size={13} className="fill-gold text-gold" /> Rated 4.8 · 2,400+ reviews
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck size={13} className="text-gold" /> Free delivery over {formatPrice(50)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-gold" /> Safe, age-verified checkout
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
