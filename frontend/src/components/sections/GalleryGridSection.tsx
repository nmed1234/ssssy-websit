"use client";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface GalleryImage { src?: string; altEn?: string; altAr?: string; captionEn?: string; captionAr?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function GalleryGridSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const cols    = Number(config.columns ?? 3);
  const lightbox = (config.lightbox as string) !== "false";
  const images  = (Array.isArray(data.images) ? data.images : []) as GalleryImage[];
  const [open, setOpen] = useState<GalleryImage | null>(null);
  const gridCols = cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-10 text-center">{title}</h2>}
        {images.length === 0 ? <p className="text-center text-gray-400 text-sm">No images configured.</p> : (
          <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
            {images.map((img, i) => {
              const alt     = isAr ? (img.altAr ?? img.altEn ?? "") : (img.altEn ?? "");
              const caption = isAr ? (img.captionAr ?? img.captionEn ?? "") : (img.captionEn ?? "");
              return (
                <div key={i} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square cursor-pointer" onClick={() => lightbox && setOpen(img)}>
                  {img.src ? <img src={img.src} alt={alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🖼</div>}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    {lightbox && <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  {caption && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3"><p className="text-white text-xs">{caption}</p></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300"><X className="h-8 w-8" /></button>
          {open.src && <img src={open.src} alt={isAr ? (open.altAr ?? "") : (open.altEn ?? "")} className="max-w-full max-h-full rounded-lg object-contain" onClick={e => e.stopPropagation()} />}
        </div>
      )}
    </section>
  );
}
