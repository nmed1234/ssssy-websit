"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface Tab { labelEn?: string; labelAr?: string; contentEn?: string; contentAr?: string; image?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function TabsContentSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const tabs    = (Array.isArray(data.tabs) ? data.tabs : []) as Tab[];
  const [active, setActive] = useState(0);

  const currentTab = tabs[active];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
        {tabs.length === 0 ? <p className="text-center text-gray-400 text-sm">No tabs configured.</p> : (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {tabs.map((tab, i) => {
                const label = isAr ? (tab.labelAr ?? tab.labelEn ?? "") : (tab.labelEn ?? "");
                return (
                  <button key={i} onClick={() => setActive(i)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${active === i ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                    style={active === i ? { background: "var(--style-color-primary, #2d6a4f)", borderColor: "transparent" } : {}}>
                    {label}
                  </button>
                );
              })}
            </div>
            {currentTab && (
              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
                {currentTab.image && (
                  <div className="rounded-2xl overflow-hidden aspect-video bg-gray-100">
                    <img src={currentTab.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={!currentTab.image ? "md:col-span-2 text-center" : ""}>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    {isAr ? (currentTab.contentAr ?? currentTab.contentEn ?? "") : (currentTab.contentEn ?? "")}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
