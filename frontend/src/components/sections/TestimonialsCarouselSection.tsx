"use client";
import { Star } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface Item { nameEn?: string; nameAr?: string; roleEn?: string; roleAr?: string; quoteEn?: string; quoteAr?: string; rating?: number | string; avatar?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function TestimonialsCarouselSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr  = language === "ar";
  const title = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const items = (Array.isArray(data.items) ? data.items : []) as Item[];
  const [current, setCurrent] = useState(0);

  if (items.length === 0) return null;
  const item  = items[current];
  const name  = isAr ? (item.nameAr ?? item.nameEn ?? "") : (item.nameEn ?? "");
  const role  = isAr ? (item.roleAr ?? item.roleEn ?? "") : (item.roleEn ?? "");
  const quote = isAr ? (item.quoteAr ?? item.quoteEn ?? "") : (item.quoteEn ?? "");
  const rating = Number(item.rating ?? 5);

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-3xl">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-10 text-center">{title}</h2>}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-5 w-5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
          </div>
          {quote && <p className="text-gray-600 text-lg leading-relaxed mb-8 italic">&ldquo;{quote}&rdquo;</p>}
          <div className="flex items-center justify-center gap-3">
            {item.avatar ? <img src={item.avatar} alt={name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-soil-sand/40 flex items-center justify-center font-bold text-soil-clay">{name.charAt(0)}</div>}
            <div className="text-left">
              <p className="font-semibold text-soil-dark text-sm">{name}</p>
              <p className="text-xs text-soil-clay">{role}</p>
            </div>
          </div>
        </div>
        {/* Dots */}
        {items.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-soil-clay" : "bg-soil-clay/25"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
