"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Post { titleEn?: string; titleAr?: string; categoryEn?: string; categoryAr?: string; date?: string; excerpt?: string; image?: string; slug?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function BlogGridSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title        = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const viewAllLabel = isAr ? ((config.viewAllLabelAr ?? config.viewAllLabel ?? "") as string) : ((config.viewAllLabelEn ?? config.viewAllLabel ?? "") as string);
  const viewAllUrl   = (config.viewAllUrl as string) ?? "/blog";
  const posts        = (Array.isArray(data.posts) ? data.posts : []) as Post[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          {title && <h2 className="text-2xl md:text-3xl font-bold text-soil-dark">{title}</h2>}
          {viewAllLabel && <Link href={viewAllUrl} className="text-sm font-medium text-soil-clay hover:underline">{viewAllLabel} →</Link>}
        </div>
        {posts.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No blog posts configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => {
              const t   = isAr ? (post.titleAr ?? "") : (post.titleEn ?? "");
              const cat = isAr ? (post.categoryAr ?? post.categoryEn ?? "") : (post.categoryEn ?? "");
              const url = post.slug ?? "#";
              return (
                <Link key={i} href={url} className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                    {post.image ? <img src={post.image} alt={t} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <span className="text-4xl opacity-20">📰</span>}
                  </div>
                  <div className="p-5">
                    {cat && <span className="inline-block text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full mb-2">{cat}</span>}
                    <h3 className="font-semibold text-soil-dark text-sm leading-snug mb-2 line-clamp-2">{t}</h3>
                    {post.excerpt && <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>}
                    {post.date && <p className="text-xs text-gray-400 mt-2">{post.date}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
