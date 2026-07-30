"use client";

/**
 * HeroCarouselSection — Premium full-viewport hero carousel.
 *
 * ── Design (pure soil / brown / earth palette — no greens) ──
 *  • Multi-stop deep-clay → rich-brown → warm-sand fallback gradient
 *  • Per-slide overlay gradients: dark clay left-vignette + bottom vignette
 *  • Ken-Burns pan/zoom on every background image (5 variants)
 *  • Smooth 1.1 s cross-fade between slides
 *  • Animated ambient radial glows (warm ochre + deep terracotta) per slide
 *  • Horizontal scan-line sheen animating across the frame (subtle)
 *  • Glassmorphism CTAs with soil-tone border + hover shine-sweep
 *  • Staggered text reveal (badge → title → subtitle → separator → desc → btns)
 *  • Live soil-gradient progress bar
 *  • Thumbnail navigator with active warm-sand glow ring
 *  • Grain-noise texture overlay (0.04 opacity)
 *  • Multi-path soil-horizon decorative waves at bottom
 *  • Page-background wave transition
 *  • RTL-aware arrows & text
 *  • Pause on hover / focus
 *
 * Config keys:
 *   slides[]         — array of SlideConfig objects
 *   transitionStyle  — "fade" | "slide" | "ken-burns"
 *   autoplay         — boolean (default true)
 *   autoplayInterval — ms (default 6500)
 *   showArrows       — boolean (default true)
 *   showDots         — boolean (default true)
 *   showThumbnails   — boolean (default true)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { useLanguage } from "@/lib/language-context";

// ---------------------------------------------------------------------------
// Static slide data
// ---------------------------------------------------------------------------

const DEFAULT_SLIDES = [
  {
    titleEn: "Syrian Soil Science Society",
    titleAr: "جمعية علوم التربة السورية",
    subtitleEn: "Advancing Knowledge · Protecting Land",
    subtitleAr: "تطوير المعرفة · حماية الأرض",
    badgeLabelEn: "Welcome",
    badgeLabelAr: "أهلاً وسهلاً",
    descriptionEn:
      "A leading scientific community dedicated to soil research, sustainable land management, and advancing agricultural science across Syria and the Arab world.",
    descriptionAr:
      "مجتمع علمي رائد مكرّس لأبحاث التربة وإدارة الأراضي المستدامة وتطوير العلوم الزراعية في سوريا والعالم العربي.",
    primaryButtonLabelEn: "Join the Society",
    primaryButtonLabelAr: "انضم للجمعية",
    primaryButtonUrl: "/members",
    secondaryButtonLabelEn: "Explore Research",
    secondaryButtonLabelAr: "استكشف الأبحاث",
    secondaryButtonUrl: "/publications",
    backgroundImage: "/images/slider/WhatsApp Image 2026-07-26 at 12.16.43 PM.jpeg",
    overlayColor: "rgba(44,26,18,0.78)",
  },
  {
    titleEn: "Laboratory Research",
    titleAr: "البحث المختبري",
    subtitleEn: "Precision Soil Analysis",
    subtitleAr: "تحليل دقيق للتربة",
    badgeLabelEn: "Research",
    badgeLabelAr: "بحث علمي",
    descriptionEn:
      "Our researchers pioneer innovative approaches to soil analysis, classification, and conservation — building a sustainable future for Syrian agriculture.",
    descriptionAr:
      "يرتاد باحثونا أساليب مبتكرة في تحليل التربة وتصنيفها وصونها.",
    primaryButtonLabelEn: "View Publications",
    primaryButtonLabelAr: "عرض المنشورات",
    primaryButtonUrl: "/publications",
    secondaryButtonLabelEn: "Our Members",
    secondaryButtonLabelAr: "أعضاؤنا",
    secondaryButtonUrl: "/members",
    backgroundImage: "/images/slider/Gemini_Generated_Image_hnvytbhnvytbhnvy.png",
    overlayColor: "rgba(62,39,35,0.74)",
  },
  {
    titleEn: "Advanced Soil Mapping",
    titleAr: "رسم خرائط التربة المتقدم",
    subtitleEn: "Data-Driven Land Management",
    subtitleAr: "إدارة الأراضي بالبيانات",
    badgeLabelEn: "Innovation",
    badgeLabelAr: "ابتكار",
    descriptionEn:
      "Cutting-edge GIS and remote sensing technologies map Syria's agricultural landscape for informed land-use decisions.",
    descriptionAr:
      "تقنيات نظم المعلومات الجغرافية والاستشعار عن بعد ترسم المشهد الزراعي في سوريا.",
    primaryButtonLabelEn: "Upcoming Events",
    primaryButtonLabelAr: "الفعاليات القادمة",
    primaryButtonUrl: "/events",
    secondaryButtonLabelEn: "Publications",
    secondaryButtonLabelAr: "المنشورات",
    secondaryButtonUrl: "/publications",
    backgroundImage: "/images/slider/WhatsApp Image 2026-03-24 at 1.32.59 PM.jpeg",
    overlayColor: "rgba(78,52,46,0.72)",
  },
  {
    titleEn: "Modern Soil Laboratory",
    titleAr: "مختبر تربة حديث",
    subtitleEn: "State-of-the-Art Facilities",
    subtitleAr: "معدات على أحدث مستوى",
    badgeLabelEn: "Laboratory",
    badgeLabelAr: "مختبر",
    descriptionEn:
      "Our fully equipped modern laboratories enable precise chemical and physical analysis of soil samples from across Syria.",
    descriptionAr:
      "مختبراتنا الحديثة المجهزة بالكامل تتيح تحليلاً كيميائياً وفيزيائياً دقيقاً لعينات التربة.",
    primaryButtonLabelEn: "Learn More",
    primaryButtonLabelAr: "اقرأ المزيد",
    primaryButtonUrl: "/news",
    secondaryButtonLabelEn: "Contact Us",
    secondaryButtonLabelAr: "تواصل معنا",
    secondaryButtonUrl: "/contact",
    backgroundImage: "/images/slider/WhatsApp Image 2026-03-26 at 10.18.58 PM.jpeg",
    overlayColor: "rgba(55,35,28,0.70)",
  },
  {
    titleEn: "Soil Research Laboratory",
    titleAr: "مختبر أبحاث التربة",
    subtitleEn: "Analysis · Classification · Conservation",
    subtitleAr: "تحليل · تصنيف · صون",
    badgeLabelEn: "Field & Lab",
    badgeLabelAr: "حقل ومختبر",
    descriptionEn:
      "Integrating field sampling with laboratory analysis, our scientists develop comprehensive soil databases for Syria's diverse regions.",
    descriptionAr:
      "بدمج أخذ العينات الحقلية مع التحليل المختبري، يطور علماؤنا قواعد بيانات شاملة للتربة.",
    primaryButtonLabelEn: "View Publications",
    primaryButtonLabelAr: "عرض المنشورات",
    primaryButtonUrl: "/publications",
    secondaryButtonLabelEn: "Join Us",
    secondaryButtonLabelAr: "انضم إلينا",
    secondaryButtonUrl: "/members",
    backgroundImage: "/images/slider/WhatsApp Image 2026-03-26 at 10.39.05 PM.jpeg",
    overlayColor: "rgba(48,30,22,0.68)",
  },
  {
    titleEn: "Microscopic Soil Analysis",
    titleAr: "تحليل التربة بالمجهر",
    subtitleEn: "From Micro to Macro",
    subtitleAr: "من المجهري إلى الكلي",
    badgeLabelEn: "Microscopy",
    badgeLabelAr: "مجهرية",
    descriptionEn:
      "Microscopic examination of soil microstructure reveals hidden biological and mineral interactions that govern fertility and crop yield.",
    descriptionAr:
      "الفحص المجهري لبنية التربة يكشف التفاعلات الحيوية والمعدنية الخفية التي تحكم الخصوبة.",
    primaryButtonLabelEn: "Our Research",
    primaryButtonLabelAr: "أبحاثنا",
    primaryButtonUrl: "/publications",
    secondaryButtonLabelEn: "Contact Us",
    secondaryButtonLabelAr: "تواصل معنا",
    secondaryButtonUrl: "/contact",
    backgroundImage: "/images/slider/WhatsApp Image 2026-02-10 at 1.28.37 PM.jpeg",
    overlayColor: "rgba(62,39,35,0.72)",
  },
  {
    titleEn: "Soil Profile & Classification",
    titleAr: "ملف التربة والتصنيف",
    subtitleEn: "Understanding Soil Horizons",
    subtitleAr: "فهم طبقات التربة",
    badgeLabelEn: "Education",
    badgeLabelAr: "تعليم",
    descriptionEn:
      "From the organic O-horizon to bedrock — understanding soil profiles is fundamental to sustainable agriculture and land planning.",
    descriptionAr:
      "من طبقة O العضوية حتى الصخر الأساسي — فهم ملفات التربة أساس الزراعة المستدامة.",
    primaryButtonLabelEn: "Learn More",
    primaryButtonLabelAr: "اقرأ المزيد",
    primaryButtonUrl: "/news",
    secondaryButtonLabelEn: "Contact Us",
    secondaryButtonLabelAr: "تواصل معنا",
    secondaryButtonUrl: "/contact",
    backgroundImage: "/images/slider/WhatsApp Image 2026-07-26 at 12.19.25 PM.jpeg",
    overlayColor: "rgba(44,26,18,0.62)",
  },
  {
    titleEn: "Soil Layers & Structure",
    titleAr: "طبقات التربة وبنيتها",
    subtitleEn: "From Humus to Bedrock",
    subtitleAr: "من الدبال إلى الصخر الأساسي",
    badgeLabelEn: "Science",
    badgeLabelAr: "علم",
    descriptionEn:
      "Comprehensive soil horizon studies — from organic humus layers to bedrock — informing land-use planning across Syrian territories.",
    descriptionAr:
      "دراسات شاملة لطبقات التربة — من طبقة الدبال العضوية حتى طبقة الصخر الأساسي.",
    primaryButtonLabelEn: "Learn More",
    primaryButtonLabelAr: "اقرأ المزيد",
    primaryButtonUrl: "/news",
    secondaryButtonLabelEn: "Contact Us",
    secondaryButtonLabelAr: "تواصل معنا",
    secondaryButtonUrl: "/contact",
    backgroundImage: "/images/slider/WhatsApp Image 2026-07-26 at 12.20.10 PM.jpeg",
    overlayColor: "rgba(78,52,46,0.62)",
  },
  {
    titleEn: "Soil Types & Diversity",
    titleAr: "أنواع التربة وتنوعها",
    subtitleEn: "Mapping Syria's Soils",
    subtitleAr: "رسم خريطة ترب سوريا",
    badgeLabelEn: "Field Study",
    badgeLabelAr: "دراسة ميدانية",
    descriptionEn:
      "From dark humus-rich soils to sandy loam — Syria's diverse soil types support a wide range of crops and require specialised management.",
    descriptionAr:
      "من الترب الغنية بالدبال الداكنة إلى الرمال الطينية — تدعم ترب سوريا المتنوعة مجموعة واسعة من المحاصيل.",
    primaryButtonLabelEn: "Soil Research",
    primaryButtonLabelAr: "أبحاث التربة",
    primaryButtonUrl: "/publications",
    secondaryButtonLabelEn: "Join Us",
    secondaryButtonLabelAr: "انضم إلينا",
    secondaryButtonUrl: "/members",
    backgroundImage: "/images/slider/WhatsApp Image 2026-07-26 at 12.20.39 PM.jpeg",
    overlayColor: "rgba(90,60,30,0.65)",
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SlideConfig {
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  badgeLabelEn?: string;
  badgeLabelAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  primaryButtonLabelEn?: string;
  primaryButtonLabelAr?: string;
  primaryButtonUrl?: string;
  secondaryButtonLabelEn?: string;
  secondaryButtonLabelAr?: string;
  secondaryButtonUrl?: string;
  backgroundImage?: string;
  overlayColor?: string;
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

/**
 * Build the multi-stop gradient overlay for a slide.
 * Uses pure soil/brown/terracotta tones — no greens.
 * Left-vignette: strong clay overlay bleeds through image.
 * Bottom-vignette: dark earth ensures text legibility.
 * Top edge: very subtle warm fade to preserve sky/horizon.
 */
function buildOverlay(oc: string): string {
  const mid   = oc.replace(/([\d.]+)\)$/, (_, a) => `${Math.max(0, parseFloat(a) - 0.22).toFixed(2)})`);
  const light = oc.replace(/([\d.]+)\)$/, "0.10)");
  return [
    // left-to-right: strong clay colour → mid → almost clear
    `linear-gradient(110deg, ${oc} 0%, ${mid} 42%, ${light} 100%)`,
    // bottom: deep earth vignette — pure black/soil
    `linear-gradient(to top, rgba(20,10,5,0.70) 0%, rgba(10,5,2,0.28) 35%, transparent 62%)`,
    // top: thin warm-dark edge
    `linear-gradient(to bottom, rgba(25,12,6,0.22) 0%, transparent 20%)`,
    // right-edge warm glow (subtle terracotta)
    `radial-gradient(ellipse 55% 70% at 92% 50%, rgba(141,95,70,0.12) 0%, transparent 100%)`,
  ].join(", ");
}

// ---------------------------------------------------------------------------
// Ken-Burns CSS — 5 smooth pan/zoom variants
// ---------------------------------------------------------------------------

const KB_CSS = `
@keyframes kb1 {
  0%   { transform: scale(1.00) translate( 0%,    0%  ); }
  100% { transform: scale(1.12) translate(-2.0%, -1.5%); }
}
@keyframes kb2 {
  0%   { transform: scale(1.05) translate( 0%,   0%  ); }
  100% { transform: scale(1.00) translate( 2.0%,  1.5%); }
}
@keyframes kb3 {
  0%   { transform: scale(1.00) translate( 1%,   0%  ); }
  100% { transform: scale(1.10) translate(-1.0%,  1.0%); }
}
@keyframes kb4 {
  0%   { transform: scale(1.08) translate(-1.5%,  0.5%); }
  100% { transform: scale(1.00) translate( 1.5%, -0.5%); }
}
@keyframes kb5 {
  0%   { transform: scale(1.00) translate( 0%,   1%  ); }
  100% { transform: scale(1.09) translate( 1.5%, -1.0%); }
}
.hcs-kb-1 { animation: kb1 10s ease-in-out forwards; }
.hcs-kb-2 { animation: kb2 10s ease-in-out forwards; }
.hcs-kb-3 { animation: kb3 10s ease-in-out forwards; }
.hcs-kb-4 { animation: kb4 10s ease-in-out forwards; }
.hcs-kb-5 { animation: kb5 10s ease-in-out forwards; }

/* Horizontal scan-line sheen — sweeps once per mount */
@keyframes hcs-sheen {
  0%   { transform: translateX(-140%) skewX(-18deg); opacity: 0;   }
  15%  { opacity: 0.55; }
  85%  { opacity: 0.55; }
  100% { transform: translateX(180%) skewX(-18deg);  opacity: 0;   }
}
.hcs-sheen { animation: hcs-sheen 3.2s cubic-bezier(0.4,0,0.2,1) 0.9s forwards; }

/* Floating soil-particle pulse */
@keyframes hcs-float {
  0%, 100% { transform: translateY(0px); opacity: 0.35; }
  50%       { transform: translateY(-9px); opacity: 0.62; }
}
`;

const KB_CLASSES = ["hcs-kb-1", "hcs-kb-2", "hcs-kb-3", "hcs-kb-4", "hcs-kb-5"];

// ---------------------------------------------------------------------------
// Ambient radial-glow colours per slide — pure soil/earth/terracotta tones
// ---------------------------------------------------------------------------

const GLOW_COLOURS = [
  { tl: "rgba(141,95,70,0.34)",  br: "rgba(62,39,35,0.28)" },   // warm ochre + dark clay
  { tl: "rgba(109,76,65,0.32)",  br: "rgba(90,58,42,0.26)" },   // terracotta + rich brown
  { tl: "rgba(160,110,72,0.30)", br: "rgba(78,52,46,0.24)" },   // sandy ochre + deep brown
  { tl: "rgba(90,58,42,0.34)",   br: "rgba(141,95,70,0.22)" },  // deep brown + warm ochre
  { tl: "rgba(62,39,35,0.38)",   br: "rgba(109,76,65,0.22)" },  // dark clay + terracotta
  { tl: "rgba(120,80,50,0.32)",  br: "rgba(62,39,35,0.26)" },   // mid-brown + dark clay
  { tl: "rgba(141,110,99,0.30)", br: "rgba(78,52,46,0.28)" },   // rose-clay + rich brown
  { tl: "rgba(90,58,42,0.35)",   br: "rgba(160,110,72,0.20)" }, // amber brown + sandy
  { tl: "rgba(109,76,65,0.36)",  br: "rgba(90,58,42,0.24)" },   // terracotta + amber
];

// Floating soil-particle positions
const SOIL_PARTICLES = [
  { left: "7%",  top: "20%", size: 5, delay: 0   },
  { left: "14%", top: "68%", size: 3, delay: 0.9 },
  { left: "73%", top: "15%", size: 6, delay: 1.4 },
  { left: "82%", top: "58%", size: 3, delay: 0.5 },
  { left: "44%", top: "80%", size: 4, delay: 2.1 },
  { left: "91%", top: "32%", size: 3, delay: 1.7 },
  { left: "55%", top: "12%", size: 5, delay: 0.3 },
  { left: "28%", top: "85%", size: 3, delay: 1.1 },
];

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

const ProgressBar = ({
  active,
  durationMs,
  paused,
}: {
  active: boolean;
  durationMs: number;
  paused: boolean;
}) => (
  <div className="h-0.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(215,204,200,0.15)" }}>
    {active && (
      <motion.div
        key={`pb-${active}-${paused}`}
        className="h-full rounded-full"
        style={{
          background: "linear-gradient(90deg, #D7CCC8 0%, #BCAAA4 40%, #8D6E63 100%)",
        }}
        initial={{ width: "0%" }}
        animate={paused ? {} : { width: "100%" }}
        transition={{ duration: durationMs / 1000, ease: "linear" }}
      />
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function HeroCarouselSection({ config = {} }: HeroCarouselSectionProps) {
  const { language, direction } = useLanguage();
  const isRtl = direction === "rtl";

  const configSlides = (config.slides as SlideConfig[] | undefined) ?? [];
  const slides: SlideConfig[] = configSlides.length > 0 ? configSlides : DEFAULT_SLIDES;

  const autoplay       = parseBool(config.autoplay, true);
  const interval       = Number(config.autoplayInterval) || 6500;
  const showArrows     = parseBool(config.showArrows, true);
  const showDots       = parseBool(config.showDots, true);
  const showThumbnails = parseBool(config.showThumbnails, true);

  const [current, setCurrent] = useState(0);
  const [prev,    setPrev]    = useState<number | null>(null);
  const [dir,     setDir]     = useState(1);
  const isPaused = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total    = slides.length;

  const goTo = useCallback(
    (idx: number, direction = 1) => {
      setDir(direction);
      setPrev(current);
      setCurrent((idx + total) % total);
    },
    [current, total],
  );

  const goPrev = () => goTo(current - 1, -1);
  const goNext = () => goTo(current + 1,  1);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!autoplay || total <= 1) return;
    timerRef.current = setInterval(() => {
      if (!isPaused.current) {
        setDir(1);
        setCurrent((c) => { setPrev(c); return (c + 1) % total; });
      }
    }, interval);
  }, [autoplay, interval, total]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  if (total === 0) return null;

  const slide = slides[current];
  const glow  = GLOW_COLOURS[current % GLOW_COLOURS.length];

  const t = (en?: string, ar?: string) =>
    language === "ar" ? ar || en || "" : en || ar || "";

  const title          = t(slide.titleEn,                slide.titleAr);
  const subtitle       = t(slide.subtitleEn,             slide.subtitleAr);
  const badge          = t(slide.badgeLabelEn,           slide.badgeLabelAr);
  const description    = t(slide.descriptionEn,          slide.descriptionAr);
  const primaryLabel   = t(slide.primaryButtonLabelEn,   slide.primaryButtonLabelAr);
  const primaryUrl     = slide.primaryButtonUrl || "/members";
  const secondaryLabel = t(slide.secondaryButtonLabelEn, slide.secondaryButtonLabelAr);
  const secondaryUrl   = slide.secondaryButtonUrl || "/news";

  const textX = isRtl ? (dir > 0 ? -36 : 36) : (dir > 0 ? 36 : -36);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(560px, 92vh, 900px)" }}
      onMouseEnter={() => { isPaused.current = true;  }}
      onMouseLeave={() => { isPaused.current = false; }}
      onFocus={()       => { isPaused.current = true;  }}
      onBlur={()        => { isPaused.current = false; }}
      aria-roledescription="carousel"
    >
      {/* ── Ken-Burns + sheen keyframes ──────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: KB_CSS }} />

      {/* ── Base soil gradient (shows when no image or while loading) ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(
            152deg,
            #1A0E0A 0%,
            #2C1810 12%,
            #3E2723 26%,
            #4E342E 42%,
            #6D4C41 58%,
            #8D6E63 74%,
            #A1887F 86%,
            #BCAAA4 100%
          )`,
        }}
      />

      {/* ── Animated ambient radial glows (pure soil tones, per slide) ── */}
      <AnimatePresence>
        <motion.div
          key={`glow-${current}`}
          className="absolute inset-0 pointer-events-none z-[2]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6 }}
        >
          {/* Top-left warm ochre glow */}
          <div
            className="absolute -top-40 -left-40 w-[680px] h-[680px] rounded-full"
            style={{ background: `radial-gradient(circle, ${glow.tl} 0%, transparent 65%)` }}
          />
          {/* Bottom-right terracotta depth glow */}
          <div
            className="absolute -bottom-28 -right-28 w-[520px] h-[520px] rounded-full"
            style={{ background: `radial-gradient(circle, ${glow.br} 0%, transparent 65%)` }}
          />
          {/* Centre-bottom warm soil bloom */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(90,55,30,0.22) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Background slides (cross-fade + Ken-Burns) ───────────────── */}
      <AnimatePresence initial={false}>
        {slides.map((s, i) => {
          const isActive = i === current;
          const kbCls    = KB_CLASSES[i % KB_CLASSES.length];
          const overlay  = buildOverlay(s.overlayColor || "rgba(44,26,18,0.74)");
          if (!isActive && i !== prev) return null;
          return (
            <motion.div
              key={i}
              className="absolute inset-0 z-[1]"
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Photo with Ken-Burns */}
              {s.backgroundImage && (
                <div
                  key={`img-${i}-${isActive}`}
                  className={`absolute inset-0 ${isActive ? kbCls : ""}`}
                >
                  <Image
                    src={s.backgroundImage}
                    alt=""
                    fill
                    priority={i === 0}
                    className="object-cover object-center"
                    sizes="100vw"
                  />
                </div>
              )}
              {/* No image — soil-gradient fallback */}
              {!s.backgroundImage && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(152deg, #1A0E0A 0%, #3E2723 30%, #6D4C41 65%, #A1887F 100%)",
                  }}
                />
              )}
              {/* Multi-stop gradient overlay */}
              <div className="absolute inset-0" style={{ background: overlay }} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ── One-shot horizontal sheen sweep ─────────────────────────── */}
      <div
        key={`sheen-${current}`}
        className="absolute inset-0 pointer-events-none z-[6] overflow-hidden"
      >
        <div
          className="hcs-sheen absolute inset-y-0"
          style={{
            left: 0,
            width: "35%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(215,190,165,0.07) 45%, rgba(215,190,165,0.13) 50%, rgba(215,190,165,0.07) 55%, transparent 100%)",
          }}
        />
      </div>

      {/* ── Grain noise texture ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-[3] opacity-[0.038]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "130px",
        }}
      />

      {/* ── Floating soil micro-particles ───────────────────────────── */}
      {SOIL_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none z-[4]"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: "radial-gradient(circle, #D7CCC8 0%, #BCAAA4 100%)",
            opacity: 0,
            animation: `hcs-float ${4 + i * 0.6}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── Soil-horizon decorative waves (bottom) ───────────────────── */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-[4] opacity-[0.06]">
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="w-full h-20 md:h-32">
          {/* Top wave — pale sand */}
          <path
            d="M0,60 C200,110 420,10 660,60 C900,110 1140,20 1440,60 L1440,140 L0,140 Z"
            fill="#D7CCC8"
          />
          {/* Mid wave — warm sand */}
          <path
            d="M0,90 C280,45 560,130 840,85 C1060,55 1260,105 1440,85 L1440,140 L0,140 Z"
            fill="#BCAAA4"
            opacity="0.65"
          />
          {/* Bottom wave — terracotta */}
          <path
            d="M0,112 C360,75 720,140 1080,105 C1260,88 1380,118 1440,105 L1440,140 L0,140 Z"
            fill="#8D6E63"
            opacity="0.50"
          />
        </svg>
      </div>

      {/* ── Page-background wave transition ─────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-[5]">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-8 md:h-14 block">
          <path
            d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,60 L0,60 Z"
            fill="hsl(var(--background))"
            opacity="0.92"
          />
        </svg>
      </div>

      {/* ── Slide text content ───────────────────────────────────────── */}
      <div className="relative z-[20] h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current}`}
              className={`max-w-2xl xl:max-w-3xl ${isRtl ? "mr-0 ml-auto md:ml-0" : ""}`}
              dir={isRtl ? "rtl" : "ltr"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              {/* ── Eyebrow badge ─── */}
              {badge && (
                <motion.div
                  initial={{ opacity: 0, x: textX }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08, duration: 0.52, ease: "easeOut" }}
                  className="inline-flex items-center gap-2.5 mb-5"
                >
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.20, duration: 0.38 }}
                    className="block h-px origin-left"
                    style={{
                      width: "32px",
                      background: "linear-gradient(90deg, #D7CCC8, #8D6E63)",
                    }}
                  />
                  <span
                    className="px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-[0.24em] uppercase"
                    style={{
                      background: "rgba(215,204,200,0.12)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(215,204,200,0.24)",
                      color: "#D7CCC8",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                    }}
                  >
                    {badge}
                  </span>
                </motion.div>
              )}

              {/* ── Title ─── */}
              {title && (
                <motion.h1
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
                  className={`${almarai.className} text-white font-bold leading-tight mb-3`}
                  style={{
                    fontSize: "clamp(2rem, 5vw, 3.7rem)",
                    textShadow: "0 2px 24px rgba(20,10,5,0.55), 0 1px 4px rgba(0,0,0,0.35)",
                  }}
                >
                  {title}
                </motion.h1>
              )}

              {/* ── Subtitle ─── */}
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.27, duration: 0.55, ease: "easeOut" }}
                  className="font-medium tracking-wide mb-4"
                  style={{
                    color: "#BCAAA4",
                    fontSize: "clamp(0.88rem, 1.5vw, 1.1rem)",
                    textShadow: "0 1px 8px rgba(15,6,2,0.45)",
                  }}
                >
                  {subtitle}
                </motion.p>
              )}

              {/* ── Animated soil-tone separator ─── */}
              <motion.div
                initial={{ scaleX: 0, originX: isRtl ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.33, duration: 0.55, ease: "easeOut" }}
                className="w-20 mb-5"
                style={{
                  height: "2px",
                  background: "linear-gradient(90deg, #D7CCC8 0%, #BCAAA4 30%, #8D6E63 65%, transparent 100%)",
                  borderRadius: "2px",
                }}
              />

              {/* ── Description ─── */}
              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.40, duration: 0.55, ease: "easeOut" }}
                  className="leading-relaxed max-w-xl mb-8"
                  style={{
                    color: "rgba(255,255,255,0.74)",
                    fontSize: "clamp(0.88rem, 1.5vw, 1.06rem)",
                    textShadow: "0 1px 8px rgba(10,4,2,0.50)",
                  }}
                >
                  {description}
                </motion.p>
              )}

              {/* ── CTA buttons ─── */}
              {(primaryLabel || secondaryLabel) && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.50, duration: 0.50, ease: "easeOut" }}
                  className={`flex flex-wrap gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  {/* Primary — rich brown gradient with golden-sand shine */}
                  {primaryLabel && (
                    <Link href={primaryUrl}>
                      <button
                        className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm md:text-base text-white overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                        style={{
                          background: "linear-gradient(135deg, #6D4C41 0%, #4E342E 40%, #3E2723 100%)",
                          boxShadow:
                            "0 4px 24px rgba(62,39,35,0.55), 0 1px 0 rgba(215,204,200,0.12) inset, 0 -1px 0 rgba(0,0,0,0.25) inset",
                          border: "1px solid rgba(215,204,200,0.18)",
                        }}
                      >
                        <span className="relative z-10">{primaryLabel}</span>
                        <ArrowRight
                          className={`relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${isRtl ? "rotate-180" : ""}`}
                        />
                        {/* Shine sweep on hover */}
                        <span
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(120deg, transparent 28%, rgba(215,190,165,0.22) 50%, transparent 72%)",
                          }}
                        />
                      </button>
                    </Link>
                  )}

                  {/* Secondary — soil glassmorphism */}
                  {secondaryLabel && (
                    <Link href={secondaryUrl}>
                      <button
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                        style={{
                          background: "rgba(62,39,35,0.28)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid rgba(215,204,200,0.25)",
                          color: "rgba(255,255,255,0.84)",
                          boxShadow: "0 2px 16px rgba(20,10,5,0.30)",
                        }}
                      >
                        {secondaryLabel}
                      </button>
                    </Link>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Arrow navigation ─────────────────────────────────────────── */}
      {showArrows && total > 1 && (
        <>
          <button
            onClick={() => { (isRtl ? goNext : goPrev)(); resetTimer(); }}
            className="group absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-white transition-all duration-300 hover:scale-110"
            style={{
              background: "rgba(62,39,35,0.35)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(215,204,200,0.22)",
              boxShadow: "0 2px 14px rgba(0,0,0,0.30)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(109,76,65,0.55)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(62,39,35,0.35)"; }}
            aria-label={isRtl ? "الشريحة التالية" : "Previous slide"}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={() => { (isRtl ? goPrev : goNext)(); resetTimer(); }}
            className="group absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-white transition-all duration-300 hover:scale-110"
            style={{
              background: "rgba(62,39,35,0.35)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(215,204,200,0.22)",
              boxShadow: "0 2px 14px rgba(0,0,0,0.30)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(109,76,65,0.55)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(62,39,35,0.35)"; }}
            aria-label={isRtl ? "الشريحة السابقة" : "Next slide"}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* ── Bottom controls ──────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-5 md:pb-8 px-4 md:px-12">

        {/* Thumbnail strip */}
        {showThumbnails && total > 1 && (
          <div className="flex items-end justify-center gap-2 md:gap-2.5 mb-3">
            {slides.map((s, i) => {
              const isActive = i === current;
              return (
                <button
                  key={i}
                  onClick={() => { goTo(i, i > current ? 1 : -1); resetTimer(); }}
                  className="group relative overflow-hidden focus:outline-none rounded-lg"
                  style={{
                    width:      isActive ? "78px" : "46px",
                    height:     isActive ? "52px" : "36px",
                    opacity:    isActive ? 1 : 0.48,
                    transition: "all 0.42s cubic-bezier(0.4,0,0.2,1)",
                    border: isActive
                      ? "2px solid rgba(215,204,200,0.90)"
                      : "2px solid rgba(215,204,200,0.22)",
                    boxShadow: isActive
                      ? "0 0 0 2px rgba(215,204,200,0.30), 0 0 18px rgba(141,110,99,0.45), 0 6px 18px rgba(0,0,0,0.50)"
                      : "none",
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  {s.backgroundImage ? (
                    <Image
                      src={s.backgroundImage}
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="80px"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(135deg, #3E2723 0%, #6D4C41 100%)",
                      }}
                    />
                  )}
                  {/* Tint overlay */}
                  <div className="absolute inset-0 group-hover:bg-black/10 transition-colors duration-200"
                    style={{ background: isActive ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.28)" }} />
                  {/* Progress stripe */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0">
                      <ProgressBar active={isActive} durationMs={interval} paused={isPaused.current} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Dot indicators (shown when thumbnails are off) */}
        {showDots && !showThumbnails && total > 1 && (
          <div className="flex justify-center gap-2 mb-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i, i > current ? 1 : -1); resetTimer(); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width:   i === current ? "28px" : "8px",
                  height:  "8px",
                  background: i === current
                    ? "linear-gradient(90deg, #D7CCC8 0%, #BCAAA4 50%, #8D6E63 100%)"
                    : "rgba(215,204,200,0.32)",
                  boxShadow: i === current ? "0 0 10px rgba(215,204,200,0.50)" : "none",
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        <div className="flex justify-center">
          <span
            className="text-[11px] tabular-nums tracking-[0.20em]"
            style={{ color: "rgba(215,204,200,0.50)" }}
          >
            {String(current + 1).padStart(2, "0")}
            <span className="mx-1 opacity-40">/</span>
            {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
