"use client";

/**
 * HeroCarouselSection — multi-slide, autoplay hero carousel.
 *
 * Config keys:
 *   slides[]         — array of slide objects (see SlideConfig below)
 *   transitionStyle  — "slide" (default) | "fade" | "ken-burns"
 *   autoplay         — boolean string "true"/"false" or boolean (default true)
 *   autoplayInterval — number ms (default 5000)
 *   showArrows       — boolean (default true)
 *   showDots         — boolean (default true)
 *
 * Each slide:
 *   titleEn / titleAr, subtitleAr, descriptionEn / descriptionAr,
 *   primaryButtonLabelEn / primaryButtonLabelAr, primaryButtonUrl,
 *   secondaryButtonLabelEn / secondaryButtonLabelAr, secondaryButtonUrl,
 *   backgroundImage
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { ParticleField } from "@/components/ui/particle-field";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useLanguage } from "@/lib/language-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SlideConfig {
  titleEn?: string;
  titleAr?: string;
  subtitleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  primaryButtonLabelEn?: string;
  primaryButtonLabelAr?: string;
  primaryButtonUrl?: string;
  secondaryButtonLabelEn?: string;
  secondaryButtonLabelAr?: string;
  secondaryButtonUrl?: string;
  backgroundImage?: string;
}

interface HeroCarouselSectionProps {
  config?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseBool(val: unknown, defaultVal: boolean): boolean {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() !== "false";
  return defaultVal;
}

// Dark gradient overlay so text is always legible over photos
const OVERLAY =
  "linear-gradient(135deg, rgba(62,39,35,0.78) 0%, rgba(93,64,55,0.62) 50%, rgba(55,71,79,0.52) 100%)";

// Ken-Burns keyframes injected once
const KB_STYLE = `
@keyframes kenBurns {
  0%   { transform: scale(1)    translateX(0)      translateY(0); }
  50%  { transform: scale(1.08) translateX(-1%)    translateY(-1%); }
  100% { transform: scale(1)    translateX(0)      translateY(0); }
}
.kb-bg { animation: kenBurns 12s ease-in-out infinite; }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeroCarouselSection({ config = {} }: HeroCarouselSectionProps) {
  const { language, direction } = useLanguage();
  const isRtl = direction === "rtl";

  // Parse config
  const rawSlides = (config.slides as SlideConfig[] | undefined) ?? [];
  const transitionStyle = (config.transitionStyle as string) || "slide";
  const autoplay       = parseBool(config.autoplay, true);
  const interval       = Number(config.autoplayInterval) || 5000;
  const showArrows     = parseBool(config.showArrows, true);
  const showDots       = parseBool(config.showDots, true);

  const [current, setCurrent] = useState(0);
  const [dir, setDir]         = useState(1); // 1 = forward, -1 = backward
  const isPaused              = useRef(false);
  const total                 = rawSlides.length;

  const goTo = useCallback(
    (idx: number, direction = 1) => {
      setDir(direction);
      setCurrent((idx + total) % total);
    },
    [total],
  );

  const prev = () => goTo(current - 1, -1);
  const next = () => goTo(current + 1, 1);

  // Autoplay
  useEffect(() => {
    if (!autoplay || total <= 1) return;
    const id = setInterval(() => {
      if (!isPaused.current) {
        setDir(1);
        setCurrent((c) => (c + 1) % total);
      }
    }, interval);
    return () => clearInterval(id);
  }, [autoplay, interval, total]);

  if (total === 0) return null;

  const slide = rawSlides[current];
  const title =
    language === "ar"
      ? slide.titleAr || slide.titleEn || ""
      : slide.titleEn || slide.titleAr || "";
  const subtitle = slide.subtitleAr || "";
  const description =
    language === "ar"
      ? slide.descriptionAr || slide.descriptionEn || ""
      : slide.descriptionEn || slide.descriptionAr || "";
  const primaryLabel =
    language === "ar"
      ? slide.primaryButtonLabelAr || slide.primaryButtonLabelEn || ""
      : slide.primaryButtonLabelEn || slide.primaryButtonLabelAr || "";
  const primaryUrl = slide.primaryButtonUrl || "/members";
  const secondaryLabel =
    language === "ar"
      ? slide.secondaryButtonLabelAr || slide.secondaryButtonLabelEn || ""
      : slide.secondaryButtonLabelEn || slide.secondaryButtonLabelAr || "";
  const secondaryUrl = slide.secondaryButtonUrl || "/about";
  const bg           = slide.backgroundImage || "";

  // Framer-motion variants
  const slideVariants = {
    enter: (d: number) => ({
      x: transitionStyle === "slide" ? (isRtl ? -d * 100 : d * 100) + "%" : 0,
      opacity: transitionStyle === "fade" ? 0 : 1,
    }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({
      x: transitionStyle === "slide" ? (isRtl ? d * 100 : -d * 100) + "%" : 0,
      opacity: transitionStyle === "fade" ? 0 : 1,
    }),
  };

  const transition = transitionStyle === "fade"
    ? ({ duration: 0.7, ease: "easeInOut" } as const)
    : ({ duration: 0.55, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] });

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{ minHeight: "500px" }}
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      {/* Inject ken-burns keyframes once */}
      {transitionStyle === "ken-burns" && (
        <style dangerouslySetInnerHTML={{ __html: KB_STYLE }} />
      )}

      {/* ── Slide background ───────────────────────────────────────────── */}
      <AnimatePresence initial={false} custom={dir} mode="sync">
        <motion.div
          key={current}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="absolute inset-0"
        >
          {bg ? (
            <div
              className={`absolute inset-0 bg-center bg-cover ${transitionStyle === "ken-burns" ? "kb-bg" : ""}`}
              style={{ backgroundImage: `${OVERLAY}, url(${bg})` }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--style-gradient-hero-start) 0%, var(--style-gradient-hero-mid) 50%, var(--style-gradient-hero-end) 100%)",
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Particle field + decorative SVG (preserved from HeroSection) ─ */}
      <ParticleField count={20} color="215, 204, 200" speed={0.18} />
      <div className="absolute inset-0 bg-noise opacity-25 pointer-events-none" />
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <path d="M0,200 C200,50 400,350 600,200 C800,50 1000,300 1000,200 L1000,400 L0,400 Z" fill="#D7CCC8" />
          <path d="M0,300 C300,100 500,400 800,300 C900,200 1000,350 1000,300 L1000,400 L0,400 Z" fill="#8D6E63" opacity="0.5" />
        </svg>
      </div>

      {/* ── Slide text content ─────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-20 md:py-36 relative z-10">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={`text-${current}`}
            custom={dir}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="max-w-3xl"
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            {subtitle && language === "ar" && (
              <p className="text-soil-sand fluid-lg font-medium mb-2">{subtitle}</p>
            )}
            {title && (
              <h1
                className={`${almarai.className} fluid-4xl md:fluid-5xl lg:fluid-6xl font-bold leading-tight mb-6`}
              >
                {title}
              </h1>
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
                      <Button size="lg" className="bg-forest hover:bg-forest-light text-white font-semibold px-8">
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Arrows ─────────────────────────────────────────────────────── */}
      {showArrows && total > 1 && (
        <>
          <button
            onClick={isRtl ? next : prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={isRtl ? prev : next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* ── Dots ───────────────────────────────────────────────────────── */}
      {showDots && total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {rawSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/45 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
