"use client";

/**
 * HeroSection — hero banner with bilingual heading, description, and two action buttons.
 *
 * Config keys consumed:
 *   titleEn / titleAr (falls back to `title`)
 *   subtitleAr
 *   descriptionEn / descriptionAr (falls back to `description`)
 *   primaryButtonLabel / primaryButtonLabelEn / primaryButtonLabelAr
 *   primaryButtonUrl
 *   secondaryButtonLabel / secondaryButtonLabelEn / secondaryButtonLabelAr
 *   secondaryButtonUrl
 *   backgroundImage (optional)
 *
 * All text comes from the DB (site_sections.config).  No hardcoded fallback
 * strings — if a field is missing the element is simply omitted.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { ParticleField } from "@/components/ui/particle-field";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TextReveal } from "@/components/ui/text-reveal";
import { useLanguage } from "@/lib/language-context";

interface HeroSectionProps {
  config?: Record<string, unknown>;
}

export function HeroSection({ config = {} }: HeroSectionProps) {
  const { language } = useLanguage();

  const subtitleAr = (config.subtitleAr as string) || "";

  const title =
    language === "ar"
      ? (config.titleAr as string) || (config.title as string) || ""
      : (config.titleEn as string) || (config.title as string) || "";

  const description =
    language === "ar"
      ? (config.descriptionAr as string) || (config.description as string) || ""
      : (config.descriptionEn as string) || (config.description as string) || "";

  const primaryLabel =
    language === "ar"
      ? (config.primaryButtonLabelAr as string) || (config.primaryButtonLabel as string) || ""
      : (config.primaryButtonLabelEn as string) || (config.primaryButtonLabel as string) || "";

  const primaryUrl = (config.primaryButtonUrl as string) || "/members";

  const secondaryLabel =
    language === "ar"
      ? (config.secondaryButtonLabelAr as string) || (config.secondaryButtonLabel as string) || ""
      : (config.secondaryButtonLabelEn as string) || (config.secondaryButtonLabel as string) || "";

  const secondaryUrl = (config.secondaryButtonUrl as string) || "/about";
  const backgroundImage = (config.backgroundImage as string) || "";

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{
        background: backgroundImage
          ? `url(${backgroundImage}) center/cover no-repeat`
          : "linear-gradient(135deg, var(--style-gradient-hero-start) 0%, var(--style-gradient-hero-mid) 50%, var(--style-gradient-hero-end) 100%)",
      }}
    >
      <ParticleField count={25} color="215, 204, 200" speed={0.2} />
      <div className="absolute inset-0 bg-noise opacity-30" />
      <div className="absolute inset-0 opacity-10 scroll-parallax">
        <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <path
            d="M0,200 C200,50 400,350 600,200 C800,50 1000,300 1000,200 L1000,400 L0,400 Z"
            fill="#D7CCC8"
          />
          <path
            d="M0,300 C300,100 500,400 800,300 C900,200 1000,350 1000,300 L1000,400 L0,400 Z"
            fill="#8D6E63"
            opacity="0.5"
          />
          <circle cx="150" cy="250" r="3" fill="#D7CCC8" />
          <circle cx="400" cy="180" r="4" fill="#D7CCC8" />
          <circle cx="750" cy="300" r="2" fill="#D7CCC8" />
          <circle cx="300" cy="120" r="3" fill="#D7CCC8" />
          <circle cx="600" cy="150" r="4" fill="#D7CCC8" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-32 relative z-10">
        <div className="max-w-3xl" dir={language === "ar" ? "rtl" : "ltr"}>
          {subtitleAr && (
            <p className="text-soil-sand fluid-lg font-medium mb-2">{subtitleAr}</p>
          )}
          {title && (
            <TextReveal
              as="h1"
              mode="word"
              delay={0.15}
              className={`${almarai.className} fluid-4xl md:fluid-5xl lg:fluid-6xl font-bold leading-tight mb-6`}
            >
              {title}
            </TextReveal>
          )}
          {description && (
            <p className="text-white/80 fluid-lg md:fluid-xl max-w-2xl mb-10 leading-relaxed">
              {description}
            </p>
          )}
          {(primaryLabel || secondaryLabel) && (
            <div className="flex flex-wrap gap-4">
              {primaryLabel && (
                <Link href={primaryUrl}>
                  <MagneticWrapper pullDistance={15}>
                    <Button
                      size="lg"
                      className="bg-forest hover:bg-forest-light text-white font-semibold px-8"
                    >
                      {primaryLabel}
                    </Button>
                  </MagneticWrapper>
                </Link>
              )}
              {secondaryLabel && (
                <Link href={secondaryUrl}>
                  <MagneticWrapper pullDistance={15}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white px-8"
                    >
                      {secondaryLabel}
                    </Button>
                  </MagneticWrapper>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
