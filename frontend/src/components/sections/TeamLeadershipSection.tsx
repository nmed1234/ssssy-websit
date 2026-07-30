"use client";
import { Linkedin, Twitter } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Leader { nameEn?: string; nameAr?: string; titleEn?: string; titleAr?: string; bioEn?: string; bioAr?: string; photo?: string; linkedIn?: string; twitter?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function TeamLeadershipSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr     = language === "ar";
  const title    = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const members  = (Array.isArray(data.members) ? data.members : []) as Leader[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title    && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-3">{title}</h2>}
            {subtitle && <p className="text-gray-500 max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}
        {members.length === 0 ? <p className="text-center text-gray-400 text-sm">No members configured.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((m, i) => {
              const name  = isAr ? (m.nameAr  ?? m.nameEn  ?? "") : (m.nameEn  ?? "");
              const role  = isAr ? (m.titleAr ?? m.titleEn ?? "") : (m.titleEn ?? "");
              const bio   = isAr ? (m.bioAr   ?? m.bioEn   ?? "") : (m.bioEn   ?? "");
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  {m.photo ? <img src={m.photo} alt={name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100" /> : <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-3xl font-bold text-blue-400 mb-4">{name.charAt(0)}</div>}
                  <h3 className="font-bold text-soil-dark mb-1">{name}</h3>
                  <p className="text-sm text-soil-clay font-medium mb-3">{role}</p>
                  {bio && <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">{bio}</p>}
                  <div className="flex gap-3 mt-auto">
                    {m.linkedIn && <a href={m.linkedIn} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors"><Linkedin className="h-4 w-4" /></a>}
                    {m.twitter  && <a href={m.twitter}  target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition-colors"><Twitter  className="h-4 w-4" /></a>}
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
