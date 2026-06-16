"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Eye,
  Gift,
  MapPin,
  Phone,
  Search,
  Truck,
  Users,
  X,
  Ticket,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { AdminData, AdminOrder } from "../types";
import {
  DetailModal,
  DetailRow,
  Money,
  ORDER_STATUSES,
  Panel,
  PAYMENT_LABELS,
  SegmentToggle,
  statusTone,
  useToast,
} from "../shared";
import { DeliveryMap } from "../delivery-map";

/* ------------------------------------------------------------------ *
 * Date-range helpers (all Date math; no external dep)
 * ------------------------------------------------------------------ */

type DateRange = "all" | "7d" | "30d" | "90d";

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  all: "All time",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

function withinRange(isoString: string, range: DateRange): boolean {
  if (range === "all") return true;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(isoString) >= cutoff;
}

/* ------------------------------------------------------------------ *
 * Pipeline config for the order timeline stepper
 * ------------------------------------------------------------------ */

const PIPELINE: { status: string; label: string; Icon: typeof Circle }[] = [
  { status: "PENDING", label: "Pending", Icon: Clock },
  { status: "PROCESSING", label: "Processing", Icon: Circle },
  { status: "IN_TRANSIT", label: "In Transit", Icon: Truck },
  { status: "DELIVERED", label: "Delivered", Icon: CheckCircle2 },
];

/* ------------------------------------------------------------------ *
 * Main Orders module
 * ------------------------------------------------------------------ */

export function Orders({ data }: { data: AdminData }) {
  const router = useRouter();
  const toast = useToast();

  const [busy, setBusy] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrder | null>(null);
  const [seg, setSeg] = useState<"PREMIUM" | "STANDARD">("PREMIUM");

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [search, setSearch] = useState("");

  async function setStatus(id: string, status: string) {
    setBusy(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    if (res.ok) {
      toast(`Status updated to ${status.replace("_", " ")}`, "success");
    } else {
      toast("Failed to update status.", "error");
    }
    router.refresh();
  }

  async function cancelOrder(id: string) {
    setBusy(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setBusy(null);
    if (res.ok) {
      toast("Order cancelled.", "success");
    } else {
      toast("Failed to cancel order.", "error");
    }
    router.refresh();
  }

  // Keep the open detail view in sync after a status change / refresh.
  const live = detail ? (data.orders.find((o) => o.id === detail.id) ?? null) : null;

  const counts = {
    PREMIUM: data.orders.filter((o) => o.segment === "PREMIUM").length,
    STANDARD: data.orders.filter((o) => o.segment === "STANDARD").length,
  };

  // Apply all filters: segment → status → payment → date → search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.orders.filter((o) => {
      if (o.segment !== seg) return false;
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (paymentFilter !== "ALL" && o.paymentMethod !== paymentFilter) return false;
      if (!withinRange(o.createdAt, dateRange)) return false;
      if (
        q &&
        !o.number.toLowerCase().includes(q) &&
        !o.customer.toLowerCase().includes(q) &&
        !o.customerEmail.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [data.orders, seg, statusFilter, paymentFilter, dateRange, search]);

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    paymentFilter !== "ALL" ||
    dateRange !== "all" ||
    search.trim() !== "";

  function clearFilters() {
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setDateRange("all");
    setSearch("");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Orders</h1>

      {/* Segment toggle */}
      <SegmentToggle value={seg} onChange={setSeg} counts={counts} />

      {/* Filter / search bar */}
      <Panel className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2"
          />
          <input
            type="search"
            placeholder="Search by order number, customer, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-hairline bg-night/60 pl-9 pr-4 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-full border border-hairline bg-night px-3 text-xs text-cream focus:border-gold focus:outline-none"
          >
            <option value="ALL" className="bg-night">
              All statuses
            </option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-night">
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          {/* Payment */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-9 rounded-full border border-hairline bg-night px-3 text-xs text-cream focus:border-gold focus:outline-none"
          >
            <option value="ALL" className="bg-night">
              All payments
            </option>
            {(["card", "wallet", "cod"] as const).map((m) => (
              <option key={m} value={m} className="bg-night">
                {PAYMENT_LABELS[m]}
              </option>
            ))}
          </select>

          {/* Date range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="h-9 rounded-full border border-hairline bg-night px-3 text-xs text-cream focus:border-gold focus:outline-none"
          >
            {(["all", "7d", "30d", "90d"] as DateRange[]).map((r) => (
              <option key={r} value={r} className="bg-night">
                {DATE_RANGE_LABELS[r]}
              </option>
            ))}
          </select>

          {/* Result count + clear */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-full border border-hairline px-3 py-1.5 text-xs text-muted transition-colors hover:border-gold/40 hover:text-cream"
              >
                <X size={12} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </Panel>

      {/* Orders list */}
      <Panel className="!p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Search size={24} className="text-muted-2" />
            <p className="text-sm text-muted">No orders match your filters.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-1 text-xs text-gold hover:text-gold-bright transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--color-hairline)]">
            {filtered.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center gap-3 p-4 hover:bg-(--hover-soft)"
              >
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
                <span className={`hidden text-xs sm:flex items-center gap-1 ${statusTone[o.status]}`}>
                  ● {o.statusLabel}
                </span>
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
          onCancel={() => cancelOrder(live.id)}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Order timeline stepper
 * ------------------------------------------------------------------ */

function OrderTimeline({ status }: { status: string }) {
  const isCancelled = status === "CANCELLED";
  const currentIdx = PIPELINE.findIndex((s) => s.status === status);

  if (isCancelled) {
    return (
      <div className="mt-5">
        <p className="mb-3 text-[0.62rem] uppercase tracking-widest text-muted">
          Order timeline
        </p>
        <div className="flex items-center gap-3 rounded-xl border border-hairline bg-night/40 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-burgundy/40 bg-burgundy/10">
            <AlertTriangle size={14} className="text-burgundy" />
          </span>
          <div>
            <p className="text-sm font-medium text-burgundy">Order Cancelled</p>
            <p className="text-xs text-muted">This order has been cancelled.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <p className="mb-3 text-[0.62rem] uppercase tracking-widest text-muted">
        Order timeline
      </p>
      <div className="relative flex items-start gap-0">
        {PIPELINE.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isUpcoming = idx > currentIdx;
          const isLast = idx === PIPELINE.length - 1;

          return (
            <div key={step.status} className="relative flex flex-1 flex-col items-center">
              {/* Connector line (between steps) */}
              {!isLast && (
                <div
                  className={`absolute left-1/2 top-3.75 h-px w-full transition-colors ${
                    isDone || isCurrent ? "bg-gold" : "bg-hairline"
                  }`}
                />
              )}

              {/* Step node */}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  isDone
                    ? "border-gold bg-gold/20 text-gold"
                    : isCurrent
                    ? "border-emerald bg-emerald/10 text-emerald"
                    : "border-hairline bg-night/40 text-muted-2"
                }`}
              >
                <step.Icon size={14} />
              </div>

              {/* Step label */}
              <p
                className={`mt-2 text-center text-[0.58rem] uppercase tracking-wider leading-tight ${
                  isDone
                    ? "text-gold"
                    : isCurrent
                    ? "text-emerald"
                    : isUpcoming
                    ? "text-muted-2"
                    : "text-muted"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Order detail modal
 * ------------------------------------------------------------------ */

function OrderDetailModal({
  order,
  busy,
  onStatus,
  onCancel,
  onClose,
}: {
  order: AdminOrder;
  busy: boolean;
  onStatus: (status: string) => void;
  onCancel: () => void;
  onClose: () => void;
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);

  const canCancel =
    order.status !== "DELIVERED" && order.status !== "CANCELLED";

  function handleCancel() {
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    setConfirmCancel(false);
    onCancel();
  }

  return (
    <DetailModal
      title={order.number}
      subtitle={`Placed ${order.date}`}
      onClose={onClose}
    >
      {/* Status changer */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-night/40 p-4">
        <span className={`flex items-center gap-1.5 text-sm ${statusTone[order.status]}`}>
          ● {order.statusLabel}
        </span>
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

      {/* Order timeline stepper */}
      <OrderTimeline status={order.status} />

      {/* Customer */}
      <DetailRow Icon={Users} label="Customer">
        <p className="text-sm text-cream">{order.customer}</p>
        {order.customerEmail && (
          <p className="text-xs text-muted">{order.customerEmail}</p>
        )}
      </DetailRow>

      {/* Delivery */}
      <DetailRow Icon={MapPin} label="Delivery">
        <p className="text-sm text-cream">{order.deliverySlot}</p>
        <p className="text-xs text-muted">{order.address ?? "No address on file"}</p>
        {order.deliveryPhone && (
          <a
            href={`tel:${order.deliveryPhone}`}
            className="mt-1 inline-flex items-center gap-1 text-xs text-gold transition-colors hover:text-gold-bright"
          >
            <Phone size={12} /> {order.deliveryPhone}
          </a>
        )}
        {order.giftWrap && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-gold">
            <Gift size={12} /> Gift wrapped
          </p>
        )}
      </DetailRow>

      {/* Live delivery pin (only when the customer shared their location) */}
      {order.deliveryLat != null && order.deliveryLng != null ? (
        <div className="mt-4">
          <p className="mb-2 text-[0.62rem] uppercase tracking-widest text-muted">
            Delivery location
          </p>
          <DeliveryMap
            lat={order.deliveryLat}
            lng={order.deliveryLng}
            accuracy={order.deliveryAccuracy}
            label={order.number}
          />
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-2">
          No live location shared for this order.
        </p>
      )}

      {/* Payment */}
      <DetailRow Icon={DollarSign} label="Payment">
        <p className="text-sm text-cream">
          {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
        </p>
        {order.paymentMethod === "cod" && (
          <p className="text-xs text-muted">
            Collect {formatPrice(order.total)} in cash on delivery
          </p>
        )}
      </DetailRow>

      {/* Coupon */}
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
            <li
              key={`${it.slug}-${i}`}
              className="flex items-center justify-between gap-3 p-3"
            >
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

      {/* Cancel order */}
      {canCancel && (
        <div className="mt-5">
          {confirmCancel ? (
            <div className="flex items-center gap-3 rounded-xl border border-burgundy/30 bg-burgundy/10 p-4">
              <AlertTriangle size={16} className="shrink-0 text-burgundy" />
              <p className="flex-1 text-xs text-parchment">
                Cancel this order? This cannot be undone.
              </p>
              <button
                onClick={handleCancel}
                disabled={busy}
                className="rounded-full bg-burgundy px-4 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-burgundy-deep disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmCancel(false)}
                className="rounded-full border border-hairline px-4 py-1.5 text-xs text-muted transition-colors hover:text-cream"
              >
                Keep
              </button>
            </div>
          ) : (
            <button
              onClick={handleCancel}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-burgundy/30 py-2.5 text-sm text-burgundy transition-colors hover:border-burgundy/60 hover:bg-burgundy/10 disabled:opacity-50"
            >
              <X size={15} />
              Cancel order
            </button>
          )}
        </div>
      )}
    </DetailModal>
  );
}
