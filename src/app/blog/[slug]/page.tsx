import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/queries";
import { PostContent } from "@/components/blog/post-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/blog/${post.slug}`,
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
  };
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container-luxe py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted transition-colors hover:text-gold"
        >
          <ArrowLeft size={14} /> All articles
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-[0.62rem] uppercase tracking-widest text-gold">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full border border-gold/30 px-2.5 py-1">
              {t}
            </span>
          ))}
        </div>

        <h1 className="mt-4 font-display text-3xl leading-tight tracking-tight text-cream md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-muted">
          By {post.author} · {fmt(post.date)}
        </p>

        {post.coverImage && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-hairline">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {post.excerpt && (
          <p className="mt-8 border-l-2 border-gold/40 pl-4 text-lg leading-relaxed text-cream">
            {post.excerpt}
          </p>
        )}

        <div className="mt-8 text-[0.95rem]">
          <PostContent content={post.content} />
        </div>

        <div className="mt-12 border-t border-hairline pt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 py-3 text-sm font-medium text-ink"
          >
            Shop the range
          </Link>
        </div>
      </div>
    </article>
  );
}
