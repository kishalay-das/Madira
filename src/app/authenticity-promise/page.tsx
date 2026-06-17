import type { Metadata } from "next";
import {
  PageShell,
  PillarGrid,
  ProseSection,
} from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Authenticity Promise",
  description:
    "Every bottle Kishalay Madeera ships is sourced, inspected, and sealed through a verified chain of custody — guaranteed authentic or your money back.",
};

const pillars = [
  {
    title: "Verified Source",
    body: "We buy direct from distilleries, estates, and vetted brokers. No anonymous secondary-market lots, ever.",
  },
  {
    title: "Expert Inspection",
    body: "Fill level, seal, capsule, label, and serial are checked by hand against reference records before a bottle is listed.",
  },
  {
    title: "Sealed Chain of Custody",
    body: "Climate-controlled storage and tamper-evident packaging keep each bottle accounted for from cellar to doorstep.",
  },
  {
    title: "Digital Provenance",
    body: "Allocated and rare bottles ship with a provenance record documenting origin, age statement, and handling.",
  },
  {
    title: "Guaranteed Authentic",
    body: "If any bottle is ever found to be inauthentic, we refund you in full and cover return logistics — no questions.",
  },
  {
    title: "Responsible Handling",
    body: "Age-verified delivery and signature-on-receipt protect both the bottle and the people receiving it.",
  },
];

export default function AuthenticityPromisePage() {
  return (
    <PageShell
      eyebrow="Company"
      title="The Authenticity Promise"
      lede="Counterfeit spirits are a real problem in luxury. Our entire model exists to make sure the bottle you open is exactly what the label says it is."
    >
      <div className="mb-16">
        <PillarGrid items={pillars} />
      </div>

      <ProseSection title="Our guarantee, in plain terms">
        <p>
          Every order is backed by the Kishalay Madeera Authenticity Guarantee. If an independent
          assessment ever determines that a bottle we sold is not authentic, we will refund
          the full purchase price and arrange collection at our expense. To learn how a
          specific bottle was verified, contact our concierge with your order number.
        </p>
      </ProseSection>
    </PageShell>
  );
}
