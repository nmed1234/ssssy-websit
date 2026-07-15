"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParticleField } from "@/components/ui/particle-field";
import { staggerContainer, listItem } from "@/lib/animation-variants";
import { Search, ArrowLeft } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { searchContent } from "@/lib/public-content";
import { PageHero } from "@/components/ui/page-hero";
import type { ContentItem } from "@/types";


const CONTENT_TYPES = [
  { value: "", label: "All" },
  { value: "NEWS", label: "News" },
  { value: "PUBLICATION", label: "Publications" },
  { value: "EVENT", label: "Events" },
] as const;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setPage(0);

    try {
      const response = await searchContent(q, contentType || undefined, 0, pageSize);
      const body = response.data;
      if (body.success) {
        const data = body.data;
        if (Array.isArray(data)) {
          setResults(data);
          setTotalPages(1);
          setTotalElements(data.length);
        } else if (data.content) {
          setResults(data.content);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || data.content.length);
        } else {
          setResults([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        setError(body.message || "Search failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    setLoading(true);
    setError(null);

    try {
      const response = await searchContent(query, contentType || undefined, newPage, pageSize);
      const body = response.data;
      if (body.success) {
        const data = body.data;
        if (Array.isArray(data)) {
          setResults(data);
        } else if (data.content) {
          setResults(data.content);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || data.content.length);
        }
      } else {
        setError(body.message || "Search failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const highlightText = (text: string, queryStr: string) => {
    if (!queryStr.trim()) return text;
    const escaped = queryStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === queryStr.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-soil-dark px-0.5 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div>
      <PageHero
        slug="search"
        defaultTitle="Search"
        defaultSubtitleAr="بحث"
        className="animate-gradient"
      >
        <ParticleField count={12} color="215, 204, 200" speed={0.15} />
        <div className="absolute inset-0 bg-noise opacity-30" />
      </PageHero>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-soil-cream/30 rounded-lg p-6 border border-soil-sand/30 mb-8">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-earth-gray" />
                  <input
                    type="text"
                    placeholder="Search articles, publications, events..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-12 pr-4 py-3 rounded-md border border-soil-sand bg-white text-soil-dark placeholder:text-earth-gray/50 focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent fluid-lg"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-soil-clay hover:bg-soil-dark text-white px-8"
                  disabled={loading || !query.trim()}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 mt-4">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    contentType === type.value
                      ? "bg-soil-clay text-white"
                      : "bg-white border border-soil-sand text-earth-gray hover:border-soil-clay hover:text-soil-clay"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            {loading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="border border-soil-sand/50">
                    <CardContent className="p-6 space-y-3">
                      <div className="h-5 bg-muted rounded w-3/4 animate-shimmer" />
                      <div className="h-4 bg-muted rounded w-full animate-shimmer" />
                      <div className="h-4 bg-muted rounded w-2/3 animate-shimmer" />
                      <div className="flex gap-2">
                        <div className="h-5 bg-muted rounded w-16 animate-shimmer" />
                        <div className="h-5 bg-muted rounded w-24 animate-shimmer" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-earth-gray mb-4">{error}</p>
                <Button onClick={handleSearch} className="bg-soil-clay hover:bg-soil-dark text-white">
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !error && searched && results.length === 0 && (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-soil-sand mx-auto mb-4" />
                <h3 className={`${almarai.className} fluid-xl font-bold text-soil-dark mb-2`}>
                  No results found for &ldquo;{query}&rdquo;
                </h3>
                <p className="text-earth-gray">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <>
                <motion.p
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="fluid-sm text-earth-gray mb-4"
                >
                  Found {totalElements} result{totalElements !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                </motion.p>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {results.map((item) => (
                    <motion.div key={item.id} variants={listItem}>
                      <Card className="border border-soil-sand/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-2 mb-2">
                          <ContentTypeBadge contentType={item.contentType} />
                          {item.publishedAt && (
                            <span className="text-xs text-earth-gray">
                              {new Date(item.publishedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        <h3 className="fluid-lg font-semibold text-soil-dark mb-2">
                          <Link href={`/${item.contentType.toLowerCase()}/${item.slug}`} className="hover:text-soil-clay transition-colors">
                            {highlightText(item.titleEn || item.titleAr || "", query)}
                          </Link>
                        </h3>
                        {item.excerpt && (
                          <p className="fluid-sm text-earth-gray mb-3 line-clamp-2">
                            {highlightText(item.excerpt, query)}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          {item.authorName && (
                            <span className="text-xs text-soil-clay">{item.authorName}</span>
                          )}
                          <Link
                            href={`/${item.contentType.toLowerCase()}/${item.slug}`}
                            className="text-xs font-medium text-soil-clay hover:text-soil-dark transition-colors"
                          >
                            Read More &rarr;
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => handlePageChange(page - 1)}
                      className="border-soil-sand text-soil-clay"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => {
                      if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
                        return (
                          <Button
                            key={i}
                            variant={i === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(i)}
                            className={
                              i === page
                                ? "bg-soil-clay hover:bg-soil-dark text-white"
                                : "border-soil-sand text-soil-clay"
                            }
                          >
                            {i + 1}
                          </Button>
                        );
                      }
                      if (i === page - 2 || i === page + 2) {
                        return <span key={i} className="px-1 text-earth-gray">...</span>;
                      }
                      return null;
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => handlePageChange(page + 1)}
                      className="border-soil-sand text-soil-clay"
                    >
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {!loading && !error && !searched && (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-soil-sand mx-auto mb-4" />
                <p className="text-earth-gray">Enter a search term to find content.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ContentTypeBadge({ contentType }: { contentType: string }) {
  const styles: Record<string, string> = {
    NEWS: "bg-blue-100 text-blue-700 border-blue-300",
    PUBLICATION: "bg-purple-100 text-purple-700 border-purple-300",
    EVENT: "bg-green-100 text-green-700 border-green-300",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[contentType] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
      {contentType === "PUBLICATION" ? "Publication" : contentType.charAt(0) + contentType.slice(1).toLowerCase()}
    </span>
  );
}
