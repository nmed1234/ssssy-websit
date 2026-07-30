"use client";
import { useLanguage } from "@/lib/language-context";

interface Step { number?: string; numberLabel?: string; icon?: string; titleEn?: string; titleAr?: string; descriptionEn?: string; descriptionAr?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function StepsVerticalSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr     = language === "ar";
  const title    = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const steps    = (Array.isArray(data.steps) ? data.steps : []) as Step[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-3xl">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title    && <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
          </div>
        )}
        {steps.length === 0 ? <p className="text-center text-gray-400 text-sm">No steps configured.</p> : (
          <div className="space-y-0">
            {steps.map((step, i) => {
              const t   = isAr ? (step.titleAr ?? step.titleEn ?? "") : (step.titleEn ?? "");
              const d   = isAr ? (step.descriptionAr ?? step.descriptionEn ?? "") : (step.descriptionEn ?? "");
              // Support both "number" (templates) and "numberLabel" (schema)
              const num = step.numberLabel ?? step.number ?? String(i + 1);
              return (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow"
                      style={{ background: "var(--style-color-primary, #2d6a4f)" }}
                    >
                      {step.icon ?? num}
                    </div>
                    {i < steps.length - 1 && <div className="w-0.5 flex-1 my-2 bg-gray-200" />}
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold text-base mb-1" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{t}</h3>
                    {d && <p className="text-sm text-gray-500 leading-relaxed">{d}</p>}
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
