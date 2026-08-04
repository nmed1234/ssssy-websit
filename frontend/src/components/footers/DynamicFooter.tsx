"use client";

import React from "react";
import Link from "next/link";
import { useContentStrings } from "@/lib/content-strings-context";
import { useLanguage } from "@/lib/language-context";
import { useSiteSettings, useSiteName, useCopyright } from "@/lib/SiteSettingsContext";
import {
  Linkedin,
  Facebook,
  Twitter,
  Youtube,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

interface DynamicFooterProps {}

const socialLinkDefs = [
  { key: "social.facebook_url", label: "Facebook", icon: Facebook },
  { key: "social.twitter_url",  label: "Twitter/X", icon: Twitter  },
  { key: "social.linkedin_url", label: "LinkedIn",  icon: Linkedin },
  { key: "social.youtube_url",  label: "YouTube",   icon: Youtube  },
];

export function DynamicFooter({}: DynamicFooterProps) {
  const { t: tStr } = useContentStrings();
  const { direction, language, t } = useLanguage();
  const { settings } = useSiteSettings();
  const siteName = useSiteName(language);
  const footerCopyright = useCopyright(language);

  const siteDescription =
    settings.get("site.description") ||
    t(
      "The Soil Science Society of Syria (SSSS) is dedicated to advancing soil science research, education, and sustainable land management in Syria.",
      "جمعية علوم التربة السورية (SSSS) مكرسة لتطوير أبحاث علوم التربة والتعليم وإدارة الأراضي المستدامة في سوريا."
    );
  const contactAddress = settings.get("contact.address") || t("Damascus, Syria", "دمشق، سوريا");
  const contactEmail   = settings.get("contact.email")   || "info@ssssyria.org";
  const contactPhone   = settings.get("contact.phone")   || "+963 11 234 5678";

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

            {/* Col 1 — Brand + social */}
            <div
              className="
                relative rounded-2xl overflow-hidden
                border border-white/15 bg-white/8 backdrop-blur-xl
                shadow-[0_2px_14px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]
                px-5 py-7
                transition-all duration-300
                hover:bg-white/13 hover:border-white/25
                hover:shadow-[0_4px_22px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.18)]
                hover:-translate-y-1
              "
            >
              <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D7CCC8]/55 to-transparent" />
              <h3 className="text-lg font-bold text-[#D7CCC8] mb-3 leading-snug">{siteName}</h3>
              <p className="text-white/65 text-sm leading-relaxed mb-5">{siteDescription}</p>
              <div className="flex gap-2.5 flex-wrap">
                {socialLinkDefs.map((item) => {
                  const url = tStr(item.key, "");
                  if (!url || url === item.key) return null;
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={url}
                      className="
                        flex items-center justify-center w-8 h-8 rounded-lg
                        border border-white/20 bg-white/10
                        text-white/60
                        hover:text-[#D7CCC8] hover:bg-white/20 hover:border-white/35
                        transition-all duration-200
                      "
                      aria-label={item.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Col 2 — Quick links */}
            <div
              className="
                relative rounded-2xl overflow-hidden
                border border-white/15 bg-white/6 backdrop-blur-xl
                shadow-[0_2px_14px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)]
                px-5 py-7
                transition-all duration-300
                hover:bg-white/11 hover:border-white/22
                hover:-translate-y-1
              "
            >
              <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D7CCC8]/40 to-transparent" />
              <h4 className="font-semibold text-[#D7CCC8] mb-4 text-sm uppercase tracking-wider">
                {t("Quick Links", "روابط سريعة")}
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/about",        label: t("About",        "عن الجمعية") },
                  { href: "/news",         label: t("News",         "الأخبار")    },
                  { href: "/events",       label: t("Events",       "الفعاليات")  },
                  { href: "/publications", label: t("Publications",  "المنشورات")  },
                  { href: "/members",      label: t("Membership",   "العضوية")    },
                  { href: "/contact",      label: t("Contact",      "اتصل بنا")   },
                ].map(({ href, label }) => (
                  <li key={href} className="group/link flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#D7CCC8]/40 group-hover/link:bg-[#D7CCC8]/80 transition-colors duration-200 flex-shrink-0" />
                    <Link href={href} className="text-white/65 hover:text-[#D7CCC8] transition-colors duration-200 text-sm">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Contact info */}
            <div
              className="
                relative rounded-2xl overflow-hidden
                border border-white/15 bg-white/6 backdrop-blur-xl
                shadow-[0_2px_14px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)]
                px-5 py-7
                transition-all duration-300
                hover:bg-white/11 hover:border-white/22
                hover:-translate-y-1
              "
            >
              <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D7CCC8]/40 to-transparent" />
              <h4 className="font-semibold text-[#D7CCC8] mb-4 text-sm uppercase tracking-wider">
                {t("Contact Info", "معلومات التواصل")}
              </h4>
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

            {/* Col 4 — About */}
            <div
              className="
                relative rounded-2xl overflow-hidden
                border border-white/15 bg-white/8 backdrop-blur-xl
                shadow-[0_2px_14px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]
                px-5 py-7
                transition-all duration-300
                hover:bg-white/13 hover:border-white/25
                hover:-translate-y-1
              "
            >
              <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D7CCC8]/55 to-transparent" />
              <h4 className="font-semibold text-[#D7CCC8] mb-3 text-sm uppercase tracking-wider">
                {t(`About ${siteName}`, `عن ${siteName}`)}
              </h4>
              <p className="text-white/65 text-sm leading-relaxed">{siteDescription}</p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Copyright bar — wavy separator ── */}
      <div className="relative z-20 px-4 pb-8">
        <div className="container mx-auto">
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
