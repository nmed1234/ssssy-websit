"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface CaseStudy {
  clientEn?: string; clientAr?: string;
  titleEn?: string; titleAr?: string;
  descriptionEn?: string; descriptionAr?: string;
  image?: string; slug?: string;
  metric1LabelEn?: string; metric1LabelAr?: string; metric1Value?: string;
  metric2LabelEn?: string; metric2LabelAr?: string; metric2Value?: string;
}
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function CaseStudyCardsSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr  = language === "ar";
  const title = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const items = (Array.isArray(data.items) ? data.items : []) as CaseStudy[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-10 text-center">{title}</h2>}
        {items.length === 0 ? <p className="text-center text-gray-400 text-sm">No case studies configured.</p> : (
          <div className="space-y-6">
            {items.map((cs, i) => {
              const client = isAr ? (cs.clientAr ?? cs.clientEn ?? "") : (cs.clientEn ?? "");
              const t      = isAr ? (cs.titleAr ?? cs.titleEn ?? "") : (cs.titleEn ?? "");
              const d      = isAr ? (cs.descriptionAr ?? cs.descriptionEn ?? "") : (cs.descriptionEn ?? "");
              const m1l    = isAr ? (cs.metric1LabelAr ?? cs.metric1LabelEn ?? "") : (cs.metric1LabelEn ?? "");
              const m2l    = isAr ? (cs.metric2LabelAr ?? cs.metric2LabelEn ?? "") : (cs.metric2LabelEn ?? "");
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                  {cs.image && (
                    <div className="md:w-48 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <img src={cs.image} alt={t} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    {client && <p className="text-xs font-medium text-soil-clay uppercase tracking-wide mb-1">{client}</p>}
                    <h3 className="text-lg font-bold text-soil-dark mb-2">{t}</h3>
                    {d && <p className="text-sm text-gray-500 leading-relaxed mb-4">{d}</p>}
                    <div className="flex gap-4 flex-wrap">
                      {cs.metric1Value && <div className="bg-green-50 rounded-lg px-4 py-2 text-center"><p className="text-xl font-bold text-green-700">{cs.metric1Value}</p><p className="text-xs text-gray-500">{m1l}</p></div>}
                      {cs.metric2Value && <div className="bg-blue-50 rounded-lg px-4 py-2 text-center"><p className="text-xl font-bold text-blue-700">{cs.metric2Value}</p><p className="text-xs text-gray-500">{m2l}</p></div>}
                    </div>
                  </div>
                  {cs.slug && <div className="flex items-end"><Link href={cs.slug} className="text-sm font-medium text-soil-clay hover:underline whitespace-nowrap">{isAr ? "اقرأ المزيد ←" : "Read more →"}</Link></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
