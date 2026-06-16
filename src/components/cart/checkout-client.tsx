"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Gift,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";

const COD_FEE = 1; // cash-on-delivery handling surcharge
import { formatPrice } from "@/lib/utils";
import { Bottle } from "@/components/bottle";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useGeolocation } from "@/hooks/use-geolocation";

const FREE_SHIPPING = 150;

interface AppliedCoupon {
  code: string;
  percentOff: number | null;
  amountOff: number | null;
}

export interface CheckoutAddress {
  id: string;
  label: string;
  name: string;
  line: string;
  city: string;
  postalCode: string;
  primary: boolean;
}

export function CheckoutClient({
  isAuthed = false,
  addresses = [],
}: {
  isAuthed?: boolean;
  addresses?: CheckoutAddress[];
}) {
  const router = useRouter();
  const { items, setQty, remove, subtotal, clear } = useCart();
  const geo = useGeolocation();
  const [gift, setGift] = useState(false);
  const [payment, setPayment] = useState("card");
  const [slot, setSlot] = useState("priority");
  const [promo, setPromo] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(
    addresses.find((a) => a.primary)?.id ?? addresses[0]?.id ?? null
  );
  const [addingAddr, setAddingAddr] = useState(addresses.length === 0);
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrErr, setAddrErr] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState({
    label: "Home",
    line1: "",
    city: "",
    postalCode: "",
  });

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddrErr(null);
    setSavingAddr(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAddr, isPrimary: addresses.length === 0 }),
      });
      if (res.status === 401) {
        router.push("/login?callbackUrl=/cart");
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Could not save address.");
      }
      const data = await res.json();
      setAddressId(data.address.id);
      setAddingAddr(false);
      setNewAddr({ label: "Home", line1: "", city: "", postalCode: "" });
      router.refresh();
    } catch (err) {
      setAddrErr(err instanceof Error ? err.message : "Could not save address.");
    } finally {
      setSavingAddr(false);
    }
  }

  const sub = subtotal();
  const discount = coupon
    ? coupon.percentOff
      ? (sub * coupon.percentOff) / 100
      : coupon.amountOff
      ? Math.min(coupon.amountOff, sub)
      : 0
    : 0;
  const shipping = sub - discount >= FREE_SHIPPING || sub === 0 ? 0 : 12;
  const giftFee = gift ? 9 : 0;
  const codFee = payment === "cod" ? COD_FEE : 0;
  const tax = (sub - discount) * 0.08;
  const total = sub - discount + shipping + giftFee + tax + codFee;

  async function applyCoupon() {
    const code = promo.trim();
    setCouponMsg(null);
    if (!code) return;
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.valid) {
        setCoupon({
          code: data.code,
          percentOff: data.percentOff,
          amountOff: data.amountOff,
        });
        setCouponMsg(
          `✦ ${data.code} applied${
            data.percentOff
              ? ` — ${data.percentOff}% off`
              : data.amountOff
              ? ` — ${formatPrice(data.amountOff)} off`
              : ""
          }`
        );
      } else {
        setCoupon(null);
        setCouponMsg("That code isn't valid.");
      }
    } catch {
      setCouponMsg("Couldn't validate that code.");
    }
  }

  async function placeOrder() {
    setError(null);
    if (isAuthed && !addressId) {
      setError("Please add or select a delivery address before placing your order.");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.product.slug, qty: i.qty })),
          deliverySlot: slot,
          giftWrap: gift,
          paymentMethod: payment,
          couponCode: coupon?.code,
          addressId: addressId ?? undefined,
          // Optional delivery pin — only sent when the customer shared it.
          deliveryLat: geo.coords?.lat,
          deliveryLng: geo.coords?.lng,
          deliveryAccuracy: geo.coords?.accuracy,
        }),
      });
      if (res.status === 401) {
        router.push("/login?callbackUrl=/cart");
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Could not place your order.");
      }
      const data = await res.json();
      setOrderNumber(data.order.number);
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPlacing(false);
    }
  }

  if (orderNumber) {
    return (
      <div className="glass-dark mx-auto max-w-lg rounded-[var(--radius-luxe)] p-10 text-center">
        <CheckCircle2 size={56} className="mx-auto text-emerald" />
        <h2 className="mt-6 font-display text-3xl text-cream">Order confirmed</h2>
        <p className="mt-3 text-muted">
          Thank you. Your concierge is preparing your order — you&apos;ll receive
          live tracking shortly. Order{" "}
          <span className="text-gold">{orderNumber}</span>.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/account" variant="gold">Track Order</Button>
          <Button href="/shop" variant="outline">Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass-dark mx-auto max-w-lg rounded-[var(--radius-luxe)] p-12 text-center">
        <h2 className="font-display text-2xl text-cream">Your cart is empty</h2>
        <p className="mt-3 text-muted">Discover something extraordinary for your cellar.</p>
        <Button href="/shop" variant="gold" className="mt-6">Explore the Collection</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
      {/* Left: details */}
      <div className="space-y-8">
        {/* Items */}
        <Section title="Your Items">
          <ul className="divide-y divide-[color:var(--color-hairline)]">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex gap-4 py-5">
                <Link
                  href={`/product/${product.slug}`}
                  className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `radial-gradient(circle at 50% 20%, ${product.palette.liquid}33, transparent 70%)` }}
                >
                  <div className="h-20"><Bottle product={product} /></div>
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-display text-cream">{product.name}</p>
                      <p className="text-xs text-muted">{product.categoryLabel} · {product.volume}</p>
                    </div>
                    <button onClick={() => remove(product.id)} className="text-muted-2 hover:text-burgundy" aria-label="Remove">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-hairline">
                      <button onClick={() => setQty(product.id, qty - 1)} className="flex h-9 w-9 items-center justify-center text-parchment hover:text-gold" aria-label="Decrease"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm tabular-nums text-cream">{qty}</span>
                      <button onClick={() => setQty(product.id, qty + 1)} className="flex h-9 w-9 items-center justify-center text-parchment hover:text-gold" aria-label="Increase"><Plus size={14} /></button>
                    </div>
                    <span className="font-display text-cream">{formatPrice(product.price * qty)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={clear} className="mt-2 text-xs uppercase tracking-[0.16em] text-muted hover:text-burgundy">
            Clear cart
          </button>
        </Section>

        {/* Delivery address — required */}
        <Section title="Delivery Address">
          {!isAuthed ? (
            <div className="rounded-2xl border border-dashed border-hairline bg-night/30 p-6 text-center">
              <p className="text-sm text-muted">
                Sign in to add a delivery address and place your order.
              </p>
              <Button href="/login?callbackUrl=/cart" variant="gold" size="sm" className="mt-3">
                Sign in
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAddressId(a.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        addressId === a.id
                          ? "border-gold bg-gold/10"
                          : "border-hairline hover:border-gold/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-cream">{a.label}</span>
                        {a.primary && (
                          <span className="rounded-full border border-gold/30 px-2 py-0.5 text-[0.55rem] uppercase tracking-widest text-gold">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{a.line}</p>
                    </button>
                  ))}
                </div>
              )}

              {addingAddr ? (
                <form
                  onSubmit={saveAddress}
                  className="space-y-3 rounded-2xl border border-hairline bg-night/40 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field
                      label="Label"
                      placeholder="Home"
                      value={newAddr.label}
                      onChange={(v) => setNewAddr((p) => ({ ...p, label: v }))}
                      required
                    />
                    <Field
                      label="Street address"
                      placeholder="1 Park Avenue"
                      value={newAddr.line1}
                      onChange={(v) => setNewAddr((p) => ({ ...p, line1: v }))}
                      required
                    />
                    <Field
                      label="City"
                      placeholder="New York"
                      value={newAddr.city}
                      onChange={(v) => setNewAddr((p) => ({ ...p, city: v }))}
                      required
                    />
                    <Field
                      label="Postal code"
                      placeholder="10016"
                      value={newAddr.postalCode}
                      onChange={(v) => setNewAddr((p) => ({ ...p, postalCode: v }))}
                      required
                    />
                  </div>
                  {addrErr && <p className="text-xs text-burgundy">{addrErr}</p>}
                  <div className="flex items-center gap-2">
                    <Button type="submit" variant="gold" size="sm" disabled={savingAddr}>
                      {savingAddr && <Loader2 size={14} className="animate-spin" />}
                      Save address
                    </Button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setAddingAddr(false)}
                        className="text-xs uppercase tracking-[0.16em] text-muted hover:text-cream"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingAddr(true)}
                  className="rounded-full border border-gold/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold/10"
                >
                  + Add a new address
                </button>
              )}
            </div>
          )}
        </Section>

        {/* Delivery scheduling */}
        <Section title="Delivery Schedule">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { id: "priority", label: "Priority", note: "Within 90 minutes", price: "+$12" },
              { id: "standard", label: "Standard", note: "Same day, 4-hr window", price: "Free over $150" },
              { id: "scheduled", label: "Scheduled", note: "Pick a date & time", price: "Free" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSlot(s.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  slot === s.id ? "border-gold bg-gold/10" : "border-hairline hover:border-gold/40"
                }`}
              >
                <CalendarClock size={18} className="text-gold" />
                <p className="mt-2 font-display text-cream">{s.label}</p>
                <p className="text-xs text-muted">{s.note}</p>
                <p className="mt-1 text-xs text-gold">{s.price}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* Payment */}
        <Section title="Payment Method">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { id: "card", label: "Credit Card", Icon: CreditCard },
              { id: "wallet", label: "Apple / Google Pay", Icon: Wallet },
              { id: "cod", label: "Cash on Delivery", Icon: Banknote },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setPayment(id)}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                  payment === id ? "border-gold bg-gold/10" : "border-hairline hover:border-gold/40"
                }`}
              >
                <Icon size={18} className="text-gold" />
                <span className="text-sm text-cream">{label}</span>
              </button>
            ))}
          </div>
          {payment === "card" && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Card number" placeholder="4242 4242 4242 4242" className="sm:col-span-2" />
              <Field label="Expiry" placeholder="12 / 28" />
              <Field label="CVC" placeholder="123" />
            </div>
          )}
          {payment === "cod" && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
              <Banknote size={18} className="mt-0.5 shrink-0 text-gold" />
              <p className="text-sm text-parchment">
                Pay in <span className="text-cream">cash</span> when your order arrives —
                no card or online payment needed. A{" "}
                <span className="text-gold">{formatPrice(COD_FEE)}</span> handling fee
                applies. ID verified on delivery (21+).
              </p>
            </div>
          )}
        </Section>
      </div>

      {/* Right: summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="glass-dark rounded-[var(--radius-luxe)] p-7">
          <h2 className="font-display text-xl text-cream">Order Summary</h2>

          {/* Gift wrap */}
          <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl border border-hairline bg-night/40 p-4">
            <span className="flex items-center gap-3 text-sm text-cream">
              <Gift size={18} className="text-gold" /> Add luxury gift wrapping
            </span>
            <input
              type="checkbox"
              checked={gift}
              onChange={(e) => setGift(e.target.checked)}
              className="h-5 w-5 accent-[var(--color-gold)]"
            />
          </label>

          {/* Promo */}
          <div className="mt-4 flex gap-2">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Promo code (try VIP10)"
              className="h-11 flex-1 rounded-full border border-hairline bg-night/60 px-4 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
            />
            <button
              onClick={applyCoupon}
              className="h-11 shrink-0 rounded-full border border-gold/40 px-5 text-xs uppercase tracking-widest text-gold hover:bg-gold/10"
            >
              Apply
            </button>
          </div>
          {couponMsg && (
            <p className={`mt-2 text-xs ${coupon ? "text-emerald" : "text-burgundy"}`}>
              {couponMsg}
            </p>
          )}

          {/* Totals */}
          <div className="mt-6 space-y-3 border-t border-hairline pt-6 text-sm">
            <Row label="Subtotal" value={formatPrice(sub)} />
            {discount > 0 && <Row label="Discount" value={`−${formatPrice(discount)}`} accent />}
            <Row label="Delivery" value={shipping === 0 ? "Complimentary" : formatPrice(shipping)} />
            {gift && <Row label="Gift wrapping" value={formatPrice(giftFee)} />}
            {codFee > 0 && <Row label="Cash on delivery" value={formatPrice(codFee)} />}
            <Row label="Estimated tax" value={formatPrice(tax)} />
            <div className="flex items-center justify-between border-t border-hairline pt-4">
              <span className="text-cream">Total</span>
              <span className="font-display text-2xl text-cream">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Delivery location (optional) — helps the courier find you.
              Never auto-prompts: the native dialog only opens on the button. */}
          <div className="mt-6 rounded-xl border border-hairline bg-night/40 p-4">
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-cream">Share your delivery location</p>
                <p className="mt-0.5 text-xs text-muted">
                  Optional. We pin your current spot on a map so the courier can
                  reach your door faster. Your address is still required.
                </p>

                {geo.status === "success" && geo.coords && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald">
                    <CheckCircle2 size={13} /> Location shared · accurate to ~
                    {Math.round(geo.coords.accuracy)} m
                  </p>
                )}
                {geo.status === "insecure" && (
                  <p className="mt-2 text-xs text-muted">
                    Location needs a secure (HTTPS) connection — skipping is fine.
                  </p>
                )}
                {geo.status === "unsupported" && (
                  <p className="mt-2 text-xs text-muted">
                    Your browser doesn’t support location — skipping is fine.
                  </p>
                )}
                {(geo.status === "denied" ||
                  geo.status === "unavailable" ||
                  geo.status === "timeout") && (
                  <p className="mt-2 text-xs text-burgundy">{geo.error}</p>
                )}

                {(geo.status === "idle" ||
                  geo.status === "loading" ||
                  geo.status === "denied" ||
                  geo.status === "unavailable" ||
                  geo.status === "timeout") && (
                  <button
                    type="button"
                    onClick={geo.request}
                    disabled={geo.status === "loading"}
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-xs uppercase tracking-widest text-gold transition-colors hover:bg-gold/10 disabled:opacity-60"
                  >
                    {geo.status === "loading" ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Locating…
                      </>
                    ) : geo.status === "idle" ? (
                      <>
                        <MapPin size={13} /> Enable location
                      </>
                    ) : (
                      <>
                        <MapPin size={13} /> Try again
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-burgundy/40 bg-burgundy/15 px-4 py-2.5 text-xs text-[#e58aa0]">
              {error}
            </p>
          )}
          <Button
            variant="gold"
            size="lg"
            className="mt-6 w-full"
            onClick={placeOrder}
            disabled={placing || (isAuthed && !addressId)}
          >
            {placing && <Loader2 size={16} className="animate-spin" />}
            Place Order · {formatPrice(total)}
          </Button>
          {isAuthed && !addressId && (
            <p className="mt-2 text-center text-xs text-muted">
              Add a delivery address above to place your order.
            </p>
          )}
          <p className="mt-3 text-center text-[0.7rem] text-muted">
            🔒 Encrypted &amp; secure · ID verified on delivery (21+) · Sign-in required
          </p>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-dark rounded-[var(--radius-luxe)] p-7">
      <h2 className="mb-5 font-display text-xl text-cream">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  placeholder,
  className = "",
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-widest text-muted">{label}</span>
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        required={required}
        className="h-11 w-full rounded-xl border border-hairline bg-night/60 px-4 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
      />
    </label>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={accent ? "text-emerald" : "text-cream"}>{value}</span>
    </div>
  );
}
