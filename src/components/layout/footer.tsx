"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* Brand glyphs (lucide dropped brand icons, so we inline minimal marks) */
function IgIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function FbIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 9h3l.5-3H14V4.5c0-.9.3-1.5 1.6-1.5H18V.3C17.4.2 16.3 0 15 0c-2.7 0-4.5 1.6-4.5 4.6V6H8v3h2.5v9H14z" />
    </svg>
  );
}
function YtIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5C.6 9.4.6 12 .6 12s0 2.6.4 4.5a3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 0 0 2.1-2.1c.4-1.9.4-4.5.4-4.5s0-2.6-.4-4.5M9.75 15.5v-7l6 3.5z" />
    </svg>
  );
}

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Whiskey", href: "/shop?category=whiskey" },
      { label: "Wine", href: "/shop?category=wine" },
      { label: "Champagne", href: "/shop?category=champagne" },
      { label: "Gift Boxes", href: "/shop?category=gift-boxes" },
      { label: "Limited Releases", href: "/shop" },
    ],
  },
  {
    title: "Concierge",
    links: [
      { label: "VIP Membership", href: "/#membership" },
      { label: "Corporate Gifting", href: "/#occasions" },
      { label: "Delivery & Tracking", href: "/account" },
      { label: "Personal Sommelier", href: "/#recommendations" },
      { label: "Gift Wrapping", href: "/cart" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Blog", href: "/blog" },
      { label: "Authenticity Promise", href: "/authenticity-promise" },
      { label: "Press", href: "/press" },
      { label: "Sustainability", href: "/sustainability" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Contact", href: "/contact" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Responsible Drinking", href: "/responsible-drinking" },
    ],
  },
];

const socials = [
  { Icon: IgIcon, href: "#", label: "Instagram" },
  { Icon: XIcon, href: "#", label: "X" },
  { Icon: FbIcon, href: "#", label: "Facebook" },
  { Icon: YtIcon, href: "#", label: "YouTube" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative mt-32 border-t border-hairline bg-void/60">
      <div className="container-luxe py-16">
        {/* Newsletter */}
        <div className="glass-dark mb-16 flex flex-col items-center gap-6 rounded-[var(--radius-luxe)] p-6 text-center sm:p-8 md:flex-row md:justify-between md:p-10 md:text-left">
          <div>
            <h3 className="font-display text-2xl text-cream md:text-3xl">
              Join the inner circle
            </h3>
            <p className="mt-2 text-sm text-muted">
              First access to allocated bottles, private tastings and member-only pricing.
            </p>
          </div>
          <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="h-12 w-full shrink-0 rounded-full border border-hairline bg-night/60 px-5 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none sm:flex-1"
            />
            <button className="h-12 w-full shrink-0 rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-medium text-ink transition-shadow hover:shadow-[0_14px_30px_-12px_rgba(200,162,75,0.7)] sm:w-auto">
              Subscribe
            </button>
          </form>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-2xl tracking-[0.3em] text-cream">
              BottleExpress
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              A modern luxury house for the world&apos;s finest spirits — sourced,
              authenticated and delivered with concierge care.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-parchment transition-all hover:border-gold hover:text-gold"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[0.7rem] uppercase tracking-[0.24em] text-gold">{col.title}</h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted transition-colors hover:text-cream">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="gold-rule my-12" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} BottleExpress Spirits. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-cream">Privacy</Link>
            <Link href="/terms" className="hover:text-cream">Terms</Link>
            <Link href="/cookies" className="hover:text-cream">Cookies</Link>
            <span className="rounded-full border border-hairline px-3 py-1 text-[0.65rem] uppercase tracking-widest text-gold">
              Please drink responsibly · 21+
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
