import type { Metadata } from "next";
import {
  PageShell,
  PillarGrid,
  ProseSection,
} from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "Nocturne's commitments to responsible sourcing, low-impact logistics, and lasting packaging.",
};

const commitments = [
  {
    title: "Responsible Sourcing",
    body: "We prioritise producers practising sustainable agriculture, water stewardship, and fair labour.",
  },
  {
    title: "Low-Impact Logistics",
    body: "Consolidated shipments, climate-controlled warehousing, and carbon-offset delivery routes.",
  },
  {
    title: "Lasting Packaging",
    body: "Recyclable, plastic-minimal protective packaging designed to be reused, not discarded.",
  },
  {
    title: "Circular Glass",
    body: "We support bottle take-back and glass recycling partnerships in the regions we serve.",
  },
  {
    title: "Honest Reporting",
    body: "We publish our progress annually and hold ourselves to measurable, public targets.",
  },
  {
    title: "Community Investment",
    body: "A share of proceeds supports producers and conservation in the regions our spirits come from.",
  },
];

export default function SustainabilityPage() {
  return (
    <PageShell
      eyebrow="Company"
      title="Luxury that lasts"
      lede="Rare spirits are a product of land, climate, and patience. Protecting those is part of protecting the craft itself."
    >
      <div className="mb-16">
        <PillarGrid items={commitments} />
      </div>

      <ProseSection title="Our 2030 goals">
        <p>
          We are working toward carbon-neutral delivery across all core markets, fully
          plastic-free protective packaging, and verified sustainable sourcing for the
          majority of our catalogue by 2030. These targets are ambitious by design — we&apos;d
          rather aim high and report honestly than make claims we can&apos;t keep.
        </p>
      </ProseSection>
    </PageShell>
  );
}
