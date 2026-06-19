"use client";

import { usePathname } from "next/navigation";

/*
 * Thin client gate — the only reason any footer code is in the client bundle.
 * Hides its children on /cart and /admin/* routes.
 * The heavy FooterBody markup stays server-rendered and is passed in as children
 * (RSC interleaving: server-component children passed to a client component are
 * rendered on the server and sent as RSC payload, not included in the JS bundle).
 */
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/cart" || pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
