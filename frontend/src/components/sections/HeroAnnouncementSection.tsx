"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function HeroAnnouncementSection({ config = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const title    = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  // Template uses descriptionEn, schema uses subtitleEn
  const subtitle = isAr
    ? ((config.subtitleAr ?? config.descriptionAr ?? config.subtitle ?? "") as string)
    : ((config.subtitleEn ?? config.descriptionEn ?? config.subtitle ?? "") as string);
  const tag      = isAr
    ? ((config.tagAr ?? "") as string)
    : ((config.tagEn ?? "") as string);
  const ctaLabel = isAr
    ? ((config.ctaLabelAr ?? "") as string)
    : ((config.ctaLabelEn ?? "") as string);
  const ctaUrl   = (config.ctaUrl as string) ?? "#";
  const bgImage  = (config.backgroundImage ?? config.bgImage ?? "") as string;
  const bgColor  = (config.bgColor as string) ?? "#111827";

  return (
    <section
      className="relative min-h-[60vh] flex items-center justify-center text-center overflow-hidden"
      dir={isAr ? "rtl" : "ltr"}
      style={{ background: bgColor }}
    >
      {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
      <div className="relative z-10 container mx-auto px-4 text-white py-20">
        {tag && (
          <span className="inline-block text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded mb-6">
            {tag}
          </span>
        )}
        {title    && <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">{title}</h1>}
        {subtitle && <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">{subtitle}</p>}
        {ctaLabel && (
          <Link href={ctaUrl} className="inline-block bg-white font-semibold text-sm px-8 py-4 rounded-full hover:bg-gray-100 transition-colors" style={{ color: bgColor }}>
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
