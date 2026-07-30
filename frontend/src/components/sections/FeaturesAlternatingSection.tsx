"use client";
import { useLanguage } from "@/lib/language-context";

interface FeatureRow {
  icon?: string;
  titleEn?: string; titleAr?: string;
  descriptionEn?: string; descriptionAr?: string;
  image?: string;
}
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function FeaturesAlternatingSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const items = (Array.isArray(data.items) ? data.items : []) as FeatureRow[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-12 text-center">{title}</h2>}
        {items.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No feature rows configured.</p>
        ) : (
          <div className="space-y-16">
            {items.map((item, i) => {
              const t = isAr ? (item.titleAr ?? "") : (item.titleEn ?? "");
              const d = isAr ? (item.descriptionAr ?? "") : (item.descriptionEn ?? "");
              const imgLeft = i % 2 === 0;
              return (
                <div key={i} className={`flex flex-col md:flex-row gap-10 items-center ${!imgLeft ? "md:flex-row-reverse" : ""}`}>
                  <div className="flex-1 rounded-2xl overflow-hidden bg-gray-100 min-h-[240px] flex items-center justify-center">
                    {item.image
                      ? <img src={item.image} alt={t} className="w-full h-full object-cover" />
                      : <span className="text-6xl">{item.icon ?? "🔧"}</span>}
                  </div>
                  <div className="flex-1">
                    {item.icon && !item.image && <div className="text-4xl mb-4">{item.icon}</div>}
                    <h3 className="text-xl font-bold text-soil-dark mb-3">{t}</h3>
                    {d && <p className="text-gray-500 leading-relaxed">{d}</p>}
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
