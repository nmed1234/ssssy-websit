"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function HeroMinimalSection({ config = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const title    = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  // Template uses descriptionEn, schema uses subtitleEn
  const subtitle = isAr
    ? ((config.subtitleAr ?? config.descriptionAr ?? config.subtitle ?? "") as string)
    : ((config.subtitleEn ?? config.descriptionEn ?? config.subtitle ?? "") as string);
  // Template uses "taglineEn", schema uses "eyebrowEn"
  const eyebrow  = isAr
    ? ((config.eyebrowAr ?? config.taglineAr ?? "") as string)
    : ((config.eyebrowEn ?? config.taglineEn ?? "") as string);
  const ctaLabel  = isAr
    ? ((config.ctaLabelAr ?? "") as string)
    : ((config.ctaLabelEn ?? "") as string);
  const ctaUrl    = (config.ctaUrl as string) ?? "#";
  // Template uses secondaryLabelEn, schema uses cta2LabelEn
  const cta2Label = isAr
    ? ((config.cta2LabelAr ?? config.secondaryLabelAr ?? "") as string)
    : ((config.cta2LabelEn ?? config.secondaryLabelEn ?? "") as string);
  const cta2Url   = ((config.cta2Url ?? config.secondaryUrl ?? "#") as string);
  const align     = (config.align as string) ?? "center";

  const alignClass = align === "left" ? "text-left items-start" : align === "right" ? "text-right items-end" : "text-center items-center";

  return (
    <section className="py-24 md:py-36" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className={`container mx-auto px-4 flex flex-col ${alignClass} max-w-3xl mx-auto`}>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--style-color-primary, #2d6a4f)" }}>{eyebrow}</p>
        )}
        {title    && <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h1>}
        {subtitle && <p className="text-lg text-gray-500 max-w-2xl leading-relaxed mb-10">{subtitle}</p>}
        <div className="flex flex-wrap gap-4 justify-center">
          {ctaLabel  && <Link href={ctaUrl}  className="inline-block text-white font-semibold px-8 py-4 rounded-full transition-opacity hover:opacity-90 text-sm" style={{ background: "var(--style-color-primary, #2d6a4f)" }}>{ctaLabel}</Link>}
          {cta2Label && <Link href={cta2Url} className="inline-block border border-gray-300 text-gray-600 font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-sm">{cta2Label}</Link>}
        </div>
      </div>
    </section>
  );
}
