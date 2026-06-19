/**
 * Shared helpers for server-side, page-numbered pagination.
 *
 * Every paginated endpoint returns `PageResult<T>`; the client derives
 * `pageCount = Math.ceil(total / pageSize)` for the <Pagination> control.
 */

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Parse `?page=` (1-based) and clamp `pageSize` from a URL. Returns
 * Prisma-ready `skip`/`take`. Out-of-range or non-numeric input falls back
 * to page 1.
 */
export function parsePageParams(
  searchParams: URLSearchParams,
  { defaultSize = 20, maxSize = 100 }: { defaultSize?: number; maxSize?: number } = {}
): { page: number; pageSize: number; skip: number; take: number } {
  const rawPage = Number(searchParams.get("page"));
  const rawSize = Number(searchParams.get("pageSize"));

  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const pageSize =
    Number.isFinite(rawSize) && rawSize >= 1
      ? Math.min(Math.floor(rawSize), maxSize)
      : defaultSize;

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
