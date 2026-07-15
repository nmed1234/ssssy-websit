"use client";

import React from "react";
import Link from "next/link";
import { Linkedin, Facebook, Twitter, Youtube } from "lucide-react";
import { useSiteSettings, useSiteName, useCopyright } from "@/lib/SiteSettingsContext";
import { useContentStrings } from "@/lib/content-strings-context";
import { useLanguage } from "@/lib/language-context";

const socialLinkDefsFooter = [
  { key: "social.facebook_url", label: "Facebook", icon: Facebook, defaultUrl: "#" },
  { key: "social.twitter_url", label: "Twitter/X", icon: Twitter, defaultUrl: "#" },
  { key: "social.linkedin_url", label: "LinkedIn", icon: Linkedin, defaultUrl: "#" },
  { key: "social.youtube_url", label: "YouTube", icon: Youtube, defaultUrl: "#" },
];

export function FooterLayout() {
  const { settings } = useSiteSettings();
  const { t } = useContentStrings();
  const { direction, language } = useLanguage();
  const siteName = useSiteName(language);
  const footerCopyright = useCopyright(language);

  return (
    <footer className="bg-[#3E2723] text-white relative" dir={direction}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-soil-sand/20 via-soil-sand/40 to-soil-sand/20" />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-[#D7CCC8] mb-4">
              {siteName}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {t("footer.site_description", "The Soil Science Society of Syria (SSSS) is dedicated to advancing soil science and sustainable land management in Syria.")}
            </p>
            <div className="flex gap-3 mt-4">
              {socialLinkDefsFooter.map((item) => (
                <a
                  key={item.label}
                  href={settings.get(item.key) || item.defaultUrl}
                  className="text-white/60 hover:text-[#D7CCC8] transition-colors"
                  aria-label={item.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#D7CCC8] mb-4">
              {t("footer.quick_links_heading", "Quick Links")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">
                  {t("footer.link_about", "About")}
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">
                  {t("footer.link_news", "News")}
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">
                  {t("footer.link_events", "Events")}
                </Link>
              </li>
              <li>
                <Link href="/publications" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">
                  {t("footer.link_publications", "Publications")}
                </Link>
              </li>
              <li>
                <Link href="/membership" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">
                  {t("footer.link_membership", "Membership")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-[#D7CCC8] transition-colors text-sm">
                  {t("footer.link_contact", "Contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#D7CCC8] mb-4">
              {t("footer.contact_info_heading", "Contact Info")}
            </h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>{settings.get("contact.address") || t("contact.address", "Damascus, Syria")}</li>
              <li>
                <a
                  href={`mailto:${settings.get("contact.email") || "info@ssss.org"}`}
                  className="hover:text-[#D7CCC8] transition-colors"
                  dir="ltr"
                >
                  {settings.get("contact.email") || "info@ssss.org"}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${settings.get("contact.phone") || "+963112345678"}`}
                  className="hover:text-[#D7CCC8] transition-colors"
                  dir="ltr"
                >
                  {settings.get("contact.phone") || "+963 11 234 5678"}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#D7CCC8] mb-4">
              {t("footer.about_heading", `About ${siteName}`)}
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">
              {t("footer.site_description", "The Soil Science Society of Syria (SSSS) is dedicated to advancing soil science and sustainable land management in Syria.")}
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
