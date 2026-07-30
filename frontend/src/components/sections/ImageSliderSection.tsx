"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Slide { src?: string; captionEn?: string; captionAr?: string; altEn?: string; altAr?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function ImageSliderSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr   = language === "ar";
  const title  = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const slides = (Array.isArray(data.slides) ? data.slides : []) as Slide[];
  const [idx, setIdx] = useState(0);

  if (slides.length === 0) return null;
  const slide   = slides[idx];
  const caption = isAr ? (slide.captionAr ?? slide.captionEn ?? "") : (slide.captionEn ?? "");
  const alt     = isAr ? (slide.altAr ?? slide.altEn ?? "") : (slide.altEn ?? "");

  return (
    <section className="py-0 relative overflow-hidden bg-gray-900" dir={isAr ? "rtl" : "ltr"}>
      {title && <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10"><h2 className="text-white font-bold text-xl drop-shadow">{title}</h2></div>}
      <div className="relative" style={{ minHeight: 400 }}>
        {slide.src ? <img src={slide.src} alt={alt} className="w-full object-cover" style={{ minHeight: 400, maxHeight: 600 }} /> : <div className="w-full flex items-center justify-center text-6xl opacity-20" style={{ minHeight: 400, background: "#1e293b" }}>🖼</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {caption && <p className="absolute bottom-16 left-0 right-0 text-center text-white text-sm px-8">{caption}</p>}
        {/* Arrows */}
        {slides.length > 1 && <>
          <button onClick={() => setIdx((idx - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => setIdx((idx + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"><ChevronRight className="h-5 w-5" /></button>
        </>}
        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all ${i === idx ? "w-6 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50"}`} />)}
          </div>
        )}
      </div>
    </section>
  );
}
