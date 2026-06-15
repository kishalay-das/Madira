import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Package,
  Percent,
  ShieldCheck,
  Star,
  Tag,
  Truck,
  Zap,
} from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { getProducts, getCategories } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bottle } from "@/components/bottle";
import { ProductShowcase } from "@/components/product/product-showcase";

/* ─── helpers ──────────────────────────────────────────────────────────── */

/** Inline gradient stage — mirrors the technique from ProductCard */
function bottleStageStyle(liquidColor: string) {
  return {
    background: `radial-gradient(110% 90% at 50% 100%, ${liquidColor}28, transparent 65%), linear-gradient(180deg, var(--stage-top) 0%, var(--stage-bottom) 100%)`,
  };
}

/* ─── sub-components (server-safe) ─────────────────────────────────────── */

function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="eyebrow mb-2 text-gold">{eyebrow}</p>
        )}
        <h2 className="text-2xl font-semibold leading-tight text-cream md:text-3xl">
          {title}
        </h2>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium uppercase tracking-wider text-gold transition-colors hover:text-gold-bright"
        >
          {linkLabel}
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

/** Deal card — compact, well-staged bottle, price emphasis */
function DealCard({ product }: { product: Product }) {
  const saving =
    product.compareAt && product.compareAt > product.price
      ? product.compareAt - product.price
      : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-[var(--surface)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--card-hover-shadow)]"
    >
      {/* Stage */}
      <div
        className="relative flex h-44 items-end justify-center"
        style={bottleStageStyle(product.palette.liquid)}
      >
        {saving && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-wide text-ink">
            Save {formatPrice(saving)}
          </span>
        )}
        <div className="relative z-10 flex h-36 w-24 items-end justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:scale-[1.06]">
          <Bottle
            product={product}
            className="drop-shadow-[0_16px_24px_rgba(0,0,0,0.45)]"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--surface)] to-transparent" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 px-4 py-4">
        <p className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-gold">
          {product.categoryLabel}
        </p>
        <p className="line-clamp-2 text-sm font-medium leading-snug text-cream group-hover:text-gold-bright">
          {product.name}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          {product.compareAt && (
            <span className="text-xs text-muted-2 line-through">
              {formatPrice(product.compareAt)}
            </span>
          )}
          <span className="text-base font-semibold text-gold">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Category tile — full-bleed gradient top, bottle nicely staged */
function CategoryTile({
  category,
  coverProduct,
}: {
  category: Category;
  coverProduct: Product;
}) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-[var(--surface)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--card-hover-shadow)]"
    >
      {/* Tinted stage using category hue */}
      <div
        className="relative flex h-40 items-end justify-center"
        style={{
          background: `radial-gradient(90% 80% at 50% 100%, ${category.hue}30, transparent 70%), linear-gradient(180deg, var(--stage-top) 0%, var(--stage-bottom) 100%)`,
        }}
      >
        {/* hue blob behind bottle */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full opacity-20 blur-2xl"
          style={{ background: category.hue }}
        />
        <div className="relative z-10 flex h-32 w-20 items-end justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:scale-[1.07]">
          <Bottle
            product={coverProduct}
            className="drop-shadow-[0_14px_22px_rgba(0,0,0,0.45)]"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--surface)] to-transparent" />
      </div>

      {/* Label */}
      <div className="px-4 pb-4 pt-3">
        <p className="text-sm font-semibold text-cream transition-colors group-hover:text-gold">
          {category.name}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {category.count} bottles
        </p>
      </div>
    </Link>
  );
}

/* ─── main component ─────────────────────────────────────────────────────── */

export async function StandardHome() {
  const [products, categories] = await Promise.all([
    getProducts({ segment: "STANDARD" }),
    getCategories(),
  ]);

  const byCat = (slug: string) => products.filter((p) => p.category === slug);

  // Featured strip for the hero — best sellers, falling back to first products.
  const bestSellers = products.filter((p) => p.badge === "Best Seller");
  const heroProducts = (bestSellers.length >= 4 ? bestSellers : products).slice(0, 4);

  const deals = [...products]
    .sort((a, b) => {
      const savA = a.compareAt ? a.compareAt - a.price : 0;
      const savB = b.compareAt ? b.compareAt - b.price : 0;
      return savB - savA || a.price - b.price;
    })
    .slice(0, 6);

  const popular = products
    .slice()
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 8);

  const liveCats = categories
    .map((c) => ({ ...c, items: byCat(c.slug) }))
    .filter((c) => c.items.length > 0);

  // Up to 4 big per-category section rows
  const sectionCats = liveCats.filter((c) => c.items.length >= 4).slice(0, 4);

  return (
    <div className="bg-[var(--background)] text-cream">
      {/* ══════════════════════════════════════════════════════════════
          1. HERO
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[86svh] items-center overflow-hidden border-b border-hairline bg-[image:var(--panel-grad)]">
        {/* subtle tinted mesh behind hero */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, var(--color-gold) 0%, transparent 60%)",
          }}
        />

        <div className="container-luxe relative w-full py-20">
          {/* Centered copy */}
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
              <Truck size={13} />
              Free delivery over {formatPrice(50)}
            </span>

            <h1 className="mt-6 text-hero font-semibold leading-[1.05] tracking-tight text-cream">
              Your everyday <span className="text-gold">bottle shop</span>,
              <br className="hidden sm:block" /> delivered fast.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-parchment">
              Quality beer, wine and spirits at honest, everyday prices. Order by
              2&nbsp;pm for same-day delivery — no markups, no fuss.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/shop" variant="gold" size="lg">
                Shop all products
                <ArrowRight size={16} />
              </Button>
              <Button href="/shop?sort=price-asc" variant="outline" size="lg">
                Browse deals
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs text-muted">
              {[
                { Icon: Clock, label: "Same-day delivery" },
                { Icon: ShieldCheck, label: "21+ verified" },
                { Icon: Tag, label: "Everyday low prices" },
              ].map(({ Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <Icon size={13} className="text-gold" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Featured bottle strip */}
          {heroProducts.length > 0 && (
            <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {heroProducts.map((p) => (
                <DealCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. TRUST / PROMO STRIP
          ══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-[var(--surface)]">
        <div className="container-luxe">
          <div className="grid grid-cols-2 divide-x divide-[color:var(--color-hairline)] md:grid-cols-4">
            {[
              {
                Icon: Truck,
                title: "Free delivery",
                sub: "On orders over " + formatPrice(50),
              },
              { Icon: Clock, title: "Same-day", sub: "Order before 2 pm" },
              {
                Icon: Zap,
                title: "Weekly deals",
                sub: "New offers every Monday",
              },
              {
                Icon: ShieldCheck,
                title: "21+ verified",
                sub: "ID checked at door",
              },
            ].map(({ Icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center gap-3 px-4 py-5 md:px-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-cream">
                    {title}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {sub}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. SHOP BY CATEGORY
          ══════════════════════════════════════════════════════════════ */}
      {liveCats.length > 0 && (
        <section className="container-luxe py-16 md:py-20">
          <SectionHeading
            eyebrow="Browse"
            title="Shop by category"
            href="/shop"
            linkLabel="All products"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {liveCats.map((c) => (
              <CategoryTile
                key={c.slug}
                category={c}
                coverProduct={c.items[0]}
              />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          4. DEALS / BEST VALUE
          ══════════════════════════════════════════════════════════════ */}
      {deals.length > 0 && (
        <section className="border-y border-hairline bg-[var(--surface)]">
          <div className="container-luxe py-16 md:py-20">
            <SectionHeading
              eyebrow="Best value"
              title="Top deals right now"
              href="/shop?sort=price-asc"
              linkLabel="See all deals"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {deals.map((p) => (
                <DealCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          5. POPULAR RIGHT NOW
          ══════════════════════════════════════════════════════════════ */}
      {popular.length > 0 && (
        <section className="container-luxe py-16 md:py-20">
          <SectionHeading
            eyebrow="Trending"
            title="Popular right now"
            href="/shop"
            linkLabel="View all"
          />
          <ProductShowcase products={popular} columns={4} />
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          6. PER-CATEGORY ROWS  (beer / wine / whisky / etc.)
          ══════════════════════════════════════════════════════════════ */}
      {sectionCats.map((c, idx) => (
        <section
          key={c.slug}
          className={
            idx % 2 === 0
              ? "border-t border-hairline bg-[var(--surface)]"
              : "border-t border-hairline"
          }
        >
          <div className="container-luxe py-16 md:py-20">
            <SectionHeading
              eyebrow={c.tagline}
              title={c.name}
              href={`/shop?category=${c.slug}`}
              linkLabel={`All ${c.name.toLowerCase()}`}
            />
            <ProductShowcase products={c.items.slice(0, 4)} columns={4} />
          </div>
        </section>
      ))}

      {/* ══════════════════════════════════════════════════════════════
          7. VALUE PROPS
          ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-hairline bg-[var(--surface)]">
        <div className="container-luxe py-16 md:py-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                Icon: Tag,
                heading: "Everyday low prices",
                body: "Honest pricing, no hidden fees. Great bottles without the luxury markup.",
                accent: "bg-gold/10 text-gold",
              },
              {
                Icon: Package,
                heading: "Fast local delivery",
                body: "Same-day or next-day in most areas, tracked from our warehouse to your door.",
                accent: "bg-gold/10 text-gold",
              },
              {
                Icon: ShieldCheck,
                heading: "Age-verified at the door",
                body: "Every order is ID-checked on delivery so you can shop with total confidence.",
                accent: "bg-gold/10 text-gold",
              },
            ].map(({ Icon, heading, body, accent }) => (
              <div
                key={heading}
                className="flex flex-col gap-4 rounded-2xl border border-hairline bg-[var(--surface-elevated)] p-6 transition-shadow hover:shadow-[var(--card-hover-shadow)]"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${accent}`}
                >
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="mb-2 text-base font-semibold text-cream">
                    {heading}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          8. CLOSING CTA BAND
          ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-hairline bg-[image:var(--panel-grad)]">
        <div className="container-luxe py-20 text-center">
          {/* decorative pill */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            <Percent size={12} />
            {products.length} lines in stock
          </span>

          <h2 className="text-section font-semibold leading-tight text-cream">
            Ready to stock up?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-parchment">
            Beer, wine and spirits at honest prices — all in one place,
            delivered fast.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/shop" variant="gold" size="lg">
              Browse the full range
              <ArrowRight size={16} />
            </Button>
            <Button href="/shop?category=craft-beer" variant="outline" size="lg">
              Explore beer
            </Button>
          </div>

          {/* social proof micro-strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Star size={13} className="fill-gold text-gold" />
              Rated 4.8 · 2 400+ reviews
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck size={13} className="text-gold" />
              Free delivery on orders over {formatPrice(50)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-gold" />
              Safe, age-verified checkout
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
