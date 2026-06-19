import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "@/components/cart/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure one-page checkout with concierge delivery scheduling.",
};

// Personalised (reads the session for saved addresses).
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await auth();

  const addresses = session?.user
    ? await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: { isPrimary: "desc" },
      })
    : [];

  return (
    <div className="container-luxe pb-24 pt-12">
      <header className="mb-10">
        <p className="eyebrow mb-3">Secure Checkout</p>
        <h1 className="font-display text-4xl tracking-tight text-cream md:text-5xl">
          Complete your order
        </h1>
      </header>
      <CheckoutClient
        isAuthed={!!session?.user}
        addresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          name: a.line1,
          line: [a.line1, a.line2, `${a.city} ${a.postalCode}`, a.country]
            .filter(Boolean)
            .join(", "),
          city: a.city,
          postalCode: a.postalCode,
          primary: a.isPrimary,
          line1: a.line1,
          landmark: a.landmark ?? "",
          phone: a.phone ?? "",
        }))}
      />
    </div>
  );
}
