"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublishedContentBySlug } from "@/lib/public-content";
import type { ContentItem } from "@/types";
import {
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Clock,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { TextReveal } from "@/components/ui/text-reveal";


const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatReadingTime(body?: string) {
  if (!body) return "1 min read";
  const words = body.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

export default function NewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchArticle = () => {
    if (!params.slug) return;
    setLoading(true);
    setError(false);
    getPublishedContentBySlug(params.slug as string)
      .then((res) => {
        if (res.data.success) {
          const data = res.data.data;
          if (data.contentType === "NEWS" || data.contentType === "ARTICLE") {
            setArticle(data);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticle();
  }, [params.slug]);

  if (loading) {
    return (
      <div>
        <section className="bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="animate-pulse">
              <div className="h-4 bg-soil-sand/30 rounded w-24 mb-6" />
              <div className="h-10 bg-soil-sand/30 rounded w-3/4 mb-4" />
              <div className="h-4 bg-soil-sand/30 rounded w-1/3" />
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-soil-sand/50 rounded-lg" />
              <div className="h-4 bg-soil-sand/50 rounded w-1/4" />
              <div className="h-4 bg-soil-sand/50 rounded w-full" />
              <div className="h-4 bg-soil-sand/50 rounded w-full" />
              <div className="h-4 bg-soil-sand/50 rounded w-3/4" />
              <div className="h-4 bg-soil-sand/50 rounded w-5/6" />
              <div className="h-4 bg-soil-sand/50 rounded w-full" />
              <div className="h-4 bg-soil-sand/50 rounded w-2/3" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div>
        <section className="bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <Link href="/news" className="inline-flex items-center gap-2 text-soil-sand hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to News
            </Link>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center max-w-lg">
            {error ? (
              <>
                <AlertCircle className="h-16 w-16 text-earth-gray/40 mx-auto mb-6" />
                <h2 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-3`}>
                  Failed to Load Article
                </h2>
                <p className="text-earth-gray mb-6">
                  Something went wrong while loading this article. Please try again.
                </p>
                <Button onClick={fetchArticle} className="bg-soil-clay hover:bg-soil-dark text-white">
                  <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              </>
            ) : (
              <>
                <BookOpen className="h-16 w-16 text-earth-gray/40 mx-auto mb-6" />
                <h2 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-3`}>
                  Article Not Found
                </h2>
                <p className="text-earth-gray mb-6">
                  The article you are looking for does not exist or has been removed.
                </p>
                <Link href="/news">
                  <Button className="bg-soil-clay hover:bg-soil-dark text-white">Browse All News</Button>
                </Link>
              </>
            )}
          </div>
        </section>
      </div>
    );
  }

  const title = article.titleEn || article.titleAr || "";
  const shareUrl = `${siteUrl}/news/${article.slug}`;
  const shareText = encodeURIComponent(title);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
            <path d="M0,200 C200,50 400,300 600,150 C800,0 1000,250 1000,150 L1000,400 L0,400 Z" fill="#D7CCC8" />
          </svg>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <Link href="/news" className="inline-flex items-center gap-2 text-soil-sand hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to News
          </Link>
          {article.category && (
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-white/20 text-soil-sand mb-4">
              {article.category.nameEn || article.category.nameAr}
            </span>
          )}
          <TextReveal as="h1" className={`${almarai.className} fluid-3xl md:fluid-4xl lg:fluid-5xl font-bold leading-tight max-w-4xl`}>{title}</TextReveal>
          <div className="flex flex-wrap items-center gap-4 mt-6 text-soil-sand/80 fluid-sm">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.authorName}
            </span>
            {article.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatReadingTime(article.body)}
            </span>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {article.featuredImage && (
            <div className="mb-10 rounded-lg overflow-hidden shadow-md">
              <img
                src={article.featuredImage}
                alt={title}
                loading="lazy"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          <article className="prose prose-lg max-w-none prose-headings:text-soil-dark prose-p:text-earth-gray prose-a:text-soil-clay prose-strong:text-soil-dark prose-code:text-earth-gray">
            {article.excerpt && (
              <p className="fluid-lg text-soil-clay font-medium leading-relaxed mb-8 border-l-4 border-soil-sand pl-4 italic">
                {article.excerpt}
              </p>
            )}
            {article.body ? (
              <div dangerouslySetInnerHTML={{ __html: article.body }} className="leading-relaxed" />
            ) : (
              <p className="text-earth-gray">No content available for this article.</p>
            )}
          </article>

          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-soil-sand/30">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-earth-gray" />
                {article.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-soil-sand/30 text-soil-clay"
                  >
                    {tag.nameEn || tag.nameAr}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-soil-sand/30">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-soil-dark flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Share this article
              </span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
