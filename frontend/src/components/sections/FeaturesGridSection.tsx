"use client";
import { useLanguage } from "@/lib/language-context";

interface FeatureItem {
  icon?: string;
  titleEn?: string; titleAr?: string; title?: string;
  descriptionEn?: string; descriptionAr?: string; description?: string;
}
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function FeaturesGridSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title    = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const columns  = Number(config.columns ?? 3);
  const items    = (Array.isArray(data.items) ? data.items : []) as FeatureItem[];

  const gridCols = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title    && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-3">{title}</h2>}
            {subtitle && <p className="text-gray-500 max-w-2xl mx-auto">{subtitle}</p>}
          </div>
        )}
        {items.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No features configured.</p>
        ) : (
          <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
            {items.map((item, i) => {
              const t = isAr ? (item.titleAr ?? item.title ?? "") : (item.titleEn ?? item.title ?? "");
              const d = isAr ? (item.descriptionAr ?? item.description ?? "") : (item.descriptionEn ?? item.description ?? "");
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {item.icon && <div className="text-3xl mb-4">{item.icon}</div>}
                  <h3 className="font-semibold text-soil-dark mb-2">{t}</h3>
                  {d && <p className="text-sm text-gray-500 leading-relaxed">{d}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
