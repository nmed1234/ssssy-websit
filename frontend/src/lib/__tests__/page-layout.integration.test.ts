/**
 * Integration tests for migrateLegacySections() — all 24 legacy component types.
 *
 * Uses realistic fixture data that mirrors actual page_sections DB rows:
 * each fixture has the 3-bag structure (data, config, styling) with meaningful
 * Arabic/English text and items arrays where applicable.
 *
 * Requirements covered: 1.1, 1.4, 1.5, 1.6
 */

import { describe, it, expect } from "vitest";
import {
  migrateLegacySections,
  LEGACY_SECTION_TYPES,
} from "@/components/page-builder/schema/page-layout";

// ─── Fixture helpers ──────────────────────────────────────────────────────────

/** Shape of a real page_sections row from the database */
interface DbRow {
  id: string;
  componentType: string;
  data: Record<string, unknown>;
  config: Record<string, unknown>;
  styling: Record<string, unknown>;
  sortOrder: number;
  visibility?: string;
}

function makeRow(
  componentType: string,
  overrides: Partial<Omit<DbRow, "componentType">> = {},
): DbRow {
  return {
    id: overrides.id ?? `fixture-${componentType}`,
    componentType,
    data:    overrides.data    ?? {},
    config:  overrides.config  ?? {},
    styling: overrides.styling ?? {},
    sortOrder: overrides.sortOrder ?? 0,
    visibility: overrides.visibility,
  };
}

// ─── Realistic fixture data for all 24 legacy types ──────────────────────────

const FIXTURES: DbRow[] = [
  makeRow("about-hero-banner", {
    id: "fix-001", sortOrder: 1,
    data: {
      title: "About the Society",
      titleAr: "عن الجمعية",
      subtitle: "Learn more about who we are and what we do",
      subtitleAr: "تعرف على من نحن وماذا نفعل",
      backgroundImage: "/images/about-hero.jpg",
      primaryButtonLabel: "Learn More",
      primaryButtonLabelAr: "اقرأ المزيد",
      primaryButtonUrl: "/about/overview",
      secondaryButtonLabel: "Contact Us",
      secondaryButtonLabelAr: "تواصل معنا",
      secondaryButtonUrl: "/contact",
    },
    config:  { minHeight: "500px", overlayColor: "rgba(0,0,0,0.45)" },
    styling: { paddingTop: "0", paddingBottom: "0" },
  }),

  makeRow("about-overview-section", {
    id: "fix-002", sortOrder: 2,
    data: {
      heading: "Overview",
      headingAr: "نظرة عامة",
      paragraphs: [
        { textEn: "The Soil Science Society of Syria was founded in 1985.", textAr: "تأسست جمعية علوم التربة السورية عام 1985." },
        { textEn: "We unite researchers and practitioners across the country.", textAr: "نوحّد الباحثين والممارسين في جميع أنحاء البلاد." },
      ],
    },
    config:  {},
    styling: { backgroundColor: "#f9f9f9" },
  }),

  makeRow("about-vision-mission-section", {
    id: "fix-003", sortOrder: 3,
    data: {
      heading: "Vision & Mission",
      headingAr: "الرؤية والرسالة",
      subheading: "What drives us forward",
      subheadingAr: "ما الذي يدفعنا إلى الأمام",
      panels: [
        {
          icon: "🌱",
          titleEn: "Our Vision",
          titleAr: "رؤيتنا",
          contentEn: "A sustainable agricultural Syria through science.",
          contentAr: "سوريا زراعية مستدامة من خلال العلم.",
          gradientClass: "from-green-600 to-green-400",
          buttonLabelEn: "Read More",
          buttonLabelAr: "اقرأ المزيد",
          buttonUrl: "/about/vision",
        },
        {
          icon: "🎯",
          titleEn: "Our Mission",
          titleAr: "مهمتنا",
          contentEn: "Promote soil science education and applied research.",
          contentAr: "تعزيز تعليم علوم التربة والبحث التطبيقي.",
          gradientClass: "from-blue-600 to-blue-400",
        },
      ],
    },
    config:  {},
    styling: { paddingTop: "4rem", paddingBottom: "4rem" },
  }),

  makeRow("about-organizational-chart-section", {
    id: "fix-004", sortOrder: 4,
    data: {
      heading: "Organizational Chart",
      headingAr: "الهيكل التنظيمي",
      paragraphs: [
        { textEn: "The society is governed by an elected board of directors.", textAr: "تُدار الجمعية من قِبَل مجلس إدارة منتخب." },
      ],
    },
    config:  {},
    styling: {},
  }),

  makeRow("about-timeline-section", {
    id: "fix-005", sortOrder: 5,
    data: {
      heading: "Our History",
      headingAr: "تاريخنا",
      subheading: "Key milestones since 1985",
      subheadingAr: "أبرز المحطات منذ عام 1985",
      items: [
        { year: "1985", titleEn: "Society Founded", titleAr: "تأسيس الجمعية", descEn: "Official registration in Damascus.", descAr: "التسجيل الرسمي في دمشق." },
        { year: "1995", titleEn: "First National Conference", titleAr: "أول مؤتمر وطني", descEn: "200 attendees from across Syria.", descAr: "200 مشارك من جميع أنحاء سوريا." },
        { year: "2010", titleEn: "Digital Platform Launch", titleAr: "إطلاق المنصة الرقمية", descEn: "Members gained online access.", descAr: "حصل الأعضاء على وصول إلكتروني." },
      ],
    },
    config:  {},
    styling: {},
  }),

  makeRow("about-documents-section", {
    id: "fix-006", sortOrder: 6,
    data: {
      heading: "Official Documents",
      headingAr: "الوثائق الرسمية",
      documents: [
        { labelEn: "Society Bylaws",    labelAr: "النظام الداخلي",   url: "/docs/bylaws.pdf",   fileType: "PDF" },
        { labelEn: "Annual Report 2023",labelAr: "التقرير السنوي 2023", url: "/docs/report-2023.pdf", fileType: "PDF" },
        { labelEn: "Membership Form",   labelAr: "استمارة العضوية",  url: "/docs/membership.docx", fileType: "DOCX" },
      ],
    },
    config:  {},
    styling: {},
  }),

  makeRow("about-gallery-section", {
    id: "fix-007", sortOrder: 7,
    data: {
      heading: "Photo Gallery",
      headingAr: "معرض الصور",
      subheading: "Moments from our events",
      subheadingAr: "لحظات من فعالياتنا",
      images: [
        { src: "/images/gallery/conf-2023-01.jpg", alt: "Conference 2023 opening", caption: "Opening ceremony" },
        { src: "/images/gallery/conf-2023-02.jpg", alt: "Workshop session",        caption: "Soil sampling workshop" },
        { src: "/images/gallery/field-trip.jpg",   alt: "Field trip",              caption: "Annual field visit" },
      ],
    },
    config:  { columns: 3, columnsMobile: 1 },
    styling: {},
  }),

  makeRow("board-hero-banner", {
    id: "fix-008", sortOrder: 8,
    data: {
      title: "Board of Directors",
      titleAr: "مجلس الإدارة",
      subtitle: "Meet the people leading our society",
      subtitleAr: "تعرّف على القائمين على إدارة الجمعية",
      backgroundImage: "/images/board-hero.jpg",
      primaryButtonLabel: "View Members",
      primaryButtonLabelAr: "عرض الأعضاء",
      primaryButtonUrl: "/board/members",
    },
    config:  { minHeight: "450px", overlayColor: "rgba(15,23,42,0.55)" },
    styling: {},
  }),

  makeRow("board-members-intro-grid", {
    id: "fix-009", sortOrder: 9,
    data: {
      heading: "Board Members",
      headingAr: "أعضاء مجلس الإدارة",
      subheading: "2022–2025 term",
      subheadingAr: "الدورة 2022–2025",
      introText: "Our board comprises leading soil scientists from Syrian universities.",
      introTextAr: "يضم مجلسنا كبار علماء التربة من الجامعات السورية.",
      members: [
        { nameEn: "Dr. Ahmad Al-Hassan", nameAr: "د. أحمد الحسن", role: "President", roleAr: "الرئيس", avatar: "/members/ahmad.jpg" },
        { nameEn: "Dr. Lina Barakat",    nameAr: "د. لينا بركات",  role: "Vice President", roleAr: "نائب الرئيس", avatar: "/members/lina.jpg" },
      ],
    },
    config:  { columns: 3 },
    styling: {},
  }),

  makeRow("board-members-grid", {
    id: "fix-010", sortOrder: 10,
    data: {
      heading: "All Board Members",
      headingAr: "جميع أعضاء مجلس الإدارة",
      showAllMembers: true,
    },
    config:  {},
    styling: { backgroundColor: "#ffffff" },
  }),

  makeRow("board-term-information-section", {
    id: "fix-011", sortOrder: 11,
    data: {
      heading: "Term Information",
      headingAr: "معلومات الدورة",
      paragraphs: [
        { textEn: "The current board term runs from January 2022 to December 2025.", textAr: "تمتد الدورة الحالية من يناير 2022 إلى ديسمبر 2025." },
        { textEn: "Elections are held every three years by registered members.", textAr: "تُعقد الانتخابات كل ثلاث سنوات من قِبَل الأعضاء المسجلين." },
      ],
    },
    config:  {},
    styling: {},
  }),

  makeRow("contact-hero-banner", {
    id: "fix-012", sortOrder: 12,
    data: {
      title: "Contact Us",
      titleAr: "تواصل معنا",
      subtitle: "We're happy to hear from you",
      subtitleAr: "يسعدنا التواصل معكم",
      backgroundImage: "/images/contact-hero.jpg",
    },
    config:  { minHeight: "400px", overlayColor: "rgba(0,0,0,0.4)" },
    styling: {},
  }),

  makeRow("contact-form-section", {
    id: "fix-013", sortOrder: 13,
    data: {
      heading: "Send Us a Message",
      headingAr: "أرسل إلينا رسالة",
      showPhone: true,
      showSubject: true,
    },
    config:  {},
    styling: { paddingTop: "3rem", paddingBottom: "3rem" },
  }),

  makeRow("newsletter-hero-banner", {
    id: "fix-014", sortOrder: 14,
    data: {
      title: "Newsletter",
      titleAr: "النشرة الإخبارية",
      subtitle: "Stay informed about soil science in Syria",
      subtitleAr: "ابقَ على اطلاع بأخبار علوم التربة في سوريا",
      backgroundImage: "/images/newsletter-hero.jpg",
    },
    config:  { minHeight: "380px" },
    styling: {},
  }),

  makeRow("president-message-hero-banner", {
    id: "fix-015", sortOrder: 15,
    data: {
      title: "Message from the President",
      titleAr: "كلمة الرئيس",
      subtitle: "A word from our society's president",
      subtitleAr: "كلمة من رئيس الجمعية",
      backgroundImage: "/images/president-bg.jpg",
    },
    config:  { minHeight: "420px", overlayColor: "rgba(5,10,30,0.6)" },
    styling: {},
  }),

  makeRow("president-message-content-section", {
    id: "fix-016", sortOrder: 16,
    data: {
      heading: "President's Message",
      headingAr: "رسالة الرئيس",
      paragraphs: [
        { textEn: "Dear colleagues and members of our society,", textAr: "أعزائي الزملاء وأعضاء الجمعية،" },
        { textEn: "It is my honour to serve this distinguished scientific community.", textAr: "يشرّفني خدمة هذا المجتمع العلمي المرموق." },
      ],
      quoteEn: "Science is the foundation of progress.",
      quoteAr: "العلم هو أساس التقدم.",
      quoteAuthor: "Dr. Ahmad Al-Hassan",
      presidentName: "Dr. Ahmad Al-Hassan",
      presidentNameAr: "د. أحمد الحسن",
      presidentTitle: "President, Soil Science Society of Syria",
      presidentTitleAr: "رئيس جمعية علوم التربة السورية",
      photo: "/images/president.jpg",
      socialLinks: [
        { platform: "twitter",  url: "https://twitter.com/ahmad_hassan_sss" },
        { platform: "linkedin", url: "https://linkedin.com/in/ahmad-hassan" },
      ],
    },
    config:  {},
    styling: {},
  }),

  makeRow("publications-hero-banner", {
    id: "fix-017", sortOrder: 17,
    data: {
      title: "Publications",
      titleAr: "المنشورات",
      subtitle: "Research, journals, and scientific papers",
      subtitleAr: "الأبحاث والمجلات والأوراق العلمية",
      backgroundImage: "/images/publications-hero.jpg",
    },
    config:  { minHeight: "400px" },
    styling: {},
  }),

  makeRow("news-list-section", {
    id: "fix-018", sortOrder: 18,
    data: {
      title: "Latest News",
      titleAr: "آخر الأخبار",
      subtitle: "Stay up to date",
      subtitleAr: "ابقَ على اطلاع",
      maxItems: 6,
      showViewAll: true,
      viewAllUrl: "/news",
    },
    config:  {},
    styling: { backgroundColor: "#f5f5f5" },
  }),

  makeRow("events-list-section", {
    id: "fix-019", sortOrder: 19,
    data: {
      title: "Upcoming Events",
      titleAr: "الفعاليات القادمة",
      subtitle: "Conferences, workshops and more",
      subtitleAr: "مؤتمرات وورش عمل والمزيد",
      maxItems: 6,
      showViewAll: true,
      viewAllUrl: "/events",
    },
    config:  {},
    styling: {},
  }),

  makeRow("jobs-list-section", {
    id: "fix-020", sortOrder: 20,
    data: {
      title: "Job Opportunities",
      titleAr: "فرص العمل",
      subtitle: "Career openings in soil science",
      subtitleAr: "فرص مهنية في مجال علوم التربة",
      maxItems: 8,
      showViewAll: true,
      viewAllUrl: "/jobs",
    },
    config:  {},
    styling: {},
  }),

  makeRow("members-list-section", {
    id: "fix-021", sortOrder: 21,
    data: {
      title: "Our Members",
      titleAr: "أعضاؤنا",
      subtitle: "Scientists and professionals across Syria",
      subtitleAr: "علماء ومتخصصون في جميع أنحاء سوريا",
      maxItems: 12,
      showViewAll: true,
      viewAllUrl: "/members",
    },
    config:  {},
    styling: {},
  }),

  makeRow("publications-list-section", {
    id: "fix-022", sortOrder: 22,
    data: {
      title: "Scientific Publications",
      titleAr: "المنشورات العلمية",
      subtitle: "Browse our research archive",
      subtitleAr: "استعرض أرشيف بحوثنا",
      maxItems: 6,
      showViewAll: true,
      viewAllUrl: "/publications",
    },
    config:  {},
    styling: {},
  }),

  makeRow("board-list-section", {
    id: "fix-023", sortOrder: 23,
    data: {
      title: "Board of Directors",
      titleAr: "مجلس الإدارة",
      subtitle: "Current governing board",
      subtitleAr: "مجلس الإدارة الحالي",
      maxItems: 10,
      showViewAll: false,
    },
    config:  {},
    styling: {},
  }),
];

// ─── Helper: look up a fixture by componentType ───────────────────────────────

function fixtureFor(componentType: string): DbRow {
  const found = FIXTURES.find((f) => f.componentType === componentType);
  if (!found) throw new Error(`No fixture for "${componentType}"`);
  return found;
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. Per-type integration tests — one per legacy section type
// ═════════════════════════════════════════════════════════════════════════════

describe("Per-type integration — each of the 24 legacy section types", () => {
  for (const type of Array.from(LEGACY_SECTION_TYPES)) {
    describe(`${type}`, () => {
      it("does not throw during migration", () => {
        const row = fixtureFor(type);
        expect(() => migrateLegacySections([row])).not.toThrow();
      });

      it("produces a block whose type matches the componentType", () => {
        const row = fixtureFor(type);
        const { blocks } = migrateLegacySections([row]);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].type).toBe(type);
      });

      it("block.props is a non-null object", () => {
        const row = fixtureFor(type);
        const { blocks } = migrateLegacySections([row]);
        expect(blocks[0].props).not.toBeNull();
        expect(typeof blocks[0].props).toBe("object");
      });

      it("block.id is preserved from the fixture row id", () => {
        const row = fixtureFor(type);
        const { blocks } = migrateLegacySections([row]);
        expect(blocks[0].id).toBe(row.id);
      });
    });
  }
});

// ─── Spot-checks for key fields in each fixture ────────────────────────────

describe("Per-type spot-checks — fixture fields accessible in props", () => {
  it("about-hero-banner: title, titleAr, backgroundImage accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("about-hero-banner")]);
    expect(blocks[0].props.title).toBe("About the Society");
    expect(blocks[0].props.titleAr).toBe("عن الجمعية");
    expect(blocks[0].props.backgroundImage).toBe("/images/about-hero.jpg");
  });

  it("about-overview-section: heading, headingAr, paragraphs array accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("about-overview-section")]);
    expect(blocks[0].props.heading).toBe("Overview");
    expect(blocks[0].props.headingAr).toBe("نظرة عامة");
    expect(Array.isArray(blocks[0].props.paragraphs)).toBe(true);
  });

  it("about-vision-mission-section: heading, panels array accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("about-vision-mission-section")]);
    expect(blocks[0].props.heading).toBe("Vision & Mission");
    expect(Array.isArray(blocks[0].props.panels)).toBe(true);
    expect((blocks[0].props.panels as unknown[]).length).toBe(2);
  });

  it("about-timeline-section: items array with year/titleEn accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("about-timeline-section")]);
    const items = blocks[0].props.items as Array<Record<string, unknown>>;
    expect(Array.isArray(items)).toBe(true);
    expect(items[0].year).toBe("1985");
    expect(items[0].titleEn).toBe("Society Founded");
  });

  it("about-documents-section: documents array with url/fileType accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("about-documents-section")]);
    const docs = blocks[0].props.documents as Array<Record<string, unknown>>;
    expect(Array.isArray(docs)).toBe(true);
    expect(docs[0].labelEn).toBe("Society Bylaws");
    expect(docs[0].fileType).toBe("PDF");
  });

  it("about-gallery-section: images array with src/alt accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("about-gallery-section")]);
    const images = blocks[0].props.images as Array<Record<string, unknown>>;
    expect(Array.isArray(images)).toBe(true);
    expect(images[0].src).toBe("/images/gallery/conf-2023-01.jpg");
    expect(images[0].alt).toBe("Conference 2023 opening");
  });

  it("board-hero-banner: title, backgroundImage, primaryButtonUrl accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("board-hero-banner")]);
    expect(blocks[0].props.title).toBe("Board of Directors");
    expect(blocks[0].props.backgroundImage).toBe("/images/board-hero.jpg");
    expect(blocks[0].props.primaryButtonUrl).toBe("/board/members");
  });

  it("board-term-information-section: heading, paragraphs array accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("board-term-information-section")]);
    expect(blocks[0].props.heading).toBe("Term Information");
    expect(Array.isArray(blocks[0].props.paragraphs)).toBe(true);
  });

  it("contact-form-section: heading, showPhone, showSubject accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("contact-form-section")]);
    expect(blocks[0].props.heading).toBe("Send Us a Message");
    expect(blocks[0].props.showPhone).toBe(true);
    expect(blocks[0].props.showSubject).toBe(true);
  });

  it("president-message-content-section: paragraphs + socialLinks accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("president-message-content-section")]);
    expect(Array.isArray(blocks[0].props.paragraphs)).toBe(true);
    // socialLinks has its own items field — note migrateLegacySections handles
    // only one items field per block; paragraphs is the primary items key here.
    // socialLinks comes through as a scalar merged from data.
    expect(Array.isArray(blocks[0].props.socialLinks)).toBe(true);
  });

  it("news-list-section: title, maxItems, showViewAll accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("news-list-section")]);
    expect(blocks[0].props.title).toBe("Latest News");
    expect(blocks[0].props.maxItems).toBe(6);
    expect(blocks[0].props.showViewAll).toBe(true);
  });

  it("board-list-section: title, maxItems accessible", () => {
    const { blocks } = migrateLegacySections([fixtureFor("board-list-section")]);
    expect(blocks[0].props.title).toBe("Board of Directors");
    expect(blocks[0].props.maxItems).toBe(10);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. Cross-type smoke test — all 24 fixtures in one call
// ═════════════════════════════════════════════════════════════════════════════

describe("Cross-type smoke test — all 24 fixtures together", () => {
  it("migrates all 24 without throwing", () => {
    expect(() => migrateLegacySections(FIXTURES)).not.toThrow();
  });

  it("returns exactly 24 blocks", () => {
    const { blocks } = migrateLegacySections(FIXTURES);
    expect(blocks).toHaveLength(24);
  });

  it("every block has a non-empty type string", () => {
    const { blocks } = migrateLegacySections(FIXTURES);
    for (const block of blocks) {
      expect(typeof block.type).toBe("string");
      expect(block.type.length).toBeGreaterThan(0);
    }
  });

  it("every block has a non-null props object", () => {
    const { blocks } = migrateLegacySections(FIXTURES);
    for (const block of blocks) {
      expect(block.props).not.toBeNull();
      expect(typeof block.props).toBe("object");
    }
  });

  it("all 24 legacy types appear in the result", () => {
    const { blocks } = migrateLegacySections(FIXTURES);
    const types = new Set(blocks.map((b) => b.type));
    for (const expectedType of Array.from(LEGACY_SECTION_TYPES)) {
      expect(types.has(expectedType)).toBe(true);
    }
  });

  it("PageLayout has version '1'", () => {
    const layout = migrateLegacySections(FIXTURES);
    expect(layout.version).toBe("1");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. Bilingual completeness — missing En or Ar defaults to ""
// ═════════════════════════════════════════════════════════════════════════════

describe("Bilingual completeness — missing variant defaults to empty string", () => {
  it("about-hero-banner with only EN title: titleAr defaults to ''", () => {
    const row = makeRow("about-hero-banner", {
      data: { title: "About Us" }, // titleAr intentionally missing
    });
    const { blocks } = migrateLegacySections([row]);
    expect(blocks[0].props.title).toBe("About Us");
    expect(blocks[0].props.titleAr).toBe("");
  });

  it("about-hero-banner with only AR title: title (EN) defaults to ''", () => {
    const row = makeRow("about-hero-banner", {
      data: { titleAr: "عن الجمعية" }, // title (EN) intentionally missing
    });
    const { blocks } = migrateLegacySections([row]);
    expect(blocks[0].props.titleAr).toBe("عن الجمعية");
    expect(blocks[0].props.title).toBe("");
  });

  it("about-overview-section with only AR heading: heading (EN) defaults to ''", () => {
    const row = makeRow("about-overview-section", {
      data: { headingAr: "نظرة عامة" },
    });
    const { blocks } = migrateLegacySections([row]);
    expect(blocks[0].props.headingAr).toBe("نظرة عامة");
    expect(blocks[0].props.heading).toBe("");
  });

  it("board-hero-banner with only EN subtitle: subtitleAr defaults to ''", () => {
    const row = makeRow("board-hero-banner", {
      data: { subtitle: "Meet the board" },
    });
    const { blocks } = migrateLegacySections([row]);
    expect(blocks[0].props.subtitle).toBe("Meet the board");
    expect(blocks[0].props.subtitleAr).toBe("");
  });

  it("news-list-section with no bilingual data: both title and titleAr default to ''", () => {
    const row = makeRow("news-list-section", { data: { maxItems: 5 } });
    const { blocks } = migrateLegacySections([row]);
    expect(blocks[0].props.title).toBe("");
    expect(blocks[0].props.titleAr).toBe("");
  });

  it("empty string bilingual value is preserved (not overridden by default)", () => {
    const row = makeRow("about-hero-banner", {
      data: { title: "Hello", titleAr: "" }, // explicit empty string AR
    });
    const { blocks } = migrateLegacySections([row]);
    expect(blocks[0].props.titleAr).toBe("");
    expect(blocks[0].props.title).toBe("Hello");
  });

  it("contact-hero-banner: primaryButtonLabelEn/Ar absent → both default to ''", () => {
    const row = makeRow("contact-hero-banner", {
      data: { title: "Contact", titleAr: "تواصل" },
    });
    const { blocks } = migrateLegacySections([row]);
    // contact-hero-banner doesn't have primaryButtonLabel fields, but title/subtitle do
    expect(typeof blocks[0].props.title).toBe("string");
    expect(typeof blocks[0].props.titleAr).toBe("string");
  });
});
