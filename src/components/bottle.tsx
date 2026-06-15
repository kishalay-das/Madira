import Image from "next/image";
import type { CategorySlug, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Renders a product's bottle. If an uploaded photo (`product.image`) exists it
 * is shown; otherwise a procedurally-rendered luxury SVG bottle is drawn from
 * the palette so a product is never without a visual.
 */

interface BottleProps {
  product: Pick<
    Product,
    "palette" | "name" | "category" | "distillery" | "images"
  >;
  className?: string;
  sizes?: string;
  /** Force the procedural SVG bottle even when the product has a photo. */
  procedural?: boolean;
}

type Silhouette = "tall" | "wine" | "flute" | "squat" | "box";

const silhouetteFor: Record<CategorySlug, Silhouette> = {
  whiskey: "squat",
  wine: "wine",
  champagne: "flute",
  vodka: "tall",
  gin: "tall",
  rum: "squat",
  tequila: "tall",
  "craft-beer": "squat",
  "gift-boxes": "box",
};

export function Bottle({ product, className, sizes, procedural }: BottleProps) {
  // Use the first image (the bottle cover); fall back to the procedural bottle.
  const img = procedural ? undefined : product.images?.[0];
  if (img) {
    return (
      <span
        className={cn(
          "relative block h-full max-w-full [aspect-ratio:3/4]",
          className
        )}
      >
        <Image
          src={img}
          alt={product.name}
          fill
          sizes={sizes ?? "(max-width: 768px) 45vw, 320px"}
          className="object-contain"
          unoptimized={img.startsWith("data:")}
        />
      </span>
    );
  }

  const { glass, liquid, label } = product.palette;
  const shape = silhouetteFor[product.category] ?? "tall";
  const uid = product.name.replace(/[^a-z0-9]/gi, "");

  return (
    <svg
      viewBox="0 0 120 320"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={`${product.name} bottle`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={glass} stopOpacity="0.55" />
          <stop offset="22%" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="50%" stopColor={glass} />
          <stop offset="80%" stopColor="#000000" stopOpacity="0.55" />
          <stop offset="100%" stopColor={glass} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`liquid-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={liquid} stopOpacity="0.7" />
          <stop offset="40%" stopColor={liquid} />
          <stop offset="75%" stopColor="#000000" stopOpacity="0.4" />
          <stop offset="100%" stopColor={liquid} stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id={`shine-${uid}`} cx="0.35" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {shape === "box" ? (
        <Box uid={uid} liquid={liquid} label={label} />
      ) : (
        <BottleShape
          shape={shape}
          uid={uid}
          label={label}
          distillery={product.distillery}
        />
      )}
    </svg>
  );
}

function BottleShape({
  shape,
  uid,
  label,
}: {
  shape: Exclude<Silhouette, "box">;
  uid: string;
  label: string;
  distillery: string;
}) {
  // Body path per silhouette
  const bodies: Record<Exclude<Silhouette, "box">, string> = {
    tall:
      "M52 44 L52 70 Q40 78 40 100 L40 286 Q40 300 54 300 L66 300 Q80 300 80 286 L80 100 Q80 78 68 70 L68 44 Z",
    squat:
      "M48 50 L48 78 Q34 88 34 116 L34 282 Q34 300 52 300 L68 300 Q86 300 86 282 L86 116 Q86 88 72 78 L72 50 Z",
    wine:
      "M53 40 L53 96 Q38 112 38 168 L38 284 Q38 300 54 300 L66 300 Q82 300 82 284 L82 168 Q82 112 67 96 L67 40 Z",
    flute:
      "M52 44 L52 92 Q42 108 41 150 L36 286 Q36 300 52 300 L68 300 Q84 300 84 286 L79 150 Q78 108 68 92 L68 44 Z",
  };

  return (
    <g>
      {/* Cap / cork */}
      <rect x="50" y="18" width="20" height="28" rx="3" fill="#0e0e12" />
      <rect x="50" y="18" width="20" height="8" rx="3" fill={label} opacity="0.85" />
      {/* Neck collar */}
      <rect x="49" y="42" width="22" height="5" rx="2" fill="#0b0b0f" opacity="0.7" />

      {/* Body */}
      <path d={bodies[shape]} fill={`url(#glass-${uid})`} stroke="#000" strokeOpacity="0.25" strokeWidth="0.6" />
      {/* Liquid fill (clipped to lower body via a slightly inset path) */}
      <path
        d={bodies[shape]}
        fill={`url(#liquid-${uid})`}
        opacity="0.92"
        transform="translate(0,0)"
        clipPath={`url(#fill-${uid})`}
      />
      <clipPath id={`fill-${uid}`}>
        <rect x="30" y="150" width="60" height="160" />
      </clipPath>

      {/* Specular highlight */}
      <ellipse cx="50" cy="120" rx="6" ry="70" fill={`url(#shine-${uid})`} />

      {/* Label */}
      <rect x="42" y="196" width="36" height="68" rx="3" fill={label} opacity="0.95" />
      <rect x="42" y="196" width="36" height="68" rx="3" fill="none" stroke="#000" strokeOpacity="0.12" />
      <line x1="48" y1="210" x2="72" y2="210" stroke="#000" strokeOpacity="0.25" strokeWidth="0.8" />
      <line x1="50" y1="232" x2="70" y2="232" stroke="#000" strokeOpacity="0.18" strokeWidth="0.6" />
      <line x1="52" y1="240" x2="68" y2="240" stroke="#000" strokeOpacity="0.14" strokeWidth="0.6" />
      <circle cx="60" cy="222" r="5" fill="none" stroke="#000" strokeOpacity="0.3" strokeWidth="0.7" />
    </g>
  );
}

function Box({
  uid,
  liquid,
  label,
}: {
  uid: string;
  liquid: string;
  label: string;
}) {
  return (
    <g>
      {/* Lid */}
      <rect x="22" y="70" width="76" height="20" rx="3" fill={liquid} />
      <rect x="22" y="70" width="76" height="6" rx="3" fill="#ffffff" opacity="0.12" />
      {/* Box body */}
      <rect x="22" y="88" width="76" height="190" rx="4" fill={`url(#glass-${uid})`} />
      <rect x="22" y="88" width="76" height="190" rx="4" fill="none" stroke={label} strokeOpacity="0.5" />
      {/* Ribbon vertical */}
      <rect x="55" y="70" width="10" height="208" fill={label} opacity="0.85" />
      {/* Ribbon horizontal */}
      <rect x="22" y="172" width="76" height="10" fill={label} opacity="0.85" />
      {/* Bow */}
      <circle cx="60" cy="177" r="7" fill={liquid} stroke={label} strokeWidth="1.2" />
      <path d="M60 177 L44 168 L44 186 Z" fill={label} opacity="0.9" />
      <path d="M60 177 L76 168 L76 186 Z" fill={label} opacity="0.9" />
    </g>
  );
}
