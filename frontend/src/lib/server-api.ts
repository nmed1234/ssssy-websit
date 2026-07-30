/**
 * Server-side API helper for Next.js Server Components.
 *
 * Uses the native `fetch` API with `{ next: { revalidate } }` options so that
 * Next.js ISR (Incremental Static Regeneration) caches the responses at the
 * CDN/edge level.  This file MUST NOT be imported by client components — use
 * the axios-based helpers in `lib/api.ts` for client-side fetching instead.
 *
 * Why not axios? axios relies on `XMLHttpRequest` / Node.js `http` which do NOT
 * support Next.js's extended `fetch` cache semantics.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";

// ---------------------------------------------------------------------------
// Generic fetcher
// ---------------------------------------------------------------------------

async function serverFetch<T>(
  path: string,
  revalidate: number = 60,
): Promise<T | null> {
  try {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      next: { revalidate },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success ? (json.data as T) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Content / News
// ---------------------------------------------------------------------------

export interface PagedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export async function serverGetContentByType<T>(
  contentType: string,
  page = 0,
  size = 9,
  revalidate = 60,
): Promise<PagedResult<T> | null> {
  return serverFetch<PagedResult<T>>(
    `/public/content/types/${contentType}?page=${page}&size=${size}`,
    revalidate,
  );
}

export async function serverGetPublishedContent<T>(params: {
  contentType?: string;
  categorySlug?: string;
  page?: number;
  size?: number;
  revalidate?: number;
}): Promise<PagedResult<T> | null> {
  const { contentType, categorySlug, page = 0, size = 9, revalidate = 60 } = params;
  const query = new URLSearchParams();
  if (contentType) query.set("contentType", contentType);
  if (categorySlug) query.set("categorySlug", categorySlug);
  query.set("page", String(page));
  query.set("size", String(size));
  return serverFetch<PagedResult<T>>(`/public/content?${query.toString()}`, revalidate);
}

export async function serverGetContentBySlug<T>(
  slug: string,
  revalidate = 300,
): Promise<T | null> {
  return serverFetch<T>(`/public/content/${slug}`, revalidate);
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function serverGetPublishedEvents<T>(
  page = 0,
  size = 12,
  revalidate = 60,
): Promise<PagedResult<T> | null> {
  return serverFetch<PagedResult<T>>(
    `/public/events?page=${page}&size=${size}`,
    revalidate,
  );
}

export async function serverGetUpcomingEvents<T>(
  revalidate = 60,
): Promise<T[] | null> {
  return serverFetch<T[]>("/public/events/upcoming", revalidate);
}

export async function serverGetEventBySlug<T>(
  slug: string,
  revalidate = 300,
): Promise<T | null> {
  return serverFetch<T>(`/public/events/${slug}`, revalidate);
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function serverGetPublishedVacancies<T>(
  page = 0,
  size = 20,
  revalidate = 60,
): Promise<PagedResult<T> | null> {
  return serverFetch<PagedResult<T>>(
    `/public/jobs?page=${page}&size=${size}`,
    revalidate,
  );
}

export async function serverGetVacancyBySlug<T>(
  slug: string,
  revalidate = 300,
): Promise<T | null> {
  return serverFetch<T>(`/public/jobs/${slug}`, revalidate);
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export async function serverGetMemberProfiles<T>(
  page = 0,
  size = 24,
  revalidate = 120,
): Promise<PagedResult<T> | null> {
  return serverFetch<PagedResult<T>>(
    `/public/members?page=${page}&size=${size}`,
    revalidate,
  );
}

export async function serverGetMemberBySlug<T>(
  slug: string,
  revalidate = 300,
): Promise<T | null> {
  return serverFetch<T>(`/public/members/${slug}`, revalidate);
}

// ---------------------------------------------------------------------------
// Publications
// ---------------------------------------------------------------------------

export async function serverGetPublications<T>(
  size = 200,
  revalidate = 120,
): Promise<PagedResult<T> | null> {
  return serverFetch<PagedResult<T>>(
    `/public/publications?size=${size}`,
    revalidate,
  );
}

// ---------------------------------------------------------------------------
// Site Sections / Board Members / Homepage
// ---------------------------------------------------------------------------

export async function serverGetSiteSections<T>(
  location: string,
  revalidate = 300,
): Promise<T[] | null> {
  return serverFetch<T[]>(`/public/site-sections?location=${encodeURIComponent(location)}`, revalidate);
}

export async function serverGetBoardMembers<T>(
  revalidate = 300,
): Promise<T[] | null> {
  return serverFetch<T[]>("/public/board-members", revalidate);
}
