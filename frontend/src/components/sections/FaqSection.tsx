"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface FaqItem {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
}

interface Props {
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export function FaqSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const titleEn = (config.titleEn ?? data.titleEn ?? "Frequently Asked Questions") as string;
  const titleAr = (config.titleAr ?? data.titleAr ?? "الأسئلة الشائعة") as string;
  const title = isAr ? titleAr : titleEn;

  const raw = (data.items ?? config.items ?? []) as FaqItem[];
  const items: FaqItem[] = Array.isArray(raw) ? raw : [];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }}>
      <div className="container mx-auto px-4 max-w-3xl">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-10 text-center" dir={isAr ? "rtl" : "ltr"}>
            {title}
          </h2>
        )}

        {items.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No FAQ items configured.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => {
              const question = isAr ? item.questionAr : item.questionEn;
              const answer = isAr ? item.answerAr : item.answerEn;
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                  dir={isAr ? "rtl" : "ltr"}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-soil-dark hover:bg-gray-50 transition-colors"
                  >
                    <span>{question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-soil-clay flex-shrink-0 ml-3" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-soil-clay flex-shrink-0 ml-3" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      <div className="pt-4">{answer}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
