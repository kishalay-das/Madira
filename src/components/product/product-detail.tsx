"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Play,
  Plus,
  RotateCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Gift,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Bottle } from "@/components/bottle";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import { ReviewsPanel, type ProductReview } from "./reviews-panel";
import { useCart } from "@/store/cart";

type Tab = "tasting" | "details" | "pairings" | "reviews";

export function ProductDetail({
  product,
  related,
  reviews,
  wishlisted = false,
  isAuthed = false,
}: {
  product: Product;
  related: Product[];
  reviews: ProductReview[];
  wishlisted?: boolean;
  isAuthed?: boolean;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("tasting");
  const [wished, setWished] = useState(wishlisted);
  const [wishBusy, setWishBusy] = useState(false);
  const [angle, setAngle] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const outOfStock = product.stock <= 0;

  async function toggleWishlist() {
    if (!isAuthed) {
      router.push(`/login?callbackUrl=/product/${product.slug}`);
      return;
    }
    setWishBusy(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: product.slug }),
      });
      if (res.ok) {
        const data = await res.json();
        setWished(data.wishlisted);
      }
    } finally {
      setWishBusy(false);
    }
  }

  const onDown = (x: number) => {
    dragging.current = true;
    lastX.current = x;
  };
  const onMove = (x: number) => {
    if (!dragging.current) return;
    setAngle((a) => a + (x - lastX.current) * 0.8);
    lastX.current = x;
  };
  const onUp = () => (dragging.current = false);

  return (
    <div className="container-luxe pb-28 pt-8 lg:pb-24">
      <Link
        href="/shop"
        className="mb-8 inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold"
      >
        <ChevronLeft size={15} /> Back to Collection
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          {(product.images && product.images.length > 0) || product.video ? (
            <ProductGallery
              images={product.images ?? []}
              video={product.video}
              name={product.name}
              badge={product.badge}
            />
          ) : (
          <>
          <div
            className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[var(--radius-luxe)] border border-hairline"
            style={{
              background: `radial-gradient(120% 80% at 50% 0%, ${product.palette.liquid}33, transparent 60%), linear-gradient(180deg, var(--stage-top), var(--stage-bottom))`,
            }}
            onMouseDown={(e) => onDown(e.clientX)}
            onMouseMove={(e) => onMove(e.clientX)}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={(e) => onDown(e.touches[0].clientX)}
            onTouchMove={(e) => onMove(e.touches[0].clientX)}
            onTouchEnd={onUp}
          >
            {product.badge && (
              <div className="absolute left-5 top-5 z-10">
                <Badge tone={product.badge}>{product.badge}</Badge>
              </div>
            )}
            <div
              className="h-[70%] cursor-grab select-none active:cursor-grabbing"
              style={{
                transform: `rotateY(${angle}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <Bottle product={product} className="drop-shadow-[0_40px_50px_rgba(0,0,0,0.7)]" />
            </div>
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-hairline bg-night/70 px-4 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted backdrop-blur-md">
              <RotateCw size={13} className="text-gold" /> Drag to rotate · 360°
            </div>
          </div>

          {/* Thumbnails (angles) */}
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[0, 90, 180, 270].map((a) => (
              <button
                key={a}
                onClick={() => setAngle(a)}
                className="flex aspect-square items-center justify-center rounded-xl border border-hairline bg-night/60 p-3 transition-colors hover:border-gold/40"
              >
                <div className="h-full" style={{ transform: `rotateY(${a}deg)` }}>
                  <Bottle product={product} />
                </div>
              </button>
            ))}
          </div>
          </>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-gold">
            {product.categoryLabel}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-cream md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-muted">
            {product.distillery} · {product.origin}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <Stars value={product.rating} size={16} showValue />
            <span className="text-sm text-muted">{product.reviews} verified reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            {product.compareAt && (
              <span className="text-lg text-muted-2 line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
            <span className="font-display text-3xl text-cream">{formatPrice(product.price)}</span>
            {outOfStock ? (
              <span className="text-xs font-medium uppercase tracking-wide text-burgundy">
                Out of stock
              </span>
            ) : (
              product.stock < 10 && (
                <span className="text-xs text-burgundy">Only {product.stock} left</span>
              )
            )}
          </div>

          <p className="mt-6 leading-relaxed text-parchment/80">{product.description}</p>

          {/* Spec strip */}
          <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hairline sm:grid-cols-4">
            {[
              { k: "ABV", v: product.abv > 0 ? `${product.abv}%` : "—" },
              { k: "Volume", v: product.volume },
              { k: "Age", v: product.age ?? "NAS" },
              { k: "Origin", v: product.origin.split(",")[0] },
            ].map((s) => (
              <div key={s.k} className="bg-night/40 p-4 text-center">
                <dt className="text-[0.58rem] uppercase tracking-widest text-muted">{s.k}</dt>
                <dd className="mt-1 font-display text-cream">{s.v}</dd>
              </div>
            ))}
          </dl>

          {/* Qty + add */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-hairline">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={outOfStock} className="flex h-12 w-12 items-center justify-center text-parchment hover:text-gold disabled:cursor-not-allowed disabled:opacity-40" aria-label="Decrease">
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-display text-lg text-cream">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={outOfStock || qty >= product.stock} className="flex h-12 w-12 items-center justify-center text-parchment hover:text-gold disabled:cursor-not-allowed disabled:opacity-40" aria-label="Increase">
                <Plus size={16} />
              </button>
            </div>
            <Button variant="gold" size="lg" disabled={outOfStock} className="order-last w-full whitespace-nowrap sm:order-0 sm:w-auto sm:flex-1" onClick={() => add(product, qty)}>
              <ShoppingBag size={18} />{" "}
              {outOfStock ? "Out of Stock" : `Add to Cart · ${formatPrice(product.price * qty)}`}
            </Button>
            <button
              onClick={toggleWishlist}
              disabled={wishBusy}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors disabled:opacity-60 ${
                wished
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-gold/40 text-gold hover:bg-gold/10"
              }`}
            >
              <Heart size={18} className={wished ? "fill-current" : ""} />
            </button>
          </div>

          {/* Assurances */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { Icon: ShieldCheck, t: "Authenticated" },
              { Icon: Truck, t: "Concierge delivery" },
              { Icon: Gift, t: "Free gift wrap" },
            ].map(({ Icon, t }) => (
              <div key={t} className="flex items-center gap-2 rounded-xl border border-hairline bg-night/40 px-4 py-3 text-xs text-parchment">
                <Icon size={16} className="text-gold" /> {t}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-10">
            <div className="flex flex-wrap gap-6 border-b border-hairline">
              {(
                [
                  ["tasting", "Tasting Notes"],
                  ["details", "Distillery"],
                  ["pairings", "Food Pairings"],
                  ["reviews", "Reviews"],
                ] as [Tab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`relative pb-3 text-xs uppercase tracking-[0.16em] transition-colors ${
                    tab === key ? "text-gold" : "text-muted hover:text-cream"
                  }`}
                >
                  {label}
                  {tab === key && <span className="absolute -bottom-px left-0 h-px w-full bg-gold" />}
                </button>
              ))}
            </div>

            <div className="pt-6 text-sm leading-relaxed text-parchment/80">
              {tab === "tasting" && (
                <div className="space-y-4">
                  {([["Nose", product.tasting.nose], ["Palate", product.tasting.palate], ["Finish", product.tasting.finish]] as const).map(
                    ([k, v]) => (
                      <div key={k} className="flex gap-4">
                        <span className="w-16 shrink-0 text-[0.62rem] uppercase tracking-widest text-gold">{k}</span>
                        <p>{v}</p>
                      </div>
                    )
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {product.notes.map((n) => (
                      <span key={n} className="rounded-full border border-hairline px-3 py-1 text-xs text-parchment">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tab === "details" && (
                <div className="space-y-3">
                  <p><span className="text-cream">Distillery:</span> {product.distillery}</p>
                  <p><span className="text-cream">Origin:</span> {product.origin}</p>
                  {product.age && <p><span className="text-cream">Maturation:</span> {product.age}</p>}
                  <p>{product.description}</p>
                </div>
              )}
              {tab === "pairings" && (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {product.pairings.map((p) => (
                    <li key={p} className="rounded-xl border border-hairline bg-night/40 p-4 text-center text-cream">
                      {p}
                    </li>
                  ))}
                </ul>
              )}
              {tab === "reviews" && (
                <ReviewsPanel
                  slug={product.slug}
                  reviews={reviews}
                  rating={product.rating}
                  reviewCount={product.reviews}
                  isAuthed={isAuthed}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="mt-28">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-2xl text-cream md:text-3xl">You may also love</h2>
          <Link href="/shop" className="text-xs uppercase tracking-[0.18em] text-gold">View all</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Sticky mobile purchase bar */}
      <div
        className="glass-dark fixed inset-x-0 bottom-0 z-40 border-t border-hairline px-4 pt-3 lg:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted">{product.name}</p>
            <p className="font-display text-lg leading-tight text-cream">
              {formatPrice(product.price * qty)}
            </p>
          </div>
          <Button
            variant="gold"
            size="lg"
            className="ml-auto flex-1"
            onClick={() => add(product, qty)}
          >
            <ShoppingBag size={18} /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProductGallery({
  images,
  video,
  name,
  badge,
}: {
  images: string[];
  video?: string;
  name: string;
  badge?: Product["badge"];
}) {
  // Combined media list — images lead (so the magnifiable cover shows first),
  // with the video (if any) as the last thumbnail.
  const media = [
    ...images.map((src) => ({ type: "image" as const, src })),
    ...(video ? [{ type: "video" as const, src: video }] : []),
  ];
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const current = media[Math.min(active, media.length - 1)];

  // Wrap-around navigation with direction tracking for slide animation.
  function go(dir: 1 | -1) {
    setDirection(dir);
    setActive((a) => (a + dir + media.length) % media.length);
  }

  // Touch-swipe state — only handles touch events, does not interfere with
  // the mouse-based MagnifyImage hover lens.
  const touchStartX = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    go(delta < 0 ? 1 : -1);
  }

  // Slide variants: incoming slides in from the direction of travel, outgoing
  // slides out to the opposite side.
  const EASE = [0.22, 1, 0.36, 1] as const;
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden rounded-luxe border border-hairline bg-[linear-gradient(180deg,var(--stage-top),var(--stage-bottom))]"
        onTouchStart={media.length > 1 ? onTouchStart : undefined}
        onTouchEnd={media.length > 1 ? onTouchEnd : undefined}
      >
        {badge && (
          <div className="absolute left-5 top-5 z-10">
            <Badge tone={badge}>{badge}</Badge>
          </div>
        )}

        {/* Animated media layer */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute inset-0"
          >
            {current.type === "video" ? (
              <video
                src={current.src}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
            ) : (
              <MagnifyImage src={current.src} alt={name} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrow controls */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-night/70 text-cream backdrop-blur-md transition-colors hover:border-gold/40 hover:text-gold"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-night/70 text-cream backdrop-blur-md transition-colors hover:border-gold/40 hover:text-gold"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > active ? 1 : -1);
                setActive(i);
              }}
              aria-label={m.type === "video" ? "Play video" : `View image ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl border bg-cover bg-center transition-colors ${
                active === i ? "border-gold" : "border-hairline hover:border-gold/40"
              }`}
              style={m.type === "image" ? { backgroundImage: `url("${m.src}")` } : undefined}
            >
              {m.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-night/70">
                  <Play size={18} className="text-gold" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Hover magnifier: a circular lens follows the cursor and shows a zoomed,
 * cover-accurate portion of the image (like a magnifying glass). Pointer-only.
 */
function MagnifyImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [lens, setLens] = useState<{
    show: boolean;
    x: number;
    y: number;
    bgPos: string;
    bgSize: string;
  }>({ show: false, x: 0, y: 0, bgPos: "0 0", bgSize: "0 0" });

  const ZOOM = 2.3;
  const LENS = 180;

  // Load the natural dimensions so the lens can replicate object-cover exactly.
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
    const t = setTimeout(() => setLens((l) => ({ ...l, show: false })), 0);
    return () => clearTimeout(t);
  }, [src]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || !nat) return;
    const r = el.getBoundingClientRect();
    const W = r.width;
    const H = r.height;
    const mx = Math.max(0, Math.min(e.clientX - r.left, W));
    const my = Math.max(0, Math.min(e.clientY - r.top, H));

    // object-contain geometry
    const s = Math.min(W / nat.w, H / nat.h);
    const dispW = nat.w * s;
    const dispH = nat.h * s;
    const ox = (W - dispW) / 2;
    const oy = (H - dispH) / 2;
    const fx = (mx - ox) / dispW;
    const fy = (my - oy) / dispH;

    const bgW = dispW * ZOOM;
    const bgH = dispH * ZOOM;
    setLens({
      show: true,
      x: mx - LENS / 2,
      y: my - LENS / 2,
      bgSize: `${bgW}px ${bgH}px`,
      bgPos: `${LENS / 2 - fx * bgW}px ${LENS / 2 - fy * bgH}px`,
    });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setLens((l) => ({ ...l, show: false }))}
      className="absolute inset-0 cursor-zoom-in"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 45vw"
        className="object-contain"
        unoptimized={src.startsWith("data:")}
      />
      {lens.show && nat && (
        <div
          className="pointer-events-none absolute z-20 rounded-full border-2 border-gold/70 shadow-[0_10px_40px_-8px_rgba(0,0,0,0.7)]"
          style={{
            width: LENS,
            height: LENS,
            left: lens.x,
            top: lens.y,
            backgroundImage: `url("${src}")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: lens.bgSize,
            backgroundPosition: lens.bgPos,
          }}
        />
      )}
    </div>
  );
}
