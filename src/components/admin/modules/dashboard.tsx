"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Box,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { AdminData } from "../types";
import { LOW_STOCK_THRESHOLD, Panel, Sparkline } from "../shared";

/* ------------------------------------------------------------------ *
 * Trend chip — shows % change with directional colour and icon
 * ------------------------------------------------------------------ */
function TrendChip({ pct }: { pct: number }) {
  if (pct === 0) return null;
  const up = pct > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${
        up
          ? "bg-emerald/10 text-emerald"
          : "bg-burgundy/10 text-burgundy"
      }`}
    >
      <Icon size={11} strokeWidth={2.5} />
      {Math.abs(pct)}%
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Dashboard
 * ------------------------------------------------------------------ */
export function Dashboard({ data }: { data: AdminData }) {
  const { kpis, topCategories, revenueByDay, ordersByDay, revenueBySegment, topProducts } = data;

  /* Low-stock list */
  const lowStock = data.products
    .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);

  /* Revenue by segment */
  const segTotal = revenueBySegment.PREMIUM + revenueBySegment.STANDARD;
  const premiumPct = segTotal > 0 ? Math.round((revenueBySegment.PREMIUM / segTotal) * 100) : 0;
  const standardPct = segTotal > 0 ? 100 - premiumPct : 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted">Live performance · powered by PostgreSQL</p>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Revenue */}
        <Panel className="group p-5! transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold/30">
          <div className="flex items-center justify-between">
            <DollarSign size={18} className="text-gold" />
            <TrendChip pct={kpis.revenueTrend} />
          </div>
          <p className="mt-3 font-display text-2xl text-cream">{formatPrice(kpis.revenue)}</p>
          <p className="text-xs text-muted">Revenue</p>
          <Sparkline
            data={revenueByDay}
            className="mt-3 h-7 w-full"
          />
        </Panel>

        {/* Orders */}
        <Panel className="group p-5! transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold/30">
          <div className="flex items-center justify-between">
            <Box size={18} className="text-gold" />
            <TrendChip pct={kpis.ordersTrend} />
          </div>
          <p className="mt-3 font-display text-2xl text-cream">{String(kpis.orders)}</p>
          <p className="text-xs text-muted">Orders</p>
          <Sparkline
            data={ordersByDay}
            className="mt-3 h-7 w-full"
            stroke="var(--color-emerald)"
            fill="var(--color-emerald)"
          />
        </Panel>

        {/* Customers */}
        <Panel className="p-5! transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold/30">
          <Users size={18} className="text-gold" />
          <p className="mt-3 font-display text-2xl text-cream">{String(kpis.customers)}</p>
          <p className="text-xs text-muted">Customers</p>
        </Panel>

        {/* AOV */}
        <Panel className="p-5! transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold/30">
          <TrendingUp size={18} className="text-gold" />
          <p className="mt-3 font-display text-2xl text-cream">{formatPrice(kpis.aov)}</p>
          <p className="text-xs text-muted">Avg. Order Value</p>
        </Panel>
      </div>

      {/* ── Revenue by storefront + Top Sellers ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue by segment */}
        <Panel>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg text-cream">Revenue by Storefront</h2>
            <span className="text-[0.62rem] uppercase tracking-widest text-muted">30 days</span>
          </div>
          {segTotal === 0 ? (
            <p className="text-sm text-muted-2">No revenue data yet.</p>
          ) : (
            <div className="space-y-5">
              {/* Premium */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-gold">Premium</span>
                  <span className="text-parchment">
                    {formatPrice(revenueBySegment.PREMIUM)}{" "}
                    <span className="text-muted">· {premiumPct}%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-graphite">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-500"
                    style={{ width: `${premiumPct}%` }}
                  />
                </div>
              </div>
              {/* Standard */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#7fbfff]">Standard</span>
                  <span className="text-parchment">
                    {formatPrice(revenueBySegment.STANDARD)}{" "}
                    <span className="text-muted">· {standardPct}%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-graphite">
                  <div
                    className="h-full rounded-full bg-[#7fbfff]/70 transition-all duration-500"
                    style={{ width: `${standardPct}%` }}
                  />
                </div>
              </div>
              {/* Combined total */}
              <p className="border-t border-hairline pt-4 text-right text-xs text-muted">
                Combined{" "}
                <span className="font-medium text-parchment">{formatPrice(segTotal)}</span>
              </p>
            </div>
          )}
        </Panel>

        {/* Top Sellers */}
        <Panel>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg text-cream">Top Sellers</h2>
            <span className="text-[0.62rem] uppercase tracking-widest text-muted">by units sold</span>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-2">No sales recorded yet.</p>
          ) : (
            <ol className="divide-y divide-hairline">
              {topProducts.map((p, i) => (
                <li key={p.slug} className="flex items-center gap-3 py-3">
                  {/* Rank */}
                  <span className="w-5 shrink-0 text-center font-display text-sm text-muted-2">
                    {i + 1}
                  </span>
                  {/* Name + segment tag */}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-cream">{p.name}</span>
                    <span
                      className={`mt-0.5 inline-block rounded-full px-2 py-px text-[0.6rem] font-medium uppercase tracking-wide ${
                        p.segment === "PREMIUM"
                          ? "bg-gold/10 text-gold"
                          : "bg-graphite text-muted"
                      }`}
                    >
                      {p.segment === "PREMIUM" ? "Premium" : "Standard"}
                    </span>
                  </span>
                  {/* Units + revenue */}
                  <span className="shrink-0 text-right">
                    <span className="block text-sm text-parchment">
                      {formatPrice(p.revenue)}
                    </span>
                    <span className="block text-[0.65rem] text-muted">
                      {p.units} {p.units === 1 ? "unit" : "units"}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      {/* ── Catalog by Category ── */}
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
                <div
                  className="h-full rounded-full"
                  style={{ width: `${r.pct}%`, background: r.hue }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* ── Low Stock alerts ── */}
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
