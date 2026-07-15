"use client";

/**
 * StatisticsSection — animated counters grid.
 *
 * Data keys: items[].value, items[].titleEn / titleAr (falls back to `title`)
 * Config keys: titleEn / titleAr (falls back to `title`)
 *
 * All text and numbers come from the DB (site_sections.data / .config).
 * Returns null when no items are available.
 */

import { motion } from "framer-motion";
import { almarai } from "@/lib/fonts";
import { CheckCircle, Calendar, Users, BookOpen } from "lucide-react";
import { staggerContainer, listItem } from "@/lib/animation-variants";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TextReveal } from "@/components/ui/text-reveal";
import { useLanguage } from "@/lib/language-context";

// Icon pool — cycled by index when items arrive from the DB
const ICON_POOL = [CheckCircle, Users, BookOpen, Calendar];

interface StatisticsSectionProps {
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export function StatisticsSection({ data = {}, config = {} }: StatisticsSectionProps) {
  const { language } = useLanguage();

  const rawItems = data.items as
    | { value: string | number; title?: string; titleEn?: string; titleAr?: string }[]
    | undefined;

  if (!rawItems || rawItems.length === 0) return null;

  const stats = rawItems.map((item, i) => {
    const raw = String(item.value);
    const numericValue = parseInt(raw.replace(/\D/g, ""), 10) || 0;
    const suffix = raw.replace(/[\d]/g, "") || "";
    return {
      Icon: ICON_POOL[i % ICON_POOL.length],
      labelEn: (item.titleEn as string) || (item.title as string) || "",
      labelAr: (item.titleAr as string) || (item.title as string) || "",
      value: numericValue,
      suffix,
    };
  });

  const heading =
    language === "ar"
      ? (config.titleAr as string) || (config.title as string) || ""
      : (config.titleEn as string) || (config.title as string) || "";

  return (
    <section
      className="py-16 md:py-20 text-white scroll-fade-in"
      style={{
        background:
          "linear-gradient(to right, var(--style-gradient-hero-start), var(--style-gradient-hero-end))",
      }}
    >
      <div className="container mx-auto px-4">
        {heading && (
          <TextReveal
            as="h2"
            className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-center mb-12 text-soil-sand`}
          >
            {heading}
          </TextReveal>
        )}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={listItem} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                <stat.Icon className="h-8 w-8 text-soil-sand" />
              </div>
              <p className="text-4xl font-bold text-white mb-1">
                <AnimatedCounter from={0} to={stat.value} duration={2} suffix={stat.suffix} />
              </p>
              <p className="fluid-sm text-white/70">
                {language === "ar" ? stat.labelAr : stat.labelEn}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
