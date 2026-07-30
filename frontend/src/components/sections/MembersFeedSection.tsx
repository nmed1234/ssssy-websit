"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Member { nameEn?: string; nameAr?: string; titleEn?: string; titleAr?: string; organization?: string; image?: string; slug?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function MembersFeedSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr        = language === "ar";
  const title       = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle    = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const viewAllLabel= isAr ? ((config.viewAllLabelAr ?? "") as string) : ((config.viewAllLabelEn ?? "View all members") as string);
  const viewAllUrl  = (config.viewAllUrl as string) ?? "/members";
  const members     = (Array.isArray(data.members) ? data.members : []) as Member[];
  const columns     = Number(config.columns ?? 4);

  const gridCols = columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : columns === 5 ? "sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            {title    && <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
            {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
          </div>
          {viewAllLabel && <Link href={viewAllUrl} className="text-sm font-medium hover:underline" style={{ color: "var(--style-color-primary, #2d6a4f)" }}>{viewAllLabel} →</Link>}
        </div>
        {members.length === 0 ? <p className="text-center text-gray-400 text-sm">No members configured.</p> : (
          <div className={`grid grid-cols-2 ${gridCols} gap-6`}>
            {members.map((m, i) => {
              const name  = isAr ? (m.nameAr ?? m.nameEn ?? "") : (m.nameEn ?? "");
              const mtitle= isAr ? (m.titleAr ?? m.titleEn ?? "") : (m.titleEn ?? "");
              const url   = m.slug ? `/members/${m.slug}` : "#";
              return (
                <Link key={i} href={url} className="group text-center">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-100 mb-3">
                    {m.image ? (
                      <img src={m.image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">👤</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 group-hover:text-soil-dark">{name}</h3>
                  {mtitle      && <p className="text-xs text-gray-500">{mtitle}</p>}
                  {m.organization && <p className="text-xs text-gray-400">{m.organization}</p>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
