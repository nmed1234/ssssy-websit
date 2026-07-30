"use client";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function RichTextSection({ config = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  // Template uses bodyEn/bodyAr, schema uses contentEn/contentAr
  const content = isAr
    ? ((config.contentAr ?? config.bodyAr ?? config.content ?? "") as string)
    : ((config.contentEn ?? config.bodyEn ?? config.content ?? "") as string);
  // Optional pull quote (template only)
  const pullQuote = isAr
    ? ((config.pullQuoteAr ?? config.pullQuote ?? "") as string)
    : ((config.pullQuoteEn ?? config.pullQuote ?? "") as string);
  const maxWidth = (config.maxWidth as string) ?? "3xl";
  const align    = (config.textAlign as string) ?? "left";

  const widthClass = maxWidth === "lg" ? "max-w-lg" : maxWidth === "xl" ? "max-w-xl" : maxWidth === "2xl" ? "max-w-2xl" : maxWidth === "4xl" ? "max-w-4xl" : "max-w-3xl";
  const alignClass = align === "center" ? "mx-auto text-center" : align === "right" ? "ml-auto text-right" : "text-left";

  return (
    <section className="py-12 md:py-16" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className={`container mx-auto px-4 ${widthClass} ${alignClass}`}>
        {title && <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
        {content && (
          <div
            className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {pullQuote && (
          <blockquote className="mt-8 border-l-4 pl-5 py-2 italic text-gray-500 text-lg" style={{ borderColor: "var(--style-color-primary, #2d6a4f)" }}>
            {pullQuote}
          </blockquote>
        )}
      </div>
    </section>
  );
}
