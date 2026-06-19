import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { serializeBlogPost } from "@/lib/admin-serialize";
import { parsePageParams } from "@/lib/pagination";

/**
 * GET /api/admin/blog — paginated blog post list for the admin console.
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = new URL(request.url).searchParams;
  const { page, pageSize, skip, take } = parsePageParams(sp, { defaultSize: 20 });

  const [rows, total] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" }, skip, take }),
    prisma.blogPost.count(),
  ]);

  return NextResponse.json({
    items: rows.map(serializeBlogPost),
    total,
    page,
    pageSize,
  });
}

const createSchema = z.object({
  title: z.string().min(2).max(160),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(1).max(40_000),
  coverImage: z.string().max(2048).nullable().optional(),
  author: z.string().max(120).optional(),
  tags: z.array(z.string().trim().min(1)).max(12).optional().default([]),
  published: z.boolean().default(true),
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const d = parsed.data;

  let slug = slugify(d.title) || "post";
  if (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${slug}-${Math.floor(Math.random() * 9999)}`;
  }

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: d.title,
      excerpt: d.excerpt || null,
      content: d.content,
      coverImage: d.coverImage || null,
      author: d.author || "BottleExpress",
      tags: d.tags,
      published: d.published,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ post: { id: post.id, slug } }, { status: 201 });
}
