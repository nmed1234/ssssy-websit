"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Image as ImageIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaLibraryModal } from "@/components/page-builder/MediaLibraryModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeoFields {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
}

export interface SeoEditorPanelProps {
  /** Current field values */
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;

  /** Page context (for SERP fallback display) */
  pageTitle: string;   // used as placeholder when metaTitle is empty
  pageSlug: string;    // used in SERP preview URL

  /** Change handler */
  onChange: (field: keyof SeoFields, value: string) => void;
}

// ─── Character counter colors (Requirement 19.2 / 19.3) ──────────────────────

type CounterColor = "yellow" | "green" | "red";

function getCounterColor(count: number, limit: number): CounterColor {
  if (count === 0) return "yellow";
  if (count <= limit) return "green";
  return "red";
}

const COUNTER_CLASS: Record<CounterColor, string> = {
  yellow: "text-yellow-500",
  green:  "text-green-600",
  red:    "text-red-600",
};

// ─── CharCounter ─────────────────────────────────────────────────────────────

function CharCounter({ count, limit }: { count: number; limit: number }) {
  const color = getCounterColor(count, limit);
  return (
    <span
      aria-live="polite"
      className={cn("text-xs font-mono tabular-nums", COUNTER_CLASS[color])}
    >
      {count} / {limit}
    </span>
  );
}

// ─── Shared input / textarea styles ──────────────────────────────────────────

const INPUT_BASE =
  "w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-soil-clay/40 transition-colors border-input bg-background";

// ─── SERP Preview Card (Requirement 19.4) ────────────────────────────────────

interface SerpPreviewProps {
  title: string;
  slug: string;
  description: string;
}

function SerpPreview({ title, slug, description }: SerpPreviewProps) {
  const displayUrl = `example.com${slug ? `/${slug}` : ""}`;
  const displayTitle = title || "Page Title";
  const displayDescription =
    description.slice(0, 160) || "No description provided.";

  return (
    <div className="rounded-lg border bg-white p-4 space-y-0.5 shadow-sm">
      {/* URL line */}
      <div className="flex items-center gap-1.5 text-xs text-green-700">
        <Search className="w-3 h-3 shrink-0 opacity-60" />
        <span className="truncate">{displayUrl}</span>
      </div>

      {/* Blue link title */}
      <p
        className="text-[18px] leading-snug text-blue-700 hover:underline cursor-default truncate font-normal"
        title={displayTitle}
      >
        {displayTitle}
      </p>

      {/* Gray description */}
      <p className="text-sm text-gray-600 leading-snug line-clamp-2">
        {displayDescription}
      </p>
    </div>
  );
}

// ─── OG Preview Card (Requirement 19.5) ──────────────────────────────────────

interface OgPreviewProps {
  title: string;
  description: string;
  imageUrl: string;
  pageTitle: string;
}

function OgPreview({ title, description, imageUrl, pageTitle }: OgPreviewProps) {
  const displayTitle = title || pageTitle || "Page Title";

  return (
    <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
      {/* Image area */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="w-full h-40 object-cover bg-muted"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-full h-40 bg-muted flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}

      {/* Text area */}
      <div className="p-3 space-y-0.5 border-t">
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
          {displayTitle}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── OG Image Validation (Requirement 19.7) ──────────────────────────────────

type ImageValidationState = "idle" | "checking" | "ok" | "warn";

function useOgImageValidation(ogImageUrl: string): ImageValidationState {
  const [state, setState] = useState<ImageValidationState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!ogImageUrl.trim()) {
      setState("idle");
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setState("checking");
      try {
        const res = await fetch(ogImageUrl, { method: "HEAD" });
        if (!res.ok) {
          setState("warn");
          return;
        }
        const contentType = res.headers.get("content-type") ?? "";
        setState(contentType.startsWith("image/") ? "ok" : "warn");
      } catch {
        setState("warn");
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [ogImageUrl]);

  return state;
}

// ─── Main SeoEditorPanel ──────────────────────────────────────────────────────

/**
 * SeoEditorPanel — provides SEO metadata fields, live character counters,
 * a Google SERP preview card, and an Open Graph preview card.
 *
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7
 */
export function SeoEditorPanel({
  metaTitle,
  metaDescription,
  ogTitle,
  ogDescription,
  ogImageUrl,
  pageTitle,
  pageSlug,
  onChange,
}: SeoEditorPanelProps) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [previewsExpanded, setPreviewsExpanded] = useState(true);

  const ogImageState = useOgImageValidation(ogImageUrl);

  return (
    <div className="space-y-6">
      {/* ── Section 1: Meta fields ── */}
      <section aria-label="Meta Tags" className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Meta Tags
        </h4>

        {/* meta_title — Requirement 19.1, 19.2, 19.6 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="seo-meta-title"
              className="text-sm font-medium text-foreground"
            >
              Meta Title
            </label>
            <CharCounter count={metaTitle.length} limit={60} />
          </div>
          <input
            id="seo-meta-title"
            type="text"
            value={metaTitle}
            onChange={(e) => onChange("metaTitle", e.target.value)}
            /* Requirement 19.6 — show page title as placeholder when empty */
            placeholder={pageTitle || "Page title (fallback)"}
            className={INPUT_BASE}
            aria-describedby="seo-meta-title-counter"
          />
          <p id="seo-meta-title-counter" className="sr-only">
            {metaTitle.length} of 60 characters used
          </p>
        </div>

        {/* meta_description — Requirement 19.1, 19.3 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="seo-meta-description"
              className="text-sm font-medium text-foreground"
            >
              Meta Description
            </label>
            <CharCounter count={metaDescription.length} limit={160} />
          </div>
          <textarea
            id="seo-meta-description"
            value={metaDescription}
            onChange={(e) => onChange("metaDescription", e.target.value)}
            rows={3}
            placeholder="Brief description of the page for search engines…"
            className={cn(INPUT_BASE, "resize-y min-h-[80px]")}
            aria-describedby="seo-meta-description-counter"
          />
          <p id="seo-meta-description-counter" className="sr-only">
            {metaDescription.length} of 160 characters used
          </p>
        </div>
      </section>

      {/* ── Section 2: Open Graph fields ── */}
      <section aria-label="Open Graph" className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Open Graph
        </h4>

        {/* og_title */}
        <div className="space-y-1">
          <label
            htmlFor="seo-og-title"
            className="block text-sm font-medium text-foreground"
          >
            OG Title
          </label>
          <input
            id="seo-og-title"
            type="text"
            value={ogTitle}
            onChange={(e) => onChange("ogTitle", e.target.value)}
            placeholder={pageTitle || "Open Graph title (optional)"}
            className={INPUT_BASE}
          />
        </div>

        {/* og_description */}
        <div className="space-y-1">
          <label
            htmlFor="seo-og-description"
            className="block text-sm font-medium text-foreground"
          >
            OG Description
          </label>
          <textarea
            id="seo-og-description"
            value={ogDescription}
            onChange={(e) => onChange("ogDescription", e.target.value)}
            rows={2}
            placeholder="Open Graph description (optional)…"
            className={cn(INPUT_BASE, "resize-y min-h-[64px]")}
          />
        </div>

        {/* og_image_url — Requirement 19.1, 19.7 */}
        <div className="space-y-1">
          <label
            htmlFor="seo-og-image"
            className="block text-sm font-medium text-foreground"
          >
            OG Image
          </label>
          <div className="flex gap-2">
            <input
              id="seo-og-image"
              type="text"
              value={ogImageUrl}
              onChange={(e) => onChange("ogImageUrl", e.target.value)}
              placeholder="https://…/image.jpg"
              className={cn(INPUT_BASE, "flex-1")}
              aria-describedby={
                ogImageState === "warn" ? "seo-og-image-warn" : undefined
              }
            />
            <button
              type="button"
              onClick={() => setMediaOpen(true)}
              className={cn(
                "shrink-0 px-3 py-2 rounded-md border text-sm font-medium transition-colors",
                "border-input bg-background hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-soil-clay/60"
              )}
              aria-label="Browse media library"
            >
              Browse
            </button>
          </div>

          {/* Validation states */}
          {ogImageState === "checking" && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Checking image URL…
            </p>
          )}
          {ogImageState === "warn" && (
            <p
              id="seo-og-image-warn"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-amber-600"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Image URL may not be reachable or is not an image
            </p>
          )}
        </div>
      </section>

      {/* ── Section 3: Previews ── */}
      <section aria-label="Previews">
        {/* Collapsible heading */}
        <button
          type="button"
          onClick={() => setPreviewsExpanded((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between mb-3",
            "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
            "hover:text-foreground transition-colors focus:outline-none"
          )}
          aria-expanded={previewsExpanded}
          aria-controls="seo-previews-panel"
        >
          <span>Previews</span>
          <span className="text-muted-foreground/60 text-[10px] font-normal normal-case tracking-normal">
            {previewsExpanded ? "hide" : "show"}
          </span>
        </button>

        {previewsExpanded && (
          <div id="seo-previews-panel" className="space-y-5">
            {/* Google SERP — Requirement 19.4 */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">
                Google SERP preview
              </p>
              <SerpPreview
                title={metaTitle || pageTitle}
                slug={pageSlug}
                description={metaDescription}
              />
            </div>

            {/* Open Graph — Requirement 19.5 */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">
                Social media (OG) preview
              </p>
              <OgPreview
                title={ogTitle}
                description={ogDescription}
                imageUrl={ogImageUrl}
                pageTitle={pageTitle}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Media library modal ── */}
      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          onChange("ogImageUrl", url);
          setMediaOpen(false);
        }}
      />
    </div>
  );
}

export default SeoEditorPanel;
