"use client";
import { useLanguage } from "@/lib/language-context";

interface Member { nameEn?: string; nameAr?: string; roleEn?: string; roleAr?: string; photo?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function TeamCompactSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const members = (Array.isArray(data.members) ? data.members : []) as Member[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-10 text-center">{title}</h2>}
        {members.length === 0 ? <p className="text-center text-gray-400 text-sm">No team members configured.</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {members.map((m, i) => {
              const name = isAr ? (m.nameAr ?? m.nameEn ?? "") : (m.nameEn ?? "");
              const role = isAr ? (m.roleAr ?? m.roleEn ?? "") : (m.roleEn ?? "");
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  {m.photo ? <img src={m.photo} alt={name} className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-gray-100" /> : <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-400 mb-3">{name.charAt(0)}</div>}
                  <p className="text-sm font-semibold text-soil-dark leading-snug">{name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{role}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
