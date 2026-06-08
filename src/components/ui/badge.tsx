import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  "Best Seller": "bg-gold/15 text-gold border-gold/30",
  Limited: "bg-burgundy/20 text-[#e58aa0] border-burgundy/40",
  New: "bg-emerald/20 text-[#7fd9b4] border-emerald/40",
  Rare: "bg-[#b5712f]/20 text-[#e0a86a] border-[#b5712f]/40",
  "Award Winner": "bg-champagne/15 text-champagne border-champagne/30",
};

export function Badge({
  children,
  tone,
  className,
}: {
  children: string;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.18em] backdrop-blur-sm",
        tone ? tones[tone] ?? "bg-[var(--hover-soft)] text-parchment border-hairline" : "bg-[var(--hover-soft)] text-parchment border-hairline",
        className
      )}
    >
      {children}
    </span>
  );
}
