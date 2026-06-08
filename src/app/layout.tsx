import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, themeInitScript } from "@/components/theme/theme-provider";

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

const SITE = "https://nocturne.example";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Nocturne — Premium Spirits Delivered to Your Doorstep",
    template: "%s · Nocturne",
  },
  description:
    "A modern luxury house for the world's finest whiskey, wine, champagne and rare spirits — sourced, authenticated and delivered with concierge care.",
  keywords: [
    "premium spirits delivery",
    "luxury whiskey",
    "rare wine",
    "champagne delivery",
    "alcohol delivery",
  ],
  applicationName: "Nocturne",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Nocturne — Premium Spirits Delivered",
    description: "The world's finest spirits, delivered with concierge care.",
    type: "website",
    url: SITE,
    siteName: "Nocturne",
  },
  twitter: { card: "summary_large_image", title: "Nocturne — Premium Spirits" },
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
      </head>
      <body className="min-h-full">
        <SessionProvider>
          <ThemeProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
