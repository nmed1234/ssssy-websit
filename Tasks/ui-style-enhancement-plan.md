# UI Style Enhancement Plan
## Professional Design System with Admin-Controlled Theme Switching

**Version:** 3.0 — Reviewed & refined after user feedback  
**Baseline:** Original soil-style homepage (hardcoded Tailwind classes, no `--style-*` vars yet)

---

## Design Philosophy (Critical — Read Before Implementation)

### Animation Rules — Official Website Standard
All motion in every theme must follow the **"purposeful restraint"** principle used by
institutions like UN, WHO, World Bank, NASA, national universities, and scientific bodies.

**What this means concretely:**
- ✅ Fade-in on scroll (opacity 0 → 1, 400ms, ease-out) — subtle, professional
- ✅ Translate-up on scroll (y: 20px → 0, 400ms) — clean entrance
- ✅ Stagger delay between cards (50ms per card) — organized, not distracting
- ✅ Hover: gentle lift (`y: -3px`, shadow deepens, 200ms ease) — responsive feedback
- ✅ Smooth color/border transitions on focus/hover (150–200ms) — polished inputs
- ✅ Scroll progress bar — thin, subtle, useful
- ✅ Counter number animation on viewport entry — one-time, informative
- ✅ Heading word-by-word reveal — one-time, elegant for hero
- ❌ NO continuous looping animations on page elements (no floating blobs, no pulsing glows)
- ❌ NO parallax on hero background (causes motion sickness, hurts performance)
- ❌ NO bouncing spring physics (use ease-out instead)
- ❌ NO magnetic cursor effects on official sites
- ❌ NO gradient shift background animation
- ❌ NO particle fields on critical content sections
- ❌ NO shimmer/glow pulse on interactive elements at rest

**Permitted one-time animations (trigger once on viewport entry, never loop):**
- Section fade-in + translate-up
- Card stagger entrance
- Animated counter (runs once per viewport visit)
- SVG line draw on timeline (tied to scroll position, not a loop)
- Text reveal on hero heading (once on load)

**Hover interactions (only on explicit user action):**
- Card: `box-shadow` deepens + `translateY(-3px)` — 200ms ease-out
- Button: background lightens/darkens 10% — 150ms ease-out
- Link: underline slides in from left — 200ms ease-out
- Input/Textarea: border color → primary, subtle inner glow — 150ms ease-out

### Advanced Smooth Effects Used Across ALL Themes
These techniques are applied in every theme (values vary per theme):

1. **Frosted Surface Effect** — `backdrop-filter: blur(Npx)` on cards/modals (degree varies: 0–20px)
2. **Layered shadow depth** — 2-stop shadow (ambient + direct) on cards, deepens on hover
3. **CSS easing curves** — all transitions use `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard) or theme-specific variant
4. **Border opacity** — borders use `rgba` or `color-mix` at 20–30% opacity for softness
5. **Scroll-linked section reveals** — Framer Motion `whileInView`, `once: true`, `margin: "-80px"`
6. **Reading typography** — `line-height: 1.7`, `letter-spacing` tuned per theme, `text-wrap: balance` on headings
7. **Color surface hierarchy** — 3 levels: page bg → card surface → elevated surface (each 4–8% lighter/darker)
8. **Focus ring** — 2px solid primary color, 2px offset, on all interactive elements (accessibility)
9. **Transition on `:root`** — `background-color 300ms ease, color 300ms ease` for theme switching

---

## Current State (Baseline — All Style Files Deleted)

| File | Status |
|------|--------|
| `frontend/src/app/(public)/page.tsx` | ✅ Original — hardcoded soil Tailwind classes |
| `frontend/src/app/globals.css` | ✅ Original — ends at line 265, no `--style-*` vars |
| `frontend/src/lib/style-theme-context.tsx` | ✅ Original — basic provider, no style tokens |
| `frontend/tailwind.config.ts` | ✅ Original — no `--style-*` references |
| `frontend/src/components/layout/AdminSidebar.tsx` | ✅ Original — no Style Themes nav item |
| `frontend/src/lib/style-themes.ts` | ❌ DELETED |
| `frontend/src/components/ui/style-card.tsx` | ❌ DELETED |
| `frontend/src/components/ui/style-input.tsx` | ❌ DELETED |
| `frontend/src/components/ui/style-textarea.tsx` | ❌ DELETED |
| `frontend/src/components/ui/style-paragraph.tsx` | ❌ DELETED |
| `frontend/src/components/ui/style-uploader.tsx` | ❌ DELETED |
| `frontend/src/components/ui/style-pdf-book.tsx` | ❌ DELETED |
| `frontend/src/components/ui/style-timeline.tsx` | ❌ DELETED |
| `frontend/src/app/admin/style-themes/page.tsx` | ❌ DELETED |
| `frontend/src/components/admin/StyleThemePreview.tsx` | ❌ DELETED |

---

## Theme System Architecture

### How It Works
1. `StyleThemeTokens` object → `applyStyleTokens()` → CSS variables on `:root`
2. All public components read `--style-*` CSS variables (no hardcoded colors)
3. Admin selects theme → stored in DB setting `style_theme_preset` → next page load applies it
4. **"Classic Soil" theme** = snapshot of the current original site appearance — always available, always restorable
5. Theme switching is instant in admin preview (via JS `style.setProperty`) — takes effect for visitors on next load

### Theme Token Groups
- **Colors** (8): primary, secondary, accent, bg, surface, fg, muted, border
- **Gradients** (5): hero-start, hero-mid, hero-end, card-start, card-end
- **Radii** (4): card, button, input, badge
- **Shadows** (3): card (rest), card-hover, focus/glow (inputs only)
- **Blur** (2): card backdrop, overlay backdrop
- **Animations** (4): duration-enter, duration-hover, duration-slow, easing curve
- **Component modes** (4): cardMode, btnShape, heroPattern, sectionDivider
- **Typography** (4): heading-weight, body-weight, body-line-height, letter-spacing-heading

---

## The 8 Themes

### Theme 0: Classic Soil (Default — Restorable)
> **Exact snapshot of the current site.** This is what visitors see today.
> Always available in admin. Cannot be deleted.

| Token | Value | Maps to (original code) |
|-------|-------|------------------------|
| colorPrimary | `#3E2723` | `soil-dark` |
| colorSecondary | `#2E7D32` | `forest` |
| colorAccent | `#8D6E63` | `soil-rich` |
| colorBg | `#FFF8E1` | `soil-cream` (page background) |
| colorSurface | `#FFFFFF` | white cards |
| colorFg | `#1C1B1A` | near-black text |
| colorMuted | `#6D4C41` | `soil-clay` |
| colorBorder | `rgba(188,170,164,0.4)` | subtle soil-taupe border |
| gradientHeroStart | `#3E2723` | `from-soil-dark` |
| gradientHeroMid | `#4E342E` | `via-deep-soil` |
| gradientHeroEnd | `#6D4C41` | `to-soil-clay` |
| radiusCard | `0.75rem` | `rounded-xl` |
| radiusBtn | `0.5rem` | default Button |
| radiusInput | `0.375rem` | default input |
| shadowCard | `0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)` | `shadow-md` |
| shadowCardHover | `0 4px 16px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)` | deeper |
| shadowFocus | `0 0 0 3px rgba(62,39,35,0.20)` | focus ring |
| blurCard | `0px` | no blur on original |
| animDurationEnter | `400ms` | existing scroll-fade-in |
| animDurationHover | `200ms` | existing hover |
| animEasing | `cubic-bezier(0.4, 0, 0.2, 1)` | standard ease |
| cardMode | `flat` | plain white cards |
| btnShape | `rounded` | standard button |
| heroPattern | `particle` | ParticleField already in original |
| fontWeightHeading | `700` | bold |
| bodyLineHeight | `1.75` | existing |
| letterSpacingHeading | `-0.02em` | tight |

**Card appearance:** White background, thin border, subtle shadow that deepens on hover. No blur.
**Hero:** Original gradient + particle field. SVG wave overlay kept exactly.
**Buttons:** Green forest primary, white outline secondary — exactly as today.

---

### Theme 1: Soil Glass (Enhanced Soil — Glassmorphism Upgrade)
> The soil palette elevated with frosted glass cards. Same warmth, more modern.

| Key tokens | Values |
|-----------|--------|
| colorBg | `#FAF6F0` — warm off-white (slightly warmer than cream) |
| colorSurface | `rgba(255, 252, 245, 0.72)` — frosted warm white |
| colorPrimary | `#5D4037` — rich brown |
| colorSecondary | `#2E7D32` — forest green |
| colorBorder | `rgba(141, 110, 99, 0.22)` — transparent warm border |
| gradients | Same soil gradient on hero |
| radiusCard | `1rem` — slightly rounder |
| blurCard | `12px` — frosted glass effect |
| shadowCard | `0 2px 8px rgba(93,64,55,0.08), 0 8px 24px rgba(93,64,55,0.06)` |
| shadowFocus | `0 0 0 3px rgba(93,64,55,0.22)` |
| animDurationEnter | `450ms` — slightly slower, silkier |
| animEasing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| cardMode | `glass` |
| heroPattern | `particle` |

**Effect:** Cards feel light and airy, floating over the warm page background. Frosted surface with warm tint.

---

### Theme 2: Academic Serif (Clean scholarly style)
> Inspired by Oxford, MIT, university press publications. Serif typography, generous whitespace.

| Key tokens | Values |
|-----------|--------|
| colorBg | `#FAFAF8` — near-white with warm tint |
| colorSurface | `#FFFFFF` |
| colorPrimary | `#1A3A5C` — Oxford navy |
| colorSecondary | `#8B4513` — academic sienna |
| colorAccent | `#C5961A` — gold accent |
| colorFg | `#1A1A1A` — near-black |
| colorMuted | `#555550` — warm gray |
| colorBorder | `rgba(26,58,92,0.15)` |
| gradientHeroStart | `#1A3A5C` |
| gradientHeroMid | `#1D4E7A` |
| gradientHeroEnd | `#1A3A5C` |
| radiusCard | `0.5rem` — conservative rounding |
| radiusBtn | `0.375rem` |
| blurCard | `0px` — no blur, clean |
| shadowCard | `0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)` |
| animDurationEnter | `500ms` — unhurried |
| animEasing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| cardMode | `flat` |
| fontWeightHeading | `700` |
| letterSpacingHeading | `0.01em` — slight tracking for serifs |
| bodyLineHeight | `1.8` — generous reading |
| heroPattern | `none` — clean dark gradient |

**Effect:** Scholarly gravitas. White space feels intentional. Gold accents on date/category labels. Navy communicates authority.

---

### Theme 3: Minimal Light (Nordic / Swiss minimal)
> Inspired by Swiss design, Stripe, Linear. Maximum whitespace, minimal color.

| Key tokens | Values |
|-----------|--------|
| colorBg | `#FFFFFF` |
| colorSurface | `#F9FAFB` — very light gray |
| colorPrimary | `#111827` — near-black |
| colorSecondary | `#374151` — dark gray |
| colorAccent | `#059669` — emerald accent (single color pop) |
| colorFg | `#111827` |
| colorMuted | `#6B7280` |
| colorBorder | `#E5E7EB` — light gray, sharply defined |
| gradientHeroStart | `#111827` |
| gradientHeroMid | `#1F2937` |
| gradientHeroEnd | `#111827` |
| radiusCard | `0.75rem` |
| radiusBtn | `0.5rem` |
| blurCard | `0px` |
| shadowCard | `0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)` — hairline border shadow |
| shadowCardHover | `0 0 0 1px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.08)` |
| animDurationEnter | `350ms` |
| animDurationHover | `150ms` — snappy hover |
| animEasing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| cardMode | `flat` |
| heroPattern | `none` |
| fontWeightHeading | `700` |
| letterSpacingHeading | `-0.03em` — very tight, modern |
| bodyLineHeight | `1.65` |

**Effect:** Clean, focused, every pixel intentional. The emerald accent pops precisely where needed (buttons, tags, active states). Professional without decoration.

---

### Theme 4: Warm Professional (Consultancy / NGO style)
> Inspired by McKinsey, World Bank, UNDP. Warm neutral palette with confident typography.

| Key tokens | Values |
|-----------|--------|
| colorBg | `#F5F4F0` — warm stone background |
| colorSurface | `#FFFFFF` |
| colorPrimary | `#B45309` — amber-brown (warm authority) |
| colorSecondary | `#44403C` — warm charcoal |
| colorAccent | `#D97706` — amber highlight |
| colorFg | `#1C1917` — warm near-black |
| colorMuted | `#78716C` — warm stone-gray |
| colorBorder | `rgba(180,83,9,0.15)` |
| gradientHeroStart | `#1C1917` |
| gradientHeroMid | `#292524` |
| gradientHeroEnd | `#44403C` |
| radiusCard | `0.5rem` |
| radiusBtn | `0.375rem` |
| blurCard | `0px` |
| shadowCard | `0 2px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.05)` |
| animDurationEnter | `400ms` |
| animEasing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| cardMode | `flat` |
| heroPattern | `none` |
| fontWeightHeading | `700` |
| letterSpacingHeading | `-0.01em` |
| bodyLineHeight | `1.7` |

**Effect:** The amber primary conveys confidence and warmth. Stone backgrounds feel natural and organic. Suitable for NGO/institutional reports.

---

### Theme 5: Sophisticated Dark (Premium dark mode)
> Inspired by Apple Events, Vercel, premium tech/science publications. Dark but readable.

| Key tokens | Values |
|-----------|--------|
| colorBg | `#0A0A0A` — near-black |
| colorSurface | `#141414` — elevated dark surface |
| colorPrimary | `#E2C68A` — warm gold/wheat |
| colorSecondary | `#4ADE80` — soft green accent |
| colorAccent | `#FDE68A` — light amber |
| colorFg | `#F5F5F4` — warm white |
| colorMuted | `#A8A29E` — muted warm gray |
| colorBorder | `rgba(255,255,255,0.10)` — subtle white border |
| gradientHeroStart | `#0A0A0A` |
| gradientHeroMid | `#141414` |
| gradientHeroEnd | `#0A0A0A` |
| gradientCardStart | `rgba(255,255,255,0.04)` |
| gradientCardEnd | `rgba(255,255,255,0.02)` |
| radiusCard | `0.75rem` |
| radiusBtn | `0.5rem` |
| blurCard | `8px` — subtle glass on dark |
| shadowCard | `0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)` |
| shadowCardHover | `0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)` |
| shadowFocus | `0 0 0 3px rgba(226,198,138,0.30)` |
| animDurationEnter | `450ms` |
| animEasing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| cardMode | `glass` |
| heroPattern | `none` |
| fontWeightHeading | `600` |
| letterSpacingHeading | `-0.02em` |
| bodyLineHeight | `1.75` |

**Effect:** Cards have a very subtle frosted surface against deep backgrounds. Gold text accents feel premium. Green secondary pops for calls-to-action. Feels like a premium science journal in dark mode.

---

### Theme 6: Fresh Teal (Modern institutional)
> Inspired by WHO, UNICEF, research institutes. Clean, trustworthy, accessible.

| Key tokens | Values |
|-----------|--------|
| colorBg | `#F0FDFA` — very light teal tint |
| colorSurface | `#FFFFFF` |
| colorPrimary | `#0D9488` — teal |
| colorSecondary | `#0F766E` — deeper teal |
| colorAccent | `#F59E0B` — amber contrast |
| colorFg | `#134E4A` — dark teal text |
| colorMuted | `#5F9EA0` — muted teal-gray |
| colorBorder | `rgba(13,148,136,0.18)` |
| gradientHeroStart | `#134E4A` |
| gradientHeroMid | `#0F766E` |
| gradientHeroEnd | `#0D9488` |
| radiusCard | `0.75rem` |
| radiusBtn | `0.5rem` |
| blurCard | `0px` |
| shadowCard | `0 2px 8px rgba(13,148,136,0.08), 0 4px 16px rgba(0,0,0,0.04)` |
| shadowFocus | `0 0 0 3px rgba(13,148,136,0.22)` |
| animDurationEnter | `400ms` |
| animEasing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| cardMode | `flat` |
| heroPattern | `none` |
| fontWeightHeading | `700` |
| bodyLineHeight | `1.7` |

**Effect:** Trustworthy institutional teal. Amber accents for CTA buttons and tags. Feels like a medical/scientific organization — clean and authoritative.

---

### Theme 7: Slate Corporate (Enterprise / Government)
> Inspired by IBM, SAP, government portals. Crisp, structured, no-nonsense.

| Key tokens | Values |
|-----------|--------|
| colorBg | `#F8FAFC` — very light blue-gray |
| colorSurface | `#FFFFFF` |
| colorPrimary | `#1E40AF` — corporate blue |
| colorSecondary | `#1D4ED8` — bright blue |
| colorAccent | `#DC2626` — alert red (sparingly) |
| colorFg | `#0F172A` — slate near-black |
| colorMuted | `#64748B` — slate-500 |
| colorBorder | `#CBD5E1` — slate-300 |
| gradientHeroStart | `#0F172A` |
| gradientHeroMid | `#1E293B` |
| gradientHeroEnd | `#1E40AF` |
| radiusCard | `0.5rem` |
| radiusBtn | `0.375rem` |
| blurCard | `0px` |
| shadowCard | `0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)` |
| shadowFocus | `0 0 0 3px rgba(30,64,175,0.22)` |
| animDurationEnter | `300ms` — fast, efficient |
| animDurationHover | `150ms` |
| animEasing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| cardMode | `flat` |
| heroPattern | `none` |
| fontWeightHeading | `700` |
| letterSpacingHeading | `-0.01em` |
| bodyLineHeight | `1.6` |

**Effect:** Structured, corporate, trustworthy. Blue conveys reliability. Very clean grid layout. Suitable for government agencies or large institutional bodies.

---

## Updated Sub-Tasks

### Sub-Task 1 — Define Theme Schema & 8 Presets
**Status:** [ ] pending  
**File:** `frontend/src/lib/style-themes.ts`

**Interface updates from v2:**
- Rename `animDurationFast` → `animDurationHover` (clearer purpose)
- Rename `animDurationNormal` → `animDurationEnter`
- Rename `animDurationSlow` → `animDurationSlow` (kept for timeline/slow transitions)
- Add `letterSpacingHeading: string` token
- Add `shadowFocus: string` token (for input focus ring — separate from card glow)
- `cardMode` values: `"flat" | "glass"` (simplified — was 6 variants, now 2 that actually differ)
- `heroPattern` values: `"particle" | "none"` (simplified — only 2 that are actually used)
- `sectionDivider` values: `"none" | "wave"` (simplified)
- Theme 0: `id: "classic-soil"` — marked `isBuiltin: true, isDefault: true, isProtected: true`

**Exports:**
```ts
export const CLASSIC_SOIL_THEME: StyleThemeTokens   // Theme 0 — protected
export const SOIL_GLASS_THEME: StyleThemeTokens      // Theme 1
export const ACADEMIC_SERIF_THEME: StyleThemeTokens  // Theme 2
export const MINIMAL_LIGHT_THEME: StyleThemeTokens   // Theme 3
export const WARM_PROFESSIONAL_THEME: StyleThemeTokens // Theme 4
export const SOPHISTICATED_DARK_THEME: StyleThemeTokens // Theme 5
export const FRESH_TEAL_THEME: StyleThemeTokens      // Theme 6
export const SLATE_CORPORATE_THEME: StyleThemeTokens  // Theme 7
export const BUILTIN_THEMES: StyleThemeTokens[]       // all 8 in order
export const DEFAULT_THEME = CLASSIC_SOIL_THEME
export function findBuiltinTheme(id: string): StyleThemeTokens | undefined
```

**Todo:**
1. Create file with `StyleThemeTokens` interface (updated token names)
2. Write all 8 theme constants
3. Export array + helpers

---

### Sub-Task 2 — Enhance StyleThemeProvider
**Status:** [ ] pending  
**File:** `frontend/src/lib/style-theme-context.tsx`

**Same as v2 with updated token names:**
- `animDurationFast` → `animDurationHover` → `--style-anim-hover`
- `animDurationNormal` → `animDurationEnter` → `--style-anim-enter`
- Add `--style-shadow-focus` from `shadowFocus` token
- Add `--style-letter-spacing-heading` from `letterSpacingHeading` token
- Apply `DEFAULT_THEME` tokens immediately on mount (before API fetch) so there's no flash

**Todo:**
1. Read current file fully before editing
2. Add imports + `applyStyleTokens()` + `resolveStyleTheme()`
3. Extend context type + provider state
4. Apply DEFAULT_THEME immediately on mount, then re-apply after fetch
5. Export `useStyleTheme()` hook (keep existing)

---

### Sub-Task 3 — Extend globals.css & tailwind.config.ts
**Status:** [ ] pending

**globals.css additions (append after line 265):**

**`:root` CSS variable defaults** (Classic Soil values):
```css
--style-color-primary:   #3E2723;
--style-color-secondary: #2E7D32;
--style-color-accent:    #8D6E63;
--style-color-bg:        #FFF8E1;
--style-color-surface:   #FFFFFF;
--style-color-fg:        #1C1B1A;
--style-color-muted:     #6D4C41;
--style-color-border:    rgba(188,170,164,0.4);
--style-gradient-hero-start: #3E2723;
--style-gradient-hero-mid:   #4E342E;
--style-gradient-hero-end:   #6D4C41;
--style-gradient-card-start: #FFFFFF;
--style-gradient-card-end:   #FAFAF8;
--style-radius-card:  0.75rem;
--style-radius-btn:   0.5rem;
--style-radius-input: 0.375rem;
--style-radius-badge: 999px;
--style-shadow-card:       0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05);
--style-shadow-card-hover: 0 4px 16px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08);
--style-shadow-focus:      0 0 0 3px rgba(62,39,35,0.20);
--style-blur-card:      0px;
--style-blur-backdrop:  8px;
--style-anim-enter:  400ms;
--style-anim-hover:  200ms;
--style-anim-slow:   600ms;
--style-anim-easing: cubic-bezier(0.4, 0, 0.2, 1);
--style-card-mode:   flat;
--style-btn-shape:   rounded;
--style-hero-pattern: particle;
--style-font-weight-heading: 700;
--style-font-weight-body:    400;
--style-line-height-body:    1.75;
--style-letter-spacing-heading: -0.02em;
```

**Card utility classes** (only 2 real modes):
```css
/* .style-card-flat — white bg, border, shadow */
.style-card-flat {
  background: var(--style-color-surface);
  border: 1px solid var(--style-color-border);
  border-radius: var(--style-radius-card);
  box-shadow: var(--style-shadow-card);
  transition: box-shadow 200ms cubic-bezier(0.4,0,0.2,1),
              transform 200ms cubic-bezier(0.4,0,0.2,1);
}
.style-card-flat:hover {
  box-shadow: var(--style-shadow-card-hover);
  transform: translateY(-3px);
}

/* .style-card-glass — frosted bg, border, shadow */
.style-card-glass {
  background: var(--style-color-surface);
  backdrop-filter: blur(var(--style-blur-card));
  -webkit-backdrop-filter: blur(var(--style-blur-card));
  border: 1px solid var(--style-color-border);
  border-radius: var(--style-radius-card);
  box-shadow: var(--style-shadow-card);
  transition: box-shadow 200ms cubic-bezier(0.4,0,0.2,1),
              transform 200ms cubic-bezier(0.4,0,0.2,1);
}
.style-card-glass:hover {
  box-shadow: var(--style-shadow-card-hover);
  transform: translateY(-3px);
}
```

**Keyframes** (all one-time — no looping except gradientShift already in file):
```css
/* Scroll-triggered section enter (used by Framer Motion, not standalone) */
/* SVG path draw for timeline */
@keyframes draw-line {
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
}
/* 3D page-flip forward */
@keyframes page-flip-forward {
  0%   { transform: perspective(2000px) rotateY(0deg);    }
  100% { transform: perspective(2000px) rotateY(-180deg); }
}
/* 3D page-flip backward */
@keyframes page-flip-backward {
  0%   { transform: perspective(2000px) rotateY(0deg);   }
  100% { transform: perspective(2000px) rotateY(180deg); }
}
```

**Utility classes:**
```css
.style-btn-rounded { border-radius: var(--style-radius-btn); }
.style-btn-pill    { border-radius: 999px; }
.style-btn-sharp   { border-radius: 0; }

.scroll-progress-bar {
  position: fixed; top: 0; left: 0; right: 0;
  height: 2px;   /* thin, professional */
  background: var(--style-color-primary);
  transform-origin: 0%;
  z-index: 9999;
  pointer-events: none;
}

.book-page {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1.0);
}
.book-page.flipping-forward  { animation: page-flip-forward  0.6s cubic-bezier(0.645,0.045,0.355,1.0) forwards; }
.book-page.flipping-backward { animation: page-flip-backward 0.6s cubic-bezier(0.645,0.045,0.355,1.0) forwards; }
```

**Reduced motion:**
```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --style-anim-enter: 0.001ms;
    --style-anim-hover: 0.001ms;
    --style-anim-slow:  0.001ms;
  }
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

**tailwind.config.ts additions:**
```ts
colors: {
  /* existing soil/forest colors kept as-is */
  "style-primary":   "var(--style-color-primary)",
  "style-secondary": "var(--style-color-secondary)",
  "style-accent":    "var(--style-color-accent)",
  "style-bg":        "var(--style-color-bg)",
  "style-surface":   "var(--style-color-surface)",
  "style-fg":        "var(--style-color-fg)",
  "style-muted":     "var(--style-color-muted)",
  "style-border":    "var(--style-color-border)",
},
borderRadius: {
  "style-card":  "var(--style-radius-card)",
  "style-btn":   "var(--style-radius-btn)",
  "style-input": "var(--style-radius-input)",
},
boxShadow: {
  "style-card":  "var(--style-shadow-card)",
  "style-hover": "var(--style-shadow-card-hover)",
  "style-focus": "var(--style-shadow-focus)",
},
```

**Todo:**
1. Append `:root { --style-* }` block + transition `:root` block
2. Write `.style-card-flat` + `.style-card-glass`
3. Write `.style-btn-*` shape classes
4. Write `@keyframes draw-line`, `page-flip-forward`, `page-flip-backward`
5. Write `.scroll-progress-bar`, `.book-page` + flip classes
6. Write `prefers-reduced-motion` block
7. Extend tailwind.config.ts

---

### Sub-Task 4 — Enhance Homepage (page.tsx)

**Status:** [ ] pending

**Animation budget per section:**
- Hero: text reveal on load (once), no looping animations, ParticleField kept for Classic Soil only (hidden by CSS when `heroPattern = none`)
- All sections: `whileInView` fade-in + translateY(-20px → 0), `once: true`, `duration: 0.4`
- Card grids: stagger 50ms per card
- Hover on cards: handled by CSS `.style-card-flat:hover` (no Framer whileHover needed)
- Stats counters: animate once on viewport entry

**What changes:**

| Section | Change |
|---------|--------|
| HeroSection | Replace hardcoded gradient classes with inline `--style-gradient-*` vars. Keep particle field. Keep SVG wave. Replace `bg-forest` button with `--style-color-secondary` button. Keep `<TextReveal>` on heading. |
| OurFocusAreasSection | Replace white card divs with `<StyleCard>`. Add `whileInView` stagger animation. |
| JoinOurCommunitySection | Replace gradient classes with vars. Replace button. |
| TestimonialsSection | Replace card divs with `<StyleCard>`. Add stagger. |
| ContactFormSection | Replace inputs/textarea with `<StyleInput>`/`<StyleTextarea>`. Wrap form in `<StyleCard>`. |
| LatestNewsSection | Replace card divs with `<StyleCard>` + existing `<TiltCard>` kept. Add stagger. |
| UpcomingEventsSection | Replace card divs with `<StyleCard>`. Add stagger. |
| StatisticsSection | Replace gradient classes with vars. Keep `<AnimatedCounter>`. No glow pulse loop. |
| NewsletterSection | Replace `<input>` with `<StyleInput>`. |

**New imports needed:**
```ts
import { StyleCard } from "@/components/ui/style-card";
import { StyleInput } from "@/components/ui/style-input";
import { StyleTextarea } from "@/components/ui/style-textarea";
import { MapPin } from "lucide-react";
```
**Remove:** `import { Card, CardContent } from "@/components/ui/card"`

**Todo:**
1. Read full current page.tsx
2. Update imports
3. Update HeroSection
4. Update OurFocusAreasSection (StyleCard + stagger)
5. Update JoinOurCommunitySection
6. Update LatestNewsSection (StyleCard)
7. Update UpcomingEventsSection (StyleCard)
8. Update StatisticsSection
9. Update NewsletterSection (StyleInput)
10. Update ContactFormSection (StyleCard + StyleInput + StyleTextarea)

---

### Sub-Task 5 — Build StyleCard Component

**Status:** [ ] pending  
**File:** `frontend/src/components/ui/style-card.tsx`

**Simplified from v2 — only 2 real modes:**
```ts
type CardVariant = "auto" | "flat" | "glass";

interface StyleCardProps {
  variant?:   CardVariant;   // "auto" reads --style-card-mode
  hover?:     boolean;       // default true — enables CSS hover (translateY -3px)
  className?: string;
  children:   React.ReactNode;
  onClick?:   () => void;
  style?:     React.CSSProperties;
}
```

**Behavior:**
- `variant="auto"`: reads `--style-card-mode` CSS var → resolves to `style-card-flat` or `style-card-glass` class
- Hover effect is entirely CSS (`.style-card-flat:hover`, `.style-card-glass:hover`) — no Framer `whileHover`
- Use `motion.div` only for scroll-triggered entrance when parent grid has stagger
- No `TiltCard` integration — removes excessive motion
- No glow prop — removed

**Todo:**
1. Create file with simplified 2-mode variant system
2. CSS-only hover (no Framer whileHover)
3. Export named + default

---

### Sub-Task 6 — Build StyleInput, StyleTextarea, StyleParagraph

**Status:** [ ] pending

**StyleInput:**
- Floating label (Framer Motion `animate` on label position)
- Focus: border → `--style-color-primary`, `box-shadow: var(--style-shadow-focus)` on wrapper
- Transitions: 150ms ease-out on border + shadow
- `forwardRef` compatible
- Props: `label?`, `error?`, `hint?`, `icon?` + all native input HTML attributes

**StyleTextarea:**
- Same focus behavior as StyleInput
- Auto-grow via `useEffect` on value changes
- `maxRows` prop (default 8)
- No resize handle

**StyleParagraph:**
- Server component (no `"use client"`)
- Props: `size?: "sm"|"base"|"lg"|"xl"`, `variant?: "default"|"lead"|"muted"|"highlight"`, `as?: "p"|"span"|"div"`
- Uses `--style-color-fg`, `--style-color-muted`, `--style-font-weight-body`, `--style-line-height-body`

**Todo:**
1. Create style-input.tsx
2. Create style-textarea.tsx
3. Create style-paragraph.tsx (no client directive)

---

### Sub-Task 7 — Build StyleUploader Component

**Status:** [ ] pending  
**File:** `frontend/src/components/ui/style-uploader.tsx`

**5 states, all transitions smooth (no shake/bounce/dramatic effects):**

| State | Animation |
|-------|-----------|
| **Idle** | Static dashed border, upload icon, text. No looping animation. |
| **Drag-over** | Border color → primary (150ms), background → subtle primary tint (150ms), scale 1.01 (200ms ease) |
| **Uploading** | Smooth `width` progress bar (Framer Motion, 300ms ease-out per tick), filename, percentage |
| **Success** | SVG checkmark `pathLength` 0→1 (500ms ease-out, draws once) |
| **Error** | Border → red (150ms). Error message. No shake animation. Retry button. |

**No dashed-border CSS animation at idle** — the original plan had a looping dash animation which violates the animation rules.

**Todo:**
1. Create file with 5 states
2. Drag handlers
3. Progress bar (Framer Motion width)
4. SVG checkmark draw
5. Theme-aware via `--style-*` vars

---

### Sub-Task 8 — Build StylePdfBook Component

**Status:** [ ] pending  
**File:** `frontend/src/components/ui/style-pdf-book.tsx`

Same as v2. The 3D page-flip is a **user-triggered** action (click/swipe) — not a looping animation, so it's acceptable.

**Todo:** Same as v2 — 10 checklist items

---

### Sub-Task 9 — Build StyleTimeline Component

**Status:** [ ] pending  
**File:** `frontend/src/components/ui/style-timeline.tsx`

**Animation updates:**
- Connecting line draws via `useScroll` `scrollYProgress` → `height` (tied to actual scroll, not a loop)
- Each card fades + translates in `whileInView` (once, 400ms ease-out)
- Node scales in `whileInView` (once, spring with low damping = one gentle pop, not bounce)

**No looping animations** on timeline nodes or connectors.

**Todo:** Same as v2 — includes BlockRenderer.tsx + default-props.ts integration

---

### Sub-Task 10 — Admin Style Themes Panel

**Status:** [ ] pending

**Updated for 8 themes + Classic Soil restore feature:**

**Critical admin feature — "Restore to Classic Soil":**
- Classic Soil card has a special **"Restore Default"** button (not just "Apply")
- Button is always available and uses a distinct color (forest green)
- Shows info text: "This is the original site design. Always restorable."
- `isProtected: true` on Classic Soil → cannot delete, no Fork button

**Tab 1: Built-in Themes**
- 8 theme cards in a responsive grid
- Each shows: name, description, preview mini-mockup, swatch strip, Apply/Restore button, Preview button
- Classic Soil card has green "Restore Default" button + lock icon
- Active theme has green checkmark badge

**Tab 2: Custom Themes**
- Fork from any built-in (except Classic Soil can be forked to create custom variant)
- JSON token editor
- Activate / Edit / Delete

**Tab 3: Live Preview**
- Theme selector + side-by-side `<StyleThemePreview>` mini-mockup
- The mockup is scoped (`--p-*` vars, not `--style-*`) so admin UI unaffected
- "Apply This Theme" button

**Sidebar:** Add `{ href: "/admin/style-themes", en: "Style Themes", ar: "أنماط التصميم", icon: Layers }` after `/admin/themes`

**AdminPageHeader fix:** Use `description` prop not `subtitle`.

**Todo:**
1. Create StyleThemePreview.tsx (compact swatch + full mini-mockup modes)
2. Create style-themes/page.tsx with 3 tabs
3. Classic Soil restore button (prominent, distinct)
4. Wire activate to `setSetting` + `applyStyleTheme` + toast
5. Add nav item to AdminSidebar (import Layers icon)

---

### Sub-Task 11 — Scroll Progress Bar & Public Layout Cleanup

**Status:** [ ] pending

**Note:** `PublicLayoutContent.tsx` already has `scrollProgress` spring state — just needs the rendered bar element.

**What to add:**
1. `<motion.div className="scroll-progress-bar" style={{ scaleX: progressBarScale }} />` — first element in public layout JSX (before `<header>`)
2. Audit section headings in page.tsx — confirm `<TextReveal>` is on each (or add where missing)
3. Confirm stagger animation on all card grids

**No** hero parallax — removed from v3 (violates animation restraint rules).

**Todo:**
1. Read PublicLayoutContent.tsx JSX return to find exact insert position
2. Add `<motion.div>` progress bar
3. Audit page.tsx headings + card grids (confirm Sub-Task 4 completed these)

---

## File Change Summary

| File | Action | Sub-Task |
|------|--------|----------|
| `frontend/src/lib/style-themes.ts` | **CREATE** | 1 |
| `frontend/src/lib/style-theme-context.tsx` | **MODIFY** | 2 |
| `frontend/src/app/globals.css` | **MODIFY** | 3 |
| `frontend/tailwind.config.ts` | **MODIFY** | 3 |
| `frontend/src/app/(public)/page.tsx` | **MODIFY** | 4 |
| `frontend/src/components/ui/style-card.tsx` | **CREATE** | 5 |
| `frontend/src/components/ui/style-input.tsx` | **CREATE** | 6 |
| `frontend/src/components/ui/style-textarea.tsx` | **CREATE** | 6 |
| `frontend/src/components/ui/style-paragraph.tsx` | **CREATE** | 6 |
| `frontend/src/components/ui/style-uploader.tsx` | **CREATE** | 7 |
| `frontend/src/components/ui/style-pdf-book.tsx` | **CREATE** | 8 |
| `frontend/src/components/ui/style-timeline.tsx` | **CREATE** | 9 |
| `frontend/src/app/admin/style-themes/page.tsx` | **CREATE** | 10 |
| `frontend/src/components/admin/StyleThemePreview.tsx` | **CREATE** | 10 |
| `frontend/src/components/layout/AdminSidebar.tsx` | **MODIFY** | 10 |
| `frontend/src/components/layout/PublicLayoutContent.tsx` | **MODIFY** | 11 |
| `frontend/src/components/page-builder/BlockRenderer.tsx` | **MODIFY** | 9 |
| `frontend/src/components/page-builder/schema/default-props.ts` | **MODIFY** | 9 |

---

## Dependency Order (Strict)

```
Sub-Task 1 — style-themes.ts (8 presets)
    ↓
Sub-Task 2 — style-theme-context.tsx (CSS var injection)
    ↓
Sub-Task 3 — globals.css + tailwind.config.ts (CSS foundation)
    ↓
Sub-Task 5 — StyleCard (needed by all sections + Timeline)
    ↓
┌─────────────────────────────────────────────┐
│  Sub-Task 4    Sub-Task 6    Sub-Task 7     │  ← parallel
│  (Homepage)   (Inputs/Para) (Uploader)      │
└─────────────────────────────────────────────┘
    ↓
┌──────────────────────────────┐
│  Sub-Task 8    Sub-Task 9   │  ← parallel
│  (PdfBook)    (Timeline)    │
└──────────────────────────────┘
    ↓
Sub-Task 10 — Admin Style Themes Panel
    ↓
Sub-Task 11 — Scroll Progress Bar
```

---

## 8 Themes at a Glance

| # | ID | Name | Background | Primary | Cards | Audience |
|---|----|------|-----------|---------|-------|----------|
| 0 | `classic-soil` | **Classic Soil** | `#FFF8E1` cream | `#3E2723` soil-dark | Flat white | Default — original site |
| 1 | `soil-glass` | **Soil Glass** | `#FAF6F0` warm | `#5D4037` brown | Frosted glass | Modern institutional |
| 2 | `academic-serif` | **Academic Serif** | `#FAFAF8` neutral | `#1A3A5C` navy | Flat clean | University / research |
| 3 | `minimal-light` | **Minimal Light** | `#FFFFFF` pure | `#111827` near-black | Hairline border | Tech / modern |
| 4 | `warm-professional` | **Warm Professional** | `#F5F4F0` stone | `#B45309` amber | Flat warm | NGO / consultancy |
| 5 | `sophisticated-dark` | **Sophisticated Dark** | `#0A0A0A` | `#E2C68A` warm gold | Subtle glass | Premium dark |
| 6 | `fresh-teal` | **Fresh Teal** | `#F0FDFA` teal-tint | `#0D9488` teal | Flat tinted | WHO/UNICEF style |
| 7 | `slate-corporate` | **Slate Corporate** | `#F8FAFC` blue-gray | `#1E40AF` corporate blue | Flat structured | Government / enterprise |
