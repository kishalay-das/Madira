import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, themeInitScript } from "@/components/theme/theme-provider";
import { ModeProvider, modeInitScript } from "@/components/mode/mode-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Production URL. Override with NEXT_PUBLIC_SITE_URL in the environment
// (e.g. once a custom domain is connected); falls back to the live Vercel URL.
const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kubo-demo-fawn.vercel.app"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Kishalay Madeera — Premium Spirits, Whiskey & Wine Delivered",
    template: "%s · Kishalay Madeera",
  },
  description:
    "Kishalay Madeera is a modern luxury house for the world's finest whiskey, wine, champagne and rare spirits — sourced, authenticated and delivered to your doorstep with concierge care.",
  alternates: { canonical: "/" },
  keywords: [
    // Brand (unique) + common misspellings so wrong spellings still resolve
    "Kishalay Madeera",
    "Kishalay Madeera spirits",
    "Kishalay Madeera liquor",
    "Kishalay Madeera drinks",
    "Kishalay Madeera whiskey",
    "Kishalay Madeera wine",
    "Madira",
    "Madeira",
    "Madera",
    "Kishalay Madeeraa",
    "Kishalay Madeera spirits delivery",
    // Category / intent
    "premium spirits delivery",
    "luxury whiskey",
    "rare wine",
    "champagne delivery",
    "alcohol delivery",
  ],
  applicationName: "Kishalay Madeera",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Kishalay Madeera — Premium Spirits, Whiskey & Wine Delivered",
    description:
      "Kishalay Madeera delivers the world's finest spirits — authenticated and shipped with concierge care.",
    type: "website",
    url: SITE,
    siteName: "Kishalay Madeera",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kishalay Madeera — Premium Spirits Delivered",
    description: "Kishalay Madeera delivers the world's finest whiskey, wine and rare spirits.",
  },
  verification: { google: "C0i0lgPc246W8LqT_EkOVQk3UzVrAQI0pmKXXtNtmMU" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0f" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: modeInitScript }} />
        {/* Structured data: tells Google the brand is "Kishalay Madeera" and enables
            the sitelinks search box for the brand query. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE}/#organization`,
                  name: "Kishalay Madeera",
                  url: SITE,
                  logo: `${SITE}/icon.svg`,
                  description:
                    "Kishalay Madeera is a modern luxury house for the world's finest whiskey, wine, champagne and rare spirits.",
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE}/#website`,
                  name: "Kishalay Madeera",
                  url: SITE,
                  publisher: { "@id": `${SITE}/#organization` },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: `${SITE}/shop?q={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full">
        <SessionProvider>
          <ThemeProvider>
            <ModeProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <CartDrawer />
            </ModeProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
