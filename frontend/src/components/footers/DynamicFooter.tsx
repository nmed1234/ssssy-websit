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
} from "lucide-react";

interface DynamicFooterProps {}

const socialLinkDefs = [
  { key: "social.facebook_url", label: "Facebook", icon: Facebook },
  { key: "social.twitter_url", label: "Twitter/X", icon: Twitter },
  { key: "social.linkedin_url", label: "LinkedIn", icon: Linkedin },
  { key: "social.youtube_url", label: "YouTube", icon: Youtube },
];

export function DynamicFooter({}: DynamicFooterProps) {
  const { t: tStr } = useContentStrings();
  const { direction, language, t } = useLanguage();
  const { settings } = useSiteSettings();
  const siteName = useSiteName(language);
  const footerCopyright = useCopyright(language);

  const siteShortName = settings.get("site.short_name") || "SSSS";
  const siteDescription =
    settings.get("site.description") ||
    t(
      "The Soil Science Society of Syria (SSSS) is dedicated to advancing soil science research, education, and sustainable land management in Syria.",
      "جمعية علوم التربة السورية (SSSS) مكرسة لتطوير أبحاث علوم التربة والتعليم وإدارة الأراضي المستدامة في سوريا."
    );
  const contactAddress = settings.get("contact.address") || t("Damascus, Syria", "دمشق، سوريا");
  const contactEmail = settings.get("contact.email") || "info@ssss.org";
  const contactPhone = settings.get("contact.phone") || "+963 11 234 5678";

  return (
    <footer className="bg-[#3E2723] text-white relative" dir={direction}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-soil-sand/20 via-soil-sand/40 to-soil-sand/20" />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-[#D7CCC8] mb-4">{siteName}</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {siteDescription}
            </p>
            <div className="flex gap-3 mt-4">
              {socialLinkDefs.map((item) => {
                const url = tStr(item.key, "");
                if (!url || url === item.key) return null;
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={url}
                    className="text-white/60 hover:text-[#D7CCC8] transition-colors"
                    aria-label={item.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#D7CCC8] mb-4">{t("Quick Links", "روابط سريعة")}</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">{t("About", "عن الجمعية")}</Link></li>
              <li><Link href="/news" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">{t("News", "الأخبار")}</Link></li>
              <li><Link href="/events" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">{t("Events", "الفعاليات")}</Link></li>
              <li><Link href="/publications" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">{t("Publications", "المنشورات")}</Link></li>
              <li><Link href="/members" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">{t("Membership", "العضوية")}</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">{t("Contact", "اتصل بنا")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#D7CCC8] mb-4">{t("Contact Info", "معلومات التواصل")}</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>{contactAddress}</li>
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-[#D7CCC8] transition-colors"
                  dir="ltr"
                >
                  {contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contactPhone}`}
                  className="hover:text-[#D7CCC8] transition-colors"
                  dir="ltr"
                >
                  {contactPhone}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#D7CCC8] mb-4">{t(`About ${siteName}`, `عن ${siteName}`)}</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              {siteDescription}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
          &copy; {new Date().getFullYear()} {footerCopyright}
        </div>
      </div>
    </footer>
  );
}