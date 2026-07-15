"use client";

/**
 * EventsFeedBlock — renders a live upcoming-events feed on public pages.
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

// ─── Data shape returned by /api/public/events/upcoming ──────────────────────

interface UpcomingEvent {
  id: string;
  titleAr?: string;
  titleEn?: string;
  startDate?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clampLimit(raw: unknown): number {
  const n = Number(raw);
  if (isNaN(n) || n < 1) return 6;
  return Math.min(n, 12);
}

function resolveTitle(event: UpcomingEvent, language: string): string {
  if (language === "ar" && event.titleAr) return event.titleAr;
  return event.titleEn ?? event.titleAr ?? "";
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

// ─── EventCard ────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: UpcomingEvent;
  language: string;
}

export function EventCard({ event, language }: EventCardProps) {
  const title = resolveTitle(event, language);
  const date  = formatDate(event.startDate);

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
          href={`/events/${event.id}`}
          className="inline-block text-sm font-medium text-soil-dark underline-offset-2 hover:underline"
        >
          View Details
        </a>
      </div>
    </article>
  );
}

// ─── FeedEmpty ────────────────────────────────────────────────────────────────

function FeedEmpty() {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <p>No upcoming events are available at the moment.</p>
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

// ─── EventsFeedBlock ──────────────────────────────────────────────────────────

export interface EventsFeedBlockProps {
  block: Block;
}

export function EventsFeedBlock({ block }: EventsFeedBlockProps) {
  const isBuilderMode = useIsBuilderMode();
  const { language } = useLanguage();
  const limit = clampLimit(block.props.limit);

  const [events, setEvents]   = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(!isBuilderMode);
  const [error, setError]     = useState(false);

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
      .get<unknown>(`/public/events/upcoming?limit=${limit}`)
      .then((res) => {
        if (cancelled) return;
        // Handle various API envelope shapes
        const raw = res.data;
        let items: UpcomingEvent[] = [];
        if (Array.isArray(raw)) {
          items = raw as UpcomingEvent[];
        } else if (raw && typeof raw === "object") {
          const inner = (raw as { data?: unknown }).data;
          if (Array.isArray(inner)) {
            items = inner as UpcomingEvent[];
          } else if (inner && typeof inner === "object") {
            const content = (inner as { content?: unknown }).content;
            if (Array.isArray(content)) items = content as UpcomingEvent[];
          }
        }
        setEvents(items);
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
        type="events"
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
  if (error || events.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {blockTitle && (
            <h2 className="font-heading text-3xl font-bold mb-8">{blockTitle}</h2>
          )}
          <FeedEmpty />
        </div>
      </section>
    );
  }

  // Success state (REQ-5.2, 5.4, 5.7)
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {blockTitle && (
          <h2 className="font-heading text-3xl font-bold mb-8">{blockTitle}</h2>
        )}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
