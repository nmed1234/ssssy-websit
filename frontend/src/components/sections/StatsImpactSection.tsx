"use client";
import { useLanguage } from "@/lib/language-context";

interface Stat { valueEn?: string; valueAr?: string; value?: string; labelEn?: string; labelAr?: string; label?: string; icon?: string; color?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function StatsImpactSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle= isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const bgDark  = config.bgDark !== "false";
  const stats   = (Array.isArray(data.stats) ? data.stats : []) as Stat[];

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: bgDark ? "var(--style-color-primary, #1b5e20)" : "var(--style-color-surface)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className={`text-center mb-14 ${bgDark ? "text-white" : ""}`}>
            {title    && <h2 className="text-2xl md:text-3xl font-bold mb-3">{title}</h2>}
            {subtitle && <p className={`max-w-xl mx-auto ${bgDark ? "text-white/70" : "text-gray-500"}`}>{subtitle}</p>}
          </div>
        )}
        {stats.length === 0 ? <p className="text-center text-gray-400 text-sm">No stats configured.</p> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const value = isAr ? (stat.valueAr ?? stat.value ?? "") : (stat.valueEn ?? stat.value ?? "");
              const label = isAr ? (stat.labelAr ?? stat.label ?? "") : (stat.labelEn ?? stat.label ?? "");
              return (
                <div key={i} className={`text-center p-6 rounded-2xl ${bgDark ? "bg-white/10" : "bg-white border border-gray-200"}`}>
                  {stat.icon && <div className="text-3xl mb-3">{stat.icon}</div>}
                  <div className={`text-4xl font-extrabold mb-1 ${bgDark ? "text-white" : "text-soil-dark"}`}>{value}</div>
                  <div className={`text-sm ${bgDark ? "text-white/70" : "text-gray-500"}`}>{label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
