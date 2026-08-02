"use client";

/**
 * PageHero — DB-driven hero banner used on all list pages
 * (/news, /events, /jobs, /members, /publications, /search).
 *
 * Design: layered background (gradient + optional bg image), SVG wave bottom
 * edge, floating particle dots, accent chip, bilingual title + description.
 * Fully respects the active site theme via CSS custom properties.
 */

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { almarai } from "@/lib/fonts";

interface HeroData {
  titleEn?: string;
  titleAr?: string;
  metaDescription?: string;
  metaDescriptionAr?: string;
  ogImageUrl?: string;
}

interface PageHeroProps {
  /** The DB page slug to fetch hero text from (e.g. "news", "events") */
  slug: string;
  /** Hard-coded fallback English title shown when DB has no record */
  defaultTitleEn: string;
  /** Hard-coded fallback Arabic title shown when DB has no record */
  defaultTitleAr: string;
  /** Optional hard-coded fallback English description */
  defaultDescription?: string;
  /** Optional hard-coded fallback Arabic description */
  defaultDescriptionAr?: string;
  /** Extra content rendered inside the hero (e.g. particle field, SVG) */
  children?: React.ReactNode;
  className?: string;
}

/** Small deterministic particle field — no external deps, pure CSS animation. */
function HeroParticles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    size: 3 + (i % 5) * 2,
    top: 8 + (i * 41) % 80,
    left: 3 + (i * 57) % 94,
    delay: (i * 0.4) % 3,
    dur: 3 + (i % 4),
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white opacity-[0.13]"
          style={{
            width: d.size,
            height: d.size,
            top: `${d.top}%`,
            left: `${d.left}%`,
            animation: `heroFloat ${d.dur}s ease-in-out ${d.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes heroFloat {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-10px) scale(1.15); }
        }
      `}</style>
    </div>
  );
}

export function PageHero({
  slug,
  defaultTitleEn,
  defaultTitleAr,
  defaultDescription,
  defaultDescriptionAr,
  children,
  className = "",
}: PageHeroProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [data, setData] = useState<HeroData | null>(null);

  useEffect(() => {
    api
      .get<{ success: boolean; data: HeroData }>(`/public/pages/${slug}`)
      .then((res) => { if (res.data.success) setData(res.data.data); })
      .catch(() => { /* keep defaults */ });
  }, [slug]);

  // Language-aware text resolution — show only the active language
  const title = isAr
    ? (data?.titleAr || defaultTitleAr)
    : (data?.titleEn || defaultTitleEn);

  const desc = isAr
    ? (data?.metaDescriptionAr || defaultDescriptionAr || data?.metaDescription)
    : (data?.metaDescription || defaultDescription);

  const bgImage = data?.ogImageUrl;

  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: "280px" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── Layered background ───────────────────────────────────── */}
      {bgImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: bgImage
            ? "linear-gradient(135deg, rgba(30,18,10,0.93) 0%, rgba(80,48,28,0.88) 60%, rgba(30,18,10,0.78) 100%)"
            : `linear-gradient(135deg,
                var(--style-color-primary, #5c3d1e) 0%,
                color-mix(in srgb, var(--style-color-primary, #5c3d1e) 80%, #000) 55%,
                color-mix(in srgb, var(--style-color-primary, #5c3d1e) 60%, #1a1a1a) 100%)`,
        }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" aria-hidden="true" />

      {/* Decorative radial glow */}
      <div
        className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      {/* Floating dots */}
      <HeroParticles />

      {/* Extra children (ParticleField, SVG overlays, etc.) */}
      {children}

      {/* Decorative diagonal stripe */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        aria-hidden="true"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`ph-stripe-${slug}`} x="0" y="0" width="28" height="28"
              patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="28" stroke="white" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#ph-stripe-${slug})`} />
        </svg>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">

        {/* Accent chip — same language as active UI */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {title}
          </span>
        </div>

        {/* Main title */}
        <h1
          className={`${almarai.className} text-3xl md:text-5xl font-extrabold text-white leading-tight max-w-3xl`}
        >
          {title}
        </h1>

        {/* Description */}
        {desc && (
          <p
            className="mt-4 text-base leading-relaxed max-w-xl"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            {desc}
          </p>
        )}

        {/* Bottom rule */}
        <div
          className="mt-8 h-px w-16 rounded-full"
          style={{ background: "rgba(255,255,255,0.3)" }}
        />
      </div>

      {/* ── SVG wave bottom edge ─────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: "clamp(32px, 4vw, 64px)", display: "block" }}
        >
          <path
            d="M0,32 C240,64 480,0 720,32 C960,64 1200,16 1440,32 L1440,64 L0,64 Z"
            fill="var(--style-color-bg, #ffffff)"
          />
        </svg>
      </div>
    </section>
  );
}
