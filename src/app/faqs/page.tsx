import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { FaqAccordion, type FaqGroup } from "@/components/sections/faq-accordion";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common questions about Nocturne — orders, delivery, authenticity, membership, and returns.",
};

const groups: FaqGroup[] = [
  {
    category: "Orders & Delivery",
    items: [
      {
        q: "When will my order arrive?",
        a: "Orders are prepared within one to two business days. At checkout you can choose Priority, Standard, or a Scheduled delivery date. You'll receive tracking as soon as your order is dispatched.",
      },
      {
        q: "Do I need to be home to receive my order?",
        a: "Yes. Alcohol deliveries require an adult of legal drinking age (21+ where applicable) to show valid ID and sign on receipt. Packages cannot be left unattended.",
      },
      {
        q: "Which regions do you deliver to?",
        a: "We deliver wherever the sale and shipment of alcohol is legally permitted. If your address falls outside our serviceable area, you'll be notified before payment.",
      },
    ],
  },
  {
    category: "Authenticity & Quality",
    items: [
      {
        q: "How do I know a bottle is genuine?",
        a: "Every bottle is sourced direct from distilleries, estates, or vetted brokers and inspected by hand before listing. Rare bottles ship with a provenance record, and every order is backed by our Authenticity Promise.",
      },
      {
        q: "What if a bottle arrives damaged?",
        a: "Contact us within 48 hours with your order number and photos. We'll arrange a replacement or full refund, including return logistics at our expense.",
      },
    ],
  },
  {
    category: "Membership & Account",
    items: [
      {
        q: "What does membership include?",
        a: "Members receive first access to allocated bottles, private tastings, member-only pricing, and loyalty points on every order. Tiers range from Silver to Platinum.",
      },
      {
        q: "How do loyalty points work?",
        a: "You earn points on qualifying orders, viewable in your account. Points and your membership tier are surfaced in the account dashboard and membership area.",
      },
      {
        q: "Can I save multiple delivery addresses?",
        a: "Yes. Manage your shipping addresses from your account, and set a primary address for faster checkout.",
      },
    ],
  },
  {
    category: "Payments & Coupons",
    items: [
      {
        q: "How are discounts applied?",
        a: "Enter a valid coupon code at checkout. Discounts can be a percentage or a fixed amount and are applied to your order total before tax and shipping are calculated.",
      },
      {
        q: "Is checkout secure?",
        a: "Yes. Order totals — subtotal, discount, shipping, and tax — are calculated securely on our servers, and your account is protected by encrypted sessions.",
      },
    ],
  },
];

export default function FaqsPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="Frequently Asked Questions"
      lede="Everything you need to know about ordering, delivery, authenticity, and membership. Still stuck? Our concierge is a message away."
    >
      <FaqAccordion groups={groups} />
    </PageShell>
  );
}
