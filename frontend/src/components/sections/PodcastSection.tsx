"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Episode { titleEn?: string; titleAr?: string; descriptionEn?: string; descriptionAr?: string; duration?: string; date?: string; audioUrl?: string; image?: string; guestName?: string; episode?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function PodcastSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const title   = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle= isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const platform= (config.platformUrl as string) ?? "";
  const episodes= (Array.isArray(data.episodes) ? data.episodes : []) as Episode[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            {title    && <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
            {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
          </div>
          {platform && (
            <Link href={platform} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow">
              🎧 {isAr ? "كل الحلقات" : "All Episodes"}
            </Link>
          )}
        </div>
        {episodes.length === 0 ? <p className="text-center text-gray-400 text-sm">No episodes configured.</p> : (
          <div className="space-y-4">
            {episodes.map((ep, i) => {
              const t = isAr ? (ep.titleAr ?? ep.titleEn ?? "") : (ep.titleEn ?? "");
              const d = isAr ? (ep.descriptionAr ?? ep.descriptionEn ?? "") : (ep.descriptionEn ?? "");
              return (
                <div key={i} className="flex items-center gap-5 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow group">
                  <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {ep.image ? (
                      <img src={ep.image} alt={t} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎙️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {ep.episode && <span className="text-xs font-bold text-gray-400">EP {ep.episode}</span>}
                      {ep.date    && <span className="text-xs text-gray-400">· {ep.date}</span>}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800 truncate">{t}</h3>
                    {d && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{d}</p>}
                    {ep.guestName && <p className="text-xs text-gray-400 mt-0.5">with {ep.guestName}</p>}
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-3 text-gray-400">
                    {ep.duration && <span className="text-xs">{ep.duration}</span>}
                    <button className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors"
                      style={{ color: "var(--style-color-primary, #2d6a4f)" }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
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
