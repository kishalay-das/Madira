/**
 * Idempotently upserts the sample blog posts into an already-seeded database
 * (the main seed skips when products already exist). Run:
 *   npx tsx scripts/seed-blog.ts
 */
import { PrismaClient } from "@prisma/client";
import { blogSeed } from "../src/lib/blog-seed";

const prisma = new PrismaClient();

async function main() {
  for (const post of blogSeed) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        author: post.author,
        tags: post.tags,
      },
      create: post,
    });
  }
  const count = await prisma.blogPost.count();
  console.log(`Blog posts in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
