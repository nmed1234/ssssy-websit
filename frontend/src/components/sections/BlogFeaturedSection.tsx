"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface RecentPost { titleEn?: string; titleAr?: string; date?: string; slug?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function BlogFeaturedSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title           = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const featuredTitle   = isAr ? ((config.featuredTitleAr ?? config.featuredTitle ?? "") as string) : ((config.featuredTitleEn ?? config.featuredTitle ?? "") as string);
  const featuredExcerpt = isAr ? ((config.featuredExcerptAr ?? config.featuredExcerpt ?? "") as string) : ((config.featuredExcerptEn ?? config.featuredExcerpt ?? "") as string);
  const featuredImage   = (config.featuredImage as string) ?? "";
  const featuredSlug    = (config.featuredSlug as string) ?? "#";
  const featuredCat     = isAr ? ((config.featuredCategoryAr ?? config.featuredCategory ?? "") as string) : ((config.featuredCategoryEn ?? config.featuredCategory ?? "") as string);
  const featuredDate    = (config.featuredDate as string) ?? "";
  const recent          = (Array.isArray(data.recent) ? data.recent : []) as RecentPost[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-10">{title}</h2>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured */}
          <Link href={featuredSlug} className="lg:col-span-2 group block bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
              {featuredImage ? <img src={featuredImage} alt={featuredTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <span className="text-6xl opacity-20">📰</span>}
            </div>
            <div className="p-6">
              {featuredCat && <span className="inline-block text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full mb-2">{featuredCat}</span>}
              <h3 className="text-xl font-bold text-soil-dark mb-3 leading-snug">{featuredTitle}</h3>
              {featuredExcerpt && <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{featuredExcerpt}</p>}
              {featuredDate && <p className="text-xs text-gray-400 mt-3">{featuredDate}</p>}
            </div>
          </Link>
          {/* Recent sidebar */}
          <div className="flex flex-col gap-4">
            {recent.length === 0 ? <p className="text-gray-400 text-sm">No recent posts.</p> : recent.map((p, i) => {
              const t = isAr ? (p.titleAr ?? "") : (p.titleEn ?? "");
              return (
                <Link key={i} href={p.slug ?? "#"} className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-soil-dark text-sm leading-snug mb-1 line-clamp-2">{t}</h4>
                  {p.date && <p className="text-xs text-gray-400">{p.date}</p>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
