"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface Office {
  // Template format: cityEn/cityAr
  cityEn?: string; cityAr?: string;
  // Schema format: nameEn/nameAr
  nameEn?: string; nameAr?: string;
  addressEn?: string; addressAr?: string; address?: string;
  phone?: string; email?: string;
  embedUrl?: string; mapEmbedUrl?: string;
}
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function OfficesMapSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const offices = (Array.isArray(data.offices) ? data.offices : []) as Office[];
  const [active, setActive] = useState(0);

  const current = offices[active];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
        {offices.length === 0 ? <p className="text-center text-gray-400 text-sm">No offices configured.</p> : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="space-y-2">
              {offices.map((o, i) => {
                // Support both template (cityEn/Ar) and schema (nameEn/Ar) formats
                const name = isAr
                  ? (o.cityAr ?? o.nameAr ?? o.cityEn ?? o.nameEn ?? "")
                  : (o.cityEn ?? o.nameEn ?? "");
                return (
                  <button key={i} onClick={() => setActive(i)}
                    className={`w-full text-start px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${active === i ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"}`}
                    style={active === i ? { background: "var(--style-color-primary, #2d6a4f)" } : {}}>
                    {name}
                  </button>
                );
              })}
            </div>
            {current && (
              <div className="md:col-span-2 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "300px" }}>
                  {(current.embedUrl || current.mapEmbedUrl) ? (
                    <iframe src={current.embedUrl ?? current.mapEmbedUrl} width="100%" height="100%" loading="lazy" allowFullScreen className="block border-0" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No map URL</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  {(current.addressEn || current.address) && (
                    <p>{isAr ? (current.addressAr ?? current.addressEn ?? current.address) : (current.addressEn ?? current.address)}</p>
                  )}
                  {current.phone && <p>{current.phone}</p>}
                  {current.email && <a href={`mailto:${current.email}`} className="hover:underline">{current.email}</a>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
