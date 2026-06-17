import type { Metadata } from "next";
import {
  PageShell,
  ProseSection,
  ProseStack,
} from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "How Madeera ships — delivery slots, age verification, regions, timing, and tracking.",
};

export default function ShippingPolicyPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="Shipping Policy"
      lede="Every order is handled with concierge care, age-verified on delivery, and fully trackable from cellar to doorstep."
    >
      <ProseStack>
        <ProseSection title="Delivery slots">
          <p>At checkout you can choose from three delivery options:</p>
          <p>
            <strong>Priority</strong> — expedited dispatch for the fastest available arrival.
            <br />
            <strong>Standard</strong> — our default, balancing speed and care.
            <br />
            <strong>Scheduled</strong> — pick a specific future date for the bottle to arrive.
          </p>
        </ProseSection>

        <ProseSection title="Processing & timing">
          <p>
            Orders are prepared within one to two business days. Allocated and climate-sensitive
            bottles may take longer as they are inspected and packed individually. You&apos;ll
            receive tracking the moment your order is dispatched.
          </p>
        </ProseSection>

        <ProseSection title="Age verification">
          <p>
            Alcohol can only be delivered to, and received by, adults of legal drinking age
            (21+ where applicable). A valid government-issued ID and signature are required on
            receipt. Orders cannot be left unattended, and our carriers will not release a
            package to anyone who appears underage or intoxicated.
          </p>
        </ProseSection>

        <ProseSection title="Shipping fees">
          <p>
            Shipping is calculated at checkout based on destination and delivery slot. Orders
            above the free-shipping threshold qualify for complimentary standard delivery —
            the cart shows your progress toward it.
          </p>
        </ProseSection>

        <ProseSection title="Regions & restrictions">
          <p>
            We deliver only to regions where the sale and shipment of alcohol is permitted.
            Some bottles may be unavailable in certain territories due to local law. If your
            address is outside our serviceable area, you&apos;ll be notified before payment.
          </p>
        </ProseSection>
      </ProseStack>
    </PageShell>
  );
}
