"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getPublishedEvents, getEventsByMonth } from "@/lib/events";
import type { Event } from "@/types";
import { ParticleField } from "@/components/ui/particle-field";
import { PageHero } from "@/components/ui/page-hero";
import {
  Calendar,
  MapPin,
  Clock,
  List,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { almarai } from "@/lib/fonts";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------
const EVENT_TYPES = ["All", "Conference", "Workshop", "Seminar", "Training"] as const;
const EVENT_TYPES_AR: Record<string, string> = {
  All: "الكل",
  Conference: "مؤتمر",
  Workshop: "ورشة عمل",
  Seminar: "ندوة",
  Training: "تدريب",
};

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Conference: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  Workshop:   { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  Seminar:    { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  Training:   { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
};

const DAYS_EN  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_AR  = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

type ViewMode = "list" | "calendar";

interface Props {
  initialEvents: Event[];
  initialTotalPages: number;
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function EventsPageClient({ initialEvents, initialTotalPages }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [viewMode, setViewMode]     = useState<ViewMode>("list");
  const [events, setEvents]         = useState<Event[]>(initialEvents);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(false);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const [calendarYear, setCalendarYear]   = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchEvents = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(false);
    try {
      const res = await getPublishedEvents(pageNum, 12);
      if (res.data.success) {
        setEvents(res.data.data.content);
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
    if (page > 0 && viewMode === "list") fetchEvents(page);
  }, [page, fetchEvents, viewMode]);

  const fetchCalendarEvents = useCallback(async (year: number, month: number) => {
    setCalendarLoading(true);
    try {
      const res = await getEventsByMonth(year, month + 1);
      if (res.data.success) setCalendarEvents(res.data.data);
    } catch {
      // silent
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === "calendar") fetchCalendarEvents(calendarYear, calendarMonth);
  }, [viewMode, calendarYear, calendarMonth, fetchCalendarEvents]);

  const filteredEvents = activeFilter === "All"
    ? events
    : events.filter((e) => e.eventType === activeFilter);

  // Calendar helpers
  const daysInMonth    = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const dayHasEvent = (day: number) =>
    calendarEvents.some((ev) => {
      const d = new Date(ev.eventDate);
      return d.getDate() === day && d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
    });

  const selectedDayEvents = selectedDay
    ? calendarEvents.filter((ev) => {
        const d = new Date(ev.eventDate);
        return d.getDate() === selectedDay && d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
      })
    : [];

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarYear((y) => y - 1); setCalendarMonth(11); }
    else setCalendarMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarYear((y) => y + 1); setCalendarMonth(0); }
    else setCalendarMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const calendarTitle = new Date(calendarYear, calendarMonth).toLocaleDateString(
    isAr ? "ar-SA" : "en-US",
    { month: "long", year: "numeric" },
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <PageHero
        slug="events"
        defaultTitle={isAr ? "الفعاليات" : "Events"}
        defaultSubtitleAr="الفعاليات"
        defaultDescription={
          isAr
            ? "اكتشف المؤتمرات وورش العمل والندوات والبرامج التدريبية التي تنظمها جمعية علوم التربة السورية"
            : "Discover conferences, workshops, seminars, and training programs organized by SSSS."
        }
      >
        <ParticleField count={15} color="215, 204, 200" speed={0.2} />
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path d="M0,150 C200,50 400,250 600,150 C800,50 1000,200 1000,150 L1000,300 L0,300 Z" fill="#D7CCC8" />
            <path d="M0,200 C300,100 500,300 800,200 C900,150 1000,250 1000,200 L1000,300 L0,300 Z" fill="#8D6E63" opacity="0.5" />
          </svg>
        </div>
      </PageHero>

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <section className="sticky top-0 z-20 border-b" style={{ background: "var(--style-color-bg, #fff)", borderColor: "var(--style-color-border, #e5e7eb)" }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Type filters */}
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => {
                const active = activeFilter === type;
                const tc = TYPE_COLORS[type as keyof typeof TYPE_COLORS];
                const label = isAr ? EVENT_TYPES_AR[type] : type;
                return (
                  <button
                    key={type}
                    onClick={() => { setActiveFilter(type); setPage(0); }}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 border"
                    style={active
                      ? { background: "var(--style-color-primary, #7a5c3c)", color: "#fff", borderColor: "transparent" }
                      : tc
                        ? { background: tc.bg, color: tc.text, borderColor: tc.border }
                        : { background: "transparent", color: "var(--style-color-muted, #666)", borderColor: "var(--style-color-border, #e5e7eb)" }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* View toggle */}
            <div
              className="flex gap-1 rounded-xl p-1 shrink-0"
              style={{ background: "var(--style-color-surface, #f4f4f4)" }}
            >
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={viewMode === "list"
                  ? { background: "var(--style-color-primary, #7a5c3c)", color: "#fff" }
                  : { color: "var(--style-color-muted, #888)" }
                }
              >
                <List className="h-4 w-4" />
                {isAr ? "قائمة" : "List"}
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={viewMode === "calendar"
                  ? { background: "var(--style-color-primary, #7a5c3c)", color: "#fff" }
                  : { color: "var(--style-color-muted, #888)" }
                }
              >
                <Calendar className="h-4 w-4" />
                {isAr ? "تقويم" : "Calendar"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16" style={{ background: "var(--style-color-bg, #fff)" }}>
        <div className="container mx-auto px-4">

          {viewMode === "list" ? (
            <>
              {loading && <ListSkeleton />}
              {error && <ErrorState onRetry={() => fetchEvents(page)} isAr={isAr} />}
              {!loading && !error && filteredEvents.length === 0 && <EmptyState isAr={isAr} />}
              {!loading && !error && filteredEvents.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} isAr={isAr} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-12">
                      <button
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ borderColor: "var(--style-color-border, #e5e7eb)", color: "var(--style-color-text, #333)" }}
                      >
                        {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                        {isAr ? "السابق" : "Previous"}
                      </button>
                      <span
                        className="px-4 py-2 rounded-full text-sm font-semibold"
                        style={{ background: "var(--style-color-surface, #f4f4f4)", color: "var(--style-color-text, #333)" }}
                      >
                        {isAr
                          ? `${page + 1} / ${totalPages}`
                          : `Page ${page + 1} of ${totalPages}`}
                      </span>
                      <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ borderColor: "var(--style-color-border, #e5e7eb)", color: "var(--style-color-text, #333)" }}
                      >
                        {isAr ? "التالي" : "Next"}
                        {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* ── Calendar view ─────────────────────────────────────────── */
            <div>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--style-color-border, #e5e7eb)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                {/* Calendar header */}
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ background: "var(--style-color-primary, #7a5c3c)", color: "#fff" }}
                >
                  <button
                    onClick={isAr ? nextMonth : prevMonth}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h3 className={`${almarai.className} font-bold text-lg`}>{calendarTitle}</h3>
                  <button
                    onClick={isAr ? prevMonth : nextMonth}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--style-color-border, #e5e7eb)" }}>
                  {(isAr ? DAYS_AR : DAYS_EN).map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold py-3"
                      style={{ color: "var(--style-color-muted, #888)", background: "var(--style-color-surface, #f9fafb)" }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, idx) => {
                    const hasEvent = day !== null && dayHasEvent(day);
                    const isSelected = day === selectedDay;
                    const isToday =
                      day !== null &&
                      day === new Date().getDate() &&
                      calendarMonth === new Date().getMonth() &&
                      calendarYear === new Date().getFullYear();

                    return (
                      <div
                        key={idx}
                        className="min-h-[72px] p-2 border-b border-r cursor-pointer transition-colors"
                        style={{
                          borderColor: "var(--style-color-border, #f0f0f0)",
                          background: day === null
                            ? "var(--style-color-surface, #fafafa)"
                            : isSelected
                              ? "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 12%, white)"
                              : "var(--style-color-bg, #fff)",
                        }}
                        onClick={() => day !== null && setSelectedDay(day === selectedDay ? null : day)}
                      >
                        {day !== null && (
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-all"
                              style={isToday
                                ? { background: "var(--style-color-primary, #7a5c3c)", color: "#fff" }
                                : isSelected
                                  ? { color: "var(--style-color-primary, #7a5c3c)", fontWeight: 700 }
                                  : { color: "var(--style-color-text, #333)" }
                              }
                            >
                              {isAr ? day.toLocaleString("ar-SA") : day}
                            </span>
                            {hasEvent && (
                              <div className="flex gap-0.5">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: "var(--style-color-secondary, #3b6e47)" }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected day events */}
              {calendarLoading && (
                <div className="text-center py-10">
                  <div className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--style-color-muted, #888)" }}>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {isAr ? "جارٍ التحميل..." : "Loading events..."}
                  </div>
                </div>
              )}
              {!calendarLoading && selectedDay && selectedDayEvents.length === 0 && (
                <div className="text-center py-10">
                  <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--style-color-muted, #999)" }} />
                  <p className="text-sm" style={{ color: "var(--style-color-muted, #888)" }}>
                    {isAr ? "لا توجد فعاليات في هذا اليوم." : "No events on this day."}
                  </p>
                </div>
              )}
              {!calendarLoading && selectedDay && selectedDayEvents.length > 0 && (
                <div className="mt-8">
                  <h4 className={`${almarai.className} font-bold text-lg mb-5`} style={{ color: "var(--style-color-heading, #1a1a1a)" }}>
                    {isAr
                      ? `فعاليات يوم ${new Date(calendarYear, calendarMonth, selectedDay).toLocaleDateString("ar-SA", { month: "long", day: "numeric", year: "numeric" })}`
                      : `Events on ${new Date(calendarYear, calendarMonth, selectedDay).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    }
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {selectedDayEvents.map((event) => (
                      <EventCard key={event.id} event={event} isAr={isAr} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EventCard
// ---------------------------------------------------------------------------
function EventCard({ event, isAr }: { event: Event; isAr: boolean }) {
  const eventDate  = new Date(event.eventDate);
  const title = isAr
    ? (event.titleAr || event.titleEn || "")
    : (event.titleEn || event.titleAr || "");
  const tc = event.eventType ? TYPE_COLORS[event.eventType] : null;
  const typeLabel = event.eventType
    ? (isAr ? (TYPE_COLORS_AR_MAP[event.eventType] || event.eventType) : event.eventType)
    : null;

  const dayNum   = eventDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", { day: "numeric" });
  const monthStr = eventDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short" });
  const isOnline = event.isOnline;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-2xl block h-full"
    >
      <article
        className="h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{
          background: "var(--style-color-card-bg, #fff)",
          border: "1px solid color-mix(in srgb, var(--style-color-border, #e5e7eb) 70%, transparent)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {/* Top accent bar (full-width) */}
        <div
          className="h-1 w-full"
          style={{ background: tc ? tc.border : "var(--style-color-primary, #7a5c3c)" }}
        />

        <div className="flex flex-1 gap-0">
          {/* Date column */}
          <div
            className="flex flex-col items-center justify-start pt-5 px-4 pb-4 min-w-[68px] shrink-0"
            style={{ background: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 7%, var(--style-color-surface, #fafafa))" }}
          >
            <span
              className="text-2xl font-black leading-none transition-transform duration-300 group-hover:scale-110"
              style={{ color: "var(--style-color-primary, #7a5c3c)" }}
            >
              {dayNum}
            </span>
            <span
              className="text-[11px] font-bold uppercase tracking-wider mt-0.5"
              style={{ color: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 65%, transparent)" }}
            >
              {monthStr}
            </span>
            {isOnline && (
              <div className="mt-3" title={isAr ? "عبر الإنترنت" : "Online"}>
                <Wifi className="h-4 w-4" style={{ color: "var(--style-color-secondary, #3b6e47)" }} />
              </div>
            )}
          </div>

          {/* Content column */}
          <div className="flex flex-col flex-1 p-4">
            {/* Type badge */}
            {typeLabel && (
              <span
                className="self-start mb-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                style={tc
                  ? { background: tc.bg, color: tc.text }
                  : { background: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 10%, transparent)", color: "var(--style-color-primary, #7a5c3c)" }
                }
              >
                {typeLabel}
              </span>
            )}

            {/* Title */}
            <h3
              className={`${almarai.className} font-bold text-sm leading-snug line-clamp-2 mb-2 transition-opacity duration-200 group-hover:opacity-70`}
              style={{ color: "var(--style-color-heading, var(--style-color-text, #1a1a1a))" }}
            >
              {title}
            </h3>

            {/* Description */}
            {event.description && (
              <p
                className="text-xs line-clamp-2 mb-3 leading-relaxed flex-1"
                style={{ color: "var(--style-color-muted, #666)" }}
              >
                {event.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-col gap-1 mt-auto">
              {event.location && (
                <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--style-color-muted, #888)" }}>
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}
              {event.endDate && (
                <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--style-color-muted, #888)" }}>
                  <Clock className="h-3 w-3 shrink-0" />
                  {new Date(event.endDate).toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short", day: "numeric" })}
                </div>
              )}
            </div>

            {/* Read more */}
            <div
              className="flex items-center gap-1 text-[11px] font-semibold mt-3 transition-all duration-200 group-hover:gap-2"
              style={{ color: "var(--style-color-primary, #7a5c3c)" }}
            >
              {isAr ? <ArrowLeft className="h-3 w-3 shrink-0" /> : null}
              {isAr ? "عرض التفاصيل" : "View Details"}
              {!isAr ? <ArrowRight className="h-3 w-3 shrink-0" /> : null}
            </div>
          </div>
        </div>

        {/* Bottom slide bar */}
        <div
          className="h-0.5 w-0 group-hover:w-full transition-all duration-500 ease-out"
          style={{ background: tc ? tc.border : "var(--style-color-primary, #7a5c3c)" }}
        />
      </article>
    </Link>
  );
}

// Arabic event type lookup used in EventCard (file-level scope needed)
const TYPE_COLORS_AR_MAP: Record<string, string> = {
  Conference: "مؤتمر",
  Workshop: "ورشة عمل",
  Seminar: "ندوة",
  Training: "تدريب",
};

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden animate-pulse"
          style={{ border: "1px solid var(--style-color-border, #e5e7eb)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="h-1 w-full bg-gray-200" />
          <div className="flex">
            <div className="w-[68px] shrink-0 bg-gray-100 py-6 px-4 space-y-2">
              <div className="h-6 w-8 bg-gray-200 rounded mx-auto" />
              <div className="h-2 w-7 bg-gray-200 rounded mx-auto" />
            </div>
            <div className="flex-1 p-4 space-y-3">
              <div className="h-3 w-16 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error / Empty states
// ---------------------------------------------------------------------------
function ErrorState({ onRetry, isAr }: { onRetry: () => void; isAr: boolean }) {
  return (
    <div className="text-center py-20">
      <AlertCircle className="h-14 w-14 mx-auto mb-4 opacity-40" style={{ color: "var(--style-color-muted, #999)" }} />
      <p className="text-base mb-5" style={{ color: "var(--style-color-muted, #888)" }}>
        {isAr ? "فشل تحميل الفعاليات. يرجى المحاولة مرة أخرى." : "Failed to load events. Please try again later."}
      </p>
      <Button
        variant="default"
        onClick={onRetry}
        style={{ background: "var(--style-color-primary, #7a5c3c)", color: "#fff" }}
      >
        {isAr ? "إعادة المحاولة" : "Retry"}
      </Button>
    </div>
  );
}

function EmptyState({ isAr }: { isAr: boolean }) {
  return (
    <div className="text-center py-20">
      <CalendarDays className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: "var(--style-color-muted, #999)" }} />
      <p className="text-base" style={{ color: "var(--style-color-muted, #888)" }}>
        {isAr ? "لا توجد فعاليات حالياً." : "No events found."}
      </p>
    </div>
  );
}
