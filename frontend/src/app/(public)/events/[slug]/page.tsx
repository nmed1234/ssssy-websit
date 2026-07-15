"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEventBySlug } from "@/lib/events";
import type { Event } from "@/types";
import { ParticleField } from "@/components/ui/particle-field";
import { TextReveal } from "@/components/ui/text-reveal";
import { Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (params.slug) {
      getEventBySlug(params.slug as string)
        .then((res) => {
          if (res.data.success) setEvent(res.data.data);
          else setError(true);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-soil-sand/50 rounded w-1/3" />
          <div className="h-4 bg-soil-sand/50 rounded w-1/4" />
          <div className="h-64 bg-soil-sand/50 rounded" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-earth-gray text-lg">Event not found.</p>
        <Link href="/events" className="text-soil-clay hover:underline mt-4 inline-block">Back to Events</Link>
      </div>
    );
  }

  const eventDate = new Date(event.eventDate);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white overflow-hidden animate-gradient">
        <ParticleField count={15} color="215, 204, 200" speed={0.2} />
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="container mx-auto px-4 py-16 md:py-20">
          <Link href="/events" className="inline-flex items-center gap-2 text-soil-sand hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>
          <p className="text-soil-sand fluid-lg font-medium mb-2">
            {eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          <TextReveal as="h1" className="fluid-4xl md:fluid-5xl font-bold font-heading">{event.titleEn || event.titleAr || ""}</TextReveal>
          {event.eventType && (
            <span className="inline-block mt-4 px-3 py-1 text-sm font-medium rounded-full bg-white/20 text-white">
              {event.eventType}
            </span>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 @container">
            <div className="md:col-span-2">
              {event.featuredImage && (
                <div className="w-full h-64 bg-soil-sand/30 rounded-lg mb-8 flex items-center justify-center text-earth-gray">
                  <Calendar className="h-8 w-8" />
                </div>
              )}
              <div className="prose max-w-none">
                <p className="text-earth-gray leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-soil-sand/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-soil-dark">Event Details</h3>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-soil-clay mt-0.5" />
                    <div>
                      <p className="fluid-sm font-medium text-soil-dark">Date</p>
                      <p className="fluid-sm text-earth-gray">
                        {eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                      </p>
                      {event.endDate && (
                        <p className="fluid-sm text-earth-gray">
                          to {new Date(event.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-soil-clay mt-0.5" />
                      <div>
                        <p className="fluid-sm font-medium text-soil-dark">Location</p>
                        <p className="fluid-sm text-earth-gray">{event.location}</p>
                      </div>
                    </div>
                  )}
                  {event.organizer && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-soil-clay mt-0.5" />
                      <div>
                        <p className="fluid-sm font-medium text-soil-dark">Organizer</p>
                        <p className="fluid-sm text-earth-gray">{event.organizer}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
