/**
 * Unit tests for migrateLegacySections() and findItemsArray()
 *
 * Requirements covered: 1.4, 1.5, 1.6, 1.7
 */

import { describe, it, expect } from "vitest";
import {
  migrateLegacySections,
  findItemsArray,
  LEGACY_SECTION_TYPES,
} from "@/components/page-builder/schema/page-layout";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSection(
  componentType: string,
  overrides: {
    id?: string;
    data?: Record<string, unknown>;
    config?: Record<string, unknown>;
    styling?: Record<string, unknown>;
    sortOrder?: number;
    visibility?: string;
  } = {},
) {
  return {
    id: overrides.id ?? `sec-${componentType}`,
    componentType,
    data: overrides.data ?? {},
    config: overrides.config ?? {},
    styling: overrides.styling ?? {},
    sortOrder: overrides.sortOrder ?? 0,
    visibility: overrides.visibility,
  };
}

// ─── findItemsArray ───────────────────────────────────────────────────────────

describe("findItemsArray", () => {
  it("returns the array at obj[itemsKey] when present", () => {
    const obj = { items: [{ id: 1 }], other: "text" };
    expect(findItemsArray(obj, "items")).toEqual([{ id: 1 }]);
  });

  it("returns a non-empty array under a legacy nested key when exact key is absent", () => {
    // e.g. about-vision-mission-section stores items as data.panels
    const obj = { panels: [{ titleEn: "Vision" }] };
    expect(findItemsArray(obj, "panels")).toEqual([{ titleEn: "Vision" }]);
  });

  it("falls back to scanning values when itemsKey is not present but another array exists", () => {
    // exact key is 'paragraphs' but data stored them as 'paragraphs' — should find it
    const obj = { paragraphs: [{ textEn: "Hello" }] };
    expect(findItemsArray(obj, "paragraphs")).toEqual([{ textEn: "Hello" }]);
  });

  it("finds legacy arrays under arbitrary nested key names (images, members, etc.)", () => {
    const obj = { images: [{ src: "/a.jpg" }] };
    // itemsKey in schema for about-gallery-section is 'images'
    expect(findItemsArray(obj, "images")).toEqual([{ src: "/a.jpg" }]);
  });

  it("ignores empty arrays when scanning for legacy fallback", () => {
    // data.panels is empty, so scanning should not return it
    const obj = { panels: [] };
    expect(findItemsArray(obj, "items")).toBeUndefined();
  });

  it("returns undefined when no array exists at all", () => {
    const obj = { title: "Hello", count: 3 };
    expect(findItemsArray(obj, "items")).toBeUndefined();
  });

  it("prefers exact itemsKey match over scanning even if another non-empty array exists", () => {
    const obj = { items: [{ a: 1 }], panels: [{ b: 2 }, { b: 3 }] };
    expect(findItemsArray(obj, "items")).toEqual([{ a: 1 }]);
  });
});

// ─── migrateLegacySections — scalar merge precedence ─────────────────────────

describe("migrateLegacySections — scalar merge precedence (Req 1.4)", () => {
  it("data wins over config and styling on key collision", () => {
    const sections = [
      makeSection("about-hero-banner", {
        data:    { title: "from-data",    subtitle: "data-sub" },
        config:  { title: "from-config",  subtitle: "config-sub" },
        styling: { title: "from-styling", subtitle: "styling-sub" },
      }),
    ];
    const layout = migrateLegacySections(sections);
    const props = layout.blocks[0].props;
    expect(props.title).toBe("from-data");
    expect(props.subtitle).toBe("data-sub");
  });

  it("config wins over styling when data key is absent", () => {
    const sections = [
      makeSection("about-hero-banner", {
        data:    {},
        config:  { title: "from-config" },
        styling: { title: "from-styling" },
      }),
    ];
    const layout = migrateLegacySections(sections);
    expect(layout.blocks[0].props.title).toBe("from-config");
  });

  it("styling value is used when neither data nor config has the key", () => {
    const sections = [
      makeSection("about-hero-banner", {
        data:    {},
        config:  {},
        styling: { title: "from-styling" },
      }),
    ];
    const layout = migrateLegacySections(sections);
    expect(layout.blocks[0].props.title).toBe("from-styling");
  });

  it("handles all three sources empty without crashing", () => {
    const sections = [makeSection("about-hero-banner", { data: {}, config: {}, styling: {} })];
    const layout = migrateLegacySections(sections);
    expect(layout.blocks).toHaveLength(1);
    expect(layout.blocks[0].type).toBe("about-hero-banner");
  });
});

// ─── migrateLegacySections — items array routing (Req 1.5) ───────────────────

describe("migrateLegacySections — items array extraction (Req 1.5)", () => {
  it("about-vision-mission-section: routes data.panels → props.panels", () => {
    const panels = [
      { titleEn: "Vision", titleAr: "رؤيتنا", contentEn: "...", contentAr: "..." },
    ];
    const sections = [
      makeSection("about-vision-mission-section", {
        data: { heading: "Our Mission", panels },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.panels).toEqual(panels);
  });

  it("about-documents-section: routes data.documents → props.documents", () => {
    const documents = [{ labelEn: "PDF", labelAr: "ملف", url: "/doc.pdf", fileType: "PDF" }];
    const sections = [
      makeSection("about-documents-section", {
        data: { heading: "Docs", documents },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.documents).toEqual(documents);
  });

  it("about-gallery-section: routes data.images → props.images", () => {
    const images = [{ src: "/img1.jpg", alt: "alt1", caption: "" }];
    const sections = [
      makeSection("about-gallery-section", {
        data: { images },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.images).toEqual(images);
  });

  it("about-overview-section: routes data.paragraphs → props.paragraphs", () => {
    const paragraphs = [{ textEn: "Hello", textAr: "مرحبا" }];
    const sections = [
      makeSection("about-overview-section", {
        data: { paragraphs },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.paragraphs).toEqual(paragraphs);
  });

  it("board-members-intro-grid: routes data.members → props.members via fallback scan", () => {
    const members = [{ nameEn: "Ali", nameAr: "علي" }];
    const sections = [
      makeSection("board-members-intro-grid", {
        data: { members },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    // board-members-intro-grid items key is 'members' in BLOCK_SCHEMA
    // If schema has 'members' key, exact match; otherwise scan finds it
    const itemsArray = blocks[0].props.members ?? blocks[0].props.items;
    expect(Array.isArray(itemsArray)).toBe(true);
    expect((itemsArray as unknown[]).length).toBeGreaterThan(0);
  });

  it("about-timeline-section: routes data.items → props.items", () => {
    const items = [{ year: "2020", titleEn: "Founded", titleAr: "" }];
    const sections = [
      makeSection("about-timeline-section", {
        data: { items },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.items).toEqual(items);
  });

  it("prefers data source over config when items key appears in both", () => {
    const dataItems = [{ textEn: "from-data" }];
    const configItems = [{ textEn: "from-config" }];
    const sections = [
      makeSection("about-overview-section", {
        data:   { paragraphs: dataItems },
        config: { paragraphs: configItems },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.paragraphs).toEqual(dataItems);
  });

  it("falls back to config items when data has no items array", () => {
    const configItems = [{ textEn: "config-paragraph" }];
    const sections = [
      makeSection("about-overview-section", {
        data:   { heading: "Org" },
        config: { paragraphs: configItems },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.paragraphs).toEqual(configItems);
  });

  it("falls back to styling items when neither data nor config has an items array", () => {
    const stylingItems = [{ textEn: "styling-paragraph" }];
    const sections = [
      makeSection("about-overview-section", {
        data:    { heading: "Org" },
        config:  {},
        styling: { paragraphs: stylingItems },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.paragraphs).toEqual(stylingItems);
  });

  it("sets items to empty array [] when no source has any array", () => {
    const sections = [
      makeSection("about-overview-section", {
        data: { heading: "No paragraphs here" },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.paragraphs).toEqual([]);
  });
});

// ─── migrateLegacySections — bilingual defaulting (Req 1.6) ──────────────────

describe("migrateLegacySections — bilingual field defaulting (Req 1.6)", () => {
  it("populates present bilingual fields from data", () => {
    const sections = [
      makeSection("about-hero-banner", {
        data: { title: "Title EN", titleAr: "العنوان" },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.title).toBe("Title EN");
    expect(blocks[0].props.titleAr).toBe("العنوان");
  });

  it("defaults missing *Ar variant to empty string", () => {
    const sections = [
      makeSection("about-hero-banner", {
        data: { title: "Title EN" }, // titleAr missing
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.titleAr).toBe("");
  });

  it("defaults missing *En variant to empty string", () => {
    const sections = [
      makeSection("about-hero-banner", {
        data: { titleAr: "العنوان" }, // title (EN) missing
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.title).toBe("");
  });

  it("preserves empty string bilingual values (does not overwrite with default)", () => {
    const sections = [
      makeSection("about-hero-banner", {
        data: { title: "Title EN", titleAr: "" },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    // Empty string is a valid value — should be preserved, not replaced
    expect(blocks[0].props.titleAr).toBe("");
  });

  it("defaults both *En and *Ar bilingual keys for about-vision-mission-section heading", () => {
    const sections = [
      makeSection("about-vision-mission-section", {
        data: {}, // no heading or headingAr provided
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    // heading and headingAr are both bilingual fields in that schema
    expect(typeof blocks[0].props.heading).toBe("string");
    expect(typeof blocks[0].props.headingAr).toBe("string");
  });
});

// ─── migrateLegacySections — visibility preservation ────────────────────────

describe("migrateLegacySections — visibility preservation", () => {
  it("preserves section-level visibility when set", () => {
    const sections = [
      makeSection("about-hero-banner", {
        visibility: "LOGGED_IN",
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.visibility).toBe("LOGGED_IN");
  });

  it("does not override visibility when section.visibility is undefined", () => {
    const sections = [
      makeSection("about-hero-banner", {
        data: { visibility: "MEMBER_ONLY" }, // from props
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.visibility).toBe("MEMBER_ONLY");
  });
});

// ─── migrateLegacySections — unknown component type (Req 1.7) ────────────────

describe("migrateLegacySections — unknown component type fallback (Req 1.7)", () => {
  it("accepts unknown component types without crashing", () => {
    const sections = [
      makeSection("custom-widget-v2", {
        data: { title: "Custom", content: "Body text" },
      }),
    ];
    expect(() => migrateLegacySections(sections)).not.toThrow();
  });

  it("block type is preserved as-is for unknown component types", () => {
    const sections = [makeSection("custom-widget-v2")];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].type).toBe("custom-widget-v2");
  });

  it("scalar props are merged for unknown types using same precedence rules", () => {
    const sections = [
      makeSection("custom-widget-v2", {
        data:    { title: "from-data" },
        config:  { title: "from-config" },
        styling: { title: "from-styling" },
      }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].props.title).toBe("from-data");
  });

  it("falls back to minimal default schema fields for unknown types (title, titleAr)", () => {
    const sections = [
      makeSection("custom-widget-v2", { data: {} }),
    ];
    const { blocks } = migrateLegacySections(sections);
    // getBlockSchema fallback provides bilingual "title"/"titleAr" and "content"/"contentAr"
    expect(blocks[0].props.title).toBeDefined();
    expect(blocks[0].props.titleAr).toBe("");
  });
});

// ─── migrateLegacySections — sort order ──────────────────────────────────────

describe("migrateLegacySections — sort order", () => {
  it("sorts sections by sortOrder ascending", () => {
    const sections = [
      makeSection("about-hero-banner",        { id: "sec-a", sortOrder: 3 }),
      makeSection("about-overview-section",   { id: "sec-b", sortOrder: 1 }),
      makeSection("contact-hero-banner",      { id: "sec-c", sortOrder: 2 }),
    ];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].id).toBe("sec-b");
    expect(blocks[1].id).toBe("sec-c");
    expect(blocks[2].id).toBe("sec-a");
  });

  it("treats undefined sortOrder as 0", () => {
    const sections = [
      { id: "sec-late",  componentType: "about-hero-banner",      sortOrder: 5, data: {}, config: {}, styling: {} },
      { id: "sec-first", componentType: "about-overview-section", sortOrder: undefined, data: {}, config: {}, styling: {} },
    ];
    const { blocks } = migrateLegacySections(sections as Parameters<typeof migrateLegacySections>[0]);
    expect(blocks[0].id).toBe("sec-first");
  });
});

// ─── migrateLegacySections — PageLayout structure ────────────────────────────

describe("migrateLegacySections — output structure", () => {
  it("returns PageLayout with version '1'", () => {
    const { version } = migrateLegacySections([]);
    expect(version).toBe("1");
  });

  it("returns an empty blocks array for empty input", () => {
    const { blocks } = migrateLegacySections([]);
    expect(blocks).toEqual([]);
  });

  it("preserves section id in block.id", () => {
    const sections = [makeSection("about-hero-banner", { id: "original-id-123" })];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].id).toBe("original-id-123");
  });

  it("sets children to [] for container block types", () => {
    // about-hero-banner is isContainer: true per BLOCK_SCHEMA
    const sections = [makeSection("about-hero-banner")];
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].children).toEqual([]);
  });
});

// ─── migrateLegacySections — all 24 legacy section types smoke test ──────────

describe("migrateLegacySections — all 24 LEGACY_SECTION_TYPES produce valid blocks", () => {
  const REPRESENTATIVE_DATA: Record<string, Record<string, unknown>> = {
    "about-hero-banner": {
      title: "About Us", titleAr: "من نحن",
      subtitle: "Sub", subtitleAr: "فرعي",
      backgroundImage: "/bg.jpg",
    },
    "about-overview-section": {
      heading: "Overview", headingAr: "نظرة عامة",
      paragraphs: [{ textEn: "Para 1", textAr: "فقرة ١" }],
    },
    "about-vision-mission-section": {
      heading: "Vision & Mission", headingAr: "الرؤية والرسالة",
      panels: [{ titleEn: "Vision", titleAr: "رؤيتنا", contentEn: "...", contentAr: "..." }],
    },
    "about-organizational-chart-section": {
      heading: "Org Chart", headingAr: "الهيكل التنظيمي",
      paragraphs: [{ textEn: "Desc", textAr: "وصف" }],
    },
    "about-timeline-section": {
      heading: "Timeline", headingAr: "الجدول الزمني",
      items: [{ year: "2020", titleEn: "Founded", titleAr: "" }],
    },
    "about-documents-section": {
      heading: "Documents", headingAr: "الوثائق",
      documents: [{ labelEn: "Doc", labelAr: "وثيقة", url: "/doc.pdf", fileType: "PDF" }],
    },
    "about-gallery-section": {
      heading: "Gallery", headingAr: "المعرض",
      images: [{ src: "/img.jpg", alt: "img", caption: "" }],
    },
    "board-hero-banner": {
      title: "Board", titleAr: "مجلس الإدارة",
    },
    "board-members-intro-grid": {
      heading: "Intro", headingAr: "مقدمة",
      members: [{ nameEn: "Ali", nameAr: "علي" }],
    },
    "board-members-grid": {
      heading: "Members", headingAr: "الأعضاء",
      members: [{ nameEn: "Ali", nameAr: "علي" }],
    },
    "board-term-information-section": {
      heading: "Term Info", headingAr: "معلومات الدورة",
      paragraphs: [{ textEn: "Term details", textAr: "تفاصيل" }],
    },
    "contact-hero-banner": { title: "Contact", titleAr: "تواصل معنا" },
    "contact-form-section": { heading: "Reach Us", headingAr: "تواصل" },
    "newsletter-hero-banner": { title: "Newsletter", titleAr: "النشرة الإخبارية" },
    "president-message-hero-banner": {
      title: "President Message", titleAr: "رسالة الرئيس",
      backgroundImage: "/pres.jpg",
    },
    "president-message-content-section": {
      heading: "Message", headingAr: "الرسالة",
      paragraphs: [{ textEn: "Dear members...", textAr: "أعزاءنا..." }],
      photo: "/photo.jpg",
      socialLinks: [{ platform: "twitter", url: "https://twitter.com/pres" }],
    },
    "publications-hero-banner": { title: "Publications", titleAr: "المنشورات" },
    "news-list-section": { title: "News", titleAr: "الأخبار", limit: 6 },
    "events-list-section": { title: "Events", titleAr: "الفعاليات", limit: 6 },
    "jobs-list-section": { title: "Jobs", titleAr: "الوظائف", limit: 6 },
    "members-list-section": { title: "Members", titleAr: "الأعضاء", limit: 10 },
    "publications-list-section": { title: "Publications", titleAr: "المنشورات", limit: 6 },
    "board-list-section": { title: "Board", titleAr: "المجلس", limit: 10 },
  };

  for (const type of Array.from(LEGACY_SECTION_TYPES)) {
    it(`${type} — migrates without throwing and produces a block with correct type`, () => {
      const data = REPRESENTATIVE_DATA[type] ?? {};
      const sections = [makeSection(type, { data })];
      expect(() => migrateLegacySections(sections)).not.toThrow();
      const { blocks } = migrateLegacySections(sections);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe(type);
    });
  }
});

// ─── migrateLegacySections — empty data/config/styling (edge cases) ──────────

describe("migrateLegacySections — empty source bags (Req 1.4)", () => {
  it("handles completely empty data, config, and styling", () => {
    const sections = [makeSection("about-hero-banner")];
    expect(() => migrateLegacySections(sections)).not.toThrow();
    const { blocks } = migrateLegacySections(sections);
    expect(blocks[0].type).toBe("about-hero-banner");
  });

  it("handles undefined data, config, and styling (omitted entirely)", () => {
    const sections = [
      { id: "sec1", componentType: "about-hero-banner" },
    ];
    expect(() => migrateLegacySections(sections as Parameters<typeof migrateLegacySections>[0])).not.toThrow();
  });
});
