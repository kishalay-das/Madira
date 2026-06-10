"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Box,
  Calendar,
  ChevronRight,
  Crown,
  DollarSign,
  ExternalLink,
  Eye,
  Gift,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  Mail,
  MapPin,
  Package,
  Pencil,
  Sparkles,
  Star,
  Tag,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
  Video,
  X,
} from "lucide-react";
import type { CategorySlug, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Bottle } from "@/components/bottle";
import { Badge } from "@/components/ui/badge";

type Tab = "dashboard" | "products" | "orders" | "customers" | "coupons" | "reviews";

interface AdminData {
  kpis: { revenue: number; orders: number; customers: number; aov: number };
  topCategories: { c: string; pct: number; hue: string }[];
  products: {
    id: string;
    slug: string;
    name: string;
    distillery: string;
    categoryLabel: string;
    price: number;
    stock: number;
    palette: { glass: string; liquid: string; label: string };
    category: string;
    images?: string[];
  }[];
  orders: {
    id: string;
    number: string;
    customer: string;
    customerEmail: string;
    total: number;
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    status: string;
    statusLabel: string;
    deliverySlot: string;
    paymentMethod: string;
    codFee: number;
    giftWrap: boolean;
    date: string;
    couponCode: string | null;
    address: string | null;
    items: { name: string; slug: string; quantity: number; unitPrice: number }[];
  }[];
  customers: {
    id: string;
    name: string;
    email: string;
    tier: string;
    loyaltyPoints: number;
    referralCode: string;
    memberSince: string;
    orders: number;
    spend: number;
    addresses: { label: string; line: string }[];
    recentOrders: {
      number: string;
      total: number;
      statusLabel: string;
      date: string;
    }[];
  }[];
  coupons: {
    id: string;
    code: string;
    description: string;
    percentOff: number | null;
    amountOff: number | null;
    active: boolean;
    expiresAt: string | null;
    redemptions: number;
  }[];
  reviews: {
    id: string;
    product: string;
    productSlug: string;
    author: string;
    rating: number;
    title: string;
    body: string;
    verified: boolean;
    date: string;
  }[];
  categoryOptions: { slug: string; name: string }[];
}

type AdminOrder = AdminData["orders"][number];
type AdminCustomer = AdminData["customers"][number];
type AdminCoupon = AdminData["coupons"][number];
type AdminReview = AdminData["reviews"][number];

const nav: { id: Tab; label: string; Icon: typeof Box }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "products", label: "Products", Icon: Package },
  { id: "orders", label: "Orders", Icon: Box },
  { id: "customers", label: "Customers", Icon: Users },
  { id: "coupons", label: "Coupons", Icon: Tag },
  { id: "reviews", label: "Reviews", Icon: Star },
];

const ORDER_STATUSES = ["PENDING", "PROCESSING", "IN_TRANSIT", "DELIVERED", "CANCELLED"];
const PAYMENT_LABELS: Record<string, string> = {
  card: "Credit Card",
  wallet: "Apple / Google Pay",
  cod: "Cash on Delivery",
};
const statusTone: Record<string, string> = {
  DELIVERED: "text-emerald",
  PROCESSING: "text-gold",
  IN_TRANSIT: "text-[#7fbfff]",
  PENDING: "text-muted",
  CANCELLED: "text-burgundy",
};

export function AdminClient({ data }: { data: AdminData }) {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen">
      <div className="container-luxe grid grid-cols-1 gap-8 py-12 lg:grid-cols-[230px_1fr]">
        <aside>
          <div className="glass-dark rounded-[var(--radius-luxe)] p-4 lg:sticky lg:top-28 lg:p-5">
            <p className="px-3 pb-4 font-display text-lg tracking-[0.2em] text-cream">
              NOCTURNE
              <span className="block text-[0.55rem] tracking-[0.3em] text-gold">ADMIN CONSOLE</span>
            </p>
            <nav className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:gap-0 lg:space-y-1 lg:overflow-visible">
              {nav.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm transition-colors lg:w-full lg:gap-3 ${
                    tab === id
                      ? "bg-gold/10 text-gold"
                      : "text-parchment hover:bg-[var(--hover-soft)] hover:text-cream"
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </nav>

            {/* Jump to the live storefront (opens in a new tab so the
                console stays open). */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-hairline px-4 py-3 text-sm text-parchment transition-colors hover:border-gold/40 hover:bg-[var(--hover-soft)] hover:text-gold lg:mt-4 lg:justify-start"
            >
              <ExternalLink size={16} /> View Store
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          {tab === "dashboard" && <Dashboard data={data} />}
          {tab === "products" && <Products data={data} />}
          {tab === "orders" && <Orders data={data} />}
          {tab === "customers" && <Customers data={data} />}
          {tab === "coupons" && <Coupons data={data} />}
          {tab === "reviews" && <Reviews data={data} />}
        </div>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-dark rounded-[var(--radius-luxe)] p-6 ${className}`}>{children}</div>;
}

const LOW_STOCK_THRESHOLD = 8;

function Dashboard({ data }: { data: AdminData }) {
  const { kpis, topCategories } = data;
  const kpiCards = [
    { label: "Revenue", value: formatPrice(kpis.revenue), Icon: DollarSign },
    { label: "Orders", value: String(kpis.orders), Icon: Box },
    { label: "Customers", value: String(kpis.customers), Icon: Users },
    { label: "Avg. Order Value", value: formatPrice(kpis.aov), Icon: TrendingUp },
  ];
  const lowStock = data.products
    .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted">Live performance · powered by PostgreSQL</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((k) => (
          <Panel key={k.label} className="!p-5">
            <k.Icon size={18} className="text-gold" />
            <p className="mt-3 font-display text-2xl text-cream">{k.value}</p>
            <p className="text-xs text-muted">{k.label}</p>
          </Panel>
        ))}
      </div>

      <Panel>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg text-cream">Catalog by Category</h2>
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <BarChart3 size={14} className="text-gold" /> share of products
          </span>
        </div>
        <ul className="space-y-4">
          {topCategories.map((r) => (
            <li key={r.c}>
              <div className="flex justify-between text-xs">
                <span className="text-parchment">{r.c}</span>
                <span className="text-muted">{r.pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-graphite">
                <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.hue }} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Low-stock alerts */}
      <Panel>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg text-cream">Low Stock</h2>
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <Package size={14} className="text-gold" /> at or below {LOW_STOCK_THRESHOLD} units
          </span>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-sm text-emerald">Everything is well stocked.</p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-hairline)]">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm text-cream">{p.name}</span>
                  <span className="block truncate text-xs text-muted">{p.categoryLabel}</span>
                </span>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
                    p.stock === 0
                      ? "border-burgundy/50 text-burgundy"
                      : "border-warning/40 text-warning"
                  }`}
                >
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Products({ data }: { data: AdminData }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | Product | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    setBusy(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Delete failed.");
    }
    setBusy(null);
    router.refresh();
  }

  async function openEdit(slug: string) {
    setLoadingEdit(slug);
    try {
      const res = await fetch(`/api/products/${slug}`);
      if (res.ok) {
        const { product } = await res.json();
        setModal(product as Product);
      } else {
        alert("Could not load product.");
      }
    } finally {
      setLoadingEdit(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Product Inventory</h1>
        <button
          onClick={() => setModal("create")}
          className="h-10 rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 text-sm font-medium text-ink"
        >
          + Add Product
        </button>
      </div>

      <Panel className="!p-0 overflow-hidden">
        <div className="divide-y divide-[color:var(--color-hairline)]">
          {data.products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-4 hover:bg-[var(--hover-soft)]">
              <div className="h-12 w-9 shrink-0">
                <Bottle product={{ ...p, category: p.category as CategorySlug, distillery: p.distillery }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-cream">{p.name}</p>
                <p className="truncate text-xs text-muted">{p.categoryLabel}</p>
              </div>
              <span className="hidden text-sm text-cream sm:block">{formatPrice(p.price)}</span>
              <span className={`hidden w-20 text-right text-xs sm:block ${p.stock <= 8 ? "text-burgundy" : "text-emerald"}`}>
                {p.stock} in stock
              </span>
              <button
                onClick={() => openEdit(p.slug)}
                disabled={loadingEdit === p.slug}
                aria-label={`Edit ${p.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-gold"
              >
                {loadingEdit === p.slug ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={15} />}
              </button>
              <button
                onClick={() => remove(p.id)}
                disabled={busy === p.id}
                aria-label={`Delete ${p.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-burgundy"
              >
                {busy === p.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          ))}
        </div>
      </Panel>

      {modal && (
        <ProductModal
          categories={data.categoryOptions}
          editing={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

const BADGES = ["", "Best Seller", "Limited", "New", "Rare", "Award Winner"];
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

async function uploadToCloudinary(file: File): Promise<{ url: string; resourceType: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || "Upload failed.");
  }
  return res.json();
}

const csvToArray = (s: string) =>
  s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

function ProductModal({
  categories,
  editing,
  onClose,
  onSaved,
}: {
  categories: { slug: string; name: string }[];
  editing: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState(() => ({
    name: editing?.name ?? "",
    categorySlug: editing?.category ?? categories[0]?.slug ?? "",
    distillery: editing?.distillery ?? "",
    price: editing ? String(editing.price) : "",
    compareAt: editing?.compareAt != null ? String(editing.compareAt) : "",
    stock: editing ? String(editing.stock) : "10",
    abv: editing ? String(editing.abv) : "40",
    volume: editing?.volume ?? "700ml",
    origin: editing?.origin ?? "",
    age: editing?.age ?? "",
    badge: editing?.badge ?? "",
    description: editing?.description ?? "",
    noseNote: editing?.tasting.nose ?? "",
    palateNote: editing?.tasting.palate ?? "",
    finishNote: editing?.tasting.finish ?? "",
    tags: editing?.tags.join(", ") ?? "",
    notes: editing?.notes.join(", ") ?? "",
    pairings: editing?.pairings.join(", ") ?? "",
    paletteGlass: editing?.palette.glass ?? "#2a160c",
    paletteLiquid: editing?.palette.liquid ?? "#a8521a",
    paletteLabel: editing?.palette.label ?? "#e9d8a6",
  }));
  const [images, setImages] = useState<string[]>(editing?.images ?? []);
  const [video, setVideo] = useState<string | null>(editing?.video ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Each image must be under 5MB.");
      return;
    }
    if (images.length >= MAX_IMAGES) return;
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file);
      setImages((prev) => (prev.length >= MAX_IMAGES ? prev : [...prev, url]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError("Video must be under 100MB.");
      return;
    }
    setUploadingVideo(true);
    try {
      const { url } = await uploadToCloudinary(file);
      setVideo(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      name: f.name,
      categorySlug: f.categorySlug,
      distillery: f.distillery || undefined,
      price: Number(f.price),
      compareAt: f.compareAt ? Number(f.compareAt) : undefined,
      stock: Number(f.stock || 0),
      abv: f.abv ? Number(f.abv) : undefined,
      volume: f.volume || undefined,
      origin: f.origin || undefined,
      age: f.age || undefined,
      badge: f.badge || undefined,
      description: f.description || undefined,
      noseNote: f.noseNote || undefined,
      palateNote: f.palateNote || undefined,
      finishNote: f.finishNote || undefined,
      tags: csvToArray(f.tags),
      notes: csvToArray(f.notes),
      pairings: csvToArray(f.pairings),
      paletteGlass: f.paletteGlass,
      paletteLiquid: f.paletteLiquid,
      paletteLabel: f.paletteLabel,
      images,
      video,
    };
    const res = await fetch(
      editing ? `/api/admin/products/${editing.id}` : "/api/admin/products",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (res.ok) onSaved();
    else {
      const d = await res.json().catch(() => ({}));
      const issues = d.issues as Record<string, string[]> | undefined;
      setError(
        (issues && Object.values(issues).flat().find(Boolean)) ||
          d.error ||
          (editing ? "Could not update product." : "Could not create product.")
      );
    }
  }

  const previewProduct = {
    name: f.name || "Product",
    category: f.categorySlug as never,
    distillery: f.distillery,
    images,
    palette: { glass: f.paletteGlass, liquid: f.paletteLiquid, label: f.paletteLabel },
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-[var(--scrim)] backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="glass-dark relative z-10 my-6 w-full max-w-2xl rounded-[var(--radius-luxe)] p-6 md:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">
            {editing ? "Edit Product" : "New Product"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} className="text-parchment hover:text-cream" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_180px]">
          <div className="space-y-6">
            <FormGroup title="Basics">
              <AdminField label="Name" value={f.name} onChange={(v) => set("name", v)} placeholder="Lagavulin 16" required />
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Category"
                  value={f.categorySlug}
                  onChange={(v) => set("categorySlug", v)}
                  options={categories.map((c) => ({ value: c.slug, label: c.name }))}
                />
                <SelectField
                  label="Badge"
                  value={f.badge}
                  onChange={(v) => set("badge", v)}
                  options={BADGES.map((b) => ({ value: b, label: b || "None" }))}
                />
              </div>
              <AdminField label="Distillery / Maker" value={f.distillery} onChange={(v) => set("distillery", v)} placeholder="Lagavulin" />
            </FormGroup>

            <FormGroup title="Pricing & Stock">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <AdminField label="Price (USD)" value={f.price} onChange={(v) => set("price", v)} placeholder="120" type="number" required />
                <AdminField label="Compare at" value={f.compareAt} onChange={(v) => set("compareAt", v)} placeholder="150" type="number" />
                <AdminField label="Stock" value={f.stock} onChange={(v) => set("stock", v)} placeholder="10" type="number" />
                <AdminField label="ABV %" value={f.abv} onChange={(v) => set("abv", v)} placeholder="43" type="number" />
              </div>
            </FormGroup>

            <FormGroup title="Details">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <AdminField label="Volume" value={f.volume} onChange={(v) => set("volume", v)} placeholder="700ml" />
                <AdminField label="Origin" value={f.origin} onChange={(v) => set("origin", v)} placeholder="Islay, Scotland" />
                <AdminField label="Age" value={f.age} onChange={(v) => set("age", v)} placeholder="16 Years" />
              </div>
              <TextAreaField label="Description" value={f.description} onChange={(v) => set("description", v)} placeholder="A peated single malt…" />
            </FormGroup>

            <FormGroup title="Tasting Notes">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <AdminField label="Nose" value={f.noseNote} onChange={(v) => set("noseNote", v)} placeholder="Peat smoke, brine" />
                <AdminField label="Palate" value={f.palateNote} onChange={(v) => set("palateNote", v)} placeholder="Iodine, dried fruit" />
                <AdminField label="Finish" value={f.finishNote} onChange={(v) => set("finishNote", v)} placeholder="Long, smoky" />
              </div>
            </FormGroup>

            <FormGroup title="Lists (comma separated)">
              <AdminField label="Flavour notes" value={f.notes} onChange={(v) => set("notes", v)} placeholder="Smoke, Brine, Vanilla" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AdminField label="Tags" value={f.tags} onChange={(v) => set("tags", v)} placeholder="Peated, Collector" />
                <AdminField label="Food pairings" value={f.pairings} onChange={(v) => set("pairings", v)} placeholder="Oysters, Blue cheese" />
              </div>
            </FormGroup>
          </div>

          {/* Appearance: image gallery (up to 5) + procedural fallback preview */}
          <div className="space-y-4">
            <p className="text-[0.62rem] uppercase tracking-widest text-gold">Preview</p>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-hairline bg-night/40">
              <div className="absolute inset-0 flex items-center justify-center p-3">
                <Bottle product={previewProduct} />
              </div>
            </div>

            <p className="text-[0.62rem] uppercase tracking-widest text-gold">
              Images ({images.length}/{MAX_IMAGES})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] overflow-hidden rounded-lg border border-hairline bg-cover bg-center"
                  style={{ backgroundImage: `url("${src}")` }}
                >
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-night/80 text-parchment hover:text-burgundy"
                  >
                    <X size={12} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-night/80 px-1.5 py-0.5 text-[0.5rem] uppercase tracking-wide text-gold">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label
                  className={`flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hairline text-muted transition-colors ${
                    uploading ? "opacity-60" : "cursor-pointer hover:border-gold/40 hover:text-gold"
                  }`}
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ImagePlus size={16} />
                  )}
                  <span className="text-[0.5rem] uppercase tracking-wide">
                    {uploading ? "Uploading" : "Add"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFile}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[0.6rem] text-muted">
              JPG/PNG ≤5MB → Cloudinary. First image is the cover. Empty →
              procedural bottle.
            </p>

            {/* Video */}
            <p className="pt-2 text-[0.62rem] uppercase tracking-widest text-gold">
              Video {video ? "" : "(optional)"}
            </p>
            {video ? (
              <div className="relative overflow-hidden rounded-xl border border-hairline">
                <video
                  src={video}
                  controls
                  playsInline
                  className="aspect-video w-full bg-night object-cover"
                />
                <button
                  type="button"
                  onClick={() => setVideo(null)}
                  aria-label="Remove video"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-night/80 text-parchment hover:text-burgundy"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                className={`flex items-center justify-center gap-2 rounded-xl border border-dashed border-hairline px-3 py-3 text-xs text-muted transition-colors ${
                  uploadingVideo ? "opacity-60" : "cursor-pointer hover:border-gold/40 hover:text-gold"
                }`}
              >
                {uploadingVideo ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Video size={15} />
                )}
                {uploadingVideo ? "Uploading & compressing…" : "Upload video"}
                <input
                  type="file"
                  accept="video/*"
                  onChange={onVideo}
                  disabled={uploadingVideo}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-[0.6rem] text-muted">MP4/MOV ≤100MB → compressed by Cloudinary.</p>

            <p className="pt-2 text-[0.62rem] uppercase tracking-widest text-gold">Bottle palette</p>
            <div className="grid grid-cols-3 gap-2">
              <ColorField label="Glass" value={f.paletteGlass} onChange={(v) => set("paletteGlass", v)} />
              <ColorField label="Liquid" value={f.paletteLiquid} onChange={(v) => set("paletteLiquid", v)} />
              <ColorField label="Label" value={f.paletteLabel} onChange={(v) => set("paletteLabel", v)} />
            </div>
          </div>
        </div>

        {error && <p className="mt-5 text-xs text-burgundy">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-full border border-hairline text-sm text-parchment hover:text-cream"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-bright to-gold text-sm font-medium text-ink disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {editing ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[0.62rem] uppercase tracking-widest text-gold">{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-widest text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-hairline bg-night px-3 text-sm text-cream focus:border-gold focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-night">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-widest text-muted">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-hairline bg-night/60 px-4 py-3 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.55rem] uppercase tracking-widest text-muted">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full cursor-pointer rounded-lg border border-hairline bg-night"
      />
    </label>
  );
}

function Orders({ data }: { data: AdminData }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrder | null>(null);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    router.refresh();
  }

  // Keep the open detail view in sync after a status change / refresh.
  const live = detail ? data.orders.find((o) => o.id === detail.id) ?? null : null;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Orders</h1>
      <Panel className="!p-0 overflow-hidden">
        {data.orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No orders yet.</p>
        ) : (
          <div className="divide-y divide-[color:var(--color-hairline)]">
            {data.orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center gap-3 p-4 hover:bg-[var(--hover-soft)]">
                <button
                  onClick={() => setDetail(o)}
                  className="group flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-label={`View order ${o.number}`}
                >
                  <span className="min-w-0">
                    <span className="block font-display text-sm text-cream group-hover:text-gold">
                      {o.number}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {o.customer} · {o.date}
                    </span>
                  </span>
                </button>
                <span className="font-display text-sm text-cream">{formatPrice(o.total)}</span>
                <span className={`hidden text-xs sm:block ${statusTone[o.status]}`}>● {o.statusLabel}</span>
                <button
                  onClick={() => setDetail(o)}
                  aria-label={`View order ${o.number} details`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-gold"
                >
                  <Eye size={15} />
                </button>
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  disabled={busy === o.id}
                  className="h-9 rounded-full border border-hairline bg-night px-3 text-xs text-cream focus:border-gold focus:outline-none"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-night">
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {live && (
        <OrderDetailModal
          order={live}
          busy={busy === live.id}
          onStatus={(status) => setStatus(live.id, status)}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  busy,
  onStatus,
  onClose,
}: {
  order: AdminOrder;
  busy: boolean;
  onStatus: (status: string) => void;
  onClose: () => void;
}) {
  return (
    <DetailModal
      title={order.number}
      subtitle={`Placed ${order.date}`}
      onClose={onClose}
    >
      {/* Status changer */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-night/40 p-4">
        <span className={`text-sm ${statusTone[order.status]}`}>● {order.statusLabel}</span>
        <select
          value={order.status}
          onChange={(e) => onStatus(e.target.value)}
          disabled={busy}
          className="h-9 rounded-full border border-hairline bg-night px-3 text-xs text-cream focus:border-gold focus:outline-none"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-night">
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Customer */}
      <DetailRow Icon={Users} label="Customer">
        <p className="text-sm text-cream">{order.customer}</p>
        {order.customerEmail && <p className="text-xs text-muted">{order.customerEmail}</p>}
      </DetailRow>

      {/* Delivery */}
      <DetailRow Icon={MapPin} label="Delivery">
        <p className="text-sm text-cream">{order.deliverySlot}</p>
        <p className="text-xs text-muted">{order.address ?? "No address on file"}</p>
        {order.giftWrap && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-gold">
            <Gift size={12} /> Gift wrapped
          </p>
        )}
      </DetailRow>

      <DetailRow Icon={DollarSign} label="Payment">
        <p className="text-sm text-cream">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
        {order.paymentMethod === "cod" && (
          <p className="text-xs text-muted">Collect {formatPrice(order.total)} in cash on delivery</p>
        )}
      </DetailRow>

      {order.couponCode && (
        <DetailRow Icon={Ticket} label="Coupon">
          <span className="font-mono text-sm text-gold">{order.couponCode}</span>
        </DetailRow>
      )}

      {/* Items */}
      <div className="mt-5">
        <p className="mb-2 text-[0.62rem] uppercase tracking-widest text-muted">
          Items ({order.items.length})
        </p>
        <ul className="divide-y divide-[color:var(--color-hairline)] rounded-xl border border-hairline">
          {order.items.map((it, i) => (
            <li key={`${it.slug}-${i}`} className="flex items-center justify-between gap-3 p-3">
              <span className="min-w-0">
                <span className="block truncate text-sm text-cream">{it.name}</span>
                <span className="block text-xs text-muted">
                  {it.quantity} × {formatPrice(it.unitPrice)}
                </span>
              </span>
              <span className="font-display text-sm text-cream">
                {formatPrice(it.unitPrice * it.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Totals */}
      <dl className="mt-5 space-y-1.5 rounded-xl border border-hairline bg-night/40 p-4 text-sm">
        <Money label="Subtotal" value={order.subtotal} />
        {order.discount > 0 && <Money label="Discount" value={-order.discount} accent />}
        <Money label="Shipping" value={order.shipping} />
        {order.codFee > 0 && <Money label="Cash on delivery" value={order.codFee} />}
        <Money label="Tax" value={order.tax} />
        <div className="mt-1 border-t border-hairline pt-2">
          <Money label="Total" value={order.total} bold />
        </div>
      </dl>
    </DetailModal>
  );
}

function Customers({ data }: { data: AdminData }) {
  const [detail, setDetail] = useState<AdminCustomer | null>(null);
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const filtered = term
    ? data.customers.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
      )
    : data.customers;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">
          Customers <span className="text-base text-muted">({data.customers.length})</span>
        </h1>
        <label className="relative">
          <Users size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="h-10 w-full rounded-full border border-hairline bg-night/60 pl-9 pr-4 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none sm:w-72"
          />
        </label>
      </div>
      {data.customers.length === 0 ? (
        <Panel><p className="text-sm text-muted">No customers yet.</p></Panel>
      ) : filtered.length === 0 ? (
        <Panel><p className="text-sm text-muted">No customers match “{query.trim()}”.</p></Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setDetail(c)}
              className="group glass-dark rounded-[var(--radius-luxe)] p-6 text-left transition-colors hover:border-gold/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-burgundy/40 font-display text-cream">
                    {c.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-cream group-hover:text-gold">{c.name}</p>
                    <p className="text-xs text-gold">{c.tier} Member</p>
                  </div>
                </div>
                <Badge tone="Best Seller">{`${c.orders} orders`}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted">
                  Lifetime value{" "}
                  <span className="font-display text-cream">{formatPrice(c.spend)}</span>
                </p>
                <ChevronRight size={16} className="text-muted-2 transition-colors group-hover:text-gold" />
              </div>
            </button>
          ))}
        </div>
      )}

      {detail && (
        <CustomerDetailModal customer={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}

function CustomerDetailModal({
  customer,
  onClose,
}: {
  customer: AdminCustomer;
  onClose: () => void;
}) {
  return (
    <DetailModal title={customer.name} subtitle={customer.email} onClose={onClose}>
      {/* Profile chips */}
      <div className="grid grid-cols-2 gap-3">
        <ProfileStat Icon={Crown} label="Tier" value={`${customer.tier} Member`} />
        <ProfileStat Icon={Calendar} label="Member since" value={customer.memberSince} />
        <ProfileStat Icon={Sparkles} label="Loyalty points" value={customer.loyaltyPoints.toLocaleString()} />
        <ProfileStat Icon={DollarSign} label="Lifetime value" value={formatPrice(customer.spend)} />
      </div>

      <DetailRow Icon={Mail} label="Email">
        <p className="break-all text-sm text-cream">{customer.email}</p>
      </DetailRow>
      <DetailRow Icon={Ticket} label="Referral code">
        <span className="font-mono text-sm text-gold">
          {customer.referralCode.slice(0, 8).toUpperCase()}
        </span>
      </DetailRow>

      {/* Addresses */}
      {customer.addresses.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-[0.62rem] uppercase tracking-widest text-muted">Addresses</p>
          <ul className="space-y-2">
            {customer.addresses.map((a, i) => (
              <li key={i} className="rounded-xl border border-hairline bg-night/40 p-3">
                <p className="text-sm text-cream">{a.label}</p>
                <p className="text-xs text-muted">{a.line}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Orders */}
      <div className="mt-5">
        <p className="mb-2 text-[0.62rem] uppercase tracking-widest text-muted">
          Orders ({customer.orders})
        </p>
        {customer.recentOrders.length === 0 ? (
          <p className="text-xs text-muted">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-hairline)] rounded-xl border border-hairline">
            {customer.recentOrders.map((o) => (
              <li key={o.number} className="flex items-center justify-between gap-3 p-3">
                <span className="min-w-0">
                  <span className="block font-display text-sm text-cream">{o.number}</span>
                  <span className="block text-xs text-muted">
                    {o.date} · {o.statusLabel}
                  </span>
                </span>
                <span className="font-display text-sm text-cream">{formatPrice(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DetailModal>
  );
}

function Coupons({ data }: { data: AdminData }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | AdminCoupon | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleActive(c: AdminCoupon) {
    setBusy(c.id);
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    setBusy(null);
    router.refresh();
  }

  async function remove(c: AdminCoupon) {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    setBusy(c.id);
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Delete failed.");
    }
    setBusy(null);
    router.refresh();
  }

  const discountLabel = (c: AdminCoupon) =>
    c.percentOff != null && c.percentOff > 0
      ? `${c.percentOff}% off`
      : c.amountOff != null && c.amountOff > 0
      ? `${formatPrice(c.amountOff)} off`
      : "Promo";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Coupons</h1>
        <button
          onClick={() => setModal("create")}
          className="h-10 rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 text-sm font-medium text-ink"
        >
          + Add Coupon
        </button>
      </div>

      {data.coupons.length === 0 ? (
        <Panel><p className="text-sm text-muted">No coupons yet.</p></Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.coupons.map((c) => (
            <Panel key={c.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-lg border border-dashed border-gold/40 px-3 py-1 font-mono text-sm text-gold">
                  {c.code}
                </span>
                <span className={`text-xs ${c.active ? "text-emerald" : "text-muted"}`}>
                  {c.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-3 font-display text-cream">{discountLabel(c)}</p>
              <p className="mt-1 text-sm text-parchment">{c.description}</p>
              <p className="mt-1 text-xs text-muted">
                {c.redemptions.toLocaleString()} redemptions
                {c.expiresAt ? ` · expires ${c.expiresAt}` : ""}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => toggleActive(c)}
                  disabled={busy === c.id}
                  className="flex-1 rounded-full border border-hairline px-3 py-2 text-xs text-parchment transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-60"
                >
                  {c.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setModal(c)}
                  aria-label={`Edit ${c.code}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-gold"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => remove(c)}
                  disabled={busy === c.id}
                  aria-label={`Delete ${c.code}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-burgundy"
                >
                  {busy === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {modal && (
        <CouponModal
          editing={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function CouponModal({
  editing,
  onClose,
  onSaved,
}: {
  editing: AdminCoupon | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [code, setCode] = useState(editing?.code ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [discountType, setDiscountType] = useState<"percent" | "amount">(
    editing?.amountOff != null ? "amount" : "percent"
  );
  const [value, setValue] = useState(
    editing?.amountOff != null
      ? String(editing.amountOff)
      : editing?.percentOff != null
      ? String(editing.percentOff)
      : ""
  );
  const [active, setActive] = useState(editing?.active ?? true);
  const [expiresAt, setExpiresAt] = useState(editing?.expiresAt ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const num = Number(value);
    const payload: Record<string, unknown> = {
      description: description || null,
      percentOff:
        discountType === "percent" && Number.isFinite(num) ? Math.round(num) : null,
      amountOff: discountType === "amount" && Number.isFinite(num) ? num : null,
      active,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    };
    const res = editing
      ? await fetch(`/api/admin/coupons/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, ...payload }),
        });
    setSaving(false);
    if (res.ok) onSaved();
    else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not save coupon.");
    }
  }

  return (
    <DetailModal title={editing ? `Edit ${editing.code}` : "New Coupon"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {!editing && (
          <AdminField
            label="Code"
            value={code}
            onChange={(v) => setCode(v.toUpperCase())}
            placeholder="WELCOME10"
            required
          />
        )}
        <AdminField
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="10% off your first order"
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[0.62rem] uppercase tracking-widest text-muted">
              Discount type
            </span>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percent" | "amount")}
              className="h-11 w-full rounded-xl border border-hairline bg-night/60 px-3 text-sm text-cream focus:border-gold focus:outline-none"
            >
              <option value="percent" className="bg-night">Percent (%)</option>
              <option value="amount" className="bg-night">Fixed ($)</option>
            </select>
          </label>
          <AdminField
            label={discountType === "percent" ? "Percent off" : "Amount off"}
            value={value}
            onChange={setValue}
            type="number"
            placeholder={discountType === "percent" ? "10" : "25"}
          />
        </div>
        <AdminField
          label="Expires (optional)"
          value={expiresAt}
          onChange={setExpiresAt}
          type="date"
        />
        <label className="flex items-center gap-2 text-sm text-parchment">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-gold)]"
          />
          Active
        </label>
        {error && <p className="text-xs text-burgundy">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-bright to-gold text-sm font-medium text-ink disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {editing ? "Save changes" : "Create coupon"}
        </button>
      </form>
    </DetailModal>
  );
}

function Reviews({ data }: { data: AdminData }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(r: AdminReview) {
    if (!confirm("Delete this review? The product rating will be recalculated.")) return;
    setBusy(r.id);
    const res = await fetch(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Delete failed.");
    }
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Reviews</h1>
      <Panel className="!p-0 overflow-hidden">
        {data.reviews.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No reviews yet.</p>
        ) : (
          <div className="divide-y divide-[color:var(--color-hairline)]">
            {data.reviews.map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-4 hover:bg-[var(--hover-soft)]">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-gold">
                      <Star size={12} className="fill-gold" /> {r.rating}
                    </span>
                    <span className="truncate text-sm text-cream">{r.title}</span>
                    {r.verified && <Badge tone="Best Seller">Verified</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{r.body}</p>
                  <p className="mt-1 text-[0.7rem] text-muted-2">
                    {r.author} · {r.product} · {r.date}
                  </p>
                </div>
                <button
                  onClick={() => remove(r)}
                  disabled={busy === r.id}
                  aria-label="Delete review"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-burgundy"
                >
                  {busy === r.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ---------- Shared detail-view primitives ---------- */

function DetailModal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm" onClick={onClose} />
      <div className="glass-dark relative z-10 my-auto w-full max-w-lg rounded-[var(--radius-luxe)] p-6 sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-xl text-cream">{title}</h2>
            {subtitle && <p className="mt-1 truncate text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline text-parchment transition-colors hover:border-gold/40 hover:text-cream"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  Icon,
  label,
  children,
}: {
  Icon: typeof Box;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline text-gold">
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.62rem] uppercase tracking-widest text-muted">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function ProfileStat({
  Icon,
  label,
  value,
}: {
  Icon: typeof Box;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-night/40 p-3">
      <Icon size={14} className="text-gold" />
      <p className="mt-2 font-display text-sm text-cream">{value}</p>
      <p className="text-[0.62rem] uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}

function Money({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: number;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "text-cream" : "text-muted"}>{label}</span>
      <span
        className={
          bold
            ? "font-display text-base text-cream"
            : accent
            ? "text-emerald"
            : "text-parchment"
        }
      >
        {value < 0 ? `−${formatPrice(Math.abs(value))}` : formatPrice(value)}
      </span>
    </div>
  );
}

function AdminField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-widest text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-hairline bg-night/60 px-4 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
      />
    </label>
  );
}
