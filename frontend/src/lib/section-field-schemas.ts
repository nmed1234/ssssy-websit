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
// footer-layout ─────────────────────────────────────────────────────────────
// The footer reads from SiteSettingsContext and ContentStrings at runtime.
// This schema exposes those same values as editable fields stored in `config`.
// FooterLayout reads config keys first, falling back to context/defaults.
const FOOTER_LAYOUT_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    // ── Brand ───────────────────────────────────────────────────────────────
    {
      key: "siteName",
      type: "text",
      bilingual: true,
      labelEn: "Site Name",
      labelAr: "اسم الموقع",
      placeholder: "Soil Science Society of Syria (SSSS)",
      placeholderAr: "جمعية علوم التربة السورية (SSSS)",
    },
    {
      key: "siteDescription",
      type: "textarea",
      bilingual: true,
      labelEn: "Site Description",
      labelAr: "وصف الموقع",
      placeholder: "The Soil Science Society of Syria (SSSS) is dedicated to advancing soil science…",
      placeholderAr: "جمعية علوم التربة السورية (SSSS) مكرسة لتطوير أبحاث علوم التربة…",
    },
    // ── Contact info ─────────────────────────────────────────────────────────
    {
      key: "contactAddress",
      type: "text",
      bilingual: false,
      labelEn: "Address",
      labelAr: "العنوان",
      placeholder: "Damascus, Syria",
    },
    {
      key: "contactEmail",
      type: "text",
      bilingual: false,
      labelEn: "Email",
      labelAr: "البريد الإلكتروني",
      placeholder: "info@ssssy.org",
    },
    {
      key: "contactPhone",
      type: "text",
      bilingual: false,
      labelEn: "Phone",
      labelAr: "الهاتف",
      placeholder: "+963 11 234 5678",
    },
    // ── Social links ─────────────────────────────────────────────────────────
    {
      key: "facebookUrl",
      type: "url",
      labelEn: "Facebook URL",
      labelAr: "رابط فيسبوك",
      placeholder: "https://facebook.com/ssssy",
    },
    {
      key: "twitterUrl",
      type: "url",
      labelEn: "Twitter/X URL",
      labelAr: "رابط تويتر/X",
      placeholder: "https://twitter.com/ssssy",
    },
    {
      key: "linkedinUrl",
      type: "url",
      labelEn: "LinkedIn URL",
      labelAr: "رابط لينكدإن",
      placeholder: "https://linkedin.com/company/ssssy",
    },
    {
      key: "youtubeUrl",
      type: "url",
      labelEn: "YouTube URL",
      labelAr: "رابط يوتيوب",
      placeholder: "https://youtube.com/@ssssy",
    },
    // ── Quick-links heading ───────────────────────────────────────────────────
    {
      key: "quickLinksHeading",
      type: "text",
      bilingual: true,
      labelEn: "Quick Links Heading",
      labelAr: "عنوان الروابط السريعة",
      placeholder: "Quick Links",
      placeholderAr: "روابط سريعة",
    },
    // ── Contact-info column heading ───────────────────────────────────────────
    {
      key: "contactInfoHeading",
      type: "text",
      bilingual: true,
      labelEn: "Contact Info Heading",
      labelAr: "عنوان معلومات التواصل",
      placeholder: "Contact Info",
      placeholderAr: "معلومات التواصل",
    },
    // ── About column heading ─────────────────────────────────────────────────
    {
      key: "aboutHeading",
      type: "text",
      bilingual: true,
      labelEn: "About Column Heading",
      labelAr: "عنوان عمود عن الموقع",
      placeholder: "About SSSS",
      placeholderAr: "عن الجمعية",
    },
    // ── Copyright ────────────────────────────────────────────────────────────
    {
      key: "copyright",
      type: "text",
      bilingual: true,
      labelEn: "Copyright Text",
      labelAr: "نص حقوق النشر",
      placeholder: "Soil Science Society of Syria (SSSS). All rights reserved.",
      placeholderAr: "جمعية علوم التربة السورية (SSSS). جميع الحقوق محفوظة.",
    },
  ],
  stylingFields: [],
};

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

// upcoming-events-feed ───────────────────────────────────────────────────────
const UPCOMING_EVENTS_FEED_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Event Items (manual mode)",
      labelAr: "عناصر الفعاليات (وضع يدوي)",
      itemTitleKey: "title",
      subFields: [
        {
          key: "title",
          type: "text",
          bilingual: true,
          labelEn: "Event Title",
          labelAr: "عنوان الفعالية",
          placeholder: "Event name",
          placeholderAr: "اسم الفعالية",
        },
        {
          key: "description",
          type: "textarea",
          bilingual: false,
          labelEn: "Description",
          labelAr: "الوصف",
          placeholder: "Short event description…",
        },
        {
          key: "eventDate",
          type: "text",
          bilingual: false,
          labelEn: "Event Date (YYYY-MM-DD)",
          labelAr: "تاريخ الفعالية (YYYY-MM-DD)",
          placeholder: "2025-06-15",
        },
        {
          key: "location",
          type: "text",
          bilingual: false,
          labelEn: "Location",
          labelAr: "الموقع",
          placeholder: "Damascus, Syria",
          placeholderAr: "دمشق، سوريا",
        },
        {
          key: "eventType",
          type: "text",
          bilingual: false,
          labelEn: "Event Type",
          labelAr: "نوع الفعالية",
          placeholder: "Conference / Workshop…",
          placeholderAr: "مؤتمر / ورشة عمل…",
        },
        {
          key: "featuredImage",
          type: "image",
          bilingual: false,
          labelEn: "Featured Image",
          labelAr: "الصورة البارزة",
          placeholder: "https://… or pick from library",
        },
        {
          key: "slug",
          type: "text",
          bilingual: false,
          labelEn: "Link Slug (e.g. my-event)",
          labelAr: "الرابط المختصر",
          placeholder: "my-event-slug",
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
      placeholder: "Upcoming Events",
      placeholderAr: "الفعاليات القادمة",
    },
    {
      key: "count",
      type: "number",
      labelEn: "Number of Events to Show",
      labelAr: "عدد الفعاليات المعروضة",
      placeholder: "3",
    },
    {
      key: "viewAllLabel",
      type: "text",
      bilingual: true,
      labelEn: "\"View All\" Link Text",
      labelAr: "نص رابط \"عرض الكل\"",
      placeholder: "View All Events",
      placeholderAr: "جميع الفعاليات",
    },
    {
      key: "viewAllUrl",
      type: "url",
      labelEn: "\"View All\" Link URL",
      labelAr: "رابط عرض الكل",
      placeholder: "/events",
    },
    {
      key: "dataSource",
      type: "text",
      labelEn: "Data Source (api | manual)",
      labelAr: "مصدر البيانات (api | manual)",
      placeholder: "api",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// latest-news-feed ───────────────────────────────────────────────────────────
const LATEST_NEWS_FEED_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "News Items (manual mode)",
      labelAr: "عناصر الأخبار (وضع يدوي)",
      itemTitleKey: "title",
      subFields: [
        {
          key: "title",
          type: "text",
          bilingual: true,
          labelEn: "Article Title",
          labelAr: "عنوان المقال",
          placeholder: "Article title",
          placeholderAr: "عنوان المقال",
        },
        {
          key: "excerpt",
          type: "textarea",
          bilingual: false,
          labelEn: "Excerpt / Summary",
          labelAr: "الملخص",
          placeholder: "Short summary of the article…",
        },
        {
          key: "publishedAt",
          type: "text",
          bilingual: false,
          labelEn: "Published Date (YYYY-MM-DD)",
          labelAr: "تاريخ النشر (YYYY-MM-DD)",
          placeholder: "2025-06-15",
        },
        {
          key: "featuredImage",
          type: "image",
          bilingual: false,
          labelEn: "Featured Image",
          labelAr: "الصورة البارزة",
          placeholder: "https://… or pick from library",
        },
        {
          key: "slug",
          type: "text",
          bilingual: false,
          labelEn: "Link Slug (e.g. my-article)",
          labelAr: "الرابط المختصر",
          placeholder: "my-article-slug",
        },
        {
          key: "category",
          type: "text",
          bilingual: false,
          labelEn: "Category",
          labelAr: "التصنيف",
          placeholder: "Research / News…",
          placeholderAr: "بحث / أخبار…",
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
      placeholder: "Latest News",
      placeholderAr: "أحدث الأخبار",
    },
    {
      key: "count",
      type: "number",
      labelEn: "Number of Articles to Show",
      labelAr: "عدد المقالات المعروضة",
      placeholder: "3",
    },
    {
      key: "viewAllLabel",
      type: "text",
      bilingual: true,
      labelEn: "\"View All\" Link Text",
      labelAr: "نص رابط \"عرض الكل\"",
      placeholder: "View All News",
      placeholderAr: "جميع الأخبار",
    },
    {
      key: "viewAllUrl",
      type: "url",
      labelEn: "\"View All\" Link URL",
      labelAr: "رابط عرض الكل",
      placeholder: "/news",
    },
    {
      key: "dataSource",
      type: "text",
      labelEn: "Data Source (api | manual)",
      labelAr: "مصدر البيانات (api | manual)",
      placeholder: "api",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// hero-carousel ─────────────────────────────────────────────────────────────
// NOTE: All carousel data (slides + settings) lives in the `config` JSON column.
//       The `data` column is unused for this section type.
const HERO_CAROUSEL_SCHEMA: SectionSchema = {
  dataFields: [],   // slides live in config, not data
  configFields: [
    // ── Slides repeater (stored as config.slides[]) ─────────────────────────
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
        { key: "backgroundImage",     type: "image",    bilingual: false, labelEn: "Background Image",        labelAr: "صورة الخلفية",            placeholder: "https://… or pick from library" },
      ],
    },
    // ── Carousel behaviour settings ─────────────────────────────────────────
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
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Publication Items",
      labelAr: "عناصر المنشورات",
      itemTitleKey: "title",
      subFields: [
        {
          key: "title",
          type: "text",
          bilingual: true,
          labelEn: "Title",
          labelAr: "العنوان",
          placeholder: "Publication title",
          placeholderAr: "عنوان المنشور",
        },
        {
          key: "description",
          type: "textarea",
          bilingual: true,
          labelEn: "Description / Abstract",
          labelAr: "الوصف / الملخص",
          placeholder: "Short description or abstract…",
          placeholderAr: "وصف مختصر أو ملخص…",
        },
        {
          key: "coverImage",
          type: "image",
          labelEn: "Cover Image (URL or upload)",
          labelAr: "صورة الغلاف (رابط أو رفع)",
        },
        {
          key: "link",
          type: "url",
          labelEn: "Link / PDF URL",
          labelAr: "رابط / رابط PDF",
          placeholder: "https://example.com/paper.pdf",
        },
        {
          key: "authors",
          type: "text",
          labelEn: "Authors",
          labelAr: "المؤلفون",
          placeholder: "Author names",
          placeholderAr: "أسماء المؤلفين",
        },
        {
          key: "year",
          type: "text",
          labelEn: "Year",
          labelAr: "السنة",
          placeholder: "2024",
        },
        {
          key: "category",
          type: "text",
          labelEn: "Category",
          labelAr: "الفئة",
          placeholder: "Research / Journal…",
          placeholderAr: "بحث / مجلة…",
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
    {
      key: "dataSource",
      type: "text",
      labelEn: "Data Source (api | manual)",
      labelAr: "مصدر البيانات (api | manual)",
      placeholder: "api",
    },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// ---------------------------------------------------------------------------
// NEW TEMPLATE SCHEMAS (all 44 new component types)
// ---------------------------------------------------------------------------

// features-grid ─────────────────────────────────────────────────────────────
const FEATURES_GRID_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Feature Items",
      labelAr: "عناصر الميزات",
      itemTitleKey: "title",
      subFields: [
        { key: "icon",        type: "text",     bilingual: false, labelEn: "Icon (emoji or name)", labelAr: "أيقونة", placeholder: "⚡" },
        { key: "title",       type: "text",     bilingual: true,  labelEn: "Title",                labelAr: "العنوان",        placeholder: "Lightning Fast",     placeholderAr: "سريع البرق" },
        { key: "description", type: "textarea", bilingual: true,  labelEn: "Description",          labelAr: "الوصف",          placeholder: "Describe this feature…", placeholderAr: "وصف الميزة…" },
      ],
    },
  ],
  configFields: [
    { key: "title",    type: "text",    bilingual: true, labelEn: "Section Heading",  labelAr: "عنوان القسم",       placeholder: "Everything You Need",       placeholderAr: "كل ما تحتاجه" },
    { key: "subtitle", type: "textarea",bilingual: true, labelEn: "Section Subtitle", labelAr: "العنوان الفرعي",    placeholder: "A complete toolkit…",        placeholderAr: "مجموعة أدوات متكاملة…" },
    { key: "columns",  type: "number",                  labelEn: "Columns (2–4)",     labelAr: "عدد الأعمدة",       placeholder: "3" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// features-alternating ──────────────────────────────────────────────────────
const FEATURES_ALTERNATING_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Feature Rows",
      labelAr: "صفوف الميزات",
      itemTitleKey: "title",
      subFields: [
        { key: "icon",        type: "text",     bilingual: false, labelEn: "Icon (emoji)",    labelAr: "أيقونة",   placeholder: "🎯" },
        { key: "title",       type: "text",     bilingual: true,  labelEn: "Title",           labelAr: "العنوان",  placeholder: "Precision Targeting",    placeholderAr: "استهداف دقيق" },
        { key: "description", type: "textarea", bilingual: true,  labelEn: "Description",     labelAr: "الوصف",    placeholder: "Describe the feature…",  placeholderAr: "وصف الميزة…" },
        { key: "image",       type: "image",    bilingual: false, labelEn: "Feature Image",   labelAr: "صورة الميزة" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "Built for the Way You Work", placeholderAr: "مبني لطريقة عملك" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// feature-highlight ─────────────────────────────────────────────────────────
const FEATURE_HIGHLIGHT_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "bullets",
      type: "repeater",
      labelEn: "Bullet Points",
      labelAr: "النقاط الرئيسية",
      itemTitleKey: "text",
      subFields: [
        { key: "text", type: "text", bilingual: true, labelEn: "Bullet Text", labelAr: "نص النقطة", placeholder: "Key benefit…", placeholderAr: "فائدة رئيسية…" },
      ],
    },
  ],
  configFields: [
    { key: "title",       type: "text",     bilingual: true, labelEn: "Heading",        labelAr: "العنوان",          placeholder: "The Smarter Way to Manage",  placeholderAr: "الطريقة الأذكى للإدارة" },
    { key: "description", type: "textarea", bilingual: true, labelEn: "Description",    labelAr: "الوصف",            placeholder: "Unlock the full potential…",  placeholderAr: "أطلق الإمكانات الكاملة…" },
    { key: "ctaLabel",    type: "text",     bilingual: true, labelEn: "CTA Button Text",labelAr: "نص زر الإجراء",    placeholder: "See All Features",            placeholderAr: "شاهد جميع الميزات" },
    { key: "ctaUrl",      type: "url",                       labelEn: "CTA Button URL", labelAr: "رابط زر الإجراء",  placeholder: "/features" },
    { key: "image",       type: "image",                     labelEn: "Feature Image",  labelAr: "صورة الميزة" },
    { key: "imagePosition", type: "text",                    labelEn: "Image Position (left / right)", labelAr: "موضع الصورة (left / right)", placeholder: "right" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// blog-grid ─────────────────────────────────────────────────────────────────
const BLOG_GRID_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "posts",
      type: "repeater",
      labelEn: "Blog Posts",
      labelAr: "مقالات المدونة",
      itemTitleKey: "title",
      subFields: [
        { key: "title",    type: "text",     bilingual: true,  labelEn: "Post Title",    labelAr: "عنوان المقالة",  placeholder: "Post title…",      placeholderAr: "عنوان المقالة…" },
        { key: "category", type: "text",     bilingual: true,  labelEn: "Category",      labelAr: "التصنيف",        placeholder: "Industry",          placeholderAr: "الصناعة" },
        { key: "date",     type: "text",     bilingual: false, labelEn: "Date (YYYY-MM-DD)", labelAr: "التاريخ",    placeholder: "2025-01-15" },
        { key: "excerpt",  type: "textarea", bilingual: false, labelEn: "Excerpt",        labelAr: "المقتطف",       placeholder: "Short summary…" },
        { key: "image",    type: "image",    bilingual: false, labelEn: "Thumbnail",      labelAr: "الصورة المصغرة" },
        { key: "slug",     type: "url",                        labelEn: "Post URL / Slug",labelAr: "رابط المقالة",  placeholder: "/blog/my-post" },
      ],
    },
  ],
  configFields: [
    { key: "title",        type: "text", bilingual: true, labelEn: "Section Heading",   labelAr: "عنوان القسم",      placeholder: "From Our Blog",          placeholderAr: "من مدونتنا" },
    { key: "viewAllLabel", type: "text", bilingual: true, labelEn: "\"View All\" Text", labelAr: "نص عرض الكل",      placeholder: "View All Posts",         placeholderAr: "عرض جميع المقالات" },
    { key: "viewAllUrl",   type: "url",                   labelEn: "\"View All\" URL",  labelAr: "رابط عرض الكل",   placeholder: "/blog" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// blog-featured ─────────────────────────────────────────────────────────────
const BLOG_FEATURED_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "recent",
      type: "repeater",
      labelEn: "Recent Posts (sidebar)",
      labelAr: "المقالات الأخيرة (الشريط الجانبي)",
      itemTitleKey: "title",
      subFields: [
        { key: "title", type: "text",     bilingual: true,  labelEn: "Title", labelAr: "العنوان", placeholder: "Post title…", placeholderAr: "عنوان المقالة…" },
        { key: "date",  type: "text",     bilingual: false, labelEn: "Date",  labelAr: "التاريخ", placeholder: "2025-01-10" },
        { key: "slug",  type: "url",                        labelEn: "URL",   labelAr: "الرابط",  placeholder: "/blog/my-post" },
      ],
    },
  ],
  configFields: [
    { key: "title",            type: "text",                    labelEn: "Section Heading",           labelAr: "عنوان القسم",         placeholder: "Latest Insights",             placeholderAr: "أحدث الرؤى" },
    { key: "featuredTitle",    type: "text",     bilingual: true, labelEn: "Featured Post Title",     labelAr: "عنوان المقالة المميزة", placeholder: "A Complete Guide to…",       placeholderAr: "دليل شامل لـ…" },
    { key: "featuredExcerpt",  type: "textarea", bilingual: true, labelEn: "Featured Post Excerpt",   labelAr: "مقتطف المقالة المميزة", placeholder: "Learn how leading teams…",   placeholderAr: "تعرّف كيف تتصدر الفرق…" },
    { key: "featuredImage",    type: "image",                    labelEn: "Featured Post Image",      labelAr: "صورة المقالة المميزة" },
    { key: "featuredDate",     type: "text",                     labelEn: "Featured Post Date",       labelAr: "تاريخ المقالة المميزة", placeholder: "2025-01-20" },
    { key: "featuredCategory", type: "text",     bilingual: true, labelEn: "Featured Post Category",  labelAr: "تصنيف المقالة المميزة", placeholder: "Product",                    placeholderAr: "المنتج" },
    { key: "featuredSlug",     type: "url",                      labelEn: "Featured Post URL",        labelAr: "رابط المقالة المميزة", placeholder: "/blog/my-post" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// portfolio-masonry ─────────────────────────────────────────────────────────
const PORTFOLIO_MASONRY_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Portfolio Items",
      labelAr: "عناصر المحفظة",
      itemTitleKey: "title",
      subFields: [
        { key: "title",    type: "text",  bilingual: true,  labelEn: "Project Title", labelAr: "عنوان المشروع", placeholder: "Brand Identity Redesign",  placeholderAr: "إعادة تصميم الهوية" },
        { key: "category", type: "text",  bilingual: true,  labelEn: "Category",      labelAr: "التصنيف",       placeholder: "Branding",                  placeholderAr: "العلامة التجارية" },
        { key: "image",    type: "image", bilingual: false, labelEn: "Image",         labelAr: "الصورة" },
        { key: "slug",     type: "url",                     labelEn: "Project URL",   labelAr: "رابط المشروع", placeholder: "/portfolio/my-project" },
      ],
    },
  ],
  configFields: [
    { key: "title",    type: "text",     bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم",    placeholder: "Our Work",                    placeholderAr: "أعمالنا" },
    { key: "subtitle", type: "textarea", bilingual: true, labelEn: "Subtitle",        labelAr: "العنوان الفرعي", placeholder: "A selection of projects…",    placeholderAr: "مجموعة مختارة من المشاريع…" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// case-study-cards ──────────────────────────────────────────────────────────
const CASE_STUDY_CARDS_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Case Studies",
      labelAr: "دراسات الحالة",
      itemTitleKey: "title",
      subFields: [
        { key: "client",      type: "text",     bilingual: true,  labelEn: "Client Name",    labelAr: "اسم العميل",     placeholder: "Global Logistics Co.",   placeholderAr: "شركة اللوجستيات العالمية" },
        { key: "title",       type: "text",     bilingual: true,  labelEn: "Result Headline",labelAr: "عنوان النتيجة",  placeholder: "Reduced delivery time by 40%", placeholderAr: "تقليل وقت التسليم 40%" },
        { key: "description", type: "textarea", bilingual: true,  labelEn: "Description",    labelAr: "الوصف",          placeholder: "We redesigned…",         placeholderAr: "أعدنا تصميم…" },
        { key: "image",       type: "image",    bilingual: false, labelEn: "Image",          labelAr: "الصورة" },
        { key: "slug",        type: "url",                        labelEn: "Case Study URL", labelAr: "رابط دراسة الحالة", placeholder: "/portfolio/case" },
        { key: "metric1Label", type: "text",    bilingual: true,  labelEn: "Metric 1 Label", labelAr: "تسمية المقياس 1", placeholder: "Faster Delivery",        placeholderAr: "توصيل أسرع" },
        { key: "metric1Value", type: "text",    bilingual: false, labelEn: "Metric 1 Value", labelAr: "قيمة المقياس 1",  placeholder: "40%" },
        { key: "metric2Label", type: "text",    bilingual: true,  labelEn: "Metric 2 Label", labelAr: "تسمية المقياس 2", placeholder: "Cost Saving",            placeholderAr: "توفير في التكاليف" },
        { key: "metric2Value", type: "text",    bilingual: false, labelEn: "Metric 2 Value", labelAr: "قيمة المقياس 2",  placeholder: "$2M" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "Client Success Stories", placeholderAr: "قصص نجاح العملاء" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// pricing-cards ─────────────────────────────────────────────────────────────
const PRICING_CARDS_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "plans",
      type: "repeater",
      labelEn: "Pricing Plans",
      labelAr: "خطط التسعير",
      itemTitleKey: "name",
      subFields: [
        { key: "name",        type: "text",     bilingual: true,  labelEn: "Plan Name",        labelAr: "اسم الخطة",         placeholder: "Professional",      placeholderAr: "الاحترافي" },
        { key: "price",       type: "text",     bilingual: false, labelEn: "Price",             labelAr: "السعر",             placeholder: "$39" },
        { key: "period",      type: "text",     bilingual: false, labelEn: "Period (e.g. /mo)", labelAr: "الفترة (مثل /mo)", placeholder: "/mo" },
        { key: "description", type: "textarea", bilingual: true,  labelEn: "Plan Description",  labelAr: "وصف الخطة",         placeholder: "For growing teams…", placeholderAr: "للفرق المتنامية…" },
        { key: "features",    type: "textarea", bilingual: false, labelEn: "Features (one per line)", labelAr: "الميزات (سطر لكل ميزة)", placeholder: "Unlimited projects\n50 GB storage\nPriority support" },
        { key: "ctaLabel",    type: "text",     bilingual: true,  labelEn: "Button Text",       labelAr: "نص الزر",           placeholder: "Get Started",       placeholderAr: "ابدأ الآن" },
        { key: "ctaUrl",      type: "url",                        labelEn: "Button URL",        labelAr: "رابط الزر",         placeholder: "/signup" },
        { key: "highlighted", type: "text",     bilingual: false, labelEn: "Highlighted? (true/false)", labelAr: "مميز؟ (true/false)", placeholder: "false" },
      ],
    },
  ],
  configFields: [
    { key: "title",          type: "text",     bilingual: true, labelEn: "Section Heading",    labelAr: "عنوان القسم",       placeholder: "Simple, Transparent Pricing", placeholderAr: "أسعار بسيطة وشفافة" },
    { key: "subtitle",       type: "textarea", bilingual: true, labelEn: "Subtitle",           labelAr: "العنوان الفرعي",    placeholder: "No hidden fees. Cancel anytime.", placeholderAr: "لا رسوم مخفية. إلغاء في أي وقت." },
    { key: "annualDiscount", type: "text",     bilingual: true, labelEn: "Annual Discount Note",labelAr: "ملاحظة الخصم السنوي", placeholder: "Save 20% with annual billing", placeholderAr: "وفّر 20% مع الفوترة السنوية" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// pricing-table ─────────────────────────────────────────────────────────────
const PRICING_TABLE_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "rows",
      type: "repeater",
      labelEn: "Comparison Rows",
      labelAr: "صفوف المقارنة",
      itemTitleKey: "feature",
      subFields: [
        { key: "feature",  type: "text", bilingual: true,  labelEn: "Feature Name",    labelAr: "اسم الميزة", placeholder: "Storage",    placeholderAr: "التخزين" },
        { key: "value1",   type: "text", bilingual: false, labelEn: "Tier 1 Value",    labelAr: "قيمة المستوى 1", placeholder: "2 GB" },
        { key: "value2",   type: "text", bilingual: false, labelEn: "Tier 2 Value",    labelAr: "قيمة المستوى 2", placeholder: "50 GB" },
        { key: "value3",   type: "text", bilingual: false, labelEn: "Tier 3 Value",    labelAr: "قيمة المستوى 3", placeholder: "Custom" },
      ],
    },
  ],
  configFields: [
    { key: "title",  type: "text", bilingual: true,  labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "Compare Plans",    placeholderAr: "قارن الخطط" },
    { key: "tier1",  type: "text", bilingual: false, labelEn: "Tier 1 Name",     labelAr: "اسم المستوى 1", placeholder: "Starter" },
    { key: "tier2",  type: "text", bilingual: false, labelEn: "Tier 2 Name",     labelAr: "اسم المستوى 2", placeholder: "Pro" },
    { key: "tier3",  type: "text", bilingual: false, labelEn: "Tier 3 Name",     labelAr: "اسم المستوى 3", placeholder: "Enterprise" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// testimonials-carousel ─────────────────────────────────────────────────────
const TESTIMONIALS_CAROUSEL_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Testimonials",
      labelAr: "الشهادات",
      itemTitleKey: "name",
      subFields: [
        { key: "name",   type: "text",     bilingual: true,  labelEn: "Name",    labelAr: "الاسم",    placeholder: "Sarah Mitchell",    placeholderAr: "سارة ميتشل" },
        { key: "role",   type: "text",     bilingual: true,  labelEn: "Role",    labelAr: "المنصب",   placeholder: "CEO, Apex Solutions", placeholderAr: "الرئيس التنفيذي" },
        { key: "quote",  type: "textarea", bilingual: true,  labelEn: "Quote",   labelAr: "الاقتباس", placeholder: "This platform completely transformed…", placeholderAr: "غيّرت هذه المنصة…" },
        { key: "rating", type: "number",                     labelEn: "Rating (1–5)", labelAr: "التقييم (1–5)", placeholder: "5" },
        { key: "avatar", type: "image",    bilingual: false, labelEn: "Avatar",  labelAr: "الصورة الرمزية" },
      ],
    },
  ],
  configFields: [
    { key: "title",    type: "text", bilingual: true,  labelEn: "Section Heading",        labelAr: "عنوان القسم",     placeholder: "Trusted by Thousands", placeholderAr: "موثوق به من الآلاف" },
    { key: "autoplay", type: "text", bilingual: false, labelEn: "Autoplay (true/false)",   labelAr: "تشغيل تلقائي",    placeholder: "true" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// testimonials-wall ─────────────────────────────────────────────────────────
const TESTIMONIALS_WALL_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Testimonials",
      labelAr: "الشهادات",
      itemTitleKey: "name",
      subFields: [
        { key: "name",   type: "text",     bilingual: true,  labelEn: "Name",    labelAr: "الاسم",    placeholder: "Alex Turner",       placeholderAr: "أليكس تيرنر" },
        { key: "role",   type: "text",     bilingual: true,  labelEn: "Role",    labelAr: "المنصب",   placeholder: "Freelance Developer", placeholderAr: "مطور مستقل" },
        { key: "quote",  type: "textarea", bilingual: true,  labelEn: "Quote",   labelAr: "الاقتباس", placeholder: "Saved me hours every week…", placeholderAr: "وفّر لي ساعات كل أسبوع…" },
        { key: "rating", type: "number",                     labelEn: "Rating (1–5)", labelAr: "التقييم (1–5)", placeholder: "5" },
        { key: "avatar", type: "image",    bilingual: false, labelEn: "Avatar",  labelAr: "الصورة الرمزية" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "What People Are Saying", placeholderAr: "ما يقوله الناس" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// team-leadership ───────────────────────────────────────────────────────────
const TEAM_LEADERSHIP_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "members",
      type: "repeater",
      labelEn: "Leadership Members",
      labelAr: "أعضاء القيادة",
      itemTitleKey: "name",
      subFields: [
        { key: "name",      type: "text",     bilingual: true,  labelEn: "Full Name",    labelAr: "الاسم الكامل",    placeholder: "Alexandra Reed",          placeholderAr: "ألكساندرا ريد" },
        { key: "title",     type: "text",     bilingual: true,  labelEn: "Job Title",    labelAr: "المسمى الوظيفي",  placeholder: "Chief Executive Officer",  placeholderAr: "الرئيس التنفيذي" },
        { key: "bio",       type: "textarea", bilingual: true,  labelEn: "Bio",          labelAr: "السيرة الذاتية",  placeholder: "Over 20 years building…",  placeholderAr: "أكثر من 20 عاماً في بناء…" },
        { key: "photo",     type: "image",    bilingual: false, labelEn: "Photo",        labelAr: "الصورة" },
        { key: "linkedIn",  type: "url",                        labelEn: "LinkedIn URL", labelAr: "رابط لينكدإن",    placeholder: "https://linkedin.com/in/…" },
        { key: "twitter",   type: "url",                        labelEn: "Twitter URL",  labelAr: "رابط تويتر",      placeholder: "https://twitter.com/…" },
      ],
    },
  ],
  configFields: [
    { key: "title",    type: "text",     bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم",    placeholder: "Meet the Leadership",          placeholderAr: "تعرّف على القيادة" },
    { key: "subtitle", type: "textarea", bilingual: true, labelEn: "Subtitle",        labelAr: "العنوان الفرعي", placeholder: "Experienced operators united by…", placeholderAr: "مشغّلون ذوو خبرة توحّدهم…" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// team-compact ──────────────────────────────────────────────────────────────
const TEAM_COMPACT_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "members",
      type: "repeater",
      labelEn: "Team Members",
      labelAr: "أعضاء الفريق",
      itemTitleKey: "name",
      subFields: [
        { key: "name",  type: "text",  bilingual: true,  labelEn: "Name",  labelAr: "الاسم",  placeholder: "Chris Webb",        placeholderAr: "كريس ويب" },
        { key: "role",  type: "text",  bilingual: true,  labelEn: "Role",  labelAr: "المنصب", placeholder: "Engineering Lead",   placeholderAr: "قائد الهندسة" },
        { key: "photo", type: "image", bilingual: false, labelEn: "Photo", labelAr: "الصورة" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "The People Behind the Platform", placeholderAr: "الأشخاص خلف المنصة" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// gallery-grid ──────────────────────────────────────────────────────────────
const GALLERY_GRID_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "images",
      type: "repeater",
      labelEn: "Gallery Images",
      labelAr: "صور المعرض",
      itemTitleKey: "alt",
      subFields: [
        { key: "src",     type: "image",    bilingual: false, labelEn: "Image",   labelAr: "الصورة" },
        { key: "alt",     type: "text",     bilingual: true,  labelEn: "Alt Text",labelAr: "النص البديل",        placeholder: "Photo description",    placeholderAr: "وصف الصورة" },
        { key: "caption", type: "text",     bilingual: true,  labelEn: "Caption", labelAr: "التسمية التوضيحية", placeholder: "Optional caption…",    placeholderAr: "تسمية توضيحية اختيارية…" },
      ],
    },
  ],
  configFields: [
    { key: "title",    type: "text",    bilingual: true,  labelEn: "Section Heading",      labelAr: "عنوان القسم",    placeholder: "Photo Gallery",      placeholderAr: "معرض الصور" },
    { key: "columns",  type: "number",                    labelEn: "Columns (2–4)",         labelAr: "عدد الأعمدة",   placeholder: "3" },
    { key: "lightbox", type: "text",    bilingual: false, labelEn: "Lightbox (true/false)", labelAr: "عرض موسّع",      placeholder: "true" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// image-slider ──────────────────────────────────────────────────────────────
const IMAGE_SLIDER_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "slides",
      type: "repeater",
      labelEn: "Slides",
      labelAr: "الشرائح",
      itemTitleKey: "caption",
      subFields: [
        { key: "src",     type: "image", bilingual: false, labelEn: "Slide Image",  labelAr: "صورة الشريحة" },
        { key: "caption", type: "text",  bilingual: true,  labelEn: "Caption",      labelAr: "التسمية التوضيحية", placeholder: "Slide caption…",   placeholderAr: "تسمية توضيحية…" },
        { key: "alt",     type: "text",  bilingual: true,  labelEn: "Alt Text",     labelAr: "النص البديل",       placeholder: "Image description", placeholderAr: "وصف الصورة" },
      ],
    },
  ],
  configFields: [
    { key: "title",    type: "text", bilingual: true,  labelEn: "Section Heading",       labelAr: "عنوان القسم",   placeholder: "Life at Our Company", placeholderAr: "الحياة في شركتنا" },
    { key: "autoplay", type: "text", bilingual: false, labelEn: "Autoplay (true/false)", labelAr: "تشغيل تلقائي",  placeholder: "true" },
    { key: "interval", type: "number",                 labelEn: "Interval (ms)",         labelAr: "المدة (مللي ثانية)", placeholder: "5000" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// video-hero ────────────────────────────────────────────────────────────────
const VIDEO_HERO_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",          type: "text",     bilingual: true,  labelEn: "Heading",           labelAr: "العنوان",          placeholder: "A Story Worth Telling",        placeholderAr: "قصة تستحق أن تُروى" },
    { key: "subtitle",       type: "text",     bilingual: true,  labelEn: "Subtitle",          labelAr: "العنوان الفرعي",   placeholder: "See how we are changing…",      placeholderAr: "شاهد كيف نغيّر…" },
    { key: "videoUrl",       type: "url",                        labelEn: "Video URL (mp4)",   labelAr: "رابط الفيديو",     placeholder: "https://…/video.mp4" },
    { key: "posterImage",    type: "image",                      labelEn: "Poster / Fallback Image", labelAr: "صورة الغلاف" },
    { key: "ctaLabel",       type: "text",     bilingual: true,  labelEn: "CTA Button Text",   labelAr: "نص زر الإجراء",    placeholder: "Watch the Film",               placeholderAr: "شاهد الفيلم" },
    { key: "ctaUrl",         type: "url",                        labelEn: "CTA Button URL",    labelAr: "رابط زر الإجراء",  placeholder: "#" },
    { key: "overlayOpacity", type: "text",     bilingual: false, labelEn: "Overlay Opacity (0–1)", labelAr: "شفافية الطبقة (0–1)", placeholder: "0.5" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// video-embed ───────────────────────────────────────────────────────────────
const VIDEO_EMBED_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",       type: "text",     bilingual: true, labelEn: "Heading",         labelAr: "العنوان",        placeholder: "See It In Action",          placeholderAr: "شاهده في العمل" },
    { key: "description", type: "textarea", bilingual: true, labelEn: "Description",     labelAr: "الوصف",          placeholder: "Watch our 3-minute overview…", placeholderAr: "شاهد نظرة عامة لمدة 3 دقائق…" },
    { key: "videoUrl",    type: "url",                       labelEn: "Video Embed URL", labelAr: "رابط تضمين الفيديو", placeholder: "https://youtube.com/embed/…" },
    { key: "aspectRatio", type: "text",     bilingual: false, labelEn: "Aspect Ratio",   labelAr: "نسبة العرض إلى الارتفاع", placeholder: "16/9" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// steps-horizontal ──────────────────────────────────────────────────────────
const STEPS_HORIZONTAL_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "steps",
      type: "repeater",
      labelEn: "Steps",
      labelAr: "الخطوات",
      itemTitleKey: "title",
      subFields: [
        { key: "number",      type: "text",     bilingual: false, labelEn: "Step Number",  labelAr: "رقم الخطوة",  placeholder: "01" },
        { key: "title",       type: "text",     bilingual: true,  labelEn: "Step Title",   labelAr: "عنوان الخطوة", placeholder: "Sign Up in Seconds",     placeholderAr: "سجّل في ثوانٍ" },
        { key: "description", type: "textarea", bilingual: true,  labelEn: "Description",  labelAr: "الوصف",        placeholder: "Create your account…",   placeholderAr: "أنشئ حسابك…" },
      ],
    },
  ],
  configFields: [
    { key: "title",    type: "text",     bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم",    placeholder: "How It Works",              placeholderAr: "كيف يعمل" },
    { key: "subtitle", type: "textarea", bilingual: true, labelEn: "Subtitle",        labelAr: "العنوان الفرعي", placeholder: "Up and running in minutes", placeholderAr: "جاهز للعمل في دقائق" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// steps-vertical ────────────────────────────────────────────────────────────
const STEPS_VERTICAL_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "steps",
      type: "repeater",
      labelEn: "Process Steps",
      labelAr: "خطوات العملية",
      itemTitleKey: "title",
      subFields: [
        { key: "icon",        type: "text",     bilingual: false, labelEn: "Icon (emoji)", labelAr: "أيقونة",       placeholder: "📋" },
        { key: "title",       type: "text",     bilingual: true,  labelEn: "Step Title",   labelAr: "عنوان الخطوة", placeholder: "Discovery & Research",   placeholderAr: "الاستكشاف والبحث" },
        { key: "description", type: "textarea", bilingual: true,  labelEn: "Description",  labelAr: "الوصف",        placeholder: "We begin by deeply understanding…", placeholderAr: "نبدأ بفهم عميق…" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "Our Process", placeholderAr: "عمليتنا" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// logos-strip ───────────────────────────────────────────────────────────────
const LOGOS_STRIP_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "logos",
      type: "repeater",
      labelEn: "Logos",
      labelAr: "الشعارات",
      itemTitleKey: "name",
      subFields: [
        { key: "name", type: "text",  bilingual: true,  labelEn: "Company Name", labelAr: "اسم الشركة",  placeholder: "Partner One",  placeholderAr: "الشريك الأول" },
        { key: "src",  type: "image", bilingual: false, labelEn: "Logo Image",   labelAr: "صورة الشعار" },
        { key: "url",  type: "url",                     labelEn: "Link URL (optional)", labelAr: "رابط (اختياري)", placeholder: "https://partner.com" },
      ],
    },
  ],
  configFields: [
    { key: "title",     type: "text", bilingual: true,  labelEn: "Section Heading",          labelAr: "عنوان القسم",    placeholder: "Trusted by Industry Leaders", placeholderAr: "موثوق به من رواد الصناعة" },
    { key: "grayscale", type: "text", bilingual: false, labelEn: "Grayscale logos (true/false)", labelAr: "شعارات رمادية",  placeholder: "true" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// logos-marquee ─────────────────────────────────────────────────────────────
const LOGOS_MARQUEE_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "logos",
      type: "repeater",
      labelEn: "Logos",
      labelAr: "الشعارات",
      itemTitleKey: "name",
      subFields: [
        { key: "name", type: "text",  bilingual: true,  labelEn: "Company Name", labelAr: "اسم الشركة",  placeholder: "Company A",  placeholderAr: "الشركة أ" },
        { key: "src",  type: "image", bilingual: false, labelEn: "Logo Image",   labelAr: "صورة الشعار" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true,  labelEn: "Section Heading", labelAr: "عنوان القسم",  placeholder: "Powering Teams at Companies Like These", placeholderAr: "يدعم الفرق في شركات مثل هذه" },
    { key: "speed", type: "text", bilingual: false, labelEn: "Speed (slow / normal / fast)", labelAr: "السرعة", placeholder: "normal" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// tabs-content ──────────────────────────────────────────────────────────────
const TABS_CONTENT_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "tabs",
      type: "repeater",
      labelEn: "Tabs",
      labelAr: "التبويبات",
      itemTitleKey: "label",
      subFields: [
        { key: "label",   type: "text",     bilingual: true,  labelEn: "Tab Label",   labelAr: "عنوان التبويب",  placeholder: "For Businesses",     placeholderAr: "للشركات" },
        { key: "title",   type: "text",     bilingual: true,  labelEn: "Panel Title", labelAr: "عنوان اللوحة",   placeholder: "Scale Your Operations", placeholderAr: "وسّع نطاق عملياتك" },
        { key: "content", type: "textarea", bilingual: true,  labelEn: "Panel Content",labelAr: "محتوى اللوحة",  placeholder: "Panel body text…",   placeholderAr: "نص محتوى اللوحة…" },
        { key: "image",   type: "image",    bilingual: false, labelEn: "Panel Image (optional)", labelAr: "صورة اللوحة (اختياري)" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "Built for Every Team", placeholderAr: "مبني لكل فريق" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// comparison-slider ─────────────────────────────────────────────────────────
const COMPARISON_SLIDER_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",           type: "text",     bilingual: true,  labelEn: "Heading",          labelAr: "العنوان",         placeholder: "See the Difference",  placeholderAr: "شاهد الفرق" },
    { key: "description",     type: "textarea", bilingual: true,  labelEn: "Description",      labelAr: "الوصف",           placeholder: "Drag the slider to compare…", placeholderAr: "اسحب الشريط للمقارنة…" },
    { key: "beforeImage",     type: "image",    bilingual: false, labelEn: "Before Image",      labelAr: "صورة قبل" },
    { key: "afterImage",      type: "image",    bilingual: false, labelEn: "After Image",       labelAr: "صورة بعد" },
    { key: "beforeLabel",     type: "text",     bilingual: true,  labelEn: "Before Label",      labelAr: "تسمية قبل",       placeholder: "Before",               placeholderAr: "قبل" },
    { key: "afterLabel",      type: "text",     bilingual: true,  labelEn: "After Label",       labelAr: "تسمية بعد",       placeholder: "After",                placeholderAr: "بعد" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// competitor-comparison ─────────────────────────────────────────────────────
const COMPETITOR_COMPARISON_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "rows",
      type: "repeater",
      labelEn: "Feature Rows",
      labelAr: "صفوف الميزات",
      itemTitleKey: "feature",
      subFields: [
        { key: "feature", type: "text", bilingual: true,  labelEn: "Feature Name",       labelAr: "اسم الميزة",          placeholder: "Unlimited Projects",  placeholderAr: "مشاريع غير محدودة" },
        { key: "us",      type: "text", bilingual: false, labelEn: "Our Value (true/false/text)", labelAr: "قيمتنا",      placeholder: "true" },
        { key: "comp1",   type: "text", bilingual: false, labelEn: "Competitor A Value",  labelAr: "قيمة المنافس أ",       placeholder: "false" },
        { key: "comp2",   type: "text", bilingual: false, labelEn: "Competitor B Value",  labelAr: "قيمة المنافس ب",       placeholder: "false" },
      ],
    },
  ],
  configFields: [
    { key: "title",  type: "text", bilingual: true,  labelEn: "Section Heading",   labelAr: "عنوان القسم",    placeholder: "Why Choose Us",        placeholderAr: "لماذا تختارنا" },
    { key: "label1", type: "text", bilingual: false, labelEn: "Our Column Label",  labelAr: "عنوان عمودنا",   placeholder: "Us" },
    { key: "label2", type: "text", bilingual: false, labelEn: "Competitor A Label",labelAr: "تسمية المنافس أ", placeholder: "Competitor A" },
    { key: "label3", type: "text", bilingual: false, labelEn: "Competitor B Label",labelAr: "تسمية المنافس ب", placeholder: "Competitor B" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// map-location ──────────────────────────────────────────────────────────────
const MAP_LOCATION_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",        type: "text",     bilingual: true,  labelEn: "Section Heading",   labelAr: "عنوان القسم",    placeholder: "Find Us",                      placeholderAr: "اعثر علينا" },
    { key: "locationName", type: "text",     bilingual: true,  labelEn: "Location Name",     labelAr: "اسم الموقع",    placeholder: "Main Office",                  placeholderAr: "المكتب الرئيسي" },
    { key: "address",      type: "text",     bilingual: true,  labelEn: "Address",           labelAr: "العنوان",        placeholder: "123 Business Avenue, City",    placeholderAr: "123 شارع الأعمال، المدينة" },
    { key: "phone",        type: "text",     bilingual: false, labelEn: "Phone",             labelAr: "الهاتف",         placeholder: "+1 (555) 000-0000" },
    { key: "email",        type: "text",     bilingual: false, labelEn: "Email",             labelAr: "البريد الإلكتروني", placeholder: "hello@example.com" },
    { key: "hours",        type: "text",     bilingual: false, labelEn: "Opening Hours",     labelAr: "ساعات العمل",    placeholder: "Mon–Fri: 9am – 6pm" },
    { key: "mapEmbedUrl",  type: "url",                        labelEn: "Google Maps Embed URL", labelAr: "رابط تضمين خرائط غوغل", placeholder: "https://maps.google.com/maps?…&output=embed" },
    { key: "ctaLabel",     type: "text",     bilingual: true,  labelEn: "Directions Button Text", labelAr: "نص زر الاتجاهات", placeholder: "Get Directions",            placeholderAr: "احصل على الاتجاهات" },
    { key: "ctaUrl",       type: "url",                        labelEn: "Directions URL",    labelAr: "رابط الاتجاهات", placeholder: "https://maps.google.com/…" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// offices-map ───────────────────────────────────────────────────────────────
const OFFICES_MAP_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "offices",
      type: "repeater",
      labelEn: "Office Locations",
      labelAr: "مواقع المكاتب",
      itemTitleKey: "city",
      subFields: [
        { key: "city",    type: "text",     bilingual: true,  labelEn: "City",    labelAr: "المدينة",              placeholder: "New York",              placeholderAr: "نيويورك" },
        { key: "address", type: "text",     bilingual: true,  labelEn: "Address", labelAr: "العنوان",               placeholder: "350 Fifth Avenue, Suite 2400", placeholderAr: "350 الجادة الخامسة" },
        { key: "phone",   type: "text",     bilingual: false, labelEn: "Phone",   labelAr: "الهاتف",                placeholder: "+1 212 000 0000" },
        { key: "email",   type: "text",     bilingual: false, labelEn: "Email",   labelAr: "البريد الإلكتروني",    placeholder: "office@example.com" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "Our Global Offices", placeholderAr: "مكاتبنا العالمية" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// hero-split ────────────────────────────────────────────────────────────────
const HERO_SPLIT_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "subtitle",             type: "text",     bilingual: true, labelEn: "Tagline / Badge Text",    labelAr: "شارة / وسم", placeholder: "Award-Winning Platform", placeholderAr: "منصة حائزة على جوائز" },
    { key: "title",                type: "text",     bilingual: true, labelEn: "Heading",                 labelAr: "العنوان",     placeholder: "Build Something the World Will Remember", placeholderAr: "ابنِ شيئاً سيتذكره العالم" },
    { key: "description",          type: "textarea", bilingual: true, labelEn: "Description",             labelAr: "الوصف",       placeholder: "Join over 50,000 teams…",  placeholderAr: "انضم إلى أكثر من 50,000 فريق…" },
    { key: "primaryButtonLabel",   type: "text",     bilingual: true, labelEn: "Primary Button Text",     labelAr: "نص الزر الرئيسي",   placeholder: "Start for Free",  placeholderAr: "ابدأ مجاناً" },
    { key: "primaryButtonUrl",     type: "url",                       labelEn: "Primary Button URL",      labelAr: "رابط الزر الرئيسي", placeholder: "/signup" },
    { key: "secondaryButtonLabel", type: "text",     bilingual: true, labelEn: "Secondary Button Text",   labelAr: "نص الزر الثانوي",   placeholder: "Book a Demo",     placeholderAr: "احجز عرضاً" },
    { key: "secondaryButtonUrl",   type: "url",                       labelEn: "Secondary Button URL",    labelAr: "رابط الزر الثانوي", placeholder: "/demo" },
    { key: "image",                type: "image",                     labelEn: "Hero Image (right side)", labelAr: "صورة البانر (الجانب الأيمن)" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// hero-minimal ──────────────────────────────────────────────────────────────
const HERO_MINIMAL_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "tagline",        type: "text",     bilingual: true, labelEn: "Tagline / Badge",      labelAr: "الشارة",              placeholder: "🚀 Now in public beta",       placeholderAr: "🚀 متاح في النسخة التجريبية" },
    { key: "title",          type: "text",     bilingual: true, labelEn: "Heading",              labelAr: "العنوان",             placeholder: "The Operating System for Modern Teams", placeholderAr: "نظام التشغيل للفرق الحديثة" },
    { key: "description",    type: "textarea", bilingual: true, labelEn: "Description",          labelAr: "الوصف",               placeholder: "One platform to manage projects…",     placeholderAr: "منصة واحدة لإدارة المشاريع…" },
    { key: "ctaLabel",       type: "text",     bilingual: true, labelEn: "Primary CTA Text",     labelAr: "نص الزر الرئيسي",     placeholder: "Get Started — It's Free",   placeholderAr: "ابدأ — إنه مجاني" },
    { key: "ctaUrl",         type: "url",                       labelEn: "Primary CTA URL",      labelAr: "رابط الزر الرئيسي",   placeholder: "/signup" },
    { key: "secondaryLabel", type: "text",     bilingual: true, labelEn: "Secondary Link Text",  labelAr: "نص الرابط الثانوي",   placeholder: "See how it works",          placeholderAr: "شاهد كيف يعمل" },
    { key: "secondaryUrl",   type: "url",                       labelEn: "Secondary Link URL",   labelAr: "رابط ثانوي",          placeholder: "#demo" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// hero-announcement ─────────────────────────────────────────────────────────
const HERO_ANNOUNCEMENT_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",           type: "text",     bilingual: true,  labelEn: "Heading",           labelAr: "العنوان",              placeholder: "Something Big is Coming",    placeholderAr: "شيء كبير قادم" },
    { key: "description",     type: "textarea", bilingual: true,  labelEn: "Description",       labelAr: "الوصف",                placeholder: "We are launching our next-generation platform…", placeholderAr: "نطلق منصتنا من الجيل التالي…" },
    { key: "launchDate",      type: "text",     bilingual: false, labelEn: "Launch Date (YYYY-MM-DD)", labelAr: "تاريخ الإطلاق", placeholder: "2025-06-01" },
    { key: "ctaLabel",        type: "text",     bilingual: true,  labelEn: "CTA Button Text",   labelAr: "نص زر الإجراء",       placeholder: "Join the Waitlist",          placeholderAr: "انضم إلى قائمة الانتظار" },
    { key: "ctaUrl",          type: "url",                        labelEn: "CTA Button URL",    labelAr: "رابط زر الإجراء",     placeholder: "/waitlist" },
    { key: "backgroundImage", type: "image",                      labelEn: "Background Image",  labelAr: "صورة الخلفية" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// rich-text ─────────────────────────────────────────────────────────────────
const RICH_TEXT_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",      type: "text",     bilingual: true, labelEn: "Heading",      labelAr: "العنوان",              placeholder: "Our Commitment to Excellence", placeholderAr: "التزامنا بالتميز" },
    { key: "body",       type: "textarea", bilingual: true, labelEn: "Body Text (HTML supported)", labelAr: "نص المقالة (يدعم HTML)", placeholder: "<p>Your content here…</p>", placeholderAr: "<p>المحتوى هنا…</p>" },
    { key: "pullQuote",  type: "textarea", bilingual: true, labelEn: "Pull Quote (optional)", labelAr: "اقتباس بارز (اختياري)", placeholder: "A stand-out quote from the article…", placeholderAr: "اقتباس بارز من المقالة…" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// split-content ─────────────────────────────────────────────────────────────
const SPLIT_CONTENT_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",         type: "text",     bilingual: true, labelEn: "Heading",           labelAr: "العنوان",          placeholder: "Designed With People in Mind", placeholderAr: "مصمم مع مراعاة الناس" },
    { key: "description",   type: "textarea", bilingual: true, labelEn: "Description",       labelAr: "الوصف",            placeholder: "Every feature we build starts with…", placeholderAr: "كل ميزة نبنيها تبدأ بـ…" },
    { key: "ctaLabel",      type: "text",     bilingual: true, labelEn: "CTA Button Text",   labelAr: "نص زر الإجراء",    placeholder: "Learn Our Story",    placeholderAr: "تعرّف على قصتنا" },
    { key: "ctaUrl",        type: "url",                       labelEn: "CTA Button URL",    labelAr: "رابط زر الإجراء",  placeholder: "/about" },
    { key: "image",         type: "image",                     labelEn: "Image",             labelAr: "الصورة" },
    { key: "imagePosition", type: "text",     bilingual: false, labelEn: "Image Position (left / right)", labelAr: "موضع الصورة", placeholder: "right" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// icon-list ─────────────────────────────────────────────────────────────────
const ICON_LIST_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "List Items",
      labelAr: "عناصر القائمة",
      itemTitleKey: "text",
      subFields: [
        { key: "icon", type: "text", bilingual: false, labelEn: "Icon (emoji)", labelAr: "أيقونة", placeholder: "✅" },
        { key: "text", type: "text", bilingual: true,  labelEn: "Text",         labelAr: "النص",   placeholder: "Key benefit or feature…", placeholderAr: "ميزة أو فائدة رئيسية…" },
      ],
    },
  ],
  configFields: [
    { key: "title",   type: "text",   bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "Everything Included, No Surprises", placeholderAr: "كل شيء مشمول، لا مفاجآت" },
    { key: "columns", type: "number",                  labelEn: "Columns (1–3)",   labelAr: "عدد الأعمدة", placeholder: "2" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// stats-progress ────────────────────────────────────────────────────────────
const STATS_PROGRESS_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Metrics",
      labelAr: "المقاييس",
      itemTitleKey: "label",
      subFields: [
        { key: "label",  type: "text",   bilingual: true,  labelEn: "Metric Label",     labelAr: "تسمية المقياس",    placeholder: "Customer Satisfaction",   placeholderAr: "رضا العملاء" },
        { key: "value",  type: "number",                   labelEn: "Value (0–100)",     labelAr: "القيمة (0–100)",   placeholder: "98" },
        { key: "suffix", type: "text",   bilingual: false, labelEn: "Suffix (e.g. %)",   labelAr: "اللاحقة (مثل %)", placeholder: "%" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "Measurable Results, Every Time", placeholderAr: "نتائج قابلة للقياس في كل مرة" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// stats-impact ──────────────────────────────────────────────────────────────
const STATS_IMPACT_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Impact Numbers",
      labelAr: "أرقام الأثر",
      itemTitleKey: "label",
      subFields: [
        { key: "value",       type: "text",     bilingual: false, labelEn: "Value (e.g. 10M+)", labelAr: "القيمة (مثل 10M+)",  placeholder: "10M+" },
        { key: "label",       type: "text",     bilingual: true,  labelEn: "Label",              labelAr: "التسمية",             placeholder: "Tasks Completed",      placeholderAr: "مهمة مكتملة" },
        { key: "description", type: "textarea", bilingual: true,  labelEn: "Supporting Text",    labelAr: "النص الداعم",         placeholder: "Across all workspaces", placeholderAr: "عبر جميع مساحات العمل" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "The Numbers Speak for Themselves", placeholderAr: "الأرقام تتحدث عن نفسها" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// services-cards ────────────────────────────────────────────────────────────
const SERVICES_CARDS_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "Services",
      labelAr: "الخدمات",
      itemTitleKey: "title",
      subFields: [
        { key: "icon",        type: "text",     bilingual: false, labelEn: "Icon (emoji)", labelAr: "أيقونة",          placeholder: "💡" },
        { key: "title",       type: "text",     bilingual: true,  labelEn: "Service Title",labelAr: "عنوان الخدمة",    placeholder: "Strategy & Consulting", placeholderAr: "الاستراتيجية والاستشارات" },
        { key: "description", type: "textarea", bilingual: true,  labelEn: "Description",  labelAr: "الوصف",           placeholder: "We help you define…",   placeholderAr: "نساعدك في تحديد…" },
        { key: "linkLabel",   type: "text",     bilingual: true,  labelEn: "Link Text",    labelAr: "نص الرابط",       placeholder: "Learn more",            placeholderAr: "اعرف المزيد" },
        { key: "linkUrl",     type: "url",                        labelEn: "Link URL",     labelAr: "رابط الخدمة",     placeholder: "/services/strategy" },
      ],
    },
  ],
  configFields: [
    { key: "title",    type: "text",     bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم",    placeholder: "What We Do",                       placeholderAr: "ما نفعله" },
    { key: "subtitle", type: "textarea", bilingual: true, labelEn: "Subtitle",        labelAr: "العنوان الفرعي", placeholder: "End-to-end expertise across…",      placeholderAr: "خبرة شاملة عبر…" },
    { key: "columns",  type: "number",                   labelEn: "Columns (2–4)",   labelAr: "عدد الأعمدة",   placeholder: "2" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// news-cards-horizontal ─────────────────────────────────────────────────────
const NEWS_CARDS_HORIZONTAL_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "items",
      type: "repeater",
      labelEn: "News Items",
      labelAr: "عناصر الأخبار",
      itemTitleKey: "title",
      subFields: [
        { key: "title",    type: "text",     bilingual: true,  labelEn: "Headline",  labelAr: "العنوان",       placeholder: "Platform Named Top 10 SaaS Tool", placeholderAr: "المنصة تُصنَّف ضمن أفضل 10" },
        { key: "category", type: "text",     bilingual: true,  labelEn: "Category",  labelAr: "التصنيف",      placeholder: "Awards",                          placeholderAr: "الجوائز" },
        { key: "date",     type: "text",     bilingual: false, labelEn: "Date",       labelAr: "التاريخ",      placeholder: "2025-01-18" },
        { key: "image",    type: "image",    bilingual: false, labelEn: "Thumbnail", labelAr: "الصورة المصغرة" },
        { key: "slug",     type: "url",                        labelEn: "Article URL",labelAr: "رابط المقالة", placeholder: "/news/my-article" },
      ],
    },
  ],
  configFields: [
    { key: "title",        type: "text", bilingual: true, labelEn: "Section Heading",    labelAr: "عنوان القسم",    placeholder: "Latest News",     placeholderAr: "آخر الأخبار" },
    { key: "viewAllLabel", type: "text", bilingual: true, labelEn: "\"View All\" Text",  labelAr: "نص عرض الكل",    placeholder: "View All News",   placeholderAr: "عرض جميع الأخبار" },
    { key: "viewAllUrl",   type: "url",                   labelEn: "\"View All\" URL",   labelAr: "رابط عرض الكل", placeholder: "/news" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// waitlist-form ─────────────────────────────────────────────────────────────
const WAITLIST_FORM_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",       type: "text",     bilingual: true, labelEn: "Heading",             labelAr: "العنوان",          placeholder: "Be the First to Know",          placeholderAr: "كن أول من يعلم" },
    { key: "description", type: "textarea", bilingual: true, labelEn: "Description",         labelAr: "الوصف",            placeholder: "Join 10,000+ people…",          placeholderAr: "انضم إلى أكثر من 10,000 شخص…" },
    { key: "placeholder", type: "text",     bilingual: true, labelEn: "Input Placeholder",   labelAr: "نص حقل الإدخال",   placeholder: "Enter your email address",      placeholderAr: "أدخل عنوان بريدك الإلكتروني" },
    { key: "ctaLabel",    type: "text",     bilingual: true, labelEn: "Button Text",         labelAr: "نص الزر",          placeholder: "Join the Waitlist",             placeholderAr: "انضم إلى قائمة الانتظار" },
    { key: "privacyNote", type: "text",     bilingual: true, labelEn: "Privacy Note",        labelAr: "ملاحظة الخصوصية", placeholder: "No spam, ever. Unsubscribe at any time.", placeholderAr: "لا رسائل مزعجة أبداً." },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// multi-step-form ───────────────────────────────────────────────────────────
const MULTI_STEP_FORM_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "steps",
      type: "repeater",
      labelEn: "Form Steps",
      labelAr: "خطوات النموذج",
      itemTitleKey: "title",
      subFields: [
        { key: "title",  type: "text",     bilingual: true, labelEn: "Step Title",   labelAr: "عنوان الخطوة",  placeholder: "Personal Info",   placeholderAr: "المعلومات الشخصية" },
        { key: "fields", type: "textarea", bilingual: false, labelEn: "Fields (comma-separated keys)", labelAr: "الحقول (مفاتيح مفصولة بفاصلة)", placeholder: "firstName, lastName, email" },
      ],
    },
  ],
  configFields: [
    { key: "title",       type: "text", bilingual: true, labelEn: "Heading",              labelAr: "العنوان",       placeholder: "Tell Us About Yourself",  placeholderAr: "أخبرنا عن نفسك" },
    { key: "submitLabel", type: "text", bilingual: true, labelEn: "Submit Button Text",   labelAr: "نص زر الإرسال", placeholder: "Submit Application",      placeholderAr: "إرسال الطلب" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// jobs-feed ─────────────────────────────────────────────────────────────────
const JOBS_FEED_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",        type: "text",     bilingual: true, labelEn: "Section Heading",    labelAr: "عنوان القسم",    placeholder: "Join Our Team",         placeholderAr: "انضم إلى فريقنا" },
    { key: "subtitle",     type: "textarea", bilingual: true, labelEn: "Subtitle",           labelAr: "العنوان الفرعي", placeholder: "We are always looking for exceptional people", placeholderAr: "نبحث دائماً عن أشخاص استثنائيين" },
    { key: "count",        type: "number",                    labelEn: "Number of Jobs",     labelAr: "عدد الوظائف",   placeholder: "5" },
    { key: "viewAllLabel", type: "text",     bilingual: true, labelEn: "\"View All\" Text",  labelAr: "نص عرض الكل",   placeholder: "View All Openings",     placeholderAr: "عرض جميع الوظائف" },
    { key: "viewAllUrl",   type: "url",                       labelEn: "\"View All\" URL",   labelAr: "رابط عرض الكل", placeholder: "/careers" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// members-feed ──────────────────────────────────────────────────────────────
const MEMBERS_FEED_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",        type: "text",   bilingual: true, labelEn: "Section Heading",   labelAr: "عنوان القسم",   placeholder: "Our Members",           placeholderAr: "أعضاؤنا" },
    { key: "count",        type: "number",                  labelEn: "Number to Show",    labelAr: "عدد المعروضين", placeholder: "6" },
    { key: "viewAllLabel", type: "text",   bilingual: true, labelEn: "\"View All\" Text", labelAr: "نص عرض الكل",  placeholder: "View Full Directory",   placeholderAr: "عرض الدليل الكامل" },
    { key: "viewAllUrl",   type: "url",                     labelEn: "\"View All\" URL",  labelAr: "رابط عرض الكل", placeholder: "/members" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// podcast-section ───────────────────────────────────────────────────────────
const PODCAST_SECTION_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "episodes",
      type: "repeater",
      labelEn: "Episodes",
      labelAr: "الحلقات",
      itemTitleKey: "title",
      subFields: [
        { key: "title",    type: "text",  bilingual: true,  labelEn: "Episode Title",   labelAr: "عنوان الحلقة",   placeholder: "The Future of Remote Work",  placeholderAr: "مستقبل العمل عن بُعد" },
        { key: "duration", type: "text",  bilingual: true,  labelEn: "Duration",        labelAr: "المدة",          placeholder: "42 min",                     placeholderAr: "42 دقيقة" },
        { key: "date",     type: "text",  bilingual: true,  labelEn: "Date",            labelAr: "التاريخ",        placeholder: "Jan 15, 2025",               placeholderAr: "15 يناير 2025" },
        { key: "audioUrl", type: "url",                     labelEn: "Audio File URL",  labelAr: "رابط ملف الصوت", placeholder: "https://…/episode.mp3" },
        { key: "image",    type: "image", bilingual: false, labelEn: "Episode Artwork", labelAr: "صورة الحلقة" },
      ],
    },
  ],
  configFields: [
    { key: "title",       type: "text",     bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "The Weekly Podcast",          placeholderAr: "البودكاست الأسبوعي" },
    { key: "description", type: "textarea", bilingual: true, labelEn: "Show Description",labelAr: "وصف البرنامج", placeholder: "In-depth conversations with…", placeholderAr: "محادثات متعمقة مع…" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// social-feed ───────────────────────────────────────────────────────────────
const SOCIAL_FEED_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "posts",
      type: "repeater",
      labelEn: "Social Posts",
      labelAr: "منشورات التواصل الاجتماعي",
      itemTitleKey: "caption",
      subFields: [
        { key: "image",   type: "image",    bilingual: false, labelEn: "Post Image",  labelAr: "صورة المنشور" },
        { key: "caption", type: "textarea", bilingual: false, labelEn: "Caption",     labelAr: "التسمية التوضيحية", placeholder: "Post caption…" },
      ],
    },
  ],
  configFields: [
    { key: "title",          type: "text", bilingual: true,  labelEn: "Section Heading",  labelAr: "عنوان القسم",    placeholder: "Follow Us on Social",         placeholderAr: "تابعنا على السوشيال ميديا" },
    { key: "platformHandle", type: "text", bilingual: false, labelEn: "Platform Handle",  labelAr: "المعرّف",        placeholder: "@yourhandle" },
    { key: "profileUrl",     type: "url",                    labelEn: "Profile URL",       labelAr: "رابط الملف الشخصي", placeholder: "https://instagram.com/…" },
    { key: "ctaLabel",       type: "text", bilingual: true,  labelEn: "Follow Button Text",labelAr: "نص زر المتابعة", placeholder: "Follow for Updates",          placeholderAr: "تابع للحصول على التحديثات" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// about-section ─────────────────────────────────────────────────────────────
const ABOUT_SECTION_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "values",
      type: "repeater",
      labelEn: "Company Values",
      labelAr: "قيم الشركة",
      itemTitleKey: "title",
      subFields: [
        { key: "icon",        type: "text",     bilingual: false, labelEn: "Icon (emoji)", labelAr: "أيقونة",          placeholder: "❤️" },
        { key: "title",       type: "text",     bilingual: true,  labelEn: "Value Title",  labelAr: "عنوان القيمة",    placeholder: "People First",    placeholderAr: "الناس أولاً" },
        { key: "description", type: "textarea", bilingual: true,  labelEn: "Description",  labelAr: "الوصف",           placeholder: "We believe…",      placeholderAr: "نؤمن بـ…" },
      ],
    },
  ],
  configFields: [
    { key: "title",   type: "text",     bilingual: true, labelEn: "Section Heading",  labelAr: "عنوان القسم",    placeholder: "Our Mission",                          placeholderAr: "رسالتنا" },
    { key: "mission", type: "textarea", bilingual: true, labelEn: "Mission Statement",labelAr: "بيان الرسالة",   placeholder: "To make meaningful work accessible…",  placeholderAr: "جعل العمل الهادف متاحاً…" },
    { key: "image",   type: "image",                     labelEn: "Image",            labelAr: "الصورة" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// awards-section ────────────────────────────────────────────────────────────
const AWARDS_SECTION_SCHEMA: SectionSchema = {
  dataFields: [
    {
      key: "awards",
      type: "repeater",
      labelEn: "Awards",
      labelAr: "الجوائز",
      itemTitleKey: "title",
      subFields: [
        { key: "title",  type: "text",  bilingual: true,  labelEn: "Award Title",  labelAr: "عنوان الجائزة",  placeholder: "Best Product 2024",   placeholderAr: "أفضل منتج 2024" },
        { key: "issuer", type: "text",  bilingual: true,  labelEn: "Issued By",    labelAr: "صادرة من",       placeholder: "TechCrunch Awards",   placeholderAr: "جوائز TechCrunch" },
        { key: "year",   type: "text",  bilingual: false, labelEn: "Year",         labelAr: "السنة",          placeholder: "2024" },
        { key: "image",  type: "image", bilingual: false, labelEn: "Badge Image",  labelAr: "صورة الشارة" },
      ],
    },
    {
      key: "pressMentions",
      type: "repeater",
      labelEn: "Press Mentions",
      labelAr: "ذكر في الصحافة",
      itemTitleKey: "outlet",
      subFields: [
        { key: "outlet", type: "text",     bilingual: true,  labelEn: "Publication Name", labelAr: "اسم المنشور", placeholder: "Forbes",                  placeholderAr: "فوربس" },
        { key: "quote",  type: "textarea", bilingual: true,  labelEn: "Quote",            labelAr: "الاقتباس",   placeholder: "\"The platform every growing team needs\"", placeholderAr: "\"المنصة التي يحتاجها كل فريق\"" },
        { key: "url",    type: "url",                        labelEn: "Article URL",      labelAr: "رابط المقالة", placeholder: "https://forbes.com/…" },
      ],
    },
  ],
  configFields: [
    { key: "title", type: "text", bilingual: true, labelEn: "Section Heading", labelAr: "عنوان القسم", placeholder: "Recognised by the Best", placeholderAr: "معترف بها من قبل الأفضل" },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// cta-newsletter ────────────────────────────────────────────────────────────
const CTA_NEWSLETTER_SCHEMA: SectionSchema = {
  dataFields: [],
  configFields: [
    { key: "title",       type: "text",     bilingual: true, labelEn: "Heading",           labelAr: "العنوان",          placeholder: "Stay in the Loop",              placeholderAr: "ابقَ على اطلاع" },
    { key: "description", type: "textarea", bilingual: true, labelEn: "Description",       labelAr: "الوصف",            placeholder: "Get the latest updates delivered straight to your inbox.", placeholderAr: "احصل على أحدث التحديثات مباشرة إلى بريدك." },
    { key: "placeholder", type: "text",     bilingual: true, labelEn: "Input Placeholder", labelAr: "نص حقل الإدخال",   placeholder: "Your email address",            placeholderAr: "عنوان بريدك الإلكتروني" },
    { key: "ctaLabel",    type: "text",     bilingual: true, labelEn: "Button Text",       labelAr: "نص الزر",          placeholder: "Subscribe Now",                 placeholderAr: "اشترك الآن" },
    { key: "privacyNote", type: "text",     bilingual: true, labelEn: "Privacy Note",      labelAr: "ملاحظة الخصوصية", placeholder: "We respect your privacy. Unsubscribe anytime.", placeholderAr: "نحترم خصوصيتك. إلغاء الاشتراك في أي وقت." },
  ],
  stylingFields: COMMON_STYLING_FIELDS,
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  // ── Original schemas ───────────────────────────────────────────────────────
  hero:                     HERO_SCHEMA,
  "hero-banner":            HERO_SCHEMA,
  "hero-carousel":          HERO_CAROUSEL_SCHEMA,
  "publications-carousel":  PUBLICATIONS_CAROUSEL_SCHEMA,
  cta:                      CTA_SCHEMA,
  "card-group":             CARD_GROUP_SCHEMA,
  stats:                    STATS_SCHEMA,
  counter:                  STATS_SCHEMA,
  testimonial:              TESTIMONIAL_SCHEMA,
  testimonials:             TESTIMONIAL_SCHEMA,
  newsletter:               NEWSLETTER_SCHEMA,
  "newsletter-signup":      NEWSLETTER_SCHEMA,
  "contact-form":           CONTACT_FORM_SCHEMA,
  banner:                   BANNER_SCHEMA,
  faq:                      FAQ_SCHEMA,
  team:                     TEAM_SCHEMA,
  timeline:                 TIMELINE_SCHEMA,
  "footer-layout":          FOOTER_LAYOUT_SCHEMA,
  "latest-news-feed":       LATEST_NEWS_FEED_SCHEMA,
  "upcoming-events-feed":   UPCOMING_EVENTS_FEED_SCHEMA,
  // ── New template schemas ───────────────────────────────────────────────────
  "features-grid":          FEATURES_GRID_SCHEMA,
  "features-alternating":   FEATURES_ALTERNATING_SCHEMA,
  "feature-highlight":      FEATURE_HIGHLIGHT_SCHEMA,
  "blog-grid":              BLOG_GRID_SCHEMA,
  "blog-featured":          BLOG_FEATURED_SCHEMA,
  "portfolio-masonry":      PORTFOLIO_MASONRY_SCHEMA,
  "case-study-cards":       CASE_STUDY_CARDS_SCHEMA,
  "pricing-cards":          PRICING_CARDS_SCHEMA,
  "pricing-table":          PRICING_TABLE_SCHEMA,
  "testimonials-carousel":  TESTIMONIALS_CAROUSEL_SCHEMA,
  "testimonials-wall":      TESTIMONIALS_WALL_SCHEMA,
  "team-leadership":        TEAM_LEADERSHIP_SCHEMA,
  "team-compact":           TEAM_COMPACT_SCHEMA,
  "gallery-grid":           GALLERY_GRID_SCHEMA,
  "image-slider":           IMAGE_SLIDER_SCHEMA,
  "video-hero":             VIDEO_HERO_SCHEMA,
  "video-embed":            VIDEO_EMBED_SCHEMA,
  "steps-horizontal":       STEPS_HORIZONTAL_SCHEMA,
  "steps-vertical":         STEPS_VERTICAL_SCHEMA,
  "logos-strip":            LOGOS_STRIP_SCHEMA,
  "logos-marquee":          LOGOS_MARQUEE_SCHEMA,
  "tabs-content":           TABS_CONTENT_SCHEMA,
  "comparison-slider":      COMPARISON_SLIDER_SCHEMA,
  "competitor-comparison":  COMPETITOR_COMPARISON_SCHEMA,
  "map-location":           MAP_LOCATION_SCHEMA,
  "offices-map":            OFFICES_MAP_SCHEMA,
  "hero-split":             HERO_SPLIT_SCHEMA,
  "hero-minimal":           HERO_MINIMAL_SCHEMA,
  "hero-announcement":      HERO_ANNOUNCEMENT_SCHEMA,
  "rich-text":              RICH_TEXT_SCHEMA,
  "split-content":          SPLIT_CONTENT_SCHEMA,
  "icon-list":              ICON_LIST_SCHEMA,
  "stats-progress":         STATS_PROGRESS_SCHEMA,
  "stats-impact":           STATS_IMPACT_SCHEMA,
  "services-cards":         SERVICES_CARDS_SCHEMA,
  "news-cards-horizontal":  NEWS_CARDS_HORIZONTAL_SCHEMA,
  "waitlist-form":          WAITLIST_FORM_SCHEMA,
  "multi-step-form":        MULTI_STEP_FORM_SCHEMA,
  "jobs-feed":              JOBS_FEED_SCHEMA,
  "members-feed":           MEMBERS_FEED_SCHEMA,
  "podcast-section":        PODCAST_SECTION_SCHEMA,
  "social-feed":            SOCIAL_FEED_SCHEMA,
  "about-section":          ABOUT_SECTION_SCHEMA,
  "awards-section":         AWARDS_SECTION_SCHEMA,
  "cta-newsletter":         CTA_NEWSLETTER_SCHEMA,
};

/** Returns the schema for a given componentType, falling back to the generic schema. */
export function getSchema(componentType: string): SectionSchema {
  return SECTION_SCHEMAS[componentType] ?? GENERIC_SCHEMA;
}
