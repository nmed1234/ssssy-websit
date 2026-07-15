"use client";

/**
 * JoinOurCommunitySection — CTA banner with heading, subtitle, and a single button.
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
    <section
      className="py-16 md:py-20 text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--style-gradient-hero-mid), var(--style-gradient-hero-end))",
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold mb-4`}>
            {heading}
          </h2>
          {subtitle && (
            <p className="text-white/80 fluid-lg max-w-2xl mx-auto mb-8">{subtitle}</p>
          )}
          {buttonLabel && (
            <Link href={buttonUrl}>
              <Button size="lg" className="bg-soil-dark hover:bg-deep-soil text-white font-semibold px-10">
                {buttonLabel}
              </Button>
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
