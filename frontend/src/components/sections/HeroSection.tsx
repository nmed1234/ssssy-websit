"use client";

/**
 * HeroSection — Advanced hero banner with pure soil/brown/earth palette.
 * No green tones — full spectrum from dark clay to warm sand.
 *
 * Visual techniques:
 *  • 8-stop deep-clay → warm-sand gradient (background)
 *  • Radial ambient glows: warm ochre TL, terracotta BR, centre-bottom bloom
 *  • Floating soil micro-particles with staggered pulse animation
 *  • Animated SVG soil-horizon waves (3 layers: sand, rose-clay, dark-brown)
 *  • One-shot horizontal sheen sweep on mount
 *  • Grain noise texture overlay
 *  • Glassmorphism stat badges
 *  • Primary CTA: rich brown gradient + golden-sand shine sweep on hover
 *  • Secondary CTA: soil-tinted glassmorphism
 *  • Staggered text reveal animations
 *  • Magnetic wrapper on CTAs
 *  • Bottom wave transition to page background
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
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, FlaskConical } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { ParticleField } from "@/components/ui/particle-field";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useLanguage } from "@/lib/language-context";

interface HeroSectionProps {
  config?: Record<string, unknown>;
}

/* ─── Stat badge ────────────────────────────────────────────────────────── */
const StatBadge = ({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.65, duration: 0.6, ease: "easeOut" }}
    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl"
    style={{
      background: "rgba(62,39,35,0.30)",
      backdropFilter: "blur(14px)",
      border: "1px solid rgba(215,204,200,0.20)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
    }}
  >
    <Icon className="w-3.5 h-3.5 opacity-60" style={{ color: "#D7CCC8" }} />
    <span className="text-white font-bold text-sm tabular-nums">{value}</span>
    <span className="text-xs" style={{ color: "rgba(215,204,200,0.58)" }}>{label}</span>
  </motion.div>
);

/* ─── Floating soil particle ─────────────────────────────────────────────── */
const PARTICLES = [
  { cx: "8%",  cy: "22%", r: 3 },
  { cx: "18%", cy: "65%", r: 2 },
  { cx: "72%", cy: "18%", r: 4 },
  { cx: "85%", cy: "55%", r: 2 },
  { cx: "45%", cy: "78%", r: 3 },
  { cx: "92%", cy: "30%", r: 2 },
  { cx: "58%", cy: "12%", r: 3 },
  { cx: "30%", cy: "88%", r: 2 },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
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

  const secondaryUrl   = (config.secondaryButtonUrl as string) || "/about";
  const backgroundImage = (config.backgroundImage as string) || "";

  /* ── Background style ── */
  const bgStyle = backgroundImage
    ? {
        background: `linear-gradient(135deg, rgba(26,14,10,0.96) 0%, rgba(62,39,35,0.84) 38%, rgba(109,76,65,0.60) 100%), url(/_next/image?url=${encodeURIComponent(backgroundImage)}&w=1920&q=85) center/cover no-repeat`,
      }
    : {
        background: `linear-gradient(
          152deg,
          #1A0E0A 0%,
          #2C1810 10%,
          #3E2723 22%,
          #4E342E 36%,
          #5D4037 50%,
          #6D4C41 64%,
          #8D6E63 78%,
          #A1887F 90%,
          #BCAAA4 100%
        )`,
      };

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{ ...bgStyle, minHeight: "clamp(540px, 88vh, 820px)" }}
    >
      {/* ── Grain noise texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "130px",
          opacity: 0.032,
        }}
      />

      {/* ── Floating particle network ── */}
      <ParticleField count={30} color="215, 190, 165" speed={0.18} />

      {/* ── Radial glow — top-left warm ochre ── */}
      <div
        className="absolute -top-28 -left-28 w-[580px] h-[580px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(141,95,70,0.32) 0%, transparent 66%)",
        }}
      />
      {/* ── Radial glow — bottom-right terracotta depth ── */}
      <div
        className="absolute -bottom-20 -right-20 w-[460px] h-[460px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(109,76,65,0.26) 0%, transparent 66%)",
        }}
      />
      {/* ── Centre-bottom warm earth bloom ── */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[260px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(90,55,30,0.20) 0%, transparent 70%)",
        }}
      />

      {/* ── One-shot horizontal sheen sweep on mount ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ x: "-140%", skewX: -18, opacity: 0 }}
          animate={{ x: "180%", skewX: -18, opacity: [0, 0.5, 0.5, 0] }}
          transition={{ delay: 0.8, duration: 3.0, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-y-0"
          style={{
            left: 0,
            width: "32%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(215,190,165,0.08) 45%, rgba(215,190,165,0.14) 50%, rgba(215,190,165,0.08) 55%, transparent 100%)",
          }}
        />
      </div>

      {/* ── Animated SVG soil-horizon waves ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <svg className="w-full h-full" viewBox="0 0 1200 500" preserveAspectRatio="none">
          {/* Top wave — pale sand */}
          <motion.path
            d="M0,190 C200,80 440,320 660,195 C880,70 1100,270 1200,195 L1200,500 L0,500 Z"
            fill="#D7CCC8"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
          />
          {/* Mid wave — rose clay */}
          <motion.path
            d="M0,305 C260,165 520,410 800,295 C960,215 1100,355 1200,295 L1200,500 L0,500 Z"
            fill="#BCAAA4"
            opacity="0.60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.60 }}
            transition={{ delay: 0.4, duration: 2 }}
          />
          {/* Bottom wave — dark brown */}
          <motion.path
            d="M0,385 C340,295 700,455 1000,375 C1100,335 1180,395 1200,375 L1200,500 L0,500 Z"
            fill="#8D6E63"
            opacity="0.50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.50 }}
            transition={{ delay: 0.8, duration: 2 }}
          />
        </svg>
      </div>

      {/* ── Floating soil micro-particles ── */}
      {PARTICLES.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: dot.cx,
            top: dot.cy,
            width: dot.r * 2,
            height: dot.r * 2,
            background: "radial-gradient(circle, #D7CCC8 0%, #BCAAA4 100%)",
            opacity: 0.35,
          }}
          animate={{ y: [0, -9, 0], opacity: [0.30, 0.58, 0.30] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Main content ── */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-24 md:py-36 relative z-10">
        <div className="max-w-3xl" dir={language === "ar" ? "rtl" : "ltr"}>

          {/* Eyebrow badge */}
          {subtitleAr && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0, duration: 0.7 }}
              className="inline-flex items-center gap-2.5 mb-5"
            >
              <span
                className="block w-8 h-px"
                style={{ background: "linear-gradient(90deg, #D7CCC8, #8D6E63)" }}
              />
              <span
                className="text-xs font-bold tracking-[0.22em] uppercase"
                style={{ color: "#BCAAA4" }}
              >
                {subtitleAr}
              </span>
            </motion.div>
          )}

          {/* Title */}
          {title && (
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.10, duration: 0.70, ease: "easeOut" }}
              className={`${almarai.className} font-bold leading-tight mb-4`}
              style={{
                fontSize: "clamp(2.1rem, 5.5vw, 3.8rem)",
                textShadow: "0 2px 24px rgba(20,10,5,0.55), 0 1px 4px rgba(0,0,0,0.35)",
              }}
            >
              {title}
            </motion.h1>
          )}

          {/* Animated accent separator */}
          <motion.div
            initial={{ scaleX: 0, originX: language === "ar" ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.65, ease: "easeOut" }}
            className="w-20 mb-6"
            style={{
              height: "2px",
              background: "linear-gradient(90deg, #D7CCC8 0%, #BCAAA4 30%, #8D6E63 65%, transparent 100%)",
              borderRadius: "2px",
            }}
          />

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.7, ease: "easeOut" }}
              className="leading-relaxed max-w-2xl mb-9"
              style={{
                color: "rgba(255,255,255,0.74)",
                fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                textShadow: "0 1px 8px rgba(10,4,2,0.50)",
              }}
            >
              {description}
            </motion.p>
          )}

          {/* Stat badges row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-wrap gap-3 mb-9"
          >
            <StatBadge icon={Leaf} value="500+" label={language === "ar" ? "باحث" : "Researchers"} />
            <StatBadge icon={FlaskConical} value="1200+" label={language === "ar" ? "دراسة" : "Studies"} />
          </motion.div>

          {/* CTA buttons */}
          {(primaryLabel || secondaryLabel) && (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: "easeOut" }}
              className="flex flex-wrap gap-4"
            >
              {primaryLabel && (
                <Link href={primaryUrl}>
                  <MagneticWrapper pullDistance={12}>
                    <button
                      className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm md:text-base text-white overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                      style={{
                        background: "linear-gradient(135deg, #6D4C41 0%, #4E342E 42%, #3E2723 100%)",
                        boxShadow:
                          "0 4px 24px rgba(62,39,35,0.55), 0 1px 0 rgba(215,204,200,0.14) inset, 0 -1px 0 rgba(0,0,0,0.25) inset",
                        border: "1px solid rgba(215,204,200,0.18)",
                      }}
                    >
                      <span className="relative z-10">{primaryLabel}</span>
                      <ArrowRight
                        className={`relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${language === "ar" ? "rotate-180" : ""}`}
                      />
                      {/* Golden-sand shine sweep on hover */}
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background:
                            "linear-gradient(120deg, transparent 28%, rgba(215,190,165,0.22) 50%, transparent 72%)",
                        }}
                      />
                    </button>
                  </MagneticWrapper>
                </Link>
              )}
              {secondaryLabel && (
                <Link href={secondaryUrl}>
                  <MagneticWrapper pullDistance={12}>
                    <button
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                      style={{
                        background: "rgba(62,39,35,0.28)",
                        backdropFilter: "blur(14px)",
                        border: "1px solid rgba(215,204,200,0.26)",
                        color: "rgba(255,255,255,0.84)",
                        boxShadow: "0 2px 16px rgba(20,10,5,0.28)",
                      }}
                    >
                      {secondaryLabel}
                    </button>
                  </MagneticWrapper>
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Bottom wave transition ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-10 md:h-16 block">
          <path
            d="M0,36 C240,72 480,0 720,36 C960,72 1200,12 1440,36 L1440,72 L0,72 Z"
            fill="hsl(var(--background))"
            opacity="0.95"
          />
        </svg>
      </div>
    </section>
  );
}
