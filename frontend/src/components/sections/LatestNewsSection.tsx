"use client";

/**
 * LatestNewsSection — homepage latest news grid.
 *
 * Config keys:
 *   titleEn / titleAr          — section heading
 *   viewAllLabelEn / LabelAr   — "View All" link text
 *   viewAllUrl                 — defaults to /news
 *   count                      — number of articles to show (default 3)
 *   dataSource                 — "api" (default) | "manual"
 *
 * Data keys (when dataSource is "manual" or items array is present):
 *   items[]                    — array of manual news entries:
 *     titleEn / titleAr, excerpt, excerptAr, publishedAt, featuredImage, slug, category
 *
 * When dataSource === "api" (default), fetches live data from
 * /api/public/content?contentType=NEWS.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { getPublishedContent } from "@/lib/public-content";
import type { ContentItem } from "@/types";
import { useLanguage } from "@/lib/language-context";

// ---------------------------------------------------------------------------
// Manual item shape — comes from the repeater in section data
// ---------------------------------------------------------------------------

interface ManualNewsItem {
  titleEn?: string;
  titleAr?: string;
  excerpt?: string;
  excerptAr?: string;
  publishedAt?: string;
  featuredImage?: string;
  slug?: string;
  category?: string;
}

// ---------------------------------------------------------------------------
// Normalise a ManualNewsItem → ContentItem-like shape
// ---------------------------------------------------------------------------

function manualToContentItem(item: ManualNewsItem, idx: number): ContentItem {
  return {
    id: `manual-${idx}`,
    titleEn: item.titleEn || item.titleAr || `Article ${idx + 1}`,
    titleAr: item.titleAr,
    slug: item.slug || `manual-news-${idx}`,
    excerpt: item.excerpt,
    excerptAr: item.excerptAr,
    featuredImage: item.featuredImage,
    publishedAt: item.publishedAt,
    contentType: "NEWS",
    status: "PUBLISHED",
    authorId: "",
    authorName: "",
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface LatestNewsSectionProps {
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export function LatestNewsSection({
  config = {},
  data = {},
}: LatestNewsSectionProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [apiItems, setApiItems]   = useState<ContentItem[]>([]);
  const [loading, setLoading]     = useState(false);

  // Determine data source
  const manualItems  = Array.isArray(data.items) ? (data.items as ManualNewsItem[]) : [];
  const dataSource   = (config.dataSource as string) || "api";
  const useManual    = dataSource === "manual" || manualItems.length > 0;

  // Fetch from API when not using manual items
  useEffect(() => {
    if (useManual) return;
    setLoading(true);
    getPublishedContent({ contentType: "NEWS", size: 12 })
      .then((res) => {
        if (res.data.success) setApiItems(res.data.data.content ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [useManual]);

  // Final list of items to display
  const count       = config.count ? Number(config.count) : 3;
  const allItems: ContentItem[] = useManual
    ? manualItems.map((item, idx) => manualToContentItem(item, idx))
    : apiItems;
  const items = allItems.slice(0, count);

  // Config-driven text
  const sectionTitle = isAr
    ? ((config.titleAr as string) || "أحدث الأخبار")
    : ((config.titleEn as string) || "Latest News");
  const sectionSubtitle = isAr
    ? ((config.subtitleAr as string) || "")
    : ((config.subtitleEn as string) || "");
  const viewAllLabel = isAr
    ? ((config.viewAllLabelAr as string) || (config.viewAllLabel as string) || "جميع الأخبار")
    : ((config.viewAllLabelEn as string) || (config.viewAllLabel as string) || "View All News");
  const viewAllUrl  = (config.viewAllUrl as string) || "/news";

  if (loading) {
    return (
      <section className="py-20 relative overflow-hidden" style={{ background: "var(--style-color-bg)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, var(--style-color-primary, #7a5c3c) 0%, transparent 70%)", transform: "translate(-40%, -40%)" }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, var(--style-color-secondary, #3b6e47) 0%, transparent 70%)", transform: "translate(40%, 40%)" }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center mb-10">
            <div className="h-9 w-52 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-6 w-36 bg-gray-100 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse shadow-sm">
                <div className="h-52 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-full" />
                  <div className="h-5 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: "var(--style-color-bg)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, var(--style-color-primary, #7a5c3c) 0%, transparent 70%)",
            transform: "translate(-35%, -35%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, var(--style-color-secondary, #3b6e47) 0%, transparent 70%)",
            transform: "translate(35%, 35%)",
          }}
        />
        {/* Subtle dot grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.025]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="dots-news" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-soil-clay" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-news)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className={`flex items-end justify-between mb-12 gap-4 flex-wrap`}>
          <div>
            {/* Accent chip */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{
                  background: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 12%, transparent)",
                  color: "var(--style-color-primary, #7a5c3c)",
                }}
              >
                <Newspaper className="h-3 w-3" />
                {isAr ? "الأخبار" : "News"}
              </span>
            </div>
            <h2
              className={`${almarai.className} text-3xl md:text-4xl font-extrabold leading-tight`}
              style={{ color: "var(--style-color-heading, var(--style-color-text, #1a1a1a))" }}
            >
              {sectionTitle}
            </h2>
            {sectionSubtitle && (
              <p className="mt-2 text-base opacity-60" style={{ color: "var(--style-color-text, #333)" }}>
                {sectionSubtitle}
              </p>
            )}
          </div>

          <Link
            href={viewAllUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-100 shrink-0"
            style={{
              background: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 10%, transparent)",
              color: "var(--style-color-primary, #7a5c3c)",
              border: "1px solid color-mix(in srgb, var(--style-color-primary, #7a5c3c) 20%, transparent)",
            }}
          >
            {isAr ? <ArrowLeft className="h-4 w-4" /> : null}
            {viewAllLabel}
            {!isAr ? <ArrowRight className="h-4 w-4" /> : null}
          </Link>
        </div>

        {/* ── News Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {items.map((item, idx) => {
            // Language-aware field selection
            const articleTitle = isAr
              ? (item.titleAr || item.titleEn || "")
              : (item.titleEn || item.titleAr || "");
            // `excerpt` is the English excerpt; `excerptAr` is the Arabic one
            const articleExcerpt = isAr
              ? (item.excerptAr || "")
              : (item.excerpt || "");
            const href = item.slug ? `/news/${item.slug}` : "/news";

            // Estimate reading time from the language-appropriate body
            const bodyText = isAr
              ? (item.bodyAr || item.body || item.bodyEn || "")
              : (item.bodyEn || item.body || item.bodyAr || "");
            const mins = bodyText
              ? Math.max(1, Math.ceil(bodyText.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length / 200))
              : null;

            const isFeatured = idx === 0 && items.length >= 3;

            return (
              <Link
                key={item.id}
                href={href}
                className={`group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-2xl ${isFeatured ? "md:col-span-1" : ""}`}
              >
                <article
                  className="h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    background: "var(--style-color-card-bg, #ffffff)",
                    border: "1px solid color-mix(in srgb, var(--style-color-border, #e5e7eb) 80%, transparent)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Featured image */}
                  <div className="relative overflow-hidden bg-gray-100" style={{ height: "13rem" }}>
                    {item.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.featuredImage}
                        alt={articleTitle}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 8%, var(--style-color-bg, #fafafa))",
                        }}
                      >
                        <BookOpen
                          className="h-14 w-14 transition-transform duration-300 group-hover:scale-110"
                          style={{ color: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 35%, transparent)" }}
                        />
                      </div>
                    )}

                    {/* Category badge overlay */}
                    {item.category && (
                      <div className={`absolute top-3 ${isAr ? "right-3" : "left-3"}`}>
                        <span
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-sm"
                          style={{
                            background: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 85%, transparent)",
                            color: "#fff",
                          }}
                        >
                          {isAr
                            ? (item.category.nameAr || item.category.nameEn || item.category.slug)
                            : (item.category.nameEn || item.category.nameAr || item.category.slug)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 p-5">
                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--style-color-muted, #888)" }}>
                      {item.publishedAt && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {new Date(item.publishedAt).toLocaleDateString(
                            isAr ? "ar-SA" : "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </span>
                      )}
                      {mins && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          {mins}{isAr ? " دقيقة" : " min"}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className={`${almarai.className} font-bold text-base leading-snug line-clamp-2 mb-2 transition-colors duration-200 group-hover:opacity-80`}
                      style={{ color: "var(--style-color-heading, var(--style-color-text, #1a1a1a))" }}
                    >
                      {articleTitle}
                    </h3>

                    {/* Excerpt */}
                    {articleExcerpt && (
                      <p
                        className="text-sm line-clamp-3 flex-1 leading-relaxed mb-4"
                        style={{ color: "var(--style-color-muted, #666)" }}
                      >
                        {articleExcerpt}
                      </p>
                    )}

                    {/* Read More link */}
                    <div className={`mt-auto flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 group-hover:gap-2.5`}
                      style={{ color: "var(--style-color-primary, #7a5c3c)" }}
                    >
                      {isAr ? <ArrowLeft className="h-3.5 w-3.5 shrink-0" /> : null}
                      {isAr ? "اقرأ المزيد" : "Read More"}
                      {!isAr ? <ArrowRight className="h-3.5 w-3.5 shrink-0" /> : null}
                    </div>
                  </div>

                  {/* Bottom accent bar */}
                  <div
                    className="h-0.5 w-0 group-hover:w-full transition-all duration-500 ease-out"
                    style={{ background: "var(--style-color-primary, #7a5c3c)" }}
                  />
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
