"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function HeroSplitSection({ config = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const title    = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  // Template uses "descriptionEn", schema uses "subtitleEn"
  const subtitle = isAr
    ? ((config.subtitleAr ?? config.descriptionAr ?? config.subtitle ?? config.description ?? "") as string)
    : ((config.subtitleEn ?? config.descriptionEn ?? config.subtitle ?? config.description ?? "") as string);
  const eyebrow  = isAr
    ? ((config.badgeTextAr ?? config.eyebrowAr ?? config.subtitleEn ?? config.taglineAr ?? "") as string)
    : ((config.badgeTextEn ?? config.eyebrowEn ?? config.subtitleEn ?? config.taglineEn ?? "") as string);
  // Template uses primaryButtonLabelEn, schema uses ctaLabelEn
  const ctaLabel  = isAr
    ? ((config.ctaLabelAr ?? config.primaryButtonLabelAr ?? "") as string)
    : ((config.ctaLabelEn ?? config.primaryButtonLabelEn ?? "") as string);
  const ctaUrl    = ((config.ctaUrl ?? config.primaryButtonUrl ?? "#") as string);
  const cta2Label = isAr
    ? ((config.cta2LabelAr ?? config.secondaryButtonLabelAr ?? "") as string)
    : ((config.cta2LabelEn ?? config.secondaryButtonLabelEn ?? "") as string);
  const cta2Url   = ((config.cta2Url ?? config.secondaryButtonUrl ?? "#") as string);
  const image     = (config.image as string) ?? "";
  const imageRight= config.imageRight !== "false" && config.imagePosition !== "left";

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className={`container mx-auto px-4 flex flex-col ${imageRight ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12`}>
        {/* Text */}
        <div className="flex-1 max-w-xl">
          {eyebrow && <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ background: "var(--style-color-primary, #2d6a4f)", color: "#fff", opacity: 0.85 }}>{eyebrow}</span>}
          {title    && <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-5" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h1>}
          {subtitle && <p className="text-gray-500 text-lg leading-relaxed mb-8">{subtitle}</p>}
          <div className="flex flex-wrap gap-4">
            {ctaLabel  && <Link href={ctaUrl}  className="inline-block text-white font-semibold px-7 py-3 rounded-xl transition-opacity hover:opacity-90 text-sm" style={{ background: "var(--style-color-primary, #2d6a4f)" }}>{ctaLabel}</Link>}
            {cta2Label && <Link href={cta2Url} className="inline-block border border-gray-300 text-gray-700 font-semibold px-7 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm">{cta2Label}</Link>}
          </div>
        </div>
        {/* Image */}
        <div className="flex-1 w-full">
          <div className="rounded-2xl overflow-hidden aspect-square bg-gray-100 shadow-lg">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200">
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
