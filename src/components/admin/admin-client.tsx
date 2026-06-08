"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Box,
  DollarSign,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  Package,
  Pencil,
  Tag,
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

type Tab = "dashboard" | "products" | "orders" | "customers" | "coupons";

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
    total: number;
    status: string;
    statusLabel: string;
  }[];
  customers: { name: string; tier: string; orders: number; spend: number }[];
  coupons: { code: string; description: string; redemptions: number; active: boolean }[];
  categoryOptions: { slug: string; name: string }[];
}

const nav: { id: Tab; label: string; Icon: typeof Box }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "products", label: "Products", Icon: Package },
  { id: "orders", label: "Orders", Icon: Box },
  { id: "customers", label: "Customers", Icon: Users },
  { id: "coupons", label: "Coupons", Icon: Tag },
];

const ORDER_STATUSES = ["PENDING", "PROCESSING", "IN_TRANSIT", "DELIVERED", "CANCELLED"];
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
          </div>
        </aside>

        <div className="min-w-0">
          {tab === "dashboard" && <Dashboard data={data} />}
          {tab === "products" && <Products data={data} />}
          {tab === "orders" && <Orders data={data} />}
          {tab === "customers" && <Customers data={data} />}
          {tab === "coupons" && <Coupons data={data} />}
        </div>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-dark rounded-[var(--radius-luxe)] p-6 ${className}`}>{children}</div>;
}

function Dashboard({ data }: { data: AdminData }) {
  const { kpis, topCategories } = data;
  const kpiCards = [
    { label: "Revenue", value: formatPrice(kpis.revenue), Icon: DollarSign },
    { label: "Orders", value: String(kpis.orders), Icon: Box },
    { label: "Customers", value: String(kpis.customers), Icon: Users },
    { label: "Avg. Order Value", value: formatPrice(kpis.aov), Icon: TrendingUp },
  ];
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
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm text-cream">{o.number}</p>
                  <p className="truncate text-xs text-muted">{o.customer}</p>
                </div>
                <span className="font-display text-sm text-cream">{formatPrice(o.total)}</span>
                <span className={`hidden text-xs sm:block ${statusTone[o.status]}`}>● {o.statusLabel}</span>
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
    </div>
  );
}

function Customers({ data }: { data: AdminData }) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Customers</h1>
      {data.customers.length === 0 ? (
        <Panel><p className="text-sm text-muted">No customers yet.</p></Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.customers.map((c) => (
            <Panel key={c.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-burgundy/40 font-display text-cream">
                    {c.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-cream">{c.name}</p>
                    <p className="text-xs text-gold">{c.tier} Member</p>
                  </div>
                </div>
                <Badge tone="Best Seller">{`${c.orders} orders`}</Badge>
              </div>
              <p className="mt-4 text-sm text-muted">
                Lifetime value <span className="font-display text-cream">{formatPrice(c.spend)}</span>
              </p>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

function Coupons({ data }: { data: AdminData }) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Coupons</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {data.coupons.map((c) => (
          <Panel key={c.code}>
            <div className="flex items-center justify-between">
              <span className="rounded-lg border border-dashed border-gold/40 px-3 py-1 font-mono text-sm text-gold">
                {c.code}
              </span>
              <span className={`text-xs ${c.active ? "text-emerald" : "text-muted"}`}>
                {c.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-4 text-sm text-parchment">{c.description}</p>
            <p className="mt-1 text-xs text-muted">{c.redemptions.toLocaleString()} redemptions</p>
          </Panel>
        ))}
      </div>
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
