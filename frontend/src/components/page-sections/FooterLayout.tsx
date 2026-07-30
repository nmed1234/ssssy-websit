"use client";

import React from "react";
import Link from "next/link";
import { Linkedin, Facebook, Twitter, Youtube } from "lucide-react";
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
    <footer className="bg-[#3E2723] text-white relative" dir={direction}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-soil-sand/20 via-soil-sand/40 to-soil-sand/20" />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1 — Brand + social */}
          <div>
            <h3 className="text-xl font-bold text-[#D7CCC8] mb-4">{siteName}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{siteDescription}</p>
            <div className="flex gap-3 mt-4">
              {SOCIAL_LINK_DEFS.map(({ key, ctxKey, label, Icon }) => {
                const href =
                  (sectionConfig?.[key as keyof FooterSectionConfig] as string | undefined) ||
                  settings.get(ctxKey) ||
                  "#";
                return (
                  <a
                    key={label}
                    href={href}
                    className="text-white/60 hover:text-[#D7CCC8] transition-colors"
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2 — Quick links */}
          <div>
            <h4 className="font-semibold text-[#D7CCC8] mb-4">{quickLinksHeading}</h4>
            <ul className="space-y-2">
              {[
                { href: "/about",        labelKey: "footer.link_about",        fallback: "About" },
                { href: "/news",         labelKey: "footer.link_news",         fallback: "News" },
                { href: "/events",       labelKey: "footer.link_events",       fallback: "Events" },
                { href: "/publications", labelKey: "footer.link_publications", fallback: "Publications" },
                { href: "/membership",   labelKey: "footer.link_membership",   fallback: "Membership" },
                { href: "/contact",      labelKey: "footer.link_contact",      fallback: "Contact" },
              ].map(({ href, labelKey, fallback }) => (
                <li key={href}>
                  <Link href={href} className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">
                    {t(labelKey, fallback)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact info */}
          <div>
            <h4 className="font-semibold text-[#D7CCC8] mb-4">{contactInfoHeading}</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>{contactAddress}</li>
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-[#D7CCC8] transition-colors" dir="ltr">
                  {contactEmail}
                </a>
              </li>
              <li>
                <a href={`tel:${contactPhone}`} className="hover:text-[#D7CCC8] transition-colors" dir="ltr">
                  {contactPhone}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 — About */}
          <div>
            <h4 className="font-semibold text-[#D7CCC8] mb-4">{aboutHeading}</h4>
            <p className="text-white/70 text-sm leading-relaxed">{siteDescription}</p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
          &copy; {new Date().getFullYear()} {footerCopyright}
        </div>
      </div>
    </footer>
  );
}
