"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, ExternalLink, LayoutDashboard, Package, Star, Tag, Users } from "lucide-react";
import type { AdminData, Tab } from "./types";
import { ToastProvider } from "./shared";
import { Dashboard } from "./modules/dashboard";
import { Products } from "./modules/products";
import { Orders } from "./modules/orders";
import { Customers } from "./modules/customers";
import { Coupons } from "./modules/coupons";
import { Reviews } from "./modules/reviews";

const nav: { id: Tab; label: string; Icon: typeof Box }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "products", label: "Products", Icon: Package },
  { id: "orders", label: "Orders", Icon: Box },
  { id: "customers", label: "Customers", Icon: Users },
  { id: "coupons", label: "Coupons", Icon: Tag },
  { id: "reviews", label: "Reviews", Icon: Star },
];

export function AdminClient({ data }: { data: AdminData }) {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <div className="container-luxe grid grid-cols-1 gap-8 py-12 lg:grid-cols-[230px_1fr]">
          <aside>
            <div className="glass-dark rounded-[var(--radius-luxe)] p-4 lg:sticky lg:top-28 lg:p-5">
              <p className="px-3 pb-4 font-display text-lg tracking-[0.2em] text-cream">
                SipSipGo
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
    </ToastProvider>
  );
}
