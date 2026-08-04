"use client";

/**
 * JoinOurCommunitySection — CTA banner with heading, subtitle, and a single button.
 *
 * Design:
 *   - Top SVG wave that connects seamlessly with the previous section
 *   - Rich diagonal gradient (soil-dark → soil-clay) with a subtle noise texture overlay
 *   - Frosted-glass content panel in the centre
 *   - Bottom SVG wave that fades into the statistics section below
 *
 * Config keys: titleEn / titleAr, subtitleEn / subtitleAr,
 *              buttonLabelEn / buttonLabelAr, buttonUrl
 *
 * All text comes from the DB (site_sections.config).
 * Returns null when no title is available.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

interface JoinOurCommunitySectionProps {
  config?: Record<string, unknown>;
}

export function JoinOurCommunitySection({ config = {} }: JoinOurCommunitySectionProps) {
  const { language } = useLanguage();

  const heading =
    language === "ar"
      ? (config.titleAr as string) || (config.title as string) || ""
      : (config.titleEn as string) || (config.title as string) || "";

  if (!heading) return null;

  const subtitle =
    language === "ar"
      ? (config.subtitleAr as string) || (config.subtitle as string) || ""
      : (config.subtitleEn as string) || (config.subtitle as string) || "";

  const buttonLabel =
    language === "ar"
      ? (config.buttonLabelAr as string) || (config.buttonLabel as string) || ""
      : (config.buttonLabelEn as string) || (config.buttonLabel as string) || "";

  const buttonUrl = (config.buttonUrl as string) || "/members";

  return (
    <section className="relative overflow-hidden text-white" aria-label={heading}>
      {/* ── Rich diagonal background gradient ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(150deg, var(--style-gradient-hero-start) 0%, var(--style-gradient-hero-mid) 45%, var(--style-gradient-hero-end) 100%)",
        }}
      />

      {/* ── Subtle noise / grain texture overlay ── */}
      <div className="absolute inset-0 z-0 bg-noise opacity-40 pointer-events-none" />

      {/* ── Top wave (connects from previous section) ── */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none leading-none">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-14">
          <path d="M0,0 C360,56 1080,0 1440,40 L1440,0 Z" fill="white" fillOpacity="1" />
        </svg>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-20 py-20 md:py-28 px-4">
        <div className="container mx-auto flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            /* Frosted glass panel */
            className="
              w-full max-w-2xl text-center
              rounded-3xl
              border border-white/25
              bg-white/10
              backdrop-blur-xl
              shadow-[0_4px_24px_rgba(0,0,0,0.18),0_16px_48px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.25)]
              px-8 py-10 md:px-12 md:py-14
            "
          >
            {/* Accent top-bar on the panel */}
            <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />

            <h2 className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]`}>
              {heading}
            </h2>

            {subtitle && (
              <p className="text-white/80 fluid-lg max-w-xl mx-auto mb-8 leading-relaxed">{subtitle}</p>
            )}

            {buttonLabel && (
              <Link href={buttonUrl}>
                <Button
                  size="lg"
                  className="bg-soil-dark hover:bg-deep-soil text-white font-semibold px-10 rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-200"
                >
                  {buttonLabel}
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Bottom wave (transitions into statistics section) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none leading-none">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-14">
          <path d="M0,40 C360,0 1080,56 1440,16 L1440,56 L0,56 Z" fill="white" fillOpacity="0.08" />
          <path d="M0,56 C480,28 960,56 1440,32 L1440,56 Z" fill="white" fillOpacity="0.06" />
        </svg>
      </div>
    </section>
  );
}
