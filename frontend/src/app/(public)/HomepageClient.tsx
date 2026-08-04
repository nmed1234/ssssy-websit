"use client";

import type { Block, BoardMember, SiteSection } from "@/types";
import type { MemberProfile } from "@/app/(public)/page";

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

interface Props {
  initialSections: SiteSection[];
  initialNews: unknown[];    // kept for API compatibility; LatestNewsSection fetches its own data
  initialEvents: unknown[];  // kept for API compatibility; UpcomingEventsSection fetches its own data
  initialBoardMembers: BoardMember[];
  initialMembers: MemberProfile[];
}

function parseJson(v: unknown): Record<string, unknown> {
  if (!v) return {};
  if (typeof v === "string") { try { return JSON.parse(v); } catch { return {}; } }
  return v as Record<string, unknown>;
}
/**
 * Public homepage always uses the published snapshot when available.
 * Falls back to draft data so sections created before V62 still render.
 */
function sectionConfig(s: SiteSection): Record<string, unknown> {
  return parseJson(s.publishedConfig ?? s.config);
}
function sectionData(s: SiteSection): Record<string, unknown> {
  return parseJson(s.publishedData ?? s.data);
}

export default function HomepageClient({ initialSections, initialBoardMembers, initialMembers }: Props) {
  const sections = initialSections;
  const boardMembers = initialBoardMembers;
  const members = initialMembers;

  return (
    <div>
      {sections.map((s) => {
        if (s.componentType === "hero-carousel") return <HeroCarouselSection key={s.id} config={sectionConfig(s)} />;
        if (s.componentType === "hero" || s.slug === "hero-banner") return <HeroSection key={s.id} config={sectionConfig(s)} />;
        if (s.componentType === "card-group") return <OurFocusAreasSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "cta") return <JoinOurCommunitySection key={s.id} config={sectionConfig(s)} />;
        if (s.componentType === "latest-news-feed") return <LatestNewsSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "upcoming-events-feed") return <UpcomingEventsSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "stats" || s.componentType === "counter") return <StatisticsSection key={s.id} data={sectionData(s)} config={sectionConfig(s)} />;
        if (s.componentType === "testimonial" || s.componentType === "testimonials") return <TestimonialsSection key={s.id} data={sectionData(s)} config={sectionConfig(s)} boardMembers={boardMembers} memberProfiles={members} />;
        if (s.componentType === "newsletter") return <NewsletterSection key={s.id} config={sectionConfig(s)} />;
        if (s.componentType === "contact-form") return <ContactFormSection key={s.id} config={sectionConfig(s)} />;
        if (s.componentType === "publications-carousel") return <PublicationsCarouselSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "faq") return <FaqSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "team") return <TeamSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "timeline") return <TimelineSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "banner") return <BannerSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "custom") return <CustomSection key={s.id} blocks={(sectionData(s).blocks as Block[]) || []} />;
        // ---- new 44 template types ----
        if (s.componentType === "hero-split")            return <HeroSplitSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "hero-minimal")          return <HeroMinimalSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "hero-announcement")     return <HeroAnnouncementSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "testimonials-carousel") return <TestimonialsCarouselSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "testimonials-wall")     return <TestimonialsWallSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "stats-progress")        return <StatsProgressSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "stats-impact")          return <StatsImpactSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "cta-newsletter")        return <CtaNewsletterSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "waitlist-form")         return <WaitlistFormSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "multi-step-form")       return <MultiStepFormSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "team-leadership")       return <TeamLeadershipSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "team-compact")          return <TeamCompactSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "features-grid")         return <FeaturesGridSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "feature-highlight")     return <FeatureHighlightSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "features-alternating")  return <FeaturesAlternatingSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "blog-grid")             return <BlogGridSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "blog-featured")         return <BlogFeaturedSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "portfolio-masonry")     return <PortfolioMasonrySection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "case-study-cards")      return <CaseStudyCardsSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "pricing-cards")         return <PricingCardsSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "pricing-table")         return <PricingTableSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "gallery-grid")          return <GalleryGridSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "image-slider")          return <ImageSliderSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "video-hero")            return <VideoHeroSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "video-embed")           return <VideoEmbedSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "steps-horizontal")      return <StepsHorizontalSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "steps-vertical")        return <StepsVerticalSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "logos-strip")           return <LogosStripSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "logos-marquee")         return <LogosMarqueeSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "tabs-content")          return <TabsContentSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "comparison-slider")     return <ComparisonSliderSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "competitor-comparison") return <CompetitorComparisonSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "map-location")          return <MapLocationSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "offices-map")           return <OfficesMapSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "rich-text")             return <RichTextSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "split-content")         return <SplitContentSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "icon-list")             return <IconListSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "services-cards")        return <ServicesCardsSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "news-horizontal")       return <NewsCardsHorizontalSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "jobs-feed")             return <JobsFeedSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "members-feed")          return <MembersFeedSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "podcast")               return <PodcastSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "social-feed")           return <SocialFeedSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "about")                 return <AboutSection key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        if (s.componentType === "awards")                return <AwardsSectionComponent key={s.id} config={sectionConfig(s)} data={sectionData(s)} />;
        return null;
      })}
      {/* Always show news + events if no dedicated sections for them */}
      {!sections.some((s) => s.componentType === "latest-news-feed") && <LatestNewsSection />}
      {!sections.some((s) => s.componentType === "upcoming-events-feed") && <UpcomingEventsSection />}
    </div>
  );
}
