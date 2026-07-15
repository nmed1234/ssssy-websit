"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { almarai } from "@/lib/fonts";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useContentStrings } from "@/lib/content-strings-context";
import { getPublicMenus } from "@/lib/menus";
import { useSiteSettings } from "@/lib/SiteSettingsContext";
import { DynamicFooter } from "@/components/footers/DynamicFooter";
import { NavDropdown } from "@/components/layout/NavDropdown";
import type { MenuItem } from "@/types";
import {
  Search,
  Menu,
  X,
  Linkedin,
  Facebook,
  Twitter,
  Youtube,
  ChevronUp,
  ChevronDown,
  Globe,
  LogIn,
  Users,
  ArrowRight,
} from "lucide-react";

// ─── Menu tree builder ────────────────────────────────────────────────────────
function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const map = new Map<string, MenuItem>();
  const roots: MenuItem[] = [];
  items.forEach((i) => map.set(i.id, { ...i, children: [] }));
  items.forEach((i) => {
    if (i.parentId && map.has(i.parentId)) {
      map.get(i.parentId)!.children!.push(map.get(i.id)!);
    } else {
      roots.push(map.get(i.id)!);
    }
  });
  return roots;
}

const socialLinkDefs = [
  { key: "social.facebook_url", label: "Facebook", icon: Facebook, defaultUrl: "https://facebook.com/ssss" },
  { key: "social.twitter_url", label: "Twitter/X", icon: Twitter, defaultUrl: "https://twitter.com/ssss" },
  { key: "social.linkedin_url", label: "LinkedIn", icon: Linkedin, defaultUrl: "https://linkedin.com/company/ssss" },
  { key: "social.youtube_url", label: "YouTube", icon: Youtube, defaultUrl: "https://youtube.com/ssss" },
];

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [searchHovered, setSearchHovered] = useState(false);
  // Navigation tree — top-level items with their children populated
  const [navTree, setNavTree] = useState<MenuItem[]>([]);
  // Style config loaded from the header menu
  const [menuTemplate, setMenuTemplate] = useState("classic");
  const [dropdownStyle, setDropdownStyle] = useState("slide");
  const [dropdownBgColor, setDropdownBgColor] = useState("");
  const [dropdownTextColor, setDropdownTextColor] = useState("");
  // Currently open dropdown id (desktop hover)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Currently open mobile accordion id
  const [mobileOpenId, setMobileOpenId] = useState<string | null>(null);
  const { language, setLanguage, direction } = useLanguage();
  const { t } = useContentStrings();
  const { settings } = useSiteSettings();
  const pathname = usePathname();

  // Spring-physics scroll progress for the progress bar
  const rawProgress = useRef(0);
  const springProgress = useSpring(0, { stiffness: 200, damping: 30, mass: 0.5 });
  const progressBarScale = useTransform(springProgress, [0, 100], [0, 1]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 10);
      setShowBackToTop(scrollY > 400);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      rawProgress.current = pct;
      setScrollProgress(pct);
      springProgress.set(pct);
    };
    if (typeof window !== "undefined") {
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [springProgress]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpenId(null);
  }, [pathname]);

  // Load header menu and extract style config + build nested tree
  useEffect(() => {
    getPublicMenus()
      .then((res) => {
        const headerMenu = res.data.data.find(
          (m: { location?: string }) => m.location === "header"
        );
        if (headerMenu) {
          // Persist style config from the menu
          if (headerMenu.menuTemplate) setMenuTemplate(headerMenu.menuTemplate);
          if (headerMenu.dropdownStyle) setDropdownStyle(headerMenu.dropdownStyle);
          if (headerMenu.styleConfig) {
            try {
              const cfg = JSON.parse(headerMenu.styleConfig);
              if (cfg.bgColor) setDropdownBgColor(cfg.bgColor);
              if (cfg.textColor) setDropdownTextColor(cfg.textColor);
            } catch { /* ignore malformed JSON */ }
          }
          // Build nested tree from flat item list (all items, including inactive for tree structure)
          const allItems: MenuItem[] = (headerMenu.items ?? []);
          const tree = buildMenuTree(allItems);
          setNavTree(tree.filter((i: MenuItem) => i.isActive));
        }
      })
      .catch(() => {});
  }, []);

  const siteNameEn = settings.get("site.name_en") || settings.get("site.name") || t("site.name", "Soil Science Society of Syria (SSSS)");
  const siteNameAr = settings.get("site.name_ar") || t("site.name", "جمعية علوم التربة السورية (SSSS)");
  const siteName = language === "ar" ? siteNameAr : siteNameEn;
  const siteShortName = settings.get("site.short_name") || t("site.short_name", "SSSS");
  const siteDescription = settings.get("site.description") || t("site.description", "Advancing soil science research, education, and sustainable land management in Syria.");
  const footerAddress = settings.get("contact.address") || t("footer.address", "Damascus, Syria");
  const footerEmail = settings.get("contact.email") || t("contact.email", "info@ssss.org");
  const footerPhone = settings.get("contact.phone") || t("contact.phone", "+963112345678");
  const rawLogoUrl = settings.get("site.logo_url") || "";
  const siteLogoUrl = (rawLogoUrl && !rawLogoUrl.includes("localhost")) ? rawLogoUrl : `/logo.svg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: siteShortName,
    url: siteUrl,
    logo: siteLogoUrl,
    description: siteDescription,
    address: { "@type": "PostalAddress", addressLocality: footerAddress.split(",")[0].trim(), addressCountry: "SY" },
    email: footerEmail,
    telephone: footerPhone,
    sameAs: socialLinkDefs.map(item => settings.get(item.key) || item.defaultUrl),
  };

  const isActive = (url?: string) => url && pathname === url;

  // Mobile item variants — card dropdown with staggered spring
  const mobileContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.055, delayChildren: 0.04 },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.03, staggerDirection: -1 },
    },
  };

  const mobileItemVariants = {
    hidden: {
      opacity: 0,
      y: direction === "rtl" ? 0 : -6,
      x: direction === "rtl" ? 10 : 0,
      scale: 0.97,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 340, damping: 26 },
    },
    exit: {
      opacity: 0,
      y: -4,
      scale: 0.97,
      transition: { duration: 0.12 },
    },
  };

  return (
    <div className={`${almarai.className} min-h-screen flex flex-col`} dir={direction}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm"
            : "bg-white border-b border-gray-100"
        }`}
      >
        {/* ── Scroll progress bar — lives inside header, spans full width ── */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] overflow-hidden pointer-events-none">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-soil-clay via-soil-rich to-soil-clay"
            style={{ scaleX: progressBarScale }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-[4.5rem]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 min-w-0 flex-shrink group">
              <div className="relative flex-shrink-0 h-11 w-11 rounded-xl overflow-hidden ring-2 ring-soil-sand/60">
                <img
                  src={siteLogoUrl}
                  alt={siteShortName}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="flex flex-col leading-snug min-w-0 overflow-hidden">
                <span className={`${almarai.className} font-bold text-[0.95rem] leading-tight tracking-tight text-soil-dark truncate`}>
                  {siteName}
                </span>
              </div>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navTree.map((link) => {
                const active = isActive(link.url);
                const label = (language === "ar" && link.labelAr) ? link.labelAr : link.labelEn || link.labelAr || "";
                const hasChildren = (link.children?.length ?? 0) > 0;

                // ── Plain link (no children) ──────────────────────────────
                if (!hasChildren) {
                  return (
                    <Link
                      key={link.id}
                      href={link.url || "/"}
                      className={`
                        relative px-3.5 py-1.5 rounded-full text-sm font-semibold
                        transition-colors duration-200 group
                        ${active ? "text-soil-clay" : "text-soil-dark/65 hover:text-soil-dark"}
                      `}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full -z-10 bg-soil-clay/12 ring-1 ring-soil-clay/20"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span
                        className={`
                          absolute bottom-0.5 left-3.5 right-3.5 h-[1.5px] rounded-full
                          scale-x-0 group-hover:scale-x-100
                          transition-transform duration-250 ease-out origin-center
                          ${active ? "opacity-0" : "bg-soil-clay/50"}
                        `}
                      />
                      {label}
                    </Link>
                  );
                }

                // ── Dropdown trigger (has children) ───────────────────────
                const dropOpen = openDropdownId === link.id;
                return (
                  <div
                    key={link.id}
                    className="relative"
                    onMouseEnter={() => {
                      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                      setOpenDropdownId(link.id);
                    }}
                    onMouseLeave={() => {
                      closeTimerRef.current = setTimeout(() => setOpenDropdownId(null), 120);
                    }}
                  >
                    <button
                      className={`
                        relative flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-semibold
                        transition-colors duration-200 group cursor-pointer
                        ${dropOpen || active ? "text-soil-clay" : "text-soil-dark/65 hover:text-soil-dark"}
                      `}
                    >
                      {(dropOpen || active) && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full -z-10 bg-soil-clay/12 ring-1 ring-soil-clay/20"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span
                        className={`
                          absolute bottom-0.5 left-3.5 right-3.5 h-[1.5px] rounded-full
                          scale-x-0 group-hover:scale-x-100
                          transition-transform duration-250 ease-out origin-center
                          ${dropOpen || active ? "opacity-0" : "bg-soil-clay/50"}
                        `}
                      />
                      {label}
                      <motion.span
                        animate={{ rotate: dropOpen ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </motion.span>
                    </button>

                    <NavDropdown
                      items={link.children ?? []}
                      isOpen={dropOpen}
                      template={menuTemplate}
                      animStyle={dropdownStyle}
                      direction={direction}
                      language={language}
                      bgColor={dropdownBgColor}
                      textColor={dropdownTextColor}
                    />
                  </div>
                );
              })}
            </nav>

            {/* ── Desktop actions ── */}
            <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">

              {/* Search icon — with animated focus ring */}
              <Link
                href="/search"
                aria-label="Search"
                onMouseEnter={() => setSearchHovered(true)}
                onMouseLeave={() => setSearchHovered(false)}
                className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 text-soil-dark/55 hover:text-soil-dark hover:bg-gray-100"
              >
                <AnimatePresence>
                  {searchHovered && (
                    <motion.span
                      key="search-ring"
                      className="absolute inset-0 rounded-full ring-2 ring-soil-clay/30"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.15, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    />
                  )}
                </AnimatePresence>
                <Search className="h-4 w-4 relative z-10" />
              </Link>

              {/* Language toggle */}
              <button
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold tracking-widest transition-colors duration-200 text-soil-dark/55 hover:text-soil-dark hover:bg-gray-100"
                aria-label="Toggle language"
                title={language === "en" ? "العربية" : "English"}
              >
                <Globe className="h-3.5 w-3.5" />
                {language === "en" ? "AR" : "EN"}
              </button>

              {/* Divider */}
              <span className="w-px h-5 mx-0.5 bg-gray-200" />

              {/* Members CTA — outlined pill */}
              <Link
                href="/members"
                className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border border-soil-clay/70 text-soil-clay hover:bg-soil-clay hover:text-white"
              >
                <Users className="h-3.5 w-3.5 flex-shrink-0" />
                {language === "ar" ? "الأعضاء" : "Members"}
              </Link>

              {/* Login CTA — solid pill */}
              <Link
                href="/auth/login"
                className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 bg-soil-dark text-white hover:bg-soil-clay"
              >
                <LogIn className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{language === "ar" ? "دخول" : "Login"}</span>
                <ArrowRight className={`h-3 w-3 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${direction === "rtl" ? "rotate-180" : ""}`} />
              </Link>
            </div>

            {/* ── Hamburger (mobile) ── */}
            <motion.button
              className="lg:hidden p-2 rounded-full transition-colors text-soil-dark hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ── Mobile menu — elevated card dropdown ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
              className="lg:hidden"
            >
              {/* Elevated card */}
              <div className="mx-3 mb-3 mt-1 rounded-2xl overflow-hidden border bg-white border-gray-200/80 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="p-3">
                  {/* Search bar */}
                  <Link
                    href="/search"
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 mb-2 rounded-xl text-sm transition-colors bg-gray-50 border border-gray-200/80 text-soil-dark/55 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Search className="h-4 w-4 flex-shrink-0" />
                    <span>{language === "ar" ? "بحث في الموقع..." : "Search the site..."}</span>
                  </Link>

                  {/* Nav links — staggered */}
                  <motion.div
                    className="flex flex-col gap-0.5"
                    variants={mobileContainerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {navTree.map((link) => {
                      const active = isActive(link.url);
                      const label = (language === "ar" && link.labelAr) ? link.labelAr : link.labelEn || link.labelAr || "";
                      const hasChildren = (link.children?.length ?? 0) > 0;
                      const accOpen = mobileOpenId === link.id;
                      const isRtl = direction === "rtl";

                      return (
                        <motion.div key={link.id} variants={mobileItemVariants}>
                          {!hasChildren ? (
                            /* ── Plain link ── */
                            <Link
                              href={link.url || "/"}
                              className={`
                                relative flex items-center justify-between px-3.5 py-2.5
                                rounded-xl text-sm font-medium transition-colors
                                ${active
                                  ? "bg-soil-clay/10 text-soil-clay font-semibold"
                                  : "text-soil-dark/75 hover:bg-gray-50 hover:text-soil-dark"
                                }
                              `}
                              onClick={() => setMenuOpen(false)}
                            >
                              <span>{label}</span>
                              {active && (
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-soil-clay" />
                              )}
                            </Link>
                          ) : (
                            /* ── Accordion trigger + children ── */
                            <>
                              <button
                                className={`
                                  relative flex items-center justify-between w-full px-3.5 py-2.5
                                  rounded-xl text-sm font-medium transition-colors
                                  ${accOpen || active
                                    ? "bg-soil-clay/10 text-soil-clay font-semibold"
                                    : "text-soil-dark/75 hover:bg-gray-50 hover:text-soil-dark"
                                  }
                                `}
                                onClick={() => setMobileOpenId(accOpen ? null : link.id)}
                              >
                                <span>{label}</span>
                                <motion.span
                                  animate={{ rotate: accOpen ? 180 : 0 }}
                                  transition={{ duration: 0.18 }}
                                >
                                  <ChevronDown className="h-4 w-4 opacity-60" />
                                </motion.span>
                              </button>
                              <AnimatePresence initial={false}>
                                {accOpen && (
                                  <motion.div
                                    key="acc"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                    className="overflow-hidden"
                                  >
                                    <div className={`
                                      pb-1 flex flex-col gap-0.5 mt-0.5
                                      ${isRtl
                                        ? "pr-4 mr-3.5 border-r-2 border-soil-clay/20"
                                        : "pl-4 ml-3.5 border-l-2 border-soil-clay/20"
                                      }
                                    `}>
                                      {link.children!.filter((c) => c.isActive).map((child) => {
                                        const cLabel = (language === "ar" && child.labelAr) ? child.labelAr : child.labelEn || child.labelAr || "";
                                        return (
                                          <Link
                                            key={child.id}
                                            href={child.url || "/"}
                                            onClick={() => setMenuOpen(false)}
                                            className="px-3 py-2 rounded-lg text-sm text-soil-dark/70 hover:text-soil-clay hover:bg-soil-clay/6 transition-colors"
                                          >
                                            {cLabel}
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {/* Divider */}
                  <div className="my-3 h-px bg-gray-100" />

                  {/* Bottom CTA actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/members"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all border-soil-clay/70 text-soil-clay hover:bg-soil-clay hover:text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      {language === "ar" ? "الأعضاء" : "Members"}
                    </Link>
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all bg-soil-dark border-soil-dark text-white hover:bg-soil-clay hover:border-soil-clay"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      {language === "ar" ? "دخول" : "Login"}
                    </Link>
                  </div>

                  {/* Language toggle */}
                  <button
                    onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold tracking-widest transition-all text-soil-dark/45 hover:bg-gray-50"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {language === "en" ? "العربية" : "English"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={typeof window !== "undefined" ? window.location.pathname : "initial"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <DynamicFooter />

      {/* ── Back to top ── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 flex items-center justify-center"
            aria-label="Back to top"
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90" width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-soil-clay/20" />
              <motion.circle
                cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3"
                className="text-soil-clay"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 20}
                initial={false}
                animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - scrollProgress / 100) }}
              />
            </svg>
            <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-soil-clay text-white shadow-lg hover:bg-soil-dark transition-colors">
              <ChevronUp className="h-5 w-5" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
