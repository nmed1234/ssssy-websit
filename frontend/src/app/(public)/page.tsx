"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { StyleCard, StyleCardContent } from "@/components/ui/style-card";
import { getPublishedContent } from "@/lib/public-content";
import { getUpcomingEvents } from "@/lib/events";
import { getPublicSiteSections } from "@/lib/site-sections";
import { getPublicBoardMembers } from "@/lib/board-members";
import type { BoardMember, ContentItem, Event, SiteSection } from "@/types";
import { BookOpen, MapPin } from "lucide-react";
import { staggerContainer, listItem } from "@/lib/animation-variants";
import { TiltCard } from "@/components/ui/tilt-card";
import { TextReveal } from "@/components/ui/text-reveal";
import { useLanguage } from "@/lib/language-context";

// Shared section components — also used by the admin Section Builder preview pane
import {
  HeroSection,
  HeroCarouselSection,
  OurFocusAreasSection,
  JoinOurCommunitySection,
  TestimonialsSection,
  StatisticsSection,
  NewsletterSection,
  ContactFormSection,
  PublicationsCarouselSection,
} from "@/components/sections";

export default function HomePage() {
  const [news, setNews] = useState<ContentItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const [eventsError, setEventsError] = useState(false);

  const [homepageSections, setHomepageSections] = useState<SiteSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);

  useEffect(() => {
    getPublishedContent({ contentType: "NEWS", size: 3 })
      .then((res) => {
        if (res.data.success) setNews(res.data.data.content);
      })
      .catch(() => setNewsError(true))
      .finally(() => setNewsLoading(false));
  }, []);

  useEffect(() => {
    getUpcomingEvents()
      .then((res) => {
        if (res.data.success) setEvents(res.data.data);
      })
      .catch(() => setEventsError(true))
      .finally(() => setEventsLoading(false));
  }, []);

  useEffect(() => {
    getPublicSiteSections("homepage")
      .then((res) => {
        if (res.data.success) setHomepageSections(res.data.data);
      })
      .catch(() => {})
      .finally(() => setSectionsLoading(false));
  }, []);

  useEffect(() => {
    getPublicBoardMembers()
      .then((res) => {
        if (res.data.success) setBoardMembers(res.data.data);
      })
      .catch(() => {});
  }, []);

  function sectionConfig(s: SiteSection): Record<string, unknown> {
    return typeof s.config === "string" ? JSON.parse(s.config as string) : (s.config || {});
  }
  function sectionData(s: SiteSection): Record<string, unknown> {
    return typeof s.data === "string" ? JSON.parse(s.data as string) : (s.data || {});
  }

  // Always render from DB sections. Each section component returns null when its
  // data/config fields are empty, so no hardcoded fallbacks are needed.
  return (
    <div>
      {sectionsLoading ? null : homepageSections.map((s) => {
        if (s.componentType === "hero-carousel") {
          return <HeroCarouselSection key={s.id} config={sectionConfig(s)} />;
        }
        if (s.componentType === "hero" || s.slug === "hero-banner") {
          return <HeroSection key={s.id} config={sectionConfig(s)} />;
        }
        if (s.componentType === "card-group") {
          return <OurFocusAreasSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        }
        if (s.componentType === "cta") {
          return <JoinOurCommunitySection key={s.id} config={sectionConfig(s)} />;
        }
        if (s.componentType === "latest-news-feed") {
          return <LatestNewsSection key={s.id} items={news} loading={newsLoading} error={newsError} />;
        }
        if (s.componentType === "upcoming-events-feed") {
          return <UpcomingEventsSection key={s.id} items={events} loading={eventsLoading} error={eventsError} />;
        }
        if (s.componentType === "stats" || s.componentType === "counter") {
          return <StatisticsSection key={s.id} data={sectionData(s)} config={sectionConfig(s)} />;
        }
        if (s.componentType === "testimonial" || s.componentType === "testimonials") {
          return <TestimonialsSection key={s.id} data={sectionData(s)} config={sectionConfig(s)} boardMembers={boardMembers} />;
        }
        if (s.componentType === "newsletter") {
          return <NewsletterSection key={s.id} config={sectionConfig(s)} />;
        }
        if (s.componentType === "contact-form") {
          return <ContactFormSection key={s.id} config={sectionConfig(s)} />;
        }
        if (s.componentType === "publications-carousel") {
          return <PublicationsCarouselSection key={s.id} config={sectionConfig(s)} />;
        }
        return null;
      })}
      {/* Latest News and Upcoming Events are always shown — they pull live API data */}
      {!sectionsLoading && !homepageSections.some((s) => s.componentType === "latest-news-feed") && (
        <LatestNewsSection items={news} loading={newsLoading} error={newsError} />
      )}
      {!sectionsLoading && !homepageSections.some((s) => s.componentType === "upcoming-events-feed") && (
        <UpcomingEventsSection items={events} loading={eventsLoading} error={eventsError} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LatestNewsSection — feeds live content data (stays in homepage, not shared)
// ---------------------------------------------------------------------------

function LatestNewsSection({
  items,
  loading,
  error,
}: {
  items: ContentItem[];
  loading: boolean;
  error: boolean;
}) {
  const { language } = useLanguage();
  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <TextReveal
            as="h2"
            className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-soil-dark`}
          >
            {language === "ar" ? "أحدث الأخبار" : "Latest News"}
          </TextReveal>
          <Link href="/news" className="text-soil-clay hover:text-soil-dark font-medium fluid-sm transition-colors">
            {language === "ar" ? "جميع الأخبار ←" : "View All News →"}
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <StyleCard key={i} noHover>
                <div className="h-48 bg-muted rounded-t-lg animate-shimmer" />
                <StyleCardContent className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3 animate-shimmer" />
                  <div className="h-6 bg-muted rounded w-full animate-shimmer" />
                  <div className="h-4 bg-muted rounded w-2/3 animate-shimmer" />
                </StyleCardContent>
              </StyleCard>
            ))}
          </div>
        )}
        {error && <div className="text-center py-12"><p className="text-earth-gray">{language === "ar" ? "فشل تحميل الأخبار." : "Failed to load news. Please try again later."}</p></div>}
        {!loading && !error && items.length === 0 && <div className="text-center py-12"><p className="text-earth-gray">{language === "ar" ? "لا توجد مقالات بعد." : "No news articles available yet."}</p></div>}

        {!loading && !error && items.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={listItem}>
                <TiltCard>
                  <Link href={`/news/${item.slug}`}>
                    <StyleCard className="h-full cursor-pointer">
                      <div className="h-48 bg-soil-sand/50 flex items-center justify-center rounded-t-lg overflow-hidden">
                        {item.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.featuredImage}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover rounded-t-lg hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <BookOpen className="h-12 w-12 text-soil-clay/40" />
                        )}
                      </div>
                      <StyleCardContent>
                        <p className="text-xs text-soil-clay font-medium mb-2">
                          {item.publishedAt
                            ? new Date(item.publishedAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                                year: "numeric", month: "long", day: "numeric",
                              })
                            : ""}
                        </p>
                        <h3 className="font-heading font-semibold text-soil-dark mb-2 line-clamp-2">
                          {language === "ar" ? (item.titleAr || item.titleEn) : (item.titleEn || item.titleAr)}
                        </h3>
                        <p className="fluid-sm text-earth-gray line-clamp-2">{item.excerpt}</p>
                      </StyleCardContent>
                    </StyleCard>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// UpcomingEventsSection — feeds live events data (stays in homepage, not shared)
// ---------------------------------------------------------------------------

function UpcomingEventsSection({
  items,
  loading,
  error,
}: {
  items: Event[];
  loading: boolean;
  error: boolean;
}) {
  const { language } = useLanguage();
  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <TextReveal
            as="h2"
            className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-soil-dark`}
          >
            {language === "ar" ? "الفعاليات القادمة" : "Upcoming Events"}
          </TextReveal>
          <Link href="/events" className="text-soil-clay hover:text-soil-dark font-medium fluid-sm transition-colors">
            {language === "ar" ? "جميع الفعاليات ←" : "View All Events →"}
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <StyleCard key={i} noHover>
                <StyleCardContent className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4 animate-shimmer" />
                  <div className="h-6 bg-muted rounded w-3/4 animate-shimmer" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-shimmer" />
                </StyleCardContent>
              </StyleCard>
            ))}
          </div>
        )}
        {error && <div className="text-center py-12"><p className="text-earth-gray">{language === "ar" ? "فشل تحميل الفعاليات." : "Failed to load events. Please try again later."}</p></div>}
        {!loading && !error && items.length === 0 && <div className="text-center py-12"><p className="text-earth-gray">{language === "ar" ? "لا توجد فعاليات قادمة." : "No upcoming events scheduled."}</p></div>}

        {!loading && !error && items.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {items.map((event) => {
              const eventDate = new Date(event.eventDate);
              return (
                <motion.div key={event.id} variants={listItem}>
                  <TiltCard tiltDegree={6}>
                    <Link href={`/events/${event.slug}`}>
                      <StyleCard className="h-full cursor-pointer border-l-4 border-l-forest hover:border-l-forest-light">
                        <StyleCardContent>
                          <p className="fluid-sm font-semibold text-forest mb-2">
                            {eventDate.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </p>
                          <h3 className="font-heading font-semibold text-soil-dark mb-2 line-clamp-2">
                            {language === "ar" ? (event.titleAr || event.titleEn) : (event.titleEn || event.titleAr)}
                          </h3>
                          {event.description && (
                            <p className="fluid-sm text-earth-gray line-clamp-3 mb-3">{event.description}</p>
                          )}
                          {event.location && (
                            <p className="flex items-center gap-1 text-xs text-soil-clay">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              {event.location}
                            </p>
                          )}
                        </StyleCardContent>
                      </StyleCard>
                    </Link>
                  </TiltCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
