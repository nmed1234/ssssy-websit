/**
 * section-field-schemas.ts
 *
 * Single source of truth for Section Builder field definitions.
 *
 * SECTION_SCHEMAS maps each componentType → { dataFields, configFields, stylingFields }.
 * Each FieldDef describes one editable property:
 *   - key        — the JSON key name (without En/Ar suffix for bilingual fields)
 *   - type       — rendering hint: text | textarea | url | image | color-class | number | repeater
 *   - bilingual  — true → store as {key}En + {key}Ar, show EN|AR tab switcher
 *   - labelEn/Ar — admin UI labels in both languages
 *   - placeholder / placeholderAr — input hint text
 *   - subFields  — only for repeater type: the fields inside each item row
 *   - itemTitleKey — repeater display name (key without suffix)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "color-class"
  | "number"
  | "repeater";

export interface FieldDef {
  key: string;
  type: FieldType;
  bilingual?: boolean;
  labelEn: string;
  labelAr: string;
  placeholder?: string;
  placeholderAr?: string;
  subFields?: FieldDef[];
  /** For repeater: which sub-field key (without En/Ar) to use as the row label */
  itemTitleKey?: string;
}

export interface SectionSchema {
  dataFields: FieldDef[];
  configFields: FieldDef[];
  stylingFields: FieldDef[];
}

// ---------------------------------------------------------------------------
// Shared color options used by ColorClassPicker
// ---------------------------------------------------------------------------

export interface ColorOption {
  label: string;
  value: string;   // Tailwind class
  preview: string; // CSS color / gradient for the swatch
}

export const BG_COLOR_OPTIONS: ColorOption[] = [
  { label: "Soil Dark",  value: "bg-soil-dark",  preview: "#3E2723" },
  { label: "Soil Clay",  value: "bg-soil-clay",  preview: "#8D6E63" },
  { label: "Soil Sand",  value: "bg-soil-sand",  preview: "#D7CCC8" },
  { label: "Soil Cream", value: "bg-soil-cream", preview: "#EFEBE9" },
  { label: "White",      value: "bg-white",       preview: "#ffffff" },
  { label: "Gray 50",    value: "bg-gray-50",     preview: "#f9fafb" },
  { label: "Gray 100",   value: "bg-gray-100",    preview: "#f3f4f6" },
  { label: "Forest",     value: "bg-forest",      preview: "#2E7D32" },
  { label: "Sky",        value: "bg-sky-50",      preview: "#f0f9ff" },
  {
    label: "Hero Gradient",
    value: "bg-gradient-hero",
    preview:
      "linear-gradient(135deg, #3E2723 0%, #5D4037 50%, #4E342E 100%)",
  },
];

export const TEXT_COLOR_OPTIONS: ColorOption[] = [
  { label: "White",      value: "text-white",      preview: "#ffffff" },
  { label: "Gray 900",   value: "text-gray-900",   preview: "#111827" },
  { label: "Soil Dark",  value: "text-soil-dark",  preview: "#3E2723" },
  { label: "Soil Clay",  value: "text-soil-clay",  preview: "#8D6E63" },
  { label: "Earth Gray", value: "text-earth-gray", preview: "#6B7280" },
  { label: "Forest",     value: "text-forest",     preview: "#2E7D32" },
];

// ---------------------------------------------------------------------------
// Common style fields (reused by multiple schemas)
// ---------------------------------------------------------------------------

const COMMON_STYLING_FIELDS: FieldDef[] = [
  {
    key: "bgColor",
    type: "color-class",
    labelEn: "Background Color",
    labelAr: "لون الخلفية",
  },
  {
    key: "textColor",
    type: "color-class",
    labelEn: "Text Color",
    labelAr: "لون النص",
  },
  {
    key: "paddingClass",
    type: "text",
    labelEn: "Padding Class",
    labelAr: "فئة المحاذاة الداخلية",
    placeholder: "py-16 md:py-20",
  },
];

// ---------------------------------------------------------------------------
// Per-component schemas
// ---------------------------------------------------------------------------

// hero ──────────────────────────────────────────────────────────────────────
const HERO_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Heading",
      labelAr: "العنوان الرئيسي",
      placeholder: "Advancing Soil Science in Syria",
      placeholderAr: "تطوير علوم التربة في سوريا",
    },
    {
      key: "subtitleAr",
      type: "text",
      bilingual: false,
      labelEn: "Arabic Subtitle (above heading)",
      labelAr: "العنوان الفرعي العربي (فوق العنوان)",
      placeholder: "جمعية علوم التربة السورية",
    },
    {
      key: "description",
      type: "textarea",
      bilingual: true,
      labelEn: "Description",
      labelAr: "الوصف",
      placeholder: "Advancing soil science research, education, and sustainable land management…",
      placeholderAr: "تعزيز أبحاث علوم التربة والتعليم والإدارة المستدامة للأراضي في سوريا",
    },
    {
      key: "primaryButtonLabel",
      type: "text",
      bilingual: true,
      labelEn: "Primary Button Label",
      labelAr: "نص الزر الرئيسي",
      placeholder: "Join Us",
      placeholderAr: "انضم إلينا",
    },
    {
      key: "primaryButtonUrl",
      type: "url",
      labelEn: "Primary Button URL",
      labelAr: "رابط الزر الرئيسي",
      placeholder: "/members",
    },
    {
      key: "secondaryButtonLabel",
      type: "text",
      bilingual: true,
      labelEn: "Secondary Button Label",
      labelAr: "نص الزر الثانوي",
      placeholder: "Learn More",
      placeholderAr: "اعرف المزيد",
    },
    {
      key: "secondaryButtonUrl",
      type: "url",
      labelEn: "Secondary Button URL",
      labelAr: "رابط الزر الثانوي",
      placeholder: "/about",
    },
    {
      key: "backgroundImage",
      type: "image",
      labelEn: "Background Image",
      labelAr: "صورة الخلفية",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// cta (join-our-community) ──────────────────────────────────────────────────
const CTA_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Heading",
      labelAr: "العنوان",
      placeholder: "Join Our Community",
      placeholderAr: "انضم إلى مجتمعنا",
    },
    {
      key: "subtitle",
      type: "textarea",
      bilingual: true,
      labelEn: "Subtitle",
      labelAr: "العنوان الفرعي",
      placeholder: "Become a member and contribute to the future of soil science…",
      placeholderAr: "كن عضواً وساهم في مستقبل علوم التربة…",
    },
    {
      key: "buttonLabel",
      type: "text",
      bilingual: true,
      labelEn: "Button Label",
      labelAr: "نص الزر",
      placeholder: "Become a Member",
      placeholderAr: "كن عضواً",
    },
    {
      key: "buttonUrl",
      type: "url",
      labelEn: "Button URL",
      labelAr: "رابط الزر",
      placeholder: "/members",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// card-group ────────────────────────────────────────────────────────────────
const CARD_GROUP_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Cards",
      labelAr: "البطاقات",
      itemTitleKey: "title",
      subFields: [
        {
          key: "title",
          type: "text",
          bilingual: true,
          labelEn: "Card Title",
          labelAr: "عنوان البطاقة",
          placeholder: "Research",
          placeholderAr: "البحث العلمي",
        },
        {
          key: "description",
          type: "textarea",
          bilingual: true,
          labelEn: "Card Description",
          labelAr: "وصف البطاقة",
          placeholder: "Advancing soil science through cutting-edge research…",
          placeholderAr: "تعزيز علوم التربة من خلال الأبحاث المتطورة…",
        },
        {
          key: "icon",
          type: "text",
          bilingual: false,
          labelEn: "Icon (Lucide name, optional)",
          labelAr: "أيقونة (اختياري)",
          placeholder: "BookOpen",
        },
        {
          key: "link",
          type: "url",
          labelEn: "Card Link (optional)",
          labelAr: "رابط البطاقة (اختياري)",
          placeholder: "/about",
        },
      ],
    },
  ],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Section Heading",
      labelAr: "عنوان القسم",
      placeholder: "Our Focus Areas",
      placeholderAr: "مجالات اهتمامنا",
    },
    {
      key: "columns",
      type: "number",
      labelEn: "Columns",
      labelAr: "عدد الأعمدة",
      placeholder: "3",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// stats ─────────────────────────────────────────────────────────────────────
const STATS_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Statistics",
      labelAr: "الإحصائيات",
      itemTitleKey: "title",
      subFields: [
        {
          key: "value",
          type: "text",
          bilingual: false,
          labelEn: "Value (e.g. 500+)",
          labelAr: "القيمة (مثل: ٥٠٠+)",
          placeholder: "500+",
        },
        {
          key: "title",
          type: "text",
          bilingual: true,
          labelEn: "Label",
          labelAr: "التسمية",
          placeholder: "Members",
          placeholderAr: "الأعضاء",
        },
      ],
    },
  ],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Section Heading",
      labelAr: "عنوان القسم",
      placeholder: "SSSS by the Numbers",
      placeholderAr: "الجمعية بالأرقام",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// testimonial ───────────────────────────────────────────────────────────────
const TESTIMONIAL_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Testimonials",
      labelAr: "الشهادات",
      itemTitleKey: "name",
      subFields: [
        {
          key: "name",
          type: "text",
          bilingual: true,
          labelEn: "Name",
          labelAr: "الاسم",
          placeholder: "Dr. Ahmad Hassan",
          placeholderAr: "د. أحمد حسان",
        },
        {
          key: "role",
          type: "text",
          bilingual: true,
          labelEn: "Role / Title",
          labelAr: "المنصب / اللقب",
          placeholder: "Professor of Soil Science",
          placeholderAr: "أستاذ علوم التربة",
        },
        {
          key: "quote",
          type: "textarea",
          bilingual: true,
          labelEn: "Quote",
          labelAr: "الاقتباس",
          placeholder: "The society has been instrumental in…",
          placeholderAr: "أسهمت الجمعية بشكل فعال في…",
        },
        {
          key: "avatar",
          type: "image",
          labelEn: "Avatar Image",
          labelAr: "صورة الشخصية",
        },
      ],
    },
  ],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Section Heading",
      labelAr: "عنوان القسم",
      placeholder: "What Our Members Say",
      placeholderAr: "ماذا يقول أعضاؤنا",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// newsletter ────────────────────────────────────────────────────────────────
const NEWSLETTER_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Heading",
      labelAr: "العنوان",
      placeholder: "Stay Connected",
      placeholderAr: "ابق على اطلاع",
    },
    {
      key: "subtitle",
      type: "textarea",
      bilingual: true,
      labelEn: "Subtitle",
      labelAr: "العنوان الفرعي",
      placeholder: "Subscribe to our newsletter…",
      placeholderAr: "اشترك في نشرتنا الإخبارية…",
    },
    {
      key: "buttonLabel",
      type: "text",
      bilingual: true,
      labelEn: "Button Label",
      labelAr: "نص الزر",
      placeholder: "Subscribe",
      placeholderAr: "اشترك",
    },
    {
      key: "placeholderText",
      type: "text",
      bilingual: true,
      labelEn: "Input Placeholder",
      labelAr: "نص حقل الإدخال",
      placeholder: "Enter your email address",
      placeholderAr: "أدخل بريدك الإلكتروني",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// contact-form ──────────────────────────────────────────────────────────────
const CONTACT_FORM_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Heading",
      labelAr: "العنوان",
      placeholder: "Get In Touch",
      placeholderAr: "تواصل معنا",
    },
    {
      key: "submitLabel",
      type: "text",
      bilingual: true,
      labelEn: "Submit Button Label",
      labelAr: "نص زر الإرسال",
      placeholder: "Send Message",
      placeholderAr: "إرسال الرسالة",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// banner ────────────────────────────────────────────────────────────────────
const BANNER_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Banner Title",
      labelAr: "عنوان البانر",
      placeholder: "Important Announcement",
      placeholderAr: "إعلان هام",
    },
    {
      key: "body",
      type: "textarea",
      bilingual: true,
      labelEn: "Banner Body",
      labelAr: "نص البانر",
      placeholder: "Banner content…",
      placeholderAr: "محتوى البانر…",
    },
    {
      key: "buttonLabel",
      type: "text",
      bilingual: true,
      labelEn: "Button Label",
      labelAr: "نص الزر",
      placeholder: "Learn More",
      placeholderAr: "اعرف المزيد",
    },
    {
      key: "buttonUrl",
      type: "url",
      labelEn: "Button URL",
      labelAr: "رابط الزر",
      placeholder: "/announcements",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// faq ───────────────────────────────────────────────────────────────────────
const FAQ_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "FAQ Items",
      labelAr: "الأسئلة الشائعة",
      itemTitleKey: "question",
      subFields: [
        {
          key: "question",
          type: "text",
          bilingual: true,
          labelEn: "Question",
          labelAr: "السؤال",
          placeholder: "How do I become a member?",
          placeholderAr: "كيف أصبح عضواً؟",
        },
        {
          key: "answer",
          type: "textarea",
          bilingual: true,
          labelEn: "Answer",
          labelAr: "الإجابة",
          placeholder: "You can become a member by…",
          placeholderAr: "يمكنك أن تصبح عضواً بـ…",
        },
      ],
    },
  ],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Section Heading",
      labelAr: "عنوان القسم",
      placeholder: "Frequently Asked Questions",
      placeholderAr: "الأسئلة الشائعة",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// team ──────────────────────────────────────────────────────────────────────
const TEAM_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Team Members",
      labelAr: "أعضاء الفريق",
      itemTitleKey: "name",
      subFields: [
        {
          key: "name",
          type: "text",
          bilingual: true,
          labelEn: "Name",
          labelAr: "الاسم",
          placeholder: "Dr. Ahmad Hassan",
          placeholderAr: "د. أحمد حسان",
        },
        {
          key: "role",
          type: "text",
          bilingual: true,
          labelEn: "Role",
          labelAr: "المنصب",
          placeholder: "President",
          placeholderAr: "الرئيس",
        },
        {
          key: "bio",
          type: "textarea",
          bilingual: true,
          labelEn: "Bio",
          labelAr: "نبذة",
          placeholder: "Brief bio…",
          placeholderAr: "نبذة مختصرة…",
        },
        {
          key: "photo",
          type: "image",
          labelEn: "Photo",
          labelAr: "الصورة",
        },
      ],
    },
  ],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Section Heading",
      labelAr: "عنوان القسم",
      placeholder: "Our Team",
      placeholderAr: "فريقنا",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// timeline ──────────────────────────────────────────────────────────────────
const TIMELINE_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Timeline Events",
      labelAr: "أحداث الجدول الزمني",
      itemTitleKey: "title",
      subFields: [
        {
          key: "year",
          type: "text",
          bilingual: false,
          labelEn: "Year / Date",
          labelAr: "السنة / التاريخ",
          placeholder: "2010",
        },
        {
          key: "title",
          type: "text",
          bilingual: true,
          labelEn: "Event Title",
          labelAr: "عنوان الحدث",
          placeholder: "Society Founded",
          placeholderAr: "تأسيس الجمعية",
        },
        {
          key: "description",
          type: "textarea",
          bilingual: true,
          labelEn: "Description",
          labelAr: "الوصف",
          placeholder: "Brief description of the milestone…",
          placeholderAr: "وصف مختصر للحدث…",
        },
      ],
    },
  ],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Section Heading",
      labelAr: "عنوان القسم",
      placeholder: "Our History",
      placeholderAr: "تاريخنا",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// Generic fallback ──────────────────────────────────────────────────────────
const GENERIC_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Title",
      labelAr: "العنوان",
      placeholder: "Section title…",
    },
    {
      key: "subtitle",
      type: "textarea",
      bilingual: true,
      labelEn: "Subtitle / Body",
      labelAr: "العنوان الفرعي / المحتوى",
      placeholder: "Section body…",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// hero-carousel ─────────────────────────────────────────────────────────────
const HERO_CAROUSEL_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "slides",
      type: "repeater",
      labelEn: "Slides",
      labelAr: "الشرائح",
      itemTitleKey: "title",
      subFields: [
        { key: "title",               type: "text",     bilingual: true,  labelEn: "Slide Heading",           labelAr: "عنوان الشريحة",           placeholder: "Advancing Soil Science in Syria",   placeholderAr: "تطوير علوم التربة في سوريا" },
        { key: "subtitleAr",          type: "text",     bilingual: false, labelEn: "Arabic Subtitle",         labelAr: "العنوان الفرعي العربي",   placeholder: "جمعية علوم التربة السورية" },
        { key: "description",         type: "textarea", bilingual: true,  labelEn: "Description",             labelAr: "الوصف",                   placeholder: "Advancing soil science research…",  placeholderAr: "تعزيز أبحاث علوم التربة…" },
        { key: "primaryButtonLabel",  type: "text",     bilingual: true,  labelEn: "Primary Button Label",    labelAr: "نص الزر الرئيسي",         placeholder: "Join Us",                           placeholderAr: "انضم إلينا" },
        { key: "primaryButtonUrl",    type: "url",      bilingual: false, labelEn: "Primary Button URL",      labelAr: "رابط الزر الرئيسي",       placeholder: "/members" },
        { key: "secondaryButtonLabel",type: "text",     bilingual: true,  labelEn: "Secondary Button Label",  labelAr: "نص الزر الثانوي",         placeholder: "Learn More",                        placeholderAr: "اعرف المزيد" },
        { key: "secondaryButtonUrl",  type: "url",      bilingual: false, labelEn: "Secondary Button URL",    labelAr: "رابط الزر الثانوي",       placeholder: "/about" },
        { key: "backgroundImage",     type: "image",    bilingual: false, labelEn: "Background Image URL",    labelAr: "رابط صورة الخلفية" },
      ],
    },
  ],
  configFields: [
    {
      key: "transitionStyle",
      type: "text",
      labelEn: "Transition Style (slide / fade / ken-burns)",
      labelAr: "نمط الانتقال (slide / fade / ken-burns)",
      placeholder: "slide",
    },
    {
      key: "autoplay",
      type: "text",
      labelEn: "Autoplay (true / false)",
      labelAr: "تشغيل تلقائي (true / false)",
      placeholder: "true",
    },
    {
      key: "autoplayInterval",
      type: "number",
      labelEn: "Autoplay Interval (ms)",
      labelAr: "مدة الشريحة (مللي ثانية)",
      placeholder: "5000",
    },
    {
      key: "showArrows",
      type: "text",
      labelEn: "Show Arrows (true / false)",
      labelAr: "إظهار الأسهم (true / false)",
      placeholder: "true",
    },
    {
      key: "showDots",
      type: "text",
      labelEn: "Show Dots (true / false)",
      labelAr: "إظهار النقاط (true / false)",
      placeholder: "true",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// publications-carousel ─────────────────────────────────────────────────────
const PUBLICATIONS_CAROUSEL_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    {
      key: "title",
      type: "text",
      bilingual: true,
      labelEn: "Section Heading",
      labelAr: "عنوان القسم",
      placeholder: "Publications",
      placeholderAr: "المنشورات",
    },
    {
      key: "viewMoreLabel",
      type: "text",
      bilingual: true,
      labelEn: "\"View All\" Link Text",
      labelAr: "نص رابط \"عرض الكل\"",
      placeholder: "View All Publications",
      placeholderAr: "جميع المنشورات",
    },
    {
      key: "viewMoreUrl",
      type: "url",
      labelEn: "\"View All\" Link URL",
      labelAr: "رابط عرض الكل",
      placeholder: "/publications",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  hero:                     HERO_SCHEMA,
  "hero-banner":            HERO_SCHEMA,
  "hero-carousel":          HERO_CAROUSEL_SCHEMA,
  "publications-carousel":  PUBLICATIONS_CAROUSEL_SCHEMA,
  cta:                      CTA_SCHEMA,
  "card-group":    CARD_GROUP_SCHEMA,
  stats:           STATS_SCHEMA,
  counter:         STATS_SCHEMA,
  testimonial:     TESTIMONIAL_SCHEMA,
  testimonials:    TESTIMONIAL_SCHEMA,
  newsletter:      NEWSLETTER_SCHEMA,
  "newsletter-signup": NEWSLETTER_SCHEMA,
  "contact-form":  CONTACT_FORM_SCHEMA,
  banner:          BANNER_SCHEMA,
  faq:             FAQ_SCHEMA,
  team:            TEAM_SCHEMA,
  timeline:        TIMELINE_SCHEMA,
};

/** Returns the schema for a given componentType, falling back to the generic schema. */
export function getSchema(componentType: string): SectionSchema {
  return SECTION_SCHEMAS[componentType] ?? GENERIC_SCHEMA;
}
