"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  ChevronRight,
  Crown,
  DollarSign,
  Mail,
  ShoppingBag,
  Sparkles,
  Tag,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AdminCustomer, AdminData } from "../types";
import { DetailModal, DetailRow, ProfileStat, Panel } from "../shared";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ *
 * Tag → Badge tone mapping
 * ------------------------------------------------------------------ */

const TAG_TONE: Record<string, string> = {
  VIP: "Award Winner",
  "High spender": "Best Seller",
  "At risk": "Limited",
  New: "New",
};

const ALL_TAGS = ["VIP", "High spender", "At risk", "New"] as const;
type CustomerTag = (typeof ALL_TAGS)[number];

/* ------------------------------------------------------------------ *
 * Customers module
 * ------------------------------------------------------------------ */

export function Customers({ data }: { data: AdminData }) {
  const [detail, setDetail] = useState<AdminCustomer | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTag, setActiveTag] = useState<CustomerTag | "All">("All");

  // Server-paginated state
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [totalAll, setTotalAll] = useState(data.kpis.customers);
  const [loading, setLoading] = useState(true);

  // Debounce the search box so we don't fetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (activeTag !== "All") params.set("tag", activeTag);

    const res = await fetch(`/api/admin/customers?${params.toString()}`);
    if (res.ok) {
      const d = await res.json();
      setCustomers(d.items);
      setTotal(d.total);
      setTagCounts(d.tagCounts);
      setTotalAll(d.totalAll);
    }
    setLoading(false);
  }, [page, debouncedQuery, activeTag]);

  useEffect(() => {
    load();
  }, [load]);

  // Changing search or tag resets to the first page.
  const onSearch = (v: string) => {
    setQuery(v);
    setPage(1);
  };
  const onTag = (v: CustomerTag | "All") => {
    setActiveTag(v);
    setPage(1);
  };

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">
          Customers{" "}
          <span className="text-base text-muted">
            ({totalAll})
          </span>
        </h1>
        <label className="relative">
          <Users
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search name or email…"
            className="h-10 w-full rounded-full border border-hairline bg-night/60 pl-9 pr-4 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none sm:w-72"
          />
        </label>
      </div>

      {/* Tag filter pills */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...ALL_TAGS] as const).map((tag) => {
          const count = tag === "All" ? totalAll : tagCounts[tag] ?? 0;
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onTag(tag)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                isActive
                  ? "border-gold bg-gold/20 text-gold"
                  : "border-hairline bg-night/40 text-muted hover:border-gold/40 hover:text-cream"
              }`}
            >
              {tag}{" "}
              <span
                className={
                  isActive ? "text-gold/70" : "text-muted-2"
                }
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      {loading && customers.length === 0 ? (
        <Panel>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Users size={16} className="animate-pulse" /> Loading customers…
          </p>
        </Panel>
      ) : customers.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">
            No customers match the current filter.
          </p>
        </Panel>
      ) : (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${loading ? "opacity-60" : ""}`}>
          {customers.map((c) => (
            <button
              key={c.id}
              onClick={() => setDetail(c)}
              className="group glass-dark rounded-[var(--radius-luxe)] p-6 text-left transition-colors hover:border-gold/30"
            >
              {/* Name + tier row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-burgundy/40 font-display text-cream">
                    {c.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-cream group-hover:text-gold">
                      {c.name}
                    </p>
                    <p className="text-xs text-gold">{c.tier} Member</p>
                  </div>
                </div>
                <Badge tone="Best Seller">{`${c.orders} orders`}</Badge>
              </div>

              {/* Insight tags */}
              {c.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <Badge key={t} tone={TAG_TONE[t] as Parameters<typeof Badge>[0]["tone"]}>
                      {t}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Metrics row */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-hairline pt-3">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-widest text-muted">
                    Lifetime
                  </p>
                  <p className="font-display text-sm text-cream">
                    {formatPrice(c.spend)}
                  </p>
                </div>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-widest text-muted">
                    AOV
                  </p>
                  <p className="font-display text-sm text-cream">
                    {formatPrice(c.aov)}
                  </p>
                </div>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-widest text-muted">
                    Last order
                  </p>
                  <p className="text-xs text-parchment">
                    {c.lastPurchase ?? "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <ChevronRight
                  size={16}
                  className="text-muted-2 transition-colors group-hover:text-gold"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />

      {detail && (
        <CustomerDetailModal
          customer={detail}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Customer detail modal
 * ------------------------------------------------------------------ */

function CustomerDetailModal({
  customer,
  onClose,
}: {
  customer: AdminCustomer;
  onClose: () => void;
}) {
  return (
    <DetailModal
      title={customer.name}
      subtitle={customer.email}
      onClose={onClose}
    >
      {/* Insight tags near the top */}
      {customer.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {customer.tags.map((t) => (
            <Badge
              key={t}
              tone={TAG_TONE[t] as Parameters<typeof Badge>[0]["tone"]}
            >
              {t}
            </Badge>
          ))}
        </div>
      )}

      {/* Profile stat chips — 2 × 3 grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ProfileStat Icon={Crown} label="Tier" value={`${customer.tier} Member`} />
        <ProfileStat
          Icon={Calendar}
          label="Member since"
          value={customer.memberSince}
        />
        <ProfileStat
          Icon={Sparkles}
          label="Loyalty points"
          value={customer.loyaltyPoints.toLocaleString()}
        />
        <ProfileStat
          Icon={DollarSign}
          label="Lifetime value"
          value={formatPrice(customer.spend)}
        />
        <ProfileStat
          Icon={TrendingUp}
          label="Avg order value"
          value={formatPrice(customer.aov)}
        />
        <ProfileStat
          Icon={ShoppingBag}
          label="Last purchase"
          value={customer.lastPurchase ?? "No orders"}
        />
      </div>

      {/* Contact details */}
      <DetailRow Icon={Mail} label="Email">
        <p className="break-all text-sm text-cream">{customer.email}</p>
      </DetailRow>
      <DetailRow Icon={Ticket} label="Referral code">
        <span className="font-mono text-sm text-gold">
          {customer.referralCode.slice(0, 8).toUpperCase()}
        </span>
      </DetailRow>

      {/* Tags detail row */}
      {customer.tags.length > 0 && (
        <DetailRow Icon={Tag} label="Insight tags">
          <div className="mt-1 flex flex-wrap gap-1.5">
            {customer.tags.map((t) => (
              <Badge
                key={t}
                tone={TAG_TONE[t] as Parameters<typeof Badge>[0]["tone"]}
              >
                {t}
              </Badge>
            ))}
          </div>
        </DetailRow>
      )}

      {/* Email customer action */}
      <div className="mt-5">
        <a
          href={`mailto:${customer.email}`}
          className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold/10 px-5 py-2 text-sm font-medium text-gold transition-colors hover:border-gold hover:bg-gold/20 hover:text-gold-bright"
        >
          <Mail size={14} />
          Email customer
        </a>
      </div>

      {/* Addresses */}
      {customer.addresses.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-[0.62rem] uppercase tracking-widest text-muted">
            Addresses
          </p>
          <ul className="space-y-2">
            {customer.addresses.map((a, i) => (
              <li
                key={i}
                className="rounded-xl border border-hairline bg-night/40 p-3"
              >
                <p className="text-sm text-cream">{a.label}</p>
                <p className="text-xs text-muted">{a.line}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent orders */}
      <div className="mt-5">
        <p className="mb-2 text-[0.62rem] uppercase tracking-widest text-muted">
          Orders ({customer.orders})
        </p>
        {customer.recentOrders.length === 0 ? (
          <p className="text-xs text-muted">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-hairline)] rounded-xl border border-hairline">
            {customer.recentOrders.map((o) => (
              <li
                key={o.number}
                className="flex items-center justify-between gap-3 p-3"
              >
                <span className="min-w-0">
                  <span className="block font-display text-sm text-cream">
                    {o.number}
                  </span>
                  <span className="block text-xs text-muted">
                    {o.date} · {o.statusLabel}
                  </span>
                </span>
                <span className="font-display text-sm text-cream">
                  {formatPrice(o.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DetailModal>
  );
}
