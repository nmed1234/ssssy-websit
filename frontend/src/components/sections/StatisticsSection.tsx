"use client";

/**
 * StatisticsSection — animated counters grid.
 *
 * Design:
 *   - Top SVG wave that connects seamlessly from the CTA section above
 *   - Rich diagonal gradient continuing the soil-dark palette
 *   - Each stat counter lives in a frosted-glass panel with subtle border and shadow
 *   - Bottom white fade so the section transitions cleanly to white/light sections below
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
    <section className="relative overflow-hidden text-white scroll-fade-in">
      {/* ── Rich diagonal background — continues from the CTA section palette ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, var(--style-gradient-hero-end) 0%, var(--style-gradient-hero-mid) 50%, var(--style-gradient-hero-start) 100%)",
        }}
      />

      {/* ── Subtle noise texture overlay ── */}
      <div className="absolute inset-0 z-0 bg-noise opacity-30 pointer-events-none" />

      {/* ── Soft radial glow in the centre ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(109,76,65,0.28) 0%, transparent 70%)",
        }}
      />

      {/* ── Top wave — connects from CTA / previous section ── */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none leading-none">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-14">
          {/* Two-layer wave for depth */}
          <path d="M0,32 C480,0 960,56 1440,20 L1440,0 L0,0 Z" fill="white" fillOpacity="0.09" />
          <path d="M0,48 C360,16 1080,56 1440,28 L1440,0 L0,0 Z" fill="white" fillOpacity="0.06" />
        </svg>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-20 py-20 md:py-28">
        <div className="container mx-auto px-4">
          {heading && (
            <TextReveal
              as="h2"
              className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-center mb-14 text-soil-sand drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]`}
            >
              {heading}
            </TextReveal>
          )}

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div key={i} variants={listItem} className="group">
                {/* Frosted glass stat card */}
                <div
                  className="
                    relative text-center
                    rounded-2xl
                    border border-white/20
                    bg-white/10
                    backdrop-blur-xl
                    shadow-[0_2px_12px_rgba(0,0,0,0.14),0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.20)]
                    transition-all duration-300
                    group-hover:bg-white/18
                    group-hover:border-white/35
                    group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.20),0_14px_40px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.30)]
                    group-hover:-translate-y-2
                    px-4 py-8 md:py-10
                  "
                >
                  {/* Thin top accent line */}
                  <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-soil-sand/60 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/12 border border-white/20 mb-5 group-hover:bg-white/20 group-hover:border-white/35 transition-colors duration-300">
                    <stat.Icon className="h-7 w-7 text-soil-sand" />
                  </div>

                  <p className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                    <AnimatedCounter from={0} to={stat.value} duration={2} suffix={stat.suffix} />
                  </p>

                  <p className="fluid-sm text-white/70 leading-snug">
                    {language === "ar" ? stat.labelAr : stat.labelEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Bottom fade to white — transitions cleanly to sections below ── */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none" />
    </section>
  );
}
