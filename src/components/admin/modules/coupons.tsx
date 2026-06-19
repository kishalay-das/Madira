"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, Loader2, Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { AdminCoupon, AdminData } from "../types";
import { AdminField, DetailModal, Panel } from "../shared";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 20;

export function Coupons({ data }: { data: AdminData }) {
  const [modal, setModal] = useState<"create" | AdminCoupon | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Server-paginated state
  const [page, setPage] = useState(1);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/coupons?page=${page}`);
    if (res.ok) {
      const d = await res.json();
      setCoupons(d.items);
      setTotal(d.total);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(c: AdminCoupon) {
    setBusy(c.id);
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    setBusy(null);
    load();
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
    load();
  }

  const pageCount = Math.ceil(total / PAGE_SIZE);

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

      {loading && coupons.length === 0 ? (
        <Panel>
          <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted">
            <Clock size={16} className="animate-pulse" /> Loading coupons…
          </div>
        </Panel>
      ) : coupons.length === 0 ? (
        <Panel><p className="text-sm text-muted">No coupons yet.</p></Panel>
      ) : (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
          {coupons.map((c) => (
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

      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />

      {modal && (
        <CouponModal
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
