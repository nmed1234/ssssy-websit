"use client";
import { Star } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Item { nameEn?: string; nameAr?: string; roleEn?: string; roleAr?: string; quoteEn?: string; quoteAr?: string; rating?: number | string; avatar?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function TestimonialsWallSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr  = language === "ar";
  const title = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const items = (Array.isArray(data.items) ? data.items : []) as Item[];

  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-10 text-center">{title}</h2>}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {items.map((item, i) => {
            const name  = isAr ? (item.nameAr ?? item.nameEn ?? "") : (item.nameEn ?? "");
            const role  = isAr ? (item.roleAr ?? item.roleEn ?? "") : (item.roleEn ?? "");
            const quote = isAr ? (item.quoteAr ?? item.quoteEn ?? "") : (item.quoteEn ?? "");
            const rating = Number(item.rating ?? 5);
            return (
              <div key={i} className="break-inside-avoid mb-4 bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`h-3.5 w-3.5 ${j < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
                </div>
                {quote && <p className="text-sm text-gray-600 leading-relaxed italic mb-4">&ldquo;{quote}&rdquo;</p>}
                <div className="flex items-center gap-2">
                  {item.avatar ? <img src={item.avatar} alt={name} className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-soil-sand/40 flex items-center justify-center text-xs font-bold text-soil-clay flex-shrink-0">{name.charAt(0)}</div>}
                  <div>
                    <p className="text-xs font-semibold text-soil-dark">{name}</p>
                    <p className="text-xs text-soil-clay">{role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
