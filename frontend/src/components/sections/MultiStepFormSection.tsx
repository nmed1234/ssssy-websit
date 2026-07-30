"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface FormField { labelEn?: string; labelAr?: string; type?: string; placeholder?: string; required?: string; }
interface Step { titleEn?: string; titleAr?: string; fields?: FormField[]; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function MultiStepFormSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr       = language === "ar";
  const title      = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle   = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const successMsg = isAr ? ((config.successMsgAr ?? "تم الإرسال بنجاح!") as string) : ((config.successMsgEn ?? "Submitted successfully!") as string);
  const nextLabel  = isAr ? ((config.nextLabelAr ?? "التالي") as string) : ((config.nextLabelEn ?? "Next") as string);
  const backLabel  = isAr ? ((config.backLabelAr ?? "السابق") as string) : ((config.backLabelEn ?? "Back") as string);
  const submitLabel= isAr ? ((config.submitLabelAr ?? "إرسال") as string) : ((config.submitLabelEn ?? "Submit") as string);

  const steps = (Array.isArray(data.steps) ? data.steps : []) as Step[];
  const [current, setCurrent] = useState(0);
  const [done, setDone]       = useState(false);

  if (done) {
    return (
      <section className="py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-semibold text-gray-800">{successMsg}</p>
        </div>
      </section>
    );
  }

  const step = steps[current];

  return (
    <section className="py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-lg">
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title    && <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
            {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
          </div>
        )}
        {steps.length === 0 ? <p className="text-center text-gray-400 text-sm">No form steps configured.</p> : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-8">
              {steps.map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= current ? "bg-green-500" : "bg-gray-200"}`} />
              ))}
            </div>
            {step && (
              <>
                <h3 className="font-bold text-gray-800 mb-5 text-base">{isAr ? (step.titleAr ?? step.titleEn ?? "") : (step.titleEn ?? "")}</h3>
                <div className="space-y-4 mb-8">
                  {(step.fields ?? []).map((field, fi) => {
                    const label = isAr ? (field.labelAr ?? field.labelEn ?? "") : (field.labelEn ?? "");
                    return (
                      <div key={fi}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                        <input
                          type={field.type ?? "text"}
                          placeholder={field.placeholder ?? ""}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <div className="flex gap-3 justify-between">
              {current > 0 && (
                <button onClick={() => setCurrent(c => c - 1)}
                  className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                  {backLabel}
                </button>
              )}
              <button
                onClick={() => current < steps.length - 1 ? setCurrent(c => c + 1) : setDone(true)}
                className="ml-auto px-6 py-2 text-sm rounded-lg text-white font-semibold"
                style={{ background: "var(--style-color-primary, #2d6a4f)" }}
              >
                {current < steps.length - 1 ? nextLabel : submitLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
