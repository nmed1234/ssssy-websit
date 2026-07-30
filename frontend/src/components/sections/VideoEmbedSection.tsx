"use client";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function VideoEmbedSection({ config = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const caption = isAr ? ((config.captionAr ?? config.caption ?? "") as string) : ((config.captionEn ?? config.caption ?? "") as string);
  const embedUrl = (config.embedUrl as string) ?? "";
  const aspectRatio = (config.aspectRatio as string) ?? "16/9";
  const maxWidth = (config.maxWidth as string) ?? "860px";

  const paddingBottom = aspectRatio === "4/3" ? "75%" : aspectRatio === "1/1" ? "100%" : "56.25%";

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
        <div className="mx-auto rounded-2xl overflow-hidden shadow-xl" style={{ maxWidth }}>
          <div className="relative w-full" style={{ paddingBottom }}>
            {embedUrl ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <span className="text-6xl opacity-20">▶</span>
              </div>
            )}
          </div>
        </div>
        {caption && <p className="text-center text-sm text-gray-500 mt-4 max-w-xl mx-auto">{caption}</p>}
      </div>
    </section>
  );
}
