"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Crown,
  Gift,
  Heart,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import type { CategorySlug } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Bottle } from "@/components/bottle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Tab = "overview" | "orders" | "wishlist" | "addresses" | "membership" | "rewards";

export interface AccountUser {
  name: string;
  email: string;
  tier: string;
  loyaltyPoints: number;
  referralCode: string;
  memberSince: string;
  orderCount: number;
  wishlistCount: number;
}
export interface AccountOrder {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
}
export interface AccountAddress {
  id: string;
  label: string;
  line: string;
  primary: boolean;
  // Raw fields for prefilling the edit form.
  line1: string;
  city: string;
  postalCode: string;
  phone: string;
}
export interface AccountWishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  distillery: string;
  category: CategorySlug;
  images?: string[];
  palette: { glass: string; liquid: string; label: string };
}

interface Props {
  user: AccountUser;
  orders: AccountOrder[];
  addresses: AccountAddress[];
  wishlist: AccountWishlistItem[];
}

const tabs: { id: Tab; label: string; Icon: typeof User }[] = [
  { id: "overview", label: "Overview", Icon: User },
  { id: "orders", label: "Orders", Icon: Package },
  { id: "wishlist", label: "Wishlist", Icon: Heart },
  { id: "addresses", label: "Addresses", Icon: MapPin },
  { id: "membership", label: "Membership", Icon: Crown },
  { id: "rewards", label: "Rewards", Icon: Gift },
];

const tierLabel = (t: string) =>
  t === "NONE"
    ? "Member"
    : `${t.charAt(0)}${t.slice(1).toLowerCase()} Member`;

const statusTone = (s: string) =>
  s === "Delivered"
    ? "text-emerald"
    : s === "Cancelled"
    ? "text-burgundy"
    : "text-gold";

export function AccountClient({ user, orders, addresses, wishlist }: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside>
        <div className="glass-dark rounded-[var(--radius-luxe)] p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold/40 to-burgundy/40 font-display text-xl text-cream">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-cream">{user.name}</p>
              <p className="inline-flex items-center gap-1 text-xs text-gold">
                <Crown size={12} /> {tierLabel(user.tier)}
              </p>
            </div>
          </div>
          <nav className="mt-6 space-y-1">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  tab === id
                    ? "bg-gold/10 text-gold"
                    : "text-parchment hover:bg-[var(--hover-soft)] hover:text-cream"
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-2 flex w-full items-center gap-3 rounded-xl border-t border-hairline px-4 py-3 text-sm text-muted transition-colors hover:text-burgundy"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </nav>
        </div>
      </aside>

      {/* Content */}
      <div className="min-w-0">
        {tab === "overview" && <Overview user={user} />}
        {tab === "orders" && <Orders orders={orders} />}
        {tab === "wishlist" && <Wishlist items={wishlist} />}
        {tab === "addresses" && <Addresses addresses={addresses} />}
        {tab === "membership" && <Membership tier={user.tier} />}
        {tab === "rewards" && <Rewards user={user} />}
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-dark rounded-[var(--radius-luxe)] p-7 ${className}`}>{children}</div>;
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 font-display text-2xl text-cream">{children}</h2>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hairline bg-night/30 p-10 text-center text-sm text-muted">
      {text}
    </div>
  );
}

function Overview({ user }: { user: AccountUser }) {
  const stats = [
    { label: "Loyalty Points", value: user.loyaltyPoints.toLocaleString(), Icon: Sparkles },
    { label: "Orders", value: String(user.orderCount), Icon: Package },
    { label: "Saved to Wishlist", value: String(user.wishlistCount), Icon: Heart },
    { label: "Member Since", value: user.memberSince, Icon: Crown },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="!p-5">
            <s.Icon size={18} className="text-gold" />
            <p className="mt-3 font-display text-2xl text-cream">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </Card>
        ))}
      </div>
      <Card>
        <H>Profile</H>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info label="Full name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Membership" value={tierLabel(user.tier)} />
          <Info label="Member since" value={user.memberSince} />
        </div>
      </Card>
    </div>
  );
}

function Orders({ orders }: { orders: AccountOrder[] }) {
  return (
    <Card>
      <H>Order History</H>
      {orders.length === 0 ? (
        <EmptyState text="No orders yet — your future bottles will appear here." />
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-night/40 p-5"
            >
              <div>
                <p className="font-display text-cream">{o.id}</p>
                <p className="text-xs text-muted">
                  {o.date} · {o.items} item(s)
                </p>
              </div>
              <span className={`text-xs uppercase tracking-widest ${statusTone(o.status)}`}>
                ● {o.status}
              </span>
              <span className="font-display text-cream">{formatPrice(o.total)}</span>
              <Button variant="outline" size="sm">Track</Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Wishlist({ items }: { items: AccountWishlistItem[] }) {
  return (
    <Card>
      <H>Your Wishlist</H>
      {items.length === 0 ? (
        <EmptyState text="Your wishlist is empty. Tap the heart on any bottle to save it here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-2xl border border-hairline bg-night/40 p-4 text-center">
              <div className="flex h-28 items-center justify-center">
                <Bottle product={p} />
              </div>
              <p className="mt-3 font-display text-sm text-cream">{p.name}</p>
              <p className="text-xs text-gold">{formatPrice(p.price)}</p>
              <Button href={`/product/${p.slug}`} variant="outline" size="sm" className="mt-3">
                View
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Addresses({ addresses }: { addresses: AccountAddress[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AccountAddress | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string) {
    setBusy(id);
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  function closeModal() {
    setOpen(false);
    setEditing(null);
  }

  return (
    <Card>
      <H>Saved Addresses</H>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="rounded-2xl border border-hairline bg-night/40 p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-cream">{a.label}</p>
              <div className="flex items-center gap-2">
                {a.primary && <Badge tone="Best Seller">Primary</Badge>}
                <button
                  onClick={() => setEditing(a)}
                  aria-label="Edit address"
                  className="text-muted-2 transition-colors hover:text-gold"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => remove(a.id)}
                  disabled={busy === a.id}
                  aria-label="Delete address"
                  className="text-muted-2 transition-colors hover:text-burgundy"
                >
                  {busy === a.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted">{a.line}</p>
            {a.phone && <p className="mt-1 text-xs text-muted-2">{a.phone}</p>}
          </div>
        ))}
        <button
          onClick={() => setOpen(true)}
          className="flex min-h-[88px] items-center justify-center rounded-2xl border border-dashed border-hairline text-sm text-muted hover:border-gold/40 hover:text-gold"
        >
          + Add new address
        </button>
      </div>
      {addresses.length === 0 && (
        <p className="mt-4 text-xs text-muted">No saved addresses yet.</p>
      )}
      {(open || editing) && (
        <AddressModal
          editing={editing}
          onClose={closeModal}
          onSaved={() => {
            closeModal();
            router.refresh();
          }}
        />
      )}
    </Card>
  );
}

function AddressModal({
  editing,
  onClose,
  onSaved,
}: {
  editing?: AccountAddress | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    label: editing?.label ?? "Home",
    line1: editing?.line1 ?? "",
    city: editing?.city ?? "",
    postalCode: editing?.postalCode ?? "",
    phone: editing?.phone ?? "",
    isPrimary: editing?.primary ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch(
      editing ? `/api/addresses/${editing.id}` : "/api/addresses",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    setSaving(false);
    if (res.ok) onSaved();
    else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not save address.");
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={submit} className="glass-dark relative z-10 w-full max-w-md rounded-[var(--radius-luxe)] p-7">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">
            {editing ? "Edit Address" : "New Address"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} className="text-parchment hover:text-cream" />
          </button>
        </div>
        <div className="space-y-4">
          <AccountField label="Label" value={form.label} onChange={(v) => set("label", v)} required />
          <AccountField label="Street address" value={form.line1} onChange={(v) => set("line1", v)} placeholder="1 Park Avenue" required />
          <div className="grid grid-cols-2 gap-4">
            <AccountField label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="New York" required />
            <AccountField label="Postal code" value={form.postalCode} onChange={(v) => set("postalCode", v)} placeholder="10016" required />
          </div>
          <AccountField label="Phone" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+1 555 123 4567" type="tel" required />
          <label className="flex items-center gap-2 text-sm text-parchment">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => set("isPrimary", e.target.checked)}
              className="h-4 w-4 accent-[var(--color-gold)]"
            />
            Set as primary address
          </label>
          {error && <p className="text-xs text-burgundy">{error}</p>}
        </div>
        <Button type="submit" variant="gold" className="mt-6 w-full" disabled={saving}>
          {saving && <Loader2 size={16} className="animate-spin" />}
          {editing ? "Save Changes" : "Save Address"}
        </Button>
      </form>
    </div>
  );
}

function AccountField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
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

function Membership({ tier }: { tier: string }) {
  const active = tier !== "NONE";
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.2),transparent_70%)]" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[0.62rem] uppercase tracking-[0.22em] text-gold">
          <Crown size={13} /> {active ? `${tierLabel(tier)} · Active` : "Not a member yet"}
        </span>
        <h2 className="mt-5 font-display text-3xl text-cream">Your membership</h2>
        <p className="mt-2 text-muted">
          {active ? "Renews annually · $240 / year" : "Upgrade to unlock the full BottleExpress experience."}
        </p>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            "Early access to allocated bottles",
            "Member-only pricing",
            "Priority 90-minute delivery",
            "Complimentary gift wrapping",
            "Private virtual tastings",
            "Dedicated spirits advisor",
          ].map((b) => (
            <div key={b} className="flex items-center gap-3 rounded-xl border border-hairline bg-night/40 p-4 text-sm text-parchment">
              <Star size={14} className="fill-gold text-gold" /> {b}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="gold">{active ? "Manage Plan" : "Become a Member"}</Button>
          <Button variant="outline">Billing History</Button>
        </div>
      </div>
    </Card>
  );
}

function Rewards({ user }: { user: AccountUser }) {
  const credit = user.loyaltyPoints / 100;
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-10 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,92,70,0.25),transparent_70%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow">Loyalty Balance</p>
            <p className="mt-2 font-display text-5xl text-gold-gradient">
              {user.loyaltyPoints.toLocaleString()}
            </p>
            <p className="text-sm text-muted">
              points · worth {formatPrice(credit)} in credit
            </p>
          </div>
          <Button variant="gold">Redeem Points</Button>
        </div>
      </Card>

      <Card>
        <H>Refer &amp; Earn</H>
        <p className="text-sm text-muted">
          Gift friends $25 off their first order — and earn 2,500 points for each
          one who joins.
        </p>
        <div className="mt-5 flex gap-2">
          <input
            readOnly
            value={`bottleexpress.club/r/${user.referralCode.slice(0, 8).toUpperCase()}`}
            className="h-11 flex-1 rounded-full border border-hairline bg-night/60 px-4 text-sm text-cream"
          />
          <Button variant="gold">Copy Link</Button>
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-night/40 p-4">
      <p className="text-[0.6rem] uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 truncate text-sm text-cream">{value}</p>
    </div>
  );
}
