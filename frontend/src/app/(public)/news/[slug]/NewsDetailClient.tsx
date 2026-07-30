"use client";

import Link from "next/link";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ContentItem } from "@/types";
import {
  Calendar, User, Tag, ArrowLeft, ArrowRight, Share2,
  Facebook, Twitter, Linkedin, Clock, BookOpen, Newspaper,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function formatDate(dateStr?: string, locale = "en-US") {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatReadingTime(body?: string): number {
  if (!body) return 1;
  const words = body.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const GRADIENTS = [
  "from-soil-dark via-deep-soil to-soil-clay",
  "from-teal-800 via-teal-600 to-teal-400",
  "from-amber-800 via-amber-600 to-amber-400",
  "from-emerald-900 via-emerald-700 to-emerald-500",
  "from-stone-700 via-stone-500 to-stone-400",
];
function gradientFor(id: string) {
  return GRADIENTS[id.charCodeAt(0) % GRADIENTS.length];
}

interface Props {
  initialArticle: ContentItem | null;
  relatedArticles?: ContentItem[];
}

export default function NewsDetailClient({ initialArticle, relatedArticles = [] }: Props) {
  const { t, direction } = useLanguage();
  const lang   = direction === "rtl" ? "ar" : "en";
  const locale = direction === "rtl" ? "ar-SY" : "en-US";

  // Back arrow flips for RTL
  const BackArrow = direction === "rtl" ? ArrowRight : ArrowLeft;

  if (!initialArticle) {
    return (
      <div>
        <section className="bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <Link href="/news" className="inline-flex items-center gap-2 text-soil-sand hover:text-white transition-colors">
              <BackArrow className="h-4 w-4" /> {t("Back to News", "العودة للأخبار")}
            </Link>
          </div>
        </section>
        <section className="py-16" style={{ background: "var(--style-color-bg, #ffffff)" }}>
          <div className="container mx-auto px-4 text-center max-w-lg">
            <BookOpen className="h-16 w-16 text-earth-gray/40 mx-auto mb-6" />
            <h2 className={`${almarai.className} text-3xl font-bold text-soil-dark mb-3`}>
              {t("Article Not Found", "المقال غير موجود")}
            </h2>
            <p className="text-earth-gray mb-6">
              {t(
                "The article you are looking for does not exist or has been removed.",
                "المقال الذي تبحث عنه غير موجود أو تمت إزالته.",
              )}
            </p>
            <Link href="/news">
              <Button className="bg-soil-clay hover:bg-soil-dark text-white">
                {t("Browse All News", "تصفح كل الأخبار")}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const article   = initialArticle;
  // Choose title / content based on current language
  const title     = lang === "ar" ? (article.titleAr || article.titleEn || "") : (article.titleEn || article.titleAr || "");
  // Language-aware body: prefer bodyAr/bodyEn when set, fall back to legacy body
  const body      = lang === "ar"
    ? (article.bodyAr || article.body || "")
    : (article.bodyEn || article.body || "");
  const excerpt   = lang === "ar"
    ? (article.excerptAr || article.excerpt || "")
    : (article.excerpt || article.excerptAr || "");
  const shareUrl  = `${siteUrl}/news/${article.slug}`;
  const shareText = encodeURIComponent(title);
  const mins      = formatReadingTime(body || article.body);
  const dateStr   = formatDate(article.publishedAt, locale);

  return (
    <div dir={direction}>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "300px" }}>
        {/* Layered background */}
        {article.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.featuredImage} alt="" aria-hidden="true" // eslint-disable-line @next/next/no-img-element
            className="absolute inset-0 w-full h-full object-cover -z-10" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: article.featuredImage
              ? "linear-gradient(135deg, rgba(30,18,10,0.93) 0%, rgba(80,48,28,0.88) 60%, rgba(30,18,10,0.78) 100%)"
              : `linear-gradient(135deg, var(--style-color-primary,#5c3d1e) 0%, color-mix(in srgb,var(--style-color-primary,#5c3d1e) 80%,#000) 55%, color-mix(in srgb,var(--style-color-primary,#5c3d1e) 60%,#1a1a1a) 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" aria-hidden="true" />
        {/* Radial glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)" }}
          aria-hidden="true" />
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="absolute rounded-full bg-white opacity-[0.12]"
              style={{ width: 3+(i%5)*2, height: 3+(i%5)*2, top:`${8+(i*41)%80}%`, left:`${3+(i*57)%94}%`,
                animation:`heroFloat ${3+i%4}s ease-in-out ${(i*0.4)%3}s infinite alternate` }} />
          ))}
          <style>{`@keyframes heroFloat{from{transform:translateY(0) scale(1)}to{transform:translateY(-10px) scale(1.15)}}`}</style>
        </div>
        {/* Diagonal stripe */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]" aria-hidden="true">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><defs>
            <pattern id="news-stripe" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="28" stroke="white" strokeWidth="2"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#news-stripe)"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 pt-10 pb-24 md:pb-28 relative z-10">
          {/* Back link */}
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-medium mb-8 opacity-80 hover:opacity-100 transition-opacity"
            style={{ color: "rgba(255,255,255,0.85)" }}>
            <BackArrow className="h-4 w-4" />
            {t("Back to News", "العودة للأخبار")}
          </Link>

          {/* Accent chip row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase backdrop-blur-sm"
                style={{ background:"rgba(255,255,255,0.13)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.18)" }}>
                {lang === "ar" ? (article.category.nameAr || article.category.nameEn) : (article.category.nameEn || article.category.nameAr)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase backdrop-blur-sm"
              style={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.65)", border:"1px solid rgba(255,255,255,0.12)" }}>
              {t("News", "أخبار")}
            </span>
          </div>

          {/* Title */}
          <h1 className={`${almarai.className} text-3xl md:text-5xl font-extrabold text-white leading-tight max-w-4xl mb-6`}>
            {title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color:"rgba(255,255,255,0.65)" }}>
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{article.authorName}</span>
            {dateStr && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{dateStr}</span>}
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{mins} {t("min read","دقائق قراءة")}</span>
          </div>

          {/* Bottom rule */}
          <div className="mt-8 h-px w-16 rounded-full" style={{ background:"rgba(255,255,255,0.3)" }} />
        </div>

        {/* Wave edge */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
            className="w-full" style={{ height:"clamp(32px,4vw,64px)", display:"block" }}>
            <path d="M0,32 C240,64 480,0 720,32 C960,64 1200,16 1440,32 L1440,64 L0,64 Z"
              fill="var(--style-color-bg,#ffffff)"/>
          </svg>
        </div>
      </section>

      {/* ── Article Body ──────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16" style={{ background: "var(--style-color-bg, #ffffff)" }}>
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-10 rounded-xl overflow-hidden shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featuredImage}
                alt={title}
                loading="eager"
                className="w-full h-auto max-h-[480px] object-cover"
              />
            </div>
          )}

          {/* Article prose — dir="auto" allows RTL Arabic body to render correctly */}
          <article
            className="prose prose-lg max-w-none
              prose-headings:text-soil-dark
              prose-p:text-earth-gray
              prose-a:text-soil-clay prose-a:no-underline hover:prose-a:underline
              prose-strong:text-soil-dark
              prose-code:text-earth-gray
              prose-img:rounded-lg"
            dir="auto"
          >
            {excerpt && (
              <p className="text-lg text-soil-clay font-medium leading-relaxed mb-8 border-s-4 border-soil-sand ps-4 italic not-prose">
                {excerpt}
              </p>
            )}
            {body ? (
              <div dangerouslySetInnerHTML={{ __html: body }} className="leading-relaxed" />
            ) : (
              <p className="text-earth-gray">{t("No content available.", "لا يوجد محتوى متاح.")}</p>
            )}
          </article>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-soil-sand/30">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {article.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-soil-sand/30 text-soil-clay"
                  >
                    {lang === "ar" ? (tag.nameAr || tag.nameEn) : (tag.nameEn || tag.nameAr)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-8 pt-8 border-t border-soil-sand/30">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-soil-dark flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                {t("Share this article", "شارك هذا المقال")}
              </span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                aria-label="Share on Twitter"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${shareText}`}
                target="_blank" rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Articles ──────────────────────────────────────────────── */}
      {relatedArticles.length > 0 && (
        <section className="py-12 border-t" style={{ background: "var(--style-color-bg, #ffffff)", borderColor: "var(--style-color-border, #e5e7eb)" }}>
          <div className="container mx-auto px-4">
            <h2 className={`${almarai.className} text-2xl font-bold text-soil-dark mb-8`}>
              {t("Related Articles", "مقالات ذات صلة")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => {
                const relTitle    = lang === "ar" ? (rel.titleAr || rel.titleEn || "") : (rel.titleEn || rel.titleAr || "");
                const relDate     = formatDate(rel.publishedAt, locale);
                const relGradient = gradientFor(rel.id);
                const relMins     = formatReadingTime(rel.body);

                return (
                  <Link key={rel.id} href={`/news/${rel.slug}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-soil-sand/40">
                      {/* Image / gradient */}
                      <div className="h-36 relative overflow-hidden">
                        {rel.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={rel.featuredImage}
                            alt={relTitle}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${relGradient} flex items-center justify-center`}>
                            <Newspaper className="h-8 w-8 text-white/40" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          {relDate}
                          <span>·</span>
                          <Clock className="h-3 w-3" />
                          {relMins} {t("min", "د")}
                        </div>
                        <h3
                          className="font-semibold text-soil-dark line-clamp-2 group-hover:text-soil-clay transition-colors text-sm leading-snug"
                          dir={lang === "ar" ? "rtl" : "ltr"}
                        >
                          {relTitle}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs text-soil-clay font-medium mt-3">
                          {t("Read More", "اقرأ المزيد")}
                          <ArrowRight className={`h-3 w-3 ${lang === "ar" ? "rotate-180" : ""}`} />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
