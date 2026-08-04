"use client";

import React from "react";
import Link from "next/link";
import { Linkedin, Facebook, Twitter, Youtube, MapPin, Mail, Phone } from "lucide-react";
import { useSiteSettings, useSiteName, useCopyright } from "@/lib/SiteSettingsContext";
import { useContentStrings } from "@/lib/content-strings-context";
import { useLanguage } from "@/lib/language-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Optional section config passed from the admin preview / section editor.
 *  When provided these values take precedence over SiteSettings + ContentStrings. */
export interface FooterSectionConfig {
  siteNameEn?: string;
  siteNameAr?: string;
  siteDescriptionEn?: string;
  siteDescriptionAr?: string;
  contactAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  quickLinksHeadingEn?: string;
  quickLinksHeadingAr?: string;
  contactInfoHeadingEn?: string;
  contactInfoHeadingAr?: string;
  aboutHeadingEn?: string;
  aboutHeadingAr?: string;
  copyrightEn?: string;
  copyrightAr?: string;
  [key: string]: unknown;
}

interface FooterLayoutProps {
  /** Passed from the section editor preview — overrides context values. */
  sectionConfig?: FooterSectionConfig;
}

// ---------------------------------------------------------------------------
// Social link definitions
// ---------------------------------------------------------------------------

const SOCIAL_LINK_DEFS = [
  { key: "facebookUrl",  ctxKey: "social.facebook_url",  label: "Facebook",  Icon: Facebook },
  { key: "twitterUrl",   ctxKey: "social.twitter_url",   label: "Twitter/X", Icon: Twitter  },
  { key: "linkedinUrl",  ctxKey: "social.linkedin_url",  label: "LinkedIn",  Icon: Linkedin },
  { key: "youtubeUrl",   ctxKey: "social.youtube_url",   label: "YouTube",   Icon: Youtube  },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FooterLayout({ sectionConfig }: FooterLayoutProps = {}) {
  const { settings } = useSiteSettings();
  const { t } = useContentStrings();
  const { direction, language } = useLanguage();
  const isAr = language === "ar";

  // ── Site name ──────────────────────────────────────────────────────────────
  const ctxSiteName = useSiteName(language);
  const siteName = isAr
    ? sectionConfig?.siteNameAr || ctxSiteName
    : sectionConfig?.siteNameEn || ctxSiteName;

  // ── Footer copyright ───────────────────────────────────────────────────────
  const ctxCopyright = useCopyright(language);
  const footerCopyright = isAr
    ? sectionConfig?.copyrightAr || ctxCopyright
    : sectionConfig?.copyrightEn || ctxCopyright;

  // ── Site description ───────────────────────────────────────────────────────
  const ctxDescription = t(
    "footer.site_description",
    "The Soil Science Society of Syria (SSSS) is dedicated to advancing soil science and sustainable land management in Syria."
  );
  const siteDescription = isAr
    ? sectionConfig?.siteDescriptionAr || ctxDescription
    : sectionConfig?.siteDescriptionEn || ctxDescription;

  // ── Contact info ───────────────────────────────────────────────────────────
  const contactAddress =
    sectionConfig?.contactAddress ||
    settings.get("contact.address") ||
    t("contact.address", "Damascus, Syria");
  const contactEmail =
    sectionConfig?.contactEmail ||
    settings.get("contact.email") ||
    "info@ssssy.org";
  const contactPhone =
    sectionConfig?.contactPhone ||
    settings.get("contact.phone") ||
    "+963 11 234 5678";

  // ── Column headings ────────────────────────────────────────────────────────
  const quickLinksHeading = isAr
    ? sectionConfig?.quickLinksHeadingAr || t("footer.quick_links_heading", "Quick Links")
    : sectionConfig?.quickLinksHeadingEn || t("footer.quick_links_heading", "Quick Links");

  const contactInfoHeading = isAr
    ? sectionConfig?.contactInfoHeadingAr || t("footer.contact_info_heading", "Contact Info")
    : sectionConfig?.contactInfoHeadingEn || t("footer.contact_info_heading", "Contact Info");

  const aboutHeading = isAr
    ? sectionConfig?.aboutHeadingAr || t("footer.about_heading", `About ${siteName}`)
    : sectionConfig?.aboutHeadingEn || t("footer.about_heading", `About ${siteName}`);

  return (
    <footer className="relative overflow-hidden text-white" dir={direction}>

      {/* ── Layered diagonal gradient — continues the soil-dark palette ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(160deg, #2b1a14 0%, #3E2723 35%, #4e2f27 65%, #3a2018 100%)",
        }}
      />

      {/* ── Radial warm glow — centre depth ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(109,76,65,0.22) 0%, transparent 65%)",
        }}
      />

      {/* ── Subtle noise texture (matches other sections) ── */}
      <div className="absolute inset-0 z-0 bg-noise opacity-20 pointer-events-none" />

      {/* ── Top wave — connects seamlessly from the section above ── */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none leading-none">
        <svg
          viewBox="0 0 1440 72"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-16 md:h-20"
        >
          {/* Two-layer wave for depth — mirrors StatisticsSection bottom */}
          <path
            d="M0,48 C360,8 720,64 1080,28 C1260,12 1380,40 1440,32 L1440,0 L0,0 Z"
            fill="white"
            fillOpacity="1"
          />
          <path
            d="M0,56 C480,24 960,60 1440,36 L1440,0 L0,0 Z"
            fill="white"
            fillOpacity="0.55"
          />
        </svg>
      </div>

      {/* ── Main content grid ── */}
      <div className="relative z-20 pt-24 md:pt-28 pb-10 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">

            {/* ── Col 1 — Brand + social ── */}
            <div
              className="
                relative rounded-2xl overflow-hidden
                border border-white/15
                bg-white/8
                backdrop-blur-xl
                shadow-[0_2px_14px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]
                px-5 py-7
                transition-all duration-300
                hover:bg-white/13 hover:border-white/25
                hover:shadow-[0_4px_22px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.18)]
                hover:-translate-y-1
              "
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D7CCC8]/55 to-transparent" />

              <h3 className="text-lg font-bold text-[#D7CCC8] mb-3 leading-snug">{siteName}</h3>
              <p className="text-white/65 text-sm leading-relaxed mb-5">{siteDescription}</p>

              {/* Social icons */}
              <div className="flex gap-2.5 flex-wrap">
                {SOCIAL_LINK_DEFS.map(({ key, ctxKey, label, Icon }) => {
                  const href =
                    (sectionConfig?.[key as keyof FooterSectionConfig] as string | undefined) ||
                    settings.get(ctxKey) ||
                    "#";
                  return (
                    <a
                      key={label}
                      href={href}
                      className="
                        flex items-center justify-center w-8 h-8 rounded-lg
                        border border-white/20 bg-white/10
                        text-white/60
                        hover:text-[#D7CCC8] hover:bg-white/20 hover:border-white/35
                        transition-all duration-200
                      "
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* ── Col 2 — Quick links ── */}
            <div
              className="
                relative rounded-2xl overflow-hidden
                border border-white/15
                bg-white/6
                backdrop-blur-xl
                shadow-[0_2px_14px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)]
                px-5 py-7
                transition-all duration-300
                hover:bg-white/11 hover:border-white/22
                hover:-translate-y-1
              "
            >
              <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D7CCC8]/40 to-transparent" />

              <h4 className="font-semibold text-[#D7CCC8] mb-4 text-sm uppercase tracking-wider">{quickLinksHeading}</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/about",        labelKey: "footer.link_about",        fallback: "About" },
                  { href: "/news",         labelKey: "footer.link_news",         fallback: "News" },
                  { href: "/events",       labelKey: "footer.link_events",       fallback: "Events" },
                  { href: "/publications", labelKey: "footer.link_publications", fallback: "Publications" },
                  { href: "/membership",   labelKey: "footer.link_membership",   fallback: "Membership" },
                  { href: "/contact",      labelKey: "footer.link_contact",      fallback: "Contact" },
                ].map(({ href, labelKey, fallback }) => (
                  <li key={href} className="group/link flex items-center gap-2">
                    {/* Animated accent dot */}
                    <span className="w-1 h-1 rounded-full bg-[#D7CCC8]/40 group-hover/link:bg-[#D7CCC8]/80 transition-colors duration-200 flex-shrink-0" />
                    <Link
                      href={href}
                      className="text-white/65 hover:text-[#D7CCC8] transition-colors duration-200 text-sm"
                    >
                      {t(labelKey, fallback)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Col 3 — Contact info ── */}
            <div
              className="
                relative rounded-2xl overflow-hidden
                border border-white/15
                bg-white/6
                backdrop-blur-xl
                shadow-[0_2px_14px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)]
                px-5 py-7
                transition-all duration-300
                hover:bg-white/11 hover:border-white/22
                hover:-translate-y-1
              "
            >
              <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D7CCC8]/40 to-transparent" />

              <h4 className="font-semibold text-[#D7CCC8] mb-4 text-sm uppercase tracking-wider">{contactInfoHeading}</h4>
              <ul className="space-y-3.5">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[#D7CCC8]/60 mt-0.5 flex-shrink-0" />
                  <span className="text-white/65 text-sm leading-relaxed">{contactAddress}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-[#D7CCC8]/60 flex-shrink-0" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-white/65 hover:text-[#D7CCC8] transition-colors duration-200 text-sm"
                    dir="ltr"
                  >
                    {contactEmail}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-[#D7CCC8]/60 flex-shrink-0" />
                  <a
                    href={`tel:${contactPhone}`}
                    className="text-white/65 hover:text-[#D7CCC8] transition-colors duration-200 text-sm"
                    dir="ltr"
                  >
                    {contactPhone}
                  </a>
                </li>
              </ul>
            </div>

            {/* ── Col 4 — About ── */}
            <div
              className="
                relative rounded-2xl overflow-hidden
                border border-white/15
                bg-white/8
                backdrop-blur-xl
                shadow-[0_2px_14px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]
                px-5 py-7
                transition-all duration-300
                hover:bg-white/13 hover:border-white/25
                hover:-translate-y-1
              "
            >
              <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D7CCC8]/55 to-transparent" />

              <h4 className="font-semibold text-[#D7CCC8] mb-3 text-sm uppercase tracking-wider">{aboutHeading}</h4>
              <p className="text-white/65 text-sm leading-relaxed">{siteDescription}</p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Copyright bar — wavy separator + subtle gradient bar ── */}
      <div className="relative z-20 px-4 pb-8">
        <div className="container mx-auto">
          {/* Wavy divider */}
          <div className="relative mb-5">
            <svg
              viewBox="0 0 800 12"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              className="w-full h-3 opacity-25"
            >
              <path
                d="M0,6 C100,0 200,12 300,6 C400,0 500,12 600,6 C700,0 750,12 800,6"
                fill="none"
                stroke="rgba(215,204,200,0.8)"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <p className="text-center text-white/40 text-xs tracking-wide">
            &copy; {new Date().getFullYear()} {footerCopyright}
          </p>
        </div>
      </div>

    </footer>
  );
}
