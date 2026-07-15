"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { almarai } from "@/lib/fonts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPublishedEvents, getEventsByMonth } from "@/lib/events";
import type { Event } from "@/types";
import { ParticleField } from "@/components/ui/particle-field";
import { PageHero } from "@/components/ui/page-hero";
import { Calendar, MapPin, Clock, List, ChevronLeft, ChevronRight } from "lucide-react";


const EVENT_TYPES = ["All", "Conference", "Workshop", "Seminar", "Training"] as const;
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ViewMode = "list" | "calendar";

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getPublishedEvents(page, 12);
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
  }, [page]);

  useEffect(() => {
    if (viewMode === "list") {
      fetchEvents();
    }
  }, [fetchEvents, viewMode]);

  const fetchCalendarEvents = useCallback(async (year: number, month: number) => {
    setCalendarLoading(true);
    try {
      const res = await getEventsByMonth(year, month + 1);
      if (res.data.success) {
        setCalendarEvents(res.data.data);
      }
    } catch {
      // silent
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === "calendar") {
      fetchCalendarEvents(calendarYear, calendarMonth);
    }
  }, [viewMode, calendarYear, calendarMonth, fetchCalendarEvents]);

  const filteredEvents = activeFilter === "All"
    ? events
    : events.filter((e) => e.eventType === activeFilter);

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

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
    if (calendarMonth === 0) {
      setCalendarYear((y) => y - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear((y) => y + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  return (
    <div>
      <PageHero
        slug="events"
        defaultTitle="Events"
        defaultSubtitleAr="الفعاليات"
        defaultDescription="Discover conferences, workshops, seminars, and training programs organized by SSSS."
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

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={activeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveFilter(type);
                    setPage(0);
                  }}
                  className={activeFilter === type ? "" : "border-soil-sand text-earth-gray hover:bg-soil-sand/20"}
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="flex gap-1 bg-soil-sand/30 rounded-lg p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "" : "text-earth-gray"}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className={viewMode === "calendar" ? "" : "text-earth-gray"}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </Button>
            </div>
          </div>

          {viewMode === "list" ? (
            <>
              {loading && <ListSkeleton />}
              {error && <ErrorState />}
              {!loading && !error && filteredEvents.length === 0 && <EmptyState />}
              {!loading && !error && filteredEvents.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 @container">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                      >
                        Previous
                      </Button>
                      <span className="fluid-sm text-earth-gray px-3">
                        Page {page + 1} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div>
              <div className="bg-white rounded-lg border border-soil-sand/50 overflow-hidden">
                <div className="flex items-center justify-between bg-soil-dark text-white px-6 py-3">
                  <button onClick={prevMonth} className="p-1 hover:text-soil-sand transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h3 className="font-semibold">
                    {new Date(calendarYear, calendarMonth).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <button onClick={nextMonth} className="p-1 hover:text-soil-sand transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-7">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-earth-gray py-3 border-b border-soil-sand/30">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, idx) => (
                    <div
                      key={idx}
                      className={`min-h-[80px] p-2 border-b border-r border-soil-sand/30 cursor-pointer transition-colors ${
                        day === null
                          ? "bg-gray-50"
                          : selectedDay === day
                          ? "bg-soil-sand/40"
                          : "hover:bg-soil-sand/20"
                      }`}
                      onClick={() => day !== null && setSelectedDay(day === selectedDay ? null : day)}
                    >
                      {day !== null && (
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-sm font-medium ${
                              selectedDay === day ? "text-soil-dark" : "text-earth-gray"
                            }`}
                          >
                            {day}
                          </span>
                          {dayHasEvent(day) && (
                            <div className="flex gap-0.5 mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {calendarLoading && (
                <div className="text-center py-8">
                  <p className="text-earth-gray">Loading events...</p>
                </div>
              )}

              {!calendarLoading && selectedDay && selectedDayEvents.length === 0 && (
                <div className="text-center py-8 text-earth-gray fluid-sm">
                  No events on this day.
                </div>
              )}

              {!calendarLoading && selectedDay && selectedDayEvents.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-soil-dark">
                    Events on {new Date(calendarYear, calendarMonth, selectedDay).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 @container">
                    {selectedDayEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
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

function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.eventDate);
  return (
    <Card className="h-full hover:shadow-md transition-shadow border-soil-sand/50">
      <CardContent className="p-0">
        <div className="flex">
          <div className="flex flex-col items-center justify-center bg-soil-dark text-white min-w-[80px] p-4 rounded-l-lg">
            <span className="text-2xl font-bold leading-none">{eventDate.getDate()}</span>
            <span className="text-xs uppercase mt-1 text-soil-sand">
              {eventDate.toLocaleDateString("en-US", { month: "short" })}
            </span>
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-soil-dark line-clamp-2">
                {event.titleEn || event.titleAr}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-earth-gray">
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
              {event.endDate && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
            {event.eventType && (
              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-forest/10 text-forest">
                {event.eventType}
              </span>
            )}
            {event.description && (
              <p className="fluid-sm text-earth-gray mt-2 line-clamp-2">{event.description}</p>
            )}
            <Link
              href={`/events/${event.slug}`}
              className="inline-block mt-3 fluid-sm font-medium text-soil-clay hover:text-soil-dark transition-colors"
            >
              View Details &rarr;
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 @container">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse border-soil-sand/50">
          <CardContent className="p-0">
            <div className="flex">
              <div className="w-[80px] h-full bg-soil-sand/50 rounded-l-lg p-4" />
              <div className="flex-1 p-4 space-y-3">
                <div className="h-5 bg-soil-sand/50 rounded w-3/4" />
                <div className="h-3 bg-soil-sand/50 rounded w-1/2" />
                <div className="h-3 bg-soil-sand/50 rounded w-1/3" />
                <div className="h-3 bg-soil-sand/50 rounded w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="text-center py-16">
      <p className="text-earth-gray fluid-lg">Failed to load events. Please try again later.</p>
      <Button
        variant="default"
        className="mt-4"
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <Calendar className="h-16 w-16 text-soil-sand mx-auto mb-4" />
      <p className="text-earth-gray fluid-lg">No events found.</p>
      <p className="text-earth-gray fluid-sm mt-1">Check back later for upcoming events.</p>
    </div>
  );
}
