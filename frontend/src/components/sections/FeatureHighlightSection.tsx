"use client";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Bullet { textEn?: string; textAr?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function FeatureHighlightSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title       = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const description = isAr ? ((config.descriptionAr ?? config.description ?? "") as string) : ((config.descriptionEn ?? config.description ?? "") as string);
  const ctaLabel    = isAr ? ((config.ctaLabelAr ?? config.ctaLabel ?? "") as string) : ((config.ctaLabelEn ?? config.ctaLabel ?? "") as string);
  const ctaUrl      = (config.ctaUrl as string) ?? "/";
  const image       = (config.image as string) ?? "";
  const imageRight  = (config.imagePosition as string) !== "left";
  const bullets     = (Array.isArray(data.bullets) ? data.bullets : []) as Bullet[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <div className={`flex flex-col md:flex-row gap-12 items-center ${imageRight ? "" : "md:flex-row-reverse"}`}>
          {/* Text side */}
          <div className="flex-1">
            {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-4">{title}</h2>}
            {description && <p className="text-gray-500 leading-relaxed mb-6">{description}</p>}
            {bullets.length > 0 && (
              <ul className="space-y-3 mb-8">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{isAr ? (b.textAr ?? "") : (b.textEn ?? "")}</span>
                  </li>
                ))}
              </ul>
            )}
            {ctaLabel && ctaUrl && (
              <Link href={ctaUrl} className="inline-block bg-soil-dark text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-soil-clay transition-colors">{ctaLabel}</Link>
            )}
          </div>
          {/* Image side */}
          <div className="flex-1 rounded-2xl overflow-hidden bg-gray-100 min-h-[280px] flex items-center justify-center">
            {image
              ? <img src={image} alt={title} className="w-full h-full object-cover" />
              : <span className="text-6xl opacity-20">🖼</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
