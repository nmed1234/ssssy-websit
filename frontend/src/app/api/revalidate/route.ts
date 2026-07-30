import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/revalidate
 *
 * On-demand ISR cache purge. Called by the admin section builder after
 * Save Draft or Save & Publish so visitors see the new content immediately
 * without waiting for the background revalidate interval.
 *
 * Body (optional JSON): { paths?: string[] }
 *   If `paths` is provided, each listed path is revalidated.
 *   Otherwise a default set of commonly-changed paths is purged.
 *
 * Protected by REVALIDATE_SECRET env var (optional).
 * In development the secret check is skipped so local testing works without
 * extra config.
 */
export async function POST(req: NextRequest) {
  // Optional secret guard — set REVALIDATE_SECRET in .env.local for production
  const secret = process.env.REVALIDATE_SECRET;
  if (secret) {
    const auth = req.headers.get("x-revalidate-secret");
    if (auth !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let paths: string[] = [];
  try {
    const body = await req.json().catch(() => ({}));
    if (Array.isArray(body?.paths)) paths = body.paths as string[];
  } catch {
    // ignore parse errors — use defaults
  }

  // Default: revalidate the homepage and all public section-bearing pages
  if (paths.length === 0) {
    paths = ["/", "/news", "/events", "/members", "/publications", "/about", "/contact"];
  }

  for (const p of paths) {
    revalidatePath(p);
  }

  return NextResponse.json({ revalidated: true, paths });
}
