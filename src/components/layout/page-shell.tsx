import type { ReactNode } from "react";

/**
 * Shared chrome for Kishalay Madeera's editorial / informational pages
 * (Our Story, Careers, Shipping Policy, …). Keeps the hero, spacing,
 * and prose rhythm consistent across every static page.
 */
export function PageShell({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <div className="container-luxe pb-28 pt-16 md:pt-20">
      <header className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-cream md:text-6xl">
          {title}
        </h1>
        {lede ? (
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-parchment">
            {lede}
          </p>
        ) : null}
      </header>
      <div className="gold-rule mx-auto my-14 max-w-3xl" />
      {children}
    </div>
  );
}

/** A titled block of running text — the workhorse for legal/editorial copy. */
export function ProseSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl">
      {title ? (
        <h2 className="font-display text-2xl text-cream md:text-3xl">{title}</h2>
      ) : null}
      <div className="mt-4 space-y-4 text-[0.95rem] leading-relaxed text-muted [&_a]:text-gold [&_a]:underline-offset-4 [&_a:hover]:text-gold-bright [&_strong]:text-parchment">
        {children}
      </div>
    </section>
  );
}

/** Vertical stack of ProseSections with consistent spacing. */
export function ProseStack({ children }: { children: ReactNode }) {
  return <div className="space-y-12">{children}</div>;
}

/** A responsive grid of "pillar" cards used on promise/sustainability pages. */
export function PillarGrid({
  items,
}: {
  items: { title: string; body: string }[];
}) {
  return (
    <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.title}
          className="luxe-card glass-dark rounded-[var(--radius-luxe)] border border-hairline p-7"
        >
          <h3 className="font-display text-xl text-cream">{it.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{it.body}</p>
        </div>
      ))}
    </div>
  );
}

/** Small stat callouts (e.g. founding year, bottles authenticated). */
export function StatRow({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-luxe)] border border-hairline bg-hairline md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-charcoal px-6 py-8 text-center">
          <p className="font-display text-3xl text-gold-gradient md:text-4xl">{s.value}</p>
          <p className="mt-2 text-[0.7rem] uppercase tracking-[0.22em] text-muted">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
