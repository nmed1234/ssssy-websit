"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function SplitContentSection({ config = {} }: Props) {
  const { language } = useLanguage();
  const isAr      = language === "ar";
  const title     = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  // Template uses descriptionEn, schema uses bodyEn
  const body      = isAr
    ? ((config.bodyAr ?? config.descriptionAr ?? config.body ?? config.description ?? "") as string)
    : ((config.bodyEn ?? config.descriptionEn ?? config.body ?? config.description ?? "") as string);
  const ctaLabel  = isAr
    ? ((config.ctaLabelAr ?? "") as string)
    : ((config.ctaLabelEn ?? "") as string);
  const ctaUrl    = (config.ctaUrl as string) ?? "#";
  const image     = (config.image as string) ?? "";
  // Template uses imagePosition="right", schema uses imageSide="right"
  const imageSide = ((config.imageSide ?? config.imagePosition) as string) ?? "right";
  const eyebrow   = isAr
    ? ((config.eyebrowAr ?? "") as string)
    : ((config.eyebrowEn ?? "") as string);

  const reversed = imageSide === "left" ? "md:flex-row-reverse" : "md:flex-row";

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className={`container mx-auto px-4 flex flex-col ${reversed} items-center gap-12`}>
        {/* Text */}
        <div className="flex-1 max-w-lg">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--style-color-primary, #2d6a4f)" }}>{eyebrow}</p>}
          {title   && <h2 className="text-2xl md:text-4xl font-bold mb-5 leading-tight" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
          {body    && <p className="text-gray-500 leading-relaxed mb-8">{body}</p>}
          {ctaLabel && (
            <Link href={ctaUrl} className="inline-block text-white font-semibold px-7 py-3 rounded-xl transition-opacity hover:opacity-90 text-sm" style={{ background: "var(--style-color-primary, #2d6a4f)" }}>
              {ctaLabel}
            </Link>
          )}
        </div>
        {/* Image */}
        <div className="flex-1 w-full max-w-lg">
          <div className="rounded-2xl overflow-hidden aspect-video bg-gray-100 shadow-md">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200">
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
