"use client";
import { useLanguage } from "@/lib/language-context";

interface Post { platform?: string; author?: string; handle?: string; text?: string; date?: string; image?: string; likes?: string; url?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "#1da1f2",
  x: "#000000",
  instagram: "#e1306c",
  linkedin: "#0a66c2",
  facebook: "#1877f2",
};

export function SocialFeedSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr  = language === "ar";
  const title = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const posts = (Array.isArray(data.posts) ? data.posts : []) as Post[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
        {posts.length === 0 ? <p className="text-center text-gray-400 text-sm">No social posts configured.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {posts.map((post, i) => {
              const platformColor = PLATFORM_COLORS[(post.platform ?? "").toLowerCase()] ?? "#888";
              return (
                <a key={i} href={post.url ?? "#"} target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold" style={{ color: platformColor }}>
                      {(post.author ?? "?")[0]}
                    </div>
                    <div>
                      {post.author && <p className="text-xs font-semibold text-gray-800">{post.author}</p>}
                      {post.handle && <p className="text-xs text-gray-400">{post.handle}</p>}
                    </div>
                    {post.platform && (
                      <span className="ml-auto text-xs font-bold" style={{ color: platformColor }}>
                        {post.platform}
                      </span>
                    )}
                  </div>
                  {post.image && (
                    <div className="mb-3 rounded-lg overflow-hidden aspect-video bg-gray-100">
                      <img src={post.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {post.text && <p className="text-sm text-gray-700 leading-relaxed flex-1">{post.text}</p>}
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                    {post.date && <span>{post.date}</span>}
                    {post.likes && <span>♥ {post.likes}</span>}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
