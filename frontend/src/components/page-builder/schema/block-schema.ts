/**
 * BLOCK_SCHEMA — the single source of truth for every block type's editable props.
 *
 * Each entry maps a block `type` string to a schema object whose `fields` array
 * describes every editable property.  The PropertyPanel renders these fields
 * automatically — no hardcoding needed per block type.
 *
 * Field `group` determines which tab in the PropertyPanel the field appears on:
 *   "content"  → text, urls, toggles, selects that change what the block says
 *   "layout"   → alignment, padding, margin, gap, columns, width
 *   "style"    → background, text color, border, shadow, border-radius
 *   "advanced" → visibility, animation, custom CSS class, HTML id
 */

// ─── Field descriptor types ───────────────────────────────────────────────────

export type PropGroup = "content" | "layout" | "style" | "advanced" | "events";

export type FieldDef =
  | TextField
  | TextareaField
  | RichTextField
  | NumberField
  | SelectField
  | ToggleField
  | ColorField
  | UrlField
  | ImageField
  | ItemsField;

interface BaseField {
  key: string;
  label: string;
  group: PropGroup;
  placeholder?: string;
  helpText?: string;
}

export interface TextField     extends BaseField { kind: "text";     dir?: "rtl" }
export interface TextareaField extends BaseField { kind: "textarea"; rows?: number; dir?: "rtl" }
export interface RichTextField extends BaseField { kind: "richtext"; dir?: "rtl" | "ltr" }
export interface NumberField   extends BaseField { kind: "number";   min?: number; max?: number; step?: number }
export interface SelectField   extends BaseField { kind: "select";   options: Array<{ value: string; label: string }> }
export interface ToggleField   extends BaseField { kind: "toggle" }
export interface ColorField    extends BaseField { kind: "color" }
export interface UrlField      extends BaseField { kind: "url" }
export interface ImageField    extends BaseField { kind: "image" }
/** Repeating items inside a leaf block (e.g. stats, gallery, list) */
export interface ItemsField    extends BaseField { kind: "items";    itemSchema: FieldDef[] }

// ─── Schema shape ─────────────────────────────────────────────────────────────

export interface BlockSchema {
  /** Human-readable display name */
  label: string;
  /** Icon character or emoji shown in the palette */
  icon: string;
  /** Palette category */
  category: "layout" | "content" | "media" | "interactive" | "dynamic";
  /** Whether this block type can hold child blocks */
  isContainer: boolean;
  fields: FieldDef[];
}

// ─── Shared field sets ────────────────────────────────────────────────────────

const SPACING_FIELDS: FieldDef[] = [
  { kind: "text", key: "paddingTop",    label: "Padding Top",    group: "layout", placeholder: "1rem" },
  { kind: "text", key: "paddingBottom", label: "Padding Bottom", group: "layout", placeholder: "1rem" },
  { kind: "text", key: "paddingLeft",   label: "Padding Left",   group: "layout", placeholder: "1rem" },
  { kind: "text", key: "paddingRight",  label: "Padding Right",  group: "layout", placeholder: "1rem" },
  { kind: "text", key: "marginTop",     label: "Margin Top",     group: "layout", placeholder: "0" },
  { kind: "text", key: "marginBottom",  label: "Margin Bottom",  group: "layout", placeholder: "0" },
];

const BG_FIELDS: FieldDef[] = [
  { kind: "select", key: "bgType", label: "Background Type", group: "style",
    options: [
      { value: "none",     label: "None" },
      { value: "solid",    label: "Solid Color" },
      { value: "gradient", label: "Gradient" },
      { value: "image",    label: "Image" },
    ]
  },
  { kind: "color",  key: "backgroundColor",    label: "Background Color", group: "style" },
  { kind: "text",   key: "backgroundGradient", label: "Gradient CSS",     group: "style", placeholder: "linear-gradient(135deg,#fff,#eee)" },
  { kind: "image",  key: "backgroundImageUrl", label: "Background Image", group: "style" },
  { kind: "select", key: "backgroundSize",     label: "BG Size",          group: "style",
    options: [{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }] },
];

const BORDER_FIELDS: FieldDef[] = [
  { kind: "text",  key: "borderRadius", label: "Border Radius",  group: "style", placeholder: "0.5rem" },
  { kind: "text",  key: "borderWidth",  label: "Border Width",   group: "style", placeholder: "1px" },
  { kind: "color", key: "borderColor",  label: "Border Color",   group: "style" },
  { kind: "text",  key: "boxShadow",    label: "Box Shadow",     group: "style", placeholder: "0 2px 8px rgba(0,0,0,.12)" },
];

const ADVANCED_FIELDS: FieldDef[] = [
  { kind: "select", key: "visibility", label: "Visibility", group: "advanced",
    options: [
      { value: "ALWAYS",       label: "Always visible" },
      { value: "HIDDEN",       label: "Hidden" },
      { value: "LOGGED_IN",    label: "Logged-in users only" },
      { value: "LOGGED_OUT",   label: "Logged-out users only" },
      { value: "MEMBER_ONLY",  label: "Members only" },
      { value: "DESKTOP_ONLY", label: "Desktop only" },
      { value: "MOBILE_ONLY",  label: "Mobile only" },
    ]
  },
  { kind: "select", key: "animation", label: "Animation", group: "advanced",
    options: [
      { value: "",           label: "None" },
      { value: "fadeIn",     label: "Fade In" },
      { value: "slideUp",    label: "Slide Up" },
      { value: "slideLeft",  label: "Slide from Left" },
      { value: "slideRight", label: "Slide from Right" },
      { value: "zoomIn",     label: "Zoom In" },
      { value: "bounce",     label: "Bounce" },
    ]
  },
  { kind: "number", key: "animationDelay",    label: "Animation Delay (ms)",    group: "advanced", min: 0,   max: 5000, step: 50 },
  { kind: "number", key: "animationDuration", label: "Animation Duration (ms)", group: "advanced", min: 100, max: 3000, step: 50 },
  { kind: "select", key: "animationTrigger",  label: "Animation Trigger",       group: "advanced",
    options: [
      { value: "scroll", label: "On scroll into view" },
      { value: "load",   label: "On page load" },
    ]
  },
  { kind: "text",   key: "cssClass", label: "Extra CSS Class",  group: "advanced" },
  { kind: "text",   key: "htmlId",   label: "HTML ID (anchor)", group: "advanced" },
  { kind: "text",   key: "inlineCss",label: "Inline CSS",       group: "advanced", placeholder: "color:red; font-size:1.2rem" },
  {
    kind: "items", key: "visibilityRules", label: "Visibility Rules", group: "advanced",
    itemSchema: [
      { kind: "select", key: "type", label: "Rule Type", group: "advanced",
        options: [
          { value: "auth",       label: "Authentication" },
          { value: "dateRange",  label: "Date Range" },
          { value: "device",     label: "Device Type" },
        ],
      },
      // auth rule
      { kind: "select", key: "level", label: "Auth Level", group: "advanced",
        options: [
          { value: "loggedIn",   label: "Logged In (any)" },
          { value: "loggedOut",  label: "Logged Out" },
          { value: "member",     label: "Member" },
          { value: "editor",     label: "Editor" },
          { value: "publisher",  label: "Publisher" },
          { value: "admin",      label: "Admin" },
        ],
      },
      // dateRange rule
      { kind: "text", key: "start", label: "Start Date (YYYY-MM-DD)", group: "advanced", placeholder: "2026-01-01" },
      { kind: "text", key: "end",   label: "End Date (YYYY-MM-DD)",   group: "advanced", placeholder: "2026-12-31" },
      // device rule
      { kind: "select", key: "device", label: "Device", group: "advanced",
        options: [
          { value: "mobile",  label: "Mobile (< 768px)" },
          { value: "tablet",  label: "Tablet (768–1024px)" },
          { value: "desktop", label: "Desktop (> 1024px)" },
        ],
      },
    ] as FieldDef[],
  },
];

const TEXT_COLOR_FIELD: FieldDef =
  { kind: "color", key: "textColor", label: "Text Color", group: "style" };

const TEXT_ALIGN_FIELD: FieldDef =
  { kind: "select", key: "textAlign", label: "Text Align", group: "layout",
    options: [{ value: "", label: "Default" }, { value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] };

const MAX_WIDTH_FIELD: FieldDef =
  { kind: "text", key: "maxWidth", label: "Max Width", group: "layout", placeholder: "max-w-6xl" };

// ─── Bilingual content field factory ─────────────────────────────────────────

function bilingual(
  keyEn: string, labelEn: string,
  keyAr: string, labelAr: string,
  kind: "text" | "textarea" | "richtext" = "text",
  rows?: number
): FieldDef[] {
  if (kind === "richtext") {
    return [
      { kind: "richtext", key: keyEn, label: labelEn, group: "content" } as RichTextField,
      { kind: "richtext", key: keyAr, label: labelAr, group: "content" } as RichTextField,
    ];
  }
  if (kind === "textarea") {
    return [
      { kind: "textarea", key: keyEn, label: labelEn, group: "content", rows: rows ?? 3 } as TextareaField,
      { kind: "textarea", key: keyAr, label: labelAr, group: "content", rows: rows ?? 3, dir: "rtl" } as TextareaField,
    ];
  }
  return [
    { kind: "text", key: keyEn, label: labelEn, group: "content" } as TextField,
    { kind: "text", key: keyAr, label: labelAr, group: "content", dir: "rtl" } as TextField,
  ];
}

// ─── BLOCK_SCHEMA registry ────────────────────────────────────────────────────

export const BLOCK_SCHEMA: Record<string, BlockSchema> = {

  // ─── Layout containers ────────────────────────────────────────────────────

  section: {
    label: "Section", icon: "⊡", category: "layout", isContainer: true,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "عنوان القسم (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)"),
      MAX_WIDTH_FIELD,
      TEXT_ALIGN_FIELD,
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      TEXT_COLOR_FIELD,
      ...BORDER_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  row: {
    label: "Row", icon: "⇔", category: "layout", isContainer: true,
    fields: [
      { kind: "text",   key: "gap",     label: "Column Gap", group: "layout", placeholder: "1.5rem" },
      { kind: "select", key: "wrap",    label: "Wrap",       group: "layout",
        options: [{ value: "wrap", label: "Wrap" }, { value: "nowrap", label: "No Wrap" }] },
      { kind: "select", key: "align",   label: "Align Items",group: "layout",
        options: [{ value: "stretch", label: "Stretch" }, { value: "start", label: "Top" }, { value: "center", label: "Center" }, { value: "end", label: "Bottom" }] },
      { kind: "select", key: "justify", label: "Justify",    group: "layout",
        options: [{ value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }, { value: "space-between", label: "Space Between" }, { value: "space-around", label: "Space Around" }] },
      MAX_WIDTH_FIELD,
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  column: {
    label: "Column", icon: "▯", category: "layout", isContainer: true,
    fields: [
      { kind: "text",   key: "width",   label: "Width (flex basis)",     group: "layout", placeholder: "1/3 or 300px or 33%" },
      { kind: "number", key: "flexGrow",label: "Flex Grow",              group: "layout", min: 0, max: 10 },
      TEXT_ALIGN_FIELD,
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      TEXT_COLOR_FIELD,
      ...BORDER_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  grid: {
    label: "Grid", icon: "⊟", category: "layout", isContainer: true,
    fields: [
      { kind: "number", key: "columns",       label: "Columns",          group: "layout", min: 1, max: 12 },
      { kind: "number", key: "columnsMobile", label: "Columns (mobile)", group: "layout", min: 1, max: 4 },
      { kind: "text",   key: "gap",           label: "Gap",              group: "layout", placeholder: "1.5rem" },
      MAX_WIDTH_FIELD,
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  flexbox: {
    label: "Flexbox", icon: "⤧", category: "layout", isContainer: true,
    fields: [
      { kind: "select", key: "direction", label: "Direction", group: "layout",
        options: [{ value: "row", label: "Row (horizontal)" }, { value: "column", label: "Column (vertical)" }] },
      { kind: "select", key: "wrap",      label: "Wrap",      group: "layout",
        options: [{ value: "wrap", label: "Wrap" }, { value: "nowrap", label: "No Wrap" }] },
      { kind: "select", key: "justify",   label: "Justify",   group: "layout",
        options: [{ value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }, { value: "space-between", label: "Space Between" }] },
      { kind: "select", key: "align",     label: "Align",     group: "layout",
        options: [{ value: "stretch", label: "Stretch" }, { value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }] },
      { kind: "text",   key: "gap",       label: "Gap",       group: "layout", placeholder: "1rem" },
      MAX_WIDTH_FIELD,
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  // ─── Content leaf blocks ──────────────────────────────────────────────────

  heading: {
    label: "Heading", icon: "H", category: "content", isContainer: false,
    fields: [
      ...bilingual("text", "Heading Text (EN)", "textAr", "نص العنوان (AR)"),
      { kind: "select", key: "level", label: "Tag Level", group: "content",
        options: [1,2,3,4,5,6].map(n => ({ value: String(n), label: `H${n}` })) },
      { kind: "text",   key: "fontSize",   label: "Font Size",   group: "style",  placeholder: "2.25rem" },
      { kind: "select", key: "fontWeight", label: "Font Weight", group: "style",
        options: [{ value: "normal", label: "Normal" }, { value: "medium", label: "Medium" }, { value: "semibold", label: "Semi Bold" }, { value: "bold", label: "Bold" }, { value: "extrabold", label: "Extra Bold" }] },
      TEXT_COLOR_FIELD,
      TEXT_ALIGN_FIELD,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  paragraph: {
    label: "Paragraph", icon: "¶", category: "content", isContainer: false,
    fields: [
      ...bilingual("text", "Text (EN)", "textAr", "النص (AR)", "textarea", 4),
      { kind: "text",   key: "fontSize",   label: "Font Size",   group: "style",  placeholder: "1rem" },
      TEXT_COLOR_FIELD,
      TEXT_ALIGN_FIELD,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "rich-text": {
    label: "Rich Text", icon: "R", category: "content", isContainer: false,
    fields: [
      ...bilingual("html", "Content (EN)", "htmlAr", "المحتوى (AR)", "richtext"),
      TEXT_COLOR_FIELD,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  image: {
    label: "Image", icon: "🖼", category: "content", isContainer: false,
    fields: [
      { kind: "image",  key: "src",       label: "Image URL",     group: "content" },
      { kind: "text",   key: "alt",       label: "Alt Text",       group: "content" },
      { kind: "text",   key: "caption",   label: "Caption",        group: "content" },
      { kind: "text",   key: "link",      label: "Link URL",       group: "content" },
      { kind: "text",   key: "maxHeight", label: "Max Height",     group: "layout", placeholder: "500px" },
      { kind: "select", key: "objectFit", label: "Object Fit",     group: "layout",
        options: [{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "fill", label: "Fill" }] },
      TEXT_ALIGN_FIELD,
      ...BORDER_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  video: {
    label: "Video", icon: "▶", category: "content", isContainer: false,
    fields: [
      { kind: "url",    key: "src",   label: "Embed URL (YouTube / Vimeo)", group: "content" },
      ...bilingual("caption", "Caption (EN)", "captionAr", "التسمية (AR)"),
      MAX_WIDTH_FIELD,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  button: {
    label: "Button", icon: "▣", category: "content", isContainer: false,
    fields: [
      ...bilingual("label", "Button Label (EN)", "labelAr", "نص الزر (AR)"),
      { kind: "url",    key: "href",   label: "Button URL",    group: "content" },
      { kind: "select", key: "target", label: "Open in",       group: "content",
        options: [{ value: "_self", label: "Same tab" }, { value: "_blank", label: "New tab" }] },
      { kind: "select", key: "variant",label: "Variant",       group: "style",
        options: [{ value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }, { value: "outline", label: "Outline" }, { value: "ghost", label: "Ghost" }] },
      { kind: "color",  key: "bgColor",    label: "Background Color", group: "style" },
      { kind: "color",  key: "textColor",  label: "Text Color",       group: "style" },
      { kind: "text",   key: "borderRadius",label: "Border Radius",   group: "style", placeholder: "0.5rem" },
      TEXT_ALIGN_FIELD,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  divider: {
    label: "Divider", icon: "—", category: "content", isContainer: false,
    fields: [
      { kind: "text",   key: "style",      label: "Line Style Class",   group: "style", placeholder: "border-gray-300" },
      { kind: "color",  key: "lineColor",  label: "Line Color",         group: "style" },
      { kind: "text",   key: "thickness",  label: "Thickness",          group: "style", placeholder: "1px" },
      { kind: "text",   key: "width",      label: "Width",              group: "layout", placeholder: "100%" },
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  spacer: {
    label: "Spacer", icon: "⤢", category: "content", isContainer: false,
    fields: [
      { kind: "text", key: "height", label: "Height", group: "layout", placeholder: "2rem" },
      ...ADVANCED_FIELDS,
    ],
  },

  blockquote: {
    label: "Blockquote", icon: "❝", category: "content", isContainer: false,
    fields: [
      ...bilingual("text", "Quote Text (EN)", "textAr", "نص الاقتباس (AR)", "textarea", 3),
      ...bilingual("attribution", "Attribution (EN)", "attributionAr", "المصدر (AR)"),
      { kind: "color", key: "accentColor", label: "Accent / Border Color", group: "style" },
      TEXT_COLOR_FIELD,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  alert: {
    label: "Alert", icon: "⚠", category: "content", isContainer: false,
    fields: [
      ...bilingual("title", "Alert Title (EN)", "titleAr", "عنوان التنبيه (AR)"),
      ...bilingual("message", "Message (EN)", "messageAr", "الرسالة (AR)", "textarea", 2),
      { kind: "select", key: "variant", label: "Variant", group: "content",
        options: [{ value: "info", label: "Info" }, { value: "success", label: "Success" }, { value: "warning", label: "Warning" }, { value: "error", label: "Error" }] },
      MAX_WIDTH_FIELD,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  banner: {
    label: "Banner", icon: "▭", category: "content", isContainer: false,
    fields: [
      ...bilingual("title", "Heading (EN)",     "titleAr", "العنوان (AR)"),
      ...bilingual("text",  "Body Text (EN)",   "textAr",  "نص المحتوى (AR)", "textarea", 2),
      ...bilingual("buttonLabel", "Button Label (EN)", "buttonLabelAr", "نص الزر (AR)"),
      { kind: "url",   key: "buttonUrl",       label: "Button URL",        group: "content" },
      { kind: "image", key: "backgroundImage", label: "Background Image",  group: "style" },
      TEXT_ALIGN_FIELD,
      ...SPACING_FIELDS,
      TEXT_COLOR_FIELD,
      ...ADVANCED_FIELDS,
    ],
  },

  hero: {
    label: "Hero", icon: "🎯", category: "content", isContainer: false,
    fields: [
      ...bilingual("title",    "Hero Title (EN)",      "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)",        "subtitleAr", "العنوان الفرعي (AR)", "textarea", 2),
      ...bilingual("buttonLabel", "Button Label (EN)", "buttonLabelAr", "نص الزر (AR)"),
      { kind: "url",   key: "buttonUrl",       label: "Button URL",        group: "content" },
      { kind: "image", key: "backgroundImage", label: "Background Image",  group: "style" },
      { kind: "text",  key: "overlayColor",    label: "Overlay Color",     group: "style",  placeholder: "rgba(0,0,0,0.4)" },
      { kind: "text",  key: "minHeight",       label: "Min Height",        group: "layout", placeholder: "500px" },
      TEXT_ALIGN_FIELD,
      MAX_WIDTH_FIELD,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  cta: {
    label: "CTA", icon: "🚀", category: "content", isContainer: false,
    fields: [
      ...bilingual("title",  "Heading (EN)",      "titleAr",  "العنوان (AR)"),
      ...bilingual("text",   "Description (EN)",  "textAr",   "الوصف (AR)", "textarea", 2),
      ...bilingual("buttonLabel", "Button (EN)",  "buttonLabelAr", "نص الزر (AR)"),
      { kind: "url", key: "buttonUrl", label: "Button URL", group: "content" },
      TEXT_ALIGN_FIELD,
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      TEXT_COLOR_FIELD,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  card: {
    label: "Card", icon: "▨", category: "content", isContainer: false,
    fields: [
      { kind: "image",    key: "image",       label: "Cover Image",    group: "content" },
      { kind: "text",     key: "imageAlt",    label: "Image Alt",      group: "content" },
      ...bilingual("title",    "Card Title (EN)",      "titleAr",    "عنوان البطاقة (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)",        "subtitleAr", "العنوان الفرعي (AR)"),
      ...bilingual("text",     "Body Text (EN)",       "textAr",     "نص المحتوى (AR)", "textarea", 3),
      ...bilingual("buttonLabel", "Button Label (EN)", "buttonLabelAr", "نص الزر (AR)"),
      { kind: "url",   key: "buttonUrl", label: "Button URL",    group: "content" },
      { kind: "text",  key: "badge",     label: "Badge / Tag",   group: "content" },
      { kind: "text",  key: "icon",      label: "Icon (emoji)",  group: "content" },
      ...BG_FIELDS,
      TEXT_COLOR_FIELD,
      ...BORDER_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  // ─── Interactive / repeating-items blocks ─────────────────────────────────

  "card-group": {
    label: "Card Group", icon: "▣", category: "interactive", isContainer: true,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "عنوان القسم (AR)"),
      { kind: "number", key: "columns",       label: "Columns (desktop)", group: "layout", min: 1, max: 6 },
      { kind: "number", key: "columnsMobile", label: "Columns (mobile)",  group: "layout", min: 1, max: 3 },
      { kind: "text",   key: "gap",           label: "Gap",               group: "layout", placeholder: "1.5rem" },
      MAX_WIDTH_FIELD,
      TEXT_ALIGN_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  stats: {
    label: "Stats", icon: "📊", category: "interactive", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "عنوان القسم (AR)"),
      { kind: "number", key: "columns", label: "Columns", group: "layout", min: 2, max: 6 },
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      TEXT_COLOR_FIELD,
      ...SPACING_FIELDS,
      {
        kind: "items", key: "items", label: "Stat Items", group: "content",
        itemSchema: [
          { kind: "text", key: "value",   label: "Value (e.g. 1,200+)", group: "content" },
          { kind: "text", key: "label",   label: "Label (EN)",          group: "content" },
          { kind: "text", key: "labelAr", label: "التسمية (AR)",        group: "content", dir: "rtl" },
          { kind: "text", key: "icon",    label: "Icon (emoji)",         group: "content" },
        ] as FieldDef[],
      },
      ...ADVANCED_FIELDS,
    ],
  },

  testimonial: {
    label: "Testimonials", icon: "❝", category: "interactive", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      {
        kind: "items", key: "items", label: "Testimonials", group: "content",
        itemSchema: [
          { kind: "textarea", key: "quote",   label: "Quote (EN)",    group: "content", rows: 3 },
          { kind: "textarea", key: "quoteAr", label: "الاقتباس (AR)", group: "content", rows: 3, dir: "rtl" },
          { kind: "text",     key: "name",    label: "Author Name",   group: "content" },
          { kind: "text",     key: "role",    label: "Role / Company",group: "content" },
          { kind: "image",    key: "avatar",  label: "Avatar URL",    group: "content" },
        ] as FieldDef[],
      },
      ...ADVANCED_FIELDS,
    ],
  },

  team: {
    label: "Team", icon: "👥", category: "interactive", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      { kind: "number", key: "columns", label: "Columns", group: "layout", min: 2, max: 6 },
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      {
        kind: "items", key: "items", label: "Team Members", group: "content",
        itemSchema: [
          { kind: "image",    key: "avatar", label: "Photo URL",             group: "content" },
          { kind: "text",     key: "name",   label: "Name (EN)",             group: "content" },
          { kind: "text",     key: "nameAr", label: "الاسم (AR)",            group: "content", dir: "rtl" },
          { kind: "text",     key: "role",   label: "Role / Title (EN)",     group: "content" },
          { kind: "text",     key: "roleAr", label: "الدور / اللقب (AR)",   group: "content", dir: "rtl" },
          { kind: "textarea", key: "bio",    label: "Bio (EN)",              group: "content", rows: 2 },
          { kind: "textarea", key: "bioAr",  label: "السيرة الذاتية (AR)",  group: "content", rows: 2, dir: "rtl" },
          { kind: "url",      key: "linkedin",label: "LinkedIn URL",         group: "content" },
        ] as FieldDef[],
      },
      ...ADVANCED_FIELDS,
    ],
  },

  accordion: {
    label: "Accordion", icon: "≡", category: "interactive", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      {
        kind: "items", key: "items", label: "Accordion Panels", group: "content",
        itemSchema: [
          { kind: "text",     key: "title",     label: "Heading (EN)",  group: "content" },
          { kind: "text",     key: "titleAr",   label: "العنوان (AR)", group: "content", dir: "rtl" },
          { kind: "textarea", key: "content",   label: "Body (EN)",     group: "content", rows: 3 },
          { kind: "textarea", key: "contentAr", label: "المحتوى (AR)", group: "content", rows: 3, dir: "rtl" },
        ] as FieldDef[],
      },
      ...ADVANCED_FIELDS,
    ],
  },

  faq: {
    label: "FAQ", icon: "?", category: "interactive", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      {
        kind: "items", key: "items", label: "FAQ Items", group: "content",
        itemSchema: [
          { kind: "text",     key: "question",   label: "Question (EN)",    group: "content" },
          { kind: "text",     key: "questionAr", label: "السؤال (AR)",      group: "content", dir: "rtl" },
          { kind: "textarea", key: "answer",     label: "Answer (EN)",      group: "content", rows: 3 },
          { kind: "textarea", key: "answerAr",   label: "الإجابة (AR)",    group: "content", rows: 3, dir: "rtl" },
        ] as FieldDef[],
      },
      ...ADVANCED_FIELDS,
    ],
  },

  tabs: {
    label: "Tabs", icon: "▦", category: "interactive", isContainer: true,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  timeline: {
    label: "Timeline", icon: "↕", category: "interactive", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      {
        kind: "items", key: "items", label: "Timeline Events", group: "content",
        itemSchema: [
          { kind: "text",     key: "date",      label: "Date / Year",      group: "content" },
          { kind: "text",     key: "title",     label: "Event Title (EN)", group: "content" },
          { kind: "text",     key: "titleAr",   label: "العنوان (AR)",     group: "content", dir: "rtl" },
          { kind: "textarea", key: "content",   label: "Description (EN)", group: "content", rows: 2 },
          { kind: "textarea", key: "contentAr", label: "الوصف (AR)",       group: "content", rows: 2, dir: "rtl" },
        ] as FieldDef[],
      },
      ...ADVANCED_FIELDS,
    ],
  },

  "pricing-table": {
    label: "Pricing", icon: "$", category: "interactive", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      {
        kind: "items", key: "items", label: "Pricing Plans", group: "content",
        itemSchema: [
          { kind: "text",     key: "name",        label: "Plan Name",    group: "content" },
          { kind: "text",     key: "price",       label: "Price",        group: "content" },
          { kind: "text",     key: "period",      label: "Period",       group: "content", },
          { kind: "textarea", key: "description", label: "Description",  group: "content", rows: 2 },
          { kind: "text",     key: "cta",         label: "CTA Button",   group: "content" },
          { kind: "url",      key: "url",         label: "CTA URL",      group: "content" },
          { kind: "toggle",   key: "featured",    label: "Featured?",    group: "content" },
        ] as FieldDef[],
      },
      ...ADVANCED_FIELDS,
    ],
  },

  gallery: {
    label: "Gallery", icon: "📷", category: "media", isContainer: false,
    fields: [
      ...bilingual("title", "Gallery Title (EN)", "titleAr", "عنوان المعرض (AR)"),
      { kind: "number", key: "columns",       label: "Columns (desktop)", group: "layout", min: 2, max: 6 },
      { kind: "number", key: "columnsMobile", label: "Columns (mobile)",  group: "layout", min: 1, max: 3 },
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      {
        kind: "items", key: "items", label: "Images", group: "content",
        itemSchema: [
          { kind: "image", key: "src",     label: "Image URL",  group: "content" },
          { kind: "text",  key: "alt",     label: "Alt Text",   group: "content" },
          { kind: "text",  key: "caption", label: "Caption",    group: "content" },
        ] as FieldDef[],
      },
      ...ADVANCED_FIELDS,
    ],
  },

  carousel: {
    label: "Carousel", icon: "⇄", category: "media", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      {
        kind: "items", key: "items", label: "Slides", group: "content",
        itemSchema: [
          { kind: "image",    key: "src",     label: "Slide Image",  group: "content" },
          { kind: "text",     key: "title",   label: "Slide Title",  group: "content" },
          { kind: "textarea", key: "content", label: "Slide Body",   group: "content", rows: 2 },
          { kind: "url",      key: "url",     label: "Slide Link",   group: "content" },
        ] as FieldDef[],
      },
      ...ADVANCED_FIELDS,
    ],
  },

  // ─── Dynamic blocks (no editable content — data comes from DB) ───────────

  "news-feed": {
    label: "News Feed", icon: "📰", category: "dynamic", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      { kind: "number", key: "limit",   label: "Max Items",          group: "content", min: 1, max: 20 },
      { kind: "number", key: "columns", label: "Columns",            group: "layout",  min: 1, max: 4 },
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "events-feed": {
    label: "Events Feed", icon: "📅", category: "dynamic", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      { kind: "number", key: "limit",   label: "Max Items", group: "content", min: 1, max: 20 },
      { kind: "number", key: "columns", label: "Columns",   group: "layout",  min: 1, max: 4 },
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "contact-form": {
    label: "Contact Form", icon: "✉", category: "dynamic", isContainer: false,
    fields: [
      ...bilingual("title", "Form Heading (EN)", "titleAr", "العنوان (AR)"),
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "newsletter-form": {
    label: "Newsletter Form", icon: "📧", category: "dynamic", isContainer: false,
    fields: [
      ...bilingual("title",  "Heading (EN)",     "titleAr",  "العنوان (AR)"),
      ...bilingual("text",   "Body Text (EN)",   "textAr",   "النص (AR)", "textarea", 2),
      ...bilingual("buttonLabel", "Button (EN)", "buttonLabelAr", "نص الزر (AR)"),
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  map: {
    label: "Map", icon: "📍", category: "interactive", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      { kind: "url",  key: "embedUrl", label: "Google Maps Embed URL", group: "content" },
      { kind: "text", key: "address",  label: "Address (fallback)",    group: "content" },
      MAX_WIDTH_FIELD,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  progress: {
    label: "Progress Bars", icon: "▤", category: "interactive", isContainer: false,
    fields: [
      ...bilingual("title", "Section Title (EN)", "titleAr", "العنوان (AR)"),
      MAX_WIDTH_FIELD,
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      {
        kind: "items", key: "items", label: "Progress Bars", group: "content",
        itemSchema: [
          { kind: "text",   key: "label", label: "Skill / Label", group: "content" },
          { kind: "number", key: "value", label: "Percentage (0-100)", group: "content", min: 0, max: 100 },
          { kind: "color",  key: "color", label: "Bar Color",   group: "style" },
        ] as FieldDef[],
      },
      ...ADVANCED_FIELDS,
    ],
  },

  // ─── Legacy / custom section types (full field definitions) ─────────────────

  "about-hero-banner": {
    label: "About Hero Banner", icon: "🖼", category: "content", isContainer: true,
    fields: [
      ...bilingual("title",    "Title (EN)",       "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)",    "subtitleAr", "العنوان الفرعي (AR)", "textarea"),
      { kind: "image",  key: "backgroundImage",  label: "Background Image",    group: "style" },
      { kind: "color",  key: "overlayColor",      label: "Overlay Color",       group: "style" },
      { kind: "text",   key: "minHeight",          label: "Min Height",          group: "layout", placeholder: "500px" },
      ...bilingual("primaryButtonLabel",   "Primary Button Label (EN)",   "primaryButtonLabelAr",   "نص الزر الأول (AR)"),
      { kind: "url",    key: "primaryButtonUrl",   label: "Primary Button URL",   group: "content" },
      ...bilingual("secondaryButtonLabel", "Secondary Button Label (EN)", "secondaryButtonLabelAr", "نص الزر الثاني (AR)"),
      { kind: "url",    key: "secondaryButtonUrl", label: "Secondary Button URL", group: "content" },
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "about-overview-section": {
    label: "About Overview", icon: "ℹ", category: "content", isContainer: true,
    fields: [
      ...bilingual("heading", "Heading (EN)", "headingAr", "العنوان (AR)"),
      {
        kind: "items", key: "paragraphs", label: "Paragraphs", group: "content",
        itemSchema: [
          { kind: "textarea", key: "textEn", label: "Paragraph (EN)", group: "content", rows: 4 },
          { kind: "textarea", key: "textAr", label: "الفقرة (AR)",     group: "content", rows: 4, dir: "rtl" },
        ] as FieldDef[],
      },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "about-vision-mission-section": {
    label: "Vision / Mission", icon: "🎯", category: "interactive", isContainer: true,
    fields: [
      ...bilingual("heading",    "Section Heading (EN)",    "headingAr",    "عنوان القسم (AR)"),
      ...bilingual("subheading", "Section Subheading (EN)", "subheadingAr", "العنوان الفرعي (AR)", "textarea"),
      {
        kind: "items", key: "panels", label: "Panels", group: "content",
        itemSchema: [
          { kind: "text",     key: "icon",            label: "Icon (emoji or Lucide name)",  group: "content" },
          { kind: "text",     key: "titleEn",         label: "Panel Title (EN)",             group: "content" },
          { kind: "text",     key: "titleAr",         label: "عنوان اللوحة (AR)",           group: "content", dir: "rtl" },
          { kind: "textarea", key: "contentEn",       label: "Panel Content (EN)",           group: "content", rows: 4 },
          { kind: "textarea", key: "contentAr",       label: "محتوى اللوحة (AR)",           group: "content", rows: 4, dir: "rtl" },
          { kind: "text",     key: "gradientClass",   label: "Gradient CSS Class",           group: "style",   placeholder: "from-green-600 to-green-400" },
          { kind: "text",     key: "buttonLabelEn",   label: "Button Label (EN)",            group: "content" },
          { kind: "text",     key: "buttonLabelAr",   label: "نص الزر (AR)",                group: "content", dir: "rtl" },
          { kind: "url",      key: "buttonUrl",       label: "Button URL",                   group: "content" },
        ] as FieldDef[],
      },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "about-organizational-chart-section": {
    label: "Org Chart", icon: "🔷", category: "content", isContainer: true,
    fields: [
      ...bilingual("heading", "Heading (EN)", "headingAr", "العنوان (AR)"),
      {
        kind: "items", key: "paragraphs", label: "Paragraphs", group: "content",
        itemSchema: [
          { kind: "textarea", key: "textEn", label: "Paragraph (EN)", group: "content", rows: 3 },
          { kind: "textarea", key: "textAr", label: "الفقرة (AR)",     group: "content", rows: 3, dir: "rtl" },
        ] as FieldDef[],
      },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "about-timeline-section": {
    label: "About Timeline", icon: "📅", category: "content", isContainer: true,
    fields: [
      ...bilingual("heading",    "Heading (EN)",    "headingAr",    "العنوان (AR)"),
      ...bilingual("subheading", "Subheading (EN)", "subheadingAr", "العنوان الفرعي (AR)"),
      {
        kind: "items", key: "items", label: "Timeline Items", group: "content",
        itemSchema: [
          { kind: "text",     key: "year",    label: "Year",            group: "content" },
          { kind: "text",     key: "titleEn", label: "Title (EN)",      group: "content" },
          { kind: "text",     key: "titleAr", label: "العنوان (AR)",    group: "content", dir: "rtl" },
          { kind: "textarea", key: "descEn",  label: "Description (EN)",group: "content", rows: 3 },
          { kind: "textarea", key: "descAr",  label: "الوصف (AR)",      group: "content", rows: 3, dir: "rtl" },
        ] as FieldDef[],
      },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "about-documents-section": {
    label: "About Documents", icon: "📄", category: "content", isContainer: true,
    fields: [
      ...bilingual("heading", "Heading (EN)", "headingAr", "العنوان (AR)"),
      {
        kind: "items", key: "documents", label: "Documents", group: "content",
        itemSchema: [
          { kind: "text", key: "labelEn",  label: "Label (EN)",   group: "content" },
          { kind: "text", key: "labelAr",  label: "التسمية (AR)", group: "content", dir: "rtl" },
          { kind: "url",  key: "url",      label: "Document URL", group: "content" },
          { kind: "text", key: "fileType", label: "File Type (e.g. PDF)", group: "content", placeholder: "PDF" },
        ] as FieldDef[],
      },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "about-gallery-section": {
    label: "About Gallery", icon: "🖼", category: "media", isContainer: true,
    fields: [
      ...bilingual("heading",    "Heading (EN)",    "headingAr",    "العنوان (AR)"),
      ...bilingual("subheading", "Subheading (EN)", "subheadingAr", "العنوان الفرعي (AR)"),
      {
        kind: "items", key: "images", label: "Images", group: "content",
        itemSchema: [
          { kind: "image", key: "src",     label: "Image URL",  group: "content" },
          { kind: "text",  key: "alt",     label: "Alt Text",   group: "content" },
          { kind: "text",  key: "caption", label: "Caption",    group: "content" },
        ] as FieldDef[],
      },
      { kind: "number", key: "columns",       label: "Columns (desktop)", group: "layout", min: 1, max: 6 },
      { kind: "number", key: "columnsMobile", label: "Columns (mobile)",  group: "layout", min: 1, max: 3 },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "board-hero-banner": {
    label: "Board Hero Banner", icon: "🏛", category: "content", isContainer: true,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)", "textarea"),
      { kind: "image", key: "backgroundImage",  label: "Background Image",    group: "style" },
      { kind: "color", key: "overlayColor",      label: "Overlay Color",       group: "style" },
      { kind: "text",  key: "minHeight",          label: "Min Height",          group: "layout", placeholder: "500px" },
      ...bilingual("primaryButtonLabel",   "Primary Button Label (EN)",   "primaryButtonLabelAr",   "نص الزر الأول (AR)"),
      { kind: "url",   key: "primaryButtonUrl",   label: "Primary Button URL",   group: "content" },
      ...bilingual("secondaryButtonLabel", "Secondary Button Label (EN)", "secondaryButtonLabelAr", "نص الزر الثاني (AR)"),
      { kind: "url",   key: "secondaryButtonUrl", label: "Secondary Button URL", group: "content" },
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "board-members-intro-grid": {
    label: "Board Members Intro Grid", icon: "👥", category: "content", isContainer: true,
    fields: [
      ...bilingual("heading",    "Heading (EN)",    "headingAr",    "العنوان (AR)"),
      ...bilingual("subheading", "Subheading (EN)", "subheadingAr", "العنوان الفرعي (AR)"),
      ...bilingual("introText",  "Intro Text (EN)", "introTextAr",  "النص التمهيدي (AR)", "textarea"),
      { kind: "number", key: "columns", label: "Columns", group: "layout", min: 1, max: 6 },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "board-members-grid": {
    label: "Board Members Grid", icon: "🏆", category: "content", isContainer: true,
    fields: [
      ...bilingual("heading", "Heading (EN)", "headingAr", "العنوان (AR)"),
      { kind: "toggle", key: "showAllMembers", label: "Show All Members (from DB)", group: "content" },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "board-term-information-section": {
    label: "Board Term Information", icon: "📋", category: "content", isContainer: true,
    fields: [
      ...bilingual("heading", "Heading (EN)", "headingAr", "العنوان (AR)"),
      {
        kind: "items", key: "paragraphs", label: "Term Info Paragraphs", group: "content",
        itemSchema: [
          { kind: "textarea", key: "textEn", label: "Paragraph (EN)", group: "content", rows: 3 },
          { kind: "textarea", key: "textAr", label: "الفقرة (AR)",     group: "content", rows: 3, dir: "rtl" },
        ] as FieldDef[],
      },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "contact-hero-banner": {
    label: "Contact Hero Banner", icon: "✉", category: "content", isContainer: true,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)", "textarea"),
      { kind: "image", key: "backgroundImage", label: "Background Image", group: "style" },
      { kind: "color", key: "overlayColor",    label: "Overlay Color",    group: "style" },
      { kind: "text",  key: "minHeight",        label: "Min Height",       group: "layout", placeholder: "400px" },
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "contact-form-section": {
    label: "Contact Form Section", icon: "📋", category: "dynamic", isContainer: true,
    fields: [
      ...bilingual("heading", "Heading (EN)", "headingAr", "العنوان (AR)"),
      { kind: "toggle", key: "showPhone",   label: "Show Phone Field",   group: "content" },
      { kind: "toggle", key: "showSubject", label: "Show Subject Field", group: "content" },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "newsletter-hero-banner": {
    label: "Newsletter Hero Banner", icon: "📧", category: "content", isContainer: true,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)", "textarea"),
      { kind: "image", key: "backgroundImage", label: "Background Image", group: "style" },
      { kind: "color", key: "overlayColor",    label: "Overlay Color",    group: "style" },
      { kind: "text",  key: "minHeight",        label: "Min Height",       group: "layout", placeholder: "400px" },
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "president-message-hero-banner": {
    label: "President Hero Banner", icon: "👤", category: "content", isContainer: true,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)", "textarea"),
      { kind: "image", key: "backgroundImage", label: "Background Image", group: "style" },
      { kind: "color", key: "overlayColor",    label: "Overlay Color",    group: "style" },
      { kind: "text",  key: "minHeight",        label: "Min Height",       group: "layout", placeholder: "400px" },
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "president-message-content-section": {
    label: "President Message Content", icon: "📝", category: "content", isContainer: true,
    fields: [
      ...bilingual("heading", "Heading (EN)", "headingAr", "العنوان (AR)"),
      {
        kind: "items", key: "paragraphs", label: "Body Paragraphs", group: "content",
        itemSchema: [
          { kind: "textarea", key: "textEn", label: "Paragraph (EN)", group: "content", rows: 4 },
          { kind: "textarea", key: "textAr", label: "الفقرة (AR)",     group: "content", rows: 4, dir: "rtl" },
        ] as FieldDef[],
      },
      { kind: "textarea", key: "quoteEn",        label: "Quote (EN)",            group: "content", rows: 3 },
      { kind: "textarea", key: "quoteAr",        label: "الاقتباس (AR)",         group: "content", rows: 3, dir: "rtl" },
      { kind: "text",     key: "quoteAuthor",    label: "Quote Author",          group: "content" },
      ...bilingual("presidentName",  "President Name (EN)",  "presidentNameAr",  "اسم الرئيس (AR)"),
      ...bilingual("presidentTitle", "President Title (EN)", "presidentTitleAr", "لقب الرئيس (AR)"),
      { kind: "image",    key: "photo",          label: "President Photo",       group: "content" },
      {
        kind: "items", key: "socialLinks", label: "Social Links", group: "content",
        itemSchema: [
          { kind: "select", key: "platform", label: "Platform", group: "content",
            options: [
              { value: "twitter",   label: "Twitter / X" },
              { value: "linkedin",  label: "LinkedIn" },
              { value: "facebook",  label: "Facebook" },
              { value: "instagram", label: "Instagram" },
              { value: "youtube",   label: "YouTube" },
              { value: "website",   label: "Website" },
            ],
          },
          { kind: "url", key: "url", label: "Profile URL", group: "content" },
        ] as FieldDef[],
      },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "publications-hero-banner": {
    label: "Publications Hero Banner", icon: "📚", category: "content", isContainer: true,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)", "textarea"),
      { kind: "image", key: "backgroundImage", label: "Background Image", group: "style" },
      { kind: "color", key: "overlayColor",    label: "Overlay Color",    group: "style" },
      { kind: "text",  key: "minHeight",        label: "Min Height",       group: "layout", placeholder: "400px" },
      ...SPACING_FIELDS,
      ...BG_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  // ─── Dynamic list sections (data fetched from DB) ─────────────────────────

  "news-list-section": {
    label: "News List", icon: "📰", category: "dynamic", isContainer: false,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)"),
      { kind: "number",  key: "maxItems",    label: "Max Items",         group: "content", min: 1, max: 20 },
      { kind: "toggle",  key: "showViewAll", label: "Show View All Link", group: "content" },
      { kind: "url",     key: "viewAllUrl",  label: "View All URL",       group: "content" },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "events-list-section": {
    label: "Events List", icon: "📅", category: "dynamic", isContainer: false,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)"),
      { kind: "number",  key: "maxItems",    label: "Max Items",         group: "content", min: 1, max: 20 },
      { kind: "toggle",  key: "showViewAll", label: "Show View All Link", group: "content" },
      { kind: "url",     key: "viewAllUrl",  label: "View All URL",       group: "content" },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "jobs-list-section": {
    label: "Jobs List", icon: "💼", category: "dynamic", isContainer: false,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)"),
      { kind: "number",  key: "maxItems",    label: "Max Items",         group: "content", min: 1, max: 20 },
      { kind: "toggle",  key: "showViewAll", label: "Show View All Link", group: "content" },
      { kind: "url",     key: "viewAllUrl",  label: "View All URL",       group: "content" },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "members-list-section": {
    label: "Members List", icon: "👥", category: "dynamic", isContainer: false,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)"),
      { kind: "number",  key: "maxItems",    label: "Max Items",         group: "content", min: 1, max: 20 },
      { kind: "toggle",  key: "showViewAll", label: "Show View All Link", group: "content" },
      { kind: "url",     key: "viewAllUrl",  label: "View All URL",       group: "content" },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "publications-list-section": {
    label: "Publications List", icon: "📚", category: "dynamic", isContainer: false,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)"),
      { kind: "number",  key: "maxItems",    label: "Max Items",         group: "content", min: 1, max: 20 },
      { kind: "toggle",  key: "showViewAll", label: "Show View All Link", group: "content" },
      { kind: "url",     key: "viewAllUrl",  label: "View All URL",       group: "content" },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "board-list-section": {
    label: "Board List", icon: "🏛", category: "dynamic", isContainer: false,
    fields: [
      ...bilingual("title",    "Title (EN)",    "titleAr",    "العنوان (AR)"),
      ...bilingual("subtitle", "Subtitle (EN)", "subtitleAr", "العنوان الفرعي (AR)"),
      { kind: "number",  key: "maxItems",    label: "Max Items",         group: "content", min: 1, max: 20 },
      { kind: "toggle",  key: "showViewAll", label: "Show View All Link", group: "content" },
      { kind: "url",     key: "viewAllUrl",  label: "View All URL",       group: "content" },
      ...BG_FIELDS,
      ...SPACING_FIELDS,
      ...ADVANCED_FIELDS,
    ],
  },

  "social-media-links-section": {
    label: "Social Media Links", icon: "🔗", category: "content", isContainer: false,
    fields: [...ADVANCED_FIELDS],
  },
};

/** Returns the schema for a block type, falling back to a minimal default */
export function getBlockSchema(type: string): BlockSchema {
  return BLOCK_SCHEMA[type] ?? {
    label: type, icon: "⬛", category: "content", isContainer: false,
    fields: [
      ...bilingual("title",   "Title (EN)",   "titleAr",   "العنوان (AR)"),
      ...bilingual("content", "Content (EN)", "contentAr", "المحتوى (AR)", "textarea", 4),
      ...ADVANCED_FIELDS,
    ],
  };
}
