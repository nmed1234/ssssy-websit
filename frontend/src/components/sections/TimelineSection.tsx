"use client";

import { useLanguage } from "@/lib/language-context";

interface TimelineItem {
  year: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
}

interface Props {
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export function TimelineSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const titleEn = (config.titleEn ?? data.titleEn ?? "") as string;
  const titleAr = (config.titleAr ?? data.titleAr ?? "") as string;
  const title = isAr ? titleAr : titleEn;

  const raw = (data.items ?? config.items ?? []) as TimelineItem[];
  const items: TimelineItem[] = Array.isArray(raw) ? raw : [];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }}>
      <div className="container mx-auto px-4 max-w-3xl">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-12 text-center" dir={isAr ? "rtl" : "ltr"}>
            {title}
          </h2>
        )}

        {items.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No timeline items configured.</p>
        ) : (
          <div className="relative" dir={isAr ? "rtl" : "ltr"}>
            {/* Vertical line */}
            <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-soil-sand" />

            <div className="space-y-8">
              {items.map((item, i) => {
                const itemTitle = isAr ? item.titleAr : item.titleEn;
                const description = isAr ? (item.descriptionAr ?? "") : (item.descriptionEn ?? "");
                return (
                  <div key={i} className="flex gap-6 relative">
                    {/* Dot */}
                    <div className="relative flex-shrink-0 w-11 h-11 rounded-full bg-soil-clay flex items-center justify-center z-10 shadow-sm">
                      <span className="text-white font-bold text-xs">{item.year}</span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 mt-1">
                      <h3 className="font-semibold text-soil-dark text-sm mb-1">{itemTitle}</h3>
                      {description && <p className="text-sm text-gray-500 leading-relaxed">{description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
