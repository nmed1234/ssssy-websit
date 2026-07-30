"use client";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Row {
  featureEn?: string; featureAr?: string; feature?: string;
  // New format: {us, them}
  us?: string; them?: string;
  // Template format: {values: [boolean|string, ...]}
  values?: (boolean | string)[];
}
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function CompetitorComparisonSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle= isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const ourName = isAr
    ? ((config.ourNameAr ?? config.ourName ?? "") as string) || (Array.isArray(data.competitors) ? (data.competitors[0] as string) : "Us")
    : ((config.ourNameEn ?? config.ourName ?? "") as string) || (Array.isArray(data.competitors) ? (data.competitors[0] as string) : "Us");
  const themName= isAr
    ? ((config.themNameAr ?? config.themName ?? "") as string) || (Array.isArray(data.competitors) ? (data.competitors[1] as string) : "Others")
    : ((config.themNameEn ?? config.themName ?? "") as string) || (Array.isArray(data.competitors) ? (data.competitors[1] as string) : "Others");

  // Support both data.features (schema) and data.rows (templates)
  const rows = (Array.isArray(data.features) ? data.features : Array.isArray(data.rows) ? data.rows : []) as Row[];

  function resolveCell(row: Row, colIndex: number): boolean {
    // New format: us/them fields
    if (colIndex === 0 && row.us !== undefined) return row.us !== "false" && row.us !== "no";
    if (colIndex === 1 && row.them !== undefined) return row.them === "true" || row.them === "yes";
    // Template format: values array
    if (Array.isArray(row.values)) {
      const v = row.values[colIndex];
      if (typeof v === "boolean") return v;
      return v === "true" || v === "yes";
    }
    return false;
  }

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-3xl">
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title    && <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
          </div>
        )}
        {rows.length === 0 ? <p className="text-center text-gray-400 text-sm">No comparison rows configured.</p> : (
          <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
            <div className="grid grid-cols-3 text-sm font-semibold text-center border-b border-gray-200">
              <div className="p-4 text-gray-500">{isAr ? "الميزة" : "Feature"}</div>
              <div className="p-4 text-white" style={{ background: "var(--style-color-primary, #2d6a4f)" }}>{ourName}</div>
              <div className="p-4 text-gray-400 bg-gray-50">{themName}</div>
            </div>
            {rows.map((row, i) => {
              const feat  = isAr ? (row.featureAr ?? row.feature ?? row.featureEn ?? "") : (row.featureEn ?? row.feature ?? "");
              const usYes = resolveCell(row, 0);
              const thYes = resolveCell(row, 1);
              return (
                <div key={i} className={`grid grid-cols-3 text-sm text-center items-center border-b border-gray-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <div className="p-4 text-start text-gray-700 font-medium">{feat}</div>
                  <div className="p-4 flex justify-center">
                    {usYes ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-400" />}
                  </div>
                  <div className="p-4 flex justify-center">
                    {thYes ? <Check className="h-5 w-5 text-green-400 opacity-60" /> : <X className="h-5 w-5 text-red-300" />}
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
