/**
 * Branded route-loading screen — a bottle whose liquid rises and falls, with a
 * dripping cap, glass light-sweep, rising bubbles and two orbiting rings. Pure
 * SVG + CSS (keyframes in globals.css), so it works offline and uses the accent
 * token — gold on Premium, blue on Standard, automatically.
 */
export default function Loading() {
  // 128-unit-wide wave (two 64-unit periods) → translating −64px loops cleanly.
  const wave = "M0 44 q16 -7 32 0 t32 0 t32 0 t32 0 L128 92 L0 92 Z";
  const interior =
    "M30 11 H34 V23 C34 28 42 29 42 39 V75 C42 79 39 81 35 81 H29 C25 81 22 79 22 75 V39 C22 29 30 28 30 23 Z";

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-7">
      <svg
        viewBox="0 0 64 92"
        className="h-28 w-28 text-gold"
        role="img"
        aria-label="Loading"
      >
        <defs>
          <clipPath id="ld-interior">
            <path d={interior} />
          </clipPath>
          <linearGradient id="ld-liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Orbiting rings (behind) */}
        <circle
          cx="32" cy="46" r="30" fill="none" stroke="currentColor"
          strokeOpacity="0.14" strokeWidth="1" strokeDasharray="2 9"
          style={{ transformBox: "fill-box", transformOrigin: "center", animation: "spin-slow 7s linear infinite" }}
        />
        <circle
          cx="32" cy="46" r="25" fill="none" stroke="currentColor"
          strokeOpacity="0.1" strokeWidth="1" strokeDasharray="1 7"
          style={{ transformBox: "fill-box", transformOrigin: "center", animation: "spin-slow 11s linear infinite reverse" }}
        />

        {/* Droplet from the cap */}
        <circle
          cx="32" cy="11" r="1.7" fill="currentColor"
          style={{ transformBox: "fill-box", transformOrigin: "center", animation: "loaderDrip 1.8s ease-in infinite" }}
        />

        {/* Liquid (clipped to the bottle interior) */}
        <g clipPath="url(#ld-interior)">
          {/* breathing fill level */}
          <g style={{ animation: "loaderFill 3.2s ease-in-out infinite" }}>
            <rect x="0" y="44" width="64" height="48" fill="url(#ld-liquid)" opacity="0.25" />
            {/* back wave */}
            <g style={{ animation: "loaderWave 2.4s linear infinite reverse" }}>
              <path d={wave} fill="url(#ld-liquid)" opacity="0.4" transform="translate(0 2)" />
            </g>
            {/* front wave */}
            <g style={{ animation: "loaderWave 1.6s linear infinite" }}>
              <path d={wave} fill="url(#ld-liquid)" opacity="0.9" />
            </g>
            {/* rising bubbles */}
            <circle cx="27" cy="76" r="1.5" fill="currentColor" opacity="0.55"
              style={{ animation: "loaderBubble 2.4s ease-in infinite" }} />
            <circle cx="33" cy="78" r="2" fill="currentColor" opacity="0.5"
              style={{ animation: "loaderBubble 2.6s ease-in 0.7s infinite" }} />
            <circle cx="37" cy="76" r="1.2" fill="currentColor" opacity="0.6"
              style={{ animation: "loaderBubble 2.2s ease-in 1.3s infinite" }} />
            <circle cx="30" cy="79" r="1" fill="currentColor" opacity="0.5"
              style={{ animation: "loaderBubble 2.8s ease-in 1.9s infinite" }} />
          </g>
        </g>

        {/* Glass light sweep (clipped to the glass) */}
        <g clipPath="url(#ld-interior)">
          <rect
            x="-12" y="0" width="9" height="92" fill="#ffffff" opacity="0.16"
            transform="skewX(-16)"
            style={{ animation: "loaderShine 2.8s ease-in-out infinite" }}
          />
        </g>

        {/* Bottle outline */}
        <path
          d="M27 8 H37 V22 C37 26 45 28 45 38 V76 C45 81 41 84 36 84 H28 C23 84 19 81 19 76 V38 C19 28 27 26 27 22 Z"
          fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2" strokeLinejoin="round"
        />
        {/* Cap + neck collar + glass highlight */}
        <rect x="26" y="3" width="12" height="5" rx="1.5" fill="currentColor" />
        <rect x="26.5" y="20" width="11" height="2" rx="1" fill="currentColor" opacity="0.4" />
        <path d="M25 40 V72" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <p
        className="font-display text-sm font-medium tracking-[0.42em]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--color-gold) 0%, var(--color-gold-bright) 50%, var(--color-gold) 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          animation: "loaderTextShimmer 2.6s linear infinite",
        }}
      >
        BottleExpress
      </p>
    </div>
  );
}
