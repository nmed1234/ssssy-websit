"use client";

/**
 * UpcomingEventsSection — homepage upcoming events grid.
 *
 * Config keys:
 *   titleEn / titleAr          — section heading
 *   subtitleEn / subtitleAr    — optional sub-heading
 *   viewAllLabelEn / LabelAr   — "View All" link text
 *   viewAllUrl                 — defaults to /events
 *   count                      — number of events to show (default 3)
 *   dataSource                 — "api" (default) | "manual"
 *
 * Data keys (when dataSource is "manual" or items array is present):
 *   items[]  — titleEn / titleAr, description, eventDate, location, slug, featuredImage, eventType
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { getUpcomingEvents } from "@/lib/events";
import type { Event } from "@/types";
import { useLanguage } from "@/lib/language-context";

// ---------------------------------------------------------------------------
// Manual item shape
// ---------------------------------------------------------------------------
interface ManualEventItem {
  titleEn?: string;
  titleAr?: string;
  description?: string;
  eventDate?: string;
  location?: string;
  slug?: string;
  featuredImage?: string;
  eventType?: string;
}

function manualToEvent(item: ManualEventItem, idx: number): Event {
  return {
    id: `manual-${idx}`,
    titleEn: item.titleEn || item.titleAr || `Event ${idx + 1}`,
    titleAr: item.titleAr,
    slug: item.slug || `manual-event-${idx}`,
    description: item.description,
    eventDate: item.eventDate || new Date().toISOString(),
    location: item.location,
    featuredImage: item.featuredImage,
    eventType: item.eventType,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Event-type colour map
// ---------------------------------------------------------------------------
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Conference: { bg: "#fef3c7", text: "#92400e" },
  Workshop:   { bg: "#d1fae5", text: "#065f46" },
  Seminar:    { bg: "#dbeafe", text: "#1e40af" },
  Training:   { bg: "#ede9fe", text: "#5b21b6" },
};
const TYPE_COLORS_AR: Record<string, string> = {
  Conference: "مؤتمر",
  Workshop: "ورشة عمل",
  Seminar: "ندوة",
  Training: "تدريب",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface UpcomingEventsSectionProps {
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export function UpcomingEventsSection({ config = {}, data = {} }: UpcomingEventsSectionProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [apiEvents, setApiEvents] = useState<Event[]>([]);
  const [loading, setLoading]     = useState(false);

  const manualItems = Array.isArray(data.items) ? (data.items as ManualEventItem[]) : [];
  const dataSource  = (config.dataSource as string) || "api";
  const useManual   = dataSource === "manual" || manualItems.length > 0;

  useEffect(() => {
    if (useManual) return;
    setLoading(true);
    getUpcomingEvents()
      .then((res) => { if (res.data.success) setApiEvents(res.data.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [useManual]);

  const count    = config.count ? Number(config.count) : 3;
  const allEvents: Event[] = useManual ? manualItems.map(manualToEvent) : apiEvents;
  const events   = allEvents.slice(0, count);

  const sectionTitle = isAr
    ? ((config.titleAr as string) || "الفعاليات القادمة")
    : ((config.titleEn as string) || "Upcoming Events");
  const sectionSubtitle = isAr
    ? ((config.subtitleAr as string) || "")
    : ((config.subtitleEn as string) || "");
  const viewAllLabel = isAr
    ? ((config.viewAllLabelAr as string) || (config.viewAllLabel as string) || "جميع الفعاليات")
    : ((config.viewAllLabelEn as string) || (config.viewAllLabel as string) || "View All Events");
  const viewAllUrl = (config.viewAllUrl as string) || "/events";

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="py-20 relative overflow-hidden" style={{ background: "var(--style-color-surface)" }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-9 w-36 bg-gray-100 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse shadow-sm">
                <div className="h-2.5 w-full" style={{ background: "var(--style-color-primary, #7a5c3c)", opacity: 0.15 }} />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-gray-200 rounded-full" />
                  <div className="h-5 bg-gray-200 rounded w-full" />
                  <div className="h-5 bg-gray-200 rounded w-4/5" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: "var(--style-color-surface)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[32rem] h-[32rem] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, var(--style-color-secondary, #3b6e47) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, var(--style-color-primary, #7a5c3c) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
        />
        {/* Diagonal line pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="diag-events" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="20" stroke="currentColor" strokeWidth="1.5" className="text-soil-clay" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag-events)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{
                  background: "color-mix(in srgb, var(--style-color-secondary, #3b6e47) 12%, transparent)",
                  color: "var(--style-color-secondary, #3b6e47)",
                }}
              >
                <CalendarDays className="h-3 w-3" />
                {isAr ? "الفعاليات" : "Events"}
              </span>
            </div>
            <h2
              className={`${almarai.className} text-3xl md:text-4xl font-extrabold leading-tight`}
              style={{ color: "var(--style-color-heading, var(--style-color-text, #1a1a1a))" }}
            >
              {sectionTitle}
            </h2>
            {sectionSubtitle && (
              <p className="mt-2 text-base opacity-60" style={{ color: "var(--style-color-text, #333)" }}>
                {sectionSubtitle}
              </p>
            )}
          </div>

          <Link
            href={viewAllUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-100 shrink-0"
            style={{
              background: "color-mix(in srgb, var(--style-color-secondary, #3b6e47) 10%, transparent)",
              color: "var(--style-color-secondary, #3b6e47)",
              border: "1px solid color-mix(in srgb, var(--style-color-secondary, #3b6e47) 22%, transparent)",
            }}
          >
            {isAr ? <ArrowLeft className="h-4 w-4" /> : null}
            {viewAllLabel}
            {!isAr ? <ArrowRight className="h-4 w-4" /> : null}
          </Link>
        </div>

        {/* ── Events grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {events.map((event) => {
            const eventDate = event.eventDate ? new Date(event.eventDate) : null;
            const eventTitle = isAr
              ? (event.titleAr || event.titleEn || "")
              : (event.titleEn || event.titleAr || "");
            const href = event.slug ? `/events/${event.slug}` : "/events";
            const typeColors = event.eventType ? TYPE_COLORS[event.eventType] : null;
            const typeLabel = event.eventType
              ? (isAr ? (TYPE_COLORS_AR[event.eventType] || event.eventType) : event.eventType)
              : null;

            const monthLabel = eventDate?.toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short" });
            const dayLabel = eventDate?.toLocaleDateString(isAr ? "ar-SA" : "en-US", { day: "numeric" });

            return (
              <Link
                key={event.id}
                href={href}
                className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-2xl"
              >
                <article
                  className="h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                  style={{
                    background: "var(--style-color-card-bg, #ffffff)",
                    border: "1px solid color-mix(in srgb, var(--style-color-border, #e5e7eb) 70%, transparent)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    className="h-1 w-full"
                    style={{ background: "var(--style-color-secondary, #3b6e47)" }}
                  />

                  <div className="flex flex-col flex-1 p-5">
                    {/* Date badge + type pill */}
                    <div className={`flex items-start justify-between gap-3 mb-4`}>
                      {/* Date block */}
                      {eventDate && (
                        <div
                          className="flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[52px] text-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                          style={{
                            background: "color-mix(in srgb, var(--style-color-secondary, #3b6e47) 10%, var(--style-color-surface, #f9fafb))",
                            border: "1px solid color-mix(in srgb, var(--style-color-secondary, #3b6e47) 20%, transparent)",
                          }}
                        >
                          <span
                            className="text-xl font-black leading-none"
                            style={{ color: "var(--style-color-secondary, #3b6e47)" }}
                          >
                            {dayLabel}
                          </span>
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
                            style={{ color: "color-mix(in srgb, var(--style-color-secondary, #3b6e47) 70%, transparent)" }}
                          >
                            {monthLabel}
                          </span>
                        </div>
                      )}

                      {/* Event type pill */}
                      {typeLabel && (
                        <span
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold mt-1 shrink-0"
                          style={typeColors
                            ? { background: typeColors.bg, color: typeColors.text }
                            : { background: "color-mix(in srgb, var(--style-color-secondary, #3b6e47) 12%, transparent)", color: "var(--style-color-secondary, #3b6e47)" }
                          }
                        >
                          {typeLabel}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className={`${almarai.className} font-bold text-base leading-snug line-clamp-2 mb-2 transition-colors duration-200 group-hover:opacity-80`}
                      style={{ color: "var(--style-color-heading, var(--style-color-text, #1a1a1a))" }}
                    >
                      {eventTitle}
                    </h3>

                    {/* Description */}
                    {event.description && (
                      <p
                        className="text-sm line-clamp-3 leading-relaxed mb-4 flex-1"
                        style={{ color: "var(--style-color-muted, #666)" }}
                      >
                        {event.description}
                      </p>
                    )}

                    {/* Location */}
                    {event.location && (
                      <div
                        className="flex items-center gap-1.5 text-xs mt-auto"
                        style={{ color: "var(--style-color-muted, #888)" }}
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}

                    {/* Full date row */}
                    {eventDate && (
                      <div
                        className="flex items-center gap-1.5 text-xs mt-2"
                        style={{ color: "var(--style-color-muted, #888)" }}
                      >
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {eventDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    )}
                  </div>

                  {/* Read More row */}
                  <div
                    className="px-5 pb-4 flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 group-hover:gap-2.5"
                    style={{ color: "var(--style-color-secondary, #3b6e47)" }}
                  >
                    {isAr ? <ArrowLeft className="h-3.5 w-3.5 shrink-0" /> : null}
                    {isAr ? "عرض التفاصيل" : "View Details"}
                    {!isAr ? <ArrowRight className="h-3.5 w-3.5 shrink-0" /> : null}
                  </div>

                  {/* Bottom slide bar */}
                  <div
                    className="h-0.5 w-0 group-hover:w-full transition-all duration-500 ease-out"
                    style={{ background: "var(--style-color-secondary, #3b6e47)" }}
                  />
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
