import type { Metadata } from "next";
import {
  PageShell,
  ProseSection,
  ProseStack,
  StatRow,
} from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "How Madeera became a modern luxury house for the world's finest spirits — sourced, authenticated and delivered with concierge care.",
};

export default function OurStoryPage() {
  return (
    <PageShell
      eyebrow="Company"
      title="Our Story"
      lede="Madeera began with a simple frustration — that the world's most extraordinary bottles were the hardest to find, verify, and trust. We set out to change that."
    >
      <div className="mb-16">
        <StatRow
          stats={[
            { value: "2016", label: "Founded" },
            { value: "42", label: "Countries Sourced" },
            { value: "120k", label: "Bottles Authenticated" },
            { value: "98%", label: "Member Retention" },
          ]}
        />
      </div>

      <ProseStack>
        <ProseSection title="A house built on provenance">
          <p>
            We started as a small circle of collectors trading allocated whiskey and
            grower champagne after hours. What bound us together was an obsession with
            <strong> provenance</strong> — knowing exactly where a bottle came from, who
            touched it, and how it was kept. That obsession is now the spine of everything
            Madeera does.
          </p>
          <p>
            Today we work directly with distilleries, estates, and trusted brokers to bring
            rare releases to members without the markups, fakes, and guesswork that plague
            the secondary market.
          </p>
        </ProseSection>

        <ProseSection title="Concierge, not commerce">
          <p>
            Madeera is designed to feel less like a store and more like a private cellar
            with a sommelier on call. From temperature-controlled storage to scheduled
            white-glove delivery, every detail is built to honor the bottle and the moment
            it's opened.
          </p>
        </ProseSection>

        <ProseSection title="Where we're going">
          <p>
            We're building the most trusted name in luxury spirits — a place where rarity,
            authenticity, and care are never in tension. If that resonates, you belong in
            the inner circle.
          </p>
        </ProseSection>
      </ProseStack>
    </PageShell>
  );
}
