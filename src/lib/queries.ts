import "server-only";
import { cache } from "react";
import type {
  Category as DbCategory,
  Product as DbProduct,
  Prisma,
} from "@prisma/client";
import { prisma } from "./prisma";
import type { Category, CategorySlug, Product } from "./types";

/* ------------------------------------------------------------------ *
 * Mappers: Prisma rows -> the plain UI types the components consume.
 * (Keeps Decimals as numbers and nullables as `undefined`.)
 * ------------------------------------------------------------------ */

type DbProductWithCategory = DbProduct & { category: DbCategory | null };

function toProduct(p: DbProductWithCategory): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    distillery: p.distillery,
    category: (p.category?.slug ?? "whiskey") as CategorySlug,
    categoryLabel: p.categoryLabel,
    price: Number(p.price),
    compareAt: p.compareAt != null ? Number(p.compareAt) : undefined,
    abv: p.abv,
    volume: p.volume,
    origin: p.origin,
    age: p.age ?? undefined,
    rating: p.rating,
    reviews: p.reviewsCount,
    images: p.images,
    video: p.video ?? undefined,
    palette: {
      glass: p.paletteGlass,
      liquid: p.paletteLiquid,
      label: p.paletteLabel,
    },
    tags: p.tags,
    tasting: {
      nose: p.noseNote ?? "",
      palate: p.palateNote ?? "",
      finish: p.finishNote ?? "",
    },
    notes: p.notes,
    pairings: p.pairings,
    description: p.description,
    badge: (p.badge ?? undefined) as Product["badge"],
    stock: p.stock,
    segment: (p.segment as Product["segment"]) ?? "PREMIUM",
  };
}

export type Segment = "PREMIUM" | "STANDARD";

function toCategory(c: DbCategory): Category {
  return {
    slug: c.slug as CategorySlug,
    name: c.name,
    tagline: c.tagline ?? "",
    hue: c.hue,
    count: c.count,
  };
}

/* ------------------------------------------------------------------ *
 * Queries
 * ------------------------------------------------------------------ */

export type ProductSort =
  | "popular"
  | "rating"
  | "price-asc"
  | "price-desc"
  | "newest";

export interface ProductQuery {
  category?: string;
  q?: string;
  sort?: ProductSort;
  limit?: number;
  /** Storefront segment to show. Defaults to PREMIUM. */
  segment?: Segment;
  /** Inclusive upper price bound (storefront price slider). */
  maxPrice?: number;
  /** Pagination — rows to skip / number to take. */
  skip?: number;
  take?: number;
}

/** Shared WHERE clause so getProducts and countProducts stay in sync. */
function productWhere(opts: ProductQuery): Prisma.ProductWhereInput {
  return {
    segment: opts.segment ?? "PREMIUM",
    ...(opts.category ? { category: { slug: opts.category } } : {}),
    ...(opts.maxPrice != null ? { price: { lte: opts.maxPrice } } : {}),
    ...(opts.q
      ? {
          OR: [
            { name: { contains: opts.q, mode: "insensitive" } },
            { distillery: { contains: opts.q, mode: "insensitive" } },
            { categoryLabel: { contains: opts.q, mode: "insensitive" } },
            { origin: { contains: opts.q, mode: "insensitive" } },
            { tags: { has: opts.q } },
          ],
        }
      : {}),
  };
}

const orderByFor = (sort?: ProductSort) => {
  switch (sort) {
    case "rating":
      return { rating: "desc" as const };
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "newest":
      return { createdAt: "desc" as const };
    default:
      return { reviewsCount: "desc" as const };
  }
};

export async function getProducts(opts: ProductQuery = {}): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: productWhere(opts),
    include: { category: true },
    // `id` tiebreaker keeps offset pages stable when the primary sort key
    // (price/rating/reviewsCount) ties across many products.
    orderBy: [orderByFor(opts.sort), { id: "asc" }],
    ...(opts.skip ? { skip: opts.skip } : {}),
    ...(opts.take ?? opts.limit ? { take: opts.take ?? opts.limit } : {}),
  });
  return rows.map(toProduct);
}

/** Count products matching the same filters (for pagination). */
export async function countProducts(opts: ProductQuery = {}): Promise<number> {
  return prisma.product.count({ where: productWhere(opts) });
}

/**
 * Sidebar facet counts for the shop: total products in a segment plus a
 * per-category-slug breakdown. Counts the whole segment (independent of the
 * active search/price filters) so the category list stays a stable navigator.
 */
export async function getShopFacets(
  segment: Segment
): Promise<{ all: number; bySlug: Record<string, number> }> {
  const [all, groups, cats] = await Promise.all([
    prisma.product.count({ where: { segment } }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { segment },
      _count: { _all: true },
    }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
  ]);
  const idToSlug = new Map(cats.map((c) => [c.id, c.slug]));
  const bySlug: Record<string, number> = {};
  for (const g of groups) {
    const slug = g.categoryId ? idToSlug.get(g.categoryId) : undefined;
    if (slug) bySlug[slug] = g._count._all;
  }
  return { all, bySlug };
}

export async function getProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

// Wrapped in React `cache()` so the product page's two calls per request
// (generateMetadata + the page body) dedupe into a single query.
export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const row = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    return row ? toProduct(row) : null;
  }
);

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const segment = product.segment ?? "PREMIUM";
  const sameCategory = await prisma.product.findMany({
    where: { segment, category: { slug: product.category }, NOT: { id: product.id } },
    include: { category: true },
    take: 4,
  });
  if (sameCategory.length >= 4) return sameCategory.map(toProduct);

  const fill = await prisma.product.findMany({
    where: {
      segment,
      NOT: { id: { in: [product.id, ...sameCategory.map((p) => p.id)] } },
    },
    include: { category: true },
    take: 4 - sameCategory.length,
  });
  return [...sameCategory, ...fill].map(toProduct);
}

export async function getCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return rows.map(toCategory);
}

/* ------------------------------------------------------------------ *
 * Blog
 * ------------------------------------------------------------------ */

export interface BlogPostView {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  author: string;
  tags: string[];
  date: string; // ISO publishedAt
}

function toBlogPost(r: {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  author: string;
  tags: string[];
  publishedAt: Date;
}): BlogPostView {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    content: r.content,
    coverImage: r.coverImage,
    author: r.author,
    tags: r.tags,
    date: r.publishedAt.toISOString(),
  };
}

export async function getBlogPosts(
  opts: { skip?: number; take?: number } = {}
): Promise<BlogPostView[]> {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    ...(opts.skip ? { skip: opts.skip } : {}),
    ...(opts.take != null ? { take: opts.take } : {}),
  });
  return rows.map(toBlogPost);
}

export async function countBlogPosts(): Promise<number> {
  return prisma.blogPost.count({ where: { published: true } });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostView | null> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  if (!row || !row.published) return null;
  return toBlogPost(row);
}

export async function getBlogSlugs(): Promise<string[]> {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
