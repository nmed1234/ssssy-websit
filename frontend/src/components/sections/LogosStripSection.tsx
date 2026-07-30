"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function LogosStripSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr  = language === "ar";
  const title = isAr
    ? ((config.titleAr ?? config.title ?? "") as string)
    : ((config.titleEn ?? config.title ?? "") as string);
  const logos = (Array.isArray(data.logos) ? data.logos : []) as Record<string, unknown>[];

  return (
    <section className="py-10 md:py-14 border-y border-gray-100" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">{title}</p>}
        {logos.length === 0 ? <p className="text-center text-gray-400 text-sm">No logos configured.</p> : (
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {logos.map((logo, i) => {
              // Support both {name,image} and {nameEn,nameAr,src} conventions
              const name  = isAr
                ? ((logo.nameAr ?? logo.name ?? "") as string)
                : ((logo.nameEn ?? logo.name ?? "") as string);
              const imgSrc = ((logo.image ?? logo.src ?? "") as string);
              const url    = (logo.url as string) ?? "#";
              return (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                  {imgSrc ? (
                    <img src={imgSrc} alt={name} className="h-10 object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-gray-500 px-2">{name}</span>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
