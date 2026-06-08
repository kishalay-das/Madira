import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  size = 14,
  className,
  showValue = false,
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(value);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-gold text-gold" : "text-muted-2"}
              strokeWidth={1.5}
            />
          );
        })}
      </span>
      {showValue && (
        <span className="text-xs text-muted tabular-nums">{value.toFixed(1)}</span>
      )}
    </span>
  );
}
