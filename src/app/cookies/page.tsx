import type { Metadata } from "next";
import Link from "next/link";
import {
  PageShell,
  ProseSection,
  ProseStack,
} from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How and why SipSipGo uses cookies and similar technologies, and how to control them.",
};

export default function CookiesPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Cookie Policy"
      lede="Cookies help SipSipGo remember your session, your cart, and your preferences. Here's how we use them and how to manage them."
    >
      <ProseStack>
        <ProseSection title="What cookies are">
          <p>
            Cookies are small files stored on your device that let a site recognise
            you between visits. We also use similar technologies such as
            local storage — for example, to keep your cart between sessions.
          </p>
        </ProseSection>

        <ProseSection title="How we use them">
          <p>
            <strong>Essential</strong> — sign-in sessions, security, and your
            shopping cart. These are required for the site to work.
            <br />
            <strong>Preferences</strong> — remembering choices such as your light or
            dark theme.
            <br />
            <strong>Analytics</strong> — understanding, in aggregate, how the site is
            used so we can improve it.
          </p>
        </ProseSection>

        <ProseSection title="Managing cookies">
          <p>
            You can control or delete cookies through your browser settings, and set
            most browsers to block them. Note that blocking essential cookies will
            break sign-in and checkout. Clearing your browser&apos;s local storage
            will also empty your saved cart.
          </p>
        </ProseSection>

        <ProseSection title="Contact">
          <p>
            Questions about our use of cookies? See our{" "}
            <Link href="/privacy">Privacy Policy</Link> or reach us via the{" "}
            <Link href="/contact">Contact</Link> page.
          </p>
        </ProseSection>
      </ProseStack>
    </PageShell>
  );
}
