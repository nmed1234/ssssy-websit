"use client";

/**
 * SectionBuilderPanel — Advanced Section Builder
 *
 * Single-pane smart field editor with:
 *   - All fields (data + config + styling) merged into one scrollable list
 *   - Semantic field groups (collapsible accordion sections)
 *   - Live scaled preview with AR/EN language toggle that actually works
 *   - Unsaved changes indicator
 *   - Save Draft + Save & Publish in footer
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Eye,
  Monitor,
  Smartphone,
  Globe,
  AlertCircle,
  CheckCircle,
  Layers,
  Palette,
  Settings2,
  Layout,
  Type,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSchema } from "@/lib/section-field-schemas";
import { SectionFieldRenderer } from "@/components/admin/SectionFieldRenderer";
import { updateSiteSection, publishSiteSection } from "@/lib/site-sections";
import { toast } from "@/components/ui/toast";
import type { SiteSection, Block } from "@/types";
import { useLanguage, LanguageContext } from "@/lib/language-context";
import { useSiteSettings } from "@/lib/SiteSettingsContext";
import { getPublicContentStrings } from "@/lib/content-strings";
import { getAdminPublications } from "@/lib/publications";
import { getUpcomingEvents } from "@/lib/events";
import { getPublishedContent } from "@/lib/public-content";

// Section component map for preview
import {
  HeroSection,
  HeroCarouselSection,
  HeroSplitSection,
  HeroMinimalSection,
  HeroAnnouncementSection,
  OurFocusAreasSection,
  JoinOurCommunitySection,
  TestimonialsSection,
  TestimonialsCarouselSection,
  TestimonialsWallSection,
  StatisticsSection,
  StatsProgressSection,
  StatsImpactSection,
  NewsletterSection,
  CtaNewsletterSection,
  WaitlistFormSection,
  MultiStepFormSection,
  ContactFormSection,
  PublicationsCarouselSection,
  UpcomingEventsSection,
  LatestNewsSection,
  FaqSection,
  TeamSection,
  TeamLeadershipSection,
  TeamCompactSection,
  TimelineSection,
  BannerSection,
  FeaturesGridSection,
  FeatureHighlightSection,
  FeaturesAlternatingSection,
  BlogGridSection,
  BlogFeaturedSection,
  PortfolioMasonrySection,
  CaseStudyCardsSection,
  PricingCardsSection,
  PricingTableSection,
  GalleryGridSection,
  ImageSliderSection,
  VideoHeroSection,
  VideoEmbedSection,
  StepsHorizontalSection,
  StepsVerticalSection,
  LogosStripSection,
  LogosMarqueeSection,
  TabsContentSection,
  ComparisonSliderSection,
  CompetitorComparisonSection,
  MapLocationSection,
  OfficesMapSection,
  RichTextSection,
  SplitContentSection,
  IconListSection,
  ServicesCardsSection,
  NewsCardsHorizontalSection,
  JobsFeedSection,
  MembersFeedSection,
  PodcastSection,
  SocialFeedSection,
  AboutSection,
  AwardsSectionComponent,
} from "@/components/sections";
import CustomSection from "@/components/ui/CustomSection";
import { FooterLayout, type FooterSectionConfig } from "@/components/page-sections/FooterLayout";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PreviewLang = "en" | "ar";

interface SectionBuilderPanelProps {
  section: SiteSection;
  onClose: () => void;
  onSaved: () => void;
  canPublish?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJson(val: unknown): Record<string, unknown> {
  if (!val) return {};
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return {}; }
  }
  return val as Record<string, unknown>;
}

function serializeJson(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2);
}

// ---------------------------------------------------------------------------
// Component-type display metadata
// ---------------------------------------------------------------------------

const TYPE_BADGE_COLORS: Record<string, string> = {
  hero:                    "bg-blue-100 text-blue-700",
  "hero-carousel":         "bg-blue-200 text-blue-800",
  cta:                     "bg-orange-100 text-orange-700",
  "card-group":            "bg-green-100 text-green-700",
  stats:                   "bg-purple-100 text-purple-700",
  counter:                 "bg-purple-100 text-purple-700",
  testimonial:             "bg-pink-100 text-pink-700",
  newsletter:              "bg-teal-100 text-teal-700",
  "contact-form":          "bg-yellow-100 text-yellow-700",
  "publications-carousel": "bg-amber-100 text-amber-700",
  team:                    "bg-indigo-100 text-indigo-700",
  timeline:                "bg-red-100 text-red-700",
  faq:                     "bg-cyan-100 text-cyan-700",
  banner:                  "bg-lime-100 text-lime-700",
  custom:                  "bg-gray-100 text-gray-700",
  "latest-news-feed":      "bg-sky-100 text-sky-700",
  "upcoming-events-feed":  "bg-emerald-100 text-emerald-700",
};

// ---------------------------------------------------------------------------
// Preview renderer — renders the matching section component
// ---------------------------------------------------------------------------

// Static preview of a hero carousel slide — no framer-motion animations,
// no canvas, safe to render inside a scaled/clipped preview container.
function HeroCarouselPreview({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const slides = (config.slides as Array<Record<string, unknown>> | undefined) ?? [];
  const slide = slides[0] ?? {};

  const title = isAr
    ? (slide.titleAr as string) || (slide.titleEn as string) || ""
    : (slide.titleEn as string) || (slide.titleAr as string) || "";
  const description = isAr
    ? (slide.descriptionAr as string) || (slide.descriptionEn as string) || ""
    : (slide.descriptionEn as string) || (slide.descriptionAr as string) || "";
  const primaryLabel = isAr
    ? (slide.primaryButtonLabelAr as string) || (slide.primaryButtonLabelEn as string) || ""
    : (slide.primaryButtonLabelEn as string) || (slide.primaryButtonLabelAr as string) || "";
  const secondaryLabel = isAr
    ? (slide.secondaryButtonLabelAr as string) || (slide.secondaryButtonLabelEn as string) || ""
    : (slide.secondaryButtonLabelEn as string) || (slide.secondaryButtonLabelAr as string) || "";

  const rawBg = (slide.backgroundImage as string) || "";
  const bg = rawBg
    ? `/_next/image?url=${encodeURIComponent(rawBg)}&w=1920&q=85`
    : "";

  const OVERLAY =
    "linear-gradient(135deg,rgba(62,39,35,.78) 0%,rgba(93,64,55,.62) 50%,rgba(55,71,79,.52) 100%)";

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{ minHeight: 500 }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={
          bg
            ? { backgroundImage: `${OVERLAY}, url(${bg})` }
            : {
                background:
                  "linear-gradient(135deg,#3E2723 0%,#5D4037 50%,#4E342E 100%)",
              }
        }
      />
      {/* Decorative SVG */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <path d="M0,200 C200,50 400,350 600,200 C800,50 1000,300 1000,200 L1000,400 L0,400 Z" fill="#D7CCC8" />
          <path d="M0,300 C300,100 500,400 800,300 C900,200 1000,350 1000,300 L1000,400 L0,400 Z" fill="#8D6E63" opacity="0.5" />
        </svg>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-10 max-w-3xl">
        {title && (
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">{title}</h1>
        )}
        {description && (
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">{description}</p>
        )}
        <div className="flex flex-wrap gap-4">
          {primaryLabel && (
            <span className="inline-block px-8 py-3 rounded-lg bg-green-700 text-white font-semibold text-sm">
              {primaryLabel}
            </span>
          )}
          {secondaryLabel && (
            <span className="inline-block px-8 py-3 rounded-lg border border-white/40 text-white text-sm">
              {secondaryLabel}
            </span>
          )}
        </div>
      </div>

      {/* Slide count indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_: unknown, i: number) => (
            <div
              key={i}
              className={`rounded-full ${i === 0 ? "w-6 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Static preview for feed sections (latest-news-feed / upcoming-events-feed)
function FeedPreview({
  config,
  accent,
  icon,
  defaultTitleEn,
  defaultTitleAr,
}: {
  config: Record<string, unknown>;
  accent: string;
  icon: string;
  defaultTitleEn: string;
  defaultTitleAr: string;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title = isAr
    ? (config.titleAr as string) || (config.titleEn as string) || defaultTitleAr
    : (config.titleEn as string) || (config.titleAr as string) || defaultTitleEn;
  const subtitle = isAr
    ? (config.subtitleAr as string) || (config.subtitleEn as string) || ""
    : (config.subtitleEn as string) || (config.subtitleAr as string) || "";

  // Render 3 placeholder cards
  const cards = [0, 1, 2];
  return (
    <section className="py-14 px-8" style={{ background: "#f9fafb" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1f2328" }}>{title}</h2>
            {subtitle && <p className="text-sm mt-1" style={{ color: "#57606a" }}>{subtitle}</p>}
          </div>
          <span className="text-sm font-medium" style={{ color: accent }}>
            {isAr ? "عرض الكل ←" : "View All →"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {cards.map((i) => (
            <div key={i} className="rounded-lg border p-4" style={{ background: "#fff", borderColor: "#e5e7eb", borderLeftWidth: 4, borderLeftColor: accent }}>
              <div className="text-lg mb-2">{icon}</div>
              <div className="h-3 rounded mb-2" style={{ background: "#e5e7eb", width: `${70 - i * 10}%` }} />
              <div className="h-2 rounded mb-1.5" style={{ background: "#f3f4f6", width: "90%" }} />
              <div className="h-2 rounded" style={{ background: "#f3f4f6", width: "75%" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionPreviewRenderer({
  componentType,
  slug,
  config,
  data,
}: {
  componentType: string;
  slug?: string;
  config: Record<string, unknown>;
  data: Record<string, unknown>;
}) {
  if (componentType === "hero-carousel") {
    // Use the static preview renderer — avoids framer-motion canvas issues
    // inside the scaled/clipped preview container
    return <HeroCarouselPreview config={{ ...config, slides: (config.slides as unknown[]) ?? [] }} />;
  }
  if (componentType === "hero" || slug === "hero-banner") {
    return <HeroSection config={config} />;
  }
  if (componentType === "card-group") {
    return <OurFocusAreasSection config={config} data={data} />;
  }
  if (componentType === "cta") {
    return <JoinOurCommunitySection config={config} />;
  }
  if (componentType === "stats" || componentType === "counter") {
    return <StatisticsSection data={data} config={config} />;
  }
  if (componentType === "testimonial" || componentType === "testimonials") {
    return <TestimonialsSection data={data} config={config} boardMembers={[]} />;
  }
  if (componentType === "newsletter") {
    return <NewsletterSection config={config} />;
  }
  if (componentType === "contact-form") {
    return <ContactFormSection config={config} />;
  }
  if (componentType === "publications-carousel") {
    return <PublicationsCarouselSection config={config} data={data} />;
  }
  if (componentType === "upcoming-events-feed") {
    return <UpcomingEventsSection config={config} data={data} />;
  }
  if (componentType === "latest-news-feed") {
    return <LatestNewsSection config={config} data={data} />;
  }
  if (componentType === "faq") {
    return <FaqSection config={config} data={data} />;
  }
  if (componentType === "team") {
    return <TeamSection config={config} data={data} />;
  }
  if (componentType === "timeline") {
    return <TimelineSection config={config} data={data} />;
  }
  if (componentType === "banner") {
    return <BannerSection config={config} data={data} />;
  }
  if (componentType === "custom") {
    return <CustomSection blocks={(data.blocks as Block[]) || []} />;
  }
  if (componentType === "footer-layout") {
    return <FooterLayout sectionConfig={config as FooterSectionConfig} />;
  }
  // ---- New 44 template types ----
  if (componentType === "hero-split")            return <HeroSplitSection config={config} data={data} />;
  if (componentType === "hero-minimal")          return <HeroMinimalSection config={config} data={data} />;
  if (componentType === "hero-announcement")     return <HeroAnnouncementSection config={config} data={data} />;
  if (componentType === "testimonials-carousel") return <TestimonialsCarouselSection config={config} data={data} />;
  if (componentType === "testimonials-wall")     return <TestimonialsWallSection config={config} data={data} />;
  if (componentType === "stats-progress")        return <StatsProgressSection config={config} data={data} />;
  if (componentType === "stats-impact")          return <StatsImpactSection config={config} data={data} />;
  if (componentType === "cta-newsletter")        return <CtaNewsletterSection config={config} data={data} />;
  if (componentType === "waitlist-form")         return <WaitlistFormSection config={config} data={data} />;
  if (componentType === "multi-step-form")       return <MultiStepFormSection config={config} data={data} />;
  if (componentType === "team-leadership")       return <TeamLeadershipSection config={config} data={data} />;
  if (componentType === "team-compact")          return <TeamCompactSection config={config} data={data} />;
  if (componentType === "features-grid")         return <FeaturesGridSection config={config} data={data} />;
  if (componentType === "feature-highlight")     return <FeatureHighlightSection config={config} data={data} />;
  if (componentType === "features-alternating")  return <FeaturesAlternatingSection config={config} data={data} />;
  if (componentType === "blog-grid")             return <BlogGridSection config={config} data={data} />;
  if (componentType === "blog-featured")         return <BlogFeaturedSection config={config} data={data} />;
  if (componentType === "portfolio-masonry")     return <PortfolioMasonrySection config={config} data={data} />;
  if (componentType === "case-study-cards")      return <CaseStudyCardsSection config={config} data={data} />;
  if (componentType === "pricing-cards")         return <PricingCardsSection config={config} data={data} />;
  if (componentType === "pricing-table")         return <PricingTableSection config={config} data={data} />;
  if (componentType === "gallery-grid")          return <GalleryGridSection config={config} data={data} />;
  if (componentType === "image-slider")          return <ImageSliderSection config={config} data={data} />;
  if (componentType === "video-hero")            return <VideoHeroSection config={config} data={data} />;
  if (componentType === "video-embed")           return <VideoEmbedSection config={config} data={data} />;
  if (componentType === "steps-horizontal")      return <StepsHorizontalSection config={config} data={data} />;
  if (componentType === "steps-vertical")        return <StepsVerticalSection config={config} data={data} />;
  if (componentType === "logos-strip")           return <LogosStripSection config={config} data={data} />;
  if (componentType === "logos-marquee")         return <LogosMarqueeSection config={config} data={data} />;
  if (componentType === "tabs-content")          return <TabsContentSection config={config} data={data} />;
  if (componentType === "comparison-slider")     return <ComparisonSliderSection config={config} data={data} />;
  if (componentType === "competitor-comparison") return <CompetitorComparisonSection config={config} data={data} />;
  if (componentType === "map-location")          return <MapLocationSection config={config} data={data} />;
  if (componentType === "offices-map")           return <OfficesMapSection config={config} data={data} />;
  if (componentType === "rich-text")             return <RichTextSection config={config} data={data} />;
  if (componentType === "split-content")         return <SplitContentSection config={config} data={data} />;
  if (componentType === "icon-list")             return <IconListSection config={config} data={data} />;
  if (componentType === "services-cards")        return <ServicesCardsSection config={config} data={data} />;
  if (componentType === "news-horizontal")       return <NewsCardsHorizontalSection config={config} data={data} />;
  if (componentType === "jobs-feed")             return <JobsFeedSection config={config} data={data} />;
  if (componentType === "members-feed")          return <MembersFeedSection config={config} data={data} />;
  if (componentType === "podcast")               return <PodcastSection config={config} data={data} />;
  if (componentType === "social-feed")           return <SocialFeedSection config={config} data={data} />;
  if (componentType === "about")                 return <AboutSection config={config} data={data} />;
  if (componentType === "awards")                return <AwardsSectionComponent config={config} data={data} />;

  const title =
    (config.titleEn as string) ||
    (config.title as string) ||
    (data.titleEn as string) ||
    (data.title as string) ||
    componentType;
  return (
    <div className="py-16 px-8 bg-gray-50 text-center">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
        {componentType}
      </p>
      <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FieldGroup — collapsible group of fields
// ---------------------------------------------------------------------------

function FieldGroup({
  label,
  icon,
  defaultOpen = true,
  children,
  fieldCount,
}: {
  label: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  fieldCount: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-gray-500">{icon}</span>
        <span className="flex-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">{label}</span>
        <span className="text-xs text-gray-400 font-medium">{fieldCount} {fieldCount === 1 ? "field" : "fields"}</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="p-4 space-y-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function SectionBuilderPanel({
  section,
  onClose,
  onSaved,
  canPublish = true,
}: SectionBuilderPanelProps) {
  const { language, t } = useLanguage();
  const schema = getSchema(section.componentType);

  // Live site-settings — used to seed footer-layout fields
  const { settings: siteSettings } = useSiteSettings();

  // Form state
  const [dataValues, setDataValues] = useState<Record<string, unknown>>(
    () => parseJson(section.data)
  );
  const [configValues, setConfigValues] = useState<Record<string, unknown>>(
    () => parseJson(section.config)
  );
  const [stylingValues, setStylingValues] = useState<Record<string, unknown>>(
    () => parseJson(section.styling)
  );

  // Advanced JSON editors (fallback)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rawData, setRawData] = useState(() => serializeJson(parseJson(section.data)));
  const [rawConfig, setRawConfig] = useState(() => serializeJson(parseJson(section.config)));
  const [rawStyling, setRawStyling] = useState(() => serializeJson(parseJson(section.styling)));

  // Preview language — independent from global language
  const [previewLang, setPreviewLang] = useState<PreviewLang>(language as PreviewLang ?? "en");
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Track unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  const initialData = useRef(serializeJson(parseJson(section.data)));
  const initialConfig = useRef(serializeJson(parseJson(section.config)));
  const initialStyling = useRef(serializeJson(parseJson(section.styling)));

  // ── Publications-carousel seed ──────────────────────────────────────────
  // When the publications-carousel section has no manual items, fetch all
  // publications from the API and populate the repeater so the admin can see
  // and edit them.
  const pubsSeeded = useRef(false);
  useEffect(() => {
    if (
      section.componentType !== "publications-carousel" ||
      pubsSeeded.current
    ) return;

    const existing = parseJson(section.data);
    const existingItems = Array.isArray(existing.items) ? existing.items : [];
    if (existingItems.length > 0) {
      // Already has manual items — don't overwrite
      pubsSeeded.current = true;
      return;
    }

    pubsSeeded.current = true;
    getAdminPublications(0, 100)
      .then((res) => {
        const pubs = res.data?.data?.content ?? [];
        if (pubs.length === 0) return;
        const seededItems = pubs.map((pub) => ({
          titleEn: pub.titleEn ?? "",
          titleAr: pub.titleAr ?? "",
          descriptionEn: pub.abstractEn ?? "",
          descriptionAr: pub.abstractAr ?? "",
          coverImage: pub.coverImageUrl ?? "",
          link: pub.pdfUrl ?? "",
          authors: pub.authors ?? "",
          year: pub.year != null ? String(pub.year) : "",
          category: pub.category ?? "",
        }));
        setDataValues((prev) => {
          const next = { ...prev, items: seededItems };
          // Advance the baseline so the seed does not trigger "unsaved changes"
          initialData.current = serializeJson(next);
          return next;
        });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.componentType, section.data]);

  // ── Upcoming-events-feed seed ────────────────────────────────────────────
  // When the section is opened, pre-populate:
  //   configValues — with defaults (titleEn/Ar, count, viewAllUrl) if missing
  //   dataValues.items — with live events from the API so the admin can see
  //                      and edit every field of each real event
  const eventsSeeded = useRef(false);
  useEffect(() => {
    if (
      section.componentType !== "upcoming-events-feed" ||
      eventsSeeded.current
    ) return;

    eventsSeeded.current = true;

    // Seed config defaults if the keys are genuinely absent
    const existingConfig = parseJson(section.config);
    const missingConfigKeys = !existingConfig.titleEn && !existingConfig.title;
    if (missingConfigKeys) {
      setConfigValues((prev) => {
        const next = {
          titleEn: "Upcoming Events",
          titleAr: "الفعاليات القادمة",
          count: 3,
          viewAllLabelEn: "View All Events",
          viewAllLabelAr: "جميع الفعاليات",
          viewAllUrl: "/events",
          dataSource: "api",
          ...prev,
        };
        // Advance the baseline so the config seed does not trigger "unsaved changes"
        initialConfig.current = serializeJson(next);
        return next;
      });
    }

    // Seed data items from live events API if no manual items exist yet
    const existingData  = parseJson(section.data);
    const existingItems = Array.isArray(existingData.items) ? existingData.items : [];
    if (existingItems.length > 0) return;

    getUpcomingEvents()
      .then((res) => {
        const evts = res.data?.data ?? [];
        if (evts.length === 0) return;
        const seededItems = evts.map((ev) => ({
          titleEn:    ev.titleEn    ?? "",
          titleAr:    ev.titleAr    ?? "",
          description: ev.description ?? "",
          eventDate:  ev.eventDate  ?? "",
          location:   ev.location   ?? "",
          eventType:  ev.eventType  ?? "",
          featuredImage: ev.featuredImage ?? "",
          slug:       ev.slug       ?? "",
        }));
        setDataValues((prev) => {
          const next = { ...prev, items: seededItems };
          // Advance the baseline so the data seed does not trigger "unsaved changes"
          initialData.current = serializeJson(next);
          return next;
        });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.componentType, section.config, section.data]);

  // ── Latest-news-feed seed ────────────────────────────────────────────────
  // When the section is opened, pre-populate:
  //   configValues — with defaults (titleEn/Ar, count, viewAllUrl) if missing
  //   dataValues.items — with live news articles from the API so the admin
  //                      can see and edit every field of each real article
  const newsSeeded = useRef(false);
  useEffect(() => {
    if (
      section.componentType !== "latest-news-feed" ||
      newsSeeded.current
    ) return;

    newsSeeded.current = true;

    // Seed config defaults if the keys are genuinely absent
    const existingConfig = parseJson(section.config);
    const missingConfigKeys = !existingConfig.titleEn && !existingConfig.title;
    if (missingConfigKeys) {
      setConfigValues((prev) => {
        const next = {
          titleEn: "Latest News",
          titleAr: "أحدث الأخبار",
          count: 3,
          viewAllLabelEn: "View All News",
          viewAllLabelAr: "جميع الأخبار",
          viewAllUrl: "/news",
          dataSource: "api",
          ...prev,
        };
        // Advance the baseline so the config seed does not trigger "unsaved changes"
        initialConfig.current = serializeJson(next);
        return next;
      });
    }

    // Seed data items from live news API if no manual items exist yet
    const existingData  = parseJson(section.data);
    const existingItems = Array.isArray(existingData.items) ? existingData.items : [];
    if (existingItems.length > 0) return;

    getPublishedContent({ contentType: "NEWS", size: 100 })
      .then((res) => {
        const articles = res.data?.data?.content ?? [];
        if (articles.length === 0) return;
        const seededItems = articles.map((art) => ({
          titleEn:       art.titleEn       ?? "",
          titleAr:       art.titleAr       ?? "",
          excerpt:       art.excerpt        ?? "",
          publishedAt:   art.publishedAt    ?? "",
          featuredImage: art.featuredImage  ?? "",
          slug:          art.slug           ?? "",
          category:      art.category?.nameEn ?? "",
        }));
        setDataValues((prev) => {
          const next = { ...prev, items: seededItems };
          // Advance the baseline so the data seed does not trigger "unsaved changes"
          initialData.current = serializeJson(next);
          return next;
        });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.componentType, section.config, section.data]);

  // ── Footer-layout seed ───────────────────────────────────────────────────
  // When the footer-layout section config is empty (first open), populate the
  // editor fields from the live SiteSettings + ContentStrings values so the
  // admin sees the actual current data instead of blank placeholder text.
  // We fetch both EN and AR content strings directly so the seed is correct
  // regardless of what language the admin UI is currently set to.
  const footerSeeded = useRef(false);
  useEffect(() => {
    if (
      section.componentType !== "footer-layout" ||
      footerSeeded.current ||
      siteSettings.size === 0  // wait until settings have loaded
    ) return;

    const existing = parseJson(section.config);
    // Only seed when the config is genuinely empty (no footer keys saved yet)
    const hasFooterKeys = Object.keys(existing).some((k) =>
      ["siteNameEn", "siteNameAr", "contactAddress", "contactEmail", "facebookUrl", "copyrightEn"].includes(k)
    );
    if (hasFooterKeys) return;

    footerSeeded.current = true;

    // Fetch EN and AR content-strings in parallel so bilingual fields are correct
    Promise.all([
      getPublicContentStrings("en").then((r) => r.data.data as Record<string, string>).catch(() => ({} as Record<string, string>)),
      getPublicContentStrings("ar").then((r) => r.data.data as Record<string, string>).catch(() => ({} as Record<string, string>)),
    ]).then(([en, ar]) => {
      const seeded: Record<string, unknown> = {
        // Site name
        siteNameEn: siteSettings.get("site.name_en") || siteSettings.get("site.name") || "Soil Science Society of Syria (SSSS)",
        siteNameAr: siteSettings.get("site.name_ar") || siteSettings.get("site.name") || "جمعية علوم التربة السورية (SSSS)",
        // Site description
        siteDescriptionEn: en["footer.site_description"] || "The Soil Science Society of Syria (SSSS) is dedicated to advancing soil science and sustainable land management in Syria.",
        siteDescriptionAr: ar["footer.site_description"] || "جمعية علوم التربة السورية (SSSS) مكرسة لتطوير أبحاث علوم التربة وإدارة الأراضي المستدامة في سوريا.",
        // Contact info
        contactAddress: siteSettings.get("contact.address") || "Damascus, Syria",
        contactEmail:   siteSettings.get("contact.email")   || "info@ssssy.org",
        contactPhone:   siteSettings.get("contact.phone")   || "+963 11 234 5678",
        // Social links
        facebookUrl: siteSettings.get("social.facebook_url") || "",
        twitterUrl:  siteSettings.get("social.twitter_url")  || "",
        linkedinUrl: siteSettings.get("social.linkedin_url") || "",
        youtubeUrl:  siteSettings.get("social.youtube_url")  || "",
        // Column headings
        quickLinksHeadingEn:  en["footer.quick_links_heading"]  || "Quick Links",
        quickLinksHeadingAr:  ar["footer.quick_links_heading"]  || "روابط سريعة",
        contactInfoHeadingEn: en["footer.contact_info_heading"] || "Contact Info",
        contactInfoHeadingAr: ar["footer.contact_info_heading"] || "معلومات التواصل",
        aboutHeadingEn:       en["footer.about_heading"]        || "About SSSS",
        aboutHeadingAr:       ar["footer.about_heading"]        || "عن الجمعية",
        // Copyright
        copyrightEn: siteSettings.get("footer.copyright_en") || siteSettings.get("footer.copyright") || "Soil Science Society of Syria (SSSS). All rights reserved.",
        copyrightAr: siteSettings.get("footer.copyright_ar") || siteSettings.get("footer.copyright") || "جمعية علوم التربة السورية (SSSS). جميع الحقوق محفوظة.",
      };
      // Advance the baseline so the footer seed does not trigger "unsaved changes"
      initialConfig.current = serializeJson(seeded);
      setConfigValues(seeded);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.componentType, siteSettings]);

  useEffect(() => {
    const dirty =
      serializeJson(dataValues) !== initialData.current ||
      serializeJson(configValues) !== initialConfig.current ||
      serializeJson(stylingValues) !== initialStyling.current;
    setIsDirty(dirty);
  }, [dataValues, configValues, stylingValues]);

  // Keep raw JSON in sync when visual fields change
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      setRawData(serializeJson(dataValues));
      setRawConfig(serializeJson(configValues));
      setRawStyling(serializeJson(stylingValues));
    }, 200);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [dataValues, configValues, stylingValues]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataValues, configValues, stylingValues]);

  function applyRawJson() {
    try {
      setDataValues(JSON.parse(rawData));
      setConfigValues(JSON.parse(rawConfig));
      setStylingValues(JSON.parse(rawStyling));
    } catch {
      toast({ title: "Invalid JSON", description: "Please fix the JSON before applying.", variant: "destructive" });
    }
  }

  // Build the full update payload — backend requires name + componentType (@NotBlank)
  function buildPayload() {
    return {
      name: section.name,
      slug: section.slug,
      componentType: section.componentType,
      location: section.location,
      isActive: section.isActive,
      sortOrder: section.sortOrder,
      data: serializeJson(dataValues) as any,
      config: serializeJson(configValues) as any,
      styling: serializeJson(stylingValues) as any,
    };
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateSiteSection(section.id, buildPayload());
      // Bust the Next.js ISR cache so the public site reflects the draft immediately
      fetch("/api/revalidate", { method: "POST" }).catch(() => {});
      setIsDirty(false);
      initialData.current = serializeJson(dataValues);
      initialConfig.current = serializeJson(configValues);
      initialStyling.current = serializeJson(stylingValues);
      toast({ title: t("Draft saved", "تم حفظ المسودة"), variant: "success" });
      onSaved();
    } catch {
      toast({ title: t("Failed to save", "فشل الحفظ"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndPublish() {
    setSaving(true);
    try {
      await updateSiteSection(section.id, buildPayload());
      await publishSiteSection(section.id);
      // Bust the Next.js ISR cache so the public site reflects changes immediately
      fetch("/api/revalidate", { method: "POST" }).catch(() => {});
      setIsDirty(false);
      toast({ title: t("Published!", "تم النشر!"), description: t("Section is now live", "القسم منشور الآن"), variant: "success" });
      onSaved();
      onClose();
    } catch {
      toast({ title: t("Failed to publish", "فشل النشر"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // Live preview data
  const previewConfig = useMemo(() => configValues, [configValues]);
  const previewData   = useMemo(() => dataValues, [dataValues]);

  // Memoize the context override value so it only changes when previewLang changes,
  // not on every render — avoids thrashing LanguageContext consumers
  const previewLangCtxValue = useMemo(() => ({
    language: previewLang as "en" | "ar",
    direction: (previewLang === "ar" ? "rtl" : "ltr") as "ltr" | "rtl",
    setLanguage: () => {},
    t: (en: string, ar: string) => (previewLang === "ar" ? ar : en),
  }), [previewLang]);

  const typeBadge = TYPE_BADGE_COLORS[section.componentType] ?? "bg-gray-100 text-gray-700";

  // Preview container width
  const PREVIEW_FULL_WIDTH = 1280;
  const PREVIEW_MOBILE_WIDTH = 390;
  const [panelWidth, setPanelWidth] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function measure() {
      if (previewRef.current) setPanelWidth(previewRef.current.offsetWidth);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (previewRef.current) ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, []);

  const targetWidth  = previewMode === "mobile" ? PREVIEW_MOBILE_WIDTH : PREVIEW_FULL_WIDTH;
  const scaleRatio   = panelWidth > 0 ? panelWidth / targetWidth : 0.35;
  const scaledHeight = panelWidth > 0 ? panelWidth / scaleRatio * 0.38 : 240;

  // Build grouped unified field list
  const { configFields, dataFields, stylingFields } = schema;

  const totalFields = configFields.length + dataFields.length + stylingFields.length;

  const panel = (
    <div className="fixed inset-0 z-[200] flex">
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel — wider (max-w-6xl) */}
      <motion.div
        key="panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="absolute right-0 top-0 h-full w-full max-w-6xl bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Type badge */}
            <span className={cn("text-xs px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide shrink-0", typeBadge)}>
              {section.componentType}
            </span>
            <h2 className="font-semibold text-gray-900 text-sm truncate">{section.name}</h2>
            {section.slug && (
              <span className="text-xs text-gray-400 font-mono hidden sm:inline">/{section.slug}</span>
            )}
            {/* Unsaved indicator */}
            {isDirty && (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                {previewLang === "ar" ? "تغييرات غير محفوظة" : "Unsaved changes"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status chip */}
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              section.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            )}>
              {section.status === "PUBLISHED"
                ? <><CheckCircle className="h-3 w-3 inline mr-1" />{previewLang === "ar" ? "منشور" : "Published"}</>
                : <><AlertCircle className="h-3 w-3 inline mr-1" />{previewLang === "ar" ? "مسودة" : "Draft"}</>
              }
            </span>

            {/* Language toggle — controls BOTH editor labels AND preview */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setPreviewLang("en")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                  previewLang === "en" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Globe className="h-3 w-3 inline mr-1" />EN
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang("ar")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                  previewLang === "ar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                AR عر
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Body: two-pane layout ───────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left pane: unified field editor (55%) ─── */}
          <div className="flex flex-col w-[55%] border-r border-gray-100 overflow-hidden bg-gray-50/30">
            {/* Pane header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {previewLang === "ar" ? "تعديل المحتوى" : "Edit Content"}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {totalFields} {previewLang === "ar" ? (totalFields === 1 ? "حقل" : "حقول") : (totalFields === 1 ? "field" : "fields")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium transition-colors",
                  showAdvanced ? "bg-amber-100 text-amber-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                )}
              >
                <Layout className="h-3 w-3" />
                {previewLang === "ar" ? "JSON متقدم" : "JSON"}
              </button>
            </div>

            {/* Scrollable fields area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {totalFields === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Settings2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {previewLang === "ar" ? "لا توجد حقول قابلة للتحرير" : "No editable fields"}
                  </p>
                  <p className="text-xs text-gray-400 max-w-[220px]">
                    {previewLang === "ar"
                      ? "استخدم محرر JSON المتقدم لتعديل هذا القسم"
                      : "Use the Advanced JSON editor below to edit this section"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(true)}
                    className="mt-4 text-xs font-medium text-soil-clay hover:text-soil-dark underline"
                  >
                    {previewLang === "ar" ? "فتح محرر JSON" : "Open JSON Editor"}
                  </button>
                </div>
              ) : (
                <>
                  {/* ── Config fields group (Content & Settings) ── */}
                  {configFields.length > 0 && (
                    <FieldGroup
                      label={previewLang === "ar" ? "المحتوى والإعدادات" : "Content & Settings"}
                      icon={<Type className="h-3.5 w-3.5" />}
                      fieldCount={configFields.length}
                      defaultOpen={true}
                    >
                      {configFields.map((field) => (
                        <SectionFieldRenderer
                          key={field.key}
                          field={field}
                          values={configValues}
                          onChange={setConfigValues}
                          previewLang={previewLang}
                        />
                      ))}
                    </FieldGroup>
                  )}

                  {/* ── Data fields group (Items / Collections) ── */}
                  {dataFields.length > 0 && (
                    <FieldGroup
                      label={previewLang === "ar" ? "العناصر والمجموعات" : "Items & Collections"}
                      icon={<Layers className="h-3.5 w-3.5" />}
                      fieldCount={dataFields.length}
                      defaultOpen={true}
                    >
                      {dataFields.map((field) => (
                        <SectionFieldRenderer
                          key={field.key}
                          field={field}
                          values={dataValues}
                          onChange={setDataValues}
                          previewLang={previewLang}
                        />
                      ))}
                    </FieldGroup>
                  )}

                  {/* ── Styling fields group (Appearance) ── */}
                  {stylingFields.length > 0 && (
                    <FieldGroup
                      label={previewLang === "ar" ? "المظهر والتصميم" : "Appearance"}
                      icon={<Palette className="h-3.5 w-3.5" />}
                      fieldCount={stylingFields.length}
                      defaultOpen={false}
                    >
                      {stylingFields.map((field) => (
                        <SectionFieldRenderer
                          key={field.key}
                          field={field}
                          values={stylingValues}
                          onChange={setStylingValues}
                          previewLang={previewLang}
                        />
                      ))}
                    </FieldGroup>
                  )}
                </>
              )}

              {/* ── Advanced JSON (collapsible) ── */}
              {showAdvanced && (
                <div className="border border-amber-200 bg-amber-50/50 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-amber-200 bg-amber-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      {previewLang === "ar" ? "تحرير JSON المتقدم" : "Advanced JSON Editor"}
                    </span>
                    <button type="button" onClick={() => setShowAdvanced(false)} className="p-1 rounded text-amber-500 hover:bg-amber-100">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">
                      ⚠ {previewLang === "ar"
                        ? "التحرير المباشر يؤثر على كل الحقول. اضغط \"تطبيق\" لنقل التغييرات."
                        : "Direct JSON edits override visual fields. Click Apply to sync changes."}
                    </p>
                    {[
                      { label: "Config JSON", value: rawConfig, set: setRawConfig },
                      { label: "Data JSON", value: rawData, set: setRawData },
                      { label: "Styling JSON", value: rawStyling, set: setRawStyling },
                    ].map(({ label, value, set }) => (
                      <div key={label}>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                          {label}
                        </label>
                        <textarea
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          rows={5}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-amber-400/60 bg-white"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={applyRawJson}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {previewLang === "ar" ? "تطبيق JSON" : "Apply JSON"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right pane: live preview (45%) ─── */}
          <div className="flex flex-col w-[45%] bg-[#f0f2f5] overflow-hidden">
            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  {previewLang === "ar" ? "معاينة مباشرة" : "Live Preview"}
                </span>
                {/* Language indicator */}
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  previewLang === "ar" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                )}>
                  {previewLang === "ar" ? "العربية" : "English"}
                </span>
              </div>
              {/* Desktop / mobile toggle */}
              <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    previewMode === "desktop" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                  title="Desktop preview"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    previewMode === "mobile" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                  title="Mobile preview"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Preview viewport — always LTR so the scaled iframe-like div
                anchors to the top-left corner regardless of preview language.
                Individual section components handle their own dir attribute. */}
            <div
              ref={previewRef}
              className="flex-1 overflow-hidden p-4 flex flex-col items-center justify-start"
              dir="ltr"
            >
              {/* Device frame */}
              <div
                className={cn(
                  "relative overflow-hidden bg-white shadow-xl w-full",
                  previewMode === "mobile" ? "rounded-3xl border-4 border-gray-300 max-w-[220px]" : "rounded-xl border border-gray-200"
                )}
                style={{ height: scaledHeight || 260 }}
              >
                {/* Mobile notch */}
                {previewMode === "mobile" && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-300 rounded-b-xl z-10" />
                )}
                {/* Scale wrapper — preview language overridden locally via context.
                    transformOrigin must stay "top left" (LTR-physical) so the
                    1280-px wide viewport clips correctly inside the container. */}
                <div
                  style={{
                    width: targetWidth,
                    transformOrigin: "top left",
                    transform: `scale(${scaleRatio || 0.35})`,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  <LanguageContext.Provider value={previewLangCtxValue}>
                    <SectionPreviewRenderer
                      componentType={section.componentType}
                      slug={section.slug}
                      config={previewConfig}
                      data={previewData}
                    />
                  </LanguageContext.Provider>
                </div>
                {/* Interaction blocker */}
                <div className="absolute inset-0" />
              </div>

              {/* Preview meta */}
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span>{previewMode === "mobile" ? `Mobile (${PREVIEW_MOBILE_WIDTH}px)` : `Desktop (${PREVIEW_FULL_WIDTH}px)`}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="font-medium text-gray-500">
                  {previewLang === "ar" ? "🇸🇦 عرض بالعربية" : "🇬🇧 Showing in English"}
                </span>
              </div>

              {/* Quick tip */}
              <div className="mt-4 w-full bg-white rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500 font-semibold mb-1.5">
                  {previewLang === "ar" ? "💡 نصيحة" : "💡 Tips"}
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• {previewLang === "ar" ? "Ctrl+S للحفظ كمسودة" : "Ctrl+S — Save draft"}</li>
                  <li>• {previewLang === "ar" ? "مفتاح Esc للإغلاق" : "Esc — Close panel"}</li>
                  <li>• {previewLang === "ar" ? "EN/AR لتبديل لغة المعاينة" : "EN/AR — Toggle preview language"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            {isDirty ? (
              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                {previewLang === "ar" ? "توجد تغييرات غير محفوظة" : "You have unsaved changes"}
              </span>
            ) : (
              <span className="text-xs text-gray-400">
                {previewLang === "ar" ? "Ctrl+S للحفظ • Esc للإغلاق" : "Ctrl+S to save  •  Esc to close"}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {previewLang === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              {saving
                ? (previewLang === "ar" ? "جاري الحفظ…" : "Saving…")
                : (previewLang === "ar" ? "حفظ كمسودة" : "Save Draft")}
            </button>
            {canPublish && (
              <button
                type="button"
                onClick={handleSaveAndPublish}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {saving
                  ? (previewLang === "ar" ? "جاري النشر…" : "Publishing…")
                  : (previewLang === "ar" ? "حفظ ونشر" : "Save & Publish")}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(
    <AnimatePresence>{panel}</AnimatePresence>,
    document.body
  );
}

// Keep backward-compatible default export
export default SectionBuilderPanel;
