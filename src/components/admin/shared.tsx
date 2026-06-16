"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Box, CheckCircle2, X, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Constants shared across admin modules
 * ------------------------------------------------------------------ */

export const LOW_STOCK_THRESHOLD = 8;

export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

export const PAYMENT_LABELS: Record<string, string> = {
  card: "Credit Card",
  wallet: "Apple / Google Pay",
  cod: "Cash on Delivery",
};

export const statusTone: Record<string, string> = {
  DELIVERED: "text-emerald",
  PROCESSING: "text-gold",
  IN_TRANSIT: "text-[#7fbfff]",
  PENDING: "text-muted",
  CANCELLED: "text-burgundy",
};

export const BADGES = ["", "Best Seller", "Limited", "New", "Rare", "Award Winner"];
export const MAX_IMAGES = 4;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

export async function uploadToCloudinary(
  file: File
): Promise<{ url: string; resourceType: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || "Upload failed.");
  }
  return res.json();
}

export const csvToArray = (s: string) =>
  s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

/* ------------------------------------------------------------------ *
 * Toast system — lightweight, dependency-free
 * ------------------------------------------------------------------ */

type ToastTone = "success" | "error";
interface ToastItem {
  id: number;
  msg: string;
  tone: ToastTone;
}

const ToastCtx = createContext<(msg: string, tone?: ToastTone) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((msg: string, tone: ToastTone = "success") => {
    const id = (idRef.current += 1);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[120] flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-hairline bg-[var(--glass-bg)] px-4 py-3 text-sm text-cream shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-[toastIn_0.28s_var(--ease-silk)]"
          >
            {t.tone === "success" ? (
              <CheckCircle2 size={16} className="text-emerald" />
            ) : (
              <XCircle size={16} className="text-burgundy" />
            )}
            <span className="max-w-[18rem]">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------------------------------------------ *
 * Skeleton — async loading placeholder
 * ------------------------------------------------------------------ */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-graphite/60 ${className}`} />;
}

/* ------------------------------------------------------------------ *
 * Sparkline — tiny inline SVG trend (no charting dependency)
 * ------------------------------------------------------------------ */

export function Sparkline({
  data,
  className = "",
  stroke = "var(--color-gold)",
  fill = "var(--color-gold)",
}: {
  data: number[];
  className?: string;
  stroke?: string;
  fill?: string;
}) {
  if (data.length < 2) return null;
  const w = 100;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => h - ((v - min) / range) * (h - 4) - 2;
  const line = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const uid = `spark-${data.length}-${Math.round(max)}-${Math.round(min)}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.28" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${uid})`} />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Layout / form primitives
 * ------------------------------------------------------------------ */

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-dark rounded-[var(--radius-luxe)] p-6 ${className}`}>
      {children}
    </div>
  );
}

export function FormGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[0.62rem] uppercase tracking-widest text-gold">{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function SelectField({
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
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-widest text-muted">
        {label}
      </span>
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

export function TextAreaField({
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
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-widest text-muted">
        {label}
      </span>
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

export function ColorField({
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
      <span className="mb-1 block text-[0.55rem] uppercase tracking-widest text-muted">
        {label}
      </span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full cursor-pointer rounded-lg border border-hairline bg-night"
      />
    </label>
  );
}

export function AdminField({
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
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-widest text-muted">
        {label}
      </span>
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

/* ------------------------------------------------------------------ *
 * Segment (Premium / Standard) filter toggle
 * ------------------------------------------------------------------ */

export function SegmentToggle({
  value,
  onChange,
  counts,
}: {
  value: "PREMIUM" | "STANDARD";
  onChange: (s: "PREMIUM" | "STANDARD") => void;
  counts: { PREMIUM: number; STANDARD: number };
}) {
  return (
    <div className="inline-flex rounded-full border border-hairline bg-night/40 p-1">
      {(["PREMIUM", "STANDARD"] as const).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
            value === s ? "bg-gold text-ink" : "text-muted hover:text-cream"
          }`}
        >
          {s === "PREMIUM" ? "Premium" : "Standard"} ({counts[s]})
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Detail-view primitives (shared by Orders / Customers / Coupons)
 * ------------------------------------------------------------------ */

export function DetailModal({
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
  // Close on Escape for fast keyboard-driven workflows.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 py-8">
      <div
        className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass-dark relative z-10 my-auto w-full max-w-lg rounded-[var(--radius-luxe)] p-6 sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-xl text-cream">{title}</h2>
            {subtitle && (
              <p className="mt-1 truncate text-xs text-muted">{subtitle}</p>
            )}
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

export function DetailRow({
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

export function ProfileStat({
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

export function Money({
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
