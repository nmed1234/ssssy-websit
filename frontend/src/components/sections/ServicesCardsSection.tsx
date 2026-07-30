"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Service { icon?: string; titleEn?: string; titleAr?: string; title?: string; descriptionEn?: string; descriptionAr?: string; description?: string; ctaLabelEn?: string; ctaLabelAr?: string; ctaUrl?: string; color?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function ServicesCardsSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle= isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const services= (Array.isArray(data.services) ? data.services : []) as Service[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title    && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-3">{title}</h2>}
            {subtitle && <p className="text-gray-500 max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}
        {services.length === 0 ? <p className="text-center text-gray-400 text-sm">No services configured.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => {
              const t       = isAr ? (svc.titleAr ?? svc.title ?? "") : (svc.titleEn ?? svc.title ?? "");
              const d       = isAr ? (svc.descriptionAr ?? svc.description ?? "") : (svc.descriptionEn ?? svc.description ?? "");
              const ctaLbl  = isAr ? (svc.ctaLabelAr ?? svc.ctaLabelEn ?? "") : (svc.ctaLabelEn ?? "");
              const accent  = svc.color ?? "#1b5e20";
              return (
                <div key={i} className="group rounded-xl border border-gray-200 bg-white p-7 hover:shadow-md transition-shadow flex flex-col">
                  {svc.icon && (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5" style={{ background: `${accent}18` }}>
                      {svc.icon}
                    </div>
                  )}
                  <h3 className="font-bold text-soil-dark mb-2 text-base">{t}</h3>
                  {d && <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-4">{d}</p>}
                  {ctaLbl && svc.ctaUrl && (
                    <Link href={svc.ctaUrl} className="text-xs font-semibold hover:underline mt-auto" style={{ color: accent }}>
                      {ctaLbl} →
                    </Link>
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
