"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function ComparisonSliderSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);

  // Support both config.* (schema) and data.* (template) storage
  const beforeImg = ((data.beforeImage ?? config.beforeImage ?? "") as string);
  const afterImg  = ((data.afterImage  ?? config.afterImage  ?? "") as string);
  const beforeLabel = isAr
    ? ((data.beforeLabelAr ?? config.beforeLabelAr ?? "قبل") as string)
    : ((data.beforeLabelEn ?? config.beforeLabelEn ?? "Before") as string);
  const afterLabel  = isAr
    ? ((data.afterLabelAr  ?? config.afterLabelAr  ?? "بعد") as string)
    : ((data.afterLabelEn  ?? config.afterLabelEn  ?? "After") as string);

  const [sliderPos, setSliderPos] = useState(50);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-3xl">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
        <div
          className="relative rounded-2xl overflow-hidden aspect-video cursor-col-resize select-none bg-gray-100 shadow-xl"
          onMouseMove={handleMove}
        >
          {/* After (background) */}
          {afterImg ? (
            <img src={afterImg} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500 text-sm">{afterLabel}</div>
          )}
          {/* Before (clipped left portion) */}
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
            {beforeImg ? (
              <img src={beforeImg} alt={beforeLabel} className="absolute inset-0 h-full object-cover" style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }} />
            ) : (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">{beforeLabel}</div>
            )}
          </div>
          {/* Divider */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10" style={{ left: `${sliderPos}%` }}>
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">⇔</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded z-20">{beforeLabel}</div>
          <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded z-20">{afterLabel}</div>
        </div>
      </div>
    </section>
  );
}
