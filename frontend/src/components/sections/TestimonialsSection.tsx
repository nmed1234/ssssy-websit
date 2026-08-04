"use client";

/**
 * TestimonialsSection — redesigned premium layout.
 *
 * LEFT  (RTL: RIGHT): President panel with portrait and featured quote.
 *        A decorative wavy stroke separates it from the cards column.
 *
 * RIGHT (RTL: LEFT): Member quote cards in an animated slider (3 per page on desktop,
 *        1 on mobile). All 12 real members are shown.
 *
 * Data priority:
 *   1. data.items (DB-configured)
 *   2. memberProfiles from /api/public/members  ← enriches ALL_STATIC with real photos
 *   3. boardMembers from /api/public/board-members (small list, photo injection only)
 *   4. ALL_STATIC fallback (always 12 members with quotes)
 */

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { TextReveal } from "@/components/ui/text-reveal";
import { useLanguage } from "@/lib/language-context";
import type { BoardMember } from "@/types";

/* Minimal shape we need from /api/public/members */
interface MemberProfile {
  nameAr?: string;
  nameEn?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  photo?: string;
  position?: string;
  titleAr?: string;
  institution?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Static member data (mirrors V73 seed — used as fallback when API is empty)
───────────────────────────────────────────────────────────────────────────── */
const STATIC_MEMBERS = [
  {
    nameAr: "د. محمد سعيد الشاطر",
    nameEn: "Dr. Mohammed Said Al-Shater",
    roleAr: "أستاذ — قسم علوم التربة، جامعة دمشق",
    roleEn: "Professor — Soil Science Dept., Damascus University",
    quoteAr: "الارتقاء بعلوم التربة في سوريا رسالتنا الأولى، وإيماننا بأن التربة الصحية هي أساس الأمن الغذائي.",
    quoteEn: "Advancing soil science in Syria is our foremost mission — healthy soil is the foundation of food security.",
    initials: "مش",
    color: "from-[#5c3d1e] to-[#3b7a57]",
  },
  {
    nameAr: "د. حيدر هاشم الحسن",
    nameEn: "Dr. Haidar Hashem Al-Hassan",
    roleAr: "رئيس قسم الموارد الطبيعية، جامعة حماه",
    roleEn: "Head of Natural Resources Dept., Hama University",
    quoteAr: "خصوبة التربة ليست مجرد رقم كيميائي، بل هي نبض الحياة الزراعية لأجيال قادمة.",
    quoteEn: "Soil fertility is not just a chemical index — it is the lifeblood of agriculture for generations to come.",
    initials: "حح",
    color: "from-[#1d4ed8] to-[#065f46]",
  },
  {
    nameAr: "د. محمد منهل الزعبي",
    nameEn: "Dr. Mohammed Manhal Al-Zoubi",
    roleAr: "مدير بحوث الموارد الطبيعية، الهيئة العامة للبحوث الزراعية",
    roleEn: "Research Director, General Commission for Agricultural Research",
    quoteAr: "التربة السورية كنز وطني؛ حمايتها واجب علمي وأخلاقي لكل باحث في هذا المجال.",
    quoteEn: "Syrian soil is a national treasure; protecting it is a scientific and moral duty for every researcher.",
    initials: "مز",
    color: "from-[#7c3aed] to-[#1d4ed8]",
  },
  {
    nameAr: "د. علاء حسن خلوف",
    nameEn: "Dr. Alaa Hassan Khalouf",
    roleAr: "رئيس قسم بحوث صيانة التربة، الهيئة العامة للبحوث الزراعية",
    roleEn: "Head of Soil Conservation Research, GCSAR",
    quoteAr: "نظم المعلومات الجغرافية تحوّلت من أداة إلى لغة نتحدث بها مع التربة لنفهم تحولاتها.",
    quoteEn: "GIS has transformed from a tool into a language through which we listen to and understand soil change.",
    initials: "عخ",
    color: "from-[#0f766e] to-[#1d4ed8]",
  },
  {
    nameAr: "أ.د. عمر عبد الله عبد الرزاق",
    nameEn: "Prof. Dr. Omar Abdullah Abdul-Razzaq",
    roleAr: "أمين جامعة الفرات — أستاذ صيانة التربة",
    roleEn: "Secretary of Euphrates University — Prof. of Soil Conservation",
    quoteAr: "مكافحة التصحر في المناطق الجافة تبدأ من تربة سليمة وعلماء ملتزمين.",
    quoteEn: "Combating desertification in arid regions starts with healthy soil and committed scientists.",
    initials: "عر",
    color: "from-[#b45309] to-[#7c3aed]",
  },
  {
    nameAr: "د. أكرم محمد البلخي",
    nameEn: "Dr. Akram Mohammed Al-Balkhi",
    roleAr: "نائب مدير إدارة الأراضي — أكساد / أستاذ جامعة دمشق",
    roleEn: "Deputy Director, Land Management — ACSAD / Damascus University",
    quoteAr: "خصوبة التربة أمانة في أعناقنا؛ كل جزيء من المادة العضوية نضيفه اليوم هو استثمار لعقود قادمة.",
    quoteEn: "Soil fertility is a trust we hold; every gram of organic matter we add today is an investment for decades ahead.",
    initials: "أب",
    color: "from-[#166534] to-[#1e40af]",
  },
  {
    nameAr: "د. محمود عودة",
    nameEn: "Dr. Mahmoud Oudeh",
    roleAr: "أستاذ — قسم التربة واستصلاح الأراضي، جامعة حمص",
    roleEn: "Professor — Soil & Land Reclamation Dept., Homs University",
    quoteAr: "الجمعية السورية لعلوم التربة منصة نحوّل فيها المعرفة إلى سياسات زراعية تخدم المزارع السوري.",
    quoteEn: "SSSY is a platform where we translate knowledge into agricultural policies that serve the Syrian farmer.",
    initials: "مع",
    color: "from-[#d97706] to-[#dc2626]",
  },
  {
    nameAr: "أ.د. محمد حسام بهلوان",
    nameEn: "Prof. Dr. Mohammed Hussam Bahlawan",
    roleAr: "أستاذ علوم التربة والمياه، كلية الزراعة، جامعة حلب",
    roleEn: "Professor of Soil & Water Sciences, Faculty of Agriculture, Aleppo University",
    quoteAr: "فهم جيوكيمياء التربة في المناطق الجافة مفتاح لإدارة مستدامة تضمن الأمن المائي والغذائي معاً.",
    quoteEn: "Understanding soil geochemistry in arid zones is the key to sustainable management ensuring both water and food security.",
    initials: "حب",
    color: "from-[#059669] to-[#0284c7]",
  },
];

/* Extra members from newer seeds */
const EXTRA_MEMBERS = [
  {
    nameAr: "د. لؤي الرفاعي",
    nameEn: "Dr. Louay Al-Refahee",
    roleAr: "باحث في علوم التربة",
    roleEn: "Soil Science Researcher",
    quoteAr: "البحث العلمي الجاد في علوم التربة هو الطريق الوحيد لنهضة زراعية حقيقية في سوريا.",
    quoteEn: "Rigorous soil science research is the only path to a genuine agricultural renaissance in Syria.",
    initials: "لر",
    color: "from-[#1d4ed8] to-[#7c3aed]",
  },
  {
    nameAr: "د. حسين السليمان",
    nameEn: "Dr. Hussain Al-Suleiman",
    roleAr: "متخصص في علوم التربة",
    roleEn: "Soil Science Specialist",
    quoteAr: "الاستدامة الزراعية تبدأ بفهم عميق لطبيعة التربة ومكوناتها الحيوية والكيميائية.",
    quoteEn: "Agricultural sustainability begins with a deep understanding of soil nature and its biological and chemical components.",
    initials: "حس",
    color: "from-[#065f46] to-[#1d4ed8]",
  },
  {
    nameAr: "د. سليمان سليم",
    nameEn: "Dr. Suleiman Salim",
    roleAr: "عضو الجمعية السورية لعلوم التربة",
    roleEn: "Member, Soil Science Society of Syria",
    quoteAr: "التعاون بين علماء التربة السوريين هو أساس بناء قاعدة بيانات وطنية شاملة لمواردنا الطبيعية.",
    quoteEn: "Collaboration among Syrian soil scientists is the foundation for building a comprehensive national database of our natural resources.",
    initials: "سس",
    color: "from-[#b45309] to-[#166534]",
  },
  {
    nameAr: "د. محمد دكة",
    nameEn: "Dr. Mohammed Dakkeh",
    roleAr: "عضو الجمعية السورية لعلوم التربة",
    roleEn: "Member, Soil Science Society of Syria",
    quoteAr: "الحفاظ على خصائص التربة الفيزيائية والكيميائية واجب وطني يتجاوز حدود المختبر.",
    quoteEn: "Preserving the physical and chemical properties of soil is a national duty that extends beyond the laboratory.",
    initials: "مد",
    color: "from-[#7c3aed] to-[#b45309]",
  },
];

const ALL_STATIC = [...STATIC_MEMBERS, ...EXTRA_MEMBERS];

/* ─────────────────────────────────────────────────────────────────────────────
   Props & types
───────────────────────────────────────────────────────────────────────────── */
interface TestimonialsSectionProps {
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
  boardMembers?: BoardMember[];
  /** Full member profiles from /api/public/members — used to inject real photos */
  memberProfiles?: MemberProfile[];
}

const CARDS_PER_PAGE = 3;

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */
export function TestimonialsSection({ data = {}, config = {}, boardMembers, memberProfiles }: TestimonialsSectionProps) {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  /*
   * Build member list — always use ALL_STATIC (12 members with curated quotes).
   *
   * data.items from DB contains only 3 entries (seeded founders) which is NOT
   * the full member roster.  We enrich ALL_STATIC with:
   *   1. Real photos from memberProfiles (/api/public/members — up to 50 entries)
   *   2. Real photos from boardMembers  (/api/public/board-members — small list)
   *
   * If data.items happens to have MORE than ALL_STATIC (e.g. admin added extras),
   * we append them after the static list.
   */
  const rawItems = data.items as
    | { name?: string; nameEn?: string; nameAr?: string; role?: string; roleEn?: string; roleAr?: string; quote?: string; quoteEn?: string; quoteAr?: string; avatar?: string }[]
    | undefined;

  /* ── Build photo map from real APIs ─────────────────────────────────── */
  const photoMap = new Map<string, string>();

  // 1️⃣  /api/public/members — richest source (has photos + Arabic names)
  if (memberProfiles && memberProfiles.length > 0) {
    for (const mp of memberProfiles) {
      const photo = mp.photoUrl || mp.photo;
      if (!photo) continue;
      const key = (mp.nameAr || "").trim();
      if (key) photoMap.set(key, photo);
      const last = key.split(" ").pop();
      if (last && last.length > 1) photoMap.set(last, photo);
    }
  }

  // 2️⃣  /api/public/board-members — fills any remaining gaps
  if (boardMembers && boardMembers.length > 0) {
    for (const bm of boardMembers) {
      const photo = bm.photoUrl || bm.memberPhoto;
      if (!photo) continue;
      const key = (bm.memberNameAr || bm.memberName || "").trim();
      if (key && !photoMap.has(key)) photoMap.set(key, photo);
      const last = key.split(" ").pop();
      if (last && last.length > 1 && !photoMap.has(last)) photoMap.set(last, photo);
    }
  }

  /* ── Map ALL_STATIC → member cards ──────────────────────────────────── */
  const members: { name: string; role: string; quote: string; initials: string; color: string; avatar?: string }[] =
    ALL_STATIC.map((m) => {
      const fullKey = m.nameAr.trim();
      const lastName = fullKey.split(" ").pop() ?? "";
      const avatar =
        photoMap.get(fullKey) ??
        (lastName.length > 1 ? photoMap.get(lastName) : undefined);
      return {
        name: isRtl ? m.nameAr : m.nameEn,
        role: isRtl ? m.roleAr : m.roleEn,
        quote: isRtl ? m.quoteAr : m.quoteEn,
        initials: m.initials,
        color: m.color,
        avatar,
      };
    });

  /* ── Append any DB items that go beyond ALL_STATIC ───────────────────── */
  if (rawItems && rawItems.length > ALL_STATIC.length) {
    const extras = rawItems.slice(ALL_STATIC.length);
    for (let idx = 0; idx < extras.length; idx++) {
      const item = extras[idx];
      members.push({
        name: isRtl ? (item.nameAr || item.name || "") : (item.nameEn || item.name || ""),
        role: isRtl ? (item.roleAr || item.role || "") : (item.roleEn || item.role || ""),
        quote: isRtl ? (item.quoteAr || item.quote || "") : (item.quoteEn || item.quote || ""),
        initials: (item.nameAr || item.name || "?")[0]?.toUpperCase() || "?",
        color: ALL_STATIC[(ALL_STATIC.length + idx) % ALL_STATIC.length]?.color ?? "from-[#5c3d1e] to-[#3b7a57]",
        avatar: item.avatar,
      });
    }
  }

  const totalPages = Math.ceil(members.length / CARDS_PER_PAGE);
  const visibleItems = members.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  const go = useCallback(
    (delta: 1 | -1) => {
      setDirection(delta);
      setPage((p) => (p + delta + totalPages) % totalPages);
    },
    [totalPages]
  );

  if (members.length === 0) return null;

  const sectionTitle =
    isRtl
      ? (config.titleAr as string) || (config.title as string) || "ماذا يقول أعضاؤنا"
      : (config.titleEn as string) || (config.title as string) || "What Our Members Say";

  const cardVariants = {
    enter: (d: number) => ({ x: d > 0 ? 72 : -72, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -72 : 72, opacity: 0, scale: 0.96 }),
  };

  return (
    <section
      className="relative overflow-hidden bg-white"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Section heading */}
      <div className="pt-14 pb-8 text-center px-4 bg-white">
        <TextReveal
          as="h2"
          className={`${almarai.className} text-3xl md:text-4xl font-bold text-soil-dark`}
        >
          {sectionTitle}
        </TextReveal>
        <div className="mt-3 mx-auto h-[3px] w-16 rounded-full bg-forest" />
      </div>

      {/* Main two-column layout */}
      <div className="flex flex-col lg:flex-row min-h-[620px]">

        {/* ══════════════════════════════════════════════════════════════
            PRESIDENT PANEL — S-curve wave edge (أريد-style)
            LTR: panel on left, wave on right edge
            RTL: panel on right, wave on left edge
        ══════════════════════════════════════════════════════════════ */}
        <div className="relative flex-shrink-0 w-full lg:w-[420px] xl:w-[460px]">

          {/* White background */}
          <div className="absolute inset-0 bg-white" />
          {/* Very subtle warm tint so it's not clinical white */}
          <div className="absolute inset-0 bg-soil-cream/20" />

          {/*
           * ── VERTICAL WAVE — same cubic-bezier as HeroCarousel bottom wave,
           *    rotated 90°.  viewBox="0 0 60 600" where X=depth, Y=height.
           *
           *  Horizontal original: M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,60 L0,60 Z
           *  Scaled to 600 tall:  replace 1440→600, 60→60 depth, same ratio
           *
           *  LTR: wave on the RIGHT edge — white fill bleeds right
           *  RTL: wave on the LEFT  edge — white fill bleeds left (mirrored)
           *
           *  The wave SVG is 60px wide and 100% tall; it sits flush against
           *  the panel edge and fills the small gap with white curves.
           *)
          */}
          {/*
           * Wave border — a single SVG <path> stroked in elegant brown,
           * no fill. The stroke IS the decorative wavy edge.
           * Width 32px so the stroke sits fully inside the SVG canvas.
           * stroke-width=3 gives a clean raised-looking line.
           *
           * RTL: stroke on the LEFT edge  → path curves leftward
           * LTR: stroke on the RIGHT edge → path curves rightward
           */}
          <svg
            className="absolute top-0 h-full z-10 hidden lg:block pointer-events-none"
            style={{
              width: "40px",
              [isRtl ? "left" : "right"]: "0px",
            }}
            viewBox="0 0 40 600"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {isRtl ? (
              /* RTL — wavy stroke on LEFT side, curves bulge left */
              <path
                d="M36,0
                   C36,0   4,100  20,200
                   C36,300  4,400  20,500
                   C28,550 36,600  36,600"
                fill="none"
                stroke="#8D6E63"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              /* LTR — wavy stroke on RIGHT side, curves bulge right */
              <path
                d="M4,0
                   C4,0   36,100  20,200
                   C4,300  36,400  20,500
                   C12,550  4,600   4,600"
                fill="none"
                stroke="#8D6E63"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Content */}
          <div className={`
            relative z-10 flex flex-col items-center justify-center
            h-full min-h-[580px] py-12
            ${isRtl ? "pr-10 pl-20 lg:pl-24" : "pl-10 pr-20 lg:pr-24"}
          `}>

            {/* ── Portrait card ── */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-7 w-52 md:w-60"
            >
              {/* Card shadow + rounded corners */}
              <div
                className="relative w-full overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(62,39,35,0.20),0_2px_8px_rgba(62,39,35,0.10)] border border-soil-sand/60"
              >
                {/* Soil-tone top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-soil-clay/80 to-transparent z-10" />

                <Image
                  src="/president.jpg"
                  alt={isRtl ? "رئيس الجمعية" : "Society President"}
                  width={240}
                  height={290}
                  className="object-cover object-top w-full"
                  style={{ aspectRatio: "4/5" }}
                  priority
                />

                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-4 pt-8 pb-4 z-10">
                  <p className="text-white font-bold text-sm leading-tight text-center drop-shadow">
                    {isRtl ? "د. عبد الكريم جعفر" : "Dr. Abd Al-Karim Jaafar"}
                  </p>
                  <p className="text-[#c9a227] text-[0.7rem] text-center mt-0.5 font-medium">
                    {isRtl ? "رئيس الجمعية" : "Society President"}
                  </p>
                </div>
              </div>

            </motion.div>

            {/* Quote block */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`
                relative max-w-[260px]
                bg-white rounded-xl
                border border-soil-sand/70
                shadow-[0_2px_12px_rgba(62,39,35,0.08)]
                px-5 py-4
                ${isRtl ? "text-right" : "text-left"}
              `}
            >
              {/* Decorative quote mark */}
              <span
                className="absolute text-soil-clay/20 font-serif pointer-events-none select-none"
                style={{ fontSize: "3.5rem", lineHeight: 1, top: "-8px", [isRtl ? "right" : "left"]: "10px" }}
              >
                &ldquo;
              </span>
              <p className="text-soil-clay text-[0.82rem] leading-[1.8] italic relative z-10">
                {isRtl
                  ? "التربة هي الأساس الذي تقوم عليه الحضارة؛ جمعيتنا تسعى لأن تكون المرجع العلمي الأول في صون هذا المورد الحيوي."
                  : "Soil is the foundation of civilisation; our society strives to be the foremost scientific reference for safeguarding this vital resource."}
              </p>
              {/* Soil-tone bottom line */}
              <div className="mt-3 h-px bg-gradient-to-r from-soil-clay/50 via-soil-clay/80 to-transparent" />
            </motion.div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MEMBER CARDS — slider
        ══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-10 lg:px-12 py-10 lg:py-14">

          {/* Cards */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {visibleItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                    className="group"
                  >
                    <div className="
                      relative h-full rounded-2xl overflow-hidden
                      bg-white border border-soil-sand/60
                      shadow-[0_2px_12px_rgba(62,39,35,0.08),0_6px_24px_rgba(62,39,35,0.06)]
                      transition-all duration-300
                      group-hover:-translate-y-1.5
                      group-hover:shadow-[0_6px_24px_rgba(62,39,35,0.14),0_12px_36px_rgba(62,39,35,0.10)]
                      group-hover:border-soil-clay/30
                      flex flex-col
                    ">
                      {/* Top colour bar */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${item.color} opacity-80 group-hover:opacity-100 transition-opacity`} />

                      <div className="p-5 flex flex-col flex-1">
                        {/* Quote icon */}
                        <Quote className="w-6 h-6 text-soil-clay/30 mb-3 flex-shrink-0 group-hover:text-soil-clay/50 transition-colors" />

                        {/* Quote text */}
                        <p className={`text-earth-gray text-sm leading-relaxed flex-1 mb-5 line-clamp-4 ${isRtl ? "text-right" : "text-left"}`}>
                          {item.quote || (isRtl ? "عضو فاعل في الجمعية السورية لعلوم التربة." : "Active member of the Soil Science Society of Syria.")}
                        </p>

                        {/* Member info */}
                        <div className={`flex items-center gap-3 mt-auto ${isRtl ? "flex-row-reverse" : ""}`}>
                          {/* Avatar */}
                          {item.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm`}>
                              <span className="text-white text-xs font-bold leading-none">{item.initials}</span>
                            </div>
                          )}
                          <div className={isRtl ? "text-right" : "text-left"}>
                            <p className="font-semibold text-soil-dark text-sm leading-tight">{item.name}</p>
                            <p className="text-soil-clay/80 text-xs mt-0.5 line-clamp-2 leading-snug">{item.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider navigation */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              {/* زر السابق — يسار في LTR، يمين في RTL */}
              <button
                onClick={() => go(isRtl ? 1 : -1)}
                aria-label={isRtl ? "السابق" : "Previous"}
                className="w-9 h-9 rounded-full border border-soil-clay/30 flex items-center justify-center text-soil-clay hover:bg-soil-clay hover:text-white transition-all duration-200 hover:border-soil-clay"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              {/* Dot indicators */}
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > page ? 1 : -1); setPage(i); }}
                    aria-label={`${isRtl ? "صفحة" : "Page"} ${i + 1}`}
                    className={`rounded-full transition-all duration-200 ${
                      i === page
                        ? "w-6 h-2.5 bg-soil-clay"
                        : "w-2.5 h-2.5 bg-soil-clay/25 hover:bg-soil-clay/50"
                    }`}
                  />
                ))}
              </div>

              {/* زر التالي — يمين في LTR، يسار في RTL */}
              <button
                onClick={() => go(isRtl ? -1 : 1)}
                aria-label={isRtl ? "التالي" : "Next"}
                className="w-9 h-9 rounded-full border border-soil-clay/30 flex items-center justify-center text-soil-clay hover:bg-soil-clay hover:text-white transition-all duration-200 hover:border-soil-clay"
              >
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Page counter */}
          {totalPages > 1 && (
            <p className="text-center text-xs text-earth-gray/60 mt-3">
              {isRtl ? `${page + 1} / ${totalPages}` : `${page + 1} / ${totalPages}`}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
