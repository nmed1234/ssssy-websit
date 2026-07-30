"use client";
import { useLanguage } from "@/lib/language-context";

interface StatItem {
  labelEn?: string; labelAr?: string; label?: string;
  value?: string | number;
  suffix?: string;
  progress?: string | number;
  color?: string;
}
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function StatsProgressSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle= isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  // Support both data.stats (schema) and data.items (templates)
  const stats   = (Array.isArray(data.stats) ? data.stats : Array.isArray(data.items) ? data.items : []) as StatItem[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-3xl">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title    && <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
            {subtitle && <p className="text-gray-500 max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}
        {stats.length === 0 ? <p className="text-center text-gray-400 text-sm">No stats configured.</p> : (
          <div className="space-y-6">
            {stats.map((stat, i) => {
              const label = isAr ? (stat.labelAr ?? stat.label ?? "") : (stat.labelEn ?? stat.label ?? "");
              // value may be the percentage itself OR progress is set separately
              const numVal = Number(stat.value ?? 0);
              const pct    = stat.progress !== undefined
                ? Math.min(100, Math.max(0, Number(stat.progress)))
                : Math.min(100, numVal);
              const color  = stat.color ?? "var(--style-color-primary, #2d6a4f)";
              const displayValue = `${stat.value ?? ""}${stat.suffix ?? ""}`;
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm font-bold" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{displayValue}</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
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
