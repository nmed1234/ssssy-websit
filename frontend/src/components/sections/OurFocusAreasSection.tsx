"use client";

/**
 * OurFocusAreasSection — card-group
 *
 * Design: Full-bleed soil-hands background (tall).
 * Section title floats over the image.
 * Cards live directly ON the image inside a translucent frosted-glass layer
 * so the soil texture shows through from behind each card.
 * The bottom of the section uses a subtle white fade so it connects cleanly
 * with the next section. Full RTL/LTR support.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import { almarai } from "@/lib/fonts";
import { TextReveal } from "@/components/ui/text-reveal";
import { useLanguage } from "@/lib/language-context";

interface OurFocusAreasSectionProps {
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export function OurFocusAreasSection({ config = {}, data = {} }: OurFocusAreasSectionProps) {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const rawItems = (data.items ?? config.items) as
    | {
        title?: string;
        titleEn?: string;
        titleAr?: string;
        description?: string;
        descriptionEn?: string;
        descriptionAr?: string;
        icon?: string;
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
    icon: item.icon || "",
  }));

  const heading =
    language === "ar"
      ? (config.titleAr as string) || (config.title as string) || ""
      : (config.titleEn as string) || (config.title as string) || "";

  return (
    <section
      className="relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ─── Full-bleed background image — tall enough to show hands clearly ─── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hands-soils.webp"
          alt=""
          fill
          priority
          className="object-cover object-[center_20%]"
          sizes="100vw"
        />
        {/* Gradient overlay: very light top, gentle vignette at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/35" />
      </div>

      {/* ─── All content sits on top of the image ─── */}
      <div className="relative z-10 flex flex-col min-h-[620px] md:min-h-[680px] lg:min-h-[720px]">

        {/* ── Section title ── */}
        {heading && (
          <div className={`pt-14 pb-10 px-6 md:px-12 lg:px-20 ${isRtl ? "text-right" : "text-left"}`}>
            <TextReveal
              as="h2"
              className={`
                ${almarai.className}
                text-3xl md:text-4xl lg:text-[2.8rem] font-bold text-white
                drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]
                leading-tight
              `}
            >
              {heading}
            </TextReveal>
            {/* Accent bar */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              style={{ transformOrigin: isRtl ? "right" : "left" }}
              className="mt-3 h-[3px] w-16 rounded-full bg-forest-light"
            />
          </div>
        )}

        {/* ── Cards grid — lives ON the image ── */}
        <div className="flex-1 flex items-end pb-14 px-6 md:px-10 lg:px-16">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="group"
              >
                {/* Glass card — bright frosted panel */}
                <div
                  className="
                    relative h-full overflow-hidden
                    rounded-2xl
                    border border-white/60
                    bg-white/52
                    backdrop-blur-xl
                    shadow-[0_2px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.80)]
                    transition-all duration-300
                    group-hover:bg-white/68
                    group-hover:border-white/80
                    group-hover:shadow-[0_6px_28px_rgba(0,0,0,0.16),0_16px_48px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.90)]
                    group-hover:-translate-y-2
                    cursor-default
                  "
                >
                  {/* Top accent line — forest green, full width */}
                  <div
                    className="
                      absolute top-0 left-0 right-0 h-[3px]
                      bg-gradient-to-r from-transparent via-forest to-transparent
                      opacity-60 group-hover:opacity-100
                      transition-opacity duration-300
                    "
                  />

                  <div className="p-5 md:p-6">
                    {/* Icon badge */}
                    {item.icon && (
                      <div
                        className="
                          w-11 h-11 rounded-xl flex items-center justify-center
                          bg-forest/10 border border-forest/20
                          text-xl mb-4
                          group-hover:bg-forest/18 group-hover:border-forest/35
                          transition-colors duration-300
                        "
                      >
                        {item.icon}
                      </div>
                    )}

                    <h3
                      className={`
                        font-heading font-bold text-white
                        text-[0.97rem] md:text-[1.02rem]
                        mb-2 leading-snug
                        drop-shadow-[0_1px_6px_rgba(0,0,0,0.70)]
                        group-hover:text-white transition-colors duration-300
                        ${isRtl ? "text-right" : "text-left"}
                      `}
                    >
                      {item.title}
                    </h3>

                    {/* Thin separator */}
                    <div className={`h-px w-8 bg-white/50 mb-2.5 group-hover:bg-white/80 transition-colors duration-300 ${isRtl ? "mr-0" : "ml-0"}`} />

                    <p
                      className={`
                        text-white/85 text-sm leading-relaxed
                        drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]
                        ${isRtl ? "text-right" : "text-left"}
                      `}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom fade to white — smooth transition to next section ─── */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none" />
    </section>
  );
}
