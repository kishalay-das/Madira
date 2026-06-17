import type { Metadata } from "next";
import Link from "next/link";
import {
  PageShell,
  ProseSection,
  ProseStack,
} from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How SipSipGo collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      lede="Your trust matters. This policy explains what we collect, why, and the choices you have over your information."
    >
      <ProseStack>
        <ProseSection title="Information we collect">
          <p>
            We collect the details you provide when you create an account, place
            an order, or contact us — such as your name, email, delivery address,
            and order history. We also collect limited technical data (device,
            browser, and usage) to operate and improve the service.
          </p>
        </ProseSection>

        <ProseSection title="How we use it">
          <p>
            We use your information to process and deliver orders, verify age and
            identity where legally required, provide concierge support, personalise
            recommendations, and — only with your consent — send marketing about
            allocated releases and member events.
          </p>
        </ProseSection>

        <ProseSection title="Sharing">
          <p>
            We do not sell your personal data. We share it only with the partners
            needed to run SipSipGo — payment processors, delivery carriers, and
            media/hosting providers — and only as much as each requires. We may
            disclose information where the law obliges us to.
          </p>
        </ProseSection>

        <ProseSection title="Data retention & security">
          <p>
            We keep your data for as long as your account is active or as needed to
            meet legal and tax obligations. Passwords are stored only as salted
            hashes, never in plain text, and access is restricted.
          </p>
        </ProseSection>

        <ProseSection title="Your rights">
          <p>
            You may access, correct, export, or delete your personal data, and
            withdraw marketing consent at any time. To make a request, reach our
            team via the <Link href="/contact">Contact</Link> page.
          </p>
        </ProseSection>

        <ProseSection title="Contact">
          <p>
            Questions about this policy? Email{" "}
            <a href="mailto:privacy@sipsipgo.com">privacy@sipsipgo.com</a>.
          </p>
        </ProseSection>
      </ProseStack>
    </PageShell>
  );
}
