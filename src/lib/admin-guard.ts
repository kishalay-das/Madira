import "server-only";
import { auth } from "@/auth";

/** Returns the session if the caller is an ADMIN, otherwise null. */
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}
