import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Numbered page controls — Prev · 1 … 4 5 6 … N · Next.
 *
 * Dual-mode:
 *  - Client lists: pass `onPageChange` (renders buttons).
 *  - Server pages: pass `hrefFor(page)` (renders <Link>s so the URL drives state).
 *
 * Pass exactly one of `onPageChange` / `hrefFor`.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  hrefFor,
  className,
}: {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  hrefFor?: (page: number) => string;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  const pages = pageRange(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn("mt-8 flex items-center justify-center gap-1.5", className)}
    >
      <PageControl
        page={page - 1}
        disabled={page <= 1}
        ariaLabel="Previous page"
        onPageChange={onPageChange}
        hrefFor={hrefFor}
      >
        <ChevronLeft size={16} />
      </PageControl>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            className="px-1.5 text-sm text-muted-2 select-none"
            aria-hidden
          >
            …
          </span>
        ) : (
          <PageControl
            key={p}
            page={p}
            current={p === page}
            ariaLabel={`Page ${p}`}
            onPageChange={onPageChange}
            hrefFor={hrefFor}
          >
            {p}
          </PageControl>
        )
      )}

      <PageControl
        page={page + 1}
        disabled={page >= pageCount}
        ariaLabel="Next page"
        onPageChange={onPageChange}
        hrefFor={hrefFor}
      >
        <ChevronRight size={16} />
      </PageControl>
    </nav>
  );
}

function PageControl({
  page,
  current = false,
  disabled = false,
  ariaLabel,
  onPageChange,
  hrefFor,
  children,
}: {
  page: number;
  current?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onPageChange?: (page: number) => void;
  hrefFor?: (page: number) => string;
  children: React.ReactNode;
}) {
  const cls = cn(
    "flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm transition-colors",
    current
      ? "border-gold/60 bg-gold/15 text-gold"
      : "border-hairline text-parchment hover:border-gold/40 hover:text-cream",
    disabled && "pointer-events-none opacity-40"
  );

  // Link mode (server pages): a disabled control renders as a plain span.
  if (hrefFor) {
    if (disabled) {
      return (
        <span className={cls} aria-disabled aria-label={ariaLabel}>
          {children}
        </span>
      );
    }
    return (
      <Link
        href={hrefFor(page)}
        aria-label={ariaLabel}
        aria-current={current ? "page" : undefined}
        className={cls}
      >
        {children}
      </Link>
    );
  }

  // Button mode (client lists).
  return (
    <button
      type="button"
      onClick={() => onPageChange?.(page)}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={current ? "page" : undefined}
      className={cls}
    >
      {children}
    </button>
  );
}

/**
 * Build a compact page list with ellipses, e.g. for page 7 of 20:
 * [1, "…", 6, 7, 8, "…", 20]. Always shows first/last and a window of
 * neighbours around the current page.
 */
function pageRange(page: number, pageCount: number): (number | "…")[] {
  const span = 1; // neighbours on each side of the current page
  const out: (number | "…")[] = [];
  const push = (n: number) => out.push(n);

  const lo = Math.max(2, page - span);
  const hi = Math.min(pageCount - 1, page + span);

  push(1);
  if (lo > 2) out.push("…");
  for (let n = lo; n <= hi; n++) push(n);
  if (hi < pageCount - 1) out.push("…");
  if (pageCount > 1) push(pageCount);

  return out;
}
