import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBlogPosts, countBlogPosts } from "@/lib/queries";
import { Pagination } from "@/components/ui/pagination";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, pairings and stories from BottleExpress — how to build a home bar, wine pairing basics, cocktails and more.",
  alternates: { canonical: "/blog" },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const PAGE_SIZE = 9;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const [posts, total] = await Promise.all([
    getBlogPosts({ skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    countBlogPosts(),
  ]);

  // Featured-hero treatment only on page 1. On later pages, render every post
  // in the grid so none is skipped.
  const featured = page === 1 ? posts[0] : undefined;
  const rest = page === 1 ? posts.slice(1) : posts;
  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container-luxe py-14 md:py-20">
      <header className="mb-12 max-w-2xl">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-gold">
          The Journal
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-cream md:text-5xl">
          Stories, guides &amp; pairings
        </h1>
        <p className="mt-4 text-base leading-relaxed text-parchment">
          Tips for building a better home bar, getting pairings right, and making
          the most of every bottle.
        </p>
      </header>

      {total === 0 ? (
        <p className="text-sm text-muted">No posts yet — check back soon.</p>
      ) : (
        <div className="space-y-10">
          {/* Featured post */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-hairline bg-[var(--surface)] transition-all duration-500 hover:border-gold/40 hover:shadow-[var(--card-hover-shadow)] lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] lg:aspect-auto">
                {featured.coverImage ? (
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-[var(--surface-elevated)]" />
                )}
              </div>
              <div className="flex flex-col justify-center gap-3 p-7 md:p-10">
                <div className="flex flex-wrap items-center gap-2 text-[0.62rem] uppercase tracking-widest text-gold">
                  {featured.tags.slice(0, 2).map((t) => (
                    <span key={t} className="rounded-full border border-gold/30 px-2.5 py-1">
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="font-display text-2xl text-cream transition-colors group-hover:text-gold-bright md:text-3xl">
                  {featured.title}
                </h2>
                <p className="line-clamp-3 text-sm leading-relaxed text-parchment">
                  {featured.excerpt}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {featured.author} · {fmt(featured.date)}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-gold">
                  Read article <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-[var(--surface)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--card-hover-shadow)]"
                >
                  <div className="relative aspect-[16/10]">
                    {p.coverImage ? (
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-[var(--surface-elevated)]" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <p className="text-[0.6rem] uppercase tracking-widest text-gold">
                      {p.tags[0] ?? "Journal"}
                    </p>
                    <h3 className="font-display text-lg leading-snug text-cream transition-colors group-hover:text-gold-bright">
                      {p.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                      {p.excerpt}
                    </p>
                    <p className="mt-auto pt-2 text-xs text-muted-2">{fmt(p.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Pagination
            page={page}
            pageCount={pageCount}
            hrefFor={(p) => (p <= 1 ? "/blog" : `/blog?page=${p}`)}
          />
        </div>
      )}
    </div>
  );
}
