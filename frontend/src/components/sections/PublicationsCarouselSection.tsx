"use client";

/**
 * PublicationsCarouselSection — horizontal card carousel on the homepage.
 *
 * Config keys:
 *   titleEn / titleAr       — section heading
 *   viewMoreLabelEn / Ar    — "View All" link text
 *   viewMoreUrl             — defaults to /publications
 *
 * Fetches live data from /api/public/publications (up to 8 items).
 * Clicking a card opens the PDF in a full-screen flip-book modal powered by
 * react-pdf — no iframe, so X-Frame-Options is not an issue.
 * Returns null when no publications are loaded.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Download, Eye, ArrowRight, X } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { StyleCard, StyleCardContent } from "@/components/ui/style-card";
import { TextReveal } from "@/components/ui/text-reveal";
import { PdfBookViewer } from "@/components/ui/gallery-pdf-book";
import { getPublicPublications } from "@/lib/publications";
import type { Publication } from "@/types";
import { useLanguage } from "@/lib/language-context";

// ---------------------------------------------------------------------------
// PDF Modal — uses PdfBookViewer (react-pdf) instead of an iframe so that
// external URLs blocked by X-Frame-Options still load correctly.
// ---------------------------------------------------------------------------

function PdfModal({ pub, onClose }: { pub: Publication; onClose: () => void }) {
  const { language } = useLanguage();
  const title = language === "ar" ? (pub.titleAr || pub.titleEn) : pub.titleEn;

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

        {/* PDF Book Viewer — flex-1 so it takes all remaining height */}
        <div className="flex-1 min-h-0 flex flex-col">
          {pub.pdfUrl ? (
            <PdfBookViewer
              file={pub.pdfUrl}
              title={title ?? undefined}
              className="w-full h-full"
            />
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
// Main component
// ---------------------------------------------------------------------------

interface PublicationsCarouselSectionProps {
  config?: Record<string, unknown>;
}

export function PublicationsCarouselSection({ config = {} }: PublicationsCarouselSectionProps) {
  const { language } = useLanguage();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedPub, setSelectedPub]   = useState<Publication | null>(null);

  useEffect(() => {
    getPublicPublications({ size: 8 })
      .then((res) => {
        if (res.data.success) setPublications(res.data.data.content ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Config-driven text
  const sectionTitle = language === "ar"
    ? ((config.titleAr as string) || "المنشورات")
    : ((config.titleEn as string) || "Publications");
  const viewMoreLabel = language === "ar"
    ? ((config.viewMoreLabelAr as string) || "جميع المنشورات")
    : ((config.viewMoreLabelEn as string) || "View All Publications");
  const viewMoreUrl = (config.viewMoreUrl as string) || "/publications";

  if (loading) {
    return (
      <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-56 flex-shrink-0 rounded-xl bg-white shadow-sm overflow-hidden animate-pulse">
                <div className="h-36 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
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
      <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }}>
        <div className="container mx-auto px-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <TextReveal
              as="h2"
              className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-soil-dark`}
            >
              {sectionTitle}
            </TextReveal>
            <Link
              href={viewMoreUrl}
              className="flex items-center gap-1 text-soil-clay hover:text-soil-dark font-medium fluid-sm transition-colors"
            >
              {viewMoreLabel}
              <ArrowRight className={`h-4 w-4 ${language === "ar" ? "rotate-180" : ""}`} />
            </Link>
          </div>

          {/* Horizontal scroll carousel */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin scrollbar-thumb-soil-sand scrollbar-track-transparent">
            {publications.map((pub) => {
              const title = language === "ar"
                ? (pub.titleAr || pub.titleEn)
                : pub.titleEn;

              return (
                <div key={pub.id} className="w-56 flex-shrink-0 snap-start">
                  <StyleCard className="h-full flex flex-col cursor-pointer group">
                    {/* Cover */}
                    <div
                      className="h-36 bg-soil-sand/30 flex items-center justify-center rounded-t-lg overflow-hidden flex-shrink-0"
                      onClick={() => setSelectedPub(pub)}
                    >
                      {pub.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={pub.coverImageUrl}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-soil-clay/30 group-hover:text-soil-clay/50 transition-colors" />
                      )}
                    </div>

                    <StyleCardContent className="flex flex-col flex-1 gap-1.5 p-3">
                      {/* Category + Year */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {pub.category && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                            {pub.category}
                          </span>
                        )}
                        {pub.year && (
                          <span className="text-xs text-muted-foreground">{pub.year}</span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={`${almarai.className} font-semibold text-soil-dark text-xs line-clamp-2 leading-snug`}>
                        {title}
                      </h3>

                      {/* Authors */}
                      {pub.authors && (
                        <p className="text-xs text-earth-gray line-clamp-1">{pub.authors}</p>
                      )}

                      {/* View button */}
                      <div className="flex gap-1.5 mt-auto pt-1">
                        <button
                          onClick={() => setSelectedPub(pub)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold bg-soil-dark text-white hover:bg-soil-clay transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          {language === "ar" ? "عرض" : "View"}
                        </button>
                        {pub.pdfUrl && (
                          <a
                            href={pub.pdfUrl}
                            download
                            className="flex items-center justify-center p-1.5 rounded-lg border border-soil-sand text-soil-dark hover:bg-soil-sand/40 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </StyleCardContent>
                  </StyleCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PDF Modal */}
      {selectedPub && (
        <PdfModal pub={selectedPub} onClose={() => setSelectedPub(null)} />
      )}
    </>
  );
}
