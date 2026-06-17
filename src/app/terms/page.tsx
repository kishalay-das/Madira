import type { Metadata } from "next";
import Link from "next/link";
import {
  PageShell,
  ProseSection,
  ProseStack,
} from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of BottleExpress and your purchases of fine spirits.",
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Service"
      lede="These terms govern your use of BottleExpress. By browsing or ordering, you agree to them."
    >
      <ProseStack>
        <ProseSection title="Eligibility & age">
          <p>
            You must be of legal drinking age (21+ where applicable) to purchase
            from BottleExpress. Age is verified at checkout and again on delivery, and a
            valid ID with signature is required to receive an order. We may refuse
            or cancel any order that cannot meet these requirements.
          </p>
        </ProseSection>

        <ProseSection title="Accounts">
          <p>
            You are responsible for keeping your account credentials confidential
            and for all activity under your account. Provide accurate information
            and keep it current.
          </p>
        </ProseSection>

        <ProseSection title="Orders & pricing">
          <p>
            All orders are subject to acceptance and availability. Prices, taxes,
            and shipping are calculated and confirmed at checkout. We reserve the
            right to correct errors and to limit or decline orders, including for
            allocated or limited bottles.
          </p>
        </ProseSection>

        <ProseSection title="Shipping & returns">
          <p>
            Delivery, age verification, and returns are governed by our{" "}
            <Link href="/shipping-policy">Shipping Policy</Link>. Because we sell
            consumable goods, returns are limited as described there and as required
            by law.
          </p>
        </ProseSection>

        <ProseSection title="Acceptable use">
          <p>
            You agree not to misuse the service, attempt to access it through
            unauthorised means, resell bottles in violation of local law, or
            interfere with its operation or security.
          </p>
        </ProseSection>

        <ProseSection title="Liability">
          <p>
            BottleExpress is provided on a reasonable-efforts basis. To the fullest
            extent permitted by law, we are not liable for indirect or incidental
            damages arising from your use of the service. Nothing here limits rights
            that cannot be excluded under applicable law.
          </p>
        </ProseSection>

        <ProseSection title="Changes & contact">
          <p>
            We may update these terms from time to time; continued use means you
            accept the revised version. Questions? Reach us via the{" "}
            <Link href="/contact">Contact</Link> page.
          </p>
        </ProseSection>
      </ProseStack>
    </PageShell>
  );
}
