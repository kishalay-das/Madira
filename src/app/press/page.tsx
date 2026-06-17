import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, ProseSection } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Press",
  description:
    "SipSipGo in the press — announcements, media resources, and contacts for journalists and partners.",
};

const releases = [
  {
    date: "March 2026",
    title: "SipSipGo surpasses 120,000 bottles authenticated",
    excerpt:
      "The luxury spirits house marks a milestone in its mission to eliminate counterfeits from the secondary market.",
  },
  {
    date: "November 2025",
    title: "Introducing scheduled concierge delivery across the EU",
    excerpt:
      "Members can now choose priority, standard, or scheduled white-glove delivery windows at checkout.",
  },
  {
    date: "June 2025",
    title: "SipSipGo partners with twelve independent distilleries",
    excerpt:
      "A new direct-sourcing program brings allocated single-cask releases to members with verified provenance.",
  },
];

export default function PressPage() {
  return (
    <PageShell
      eyebrow="Company"
      title="Press & Media"
      lede="Resources for journalists, editors, and partners covering SipSipGo and the world of luxury spirits."
    >
      <section className="mx-auto max-w-3xl">
        <h2 className="font-display text-2xl text-cream md:text-3xl">Latest announcements</h2>
        <ul className="mt-6 space-y-4">
          {releases.map((r) => (
            <li
              key={r.title}
              className="luxe-card glass-dark rounded-[var(--radius-luxe)] border border-hairline p-6"
            >
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-gold">{r.date}</p>
              <h3 className="mt-2 font-display text-xl text-cream">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="gold-rule mx-auto my-14 max-w-3xl" />

      <ProseSection title="Media enquiries">
        <p>
          For interviews, brand assets, or press enquiries, reach our communications team at{" "}
          <a href="mailto:press@sipsipgo.com">press@sipsipgo.com</a>. High-resolution
          logos and product imagery are available on request. For all other questions, visit{" "}
          <Link href="/contact">Contact</Link>.
        </p>
      </ProseSection>
    </PageShell>
  );
}
