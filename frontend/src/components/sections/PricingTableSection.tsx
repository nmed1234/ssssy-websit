"use client";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Row { featureEn?: string; featureAr?: string; value1?: string; value2?: string; value3?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function PricingTableSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr  = language === "ar";
  const title = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const tier1 = (config.tier1 as string) || "Starter";
  const tier2 = (config.tier2 as string) || "Pro";
  const tier3 = (config.tier3 as string) || "Enterprise";
  const rows  = (Array.isArray(data.rows) ? data.rows : []) as Row[];

  function renderVal(v?: string) {
    if (!v) return <X className="h-4 w-4 text-gray-300 mx-auto" />;
    if (v === "true")  return <Check className="h-4 w-4 text-green-600 mx-auto" />;
    if (v === "false") return <X className="h-4 w-4 text-gray-300 mx-auto" />;
    return <span className="text-sm font-medium text-soil-dark">{v}</span>;
  }

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-10 text-center">{title}</h2>}
        {rows.length === 0 ? <p className="text-center text-gray-400 text-sm">No comparison rows configured.</p> : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-soil-dark text-white">
                  <th className="text-left px-6 py-4 text-sm font-semibold">{isAr ? "الميزة" : "Feature"}</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold">{tier1}</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold bg-green-700">{tier2}</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold">{tier3}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const feat = isAr ? (row.featureAr ?? row.featureEn ?? "") : (row.featureEn ?? "");
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 text-sm text-gray-700">{feat}</td>
                      <td className="px-6 py-4 text-center">{renderVal(row.value1)}</td>
                      <td className="px-6 py-4 text-center bg-green-50">{renderVal(row.value2)}</td>
                      <td className="px-6 py-4 text-center">{renderVal(row.value3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
