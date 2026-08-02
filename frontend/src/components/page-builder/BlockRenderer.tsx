/**
 * BlockRenderer — the universal, recursive React renderer for the Block tree.
 *
 * This replaces PageSectionRenderer + every hardcoded *Section.tsx file.
 * It reads purely from block.props — nothing is hardcoded.
 *
 * Usage:
 *   <BlockRenderer blocks={layout.blocks} />
 *
 * Used in two contexts:
 *   1. Public pages  → read-only rendering
 *   2. Builder canvas → wrapped with selection/editing overlays
 *
 * The component is intentionally a "dumb" renderer with no editor state.
 * The builder canvas wraps it and intercepts pointer events.
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import type { Block, BlockProps, EventAction, VisibilityRule } from "@/types/block";
import toast from "react-hot-toast";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { NewsFeedBlock } from "@/components/page-builder/blocks/NewsFeedBlock";
import { EventsFeedBlock } from "@/components/page-builder/blocks/EventsFeedBlock";
import { StyleTimeline } from "@/components/ui/style-timeline";
import { Download, Users, Award, BookOpen, Calendar as CalendarIcon } from "lucide-react";
import api from "@/lib/api";
import { getContentByType } from "@/lib/public-content";
import { getPublishedEvents } from "@/lib/events";
import { getPublishedVacancies } from "@/lib/jobs";
import type { ApiResponse, BoardMember, ContentItem, Event, JobVacancy } from "@/types";
import { useIsBuilderMode } from "@/components/page-builder/BuilderModeContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown, fallback = ""): string {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

function arr<T = Record<string, unknown>>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function bool(v: unknown): boolean {
  return v === true || v === "true";
}

// ── SVG pattern backgrounds ───────────────────────────────────────────────────

function buildPatternBackground(
  pattern: string,
  color: string,
  bgColor: string,
  size: number
): React.CSSProperties {
  const c   = color   || "#3E2723";
  const bg  = bgColor || "#ffffff";
  const s   = size    || 20;
  const enc = (svg: string) =>
    `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

  switch (pattern) {
    case "dots":
      return {
        backgroundColor: bg,
        backgroundImage: enc(
          `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><circle cx='${s/2}' cy='${s/2}' r='${s/8}' fill='${c}'/></svg>`
        ),
        backgroundRepeat: "repeat",
      };
    case "grid":
      return {
        backgroundColor: bg,
        backgroundImage: enc(
          `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><rect width='${s}' height='${s}' fill='none' stroke='${c}' stroke-width='0.5'/></svg>`
        ),
        backgroundRepeat: "repeat",
      };
    case "diagonal":
      return {
        backgroundColor: bg,
        backgroundImage: enc(
          `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><line x1='0' y1='0' x2='${s}' y2='${s}' stroke='${c}' stroke-width='1'/></svg>`
        ),
        backgroundRepeat: "repeat",
      };
    case "crosshatch":
      return {
        backgroundColor: bg,
        backgroundImage: enc(
          `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><line x1='0' y1='0' x2='${s}' y2='${s}' stroke='${c}' stroke-width='1'/><line x1='${s}' y1='0' x2='0' y2='${s}' stroke='${c}' stroke-width='1'/></svg>`
        ),
        backgroundRepeat: "repeat",
      };
    case "zigzag":
      return {
        backgroundColor: bg,
        backgroundImage: enc(
          `<svg xmlns='http://www.w3.org/2000/svg' width='${s*2}' height='${s}'><polyline points='0,${s} ${s/2},0 ${s},${s} ${s*1.5},0 ${s*2},${s}' fill='none' stroke='${c}' stroke-width='1.5'/></svg>`
        ),
        backgroundRepeat: "repeat-x",
        backgroundSize: `${s * 2}px ${s}px`,
      };
    case "waves":
      return {
        backgroundColor: bg,
        backgroundImage: enc(
          `<svg xmlns='http://www.w3.org/2000/svg' width='${s*2}' height='${s}'><path d='M0 ${s/2} Q${s/2} 0 ${s} ${s/2} T${s*2} ${s/2}' fill='none' stroke='${c}' stroke-width='1.5'/></svg>`
        ),
        backgroundRepeat: "repeat-x",
        backgroundSize: `${s * 2}px ${s}px`,
      };
    default:
      return { backgroundColor: bg };
  }
}

// ── Responsive grid columns helper ───────────────────────────────────────────

/** Returns a Tailwind-compatible `gridTemplateColumns` class based on viewport.
 *  Since we can't inject dynamic Tailwind classes at runtime, we use inline styles
 *  with a CSS custom-property approach driven by CSS media queries injected once. */
function useResponsiveGridCols(props: BlockProps): React.CSSProperties | undefined {
  const mobile  = num(props.colsMobile,  0);
  const tablet  = num(props.colsTablet,  0);
  const desktop = num(props.colsDesktop, 0);
  if (!mobile && !tablet && !desktop) return undefined;
  // Use CSS custom properties that a <style> tag (injected once globally) can override per breakpoint.
  // We set --grid-cols to the most specific defined value using inline style.
  // The fallback chain: desktop → tablet → mobile → block default.
  const cols = desktop || tablet || mobile;
  return cols ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` } : undefined;
}

// ── Inject responsive grid CSS once ──────────────────────────────────────────

let _responsiveStyleInjected = false;
function injectResponsiveGridStyle() {
  if (_responsiveStyleInjected || typeof document === "undefined") return;
  _responsiveStyleInjected = true;
  const style = document.createElement("style");
  style.id = "block-responsive-grid";
  style.textContent = `
    .resp-grid[data-cols-mobile]  { grid-template-columns: repeat(var(--cols-mobile,  1), minmax(0,1fr)); }
    .resp-grid[data-cols-tablet]  { grid-template-columns: repeat(var(--cols-tablet,  var(--cols-mobile,  1)), minmax(0,1fr)); }
    .resp-grid[data-cols-desktop] { grid-template-columns: repeat(var(--cols-desktop, var(--cols-tablet, var(--cols-mobile, 1))), minmax(0,1fr)); }
    @media (min-width: 768px)  { .resp-grid { grid-template-columns: repeat(var(--cols-tablet,  var(--cols-mobile,  1)), minmax(0,1fr)); } }
    @media (min-width: 1024px) { .resp-grid { grid-template-columns: repeat(var(--cols-desktop, var(--cols-tablet, var(--cols-mobile, 1))), minmax(0,1fr)); } }
  `;
  document.head.appendChild(style);
}

/** Build an inline style object from standard style props */
function styleFromProps(p: BlockProps): React.CSSProperties {
  const st: React.CSSProperties = {};

  if (p.paddingTop)    st.paddingTop    = str(p.paddingTop);
  if (p.paddingBottom) st.paddingBottom = str(p.paddingBottom);
  if (p.paddingLeft)   st.paddingLeft   = str(p.paddingLeft);
  if (p.paddingRight)  st.paddingRight  = str(p.paddingRight);
  if (p.marginTop)     st.marginTop     = str(p.marginTop);
  if (p.marginBottom)  st.marginBottom  = str(p.marginBottom);
  if (p.maxWidth)      st.maxWidth      = str(p.maxWidth);
  if (p.minHeight)     st.minHeight     = str(p.minHeight);
  if (p.textColor)     st.color         = str(p.textColor);
  if (p.fontSize)      st.fontSize      = str(p.fontSize);
  if (p.fontWeight)    st.fontWeight    = str(p.fontWeight) as React.CSSProperties["fontWeight"];
  if (p.borderRadius)  st.borderRadius  = str(p.borderRadius);
  if (p.borderWidth)   st.borderWidth   = str(p.borderWidth);
  if (p.borderColor)   st.borderColor   = str(p.borderColor);
  if (p.borderWidth || p.borderColor) st.borderStyle = "solid";
  if (p.boxShadow)     st.boxShadow     = str(p.boxShadow);

  // Background
  const bgType = str(p.bgType);
  if (bgType === "solid" && p.backgroundColor) {
    st.backgroundColor = str(p.backgroundColor);
  } else if (bgType === "gradient" && p.backgroundGradient) {
    st.backgroundImage = str(p.backgroundGradient);
  } else if (bgType === "image" && p.backgroundImageUrl) {
    st.backgroundImage    = `url(${str(p.backgroundImageUrl)})`;
    st.backgroundSize     = str(p.backgroundSize, "cover");
    st.backgroundPosition = "center";
    st.backgroundRepeat   = "no-repeat";
  } else if (bgType === "pattern") {
    Object.assign(st, buildPatternBackground(
      str(p.backgroundPattern),
      str(p.patternColor),
      str(p.patternBgColor),
      num(p.patternSize, 20)
    ));
  }

  // Inline CSS override (applied last intentionally)
  const inlineCss = str(p.inlineCss);
  if (inlineCss) {
    for (const pair of inlineCss.split(";").map((s) => s.trim()).filter(Boolean)) {
      const colonIdx = pair.indexOf(":");
      if (colonIdx === -1) continue;
      const key = pair.slice(0, colonIdx).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const val = pair.slice(colonIdx + 1).trim();
      if (key && val) (st as Record<string, string>)[key] = val;
    }
  }

  return st;
}

// ─── Bilingual prop resolver ───────────────────────────────────────────────────

function useBilingual(props: BlockProps) {
  const { language } = useLanguage();

  /**
   * Language-aware field resolver.
   *
   * For a key like "title":
   *   Arabic  → props.titleAr  → props.titleEn → props.title
   *   English → props.titleEn  → props.title   → props.titleAr (last resort)
   *
   * This handles both naming conventions:
   *   - titleEn / titleAr  (new bilingual props from DB sections)
   *   - title / titleAr    (older convention where `title` = English)
   */
  function bil(key: string): string {
    if (language === "ar") {
      const ar = str(props[`${key}Ar`]);
      if (ar) return ar;
      // fallback: En variant then base key
      const en = str(props[`${key}En`]);
      if (en) return en;
      return str(props[key]);
    } else {
      // English mode: prefer explicit En variant, then base key, avoid Ar
      const en = str(props[`${key}En`]);
      if (en) return en;
      return str(props[key]);
    }
  }

  return bil;
}

// ─── Event action executor ────────────────────────────────────────────────────

/** Parse block.props.events, which may be a JSON string or already an object */
function parseOnClick(props: BlockProps): EventAction | undefined {
  const raw = props.events;
  let eventsObj: { onClick?: EventAction } = {};
  if (!raw) return undefined;
  if (typeof raw === "string") {
    try { eventsObj = JSON.parse(raw); } catch { return undefined; }
  } else if (typeof raw === "object" && raw !== null) {
    eventsObj = raw as { onClick?: EventAction };
  }
  return eventsObj.onClick;
}

/** Returns a stable click handler for the given EventAction, or undefined */
function useEventHandler(action: EventAction | undefined): ((e: React.MouseEvent) => void) | undefined {
  const router = useRouter();

  return useCallback(
    (e: React.MouseEvent) => {
      if (!action) return;
      e.preventDefault();

      switch (action.type) {
        case "navigate":
          if (action.target === "_blank") {
            window.open(action.url, "_blank", "noopener,noreferrer");
          } else {
            router.push(action.url);
          }
          break;

        case "scroll":
          document.getElementById(action.anchor)?.scrollIntoView({ behavior: "smooth" });
          break;

        case "toggle": {
          const el = document.getElementById(action.targetId);
          if (el) {
            el.style.display = el.style.display === "none" ? "" : "none";
          }
          break;
        }

        case "download": {
          const a = document.createElement("a");
          a.href = action.url;
          if (action.filename) a.download = action.filename;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          break;
        }

        case "clipboard":
          navigator.clipboard.writeText(action.text).then(
            () => toast.success("Copied to clipboard!"),
            () => toast.error("Failed to copy.")
          );
          break;

        case "api": {
          const opts: RequestInit = { method: action.method };
          if (action.body && (action.method === "POST" || action.method === "PUT")) {
            opts.headers = { "Content-Type": "application/json" };
            opts.body = action.body;
          }
          fetch(action.url, opts)
            .then((res) => {
              if (!res.ok) throw new Error(res.statusText);
              toast.success(action.successMsg || "Done!");
            })
            .catch(() => {
              toast.error(action.errorMsg || "Action failed. Please try again.");
            });
          break;
        }

        case "modal":
          // Modal support is a future enhancement; no-op for now
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action, router]
  );
}

// ─── Visibility rule evaluation ──────────────────────────────────────────────

/**
 * Determines the current device category based on window.innerWidth.
 * mobile:  < 768px
 * tablet:  768–1024px
 * desktop: > 1024px
 */
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w <= 1024) return "tablet";
  return "desktop";
}

/**
 * Maps backend role strings to VisibilityRule auth levels.
 * Returns true if the user satisfies the required level.
 */
function checkAuthLevel(
  userRole: string | null | undefined,
  level: "loggedIn" | "loggedOut" | "member" | "editor" | "publisher" | "admin"
): boolean {
  const ROLE_HIERARCHY: Record<string, number> = {
    loggedOut:  0,
    loggedIn:   1,
    member:     2,
    editor:     3,
    publisher:  4,
    admin:      5,
  };

  const BACKEND_TO_LEVEL: Record<string, string> = {
    USER:      "member",
    EDITOR:    "editor",
    PUBLISHER: "publisher",
    ADMIN:     "admin",
  };

  if (level === "loggedOut") {
    // Rule passes only when user is NOT logged in
    return !userRole;
  }

  if (!userRole) return false; // all other levels require login

  const userLevel = BACKEND_TO_LEVEL[userRole] ?? "member";
  return (ROLE_HIERARCHY[userLevel] ?? 0) >= (ROLE_HIERARCHY[level] ?? 0);
}

/**
 * Evaluates all visibility rules with AND logic.
 * Returns true if the block should be shown, false if it should be hidden.
 */
function evaluateVisibilityRules(
  rules: unknown[],
  userRole: string | null | undefined
): boolean {
  for (const rawRule of rules) {
    if (!rawRule || typeof rawRule !== "object") continue;
    const rule = rawRule as Record<string, unknown>;

    switch (rule.type) {
      case "auth": {
        const level = String(rule.level ?? "loggedIn") as "loggedIn" | "loggedOut" | "member" | "editor" | "publisher" | "admin";
        if (!checkAuthLevel(userRole, level)) return false;
        break;
      }
      case "dateRange": {
        const now = new Date();
        if (rule.start) {
          const start = new Date(String(rule.start));
          if (!isNaN(start.getTime()) && now < start) return false;
        }
        if (rule.end) {
          const end = new Date(String(rule.end));
          // treat end date as end-of-day
          end.setHours(23, 59, 59, 999);
          if (!isNaN(end.getTime()) && now > end) return false;
        }
        break;
      }
      case "device": {
        const required = String(rule.device ?? "desktop");
        if (getDeviceType() !== required) return false;
        break;
      }
      default:
        break;
    }
  }
  return true;
}

// ─── BlockRenderer ────────────────────────────────────────────────────────────

export interface BlockRendererProps {
  blocks: Block[];
  /** When true, skips visibility filtering (used in builder canvas) */
  ignoreVisibility?: boolean;
}

export function BlockRenderer({ blocks, ignoreVisibility = false }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => (
        <SingleBlock key={block.id} block={block} ignoreVisibility={ignoreVisibility} />
      ))}
    </>
  );
}

// ─── Animation variants ───────────────────────────────────────────────────────

const ANIMATION_VARIANTS: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    show:   { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 40 },
    show:   { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -40 },
    show:   { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 40 },
    show:   { opacity: 1, x: 0 },
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.8 },
    show:   { opacity: 1, scale: 1 },
  },
  bounce: {
    hidden: { opacity: 0, y: 30 },
    show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 10 } },
  },
};

// ─── SingleBlock ──────────────────────────────────────────────────────────────

function SingleBlock({ block, ignoreVisibility }: { block: Block; ignoreVisibility: boolean }) {
  const visibility = str(block.props.visibility, "ALWAYS");
  const { user } = useAuth();

  if (!ignoreVisibility) {
    // Legacy single-select visibility field
    if (visibility === "HIDDEN") return null;

    // Evaluate visibilityRules array (AND logic — all rules must pass)
    const rawRules = block.props.visibilityRules;
    if (Array.isArray(rawRules) && rawRules.length > 0) {
      if (!evaluateVisibilityRules(rawRules, user?.role ?? null)) return null;
    }
  }

  const animation        = str(block.props.animation);
  const animationTrigger = str(block.props.animationTrigger, "scroll");
  const animationDelay   = num(block.props.animationDelay, 0);
  const animationDuration = num(block.props.animationDuration, 600);

  const variants = animation ? ANIMATION_VARIANTS[animation] : undefined;

  // When animation is configured, wrap the block in a motion.div.
  // In the builder canvas (ignoreVisibility=true) we always animate so editors can preview.
  if (animation && variants) {
    const isScroll = animationTrigger === "scroll";
    const transition = {
      duration: animationDuration / 1000,
      delay: animationDelay / 1000,
    };

    if (isScroll) {
      return (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={variants}
          transition={transition}
        >
          <BlockSwitch block={block} ignoreVisibility={ignoreVisibility} />
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial="hidden"
          animate="show"
          variants={variants}
          transition={transition}
        >
          <BlockSwitch block={block} ignoreVisibility={ignoreVisibility} />
        </motion.div>
      );
    }
  }

  return <BlockSwitch block={block} ignoreVisibility={ignoreVisibility} />;
}

// ─── Per-block rendering ──────────────────────────────────────────────────────

function BlockSwitch({ block, ignoreVisibility }: { block: Block; ignoreVisibility: boolean }) {
  const { type, props, children = [] } = block;
  const bil = useBilingual(props);
  const { language } = useLanguageHook();
  const style = styleFromProps(props);
  const cssClass = str(props.cssClass);
  const htmlId = str(props.htmlId) || undefined;

  const textAlignClass =
    props.textAlign === "center" ? "text-center"
    : props.textAlign === "right" ? "text-right"
    : props.textAlign === "left"  ? "text-left"
    : "";

  // Event action handler (used by interactive block types)
  const clickAction = parseOnClick(props);
  const handleClick = useEventHandler(clickAction);
  const clickProps = handleClick ? { onClick: handleClick, style: { cursor: "pointer" } } : {};

  const renderChildren = () => (
    <BlockRenderer blocks={children} ignoreVisibility={ignoreVisibility} />
  );

  switch (type) {

    // ─── Layout containers ───────────────────────────────────────────────────

    case "section": {
      const maxWidth = str(props.maxWidth, "max-w-6xl");
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {bil("title") && (
              <h2 className={`font-heading text-3xl font-bold mb-2 ${textAlignClass}`}>
                {bil("title")}
              </h2>
            )}
            {bil("subtitle") && (
              <p className={`text-muted-foreground mb-8 ${textAlignClass}`}>{bil("subtitle")}</p>
            )}
            {renderChildren()}
          </div>
        </section>
      );
    }

    case "row": {
      const gap     = str(props.gap, "1.5rem");
      const wrap    = str(props.wrap, "wrap");
      const align   = str(props.align, "stretch");
      const justify = str(props.justify, "start");
      return (
        <div
          id={htmlId}
          className={cssClass}
          style={{
            ...style,
            display: "flex",
            flexWrap: wrap as any,
            alignItems: align,
            justifyContent: justify,
            gap,
          }}
        >
          {renderChildren()}
        </div>
      );
    }

    case "column": {
      const width    = str(props.width);
      const flexGrow = num(props.flexGrow, 1);
      const colStyle: React.CSSProperties = {
        ...style,
        flexGrow: width ? 0 : flexGrow,
        flexBasis: width || "auto",
        minWidth: 0,
      };
      return (
        <div id={htmlId} className={cssClass} style={colStyle}>
          {renderChildren()}
        </div>
      );
    }

    case "grid": {
      const cols        = num(props.columns, 3);
      const gap         = str(props.gap, "1.5rem");
      const maxWidth    = str(props.maxWidth, "max-w-6xl");
      // Responsive columns: colsMobile / colsTablet / colsDesktop override the default
      const mobile  = num(props.colsMobile,  0);
      const tablet  = num(props.colsTablet,  0);
      const desktop = num(props.colsDesktop, 0) || cols;
      injectResponsiveGridStyle();
      const dataAttrs: Record<string, number> = {};
      if (mobile)  dataAttrs["data-cols-mobile"]  = mobile;
      if (tablet)  dataAttrs["data-cols-tablet"]  = tablet;
      if (desktop) dataAttrs["data-cols-desktop"] = desktop;
      const cssVarStyle: React.CSSProperties = {
        ...(mobile  ? { ["--cols-mobile"  as string]: String(mobile)  } : {}),
        ...(tablet  ? { ["--cols-tablet"  as string]: String(tablet)  } : {}),
        ...(desktop ? { ["--cols-desktop" as string]: String(desktop) } : {}),
        gridTemplateColumns: `repeat(${mobile || cols}, minmax(0, 1fr))`,
        gap,
      };
      return (
        <div id={htmlId} className={`container mx-auto px-4 ${maxWidth} ${cssClass}`} style={style}>
          <div className="grid resp-grid" style={cssVarStyle} {...dataAttrs}>
            {renderChildren()}
          </div>
        </div>
      );
    }

    case "flexbox": {
      const direction = str(props.direction, "row");
      const wrap      = str(props.wrap, "wrap");
      const justify   = str(props.justify, "start");
      const align     = str(props.align, "stretch");
      const gap       = str(props.gap, "1rem");
      const maxWidth  = str(props.maxWidth, "max-w-6xl");
      return (
        <div id={htmlId} className={`container mx-auto px-4 ${maxWidth} ${cssClass}`} style={style}>
          <div style={{ display: "flex", flexDirection: direction as any, flexWrap: wrap as any, justifyContent: justify, alignItems: align, gap }}>
            {renderChildren()}
          </div>
        </div>
      );
    }

    case "card-group": {
      const cols       = num(props.columns, 3);
      const colsMobile = num(props.columnsMobile, 1);
      const gap        = str(props.gap, "1.5rem");
      const maxWidth   = str(props.maxWidth, "max-w-6xl");
      return (
        <div id={htmlId} className={`${cssClass}`} style={style}>
          {(bil("title")) && (
            <div className={`container mx-auto px-4 ${maxWidth} mb-8`}>
              <h2 className={`font-heading text-3xl font-bold ${textAlignClass}`}>{bil("title")}</h2>
            </div>
          )}
          <div
            className={`container mx-auto px-4 ${maxWidth} grid`}
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}
          >
            {renderChildren()}
          </div>
        </div>
      );
    }

    case "tabs": {
      return <TabsBlock block={block} renderChildren={renderChildren} />;
    }

    // ─── Content leaf blocks ─────────────────────────────────────────────────

    case "heading": {
      const level = Math.min(Math.max(num(props.level, 2), 1), 6);
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag id={htmlId} className={`font-heading font-${str(props.fontWeight, "bold")} ${textAlignClass} ${cssClass}`} style={style}>
          {bil("text")}
        </Tag>
      );
    }

    case "paragraph": {
      return (
        <p id={htmlId} className={`leading-relaxed ${textAlignClass} ${cssClass}`} style={style}>
          {bil("text")}
        </p>
      );
    }

    case "rich-text": {
      const html = str(props.htmlAr && props.htmlAr !== "" ? bil("html") : str(props.html));
      return (
        <div
          id={htmlId}
          className={`prose max-w-none ${cssClass}`}
          style={style}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    case "image": {
      const src     = str(props.src);
      const alt     = str(props.alt, "Image");
      const caption = str(props.caption);
      const link    = str(props.link);
      const objFit  = str(props.objectFit, "cover");
      const maxH    = str(props.maxHeight, "500px");
      const img = (
        <img
          src={src || undefined}
          alt={alt}
          loading="lazy"
          className={`w-full h-auto rounded-lg ${cssClass}`}
          style={{ ...style, maxHeight: maxH, objectFit: objFit as any }}
        />
      );
      // If event action is configured, wrap in a clickable div instead of a link
      if (clickAction) {
        return (
          <figure id={htmlId} className={textAlignClass} {...clickProps}>
            {src ? img : <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">No image</div>}
            {caption && <figcaption className="text-center text-sm text-muted-foreground mt-2">{caption}</figcaption>}
          </figure>
        );
      }
      return (
        <figure id={htmlId} className={textAlignClass}>
          {src ? (link ? <a href={link}>{img}</a> : img) : (
            <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">No image</div>
          )}
          {caption && <figcaption className="text-center text-sm text-muted-foreground mt-2">{caption}</figcaption>}
        </figure>
      );
    }

    case "video": {
      const src = str(props.src);
      return (
        <div id={htmlId} className={cssClass} style={style}>
          {src ? (
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe src={src} title={str(props.caption)} className="w-full h-full" allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">No video URL</div>
          )}
          {bil("caption") && <p className="text-sm text-muted-foreground text-center mt-2">{bil("caption")}</p>}
        </div>
      );
    }

    case "button": {
      const href    = str(props.href, "#");
      const target  = str(props.target, "_self");
      const variant = str(props.variant, "primary");
      const variantClass =
        variant === "outline"   ? "border-2 border-soil-dark text-soil-dark hover:bg-soil-dark hover:text-white"
        : variant === "secondary" ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
        : variant === "ghost"     ? "text-soil-dark hover:bg-soil-dark/10"
        : "bg-soil-dark text-white hover:opacity-90";

      const btnStyle: React.CSSProperties = {};
      if (props.bgColor)   btnStyle.backgroundColor = str(props.bgColor);
      if (props.textColor) btnStyle.color           = str(props.textColor);
      if (props.borderRadius) btnStyle.borderRadius  = str(props.borderRadius);

      // If event action is configured, use a button element instead of an anchor
      if (clickAction) {
        return (
          <div id={htmlId} className={`${textAlignClass} ${cssClass}`} style={style}>
            <button type="button" onClick={handleClick}
              className={`inline-block px-6 py-3 rounded-lg font-medium transition-all ${variantClass}`}
              style={btnStyle}>
              {bil("label") || "Button"}
            </button>
          </div>
        );
      }
      return (
        <div id={htmlId} className={`${textAlignClass} ${cssClass}`} style={style}>
          <a href={href} target={target}
            className={`inline-block px-6 py-3 rounded-lg font-medium transition-all ${variantClass}`}
            style={btnStyle}>
            {bil("label") || "Button"}
          </a>
        </div>
      );
    }

    case "divider": {
      return (
        <div id={htmlId} className={cssClass} style={{ ...style, textAlign: "center" }}>
          <hr
            style={{
              width: str(props.width, "100%"),
              borderWidth: str(props.thickness, "1px"),
              borderColor: str(props.lineColor, "#e5e7eb"),
              display: "inline-block",
              margin: "0 auto",
            }}
          />
        </div>
      );
    }

    case "spacer":
      return <div id={htmlId} style={{ height: str(props.height, "2rem") }} />;

    case "blockquote": {
      return (
        <blockquote id={htmlId} className={`border-l-4 pl-6 italic ${cssClass}`}
          style={{ ...style, borderColor: str(props.accentColor, "#8B4513") }}>
          <p className="text-lg">{bil("text")}</p>
          {bil("attribution") && (
            <footer className="text-sm text-muted-foreground mt-2">— {bil("attribution")}</footer>
          )}
        </blockquote>
      );
    }

    case "alert": {
      const variant = str(props.variant, "info");
      const alertColors: Record<string, string> = {
        info:    "bg-blue-50 border-blue-200 text-blue-800",
        success: "bg-green-50 border-green-200 text-green-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
        error:   "bg-red-50 border-red-200 text-red-800",
      };
      return (
        <div id={htmlId} className={`border rounded-lg px-4 py-3 text-sm ${alertColors[variant] ?? alertColors.info} ${cssClass}`} style={style}>
          {bil("title") && <strong className="block font-semibold mb-1">{bil("title")}</strong>}
          {bil("message")}
        </div>
      );
    }

    case "banner": {
      const bgImg = str(props.backgroundImage);
      return (
        <div id={htmlId} className={`relative overflow-hidden ${cssClass}`} style={style} {...clickProps}>
          {bgImg && (
            <div className="absolute inset-0">
              <img src={bgImg} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50" />
            </div>
          )}
          <div className={`relative z-10 container mx-auto px-4 py-12 ${textAlignClass}`}>
            {bil("title") && <h2 className={`font-heading text-2xl font-bold mb-2 ${bgImg ? "text-white" : ""}`}>{bil("title")}</h2>}
            {bil("text")  && <p className={`mb-4 ${bgImg ? "text-white/80" : "text-muted-foreground"}`}>{bil("text")}</p>}
            {bil("buttonLabel") && (
              <a href={str(props.buttonUrl, "#")} className="inline-block px-6 py-2 bg-soil-dark text-white rounded-lg text-sm font-medium hover:opacity-90">
                {bil("buttonLabel")}
              </a>
            )}
          </div>
        </div>
      );
    }

    case "hero": {
      const bgImg    = str(props.backgroundImage);
      const overlay  = str(props.overlayColor, "rgba(0,0,0,0.4)");
      const minH     = str(props.minHeight, "480px");
      const maxWidth = str(props.maxWidth, "max-w-5xl");
      return (
        <section id={htmlId} className={`relative overflow-hidden flex items-center ${cssClass}`}
          style={{ ...style, minHeight: minH }} {...clickProps}>
          {bgImg && (
            <div className="absolute inset-0">
              <img src={bgImg} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ backgroundColor: overlay }} />
            </div>
          )}
          <div className={`container mx-auto px-4 ${maxWidth} relative z-10 ${textAlignClass} py-16`}>
            {bil("title") && (
              <h1 className={`font-heading text-4xl md:text-5xl font-bold mb-4 ${bgImg ? "text-white" : "text-soil-dark"}`}>
                {bil("title")}
              </h1>
            )}
            {bil("subtitle") && (
              <p className={`text-lg max-w-3xl mx-auto mb-6 ${bgImg ? "text-white/80" : "text-muted-foreground"}`}>
                {bil("subtitle")}
              </p>
            )}
            {bil("buttonLabel") && (
              <a href={str(props.buttonUrl, "#")} className="inline-block px-8 py-3 bg-white text-soil-dark rounded-lg font-medium hover:bg-gray-100">
                {bil("buttonLabel")}
              </a>
            )}
          </div>
        </section>
      );
    }

    case "cta": {
      const maxWidth = str(props.maxWidth, "max-w-4xl");
      return (
        <section id={htmlId} className={cssClass} style={style} {...clickProps}>
          <div className={`container mx-auto px-4 ${maxWidth} ${textAlignClass} py-12`}>
            {bil("title") && <h2 className="font-heading text-3xl font-bold mb-4">{bil("title")}</h2>}
            {bil("text")  && <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{bil("text")}</p>}
            {bil("buttonLabel") && (
              <a href={str(props.buttonUrl, "#")} className="inline-block px-8 py-3 bg-soil-dark text-white rounded-lg font-medium hover:opacity-90">
                {bil("buttonLabel")}
              </a>
            )}
          </div>
        </section>
      );
    }

    case "card": {
      const image = str(props.image);
      return (
        <div id={htmlId} className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${cssClass}`} style={style} {...clickProps}>
          {image && <img src={image} alt={str(props.imageAlt)} loading="lazy" className="w-full h-48 object-cover" />}
          <div className="p-6">
            {str(props.badge) && <span className="inline-block mb-2 text-xs font-medium px-2 py-0.5 bg-soil-sand/50 rounded-full text-soil-dark">{str(props.badge)}</span>}
            {bil("title")    && <h3 className="font-heading text-lg font-bold mb-1">{bil("title")}</h3>}
            {bil("subtitle") && <p className="text-sm text-muted-foreground mb-2">{bil("subtitle")}</p>}
            {bil("text")     && <p className="text-sm text-muted-foreground">{bil("text")}</p>}
            {bil("buttonLabel") && (
              <a href={str(props.buttonUrl, "#")} className="inline-block mt-4 px-4 py-2 bg-soil-dark text-white rounded-lg text-sm font-medium hover:opacity-90">
                {bil("buttonLabel")}
              </a>
            )}
          </div>
        </div>
      );
    }

    // ─── Repeating-item blocks ───────────────────────────────────────────────

    case "stats":
    case "counter": {
      const cols     = num(props.columns, 4);
      const maxWidth = str(props.maxWidth, "max-w-5xl");
      const items    = arr<Record<string, unknown>>(props.items);
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {bil("title") && <h2 className={`font-heading text-3xl font-bold mb-8 ${textAlignClass}`}>{bil("title")}</h2>}
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {items.map((item, i) => (
                <div key={i} className="text-center">
                  {str(item.icon) && <div className="text-3xl mb-2">{str(item.icon)}</div>}
                  <p className="text-3xl font-bold text-soil-dark">{str(item.value)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{str(item.label)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "team": {
      const cols     = num(props.columns, 4);
      const maxWidth = str(props.maxWidth, "max-w-6xl");
      const items    = arr<Record<string, unknown>>(props.items);
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {bil("title") && <h2 className={`font-heading text-3xl font-bold mb-8 ${textAlignClass}`}>{bil("title")}</h2>}
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {items.map((item, i) => {
                const name = language === "ar" && str(item.nameAr) ? str(item.nameAr) : str(item.name);
                const role = language === "ar" && str(item.roleAr) ? str(item.roleAr) : str(item.role);
                return (
                  <div key={i} className="text-center">
                    {str(item.avatar) ? (
                      <img src={str(item.avatar)} alt={name} loading="lazy" className="w-24 h-24 rounded-full mx-auto object-cover mb-3" />
                    ) : (
                      <div className="w-24 h-24 rounded-full mx-auto bg-soil-dark/10 flex items-center justify-center mb-3 text-2xl text-soil-dark font-bold">
                        {name.charAt(0) || "?"}
                      </div>
                    )}
                    {name && <h3 className="font-bold">{name}</h3>}
                    {role && <p className="text-sm text-muted-foreground">{role}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    case "testimonial": {
      const maxWidth = str(props.maxWidth, "max-w-6xl");
      const items    = arr<Record<string, unknown>>(props.items);
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {bil("title") && <h2 className={`font-heading text-3xl font-bold mb-8 ${textAlignClass}`}>{bil("title")}</h2>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, i) => (
                <div key={i} className="border rounded-xl p-6 shadow-sm">
                  <p className="text-muted-foreground italic mb-4">&ldquo;{str(item.quote)}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {str(item.avatar) && <img src={str(item.avatar)} alt="" loading="lazy" className="w-10 h-10 rounded-full object-cover" />}
                    <div>
                      <p className="font-medium text-sm">{str(item.name)}</p>
                      {str(item.role) && <p className="text-xs text-muted-foreground">{str(item.role)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "accordion": {
      const maxWidth = str(props.maxWidth, "max-w-3xl");
      const items    = arr<Record<string, unknown>>(props.items);
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {bil("title") && <h2 className={`font-heading text-3xl font-bold mb-8 ${textAlignClass}`}>{bil("title")}</h2>}
            <div className="space-y-2">
              {items.map((item, i) => (
                <AccordionItem key={i} titleEn={str(item.title)} titleAr={str(item.titleAr)}
                  contentEn={str(item.content)} contentAr={str(item.contentAr)} />
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "faq": {
      const maxWidth = str(props.maxWidth, "max-w-3xl");
      const items    = arr<Record<string, unknown>>(props.items);
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {bil("title") && <h2 className={`font-heading text-3xl font-bold mb-8 ${textAlignClass}`}>{bil("title")}</h2>}
            <div className="space-y-3">
              {items.map((item, i) => (
                <AccordionItem key={i} titleEn={str(item.question)} titleAr={str(item.questionAr)}
                  contentEn={str(item.answer)} contentAr={str(item.answerAr)} />
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "timeline": {
      const maxWidth    = str(props.maxWidth, "max-w-3xl");
      const orientation = (str(props.orientation, "vertical") === "horizontal" ? "horizontal" : "vertical") as "vertical" | "horizontal";
      const items       = arr<Record<string, unknown>>(props.items).map((item) => ({
        id:      str(item.id) || undefined,
        date:    str(item.date) || undefined,
        title:   str(item.title) || undefined,
        content: str(item.content) || undefined,
        badge:   str(item.badge) || undefined,
      }));
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className="container mx-auto px-4">
            {bil("title") && <h2 className={`font-heading text-3xl font-bold mb-8 ${textAlignClass}`}>{bil("title")}</h2>}
            <StyleTimeline items={items} orientation={orientation} maxWidth={maxWidth} />
          </div>
        </section>
      );
    }

    case "gallery": {
      const cols        = num(props.columns, 3);
      const maxWidth    = str(props.maxWidth, "max-w-6xl");
      const items       = arr<Record<string, unknown>>(props.items);
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {bil("title") && <h2 className={`font-heading text-3xl font-bold mb-8 ${textAlignClass}`}>{bil("title")}</h2>}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {items.map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg">
                  {str(img.src) ? (
                    <img src={str(img.src)} alt={str(img.alt)} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No image</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "carousel":
    case "slideshow": {
      const maxWidth = str(props.maxWidth, "max-w-6xl");
      const items    = arr<Record<string, unknown>>(props.items);
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {bil("title") && <h2 className={`font-heading text-3xl font-bold mb-8 ${textAlignClass}`}>{bil("title")}</h2>}
            <div className="overflow-x-auto flex gap-4 snap-x snap-mandatory pb-4">
              {items.map((slide, i) => (
                <div key={i} className="flex-none w-80 snap-center rounded-lg overflow-hidden bg-gray-100">
                  {str(slide.src) && <img src={str(slide.src)} alt={str(slide.title)} loading="lazy" className="w-full h-48 object-cover" />}
                  <div className="p-4">
                    {str(slide.title)   && <h3 className="font-bold">{str(slide.title)}</h3>}
                    {str(slide.content) && <p className="text-sm text-muted-foreground">{str(slide.content)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "progress": {
      const maxWidth = str(props.maxWidth, "max-w-3xl");
      const items    = arr<Record<string, unknown>>(props.items);
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {bil("title") && <h3 className="font-heading font-bold mb-4">{bil("title")}</h3>}
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{str(item.label)}</span>
                    <span>{str(item.value)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${num(item.value, 0)}%`, backgroundColor: str(item.color) || "#8B4513" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "pricing-table": {
      const maxWidth = str(props.maxWidth, "max-w-5xl");
      const items    = arr<Record<string, unknown>>(props.items);
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {bil("title") && <h2 className={`font-heading text-3xl font-bold mb-8 ${textAlignClass}`}>{bil("title")}</h2>}
            <div className="grid md:grid-cols-3 gap-6">
              {items.map((plan, i) => (
                <div key={i} className={`border rounded-xl p-6 text-center ${bool(plan.featured) ? "ring-2 ring-soil-dark shadow-lg" : ""}`}>
                  {str(plan.name) && <h3 className="font-heading text-xl font-bold">{str(plan.name)}</h3>}
                  {str(plan.price) && <p className="text-3xl font-bold my-4">{str(plan.price)}<span className="text-sm text-muted-foreground">{str(plan.period)}</span></p>}
                  {str(plan.description) && <p className="text-sm text-muted-foreground mb-4">{str(plan.description)}</p>}
                  {str(plan.cta) && (
                    <a href={str(plan.url, "#")} className={`inline-block px-6 py-2 rounded-lg text-sm font-medium ${bool(plan.featured) ? "bg-soil-dark text-white" : "border border-soil-dark text-soil-dark"} hover:opacity-90`}>
                      {str(plan.cta)}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "map": {
      const maxWidth  = str(props.maxWidth, "max-w-5xl");
      const embedUrl  = str(props.embedUrl);
      const address   = bil("title") || str(props.address);
      return (
        <section id={htmlId} className={cssClass} style={style}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            {address && !embedUrl && <h2 className={`font-heading text-3xl font-bold mb-6 ${textAlignClass}`}>{address}</h2>}
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
              {embedUrl ? (
                <iframe src={embedUrl} className="w-full h-full" style={{ border: 0 }} allowFullScreen loading="lazy" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  📍 {address || "No embed URL configured"}
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    // ─── Dynamic feed blocks ─────────────────────────────────────────────────

    case "news-feed":
      return <NewsFeedBlock block={block} />;

    case "events-feed":
      return <EventsFeedBlock block={block} />;

    case "contact-form":
      return (
        <section id={htmlId} className={cssClass} style={style}>
          {bil("title") && (
            <div className="container mx-auto px-4 max-w-2xl pt-8">
              <h2 className={`font-heading text-3xl font-bold mb-8 ${textAlignClass}`}>{bil("title")}</h2>
            </div>
          )}
          <ContactFormInline showPhone={bool(props.showPhone ?? true)} showSubject={bool(props.showSubject ?? true)} />
        </section>
      );

    case "newsletter-form":
      return <NewsletterFormBlock block={block} />;

    // ─── Legacy section types — now rendered props-driven, no legacy components ──

    // ── Hero banner variants ─────────────────────────────────────────────────
    case "about-hero-banner":
    case "board-hero-banner":
    case "contact-hero-banner":
    case "newsletter-hero-banner":
    case "publications-hero-banner":
    case "president-message-hero-banner": {
      const bgImg   = str(props.backgroundImage);
      const overlay = str(props.overlayColor, "rgba(0,0,0,0.55)");
      const minH    = str(props.minHeight, "380px");
      const isPresidentHero = block.type === "president-message-hero-banner";
      return (
        <section id={htmlId} className={`relative overflow-hidden flex items-center bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white ${cssClass}`}
          style={{ ...style, minHeight: isPresidentHero ? "420px" : minH }}>
          {bgImg && (
            <div className="absolute inset-0">
              <img src={bgImg} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0" style={{ backgroundColor: overlay }} />
            </div>
          )}
          {!bgImg && <div className="absolute inset-0 opacity-30 bg-noise" />}
          {/* President hero: decorative geometric SVG pattern */}
          {isPresidentHero && !bgImg && (
            <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="soil-hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                    <polygon points="30,2 58,16 58,36 30,50 2,36 2,16" fill="none" stroke="rgba(215,204,200,0.4)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#soil-hex)"/>
              </svg>
            </div>
          )}
          <div className="container mx-auto px-4 py-20 md:py-28 relative z-10 text-center">
            {bil("title") && (
              <h1 className={`font-heading fluid-4xl md:fluid-5xl font-bold leading-tight mb-4 ${textAlignClass}`}>
                {bil("title")}
              </h1>
            )}
            {bil("subtitle") && (
              <p className={`text-white/80 fluid-lg md:fluid-xl max-w-2xl mx-auto leading-relaxed ${textAlignClass}`}>
                {bil("subtitle")}
              </p>
            )}
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              {bil("primaryButtonLabel") && (
                <a href={str(props.primaryButtonUrl, "#")}
                  className="inline-block px-8 py-3 bg-white text-soil-dark rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  {bil("primaryButtonLabel")}
                </a>
              )}
              {bil("secondaryButtonLabel") && (
                <a href={str(props.secondaryButtonUrl, "#")}
                  className="inline-block px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
                  {bil("secondaryButtonLabel")}
                </a>
              )}
            </div>
          </div>
        </section>
      );
    }

    // ── About overview ───────────────────────────────────────────────────────
    case "about-overview-section": {
      const paras = arr<Record<string, unknown>>(props.paragraphs);
      return (
        <section id={htmlId} className={`py-16 md:py-20 bg-white ${cssClass}`} style={style}>
          <div className="container mx-auto px-4 max-w-4xl">
            {bil("heading") && (
              <h2 className="font-heading fluid-3xl md:fluid-4xl font-bold text-soil-dark mb-6 text-center">
                {bil("heading")}
              </h2>
            )}
            <div className="w-16 h-1 bg-forest-light mx-auto mb-8 rounded-full" />
            {paras.length > 0 ? (
              <div className="space-y-4 text-earth-gray leading-relaxed">
                {paras.map((p, i) => {
                  const text = language === "ar" && str(p.textAr) ? str(p.textAr) : str(p.textEn);
                  return text ? <p key={i}>{text}</p> : null;
                })}
              </div>
            ) : (
              bil("subtitle") && (
                <p className="text-earth-gray leading-relaxed">{bil("subtitle")}</p>
              )
            )}
          </div>
        </section>
      );
    }

    // ── Vision / Mission / Objectives ────────────────────────────────────────
    case "about-vision-mission-section": {
      const panels = arr<Record<string, unknown>>(props.panels ?? props.items);
      const ICON_CHARS: Record<string, string> = { Target: "◎", Eye: "◉", List: "≡" };
      return (
        <section id={htmlId} className={`py-16 md:py-20 bg-soil-sand/30 ${cssClass}`} style={style}>
          <div className="container mx-auto px-4">
            {bil("heading") && (
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-soil-dark mb-6 text-center">
                {bil("heading")}
              </h2>
            )}
            {bil("subheading") && (
              <p className="text-earth-gray text-center max-w-2xl mx-auto mb-12">{bil("subheading")}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {panels.map((item, idx) => {
                const grad = str(item.gradientClass ?? item.color, "from-forest to-forest-light");
                const icon = ICON_CHARS[str(item.icon)] ?? str(item.icon, "⬛");
                const title   = language === "ar" && str(item.titleAr)   ? str(item.titleAr)   : str(item.titleEn ?? item.title);
                const content = language === "ar" && str(item.contentAr) ? str(item.contentAr) : str(item.contentEn ?? item.content);
                const btnLabel = language === "ar" ? str(item.buttonLabelAr ?? item.buttonLabel) : str(item.buttonLabelEn ?? item.buttonLabel);
                return (
                  <div key={idx} className="shadow-md overflow-hidden rounded-xl bg-white group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className={`h-2 bg-gradient-to-r ${grad}`} />
                    <div className="p-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-soil-dark to-soil-clay flex items-center justify-center mb-5">
                        <span className="text-soil-sand text-2xl">{icon}</span>
                      </div>
                      {title && <h3 className="font-heading text-xl font-bold text-soil-dark mb-3">{title}</h3>}
                      {content && <p className="text-earth-gray text-sm leading-relaxed">{content}</p>}
                      {btnLabel && (
                        <a href={str(item.buttonUrl, "#")}
                          className="inline-block mt-4 text-sm font-medium text-forest hover:underline">
                          {btnLabel}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    // ── Organizational chart ─────────────────────────────────────────────────
    case "about-organizational-chart-section": {
      const paras = arr<Record<string, unknown>>(props.paragraphs);
      return (
        <section id={htmlId} className={`py-16 md:py-20 bg-white ${cssClass}`} style={style}>
          <div className="container mx-auto px-4 max-w-4xl">
            {bil("heading") && (
              <h2 className="font-heading fluid-3xl md:fluid-4xl font-bold text-soil-dark mb-6 text-center">
                {bil("heading")}
              </h2>
            )}
            <div className="w-16 h-1 bg-forest-light mx-auto mb-8 rounded-full" />
            <div className="rounded-xl border border-soil-sand bg-gradient-to-br from-soil-dark/5 to-soil-clay/5 p-6 md:p-8">
              <div className="space-y-4 text-earth-gray leading-relaxed">
                {paras.map((p, i) => {
                  const text = language === "ar" && str(p.textAr) ? str(p.textAr) : str(p.textEn);
                  return text ? <p key={i}>{text}</p> : null;
                })}
                {paras.length === 0 && bil("subtitle") && <p>{bil("subtitle")}</p>}
              </div>
            </div>
          </div>
        </section>
      );
    }

    // ── About timeline ───────────────────────────────────────────────────────
    case "about-timeline-section": {
      const items_ = arr<Record<string, unknown>>(props.items);
      return (
        <section id={htmlId} className={`py-16 md:py-20 bg-soil-sand/30 ${cssClass}`} style={style}>
          <div className="container mx-auto px-4 max-w-4xl">
            {bil("heading") && (
              <h2 className="font-heading fluid-3xl md:fluid-4xl font-bold text-soil-dark mb-6 text-center">
                {bil("heading")}
              </h2>
            )}
            {bil("subheading") && (
              <p className="text-earth-gray text-center max-w-2xl mx-auto mb-12">{bil("subheading")}</p>
            )}
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-soil-clay/20 hidden md:block rounded-full" />
              <div className="space-y-8 md:space-y-12">
                {items_.map((item, idx) => {
                  const isLeft = idx % 2 === 0;
                  const title_ = language === "ar" && str(item.titleAr) ? str(item.titleAr) : str(item.titleEn ?? item.title);
                  const desc_  = language === "ar" && str(item.descAr)  ? str(item.descAr)  : str(item.descEn  ?? item.content);
                  return (
                    <div key={idx} className={`relative md:flex items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
                      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-soil-dark border-4 border-soil-sand items-center justify-center z-10">
                        <CalendarIcon className="h-4 w-4 text-soil-sand" />
                      </div>
                      <div className={`md:w-1/2 ${isLeft ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                        <div className="border border-soil-sand shadow-sm rounded-xl p-5 bg-white">
                          {str(item.year) && (
                            <span className="inline-block px-3 py-1 bg-forest-light text-white text-xs font-semibold rounded-full mb-2">
                              {str(item.year)}
                            </span>
                          )}
                          {title_ && <h3 className="font-heading font-bold text-soil-dark text-lg mb-1">{title_}</h3>}
                          {desc_  && <p className="text-earth-gray text-sm">{desc_}</p>}
                        </div>
                      </div>
                      <div className="md:w-1/2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      );
    }

    // ── About documents ──────────────────────────────────────────────────────
    // ── About documents ──────────────────────────────────────────────────────
    case "about-documents-section": {
      const docs = arr<Record<string, unknown>>(props.documents ?? props.items);
      const isRtl = language === "ar";

      // Map file extension / type to an accent colour + icon path
      const fileAccent = (ft: string) => {
        const t = ft.toUpperCase();
        if (t === "PDF") return { bg: "bg-red-50",    border: "border-red-100",    icon: "bg-red-500",    text: "text-red-600"   };
        if (t === "JPG" || t === "JPEG" || t === "PNG") return { bg: "bg-blue-50",  border: "border-blue-100",  icon: "bg-blue-500",  text: "text-blue-600"  };
        if (t === "DOCX"|| t === "DOC") return { bg: "bg-indigo-50", border: "border-indigo-100", icon: "bg-indigo-500", text: "text-indigo-600" };
        return { bg: "bg-green-50",  border: "border-green-100",  icon: "bg-green-600",  text: "text-green-700" };
      };

      return (
        <section
          id={htmlId}
          dir={isRtl ? "rtl" : "ltr"}
          className={`py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 ${cssClass}`}
          style={style}
        >
          <div className="container mx-auto px-4 max-w-4xl">
            {/* ── Header ── */}
            <div className="text-center mb-12">
              {bil("heading") && (
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-soil-dark mb-3">
                  {bil("heading")}
                </h2>
              )}
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="h-px w-12 bg-soil-clay/30 rounded-full" />
                <span className="w-3 h-3 rounded-full bg-soil-clay" />
                <span className="h-px w-12 bg-soil-clay/30 rounded-full" />
              </div>
              {bil("subheading") && (
                <p className="mt-4 text-earth-gray max-w-xl mx-auto text-sm leading-relaxed">
                  {bil("subheading")}
                </p>
              )}
            </div>

            {/* ── Document cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {docs.map((doc, i) => {
                const label    = isRtl && str(doc.labelAr) ? str(doc.labelAr) : str(doc.labelEn ?? doc.label);
                const fileType = str(doc.fileType, "FILE").toUpperCase();
                const url_     = str(doc.url);
                const accent   = fileAccent(fileType);
                const dlLabel  = isRtl ? "تنزيل" : "Download";

                return (
                  <div
                    key={i}
                    className={`group relative flex items-center gap-4 p-5 rounded-2xl border ${accent.border} ${accent.bg}
                      shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden`}
                  >
                    {/* Subtle decorative circle */}
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/40 pointer-events-none" />

                    {/* File type badge */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${accent.icon} flex items-center justify-center shadow-sm`}>
                      <Download className="h-5 w-5 text-white" />
                    </div>

                    {/* Label + type */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-soil-dark text-sm leading-snug line-clamp-2">{label}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/70 ${accent.text}`}>
                        {fileType}
                      </span>
                    </div>

                    {/* Download button */}
                    {url_ && (
                      <a
                        href={url_}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                          text-white ${accent.icon} hover:opacity-90 active:scale-95
                          transition-all duration-200 shadow-sm`}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {dlLabel}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {docs.length === 0 && (
              <div className="text-center py-16 text-earth-gray">
                <Download className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{isRtl ? "لا توجد وثائق بعد" : "No documents yet"}</p>
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── About gallery ────────────────────────────────────────────────────────
    case "about-gallery-section": {
      const imgs      = arr<Record<string, unknown>>(props.images ?? props.items);
      const isRtl     = language === "ar";
      const maxWidth_ = str(props.maxWidth, "max-w-6xl");

      return (
        <section
          id={htmlId}
          dir={isRtl ? "rtl" : "ltr"}
          className={`py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white ${cssClass}`}
          style={style}
        >
          <div className={`container mx-auto px-4 ${maxWidth_}`}>
            {/* ── Header ── */}
            <div className="text-center mb-12">
              {bil("heading") && (
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-soil-dark mb-3">
                  {bil("heading")}
                </h2>
              )}
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="h-px w-12 bg-soil-clay/30 rounded-full" />
                <span className="w-3 h-3 rounded-full bg-soil-clay" />
                <span className="h-px w-12 bg-soil-clay/30 rounded-full" />
              </div>
              {bil("subheading") && (
                <p className="mt-4 text-earth-gray max-w-xl mx-auto text-sm leading-relaxed">
                  {bil("subheading")}
                </p>
              )}
            </div>

            {/* ── Masonry-style grid ── */}
            {imgs.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {imgs.map((img, i) => {
                  const src_   = str(img.src);
                  const alt_   = str(img.alt, isRtl ? "صورة" : "Gallery image");
                  const title_ = isRtl && str(img.titleAr) ? str(img.titleAr) : str(img.titleEn ?? img.title ?? img.alt);
                  const desc_  = isRtl && str(img.descriptionAr) ? str(img.descriptionAr) : str(img.descriptionEn ?? img.description ?? "");

                  return (
                    <div
                      key={i}
                      className="group relative break-inside-avoid overflow-hidden rounded-2xl shadow-md
                        hover:shadow-xl transition-all duration-500 cursor-zoom-in"
                    >
                      {src_ ? (
                        <>
                          <img
                            src={src_}
                            alt={alt_}
                            loading="lazy"
                            className="w-full h-auto object-cover transition-transform duration-700
                              group-hover:scale-105"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent
                            opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col
                            justify-end p-4">
                            {title_ && (
                              <p className="text-white font-semibold text-sm leading-tight translate-y-2
                                group-hover:translate-y-0 transition-transform duration-300">
                                {title_}
                              </p>
                            )}
                            {desc_ && (
                              <p className="text-white/75 text-xs mt-1 translate-y-2 group-hover:translate-y-0
                                transition-transform duration-300 delay-75 line-clamp-2">
                                {desc_}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
                          <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── Empty state: shown until images are added from admin ── */
              <div className="flex flex-col items-center justify-center py-20 gap-5">
                <div className="grid grid-cols-3 gap-3 opacity-20">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xl bg-soil-clay/30 ${
                        i === 1 ? "aspect-[4/5]" : i === 3 ? "aspect-[4/3]" : "aspect-square"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-soil-dark/60 font-medium text-sm">
                    {isRtl ? "سيتم إضافة الصور قريباً" : "Photos coming soon"}
                  </p>
                  <p className="text-earth-gray text-xs mt-1">
                    {isRtl
                      ? "يمكن إضافة الصور من لوحة الإدارة"
                      : "Images can be added via the admin panel"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── About: Founding Decree ───────────────────────────────────────────────
    case "about-decree-section": {
      const imageUrl_ = str(props.imageUrl);
      const caption_  = language === "ar" && str(props.captionAr) ? str(props.captionAr) : str(props.captionEn ?? props.caption);
      return (
        <section id={htmlId} className={`py-14 bg-gray-50 ${cssClass}`} style={style}>
          <div className="container mx-auto px-4 max-w-2xl text-center">
            {bil("heading") && (
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-900 mb-8">{bil("heading")}</h2>
            )}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white inline-block w-full">
              {imageUrl_ ? (
                <img src={imageUrl_} alt={bil("heading")} className="w-full h-auto object-contain" />
              ) : (
                /* Styled document card shown until a real image is uploaded via admin panel */
                <div className="w-full bg-white p-8 md:p-12" dir="rtl">
                  {/* Official letterhead */}
                  <div className="text-center border-b-2 border-green-800 pb-6 mb-6">
                    <p className="text-xs font-bold text-green-700 tracking-widest uppercase mb-1">الجمهورية العربية السورية</p>
                    <p className="text-xs text-gray-500 mb-3">وزارة الشؤون الاجتماعية والعمل</p>
                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-green-800 flex items-center justify-center mb-3 bg-green-50">
                      <svg className="w-8 h-8 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-extrabold text-green-900">قرار التأسيس رقم 1054.7</h3>
                    <p className="text-sm text-gray-500 mt-1">دمشق — 2025</p>
                  </div>
                  {/* Decree body summary */}
                  <div className="space-y-3 text-sm text-gray-700 leading-loose">
                    <p className="font-semibold text-green-900">الموضوع: الترخيص بتأسيس جمعية علوم التربة السورية</p>
                    <p>بموجب قانون الجمعيات والمؤسسات الخاصة رقم 93 لعام 1958 والمراسيم التنفيذية النافذة، يُؤذن بتأسيس الجمعية العلمية غير الربحية المسماة <strong>«جمعية علوم التربة السورية»</strong> ومقرها الرئيسي في مدينة دمشق — كلية الهندسة الزراعية، جامعة دمشق.</p>
                    <p>تشمل أنشطة الجمعية كافة أراضي الجمهورية العربية السورية وتعمل وفق النظام الداخلي المُقرّ الذي يتضمن سبعة فصول وستاً وخمسين مادة.</p>
                    <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
                      {language === "ar"
                        ? "لرفع صورة القرار الرسمي، يُرجى الانتقال إلى لوحة الإدارة ← صفحة «عن الجمعية» ← قسم «وثيقة التأسيس» ← تحميل الصورة"
                        : "To upload the official decree image, go to Admin → About page → Founding Decree section → Upload image"}
                    </p>
                  </div>
                  {/* Seal placeholder */}
                  <div className="mt-8 flex justify-between items-end">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs">ختم</div>
                    </div>
                    <div className="text-center text-xs text-gray-500">
                      <p>وزير الشؤون الاجتماعية والعمل</p>
                      <div className="w-24 border-t border-gray-400 mt-6 mx-auto" />
                      <p className="mt-1">التوقيع</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {caption_ && <p className="mt-4 text-sm text-gray-500 italic">{caption_}</p>}
          </div>
        </section>
      );
    }

    // ── About: 10 Objectives ─────────────────────────────────────────────────
    case "about-objectives-section": {
      const objectives_ = arr<Record<string, unknown>>(props.objectives ?? props.items);
      return (
        <section id={htmlId} className={`py-16 md:py-20 bg-green-50 ${cssClass}`} style={style}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              {bil("heading")    && <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-900 mb-2">{bil("heading")}</h2>}
              {bil("subheading") && <p className="text-sm text-green-700 font-medium">{bil("subheading")}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {objectives_.map((obj, i) => {
                const num_   = language === "ar" ? (str(obj.numberAr) || String(i+1)) : (str(obj.numberEn) || String(i+1));
                const title_ = language === "ar" && str(obj.titleAr) ? str(obj.titleAr) : str(obj.titleEn ?? obj.title);
                const body_  = language === "ar" && str(obj.bodyAr)  ? str(obj.bodyAr)  : str(obj.bodyEn  ?? obj.body);
                return (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                      {str(obj.icon) ? (
                        <span className="text-xl">{str(obj.icon)}</span>
                      ) : (
                        <span className="text-sm font-bold text-green-700">{num_}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {title_ && <p className="font-semibold text-green-900 text-sm mb-1">{title_}</p>}
                      {body_  && <p className="text-gray-500 text-sm leading-relaxed">{body_}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    // ── About: Membership ────────────────────────────────────────────────────
    case "about-membership-section": {
      const memTypes_     = arr<Record<string, unknown>>(props.membershipTypes ?? props.items);
      const conditions_   = arr<string>(language === "ar" ? (props.conditionsAr ?? props.conditions) : (props.conditionsEn ?? props.conditions));
      const condHead_     = language === "ar" ? str(props.conditionsHeadingAr ?? props.conditionsHeading) : str(props.conditionsHeadingEn ?? props.conditionsHeading);
      const fees_         = language === "ar" ? str(props.feesAr ?? props.fees) : str(props.feesEn ?? props.fees);
      return (
        <section id={htmlId} className={`py-16 md:py-20 bg-white ${cssClass}`} style={style}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              {bil("heading")    && <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-900 mb-2">{bil("heading")}</h2>}
              {bil("subheading") && <p className="text-sm text-green-700 font-medium">{bil("subheading")}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {memTypes_.map((mt, i) => {
                const title_ = language === "ar" && str(mt.titleAr) ? str(mt.titleAr) : str(mt.titleEn ?? mt.title);
                const desc_  = language === "ar" && str(mt.descAr)  ? str(mt.descAr)  : str(mt.descEn  ?? mt.desc);
                return (
                  <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border border-green-100 bg-green-50 hover:shadow-md transition-shadow">
                    {str(mt.icon) && <span className="text-4xl mb-3">{str(mt.icon)}</span>}
                    {title_ && <h3 className="font-bold text-green-900 text-base mb-2">{title_}</h3>}
                    {desc_  && <p className="text-gray-500 text-sm leading-relaxed">{desc_}</p>}
                  </div>
                );
              })}
            </div>
            {conditions_.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  {condHead_ && <h3 className="font-bold text-green-900 text-lg mb-4">{condHead_}</h3>}
                  <ul className="space-y-2">
                    {conditions_.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">{i+1}</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                {fees_ && (
                  <div className="flex items-center justify-center">
                    <div className="p-6 rounded-2xl bg-green-900 text-white text-center max-w-xs w-full">
                      <p className="text-xs font-bold uppercase tracking-widest text-green-200 mb-3">
                        {language === "ar" ? "رسوم العضوية" : "Membership Fees"}
                      </p>
                      <p className="text-sm leading-relaxed font-medium">{fees_}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── About: Governance ────────────────────────────────────────────────────
    case "about-governance-section": {
      const roles_ = arr<Record<string, unknown>>(props.roles ?? props.items);
      const boardSize_ = language === "ar" ? str(props.boardSizeAr ?? props.boardSize) : str(props.boardSizeEn ?? props.boardSize);
      const term_      = language === "ar" ? str(props.termAr      ?? props.term)      : str(props.termEn      ?? props.term);
      const elections_ = language === "ar" ? str(props.electionsAr ?? props.elections) : str(props.electionsEn ?? props.elections);
      const infoPills  = [boardSize_, term_, elections_].filter(Boolean);
      return (
        <section id={htmlId} className={`py-16 md:py-20 bg-green-50 ${cssClass}`} style={style}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-10">
              {bil("heading") && <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-900 mb-3">{bil("heading")}</h2>}
              {bil("intro")   && <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">{bil("intro")}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {roles_.map((role, i) => {
                const title_ = language === "ar" && str(role.titleAr) ? str(role.titleAr) : str(role.titleEn ?? role.title);
                const desc_  = language === "ar" && str(role.descAr)  ? str(role.descAr)  : str(role.descEn  ?? role.desc);
                return (
                  <div key={i} className="p-5 rounded-2xl bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      {str(role.icon) && <span className="text-2xl">{str(role.icon)}</span>}
                      {title_ && <h3 className="font-bold text-green-900 text-sm">{title_}</h3>}
                    </div>
                    {desc_ && <p className="text-gray-500 text-sm leading-relaxed">{desc_}</p>}
                  </div>
                );
              })}
            </div>
            {infoPills.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4">
                {infoPills.map((info, i) => (
                  <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-green-200 text-sm text-green-800 font-medium shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    {info}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── About: Founding Members ──────────────────────────────────────────────
    case "about-founders-section": {
      const founders_ = arr<Record<string, unknown>>(props.founders ?? props.items);
      const roleBadge = (role: string) => {
        if (role.includes("رئيس") || role.includes("President"))          return "bg-amber-100 text-amber-800";
        if (role.includes("نائب") || role.includes("Vice"))               return "bg-blue-100 text-blue-800";
        if (role.includes("أمين الصندوق") || role.includes("Treasurer"))  return "bg-purple-100 text-purple-800";
        if (role.includes("أمين السر") || role.includes("Secretary"))     return "bg-cyan-100 text-cyan-800";
        if (role.includes("مجلس") || role.includes("Board"))              return "bg-green-100 text-green-800";
        return "bg-gray-100 text-gray-700";
      };
      return (
        <section id={htmlId} className={`py-16 md:py-20 bg-white ${cssClass}`} style={style}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-10">
              {bil("heading")    && <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-900 mb-2">{bil("heading")}</h2>}
              {bil("subheading") && <p className="text-sm text-green-700 font-medium mb-3">{bil("subheading")}</p>}
              {bil("intro")      && <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">{bil("intro")}</p>}
            </div>
            {/* Mobile/tablet cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {founders_.map((f, i) => {
                const name_  = language === "ar" ? (str(f.nameAr) || str(f.nameEn)) : (str(f.nameEn) || str(f.nameAr));
                const role_  = language === "ar" ? str(f.roleAr  ?? f.role) : str(f.roleEn  ?? f.role);
                const qual_  = language === "ar" ? str(f.qualificationAr ?? f.qualification) : str(f.qualificationEn ?? f.qualification);
                const bp_    = language === "ar" ? str(f.birthplaceAr ?? f.birthplace) : str(f.birthplaceEn ?? f.birthplace);
                const res_   = language === "ar" ? str(f.residenceAr  ?? f.residence) : str(f.residenceEn  ?? f.residence);
                const phone_ = str(f.phone);
                return (
                  <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {name_.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-green-900 text-sm truncate">{name_}</p>
                        <p className="text-xs text-gray-400">{bp_}{str(f.birthdate) ? ` • ${str(f.birthdate)}` : ""}</p>
                      </div>
                    </div>
                    {role_ && (
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${roleBadge(role_)}`}>{role_}</span>
                    )}
                    <div className="space-y-1 text-xs text-gray-500">
                      {qual_ && <p className="flex items-start gap-1.5"><span>🎓</span><span>{qual_}</span></p>}
                      {res_  && <p className="flex items-start gap-1.5"><span>📍</span><span>{res_}</span></p>}
                      {phone_ && <p className="flex items-start gap-1.5"><span>📞</span><a href={`tel:${phone_}`} className="text-green-700 hover:underline">{phone_}</a></p>}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-800 text-white">
                    {["#", language==="ar"?"الاسم":"Name", language==="ar"?"المؤهل":"Qualification", language==="ar"?"الصفة":"Role", language==="ar"?"مكان الولادة":"Birthplace", language==="ar"?"تاريخ الولادة":"Birthdate", language==="ar"?"مكان الإقامة":"Residence", language==="ar"?"الهاتف":"Phone"].map((h,i) => (
                      <th key={i} className="px-4 py-3 text-right font-semibold text-xs tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {founders_.map((f, i) => {
                    const name_  = language === "ar" ? (str(f.nameAr) || str(f.nameEn)) : (str(f.nameEn) || str(f.nameAr));
                    const role_  = language === "ar" ? str(f.roleAr  ?? f.role) : str(f.roleEn  ?? f.role);
                    const qual_  = language === "ar" ? str(f.qualificationAr ?? f.qualification) : str(f.qualificationEn ?? f.qualification);
                    const bp_    = language === "ar" ? str(f.birthplaceAr ?? f.birthplace) : str(f.birthplaceEn ?? f.birthplace);
                    const res_   = language === "ar" ? str(f.residenceAr  ?? f.residence) : str(f.residenceEn  ?? f.residence);
                    const phone_ = str(f.phone);
                    return (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i+1}</td>
                        <td className="px-4 py-3 font-semibold text-green-900">{name_}</td>
                        <td className="px-4 py-3 text-gray-600">{qual_}</td>
                        <td className="px-4 py-3">
                          {role_ && <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge(role_)}`}>{role_}</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{bp_}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{str(f.birthdate)}</td>
                        <td className="px-4 py-3 text-gray-600">{res_}</td>
                        <td className="px-4 py-3">
                          {phone_ ? <a href={`tel:${phone_}`} className="text-green-700 hover:underline font-mono text-xs">{phone_}</a> : <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    // ── Board members intro grid ─────────────────────────────────────────────
    case "board-members-intro-grid": {
      const introItems = arr<Record<string, unknown>>(props.items);
      const cols_ = num(props.columns, 4);
      return (
        <section id={htmlId} className={`py-12 md:py-16 bg-white ${cssClass}`} style={style}>
          <div className="container mx-auto px-4">
            {bil("heading") && (
              <h2 className="font-heading text-3xl font-bold text-soil-dark mb-4 text-center">{bil("heading")}</h2>
            )}
            {bil("subheading") && (
              <p className="text-earth-gray text-center max-w-2xl mx-auto mb-8">{bil("subheading")}</p>
            )}
            {bil("introText") && (
              <p className="text-earth-gray text-center max-w-3xl mx-auto mb-10">{bil("introText")}</p>
            )}
            {introItems.length > 0 && (
              <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${cols_}, minmax(0,1fr))` }}>
                {introItems.map((item, i) => {
                  const ICON_CHARS2: Record<string, React.ReactNode> = {
                    Users:  <Users className="w-8 h-8" />,
                    Award:  <Award className="w-8 h-8" />,
                    BookOpen: <BookOpen className="w-8 h-8" />,
                    Calendar: <CalendarIcon className="w-8 h-8" />,
                  };
                  const icon = ICON_CHARS2[str(item.icon)] ?? <span className="text-2xl">{str(item.icon, "⬛")}</span>;
                  const title_   = language === "ar" && str(item.titleAr)   ? str(item.titleAr)   : str(item.titleEn ?? item.title);
                  const content_ = language === "ar" && str(item.contentAr) ? str(item.contentAr) : str(item.contentEn ?? item.content);
                  return (
                    <div key={i} className="text-center p-6 rounded-xl border border-soil-sand/30 hover:shadow-lg transition-shadow">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-soil-sand/20 flex items-center justify-center text-soil-dark">
                        {icon}
                      </div>
                      {title_   && <h3 className="font-heading text-lg font-bold text-soil-dark mb-2">{title_}</h3>}
                      {content_ && <p className="text-earth-gray text-sm leading-relaxed">{content_}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── Board members grid (fetches from DB) ─────────────────────────────────
    case "board-members-grid": {
      const showAll = bool(props.showAllMembers ?? true);
      return (
        <BoardMembersGridBlock
          block={block}
          style={style}
          cssClass={cssClass}
          showAll={showAll}
        />
      );
    }

    // ── Board term information ────────────────────────────────────────────────
    case "board-term-information-section": {
      const paras_ = arr<Record<string, unknown>>(props.paragraphs);
      return (
        <section id={htmlId} className={`py-16 md:py-20 bg-soil-sand/30 ${cssClass}`} style={style}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            {bil("heading") && (
              <h2 className="font-heading fluid-2xl md:fluid-3xl font-bold text-soil-dark mb-6">{bil("heading")}</h2>
            )}
            <div className="space-y-4 text-earth-gray leading-relaxed">
              {paras_.map((p, i) => {
                const text = language === "ar" && str(p.textAr) ? str(p.textAr) : str(p.textEn);
                return text ? <p key={i}>{text}</p> : null;
              })}
              {paras_.length === 0 && bil("subtitle") && <p>{bil("subtitle")}</p>}
            </div>
          </div>
        </section>
      );
    }

    // ── Contact form section ─────────────────────────────────────────────────
    case "contact-form-section": {
      return (
        <ContactFormBlock block={block} style={style} cssClass={cssClass} htmlId={htmlId} />
      );
    }

    // ── President message content ─────────────────────────────────────────────
    case "president-message-content-section": {
      const msgParas      = arr<Record<string, unknown>>(props.paragraphs);
      const presidentName = bil("presidentName");
      const presidentTitle_ = bil("presidentTitle");
      const photo_        = str(props.photo);
      const photo2_       = str(props.photo2);
      const quoteText     = language === "ar" && str(props.quoteAr) ? str(props.quoteAr) : str(props.quoteEn ?? props.quote);
      const socialLinks_  = arr<Record<string, unknown>>(props.socialLinks);
      const isRtl         = language === "ar";
      /* Quote open/close marks differ by language */
      const qOpen  = isRtl ? "\u201C" : "\u201C";
      const qClose = isRtl ? "\u201D" : "\u201D";
      /* Signature label */
      const signatureLabel = isRtl
        ? (str(props.signatureAr) || "مؤسس ورئيس جمعية علوم التربة السورية")
        : (str(props.signatureEn) || "Founder & President, Soil Science Society of Syria");

      return (
        <section
          id={htmlId}
          dir={isRtl ? "rtl" : "ltr"}
          className={`py-0 overflow-hidden ${cssClass}`}
          style={style}
        >
          {/* ── Thin accent stripe at top ───────────────────────────── */}
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #3E2723 0%, #2E7D32 40%, #D7CCC8 100%)" }}
          />

          {/* ── Main content area ────────────────────────────────────── */}
          <div
            className="flex flex-col md:flex-row"
            style={{ background: "linear-gradient(135deg, #fff8f0 0%, #ffffff 60%)" }}
          >
            {/* ════ Photo column ════════════════════════════════════════ */}
            <div
              className={`president-photo-animate flex-shrink-0 flex flex-col items-center justify-start px-8 py-12 md:py-16 w-full md:w-64 lg:w-72
                ${isRtl ? "md:border-l" : "md:border-r"} border-soil-sand/40`}
              style={{
                background: "linear-gradient(170deg, rgba(215,204,200,0.22) 0%, rgba(255,248,240,0.6) 100%)",
              }}
            >
              <div className="md:sticky md:top-24 flex flex-col items-center w-full max-w-[240px]">

                {/* Portrait card */}
                {photo_ ? (
                  <div className="president-portrait-card w-44 md:w-52">
                    <img
                      src={photo_}
                      alt={presidentName || "President"}
                      loading="lazy"
                      className="w-full object-cover block"
                      style={{ aspectRatio: "3/4" }}
                    />
                  </div>
                ) : (
                  <div
                    className="president-portrait-card w-44 md:w-52 flex items-center justify-center bg-soil-sand/30"
                    style={{ aspectRatio: "3/4" }}
                  >
                    <span className="text-6xl font-bold text-soil-dark opacity-40 select-none">
                      {presidentName.charAt(0) || "P"}
                    </span>
                  </div>
                )}

                {/* Optional small real photo beside name */}
                <div className="mt-6 text-center w-full">
                  {photo2_ && (
                    <div className="flex justify-center mb-3">
                      <div
                        className="w-14 h-14 rounded-full overflow-hidden border-2 border-soil-sand shadow-md"
                      >
                        <img src={photo2_} alt="" loading="lazy" className="w-full h-full object-cover object-top" />
                      </div>
                    </div>
                  )}

                  {/* Name */}
                  {presidentName && (
                    <h3
                      className={`font-heading font-bold text-soil-dark leading-snug ${isRtl ? "text-lg" : "text-base"}`}
                      style={{ fontSize: isRtl ? "1.05rem" : "0.95rem" }}
                    >
                      {presidentName}
                    </h3>
                  )}


                  {/* Divider */}
                  <div className="president-signature-line mx-auto mt-3 mb-3" style={{ width: "64px" }} />

                  {/* Title */}
                  {presidentTitle_ && (
                    <p className="text-xs text-soil-clay leading-relaxed px-2">
                      {presidentTitle_}
                    </p>
                  )}

                  {/* Society badge */}
                  <div className="mt-4 inline-flex items-center gap-1.5 bg-forest/10 border border-forest/20 rounded-full px-3 py-1">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4.5" stroke="#2E7D32" strokeWidth="1"/>
                      <path d="M5 2.5 L5 7.5 M2.5 5 L7.5 5" stroke="#2E7D32" strokeWidth="1"/>
                    </svg>
                    <span className="text-xs text-forest font-medium">SSSS</span>
                  </div>

                  {/* Social links */}
                  {socialLinks_.length > 0 && (
                    <div className={`flex gap-2 mt-3 ${isRtl ? "flex-row-reverse justify-center" : "justify-center"}`}>
                      {socialLinks_.map((sl, i) =>
                        str(sl.url) ? (
                          <a
                            key={i}
                            href={str(sl.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-forest border border-forest/30 rounded px-2 py-0.5 hover:bg-forest/10 transition-colors"
                          >
                            {str(sl.platform, "Link")}
                          </a>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ════ Message text column ═════════════════════════════════ */}
            <div className="president-content-animate flex-1 min-w-0 px-6 md:px-10 lg:px-14 py-12 md:py-16">

              {/* Section heading */}
              {bil("heading") && (
                <div className="mb-8">
                  <p className="text-xs font-semibold tracking-widest text-forest uppercase mb-2 opacity-70">
                    {isRtl ? "جمعية علوم التربة السورية" : "Soil Science Society of Syria"}
                  </p>
                  <h2 className={`font-heading font-bold text-soil-dark leading-tight ${isRtl ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl"}`}>
                    {bil("heading")}
                  </h2>
                  <div className="mt-3 h-0.5 w-16 rounded-full bg-soil-clay" />
                </div>
              )}

              {/* Quote block */}
              {quoteText && (
                <div className="president-quote-animate relative mb-8">
                  <span className="president-quote-mark" aria-hidden="true">{qOpen}</span>
                  <blockquote
                    className={`relative z-10 rounded-lg px-6 pt-6 pb-5 ${isRtl ? "border-r-4 pr-6" : "border-l-4 pl-6"} border-soil-clay`}
                    style={{ background: "linear-gradient(135deg, rgba(62,39,35,0.04) 0%, rgba(255,248,240,0.8) 100%)" }}
                  >
                    <p className={`italic text-soil-dark leading-relaxed font-medium ${isRtl ? "text-lg" : "text-base"}`}>
                      {qOpen}{quoteText}{qClose}
                    </p>
                    {str(props.quoteAuthor) && (
                      <footer className="text-sm mt-3 not-italic text-soil-rich">
                        {isRtl ? "— " : "— "}{str(props.quoteAuthor)}
                      </footer>
                    )}
                  </blockquote>
                </div>
              )}

              {/* Message paragraphs */}
              <div
                className={`space-y-5 leading-[1.9] text-earth-gray ${isRtl ? "text-base" : "text-[0.95rem]"}`}
                style={{ maxWidth: "68ch" }}
              >
                {msgParas.map((p, i) => {
                  const text = isRtl && str(p.textAr) ? str(p.textAr) : str(p.textEn);
                  if (!text) return null;
                  /* First paragraph gets a subtle lead style */
                  if (i === 0) {
                    return (
                      <p
                        key={i}
                        className="text-soil-dark font-medium leading-[1.9]"
                        style={{ fontSize: isRtl ? "1.05rem" : "1rem" }}
                      >
                        {text}
                      </p>
                    );
                  }
                  return <p key={i}>{text}</p>;
                })}
              </div>

              {/* Signature block */}
              <div className={`mt-10 ${isRtl ? "text-right" : "text-left"}`}>
                <div className="president-signature-line" />
                <div className="flex items-center gap-3 mt-1" style={isRtl ? { flexDirection: "row-reverse" } : {}}>
                  {/* Small emblem */}
                  <div className="w-8 h-8 rounded-full bg-soil-dark flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2 C8 2, 12 5, 12 9 C12 11.5 10.2 13.5 8 14 C5.8 13.5 4 11.5 4 9 C4 5 8 2 8 2Z" fill="rgba(215,204,200,0.8)" stroke="#D7CCC8" strokeWidth="0.5"/>
                      <circle cx="8" cy="8.5" r="2" fill="white" fillOpacity="0.7"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-soil-dark text-sm">{presidentName || (isRtl ? "الدكتور عبد الكريم جعفر" : "Dr. Abd Al Karim Jaafar")}</p>
                    <p className="text-xs text-soil-clay mt-0.5">{signatureLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Thin accent stripe at bottom ────────────────────────────── */}
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #D7CCC8 0%, #2E7D32 60%, #3E2723 100%)" }}
          />
        </section>
      );
    }

    // ── Dynamic list sections (fetch from DB) ─────────────────────────────────
    case "news-list-section":
      return <NewsListSectionBlock block={block} style={style} cssClass={cssClass} />;

    case "events-list-section":
      return <EventsListSectionBlock block={block} style={style} cssClass={cssClass} />;

    case "jobs-list-section":
      return <JobsListSectionBlock block={block} style={style} cssClass={cssClass} />;

    case "members-list-section":
      return <MembersListSectionBlock block={block} style={style} cssClass={cssClass} />;

    case "publications-list-section":
      return <PublicationsListSectionBlock block={block} style={style} cssClass={cssClass} />;

    case "board-list-section":
      return <BoardListSectionBlock block={block} style={style} cssClass={cssClass} />;

    // ── Social media links ────────────────────────────────────────────────────
    case "social-media-links-section": {
      const links_ = arr<Record<string, unknown>>(props.links ?? props.items);
      const SOCIAL_ICONS: Record<string, string> = {
        facebook: "f", twitter: "𝕏", linkedin: "in", youtube: "▶",
        instagram: "◉", website: "🌐",
      };
      if (links_.length === 0) return null;
      return (
        <section id={htmlId} className={`py-10 bg-soil-sand/30 border-t border-soil-sand/30 ${cssClass}`} style={style}>
          <div className="container mx-auto px-4 text-center">
            {bil("title") && (
              <h3 className="text-lg font-semibold text-soil-dark mb-4">{bil("title")}</h3>
            )}
            <div className="flex items-center justify-center gap-4">
              {links_.map((link_, i) => {
                const url_ = str(link_.url);
                if (!url_) return null;
                const platform = str(link_.platform, "website");
                const icon = SOCIAL_ICONS[platform] ?? "🔗";
                return (
                  <a key={i} href={url_} target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-soil-clay/10 flex items-center justify-center text-soil-clay hover:bg-soil-clay hover:text-white transition-colors font-bold text-sm"
                    aria-label={platform}>
                    {icon}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    default:
      // Unknown block type — render nothing in production, show label in builder
      if (ignoreVisibility) {
        return (
          <div className="border-2 border-dashed border-amber-300 rounded-lg p-4 text-center bg-amber-50">
            <p className="text-xs text-amber-600 font-mono">Unknown block type: <strong>{type}</strong></p>
            <p className="text-xs text-amber-500 mt-1">Add a case for this type in BlockRenderer.tsx</p>
          </div>
        );
      }
      return null;
  }
}

// ─── Helper sub-components ────────────────────────────────────────────────────

/** Hook wrapper so we can call useLanguage inside .map() calls */
function useLanguageHook() {
  return useLanguage();
}

function AccordionItem({
  titleEn, titleAr, contentEn, contentAr
}: { titleEn: string; titleAr: string; contentEn: string; contentAr: string }) {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const title   = language === "ar" && titleAr   ? titleAr   : titleEn;
  const content = language === "ar" && contentAr ? contentAr : contentEn;
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 font-medium text-left hover:bg-gray-50 transition-colors"
      >
        <span>{title}</span>
        <span className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="px-4 py-3 text-muted-foreground border-t">{content}</div>
      )}
    </div>
  );
}

function TabsBlock({ block, renderChildren }: { block: Block; renderChildren: () => React.ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);
  const children = block.children ?? [];
  return (
    <div>
      <div className="flex border-b gap-1 mb-4 overflow-x-auto">
        {children.map((child, i) => (
          <button
            key={child.id}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === i ? "border-soil-dark text-soil-dark" : "border-transparent text-muted-foreground hover:text-gray-800"
            }`}
          >
            {str(child.props.label) || str(child.props.title) || `Tab ${i + 1}`}
          </button>
        ))}
      </div>
      {children[activeTab] && (
        <BlockRenderer blocks={[children[activeTab]]} />
      )}
    </div>
  );
}

function VisionMissionBlock({ block, style, cssClass }: { block: Block; style: React.CSSProperties; cssClass: string }) {
  const { language } = useLanguage();
  const p    = block.props;
  const bil  = (key: string) => (language === "ar" && str(p[`${key}Ar`]) ? str(p[`${key}Ar`]) : str(p[key]));
  const items = arr<Record<string, unknown>>(p.items);

  const ICON_CLASSES: Record<string, string> = {
    Target: "◎",
    Eye:    "◉",
    List:   "≡",
  };

  return (
    <section className={`py-16 md:py-20 ${cssClass}`} style={style}>
      <div className="container mx-auto px-4">
        {bil("heading") && (
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-soil-dark mb-6 text-center">{bil("heading")}</h2>
        )}
        {bil("subheading") && (
          <p className="text-earth-gray text-center max-w-2xl mx-auto mb-12">{bil("subheading")}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => {
            const gradientClass = str(item.color, "from-forest to-forest-light");
            const iconChar = ICON_CLASSES[str(item.icon)] ?? str(item.icon, "⬛");
            const title   = language === "ar" && str(item.titleAr)   ? str(item.titleAr)   : str(item.title);
            const content = language === "ar" && str(item.contentAr) ? str(item.contentAr) : str(item.content);
            return (
              <div key={idx} className="border-0 shadow-md overflow-hidden rounded-xl group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />
                <div className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-soil-dark to-soil-clay flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-soil-sand text-2xl">{iconChar}</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-soil-dark mb-3">{title}</h3>
                  <p className="text-earth-gray text-sm leading-relaxed">{content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function DynamicFeedPlaceholder({ id, title, type, limit }: { id?: string; title: string; type: string; limit: number }) {
  return (
    <section id={id} className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {title && <h2 className="font-heading text-3xl font-bold mb-8">{title}</h2>}
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
            <div key={i} className="border rounded-xl p-6 bg-gray-50 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">Dynamic {type} feed — loads from API on the public page</p>
      </div>
    </section>
  );
}

function NewsletterFormBlock({ block }: { block: Block }) {
  const bil = useBilingual(block.props);
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-xl text-center">
        {bil("title") && <h2 className="font-heading text-2xl font-bold mb-2">{bil("title")}</h2>}
        {bil("text")  && <p className="text-muted-foreground mb-6">{bil("text")}</p>}
        <form className="flex gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Your email address" className="flex-1 border rounded-lg px-4 py-2 text-sm" />
          <button type="submit" className="px-6 py-2 bg-soil-dark text-white rounded-lg text-sm font-medium hover:opacity-90">
            {bil("buttonLabel") || "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── Props-driven sub-components for blocks that fetch data ──────────────────

/**
 * ContactFormBlock — reads heading/config from block.props, renders inline form.
 */
function ContactFormBlock({
  block, style, cssClass, htmlId,
}: { block: Block; style: React.CSSProperties; cssClass: string; htmlId?: string }) {
  const { language } = useLanguage();
  const p = block.props;
  const bil = (key: string) => (language === "ar" && str(p[`${key}Ar`]) ? str(p[`${key}Ar`]) : str(p[key]));
  const showPhone   = bool(p.showPhone   ?? true);
  const showSubject = bool(p.showSubject ?? true);
  return (
    <section id={htmlId} className={`py-16 ${cssClass}`} style={style}>
      <div className="container mx-auto px-4 max-w-2xl">
        {bil("heading") && (
          <h2 className="font-heading text-3xl font-bold text-soil-dark mb-8 text-center">{bil("heading")}</h2>
        )}
        <ContactFormInline showPhone={showPhone} showSubject={showSubject} />
      </div>
    </section>
  );
}

function ContactFormInline({ showPhone, showSubject }: { showPhone: boolean; showSubject: boolean }) {
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/public/contact", form);
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch { setStatus("error"); }
  };
  if (status === "sent") return (
    <div className="text-center py-8">
      <div className="text-4xl mb-4">✅</div>
      <p className="text-lg font-medium text-soil-dark">Message sent! We&apos;ll get back to you soon.</p>
    </div>
  );
  const inputCls = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-soil-dark";
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input required placeholder="Your name"  value={form.name}    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}    className={inputCls} />
      <input required type="email" placeholder="Your email" value={form.email}   onChange={e => setForm(f => ({ ...f, email: e.target.value }))}   className={inputCls} />
      {showPhone   && <input placeholder="Phone (optional)" value={form.phone}   onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}   className={inputCls} />}
      {showSubject && <input placeholder="Subject"          value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inputCls} />}
      <textarea required placeholder="Your message" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={`${inputCls} resize-y`} />
      {status === "error" && <p className="text-sm text-red-500">Failed to send. Please try again.</p>}
      <button type="submit" disabled={status === "sending"} className="w-full py-3 bg-soil-dark text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

// ── Board members grid ────────────────────────────────────────────────────────
function BoardMembersGridBlock({ block, style, cssClass, showAll }: {
  block: Block; style: React.CSSProperties; cssClass: string; showAll: boolean;
}) {
  const [items, setItems]     = React.useState<BoardMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(false);
  const isBuilder = useIsBuilderMode();
  const { language } = useLanguage();
  const p   = block.props;
  const bil = (key: string) => (language === "ar" && str(p[`${key}Ar`]) ? str(p[`${key}Ar`]) : str(p[key]));

  useEffect(() => {
    if (isBuilder) { setLoading(false); return; }
    api.get<ApiResponse<BoardMember[]>>("/public/board-members")
      .then(res => { if (res.data.success) setItems(res.data.data ?? []); else setError(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isBuilder]);

  if (isBuilder) return <DynamicFeedPlaceholder title={bil("heading") || "Board Members"} type="board-members" limit={3} />;
  return (
    <section className={`py-12 bg-white ${cssClass}`} style={style}>
      <div className="container mx-auto px-4 max-w-6xl">
        {bil("heading") && <h2 className="font-heading text-3xl font-bold text-soil-dark mb-8 text-center">{bil("heading")}</h2>}
        {loading && <p className="text-center text-earth-gray py-8">Loading board members…</p>}
        {error   && <p className="text-center text-red-500 py-8">Failed to load board members.</p>}
        {!loading && !error && items.length === 0 && <p className="text-center text-earth-gray py-8">No board members available yet.</p>}
        {!loading && !error && items.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map(m => (
              <div key={m.id} className="border border-soil-sand/50 rounded-xl p-6 text-center bg-white hover:shadow-md transition-shadow">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-soil-dark text-2xl font-bold text-white">
                  {(m.userName || m.positionEn || "B").charAt(0)}
                </div>
                <h3 className="font-heading text-xl font-semibold text-soil-dark">{m.userName || m.positionEn || m.positionAr || "Board Member"}</h3>
                {(m.positionEn || m.positionAr) && <p className="mt-2 text-sm text-soil-clay">{m.positionEn || m.positionAr}</p>}
                {m.bio && <p className="mt-3 text-sm leading-6 text-earth-gray">{m.bio}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Generic list shell ────────────────────────────────────────────────────────
function ListSectionShell({ heading, subtitle, style, cssClass, loading, error, empty, children, viewAllUrl, viewAllLabel }: {
  heading?: string; subtitle?: string; style: React.CSSProperties; cssClass: string;
  loading: boolean; error: boolean; empty: boolean; children: React.ReactNode;
  viewAllUrl?: string; viewAllLabel?: string;
}) {
  return (
    <section className={`py-12 bg-white ${cssClass}`} style={style}>
      <div className="container mx-auto px-4 max-w-6xl">
        {heading  && <h2 className="font-heading text-3xl font-bold text-soil-dark mb-4 text-center">{heading}</h2>}
        {subtitle && <p className="text-earth-gray text-center mb-8">{subtitle}</p>}
        {loading && <p className="text-center text-earth-gray py-8">Loading…</p>}
        {error   && <p className="text-center text-red-500   py-8">Failed to load content.</p>}
        {!loading && !error && empty   && <p className="text-center text-earth-gray py-8">No content available yet.</p>}
        {!loading && !error && !empty  && children}
        {viewAllUrl && (
          <div className="text-center mt-8">
            <Link href={viewAllUrl} className="inline-block px-6 py-2 border border-soil-dark text-soil-dark rounded-lg text-sm font-medium hover:bg-soil-dark hover:text-white transition-colors">
              {viewAllLabel || "View All"}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function NewsListSectionBlock({ block, style, cssClass }: { block: Block; style: React.CSSProperties; cssClass: string }) {
  const [items, setItems]     = React.useState<ContentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(false);
  const isBuilder = useIsBuilderMode();
  const { language } = useLanguage();
  const p = block.props;
  const bil = (key: string) => (language === "ar" && str(p[`${key}Ar`]) ? str(p[`${key}Ar`]) : str(p[key]));
  const limit = Math.min(num(p.maxItems, 6), 20);
  useEffect(() => {
    if (isBuilder) { setLoading(false); return; }
    getContentByType("NEWS", 0, limit)
      .then(res => { if (res.data.success) setItems(res.data.data.content ?? []); else setError(true); })
      .catch(() => setError(true)).finally(() => setLoading(false));
  }, [isBuilder, limit]);
  if (isBuilder) return <DynamicFeedPlaceholder title={bil("title") || "News"} type="news" limit={3} />;
  return (
    <ListSectionShell heading={bil("title")} subtitle={bil("subtitle")} style={style} cssClass={cssClass}
      loading={loading} error={error} empty={items.length === 0}
      viewAllUrl={bool(p.showViewAll) ? str(p.viewAllUrl) : undefined} viewAllLabel="View All News">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <Link key={item.id} href={`/news/${item.slug}`} className="border border-soil-sand/50 rounded-xl p-6 hover:shadow-md transition-shadow bg-white block">
            <h3 className="font-heading text-lg font-semibold text-soil-dark">{language === "ar" ? (item.titleAr || item.titleEn) : (item.titleEn || item.titleAr)}</h3>
            {item.excerpt && <p className="mt-2 text-sm text-earth-gray line-clamp-3">{item.excerpt}</p>}
            {item.publishedAt && <p className="mt-3 text-xs text-soil-clay">{new Date(item.publishedAt).toLocaleDateString()}</p>}
          </Link>
        ))}
      </div>
    </ListSectionShell>
  );
}

function EventsListSectionBlock({ block, style, cssClass }: { block: Block; style: React.CSSProperties; cssClass: string }) {
  const [items, setItems]     = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(false);
  const isBuilder = useIsBuilderMode();
  const { language } = useLanguage();
  const p = block.props;
  const bil = (key: string) => (language === "ar" && str(p[`${key}Ar`]) ? str(p[`${key}Ar`]) : str(p[key]));
  const limit = Math.min(num(p.maxItems, 6), 20);
  useEffect(() => {
    if (isBuilder) { setLoading(false); return; }
    getPublishedEvents(0, limit)
      .then(res => { if (res.data.success) setItems(res.data.data.content ?? []); else setError(true); })
      .catch(() => setError(true)).finally(() => setLoading(false));
  }, [isBuilder, limit]);
  if (isBuilder) return <DynamicFeedPlaceholder title={bil("title") || "Events"} type="events" limit={3} />;
  return (
    <ListSectionShell heading={bil("title")} subtitle={bil("subtitle")} style={style} cssClass={cssClass}
      loading={loading} error={error} empty={items.length === 0}
      viewAllUrl={bool(p.showViewAll) ? str(p.viewAllUrl) : undefined} viewAllLabel="View All Events">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <Link key={item.id} href={`/events/${item.slug ?? item.id}`} className="border border-soil-sand/50 rounded-xl p-6 hover:shadow-md transition-shadow bg-white block">
            <h3 className="font-heading text-lg font-semibold text-soil-dark">{language === "ar" ? (item.titleAr || item.titleEn) : (item.titleEn || item.titleAr)}</h3>
            {item.description && <p className="mt-2 text-sm text-earth-gray line-clamp-2">{item.description}</p>}
            <p className="mt-3 text-xs text-soil-clay">{new Date(item.eventDate).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </ListSectionShell>
  );
}

function JobsListSectionBlock({ block, style, cssClass }: { block: Block; style: React.CSSProperties; cssClass: string }) {
  const [items, setItems]     = React.useState<JobVacancy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(false);
  const isBuilder = useIsBuilderMode();
  const { language } = useLanguage();
  const p = block.props;
  const bil = (key: string) => (language === "ar" && str(p[`${key}Ar`]) ? str(p[`${key}Ar`]) : str(p[key]));
  const limit = Math.min(num(p.maxItems, 6), 20);
  useEffect(() => {
    if (isBuilder) { setLoading(false); return; }
    getPublishedVacancies(0, limit)
      .then(res => { if (res.data.success) setItems(res.data.data.content ?? []); else setError(true); })
      .catch(() => setError(true)).finally(() => setLoading(false));
  }, [isBuilder, limit]);
  if (isBuilder) return <DynamicFeedPlaceholder title={bil("title") || "Jobs"} type="jobs" limit={3} />;
  return (
    <ListSectionShell heading={bil("title")} subtitle={bil("subtitle")} style={style} cssClass={cssClass}
      loading={loading} error={error} empty={items.length === 0}
      viewAllUrl={bool(p.showViewAll) ? str(p.viewAllUrl) : undefined} viewAllLabel="View All Jobs">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <Link key={item.id} href={`/jobs/${item.slug ?? item.id}`} className="border border-soil-sand/50 rounded-xl p-6 hover:shadow-md transition-shadow bg-white block">
            <h3 className="font-heading text-lg font-semibold text-soil-dark">{language === "ar" ? (item.titleAr || item.titleEn) : (item.titleEn || item.titleAr)}</h3>
            {item.description && <p className="mt-2 text-sm text-earth-gray line-clamp-2">{item.description}</p>}
            {item.location && <p className="mt-3 text-xs text-soil-clay">{item.location}</p>}
          </Link>
        ))}
      </div>
    </ListSectionShell>
  );
}

function PublicationsListSectionBlock({ block, style, cssClass }: { block: Block; style: React.CSSProperties; cssClass: string }) {
  const [items, setItems]     = React.useState<ContentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(false);
  const isBuilder = useIsBuilderMode();
  const { language } = useLanguage();
  const p = block.props;
  const bil = (key: string) => (language === "ar" && str(p[`${key}Ar`]) ? str(p[`${key}Ar`]) : str(p[key]));
  const limit = Math.min(num(p.maxItems, 6), 20);
  useEffect(() => {
    if (isBuilder) { setLoading(false); return; }
    getContentByType("PUBLICATION", 0, limit)
      .then(res => { if (res.data.success) setItems(res.data.data.content ?? []); else setError(true); })
      .catch(() => setError(true)).finally(() => setLoading(false));
  }, [isBuilder, limit]);
  if (isBuilder) return <DynamicFeedPlaceholder title={bil("title") || "Publications"} type="publications" limit={3} />;
  return (
    <ListSectionShell heading={bil("title")} subtitle={bil("subtitle")} style={style} cssClass={cssClass}
      loading={loading} error={error} empty={items.length === 0}
      viewAllUrl={bool(p.showViewAll) ? str(p.viewAllUrl) : undefined} viewAllLabel="View All Publications">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <div key={item.id} className="border border-soil-sand/50 rounded-xl p-6 bg-white">
            <h3 className="font-heading text-lg font-semibold text-soil-dark">{language === "ar" ? (item.titleAr || item.titleEn) : (item.titleEn || item.titleAr)}</h3>
            {item.excerpt && <p className="mt-2 text-sm text-earth-gray line-clamp-3">{item.excerpt}</p>}
            {item.publishedAt && <p className="mt-3 text-xs text-soil-clay">{new Date(item.publishedAt).toLocaleDateString()}</p>}
          </div>
        ))}
      </div>
    </ListSectionShell>
  );
}

function MembersListSectionBlock({ block, style, cssClass }: { block: Block; style: React.CSSProperties; cssClass: string }) {
  const [items, setItems]     = React.useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(false);
  const isBuilder = useIsBuilderMode();
  const { language } = useLanguage();
  const p = block.props;
  const bil = (key: string) => (language === "ar" && str(p[`${key}Ar`]) ? str(p[`${key}Ar`]) : str(p[key]));
  const limit = Math.min(num(p.maxItems, 6), 20);
  useEffect(() => {
    if (isBuilder) { setLoading(false); return; }
    api.get(`/public/users/members?page=0&size=${limit}`)
      .then(res => {
        const body = res.data as ApiResponse<Record<string, unknown>[] | { content: Record<string, unknown>[] }>;
        if (!body.success) { setError(true); return; }
        const d = body.data;
        setItems(Array.isArray(d) ? d : (Array.isArray((d as any)?.content) ? (d as any).content : []));
      })
      .catch(() => setError(true)).finally(() => setLoading(false));
  }, [isBuilder, limit]);
  if (isBuilder) return <DynamicFeedPlaceholder title={bil("title") || "Members"} type="members" limit={3} />;
  return (
    <ListSectionShell heading={bil("title")} subtitle={bil("subtitle")} style={style} cssClass={cssClass}
      loading={loading} error={error} empty={items.length === 0}
      viewAllUrl={bool(p.showViewAll) ? str(p.viewAllUrl) : undefined} viewAllLabel="View All Members">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((m, i) => {
          const name = String(m.firstNameEn && m.lastNameEn ? `${m.firstNameEn} ${m.lastNameEn}` : m.userName || "Member");
          return (
            <div key={String(m.id ?? i)} className="border border-soil-sand/50 rounded-xl p-6 bg-white">
              <h3 className="font-heading text-lg font-semibold text-soil-dark">{name}</h3>
              {m.specialization ? <p className="mt-1 text-sm text-soil-clay">{String(m.specialization)}</p> : null}
              {m.institution    ? <p className="mt-2 text-sm text-earth-gray">{String(m.institution)}</p>   : null}
            </div>
          );
        })}
      </div>
    </ListSectionShell>
  );
}

function BoardListSectionBlock({ block, style, cssClass }: { block: Block; style: React.CSSProperties; cssClass: string }) {
  const [items, setItems]     = React.useState<BoardMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(false);
  const isBuilder = useIsBuilderMode();
  const { language } = useLanguage();
  const p = block.props;
  const bil = (key: string) => (language === "ar" && str(p[`${key}Ar`]) ? str(p[`${key}Ar`]) : str(p[key]));
  const limit = Math.min(num(p.maxItems, 6), 20);
  useEffect(() => {
    if (isBuilder) { setLoading(false); return; }
    api.get<ApiResponse<BoardMember[]>>("/public/board-members")
      .then(res => { if (res.data.success) setItems((res.data.data ?? []).slice(0, limit)); else setError(true); })
      .catch(() => setError(true)).finally(() => setLoading(false));
  }, [isBuilder, limit]);
  if (isBuilder) return <DynamicFeedPlaceholder title={bil("title") || "Board"} type="board" limit={3} />;
  return (
    <ListSectionShell heading={bil("title")} subtitle={bil("subtitle")} style={style} cssClass={cssClass}
      loading={loading} error={error} empty={items.length === 0}
      viewAllUrl={bool(p.showViewAll) ? str(p.viewAllUrl) : undefined} viewAllLabel="View All Board Members">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map(m => (
          <div key={m.id} className="border border-soil-sand/50 rounded-xl p-6 text-center bg-white">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-soil-dark text-2xl font-bold text-white">
              {(m.userName || m.positionEn || "B").charAt(0)}
            </div>
            <h3 className="font-heading text-xl font-semibold text-soil-dark">{m.userName || m.positionEn || "Board Member"}</h3>
            {(m.positionEn || m.positionAr) && <p className="mt-1 text-sm text-soil-clay">{m.positionEn || m.positionAr}</p>}
          </div>
        ))}
      </div>
    </ListSectionShell>
  );
}
