"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

/**
 * Elegant animated sun/moon toggle with cross-fade + rotation micro-interaction.
 * Variant "icon" = compact circular button (desktop nav).
 * Variant "full" = labelled pill row (mobile menu).
 */
export function ThemeToggle({
  className,
  variant = "icon",
}: {
  className?: string;
  variant?: "icon" | "full";
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = `Switch to ${isDark ? "light" : "dark"} mode`;

  if (variant === "full") {
    return (
      <button
        onClick={toggle}
        aria-label={label}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border border-hairline bg-night/40 px-4 py-3 transition-colors hover:border-gold/40",
          className
        )}
      >
        <span className="flex items-center gap-3 text-sm text-cream">
          <Icons isDark={isDark} />
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
        {/* mini switch */}
        <span
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full border border-hairline transition-colors",
            isDark ? "bg-graphite" : "bg-gold/30"
          )}
        >
          <span
            className={cn(
              "absolute h-4.5 w-4.5 rounded-full bg-gradient-to-b from-gold-bright to-gold shadow transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isDark ? "translate-x-1" : "translate-x-5.5"
            )}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-hairline text-cream transition-all duration-500 hover:border-gold/50 hover:text-gold active:scale-90",
        className
      )}
    >
      {/* hover glow */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.25),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <Icons isDark={isDark} />
    </button>
  );
}

function Icons({ isDark }: { isDark: boolean }) {
  return (
    <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center">
      <Sun
        size={18}
        className={cn(
          "absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
      />
      <Moon
        size={18}
        className={cn(
          "absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        )}
      />
    </span>
  );
}
