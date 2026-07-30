"use client";

/**
 * HeroCarouselSection — Premium full-viewport hero carousel.
 *
 * Features:
 *  - Ken-Burns pan/zoom on every background image
 *  - Smooth cross-fade between slides (no hard cuts)
 *  - Staggered text reveal animation (badge → title → description → buttons)
 *  - Animated progress bar per slide (auto-advance timer)
 *  - Thumbnail-strip navigator at the bottom
 *  - Noise-texture + multi-stop gradient overlay for legibility
 *  - RTL-aware arrow directions
 *  - Pause on hover / focus
 *
 * Config keys:
 *   slides[]         — array of SlideConfig objects (see below)
 *   transitionStyle  — "fade" (default) | "slide" | "ken-burns"
 *   autoplay         — boolean (default true)
 *   autoplayInterval — ms (default 6000)
 *   showArrows       — boolean (default true)
 *   showDots         — boolean (default true)
 *   showThumbnails   — boolean (default true)
 *
 * Each slide:
 *   titleEn / titleAr
 *   subtitleEn / subtitleAr
 *   descriptionEn / descriptionAr
 *   badgeLabelEn / badgeLabelAr
 *   primaryButtonLabelEn / primaryButtonLabelAr, primaryButtonUrl
 *   secondaryButtonLabelEn / secondaryButtonLabelAr, secondaryButtonUrl
 *   backgroundImage   — URL or /public path
 *   overlayColor      — optional CSS colour stop e.g. "rgba(15,40,20,0.72)"
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { useLanguage } from "@/lib/language-context";

// ---------------------------------------------------------------------------
// Static slide data – uses the images copied to /public/images/slider/
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
    overlayColor: "rgba(18,42,18,0.70)",
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
    overlayColor: "rgba(10,28,48,0.68)",
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
    overlayColor: "rgba(15,30,50,0.72)",
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
    overlayColor: "rgba(8,25,50,0.65)",
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
    overlayColor: "rgba(20,35,10,0.65)",
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
    overlayColor: "rgba(10,10,30,0.65)",
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
    overlayColor: "rgba(25,55,15,0.55)",
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
    overlayColor: "rgba(30,55,10,0.55)",
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
    overlayColor: "rgba(42,30,10,0.60)",
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

// Ken-Burns CSS: each slide gets a unique animation so the pan direction
// alternates, giving visual variety without JavaScript
const KB_CSS = `
@keyframes kb1 {
  0%   { transform: scale(1.0) translate(0%,   0%); }
  100% { transform: scale(1.12) translate(-2%,  -1.5%); }
}
@keyframes kb2 {
  0%   { transform: scale(1.05) translate(0%,  0%); }
  100% { transform: scale(1.0)  translate(2%,  1.5%); }
}
@keyframes kb3 {
  0%   { transform: scale(1.0)  translate(1%,  0%); }
  100% { transform: scale(1.1)  translate(-1%, 1%); }
}
@keyframes kb4 {
  0%   { transform: scale(1.08) translate(-1.5%, 0.5%); }
  100% { transform: scale(1.0)  translate(1.5%, -0.5%); }
}
@keyframes kb5 {
  0%   { transform: scale(1.0)  translate(0%,  1%); }
  100% { transform: scale(1.1)  translate(1.5%, -1%); }
}
.kb-1 { animation: kb1 8s ease-in-out forwards; }
.kb-2 { animation: kb2 8s ease-in-out forwards; }
.kb-3 { animation: kb3 8s ease-in-out forwards; }
.kb-4 { animation: kb4 8s ease-in-out forwards; }
.kb-5 { animation: kb5 8s ease-in-out forwards; }
`;

const KB_CLASSES = ["kb-1", "kb-2", "kb-3", "kb-4", "kb-5"];

// Progress bar animation duration matches autoplayInterval
const ProgressBar = ({
  active,
  durationMs,
  paused,
}: {
  active: boolean;
  durationMs: number;
  paused: boolean;
}) => (
  <div className="h-0.5 w-full bg-white/20 overflow-hidden rounded-full">
    {active && (
      <motion.div
        key={`${active}-${paused}`}
        className="h-full bg-white rounded-full"
        initial={{ width: "0%" }}
        animate={paused ? {} : { width: "100%" }}
        transition={{ duration: durationMs / 1000, ease: "linear" }}
      />
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeroCarouselSection({ config = {} }: HeroCarouselSectionProps) {
  const { language, direction } = useLanguage();
  const isRtl = direction === "rtl";

  // Merge config slides with defaults (config slides take precedence)
  const configSlides = (config.slides as SlideConfig[] | undefined) ?? [];
  const slides: SlideConfig[] = configSlides.length > 0 ? configSlides : DEFAULT_SLIDES;

  const autoplay = parseBool(config.autoplay, true);
  const interval = Number(config.autoplayInterval) || 6000;
  const showArrows = parseBool(config.showArrows, true);
  const showDots = parseBool(config.showDots, true);
  const showThumbnails = parseBool(config.showThumbnails, true);

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const isPaused = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slides.length;

  const goTo = useCallback(
    (idx: number, direction = 1) => {
      setDir(direction);
      setPrev(current);
      setCurrent((idx + total) % total);
    },
    [current, total],
  );

  const goPrev = () => goTo(current - 1, -1);
  const goNext = () => goTo(current + 1, 1);

  // Autoplay
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!autoplay || total <= 1) return;
    timerRef.current = setInterval(() => {
      if (!isPaused.current) {
        setDir(1);
        setCurrent((c) => {
          setPrev(c);
          return (c + 1) % total;
        });
      }
    }, interval);
  }, [autoplay, interval, total]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  if (total === 0) return null;

  const slide = slides[current];

  // Bilingual helpers
  const t = (en?: string, ar?: string) =>
    language === "ar" ? ar || en || "" : en || ar || "";

  const title = t(slide.titleEn, slide.titleAr);
  const subtitle = t(slide.subtitleEn, slide.subtitleAr);
  const badge = t(slide.badgeLabelEn, slide.badgeLabelAr);
  const description = t(slide.descriptionEn, slide.descriptionAr);
  const primaryLabel = t(slide.primaryButtonLabelEn, slide.primaryButtonLabelAr);
  const primaryUrl = slide.primaryButtonUrl || "/members";
  const secondaryLabel = t(slide.secondaryButtonLabelEn, slide.secondaryButtonLabelAr);
  const secondaryUrl = slide.secondaryButtonUrl || "/news";

  // Slide-in direction offset for text
  const textX = isRtl ? (dir > 0 ? -40 : 40) : (dir > 0 ? 40 : -40);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(520px, 92vh, 860px)" }}
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
      onFocus={() => { isPaused.current = true; }}
      onBlur={() => { isPaused.current = false; }}
      aria-roledescription="carousel"
    >
      {/* ── Ken-Burns keyframes ─────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: KB_CSS }} />

      {/* ── Background slides (layered cross-fade) ─────────────────────── */}
      <AnimatePresence initial={false}>
        {slides.map((s, i) => {
          const isActive = i === current;
          const kbCls = KB_CLASSES[i % KB_CLASSES.length];
          const oc = s.overlayColor || "rgba(10,28,18,0.72)";
          if (!isActive && i !== prev) return null;
          return (
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            >
              {/* Image with Ken-Burns */}
              {s.backgroundImage && (
                <div key={`${i}-${isActive}`} className={`absolute inset-0 ${isActive ? kbCls : ""}`}>
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
              {/* Multi-stop gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(
                    to right,
                    ${oc} 0%,
                    ${oc.replace(/[\d.]+\)$/, "0.55)")} 55%,
                    rgba(0,0,0,0.15) 100%
                  ), linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%)`,
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ── Subtle noise grain ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "120px" }}
      />

      {/* ── Decorative bottom wave ──────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10 opacity-20">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-16">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </div>

      {/* ── Slide text content ─────────────────────────────────────────── */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current}`}
              className={`max-w-2xl xl:max-w-3xl ${isRtl ? "mr-0 ml-auto md:ml-0" : ""}`}
              dir={isRtl ? "rtl" : "ltr"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Badge */}
              {badge && (
                <motion.div
                  initial={{ opacity: 0, x: textX }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                  className="inline-flex items-center gap-1.5 mb-5"
                >
                  <span className="block w-6 h-px bg-white/70" />
                  <span className="text-white/80 text-xs md:text-sm font-semibold tracking-widest uppercase">
                    {badge}
                  </span>
                </motion.div>
              )}

              {/* Title */}
              {title && (
                <motion.h1
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`${almarai.className} text-white font-bold leading-tight mb-3`}
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  {title}
                </motion.h1>
              )}

              {/* Subtitle */}
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.55, ease: "easeOut" }}
                  className="text-white/70 text-base md:text-lg font-medium tracking-wide mb-4"
                >
                  {subtitle}
                </motion.p>
              )}

              {/* Thin separator line */}
              <motion.div
                initial={{ scaleX: 0, originX: isRtl ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
                className="w-16 h-0.5 bg-white/40 mb-5"
              />

              {/* Description */}
              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.55, ease: "easeOut" }}
                  className="text-white/75 text-sm md:text-base leading-relaxed max-w-xl mb-8"
                >
                  {description}
                </motion.p>
              )}

              {/* Buttons */}
              {(primaryLabel || secondaryLabel) && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                  className={`flex flex-wrap gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  {primaryLabel && (
                    <Link href={primaryUrl}>
                      <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm md:text-base text-white transition-all duration-300"
                        style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.28)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
                      >
                        {primaryLabel}
                        <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${isRtl ? "rotate-180" : ""}`} />
                      </button>
                    </Link>
                  )}
                  {secondaryLabel && (
                    <Link href={secondaryUrl}>
                      <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm md:text-base text-white/80 border border-white/20 transition-all duration-300 hover:text-white hover:border-white/40"
                        style={{ background: "transparent" }}
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

      {/* ── Arrow buttons ───────────────────────────────────────────────── */}
      {showArrows && total > 1 && (
        <>
          <button
            onClick={isRtl ? goNext : goPrev}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-white transition-all duration-300"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.22)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
            aria-label={isRtl ? "الشريحة التالية" : "Previous slide"}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={isRtl ? goPrev : goNext}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-white transition-all duration-300"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.22)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
            aria-label={isRtl ? "الشريحة السابقة" : "Next slide"}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* ── Bottom controls: dots + progress or thumbnail strip ─────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-4 md:pb-6 px-4 md:px-10">

        {/* Thumbnail strip navigator */}
        {showThumbnails && total > 1 && (
          <div className="flex items-end justify-center gap-2 md:gap-3 mb-3">
            {slides.map((s, i) => {
              const isActive = i === current;
              return (
                <button
                  key={i}
                  onClick={() => { goTo(i, i > current ? 1 : -1); resetTimer(); }}
                  className="group relative overflow-hidden transition-all duration-400 focus:outline-none rounded-md"
                  style={{
                    width: isActive ? "72px" : "44px",
                    height: isActive ? "48px" : "34px",
                    opacity: isActive ? 1 : 0.55,
                    transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                    border: isActive ? "2px solid rgba(255,255,255,0.85)" : "2px solid rgba(255,255,255,0.25)",
                    boxShadow: isActive ? "0 0 0 2px rgba(255,255,255,0.3), 0 4px 16px rgba(0,0,0,0.4)" : "none",
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  {s.backgroundImage && (
                    <Image
                      src={s.backgroundImage}
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="80px"
                    />
                  )}
                  {!s.backgroundImage && (
                    <div className="absolute inset-0 bg-white/20" />
                  )}
                  {/* Thumbnail overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  {/* Animated progress bar inside active thumbnail */}
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

        {/* Dot indicators (shown if thumbnails are off) */}
        {showDots && !showThumbnails && total > 1 && (
          <div className="flex justify-center gap-2 mb-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i, i > current ? 1 : -1); resetTimer(); }}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-7 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/65"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        <div className="flex justify-center">
          <span className="text-white/50 text-xs tabular-nums tracking-widest">
            {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
