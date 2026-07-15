"use client";

import { useEffect, useState, useMemo } from "react";
import { almarai } from "@/lib/fonts";
import { StyleCard, StyleCardContent } from "@/components/ui/style-card";
import { PageHero } from "@/components/ui/page-hero";
import { PdfBookViewer } from "@/components/ui/gallery-pdf-book";
import { getPublicPublications } from "@/lib/publications";
import type { Publication } from "@/types";
import { useLanguage } from "@/lib/language-context";
import {
  BookOpen, Download, Eye, Search, AlertCircle, X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// PDF Modal — uses PdfBookViewer (react-pdf) instead of an iframe so that
// external URLs blocked by X-Frame-Options still load correctly.
// ---------------------------------------------------------------------------

function PdfModal({
  pub,
  onClose,
}: {
  pub: Publication;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const title = language === "ar" ? (pub.titleAr || pub.titleEn) : pub.titleEn;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#1a1a2e] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 flex-shrink-0">
          <h2 className={`${almarai.className} font-semibold text-base line-clamp-1 flex-1 mr-3 text-white`}>
            {title}
          </h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            {pub.pdfUrl && (
              <a
                href={pub.pdfUrl}
                download
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
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

        {/* PDF Book Viewer */}
        <div className="flex-1 min-h-0 overflow-auto">
          {pub.pdfUrl ? (
            <PdfBookViewer
              file={pub.pdfUrl}
              title={title ?? undefined}
              className="w-full"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-white/40">
              <BookOpen className="h-10 w-10 mr-3 opacity-40" />
              {language === "ar" ? "لا يوجد ملف PDF لهذا المنشور." : "No PDF available for this publication."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Publication card
// ---------------------------------------------------------------------------

function PublicationCard({
  pub,
  onView,
}: {
  pub: Publication;
  onView: (pub: Publication) => void;
}) {
  const { language } = useLanguage();
  const title    = language === "ar" ? (pub.titleAr || pub.titleEn) : pub.titleEn;
  const abstract = language === "ar" ? (pub.abstractAr || pub.abstractEn) : (pub.abstractEn || pub.abstractAr);

  return (
    <StyleCard className="h-full flex flex-col">
      {/* Cover image / icon */}
      <div className="h-44 bg-soil-sand/30 flex items-center justify-center rounded-t-lg overflow-hidden flex-shrink-0">
        {pub.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pub.coverImageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <BookOpen className="h-14 w-14 text-soil-clay/30" />
        )}
      </div>

      <StyleCardContent className="flex flex-col flex-1 gap-2">
        {/* Category + Year */}
        <div className="flex items-center gap-2 flex-wrap">
          {pub.category && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              {pub.category}
            </span>
          )}
          {pub.year && (
            <span className="text-xs text-muted-foreground">{pub.year}</span>
          )}
        </div>

        {/* Title */}
        <h3 className={`${almarai.className} font-semibold text-soil-dark line-clamp-2 text-sm leading-snug`}>
          {title}
        </h3>

        {/* Authors */}
        {pub.authors && (
          <p className="text-xs text-earth-gray line-clamp-1">{pub.authors}</p>
        )}

        {/* Abstract */}
        {abstract && (
          <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{abstract}</p>
        )}

        {/* File size */}
        {pub.fileSizeKb && (
          <p className="text-xs text-muted-foreground">
            {pub.fileSizeKb >= 1024
              ? `${(pub.fileSizeKb / 1024).toFixed(1)} MB`
              : `${pub.fileSizeKb} KB`}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1 mt-auto">
          {pub.pdfUrl && (
            <button
              onClick={() => onView(pub)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-soil-dark text-white hover:bg-soil-clay transition-colors flex-1 justify-center"
            >
              <Eye className="h-3.5 w-3.5" />
              {language === "ar" ? "عرض PDF" : "View PDF"}
            </button>
          )}
          {pub.pdfUrl && (
            <a
              href={pub.pdfUrl}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-soil-sand text-soil-dark hover:bg-soil-sand/40 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              {language === "ar" ? "تحميل" : "Download"}
            </a>
          )}
        </div>
      </StyleCardContent>
    </StyleCard>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PublicationsPage() {
  const { language } = useLanguage();

  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);
  const [search, setSearch]             = useState("");
  const [yearFilter, setYearFilter]     = useState<string>("all");
  const [catFilter, setCatFilter]       = useState<string>("all");
  const [selectedPub, setSelectedPub]   = useState<Publication | null>(null);

  // Load all active publications once
  useEffect(() => {
    setLoading(true);
    setError(false);
    getPublicPublications({ size: 200 })
      .then((res) => {
        if (res.data.success) {
          setPublications(res.data.data.content ?? []);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Derive available filter values from loaded data
  const availableYears = useMemo(() => {
    const seen = new Set<number>();
    const ys: number[] = [];
    for (const p of publications) {
      if (p.year != null && !seen.has(p.year)) { seen.add(p.year); ys.push(p.year); }
    }
    return ys.sort((a, b) => b - a);
  }, [publications]);

  const availableCategories = useMemo(() => {
    const seen = new Set<string>();
    const cats: string[] = [];
    for (const p of publications) {
      if (p.category && !seen.has(p.category)) { seen.add(p.category); cats.push(p.category); }
    }
    return cats;
  }, [publications]);

  // Client-side filtering
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return publications.filter((p) => {
      const matchSearch =
        !q ||
        (p.titleEn ?? "").toLowerCase().includes(q) ||
        (p.titleAr ?? "").toLowerCase().includes(q) ||
        (p.authors ?? "").toLowerCase().includes(q);
      const matchYear = yearFilter === "all" || String(p.year) === yearFilter;
      const matchCat  = catFilter === "all"  || p.category === catFilter;
      return matchSearch && matchYear && matchCat;
    });
  }, [publications, search, yearFilter, catFilter]);

  return (
    <div>
      <PageHero
        slug="publications"
        defaultTitle="Publications"
        defaultSubtitleAr="المنشورات والأبحاث"
      />

      <section className="py-10 bg-soil-cream/20 min-h-screen">
        <div className="container mx-auto px-4">

          {/* ── Search + Filters ──────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={language === "ar" ? "البحث في المنشورات…" : "Search publications…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-soil-sand bg-white text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
              />
            </div>

            {/* Year filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-soil-sand bg-white text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
            >
              <option value="all">{language === "ar" ? "كل السنوات" : "All Years"}</option>
              {availableYears.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>

          {/* Category filter buttons */}
          {availableCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setCatFilter("all")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  catFilter === "all"
                    ? "bg-soil-clay text-white"
                    : "bg-white text-earth-gray border border-soil-sand hover:bg-soil-sand/40"
                }`}
              >
                {language === "ar" ? "الكل" : "All"}
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    catFilter === cat
                      ? "bg-soil-clay text-white"
                      : "bg-white text-earth-gray border border-soil-sand hover:bg-soil-sand/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* ── Loading ──────────────────────────────────────────────── */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl bg-white shadow-sm overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Error ────────────────────────────────────────────────── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <p className="text-red-600 font-medium">
                {language === "ar" ? "فشل تحميل المنشورات. يرجى المحاولة مرة أخرى." : "Failed to load publications. Please try again."}
              </p>
              <button
                onClick={() => { setError(false); setLoading(true); getPublicPublications({ size: 200 }).then(r => { setPublications(r.data.data.content ?? []); }).catch(() => setError(true)).finally(() => setLoading(false)); }}
                className="mt-4 px-6 py-2 rounded-lg bg-soil-dark text-white text-sm font-medium hover:bg-soil-clay transition-colors"
              >
                {language === "ar" ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          )}

          {/* ── Empty ─────────────────────────────────────────────────── */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="h-14 w-14 text-soil-clay/30 mb-4" />
              <p className="text-earth-gray font-medium">
                {language === "ar" ? "لا توجد منشورات مطابقة." : "No publications match your search."}
              </p>
            </div>
          )}

          {/* ── Grid ─────────────────────────────────────────────────── */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {language === "ar"
                  ? `${filtered.length} منشور`
                  : `${filtered.length} publication${filtered.length !== 1 ? "s" : ""}`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((pub) => (
                  <PublicationCard key={pub.id} pub={pub} onView={setSelectedPub} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── PDF Modal ──────────────────────────────────────────────────── */}
      {selectedPub && (
        <PdfModal pub={selectedPub} onClose={() => setSelectedPub(null)} />
      )}
    </div>
  );
}
