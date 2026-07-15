"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getPublicThemeSettings } from "@/lib/theme-settings";
import type { ThemeSetting } from "@/types";
import {
  type StyleThemeTokens,
  DEFAULT_THEME,
  findBuiltinTheme,
} from "@/lib/style-themes";

// ─────────────────────────────────────────────────────────────────────────────
// Context type
// ─────────────────────────────────────────────────────────────────────────────
interface StyleThemeContextType {
  settings:        ThemeSetting[];
  loading:         boolean;
  refresh:         () => Promise<void>;
  activeStyleTheme: StyleThemeTokens;
  applyStyleTheme:  (theme: StyleThemeTokens) => void;
}

const StyleThemeContext = createContext<StyleThemeContextType>({
  settings:        [],
  loading:         true,
  refresh:         async () => {},
  activeStyleTheme: DEFAULT_THEME,
  applyStyleTheme:  () => {},
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Injects all StyleThemeTokens as --style-* CSS custom properties onto :root.
 * Safe to call on SSR (checks for document). Exported so admin panel can call it.
 */
export function applyStyleTokens(tokens: StyleThemeTokens) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Colors
  root.style.setProperty("--style-color-primary",   tokens.colorPrimary);
  root.style.setProperty("--style-color-secondary", tokens.colorSecondary);
  root.style.setProperty("--style-color-accent",    tokens.colorAccent);
  root.style.setProperty("--style-color-bg",        tokens.colorBg);
  root.style.setProperty("--style-color-surface",   tokens.colorSurface);
  root.style.setProperty("--style-color-fg",        tokens.colorFg);
  root.style.setProperty("--style-color-muted",     tokens.colorMuted);
  root.style.setProperty("--style-color-border",    tokens.colorBorder);

  // Gradients
  root.style.setProperty("--style-gradient-hero-start", tokens.gradientHeroStart);
  root.style.setProperty("--style-gradient-hero-mid",   tokens.gradientHeroMid);
  root.style.setProperty("--style-gradient-hero-end",   tokens.gradientHeroEnd);
  root.style.setProperty("--style-gradient-card-start", tokens.gradientCardStart);
  root.style.setProperty("--style-gradient-card-end",   tokens.gradientCardEnd);

  // Radii
  root.style.setProperty("--style-radius-card",  tokens.radiusCard);
  root.style.setProperty("--style-radius-btn",   tokens.radiusBtn);
  root.style.setProperty("--style-radius-input", tokens.radiusInput);
  root.style.setProperty("--style-radius-badge", tokens.radiusBadge);

  // Shadows
  root.style.setProperty("--style-shadow-card",       tokens.shadowCard);
  root.style.setProperty("--style-shadow-card-hover", tokens.shadowCardHover);
  root.style.setProperty("--style-shadow-focus",      tokens.shadowFocus);

  // Blur
  root.style.setProperty("--style-blur-card",     tokens.blurCard);
  root.style.setProperty("--style-blur-backdrop", tokens.blurBackdrop);

  // Animations
  root.style.setProperty("--style-anim-enter",  tokens.animDurationEnter);
  root.style.setProperty("--style-anim-hover",  tokens.animDurationHover);
  root.style.setProperty("--style-anim-slow",   tokens.animDurationSlow);
  root.style.setProperty("--style-anim-easing", tokens.animEasing);

  // Component modes
  root.style.setProperty("--style-card-mode",       tokens.cardMode);
  root.style.setProperty("--style-btn-shape",        tokens.btnShape);
  root.style.setProperty("--style-hero-pattern",     tokens.heroPattern);
  root.style.setProperty("--style-section-divider",  tokens.sectionDivider);

  // Typography
  root.style.setProperty("--style-font-weight-heading",    tokens.fontWeightHeading);
  root.style.setProperty("--style-font-weight-body",       tokens.fontWeightBody);
  root.style.setProperty("--style-line-height-body",       tokens.lineHeightBody);
  root.style.setProperty("--style-letter-spacing-heading", tokens.letterSpacingHeading);

  // Theme identifier on html element (for CSS targeting)
  root.setAttribute("data-style-theme", tokens.id);
}

/** Apply legacy settings (colors, fonts, custom CSS) from DB — unchanged. */
function applySettings(settings: ThemeSetting[]) {
  const root = document.documentElement;
  for (const s of settings) {
    const key = s.settingKey;
    const val = s.settingValue;
    if (!val) continue;
    if (key.startsWith("shad_")) {
      const cssVar = "--" + key.replace("shad_", "");
      root.style.setProperty(cssVar, val.startsWith("#") ? hexToHsl(val) : val);
    } else if (key.startsWith("color_")) {
      root.style.setProperty("--" + key.replace("color_", "").replace(/_/g, "-"), val);
    } else if (key.startsWith("font_")) {
      const cssVar = "--font-" + key.replace("font_", "");
      const fontVal = val === "Inter" ? "'Inter', sans-serif"
        : val === "Merriweather" ? "'Merriweather', serif"
        : val === "Roboto" ? "'Roboto', sans-serif"
        : val === "Open Sans" ? "'Open Sans', sans-serif"
        : val === "Lora" ? "'Lora', serif"
        : val === "Playfair Display" ? "'Playfair Display', serif"
        : val + ", sans-serif";
      root.style.setProperty(cssVar, fontVal);
      const fontLinkId = `gf-${key}`;
      if (!document.getElementById(fontLinkId)) {
        const link = document.createElement("link");
        link.id = fontLinkId; link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${val.replace(/\s+/g, "+")}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    } else if (key.startsWith("layout_")) {
      root.style.setProperty("--" + key.replace("layout_", ""), val);
    } else if (key === "custom_css") {
      let styleEl = document.getElementById("theme-custom-css") as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "theme-custom-css";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = val;
    }
  }
}

/** Read style_theme_preset from settings → resolve to token object. */
function resolveStyleTheme(settings: ThemeSetting[]): StyleThemeTokens {
  const preset = settings.find((s) => s.settingKey === "style_theme_preset");
  if (!preset?.settingValue) return DEFAULT_THEME;
  // Try built-in match by id
  const builtin = findBuiltinTheme(preset.settingValue);
  if (builtin) return builtin;
  // Try JSON custom theme
  try {
    const parsed = JSON.parse(preset.settingValue) as Partial<StyleThemeTokens>;
    if (parsed.id && parsed.colorPrimary) return { ...DEFAULT_THEME, ...parsed };
  } catch { /* fall through */ }
  return DEFAULT_THEME;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export function StyleThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings,         setSettings]         = useState<ThemeSetting[]>([]);
  const [loading,          setLoading]           = useState(true);
  const [activeStyleTheme, setActiveStyleTheme] = useState<StyleThemeTokens>(DEFAULT_THEME);

  // Apply DEFAULT_THEME immediately so there's no flash before API resolves
  useEffect(() => { applyStyleTokens(DEFAULT_THEME); }, []);

  const applyStyleTheme = useCallback((theme: StyleThemeTokens) => {
    setActiveStyleTheme(theme);
    applyStyleTokens(theme);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await getPublicThemeSettings();
      if (res.data.success) {
        const fetched: ThemeSetting[] = res.data.data;
        setSettings(fetched);
        applySettings(fetched);
        const styleTheme = resolveStyleTheme(fetched);
        setActiveStyleTheme(styleTheme);
        applyStyleTokens(styleTheme);
      }
    } catch {
      // Keep DEFAULT_THEME already applied — no action needed
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <StyleThemeContext.Provider value={{ settings, loading, refresh, activeStyleTheme, applyStyleTheme }}>
      {children}
    </StyleThemeContext.Provider>
  );
}

export function useStyleTheme() {
  return useContext(StyleThemeContext);
}
