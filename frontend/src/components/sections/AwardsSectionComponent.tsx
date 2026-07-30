"use client";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Award { titleEn?: string; titleAr?: string; organization?: string; year?: string; image?: string; url?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function AwardsSectionComponent({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle= isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const awards  = (Array.isArray(data.awards) ? data.awards : []) as Award[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title    && <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
            {subtitle && <p className="text-gray-500 max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}
        {awards.length === 0 ? <p className="text-center text-gray-400 text-sm">No awards configured.</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {awards.map((award, i) => {
              const t = isAr ? (award.titleAr ?? award.titleEn ?? "") : (award.titleEn ?? "");
              return (
                <Link key={i} href={award.url ?? "#"} target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
                  {award.image ? (
                    <img src={award.image} alt={t} className="h-16 object-contain mb-3 grayscale group-hover:grayscale-0 transition-all" />
                  ) : (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: "var(--style-color-primary, #2d6a4f)", opacity: 0.1 }}>
                      <Trophy className="h-7 w-7" style={{ color: "var(--style-color-primary, #2d6a4f)", opacity: 1 }} />
                    </div>
                  )}
                  <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">{t}</h3>
                  {award.organization && <p className="text-xs text-gray-400 mt-1">{award.organization}</p>}
                  {award.year && <p className="text-xs text-gray-300 mt-0.5">{award.year}</p>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
