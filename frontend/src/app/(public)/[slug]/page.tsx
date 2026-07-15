/**
 * Dynamic public page route — handles ALL CMS pages by slug.
 *
 * This single file replaces every static per-page file (about/page.tsx,
 * board/page.tsx, contact/page.tsx, etc.).
 *
 * Flow:
 *   Visitor visits /{slug}
 *   → fetch /api/public/pages/{slug}  (page metadata + layout_json)
 *   → fetch /api/public/pages/{slug}/sections (legacy fallback)
 *   → resolvePageLayout() → Block[]
 *   → <BlockRenderer blocks={...} />
 *   → All blocks render from block.props only — no hardcoded components
 *
 * Works for existing pages (about, board, contact, …) AND any new page
 * created through the admin builder, with zero code changes.
 */

"use client";

import { useParams } from "next/navigation";
import { useBlockPage } from "@/hooks/useBlockPage";
import { PublicPageShell } from "@/components/public/PublicPageShell";

export default function DynamicPublicPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const { layout, loading, error, retry } = useBlockPage(slug);

  return (
    <PublicPageShell
      layout={layout}
      loading={loading}
      error={error}
      retry={retry}
    />
  );
}
