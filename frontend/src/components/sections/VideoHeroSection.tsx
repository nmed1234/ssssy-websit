"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function VideoHeroSection({ config = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title       = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle    = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const ctaLabel    = isAr ? ((config.ctaLabelAr ?? config.ctaLabel ?? "") as string) : ((config.ctaLabelEn ?? config.ctaLabel ?? "") as string);
  const ctaUrl      = (config.ctaUrl as string) ?? "#";
  const videoUrl    = (config.videoUrl as string) ?? "";
  const overlayOpacity = Number(config.overlayOpacity ?? 0.55);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {videoUrl ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <div className="absolute inset-0 w-full h-full" style={{ background: "var(--style-color-primary, #1a3a2a)" }} />
      )}
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlayOpacity})` }} />
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {title    && <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{title}</h1>}
        {subtitle && <p className="text-lg text-white/80 mb-8 leading-relaxed">{subtitle}</p>}
        {ctaLabel && (
          <Link href={ctaUrl} className="inline-block px-8 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "var(--style-color-primary, #2d6a4f)", color: "#fff" }}>
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
