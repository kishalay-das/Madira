import "server-only";
import { cookies } from "next/headers";
import type { Segment } from "./queries";

export type Mode = "premium" | "standard";

export const MODE_COOKIE = "nocturne-mode";

/** Read the active storefront mode from the cookie (defaults to premium). */
export async function getMode(): Promise<Mode> {
  const store = await cookies();
  return store.get(MODE_COOKIE)?.value === "standard" ? "standard" : "premium";
}

export const segmentForMode = (m: Mode): Segment =>
  m === "standard" ? "STANDARD" : "PREMIUM";
