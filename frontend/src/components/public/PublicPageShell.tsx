"use client";

import { AlertCircle } from "lucide-react";
import { BlockRenderer } from "@/components/page-builder/BlockRenderer";
import type { PageLayout } from "@/types/block";

export interface PublicPageShellProps {
  layout: PageLayout | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

export function PublicPageShell({ layout, loading, error, retry }: PublicPageShellProps) {
  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-pulse space-y-6 px-4 py-10 max-w-6xl mx-auto">
        {/* Full-width bar */}
        <div className="h-64 w-full rounded-xl bg-gray-200" />
        {/* Two narrower bars */}
        <div className="h-6 w-3/4 rounded bg-gray-200" />
        <div className="h-6 w-1/2 rounded bg-gray-200" />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 py-16">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg text-red-600 mb-6">
          Failed to load page content. Please try again.
        </p>
        <button
          onClick={retry}
          className="px-6 py-2 bg-soil-dark text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!layout || layout.blocks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">This page has no content yet.</p>
      </div>
    );
  }

  // ── Happy path ───────────────────────────────────────────────────────────
  return <BlockRenderer blocks={layout.blocks} />;
}
