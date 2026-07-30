"use client";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function LogosMarqueeSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr  = language === "ar";
  const title = isAr
    ? ((config.titleAr ?? config.title ?? "") as string)
    : ((config.titleEn ?? config.title ?? "") as string);
  const speed = Number(config.speed ?? 30);
  const logos = (Array.isArray(data.logos) ? data.logos : []) as Record<string, unknown>[];
  const doubled = [...logos, ...logos];

  return (
    <section className="py-10 overflow-hidden border-y border-gray-100" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">{title}</p>}
      </div>
      {logos.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">No logos configured.</p>
      ) : (
        <div className="relative overflow-hidden">
          <div
            className="flex items-center gap-12 w-max"
            style={{ animation: `marquee ${speed}s linear infinite` }}
          >
            {doubled.map((logo, i) => {
              const name   = isAr
                ? ((logo.nameAr ?? logo.name ?? "") as string)
                : ((logo.nameEn ?? logo.name ?? "") as string);
              const imgSrc = ((logo.image ?? logo.src ?? "") as string);
              const url    = (logo.url as string) ?? "#";
              return (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 flex-shrink-0">
                  {imgSrc ? (
                    <img src={imgSrc} alt={name} className="h-10 object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-gray-500 whitespace-nowrap px-2">{name}</span>
                  )}
                </a>
              );
            })}
          </div>
          <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        </div>
      )}
    </section>
  );
}
