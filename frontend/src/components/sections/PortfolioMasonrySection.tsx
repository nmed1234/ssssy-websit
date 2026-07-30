"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface PortfolioItem { titleEn?: string; titleAr?: string; categoryEn?: string; categoryAr?: string; image?: string; slug?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function PortfolioMasonrySection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr     = language === "ar";
  const title    = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const items    = (Array.isArray(data.items) ? data.items : []) as PortfolioItem[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title    && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-3">{title}</h2>}
            {subtitle && <p className="text-gray-500 max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}
        {items.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No portfolio items configured.</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {items.map((item, i) => {
              const t   = isAr ? (item.titleAr ?? "") : (item.titleEn ?? "");
              const cat = isAr ? (item.categoryAr ?? item.categoryEn ?? "") : (item.categoryEn ?? "");
              return (
                <Link key={i} href={item.slug ?? "#"} className="group block break-inside-avoid rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow mb-4">
                  <div className="bg-gray-100 flex items-center justify-center overflow-hidden" style={{ minHeight: i % 3 === 1 ? 260 : 180 }}>
                    {item.image ? <img src={item.image} alt={t} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <span className="text-5xl opacity-20">🖼</span>}
                  </div>
                  <div className="p-4">
                    {cat && <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{cat}</span>}
                    <h3 className="font-semibold text-soil-dark text-sm mt-2">{t}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
