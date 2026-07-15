"use client";

/**
 * OurFocusAreasSection — card-group (3-column grid of feature cards).
 *
 * Config keys: titleEn / titleAr (falls back to `title`)
 * Data keys:   items[].titleEn / titleAr, items[].descriptionEn / descriptionAr
 *
 * All text comes from the DB (site_sections.config / .data).
 * Returns null when no items are provided.
 */

import { motion } from "framer-motion";
import { almarai } from "@/lib/fonts";
import { StyleCard, StyleCardContent } from "@/components/ui/style-card";
import { TextReveal } from "@/components/ui/text-reveal";
import { listItem } from "@/lib/animation-variants";
import { useLanguage } from "@/lib/language-context";

interface OurFocusAreasSectionProps {
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export function OurFocusAreasSection({ config = {}, data = {} }: OurFocusAreasSectionProps) {
  const { language } = useLanguage();

  const rawItems = (data.items ?? config.items) as
    | {
        title?: string;
        titleEn?: string;
        titleAr?: string;
        description?: string;
        descriptionEn?: string;
        descriptionAr?: string;
      }[]
    | undefined;

  if (!rawItems || rawItems.length === 0) return null;

  const items = rawItems.map((item) => ({
    title:
      language === "ar"
        ? item.titleAr || item.title || ""
        : item.titleEn || item.title || "",
    description:
      language === "ar"
        ? item.descriptionAr || item.description || ""
        : item.descriptionEn || item.description || "",
  }));

  const heading =
    language === "ar"
      ? (config.titleAr as string) || (config.title as string) || ""
      : (config.titleEn as string) || (config.title as string) || "";

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {heading && (
          <TextReveal
            as="h2"
            className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-soil-dark text-center mb-12`}
          >
            {heading}
          </TextReveal>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              variants={listItem}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <StyleCard className="h-full">
                <StyleCardContent>
                  <h3 className="font-heading text-xl font-semibold text-soil-dark mb-3">
                    {item.title}
                  </h3>
                  <p className="text-earth-gray leading-relaxed">{item.description}</p>
                </StyleCardContent>
              </StyleCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
