"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";
import { resolvePageLayout } from "@/components/page-builder/schema/page-layout";
import type { PageLayout } from "@/types/block";

// ─── API shapes ───────────────────────────────────────────────────────────────

interface PageData {
  id: string;
  titleAr?: string;
  titleEn?: string;
  slug: string;
  layoutType?: string;
  layoutJson?: string | null;
  isPublished: boolean;
}

interface LegacySection {
  id: string;
  pageId: string;
  componentType: string;
  config: Record<string, unknown>;
  data: Record<string, unknown>;
  styling: Record<string, unknown>;
  sortOrder?: number;
  visibility?: string;
}

// ─── Hook result ──────────────────────────────────────────────────────────────

export interface UseBlockPageResult {
  layout: PageLayout | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBlockPage(slug: string): UseBlockPageResult {
  const [layout, setLayout] = useState<PageLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const retry = useCallback(() => {
    setTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(false);
    setLayout(null);

    Promise.all([
      api.get<ApiResponse<PageData>>(`/public/pages/${slug}`),
      api.get<ApiResponse<LegacySection[]>>(`/public/pages/${slug}/sections`),
    ])
      .then(([pageRes, sectionsRes]) => {
        if (!pageRes.data.success) {
          setError(true);
          return;
        }

        const page = pageRes.data.data;

        // Parse legacy sections (for migration fallback)
        const rawSections: LegacySection[] = (sectionsRes.data.data ?? []).map((s) => ({
          ...s,
          config:  typeof s.config  === "string" ? safeJson(s.config  as unknown as string) : (s.config  ?? {}),
          data:    typeof s.data    === "string" ? safeJson(s.data    as unknown as string) : (s.data    ?? {}),
          styling: typeof s.styling === "string" ? safeJson(s.styling as unknown as string) : (s.styling ?? {}),
        }));

        // Prefer layoutJson; fall back to migrating legacy sections
        const resolved = resolvePageLayout(page.layoutJson, rawSections);
        setLayout(resolved);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug, trigger]);

  return { layout, loading, error, retry };
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function safeJson(v: string): Record<string, unknown> {
  try {
    return JSON.parse(v);
  } catch {
    return {};
  }
}
