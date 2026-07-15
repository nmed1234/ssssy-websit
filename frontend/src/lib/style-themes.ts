// ─────────────────────────────────────────────────────────────────────────────
// Style Theme Schema & 8 Built-in Presets
// Tokens are injected as --style-* CSS variables by StyleThemeProvider.
// Animation philosophy: purposeful restraint — no loops, no bounce, no excess.
// ─────────────────────────────────────────────────────────────────────────────

export interface StyleThemeTokens {
  // ── Identity ──────────────────────────────────────────────────────────────
  id:          string;
  name:        string;
  description: string;
  isBuiltin:   boolean;
  isProtected: boolean;  // true = cannot be deleted (Classic Soil)

  // ── Colors ────────────────────────────────────────────────────────────────
  colorPrimary:   string;  // main brand / heading color
  colorSecondary: string;  // CTA buttons, links
  colorAccent:    string;  // tags, dates, highlights
  colorBg:        string;  // page background
  colorSurface:   string;  // card / panel surface
  colorFg:        string;  // primary body text
  colorMuted:     string;  // secondary / subdued text
  colorBorder:    string;  // card borders, dividers

  // ── Gradients ─────────────────────────────────────────────────────────────
  gradientHeroStart: string;
  gradientHeroMid:   string;
  gradientHeroEnd:   string;
  gradientCardStart: string;
  gradientCardEnd:   string;

  // ── Radii ─────────────────────────────────────────────────────────────────
  radiusCard:  string;
  radiusBtn:   string;
  radiusInput: string;
  radiusBadge: string;

  // ── Shadows ───────────────────────────────────────────────────────────────
  shadowCard:      string;  // card at rest (2-stop: ambient + direct)
  shadowCardHover: string;  // card on hover (deeper)
  shadowFocus:     string;  // input / button focus ring

  // ── Blur ──────────────────────────────────────────────────────────────────
  blurCard:     string;   // backdrop-filter blur on cards ("0px" = flat)
  blurBackdrop: string;   // backdrop-filter blur on overlays / modals

  // ── Animations ────────────────────────────────────────────────────────────
  animDurationEnter: string;  // section / card entrance (scroll-triggered, once)
  animDurationHover: string;  // hover interactions
  animDurationSlow:  string;  // slow transitions (timeline draw, page flip)
  animEasing:        string;  // CSS cubic-bezier for all transitions

  // ── Component Modes ───────────────────────────────────────────────────────
  cardMode:       "flat" | "glass";
  btnShape:       "rounded" | "pill" | "sharp";
  heroPattern:    "particle" | "none";  // particle only for Classic Soil
  sectionDivider: "none" | "wave";

  // ── Typography ────────────────────────────────────────────────────────────
  fontWeightHeading:     string;
  fontWeightBody:        string;
  lineHeightBody:        string;
  letterSpacingHeading:  string;

  // ── Admin Preview ─────────────────────────────────────────────────────────
  previewSwatches: string[];  // 6 hex colors shown as swatch strip in admin
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme 0 — CLASSIC SOIL
// Exact snapshot of the original site. Always restorable. Cannot be deleted.
// ─────────────────────────────────────────────────────────────────────────────
export const CLASSIC_SOIL_THEME: StyleThemeTokens = {
  id: "classic-soil", name: "Classic Soil", isBuiltin: true, isProtected: true,
  description: "The original site design. Warm earthy soil palette, forest green accents, particle field hero. Always restorable from the admin panel.",
  colorPrimary:   "#3E2723", colorSecondary: "#2E7D32", colorAccent:    "#8D6E63",
  colorBg:        "#FFF8E1", colorSurface:   "#FFFFFF", colorFg:        "#1C1B1A",
  colorMuted:     "#6D4C41", colorBorder:    "rgba(188,170,164,0.40)",
  gradientHeroStart: "#3E2723", gradientHeroMid: "#4E342E", gradientHeroEnd: "#6D4C41",
  gradientCardStart: "#FFFFFF", gradientCardEnd: "#FAFAF8",
  radiusCard: "0.75rem", radiusBtn: "0.5rem", radiusInput: "0.375rem", radiusBadge: "999px",
  shadowCard:      "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
  shadowCardHover: "0 4px 16px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)",
  shadowFocus:     "0 0 0 3px rgba(62,39,35,0.20)",
  blurCard: "0px", blurBackdrop: "8px",
  animDurationEnter: "400ms", animDurationHover: "200ms", animDurationSlow: "600ms",
  animEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  cardMode: "flat", btnShape: "rounded", heroPattern: "particle", sectionDivider: "none",
  fontWeightHeading: "700", fontWeightBody: "400", lineHeightBody: "1.75", letterSpacingHeading: "-0.02em",
  previewSwatches: ["#3E2723", "#2E7D32", "#8D6E63", "#FFF8E1", "#6D4C41", "#BCAAA4"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Theme 1 — SOIL GLASS
// Soil palette elevated with frosted glass cards. Same warmth, more modern.
// ─────────────────────────────────────────────────────────────────────────────
export const SOIL_GLASS_THEME: StyleThemeTokens = {
  id: "soil-glass", name: "Soil Glass", isBuiltin: true, isProtected: false,
  description: "The soil palette elevated with frosted glass cards. Same warm earthy tones, more contemporary feel with subtle backdrop blur.",
  colorPrimary:   "#5D4037", colorSecondary: "#2E7D32", colorAccent:    "#8D6E63",
  colorBg:        "#FAF6F0", colorSurface:   "rgba(255,252,245,0.72)", colorFg: "#2C1810",
  colorMuted:     "#6D4C41", colorBorder:    "rgba(141,110,99,0.22)",
  gradientHeroStart: "#3E2723", gradientHeroMid: "#4E342E", gradientHeroEnd: "#6D4C41",
  gradientCardStart: "rgba(255,252,245,0.8)", gradientCardEnd: "rgba(250,246,240,0.5)",
  radiusCard: "1rem", radiusBtn: "0.625rem", radiusInput: "0.5rem", radiusBadge: "999px",
  shadowCard:      "0 2px 8px rgba(93,64,55,0.08), 0 8px 24px rgba(93,64,55,0.06)",
  shadowCardHover: "0 6px 20px rgba(93,64,55,0.14), 0 12px 32px rgba(93,64,55,0.10)",
  shadowFocus:     "0 0 0 3px rgba(93,64,55,0.22)",
  blurCard: "12px", blurBackdrop: "20px",
  animDurationEnter: "450ms", animDurationHover: "200ms", animDurationSlow: "650ms",
  animEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  cardMode: "glass", btnShape: "rounded", heroPattern: "particle", sectionDivider: "none",
  fontWeightHeading: "700", fontWeightBody: "400", lineHeightBody: "1.75", letterSpacingHeading: "-0.02em",
  previewSwatches: ["#5D4037", "#2E7D32", "#8D6E63", "#FAF6F0", "#6D4C41", "rgba(255,252,245,0.72)"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Theme 2 — ACADEMIC SERIF
// Oxford/MIT scholarly: navy authority, gold accents, generous whitespace.
// ─────────────────────────────────────────────────────────────────────────────
export const ACADEMIC_SERIF_THEME: StyleThemeTokens = {
  id: "academic-serif", name: "Academic Serif", isBuiltin: true, isProtected: false,
  description: "Scholarly design inspired by Oxford and MIT. Navy authority, gold accents, generous 1.8 line-height for comfortable reading of long-form content.",
  colorPrimary:   "#1A3A5C", colorSecondary: "#8B4513", colorAccent:    "#C5961A",
  colorBg:        "#FAFAF8", colorSurface:   "#FFFFFF", colorFg:        "#1A1A1A",
  colorMuted:     "#555550", colorBorder:    "rgba(26,58,92,0.15)",
  gradientHeroStart: "#1A3A5C", gradientHeroMid: "#1D4E7A", gradientHeroEnd: "#1A3A5C",
  gradientCardStart: "#FFFFFF", gradientCardEnd: "#F5F5F0",
  radiusCard: "0.5rem", radiusBtn: "0.375rem", radiusInput: "0.375rem", radiusBadge: "4px",
  shadowCard:      "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowCardHover: "0 4px 12px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)",
  shadowFocus:     "0 0 0 3px rgba(26,58,92,0.20)",
  blurCard: "0px", blurBackdrop: "8px",
  animDurationEnter: "500ms", animDurationHover: "200ms", animDurationSlow: "700ms",
  animEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  cardMode: "flat", btnShape: "rounded", heroPattern: "none", sectionDivider: "none",
  fontWeightHeading: "700", fontWeightBody: "400", lineHeightBody: "1.8", letterSpacingHeading: "0.01em",
  previewSwatches: ["#1A3A5C", "#8B4513", "#C5961A", "#FAFAF8", "#1A1A1A", "#555550"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Theme 3 — MINIMAL LIGHT
// Swiss / Stripe / Linear: pure white, near-black, single emerald accent.
// ─────────────────────────────────────────────────────────────────────────────
export const MINIMAL_LIGHT_THEME: StyleThemeTokens = {
  id: "minimal-light", name: "Minimal Light", isBuiltin: true, isProtected: false,
  description: "Swiss design precision inspired by Stripe and Linear. Pure white canvas, near-black typography, single emerald accent. Every pixel intentional.",
  colorPrimary:   "#111827", colorSecondary: "#059669", colorAccent:    "#059669",
  colorBg:        "#FFFFFF", colorSurface:   "#F9FAFB", colorFg:        "#111827",
  colorMuted:     "#6B7280", colorBorder:    "#E5E7EB",
  gradientHeroStart: "#111827", gradientHeroMid: "#1F2937", gradientHeroEnd: "#111827",
  gradientCardStart: "#FFFFFF", gradientCardEnd: "#F9FAFB",
  radiusCard: "0.75rem", radiusBtn: "0.5rem", radiusInput: "0.5rem", radiusBadge: "999px",
  shadowCard:      "0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
  shadowCardHover: "0 0 0 1px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.08)",
  shadowFocus:     "0 0 0 3px rgba(5,150,105,0.25)",
  blurCard: "0px", blurBackdrop: "8px",
  animDurationEnter: "350ms", animDurationHover: "150ms", animDurationSlow: "500ms",
  animEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  cardMode: "flat", btnShape: "rounded", heroPattern: "none", sectionDivider: "none",
  fontWeightHeading: "700", fontWeightBody: "400", lineHeightBody: "1.65", letterSpacingHeading: "-0.03em",
  previewSwatches: ["#111827", "#059669", "#1F2937", "#FFFFFF", "#6B7280", "#E5E7EB"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Theme 4 — WARM PROFESSIONAL
// McKinsey/World Bank/UNDP: amber-brown authority on warm stone background.
// ─────────────────────────────────────────────────────────────────────────────
export const WARM_PROFESSIONAL_THEME: StyleThemeTokens = {
  id: "warm-professional", name: "Warm Professional", isBuiltin: true, isProtected: false,
  description: "Consultancy and NGO grade design inspired by World Bank and UNDP. Amber authority on warm stone, conveying confidence and approachability.",
  colorPrimary:   "#B45309", colorSecondary: "#44403C", colorAccent:    "#D97706",
  colorBg:        "#F5F4F0", colorSurface:   "#FFFFFF", colorFg:        "#1C1917",
  colorMuted:     "#78716C", colorBorder:    "rgba(180,83,9,0.15)",
  gradientHeroStart: "#1C1917", gradientHeroMid: "#292524", gradientHeroEnd: "#44403C",
  gradientCardStart: "#FFFFFF", gradientCardEnd: "#F5F4F0",
  radiusCard: "0.5rem", radiusBtn: "0.375rem", radiusInput: "0.375rem", radiusBadge: "4px",
  shadowCard:      "0 2px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.05)",
  shadowCardHover: "0 4px 12px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.07)",
  shadowFocus:     "0 0 0 3px rgba(180,83,9,0.22)",
  blurCard: "0px", blurBackdrop: "8px",
  animDurationEnter: "400ms", animDurationHover: "200ms", animDurationSlow: "600ms",
  animEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  cardMode: "flat", btnShape: "rounded", heroPattern: "none", sectionDivider: "none",
  fontWeightHeading: "700", fontWeightBody: "400", lineHeightBody: "1.7", letterSpacingHeading: "-0.01em",
  previewSwatches: ["#B45309", "#44403C", "#D97706", "#F5F4F0", "#1C1917", "#78716C"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Theme 5 — SOPHISTICATED DARK
// Apple Events / Vercel dark: warm gold on near-black, subtle glass surfaces.
// ─────────────────────────────────────────────────────────────────────────────
export const SOPHISTICATED_DARK_THEME: StyleThemeTokens = {
  id: "sophisticated-dark", name: "Sophisticated Dark", isBuiltin: true, isProtected: false,
  description: "Premium dark mode inspired by Apple Events and Vercel. Warm gold typography on deep black, subtle glass cards, premium science journal aesthetic.",
  colorPrimary:   "#E2C68A", colorSecondary: "#4ADE80", colorAccent:    "#FDE68A",
  colorBg:        "#0A0A0A", colorSurface:   "#141414", colorFg:        "#F5F5F4",
  colorMuted:     "#A8A29E", colorBorder:    "rgba(255,255,255,0.10)",
  gradientHeroStart: "#0A0A0A", gradientHeroMid: "#141414", gradientHeroEnd: "#0A0A0A",
  gradientCardStart: "rgba(255,255,255,0.05)", gradientCardEnd: "rgba(255,255,255,0.02)",
  radiusCard: "0.75rem", radiusBtn: "0.5rem", radiusInput: "0.5rem", radiusBadge: "999px",
  shadowCard:      "0 2px 8px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.06)",
  shadowCardHover: "0 4px 20px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.12)",
  shadowFocus:     "0 0 0 3px rgba(226,198,138,0.30)",
  blurCard: "8px", blurBackdrop: "20px",
  animDurationEnter: "450ms", animDurationHover: "200ms", animDurationSlow: "650ms",
  animEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  cardMode: "glass", btnShape: "rounded", heroPattern: "none", sectionDivider: "none",
  fontWeightHeading: "600", fontWeightBody: "400", lineHeightBody: "1.75", letterSpacingHeading: "-0.02em",
  previewSwatches: ["#E2C68A", "#4ADE80", "#FDE68A", "#141414", "#0A0A0A", "#A8A29E"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Theme 6 — FRESH TEAL
// WHO/UNICEF institutional: clean teal trust + amber CTA contrast.
// ─────────────────────────────────────────────────────────────────────────────
export const FRESH_TEAL_THEME: StyleThemeTokens = {
  id: "fresh-teal", name: "Fresh Teal", isBuiltin: true, isProtected: false,
  description: "Trustworthy institutional design inspired by WHO and UNICEF. Clean teal communicates health and reliability; amber contrast energises calls-to-action.",
  colorPrimary:   "#0D9488", colorSecondary: "#0F766E", colorAccent:    "#F59E0B",
  colorBg:        "#F0FDFA", colorSurface:   "#FFFFFF", colorFg:        "#134E4A",
  colorMuted:     "#5F9EA0", colorBorder:    "rgba(13,148,136,0.18)",
  gradientHeroStart: "#134E4A", gradientHeroMid: "#0F766E", gradientHeroEnd: "#0D9488",
  gradientCardStart: "#FFFFFF", gradientCardEnd: "#F0FDFA",
  radiusCard: "0.75rem", radiusBtn: "0.5rem", radiusInput: "0.5rem", radiusBadge: "999px",
  shadowCard:      "0 2px 8px rgba(13,148,136,0.08), 0 4px 16px rgba(0,0,0,0.04)",
  shadowCardHover: "0 4px 16px rgba(13,148,136,0.14), 0 8px 24px rgba(0,0,0,0.06)",
  shadowFocus:     "0 0 0 3px rgba(13,148,136,0.22)",
  blurCard: "0px", blurBackdrop: "8px",
  animDurationEnter: "400ms", animDurationHover: "200ms", animDurationSlow: "600ms",
  animEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  cardMode: "flat", btnShape: "rounded", heroPattern: "none", sectionDivider: "none",
  fontWeightHeading: "700", fontWeightBody: "400", lineHeightBody: "1.7", letterSpacingHeading: "-0.01em",
  previewSwatches: ["#0D9488", "#0F766E", "#F59E0B", "#F0FDFA", "#134E4A", "#5F9EA0"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Theme 7 — SLATE CORPORATE
// IBM/SAP/government: corporate blue, crisp grid, fast efficient interactions.
// ─────────────────────────────────────────────────────────────────────────────
export const SLATE_CORPORATE_THEME: StyleThemeTokens = {
  id: "slate-corporate", name: "Slate Corporate", isBuiltin: true, isProtected: false,
  description: "Enterprise and government grade design inspired by IBM and SAP. Corporate blue conveys reliability; structured layout and fast 300ms interactions signal efficiency.",
  colorPrimary:   "#1E40AF", colorSecondary: "#1D4ED8", colorAccent:    "#3B82F6",
  colorBg:        "#F8FAFC", colorSurface:   "#FFFFFF", colorFg:        "#0F172A",
  colorMuted:     "#64748B", colorBorder:    "#CBD5E1",
  gradientHeroStart: "#0F172A", gradientHeroMid: "#1E293B", gradientHeroEnd: "#1E40AF",
  gradientCardStart: "#FFFFFF", gradientCardEnd: "#F8FAFC",
  radiusCard: "0.5rem", radiusBtn: "0.375rem", radiusInput: "0.375rem", radiusBadge: "4px",
  shadowCard:      "0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)",
  shadowCardHover: "0 4px 12px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.07)",
  shadowFocus:     "0 0 0 3px rgba(30,64,175,0.22)",
  blurCard: "0px", blurBackdrop: "8px",
  animDurationEnter: "300ms", animDurationHover: "150ms", animDurationSlow: "500ms",
  animEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  cardMode: "flat", btnShape: "rounded", heroPattern: "none", sectionDivider: "none",
  fontWeightHeading: "700", fontWeightBody: "400", lineHeightBody: "1.6", letterSpacingHeading: "-0.01em",
  previewSwatches: ["#1E40AF", "#1D4ED8", "#3B82F6", "#F8FAFC", "#0F172A", "#64748B"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_THEME: StyleThemeTokens = CLASSIC_SOIL_THEME;

export const BUILTIN_THEMES: StyleThemeTokens[] = [
  CLASSIC_SOIL_THEME,
  SOIL_GLASS_THEME,
  ACADEMIC_SERIF_THEME,
  MINIMAL_LIGHT_THEME,
  WARM_PROFESSIONAL_THEME,
  SOPHISTICATED_DARK_THEME,
  FRESH_TEAL_THEME,
  SLATE_CORPORATE_THEME,
];

export function findBuiltinTheme(id: string): StyleThemeTokens | undefined {
  return BUILTIN_THEMES.find((t) => t.id === id);
}
