"use client";

import { useMode } from "./mode-provider";

/** Segmented Premium / Standard storefront switch. */
export function ModeToggle({
  className = "",
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "full";
}) {
  const { mode, setMode } = useMode();
  const pad = size === "full" ? "px-4 py-2 text-xs" : "px-3 py-1 text-[0.6rem]";

  return (
    <div
      role="tablist"
      aria-label="Storefront mode"
      className={`inline-flex items-center rounded-full border border-hairline bg-night/40 p-0.5 uppercase tracking-[0.16em] ${
        size === "full" ? "w-full" : ""
      } ${className}`}
    >
      {(["premium", "standard"] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            role="tab"
            aria-selected={active}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-full transition-colors ${pad} ${
              active
                ? "bg-gradient-to-b from-gold-bright to-gold font-medium text-ink"
                : "text-muted hover:text-cream"
            }`}
          >
            {m === "premium" ? "Premium" : "Standard"}
          </button>
        );
      })}
    </div>
  );
}
