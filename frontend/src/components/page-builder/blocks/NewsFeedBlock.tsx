"use client";

/**
 * NewsFeedBlock — renders a live news feed on public pages.
 *
 * In builder mode (inside BuilderCanvas) it returns DynamicFeedPlaceholder
 * immediately, suppressing all API calls (REQ-5.8).
 *
 * On public pages the context defaults to false, so a real fetch runs.
 */

import React, { useEffect, useState } from "react";
import type { Block } from "@/types/block";
import { useIsBuilderMode } from "@/components/page-builder/BuilderModeContext";
import { DynamicFeedPlaceholder } from "@/components/page-builder/BlockRenderer";
import { useLanguage } from "@/lib/language-context";
import api from "@/lib/api";

// ─── Data shape returned by /api/public/content ──────────────────────────────

interface Article {
  id: string;
  slug: string;
  titleAr?: string;
  titleEn?: string;
  publishedAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clampLimit(raw: unknown): number {
  const n = Number(raw);
  if (isNaN(n) || n < 1) return 6;
  return Math.min(n, 12);
}

function resolveTitle(article: Article, language: string): string {
  if (language === "ar" && article.titleAr) return article.titleAr;
  return article.titleEn ?? article.titleAr ?? "";
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

// ─── ArticleCard ──────────────────────────────────────────────────────────────

interface ArticleCardProps {
  article: Article;
  language: string;
}

export function ArticleCard({ article, language }: ArticleCardProps) {
  const title = resolveTitle(article, language);
  const date  = formatDate(article.publishedAt);

  return (
    <article className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="p-6">
        {title && (
          <h3 className="font-heading text-lg font-bold mb-2 line-clamp-2">
            {title}
          </h3>
        )}
        {date && (
          <p className="text-sm text-muted-foreground mb-4">{date}</p>
        )}
        <a
          href={`/news/${article.slug}`}
          className="inline-block text-sm font-medium text-soil-dark underline-offset-2 hover:underline"
        >
          Read More
        </a>
      </div>
    </article>
  );
}

// ─── FeedEmpty ────────────────────────────────────────────────────────────────

function FeedEmpty({ type }: { type: "news" | "events" }) {
  const message =
    type === "news"
      ? "No news articles are available at the moment."
      : "No upcoming events are available at the moment.";
  return (
    <div className="py-12 text-center text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}

// ─── FeedSkeleton ─────────────────────────────────────────────────────────────

function FeedSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-xl p-6 bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── NewsFeedBlock ────────────────────────────────────────────────────────────

export interface NewsFeedBlockProps {
  block: Block;
}

export function NewsFeedBlock({ block }: NewsFeedBlockProps) {
  const isBuilderMode = useIsBuilderMode();
  const { language } = useLanguage();
  const limit = clampLimit(block.props.limit);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading]   = useState(!isBuilderMode);
  const [error, setError]       = useState(false);

  // Resolve bilingual block title
  const blockTitle =
    language === "ar"
      ? String(block.props.titleAr ?? block.props.title ?? "")
      : String(block.props.title ?? block.props.titleEn ?? "");

  useEffect(() => {
    if (isBuilderMode) return; // REQ-5.8: suppress API calls in canvas

    let cancelled = false;
    setLoading(true);
    setError(false);

    api
      .get<{ data?: { content?: Article[] } | Article[] }>(
        `/public/content?type=article&status=PUBLISHED&page=0&size=${limit}`
      )
      .then((res) => {
        if (cancelled) return;
        // Handle both { data: { content: [...] } } and { data: [...] } shapes
        const raw = res.data;
        let items: Article[] = [];
        if (Array.isArray(raw)) {
          items = raw;
        } else if (raw && typeof raw === "object") {
          const inner = (raw as { data?: { content?: Article[] } }).data;
          if (inner && Array.isArray(inner)) {
            items = inner as Article[];
          } else if (inner && Array.isArray((inner as { content?: Article[] }).content)) {
            items = (inner as { content: Article[] }).content;
          }
        }
        setArticles(items);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isBuilderMode, limit]);

  // Builder mode — no API call, show placeholder (REQ-5.8)
  if (isBuilderMode) {
    return (
      <DynamicFeedPlaceholder
        title={blockTitle}
        type="news"
        limit={limit}
      />
    );
  }

  // Loading state — skeleton cards matching limit (REQ-5.5)
  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {blockTitle && (
            <h2 className="font-heading text-3xl font-bold mb-8">{blockTitle}</h2>
          )}
          <FeedSkeleton count={limit} />
        </div>
      </section>
    );
  }

  // Error / empty state (REQ-5.6)
  if (error || articles.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {blockTitle && (
            <h2 className="font-heading text-3xl font-bold mb-8">{blockTitle}</h2>
          )}
          <FeedEmpty type="news" />
        </div>
      </section>
    );
  }

  // Success state (REQ-5.1, 5.3, 5.7)
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {blockTitle && (
          <h2 className="font-heading text-3xl font-bold mb-8">{blockTitle}</h2>
        )}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
