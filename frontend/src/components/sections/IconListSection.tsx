"use client";
import { useLanguage } from "@/lib/language-context";

interface ListItem {
  icon?: string;
  // Schema format
  titleEn?: string; titleAr?: string; descriptionEn?: string; descriptionAr?: string;
  // Template format (icon-list uses textEn/textAr)
  textEn?: string; textAr?: string;
}
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function IconListSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle= isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const columns = Number(config.columns ?? 2);
  const items   = (Array.isArray(data.items) ? data.items : []) as ListItem[];

  const gridCols = columns === 1 ? "" : columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title    && <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
            {subtitle && <p className="text-gray-500 max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}
        {items.length === 0 ? <p className="text-center text-gray-400 text-sm">No items configured.</p> : (
          <div className={`grid grid-cols-1 ${gridCols} gap-4 max-w-4xl mx-auto`}>
            {items.map((item, i) => {
              // Support template format (textEn) and schema format (titleEn + descriptionEn)
              const t = isAr
                ? (item.titleAr ?? item.textAr ?? item.titleEn ?? item.textEn ?? "")
                : (item.titleEn ?? item.textEn ?? "");
              const d = isAr
                ? (item.descriptionAr ?? item.descriptionEn ?? "")
                : (item.descriptionEn ?? "");
              return (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
                  {item.icon && (
                    <span className="flex-shrink-0 text-xl mt-0.5">{item.icon}</span>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{t}</p>
                    {d && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{d}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
