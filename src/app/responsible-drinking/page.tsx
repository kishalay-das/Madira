import type { Metadata } from "next";
import {
  PageShell,
  PillarGrid,
  ProseSection,
} from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Responsible Drinking",
  description:
    "SipSipGo celebrates spirits as a craft to be savoured. Our commitment to age verification and drinking responsibly.",
};

const principles = [
  {
    title: "Savour, Don't Rush",
    body: "Fine spirits reward attention. A single measure, appreciated slowly, is the point — not the volume.",
  },
  {
    title: "Always 21+",
    body: "We verify age at checkout and again on delivery. We never sell or deliver to anyone underage.",
  },
  {
    title: "Know Your Limits",
    body: "Never drink and drive. Pace yourself, stay hydrated, and look out for those around you.",
  },
];

export default function ResponsibleDrinkingPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="Drink Beautifully, Drink Responsibly"
      lede="SipSipGo exists to celebrate the craft of great spirits — and great spirits are meant to be savoured, never abused."
    >
      <div className="mb-16">
        <PillarGrid items={principles} />
      </div>

      <ProseSection title="Our commitment">
        <p>
          We require all customers to be of legal drinking age (21+ where applicable). Age is
          verified at purchase and a valid ID with signature is required on delivery. We will
          not complete a delivery to anyone who appears underage or intoxicated.
        </p>
        <p>
          If you or someone you know is struggling with alcohol, support is available. Contact a
          local health service or an organisation such as{" "}
          <a href="https://www.aa.org" target="_blank" rel="noopener noreferrer">
            Alcoholics Anonymous
          </a>{" "}
          or{" "}
          <a href="https://www.niaaa.nih.gov" target="_blank" rel="noopener noreferrer">
            the National Institute on Alcohol Abuse and Alcoholism
          </a>
          . You are never alone, and reaching out is a sign of strength.
        </p>
      </ProseSection>
    </PageShell>
  );
}
