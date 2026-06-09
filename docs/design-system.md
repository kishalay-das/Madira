# Design System

Nocturne's look is a dark "members‑club" aesthetic — near‑black surfaces, gold accents, and
serif display type — with a light theme override. Styling is **Tailwind CSS v4** driven by design
tokens declared in `src/app/globals.css` under `@theme`.

## Tokens

Defined as CSS custom properties in `@theme` (so they're available as Tailwind color/utility names
like `bg-charcoal`, `text-gold`, `border-hairline`). The **dark theme is the default**; a light
theme overrides the same variables.

### Surfaces & structure (dark default)

| Token | Value | Use |
| --- | --- | --- |
| `--color-void` | `#08080a` | Deepest background / scrollbar track |
| `--color-night` | `#0b0b0f` | Page background |
| `--color-charcoal` | `#14141a` | Cards / surfaces |
| `--color-charcoal-2` | `#1c1c24` | Elevated surfaces |
| `--color-graphite` | `#25252f` | Inputs, dividers, progress tracks |
| `--color-hairline` | `rgba(200,162,75,.16)` | Gold‑tinted borders |
| `--scrim` | `rgba(8,8,10,.8)` | Modal/drawer backdrop |

### Text

| Token | Value | Use |
| --- | --- | --- |
| `--color-cream` | `#f5f1e8` | Primary text |
| `--color-parchment` | `#d9d3c4` | Secondary text |
| `--color-muted` | `#8d8779` | Muted text |
| `--color-muted-2` | `#5e5a51` | Faintest text / icons |
| `--color-ink` | `#0b0b0f` | Dark text on gold/light accents |

### Accents

| Token | Value | Use |
| --- | --- | --- |
| `--color-gold` | `#c8a24b` | Primary accent |
| `--color-gold-bright` | `#e3c270` | Hover / highlight |
| `--color-champagne` | `#ecddae` | Soft highlight |
| `--color-bronze` | `#a6713c` | Secondary metallic |
| `--color-burgundy` / `-deep` | `#6e1f2e` / `#43121c` | Wine accent, destructive hover |
| `--color-emerald` / `-deep` | `#1c5c46` / `#0e3527` | Green accent |

### Status

| Token | Value |
| --- | --- |
| `--color-success` | `#2f9e6a` |
| `--color-warning` | `#e6b85c` |
| `--color-error` | `#c0556b` |

### Semantic aliases

`@theme` also maps semantic names onto the palette so components read intent, not hex:
`--background`, `--surface`, `--surface-elevated`, `--text-primary/secondary/muted`,
`--accent-primary/secondary`, `--border-color`, `--success/warning/error`.

### Light theme

A light override redefines the same tokens (e.g. `--color-night: #ffffff`, `--color-cream: #1b1a18`,
`--color-champagne: #9c7a2c` for contrast on ivory, lighter `--scrim`). Because components reference
tokens rather than literal colors, the entire UI re‑themes by swapping these variables. Theme
helpers live in `src/components/theme/`.

## Typography

Loaded with `next/font/google` in `src/app/layout.tsx`:

| Family | Variable | Role |
| --- | --- | --- |
| **Playfair Display** | `--font-playfair` → `--font-display` | Serif display / headings (`font-display`) |
| **Inter** | `--font-inter` → `--font-sans` | Body / UI (`font-sans`) |

Both use `display: "swap"`.

## UI primitives (`src/components/ui/`)

| Component | Purpose |
| --- | --- |
| `button.tsx` | `Button` — variants incl. `gold`, `outline`; sizes; renders as `<a>` when `href` is passed |
| `badge.tsx` | Small status/category pill |
| `stars.tsx` | Star rating display |
| `reveal.tsx` | Scroll‑reveal animation wrapper (motion) |

## Conventions

- **Compose with tokens, not literals.** Use `text-cream`, `bg-charcoal`, `border-hairline`, etc.,
  so light/dark theming and future palette tweaks stay centralized in `globals.css`.
- **Serif for display, sans for everything else.** Reach for `font-display` on headings and brand
  moments only.
- **Glass surfaces.** Drawers/overlays use a `glass-dark` treatment with `--scrim` backdrops (see
  the cart drawer).
- **Motion is purposeful.** Animate entrances/transitions with `motion`; keep easing consistent
  (the cart drawer uses `[0.22, 1, 0.36, 1]`).
