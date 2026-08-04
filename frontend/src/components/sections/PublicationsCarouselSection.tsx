"use client";

/**
 * PublicationsCarouselSection — animated slider on the homepage.
 *
 * Config keys:
 *   titleEn / titleAr       — section heading
 *   viewMoreLabelEn / Ar    — "View All" link text
 *   viewMoreUrl             — defaults to /publications
 *   dataSource              — "api" (default) | "manual"
 *
 * Data keys (when dataSource is "manual" or items array is present):
 *   items[]                 — array of manual publication entries:
 *     titleEn / titleAr, description(En|Ar), coverImage, link, authors, year, category
 *
 * Slider behaviour:
 *   - Shows 1 / 2 / 3 / 4 cards per page on xs / sm / md / lg+
 *   - Arrow buttons + dot indicators — NO scrollbar
 *   - Animated with framer-motion
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Download, Eye, ArrowRight, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { StyleCard, StyleCardContent } from "@/components/ui/style-card";
import { TextReveal } from "@/components/ui/text-reveal";
import { PdfBookViewer } from "@/components/ui/gallery-pdf-book";
import { getPublicPublications } from "@/lib/publications";
import type { Publication } from "@/types";
import { useLanguage } from "@/lib/language-context";

// ---------------------------------------------------------------------------
// Manual item shape — comes from the repeater in section data
// ---------------------------------------------------------------------------

interface ManualItem {
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  coverImage?: string;
  link?: string;
  authors?: string;
  year?: string | number;
  category?: string;
}

// ---------------------------------------------------------------------------
// Normalise a ManualItem → Publication-like shape for the card renderer
// ---------------------------------------------------------------------------

function manualToPublication(item: ManualItem, idx: number): Publication {
  return {
    id: `manual-${idx}`,
    titleEn: item.titleEn || item.titleAr || `Publication ${idx + 1}`,
    titleAr: item.titleAr,
    slug: `manual-${idx}`,
    abstractEn: item.descriptionEn,
    abstractAr: item.descriptionAr,
    authors: item.authors,
    year: typeof item.year === "number" ? item.year : (item.year ? parseInt(item.year) : undefined),
    category: item.category,
    coverImageUrl: item.coverImage,
    pdfUrl: item.link,
    isActive: true,
  };
}

// ---------------------------------------------------------------------------
// PDF Modal — uses PdfBookViewer (react-pdf) instead of an iframe so that
// external URLs blocked by X-Frame-Options still load correctly.
// For non-PDF links, opens in a new tab.
// ---------------------------------------------------------------------------

function isPdfUrl(url: string): boolean {
  const lower = url.toLowerCase().split("?")[0];
  return lower.endsWith(".pdf");
}

function PdfModal({ pub, onClose }: { pub: Publication; onClose: () => void }) {
  const { language } = useLanguage();
  const title = language === "ar" ? (pub.titleAr || pub.titleEn) : pub.titleEn;
  const showPdf = !!pub.pdfUrl && isPdfUrl(pub.pdfUrl);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#1a1a2e] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "75vw", height: "75vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 flex-shrink-0">
          <h2 className={`${almarai.className} font-semibold text-sm line-clamp-1 flex-1 mr-3 text-white`}>
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {pub.pdfUrl && (
              <a
                href={pub.pdfUrl}
                download
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium text-white"
              >
                <Download className="h-3.5 w-3.5" />
                {language === "ar" ? "تحميل" : "Download"}
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col">
          {showPdf ? (
            <PdfBookViewer
              file={pub.pdfUrl!}
              title={title ?? undefined}
              className="w-full h-full"
            />
          ) : pub.pdfUrl ? (
            /* Non-PDF link — show description + open button */
            <div className="flex flex-col items-center justify-center h-full gap-5 text-white px-8 text-center">
              {pub.coverImageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={pub.coverImageUrl}
                  alt={pub.titleEn ?? ""}
                  className="max-h-48 max-w-xs object-contain rounded-lg shadow-lg"
                />
              )}
              <p className="text-sm text-white/70 max-w-md">
                {(language === "ar" ? pub.abstractAr : pub.abstractEn) ?? ""}
              </p>
              <a
                href={pub.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                {language === "ar" ? "فتح الرابط" : "Open Link"}
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-white/40 gap-3">
              <BookOpen className="h-8 w-8 opacity-30" />
              {language === "ar" ? "لا يوجد ملف PDF." : "No PDF available."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Publication Card
// ---------------------------------------------------------------------------

function PublicationCard({
  pub,
  language,
  onView,
}: {
  pub: Publication;
  language: "ar" | "en";
  onView: (p: Publication) => void;
}) {
  const title = language === "ar" ? (pub.titleAr || pub.titleEn) : pub.titleEn;
  const abstract = language === "ar" ? pub.abstractAr : pub.abstractEn;
  const isExternalLink = !!pub.pdfUrl && !isPdfUrl(pub.pdfUrl);

  return (
    <StyleCard className="h-full flex flex-col cursor-pointer group">
      {/* Cover */}
      <div
        className="relative h-44 bg-soil-sand/30 flex items-center justify-center rounded-t-xl overflow-hidden flex-shrink-0"
        onClick={() => onView(pub)}
      >
        {pub.coverImageUrl ? (
          <Image
            src={pub.coverImageUrl}
            alt={pub.titleEn ?? ""}
            fill
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <BookOpen className="h-14 w-14 text-soil-clay/25 group-hover:text-soil-clay/45 transition-colors" />
        )}
        {/* Category badge overlay */}
        {pub.category && (
          <span className="absolute top-2 start-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/90 text-amber-900 shadow-sm backdrop-blur-sm">
            {pub.category}
          </span>
        )}
      </div>

      <StyleCardContent className="flex flex-col flex-1 gap-2 p-4">
        {/* Year */}
        {pub.year && (
          <span className="text-xs text-earth-gray/70 font-medium">{pub.year}</span>
        )}

        {/* Title */}
        <h3 className={`${almarai.className} font-bold text-soil-dark text-sm line-clamp-3 leading-snug flex-1`}>
          {title}
        </h3>

        {/* Authors */}
        {pub.authors && (
          <p className="text-xs text-earth-gray line-clamp-1 opacity-80">{pub.authors}</p>
        )}

        {/* Abstract preview (manual items) */}
        {abstract && !pub.authors && (
          <p className="text-xs text-earth-gray/75 line-clamp-2 leading-snug">{abstract}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-soil-sand/40">
          {isExternalLink ? (
            <a
              href={pub.pdfUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-soil-dark text-white hover:bg-soil-clay transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {language === "ar" ? "فتح" : "Open"}
            </a>
          ) : (
            <button
              onClick={() => onView(pub)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-soil-dark text-white hover:bg-soil-clay transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              {language === "ar" ? "عرض" : "View"}
            </button>
          )}
          {pub.pdfUrl && !isExternalLink && (
            <a
              href={pub.pdfUrl}
              download
              className="flex items-center justify-center p-2 rounded-lg border border-soil-sand text-soil-dark hover:bg-soil-sand/40 transition-colors"
              title={language === "ar" ? "تحميل" : "Download"}
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </StyleCardContent>
    </StyleCard>
  );
}

// ---------------------------------------------------------------------------
// useResponsivePerPage — returns how many cards to show per page
// based on the current viewport width.
// ---------------------------------------------------------------------------

function useResponsivePerPage() {
  const [perPage, setPerPage] = useState(4);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setPerPage(1);
      else if (w < 768) setPerPage(2);
      else if (w < 1024) setPerPage(3);
      else setPerPage(4);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perPage;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface PublicationsCarouselSectionProps {
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export function PublicationsCarouselSection({
  config = {},
  data = {},
}: PublicationsCarouselSectionProps) {
  const { language } = useLanguage();
  const [apiPublications, setApiPublications] = useState<Publication[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [selectedPub, setSelectedPub]         = useState<Publication | null>(null);
  const [page, setPage]                       = useState(0);
  const [direction, setDirection]             = useState<1 | -1>(1); // 1 = forward, -1 = backward

  const perPage = useResponsivePerPage();

  // Determine data source
  const manualItems = Array.isArray(data.items) ? (data.items as ManualItem[]) : [];
  const dataSource = (config.dataSource as string) || "api";
  const useManual = dataSource === "manual" || manualItems.length > 0;

  // Fetch from API when not using manual items
  useEffect(() => {
    if (useManual) return;
    setLoading(true);
    getPublicPublications({ size: 12 })
      .then((res) => {
        if (res.data.success) setApiPublications(res.data.data.content ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [useManual]);

  // Final list of publications to display
  const publications: Publication[] = useManual
    ? manualItems.map((item, idx) => manualToPublication(item, idx))
    : apiPublications;

  // Pagination
  const totalPages = Math.ceil(publications.length / perPage);
  const currentSlice = useMemo(
    () => publications.slice(page * perPage, page * perPage + perPage),
    [publications, page, perPage]
  );

  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      setDirection(dir);
      setPage(next);
    },
    []
  );

  const goPrev = useCallback(() => {
    goTo((page - 1 + totalPages) % totalPages, -1);
  }, [page, totalPages, goTo]);

  const goNext = useCallback(() => {
    goTo((page + 1) % totalPages, 1);
  }, [page, totalPages, goTo]);

  // Reset page when perPage changes to avoid out-of-range index
  useEffect(() => { setPage(0); }, [perPage]);

  // Config-driven text
  const sectionTitle = language === "ar"
    ? ((config.titleAr as string) || "المنشورات")
    : ((config.titleEn as string) || "Publications");
  const viewMoreLabel = language === "ar"
    ? ((config.viewMoreLabelAr as string) || "جميع المنشورات")
    : ((config.viewMoreLabelEn as string) || "View All Publications");
  const viewMoreUrl = (config.viewMoreUrl as string) || "/publications";

  // Slide animation variants — respect RTL direction
  const isRtl = language === "ar";
  const variants = {
    enter: (d: number) => ({
      x: d * (isRtl ? -1 : 1) * 60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({
      x: d * (isRtl ? -1 : 1) * -60,
      opacity: 0,
    }),
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl bg-white shadow-sm overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (publications.length === 0) return null;

  return (
    <>
      <section
        className="py-16 md:py-20 overflow-hidden"
        style={{ background: "var(--style-color-bg)" }}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="container mx-auto px-4">
          {/* ── Header row ── */}
          <div className="flex items-center justify-between mb-8 gap-4">
            <TextReveal
              as="h2"
              className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-soil-dark`}
            >
              {sectionTitle}
            </TextReveal>
            <Link
              href={viewMoreUrl}
              className="flex items-center gap-1.5 text-soil-clay hover:text-soil-dark font-semibold fluid-sm transition-colors whitespace-nowrap shrink-0"
            >
              {viewMoreLabel}
              <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          </div>

          {/* ── Slider area ── */}
          <div className="relative">
            {/* Cards — animated */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="grid gap-5"
                style={{
                  gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))`,
                }}
              >
                {currentSlice.map((pub) => (
                  <PublicationCard
                    key={pub.id}
                    pub={pub}
                    language={language}
                    onView={setSelectedPub}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Prev arrow */}
            {totalPages > 1 && (
              <button
                onClick={isRtl ? goNext : goPrev}
                aria-label={language === "ar" ? "السابق" : "Previous"}
                className="absolute -start-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-soil-sand shadow-md flex items-center justify-center text-soil-dark hover:bg-soil-sand/50 transition-colors disabled:opacity-30"
              >
                {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
            )}

            {/* Next arrow */}
            {totalPages > 1 && (
              <button
                onClick={isRtl ? goPrev : goNext}
                aria-label={language === "ar" ? "التالي" : "Next"}
                className="absolute -end-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-soil-sand shadow-md flex items-center justify-center text-soil-dark hover:bg-soil-sand/50 transition-colors disabled:opacity-30"
              >
                {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            )}
          </div>

          {/* ── Dot indicators ── */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-7">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > page ? 1 : -1)}
                  aria-label={`${language === "ar" ? "صفحة" : "Page"} ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === page
                      ? "w-6 bg-soil-clay"
                      : "w-2 bg-soil-sand hover:bg-soil-clay/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PDF Modal */}
      {selectedPub && (
        <PdfModal pub={selectedPub} onClose={() => setSelectedPub(null)} />
      )}
    </>
  );
}
