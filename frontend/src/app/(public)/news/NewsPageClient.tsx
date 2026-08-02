"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getContentByType } from "@/lib/public-content";
import type { ContentItem } from "@/types";
import { Calendar, User, ArrowRight, AlertCircle, Newspaper, Clock, Tag, BookOpen } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { useLanguage } from "@/lib/language-context";

interface Props {
  initialItems: ContentItem[];
  initialTotalPages: number;
}

function formatDate(dateStr?: string, locale = "en-US") {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readingTime(body?: string): number {
  if (!body) return 1;
  const words = body.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Content-type label config
const TYPE_CONFIG: Record<string, { en: string; ar: string; colour: string }> = {
  NEWS:        { en: "News",        ar: "أخبار",  colour: "bg-emerald-100 text-emerald-700" },
  ARTICLE:     { en: "Article",     ar: "مقال",   colour: "bg-blue-100 text-blue-700"       },
  PUBLICATION: { en: "Publication", ar: "منشور",  colour: "bg-purple-100 text-purple-700"   },
  PAGE:        { en: "Page",        ar: "صفحة",   colour: "bg-gray-100 text-gray-600"       },
};

// Gradient placeholders when no featured image
const GRADIENTS = [
  "from-soil-dark via-deep-soil to-soil-clay",
  "from-teal-800 via-teal-600 to-teal-400",
  "from-amber-800 via-amber-600 to-amber-400",
  "from-emerald-900 via-emerald-700 to-emerald-500",
  "from-stone-700 via-stone-500 to-stone-400",
];
function gradientFor(id: string) {
  const idx = id.charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

// Category tab definition — maps to contentType filter
const TABS = [
  { key: "ALL",         labelEn: "All",           labelAr: "الكل"       },
  { key: "NEWS",        labelEn: "News",           labelAr: "الأخبار"    },
  { key: "ARTICLE",     labelEn: "Articles",       labelAr: "المقالات"   },
  { key: "PUBLICATION", labelEn: "Publications",   labelAr: "المنشورات"  },
];

const PAGE_SIZE = 9;

export default function NewsPageClient({ initialItems, initialTotalPages }: Props) {
  const { t, direction } = useLanguage();
  const locale = direction === "rtl" ? "ar-SY" : "en-US";
  const lang   = direction === "rtl" ? "ar" : "en";

  const [items, setItems]           = useState<ContentItem[]>(initialItems);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [page, setPage]             = useState(0);
  const [activeTab, setActiveTab]   = useState("ALL");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(false);

  const fetchNews = useCallback(async (pageNum: number, tab: string) => {
    setLoading(true);
    setError(false);
    try {
      // When a specific type is selected, we still hit the NEWS endpoint for pagination
      // but filter client-side when fetching the full page. If you have type-specific
      // endpoints, swap the type param here.
      const type = tab === "ALL" ? "NEWS" : tab;
      const res  = await getContentByType(type, pageNum, PAGE_SIZE);
      if (res.data.success) {
        setItems(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when page or tab changes
  useEffect(() => {
    if (page > 0 || activeTab !== "ALL") {
      fetchNews(page, activeTab);
    }
  }, [page, activeTab, fetchNews]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(0);
  };

  // Numbered pagination helper
  function pageNumbers(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | "…")[] = [];
    if (current > 2)   pages.push(0);
    if (current > 3)   pages.push("…");
    for (let i = Math.max(0, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 4) pages.push("…");
    if (current < total - 2) pages.push(total - 1);
    return pages;
  }

  return (
    <div>
      <PageHero
        slug="news"
        defaultTitleEn="News & Announcements"
        defaultTitleAr="الأخبار والإعلانات"
      />

      <section className="py-10" style={{ background: "var(--style-color-bg, #ffffff)" }}>
        <div className="container mx-auto px-4">

          {/* ── Category Tabs ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mb-10">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-soil-clay text-white shadow-sm"
                      : "bg-white text-earth-gray border border-soil-sand hover:bg-soil-sand/40"
                  }`}
                >
                  {lang === "ar" ? tab.labelAr : tab.labelEn}
                </button>
              );
            })}
          </div>

          {/* ── Loading Skeleton ──────────────────────────────────────────── */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-soil-sand/40" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-3 bg-soil-sand/40 rounded w-1/4" />
                    <div className="h-5 bg-soil-sand/40 rounded w-full" />
                    <div className="h-5 bg-soil-sand/40 rounded w-4/5" />
                    <div className="h-3 bg-soil-sand/40 rounded w-3/5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── Error State ───────────────────────────────────────────────── */}
          {error && (
            <div className="text-center py-16">
              <AlertCircle className="h-12 w-12 text-earth-gray/40 mx-auto mb-4" />
              <p className="text-earth-gray text-lg mb-4">{t("Failed to load news", "فشل تحميل الأخبار")}</p>
              <Button onClick={() => fetchNews(page, activeTab)} className="bg-soil-clay hover:bg-soil-dark text-white">
                {t("Try Again", "حاول مجددًا")}
              </Button>
            </div>
          )}

          {/* ── Empty State ───────────────────────────────────────────────── */}
          {!loading && !error && items.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="h-14 w-14 text-earth-gray/30 mx-auto mb-4" />
              <p className="text-earth-gray text-lg">{t("No articles found", "لا توجد مقالات")}</p>
            </div>
          )}

          {/* ── News Grid ─────────────────────────────────────────────────── */}
          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const title    = lang === "ar" ? (item.titleAr || item.titleEn || "") : (item.titleEn || item.titleAr || "");
                const excerpt  = lang === "ar"
                  ? (item.excerptAr || item.excerpt || "")
                  : (item.excerpt || item.excerptAr || "");
                const mins     = readingTime(item.bodyAr || item.bodyEn || item.body);
                const typeCfg  = TYPE_CONFIG[item.contentType || "NEWS"];
                const dateStr  = formatDate(item.publishedAt, locale);
                const gradient = gradientFor(item.id);

                return (
                  <Link key={item.id} href={`/news/${item.slug}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col border-soil-sand/40">

                      {/* Image / Gradient header */}
                      <div className="relative h-48 overflow-hidden">
                        {item.featuredImage ? (
                          <img
                            src={item.featuredImage}
                            alt={title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            <Newspaper className="h-12 w-12 text-white/40" />
                          </div>
                        )}
                        {/* Content type badge over image */}
                        {typeCfg && (
                          <span className={`absolute top-3 start-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${typeCfg.colour} shadow-sm`}>
                            <Tag className="h-2.5 w-2.5" />
                            {lang === "ar" ? typeCfg.ar : typeCfg.en}
                          </span>
                        )}
                        {/* Featured indicator */}
                        {item.isFeatured && (
                          <span className="absolute top-3 end-3 px-2 py-0.5 rounded-full text-xs font-semibold bg-soil-clay text-white shadow-sm">
                            {t("Featured", "مميز")}
                          </span>
                        )}
                      </div>

                      <CardContent className="p-5 flex flex-col flex-1">
                        {/* Date + reading time */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {mins} {t("min read", "دقائق قراءة")}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          className="font-heading font-semibold text-soil-dark mb-2 line-clamp-2 group-hover:text-soil-clay transition-colors text-base leading-snug"
                          dir={lang === "ar" ? "rtl" : "ltr"}
                        >
                          {title}
                        </h3>

                        {/* Excerpt */}
                        {excerpt && (
                          <p
                            className="text-sm text-earth-gray line-clamp-2 mb-4 flex-1 leading-relaxed"
                            dir={lang === "ar" ? "rtl" : "ltr"}
                          >
                            {excerpt}
                          </p>
                        )}

                        {/* Footer: author + read more */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-soil-sand/30">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[60%]">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">{item.authorName}</span>
                          </span>
                          <span className="text-xs text-soil-clay font-semibold flex items-center gap-1 shrink-0 group-hover:gap-2 transition-all">
                            {t("Read More", "اقرأ المزيد")}
                            <ArrowRight className={`h-3 w-3 ${lang === "ar" ? "rotate-180" : ""}`} />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── Pagination ────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-12 flex-wrap">
              {/* Prev */}
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="border-soil-sand text-soil-dark hover:bg-soil-sand/30"
              >
                {lang === "ar" ? "→" : "←"} {t("Prev", "السابق")}
              </Button>

              {/* Page numbers */}
              {pageNumbers(page, totalPages).map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-soil-clay text-white"
                        : "border border-soil-sand text-soil-dark hover:bg-soil-sand/30"
                    }`}
                  >
                    {lang === "ar"
                      ? ((p as number) + 1).toLocaleString("ar-EG")
                      : (p as number) + 1}
                  </button>
                ),
              )}

              {/* Next */}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="border-soil-sand text-soil-dark hover:bg-soil-sand/30"
              >
                {t("Next", "التالي")} {lang === "ar" ? "←" : "→"}
              </Button>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
