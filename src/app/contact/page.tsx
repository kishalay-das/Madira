import type { Metadata } from "next";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ContactForm } from "@/components/sections/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach SipSipGo's concierge — for orders, membership, press, and partnership enquiries.",
};

const channels = [
  {
    Icon: Mail,
    title: "Concierge",
    detail: "concierge@sipsipgo.com",
    note: "Orders, delivery & membership",
  },
  {
    Icon: MessageCircle,
    title: "Press",
    detail: "press@sipsipgo.com",
    note: "Media & partnership enquiries",
  },
  {
    Icon: MapPin,
    title: "House",
    detail: "London · New York · Rotterdam",
    note: "By appointment only",
  },
];

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="Speak with our concierge"
      lede="Whether it's a question about an order, an allocated bottle, or membership — we're here, and we answer like people, not tickets."
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {channels.map(({ Icon, title, detail, note }) => (
            <div
              key={title}
              className="luxe-card flex items-start gap-4 rounded-[var(--radius-luxe)] border border-hairline bg-charcoal p-6"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline text-gold">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-gold">{title}</p>
                <p className="mt-1 text-base text-cream">{detail}</p>
                <p className="mt-1 text-sm text-muted">{note}</p>
              </div>
            </div>
          ))}
        </div>

        <ContactForm />
      </div>
    </PageShell>
  );
}
