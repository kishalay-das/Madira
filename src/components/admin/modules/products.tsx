"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Trash2,
  Video,
  X,
} from "lucide-react";
import type { CategorySlug, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Bottle } from "@/components/bottle";
import type { AdminData } from "../types";
import {
  AdminField,
  BADGES,
  ColorField,
  csvToArray,
  FormGroup,
  MAX_IMAGE_BYTES,
  MAX_IMAGES,
  MAX_VIDEO_BYTES,
  Panel,
  SegmentToggle,
  SelectField,
  TextAreaField,
  uploadToCloudinary,
  useToast,
} from "../shared";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

type ViewMode = "list" | "grid";

type AdminProduct = AdminData["products"][number];

/* ------------------------------------------------------------------ *
 * Stock status chip helper
 * ------------------------------------------------------------------ */

function stockStatus(stock: number): { label: string; cls: string } {
  if (stock === 0) return { label: "Out of stock", cls: "text-burgundy" };
  if (stock <= 8) return { label: "Low", cls: "text-warning" };
  return { label: "Active", cls: "text-emerald" };
}

function StatusChip({ stock }: { stock: number }) {
  const { label, cls } = stockStatus(stock);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-0.5 text-[0.62rem] uppercase tracking-widest ${cls}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80`}
      />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Inline editable number cell
 * ------------------------------------------------------------------ */

interface InlineCellProps {
  productId: string;
  field: "price" | "stock";
  value: number;
  display: string;
  onSaved: () => void;
}

function InlineCell({ productId, field, value, display, onSaved }: InlineCellProps) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(String(value));
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing, value]);

  const commit = useCallback(async () => {
    const parsed = Number(draft);
    if (isNaN(parsed) || parsed < 0 || parsed === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: parsed }),
      });
      if (res.ok) {
        toast(`${field === "price" ? "Price" : "Stock"} updated`, "success");
        onSaved();
      } else {
        const d = await res.json().catch(() => ({}));
        toast(d.error || "Update failed.", "error");
      }
    } catch {
      toast("Network error.", "error");
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }, [draft, field, productId, value, toast, onSaved]);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        title={`Click to edit ${field}`}
        className="group flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-(--hover-soft)"
      >
        <span className="text-sm text-cream">{display}</span>
        <Pencil
          size={10}
          className="text-muted-2 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
    );
  }

  return (
    <div className="relative flex items-center gap-1">
      <input
        ref={inputRef}
        type="number"
        min={0}
        value={draft}
        disabled={saving}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") { setEditing(false); }
        }}
        className="h-7 w-24 rounded-lg border border-gold/50 bg-night/80 px-2 text-sm text-cream focus:border-gold focus:outline-none disabled:opacity-50"
      />
      {saving && <Loader2 size={12} className="animate-spin text-gold" />}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Bulk action bar
 * ------------------------------------------------------------------ */

interface BulkBarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
  deleting: boolean;
}

function BulkBar({ count, onDelete, onClear, deleting }: BulkBarProps) {
  if (count === 0) return null;
  return (
    <div className="sticky top-0 z-20 flex items-center gap-4 rounded-luxe border border-hairline bg-(--glass-bg) px-5 py-3 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <span className="flex-1 text-sm text-parchment">
        <span className="font-medium text-cream">{count}</span>{" "}
        {count === 1 ? "product" : "products"} selected
      </span>
      <button
        onClick={onClear}
        className="h-8 rounded-full border border-hairline px-4 text-xs text-parchment transition-colors hover:text-cream"
      >
        Clear
      </button>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="flex h-8 items-center gap-2 rounded-full border border-burgundy/40 bg-burgundy/10 px-4 text-xs text-burgundy transition-colors hover:bg-burgundy/20 disabled:opacity-50"
      >
        {deleting && <Loader2 size={12} className="animate-spin" />}
        Delete selected
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Products (main export)
 * ------------------------------------------------------------------ */

export function Products({ data }: { data: AdminData }) {
  const toast = useToast();

  const [busy, setBusy] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | Product | null>(null);
  const [seg, setSeg] = useState<"PREMIUM" | "STANDARD">("PREMIUM");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Server-paginated state
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    PREMIUM: data.products.filter((p) => p.segment === "PREMIUM").length,
    STANDARD: data.products.filter((p) => p.segment === "STANDARD").length,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), segment: seg });
    const res = await fetch(`/api/admin/products?${params.toString()}`);
    if (res.ok) {
      const d = await res.json();
      setProducts(d.items);
      setTotal(d.total);
      setCounts(d.counts);
    }
    setLoading(false);
  }, [page, seg]);

  useEffect(() => {
    load();
  }, [load]);

  // The fetched page is already segment-filtered server-side.
  const shown = products;

  // Changing segment resets to the first page.
  const onSeg = (v: "PREMIUM" | "STANDARD") => {
    setSeg(v);
    setPage(1);
  };

  // Clear selection when segment changes
  useEffect(() => {
    setSelected(new Set());
  }, [seg]);

  const refresh = () => load();

  // --- Single delete ---
  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    setBusy(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast(d.error || "Delete failed.", "error");
    } else {
      toast("Product deleted.", "success");
    }
    setBusy(null);
    load();
  }

  // --- Open modal for editing ---
  async function openEdit(slug: string) {
    setLoadingEdit(slug);
    try {
      const res = await fetch(`/api/products/${slug}`);
      if (res.ok) {
        const { product } = await res.json();
        setModal(product as Product);
      } else {
        toast("Could not load product.", "error");
      }
    } finally {
      setLoadingEdit(null);
    }
  }

  // --- Bulk delete ---
  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} product${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkDeleting(true);
    const ids = Array.from(selected);
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/products/${id}`, { method: "DELETE" }).then(async (r) => ({
          id,
          ok: r.ok,
          error: r.ok ? null : (await r.json().catch(() => ({}))).error,
        }))
      )
    );
    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.length - succeeded;
    if (succeeded > 0) toast(`Deleted ${succeeded} product${succeeded > 1 ? "s" : ""}.`, "success");
    if (failed > 0) toast(`${failed} product${failed > 1 ? "s" : ""} could not be deleted (may be referenced by orders).`, "error");
    setSelected(new Set());
    setBulkDeleting(false);
    load();
  }

  // --- Checkbox helpers ---
  const allSelected = shown.length > 0 && shown.every((p) => selected.has(p.id));
  const someSelected = shown.some((p) => selected.has(p.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(shown.map((p) => p.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Product Inventory</h1>
        <button
          onClick={() => setModal("create")}
          className="h-10 rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 text-sm font-medium text-ink"
        >
          + Add Product
        </button>
      </div>

      {/* Toolbar: segment toggle + view toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentToggle value={seg} onChange={onSeg} counts={counts} />
        <div className="ml-auto flex items-center gap-1 rounded-full border border-hairline bg-night/40 p-1">
          <button
            onClick={() => setViewMode("list")}
            aria-label="List view"
            title="List view"
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              viewMode === "list" ? "bg-gold text-ink" : "text-muted hover:text-cream"
            }`}
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            title="Grid view"
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              viewMode === "grid" ? "bg-gold text-ink" : "text-muted hover:text-cream"
            }`}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      <BulkBar
        count={selected.size}
        onDelete={bulkDelete}
        onClear={() => setSelected(new Set())}
        deleting={bulkDeleting}
      />

      {/* Loading / empty state */}
      {loading && shown.length === 0 ? (
        <Panel>
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Loading products…
          </div>
        </Panel>
      ) : shown.length === 0 ? (
        <Panel>
          <p className="py-6 text-center text-sm text-muted">
            No {seg.toLowerCase()} products.
          </p>
        </Panel>
      ) : viewMode === "list" ? (
        /* ---------------------------------------------------------------- *
         * LIST VIEW
         * ---------------------------------------------------------------- */
        <Panel className="p-0! overflow-hidden">
          <div className="divide-y divide-hairline">
            {/* Select-all header row */}
            <div className="flex items-center gap-3 px-4 py-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={toggleAll}
                aria-label="Select all"
                className="h-4 w-4 cursor-pointer accent-gold"
              />
              <span className="text-[0.62rem] uppercase tracking-widest text-muted">
                Select all
              </span>
            </div>

            {shown.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-4 transition-colors hover:bg-(--hover-soft) ${
                  selected.has(p.id) ? "bg-gold/5" : ""
                }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleOne(p.id)}
                  aria-label={`Select ${p.name}`}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-gold"
                />

                {/* Bottle */}
                <div className="h-12 w-9 shrink-0">
                  <Bottle
                    product={{
                      ...p,
                      category: p.category as CategorySlug,
                      distillery: p.distillery,
                    }}
                  />
                </div>

                {/* Name + category */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-cream">{p.name}</p>
                  <p className="truncate text-xs text-muted">{p.categoryLabel}</p>
                </div>

                {/* Status chip */}
                <div className="hidden sm:block">
                  <StatusChip stock={p.stock} />
                </div>

                {/* Inline price */}
                <div className="hidden sm:block">
                  <InlineCell
                    productId={p.id}
                    field="price"
                    value={p.price}
                    display={formatPrice(p.price)}
                    onSaved={refresh}
                  />
                </div>

                {/* Inline stock */}
                <div className="hidden w-32 sm:block">
                  <InlineCell
                    productId={p.id}
                    field="stock"
                    value={p.stock}
                    display={`${p.stock} in stock`}
                    onSaved={refresh}
                  />
                </div>

                {/* Edit */}
                <button
                  onClick={() => openEdit(p.slug)}
                  disabled={loadingEdit === p.slug}
                  aria-label={`Edit ${p.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-gold"
                >
                  {loadingEdit === p.slug ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Pencil size={15} />
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => remove(p.id)}
                  disabled={busy === p.id}
                  aria-label={`Delete ${p.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-burgundy"
                >
                  {busy === p.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </Panel>
      ) : (
        /* ---------------------------------------------------------------- *
         * GRID VIEW
         * ---------------------------------------------------------------- */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              selected={selected.has(p.id)}
              onSelect={() => toggleOne(p.id)}
              busy={busy === p.id}
              loadingEdit={loadingEdit === p.slug}
              onEdit={() => openEdit(p.slug)}
              onDelete={() => remove(p.id)}
              onSaved={refresh}
            />
          ))}
        </div>
      )}

      {/* Pagination (shared by both view modes) */}
      <Pagination
        page={page}
        pageCount={Math.ceil(total / PAGE_SIZE)}
        onPageChange={setPage}
      />

      {/* Product Modal */}
      {modal && (
        <ProductModal
          categories={data.categoryOptions}
          editing={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Grid card
 * ------------------------------------------------------------------ */

interface ProductCardProps {
  product: AdminProduct;
  selected: boolean;
  onSelect: () => void;
  busy: boolean;
  loadingEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSaved: () => void;
}

function ProductCard({
  product: p,
  selected,
  onSelect,
  busy,
  loadingEdit,
  onEdit,
  onDelete,
  onSaved,
}: ProductCardProps) {
  return (
    <div
      className={`glass-dark group relative flex flex-col overflow-hidden rounded-luxe border transition-colors ${
        selected ? "border-gold/40 bg-gold/5" : "border-hairline hover:border-gold/20"
      }`}
    >
      {/* Checkbox */}
      <label className="absolute left-3 top-3 z-10 flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          aria-label={`Select ${p.name}`}
          className="h-4 w-4 cursor-pointer accent-gold"
        />
      </label>

      {/* Bottle area */}
      <div className="relative flex h-44 items-center justify-center bg-night/60 p-4">
        <Bottle
          product={{
            ...p,
            category: p.category as CategorySlug,
            distillery: p.distillery,
          }}
        />

        {/* Hover actions overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-(--scrim)/70 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            disabled={loadingEdit}
            aria-label={`Edit ${p.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-night/80 text-parchment transition-colors hover:border-gold/40 hover:text-gold"
          >
            {loadingEdit ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Pencil size={15} />
            )}
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            aria-label={`Delete ${p.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-night/80 text-parchment transition-colors hover:border-burgundy/40 hover:text-burgundy"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-cream">{p.name}</p>
          <p className="truncate text-xs text-muted">{p.categoryLabel}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <StatusChip stock={p.stock} />
        </div>

        {/* Inline price + stock */}
        <div className="flex items-center gap-3 border-t border-hairline pt-3">
          <div className="flex-1">
            <p className="mb-0.5 text-[0.55rem] uppercase tracking-widest text-muted">Price</p>
            <InlineCell
              productId={p.id}
              field="price"
              value={p.price}
              display={formatPrice(p.price)}
              onSaved={onSaved}
            />
          </div>
          <div className="flex-1">
            <p className="mb-0.5 text-[0.55rem] uppercase tracking-widest text-muted">Stock</p>
            <InlineCell
              productId={p.id}
              field="stock"
              value={p.stock}
              display={`${p.stock}`}
              onSaved={onSaved}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * ProductModal — unchanged; do not redesign
 * ------------------------------------------------------------------ */

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
    segment: editing?.segment ?? "PREMIUM",
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
      segment: f.segment,
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
              <SelectField
                label="Storefront"
                value={f.segment}
                onChange={(v) => set("segment", v)}
                options={[
                  { value: "PREMIUM", label: "Premium" },
                  { value: "STANDARD", label: "Standard" },
                ]}
              />
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
