"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getContentByType } from "@/lib/public-content";
import type { ContentItem } from "@/types";
import { Calendar, User, ArrowRight, AlertCircle, Newspaper } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";


const CATEGORIES = ["All", "Announcements", "Articles"];

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function truncate(text: string, maxLen: number) {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

export default function NewsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchNews = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(false);
    try {
      const res = await getContentByType("NEWS", pageNum, 9);
      if (res.data.success) {
        setItems(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(page);
  }, [page, fetchNews]);

  return (
    <div>
      <PageHero
        slug="news"
        defaultTitle="News &amp; Announcements"
        defaultSubtitleAr="الأخبار والإعلانات"
      />

      <section className="py-10 bg-soil-cream/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-soil-clay text-white"
                    : "bg-white text-earth-gray border border-soil-sand hover:bg-soil-sand/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 @container">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-soil-sand/50 rounded-t-lg" />
                  <CardContent className="p-6 space-y-3">
                    <div className="h-4 bg-soil-sand/50 rounded w-1/4" />
                    <div className="h-6 bg-soil-sand/50 rounded w-full" />
                    <div className="h-4 bg-soil-sand/50 rounded w-3/4" />
                    <div className="h-4 bg-soil-sand/50 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <AlertCircle className="h-12 w-12 text-earth-gray/40 mx-auto mb-4" />
              <p className="text-earth-gray fluid-lg">Failed to load news</p>
              <Button
                onClick={() => fetchNews(page)}
                className="mt-4 bg-soil-clay hover:bg-soil-dark text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-center py-16">
              <Newspaper className="h-12 w-12 text-earth-gray/40 mx-auto mb-4" />
              <p className="text-earth-gray fluid-lg">No news articles found</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 @container">
              {items.map((item) => (
                <Link key={item.id} href={`/news/${item.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group flex flex-col">
                    <div className="h-48 bg-soil-sand/50 flex items-center justify-center rounded-t-lg overflow-hidden">
                      {item.featuredImage ? (
                        <img
                          src={item.featuredImage}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Newspaper className="h-12 w-12 text-soil-clay/40" />
                      )}
                    </div>
                    <CardContent className="@sm:p-4 @md:p-6 flex flex-col flex-1">
                      <p className="text-xs text-soil-clay font-medium mb-2 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.publishedAt)}
                      </p>
                      <h3 className="font-heading font-semibold text-soil-dark mb-2 line-clamp-2 group-hover:text-soil-clay transition-colors">
                        {item.titleEn || item.titleAr}
                      </h3>
                      <p className="fluid-sm text-earth-gray line-clamp-2 mb-4 flex-1">
                        {truncate(item.excerpt || "", 150)}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-soil-sand/30">
                        <span className="text-xs text-earth-gray flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.authorName}
                        </span>
                        <span className="text-xs text-soil-clay font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read More <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="border-soil-sand text-soil-dark hover:bg-soil-sand/30"
              >
                Previous
              </Button>
              <span className="fluid-sm text-earth-gray font-medium">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="border-soil-sand text-soil-dark hover:bg-soil-sand/30"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
