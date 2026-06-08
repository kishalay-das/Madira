import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-50 disabled:pointer-events-none shimmer";

const variants: Record<Variant, string> = {
  primary:
    "bg-cream text-night hover:brightness-110 hover:shadow-[0_18px_40px_-18px_rgba(120,120,120,0.4)]",
  gold: "bg-gradient-to-b from-gold-bright to-gold text-ink hover:shadow-[0_18px_44px_-16px_rgba(200,162,75,0.7)]",
  outline:
    "border border-gold/40 text-cream hover:border-gold hover:bg-gold/10",
  ghost: "text-parchment hover:text-cream hover:bg-[var(--hover-soft)]",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-sm md:h-13 md:px-8 md:text-base",
};

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
