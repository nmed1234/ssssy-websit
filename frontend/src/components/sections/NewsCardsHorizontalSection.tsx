"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface NewsItem { titleEn?: string; titleAr?: string; title?: string; categoryEn?: string; categoryAr?: string; date?: string; excerpt?: string; image?: string; slug?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function NewsCardsHorizontalSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr        = language === "ar";
  const title       = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const viewAllLabel= isAr ? ((config.viewAllLabelAr ?? "") as string) : ((config.viewAllLabelEn ?? "") as string);
  const viewAllUrl  = (config.viewAllUrl as string) ?? "/news";
  const items       = (Array.isArray(data.items) ? data.items : []) as NewsItem[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark">{title}</h2>}
          {viewAllLabel && <Link href={viewAllUrl} className="text-sm font-medium text-soil-clay hover:underline">{viewAllLabel} →</Link>}
        </div>
        {items.length === 0 ? <p className="text-center text-gray-400 text-sm">No news configured.</p> : (
          <div className="flex flex-col gap-5">
            {items.slice(0, 5).map((item, i) => {
              const t   = isAr ? (item.titleAr ?? item.title ?? "") : (item.titleEn ?? item.title ?? "");
              const cat = isAr ? (item.categoryAr ?? item.categoryEn ?? "") : (item.categoryEn ?? "");
              const url = item.slug ?? "#";
              return (
                <Link key={i} href={url} className="group flex items-center gap-5 bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="w-28 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={t} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📰</div>
                    )}
                  </div>
                  <div className="flex-1 py-3 pr-4">
                    {cat && <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full mb-1 inline-block">{cat}</span>}
                    <h3 className="font-semibold text-soil-dark text-sm leading-snug line-clamp-1">{t}</h3>
                    {item.excerpt && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.excerpt}</p>}
                    {item.date && <p className="text-xs text-gray-300 mt-1">{item.date}</p>}
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
