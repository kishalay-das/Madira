import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  label: z.string().min(1).max(40),
  line1: z.string().min(2).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(1).max(80),
  postalCode: z.string().min(1).max(20),
  country: z.string().max(60).default("US"),
  isPrimary: z.boolean().default(false),
});

/** POST /api/addresses — create an address for the current user. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const userId = session.user.id;

  if (parsed.data.isPrimary) {
    await prisma.address.updateMany({ where: { userId }, data: { isPrimary: false } });
  }
  const address = await prisma.address.create({
    data: { ...parsed.data, userId },
  });
  return NextResponse.json({ address }, { status: 201 });
}
