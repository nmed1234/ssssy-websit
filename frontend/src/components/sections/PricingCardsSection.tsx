"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Plan {
  nameEn?: string; nameAr?: string;
  price?: string; period?: string;
  descriptionEn?: string; descriptionAr?: string;
  // Two formats: newline-delimited string OR EN/AR arrays
  features?: string;
  featuresEn?: string[] | string; featuresAr?: string[] | string;
  ctaLabelEn?: string; ctaLabelAr?: string; ctaUrl?: string;
  highlighted?: string | boolean;
}
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function PricingCardsSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title          = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle       = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const annualDiscount = isAr ? ((config.annualDiscountAr ?? config.annualDiscount ?? "") as string) : ((config.annualDiscountEn ?? config.annualDiscount ?? "") as string);
  const plans          = (Array.isArray(data.plans) ? data.plans : []) as Plan[];

  function getFeatures(plan: Plan): string[] {
    // Priority 1: EN/AR arrays from templates
    if (isAr && plan.featuresAr) {
      const f = plan.featuresAr;
      return Array.isArray(f) ? f : (f as string).split("\n").filter(Boolean);
    }
    if (plan.featuresEn) {
      const f = plan.featuresEn;
      return Array.isArray(f) ? f : (f as string).split("\n").filter(Boolean);
    }
    // Priority 2: plain newline-delimited string
    if (plan.features) return plan.features.split("\n").filter(Boolean);
    return [];
  }

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title          && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-3">{title}</h2>}
            {subtitle       && <p className="text-gray-500 max-w-xl mx-auto">{subtitle}</p>}
            {annualDiscount && <span className="inline-block mt-3 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">{annualDiscount}</span>}
          </div>
        )}
        {plans.length === 0 ? <p className="text-center text-gray-400 text-sm">No plans configured.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => {
              const highlighted = plan.highlighted === "true" || plan.highlighted === true;
              const name       = isAr ? (plan.nameAr ?? plan.nameEn ?? "") : (plan.nameEn ?? "");
              const desc       = isAr ? (plan.descriptionAr ?? plan.descriptionEn ?? "") : (plan.descriptionEn ?? "");
              const ctaLabel   = isAr ? (plan.ctaLabelAr ?? plan.ctaLabelEn ?? "") : (plan.ctaLabelEn ?? "");
              const feats      = getFeatures(plan);
              return (
                <div key={i} className={`rounded-2xl border-2 p-8 flex flex-col relative ${highlighted ? "border-soil-dark bg-soil-dark text-white shadow-xl scale-105" : "border-gray-200 bg-white"}`}>
                  {highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold bg-green-500 text-white px-3 py-1 rounded-full">{isAr ? "الأكثر شعبية" : "Most Popular"}</span>}
                  <h3 className={`text-lg font-bold mb-1 ${highlighted ? "text-white" : "text-soil-dark"}`}>{name}</h3>
                  {desc && <p className={`text-sm mb-4 ${highlighted ? "text-white/70" : "text-gray-500"}`}>{desc}</p>}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-4xl font-bold ${highlighted ? "text-green-400" : "text-soil-dark"}`}>{plan.price}</span>
                    {plan.period && <span className={`text-sm ${highlighted ? "text-white/60" : "text-gray-400"}`}>{plan.period}</span>}
                  </div>
                  <ul className="space-y-2 mb-8 flex-1">
                    {feats.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className={`h-4 w-4 flex-shrink-0 ${highlighted ? "text-green-400" : "text-green-600"}`} />
                        <span className={highlighted ? "text-white/80" : "text-gray-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {ctaLabel && plan.ctaUrl && (
                    <Link href={plan.ctaUrl} className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${highlighted ? "bg-green-500 hover:bg-green-400 text-white" : "bg-gray-100 hover:bg-gray-200 text-soil-dark"}`}>{ctaLabel}</Link>
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
