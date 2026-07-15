"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MenuItem } from "@/types";

// ─── Animation variant definitions ────────────────────────────────────────────

export type DropdownAnimStyle = "fade" | "slide" | "scale" | "flip";

export const DROPDOWN_VARIANTS: Record<
  DropdownAnimStyle,
  { hidden: object; visible: object; exit: object; transition?: object; wrapperStyle?: React.CSSProperties }
> = {
  fade: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
    exit:    { opacity: 0 },
    transition: { duration: 0.15 },
  },
  slide: {
    hidden:  { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -6 },
    transition: { type: "spring", stiffness: 380, damping: 28, mass: 0.7 },
  },
  scale: {
    hidden:  { opacity: 0, scale: 0.95, y: -4 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit:    { opacity: 0, scale: 0.95, y: -4 },
    transition: { type: "spring", stiffness: 400, damping: 30 },
    wrapperStyle: { transformOrigin: "top" },
  },
  flip: {
    hidden:  { opacity: 0, rotateX: -15 },
    visible: { opacity: 1, rotateX: 0 },
    exit:    { opacity: 0, rotateX: -12 },
    transition: { type: "spring", stiffness: 360, damping: 26 },
    wrapperStyle: { perspective: "800px" },
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface NavDropdownProps {
  items: MenuItem[];
  isOpen: boolean;
  template?: string;           // classic | mega | minimal | modern
  animStyle?: string;          // fade | slide | scale | flip
  direction?: string;          // ltr | rtl
  language?: string;           // en | ar
  bgColor?: string;            // hex/rgba override or ""
  textColor?: string;          // hex/rgba override or ""
  onItemClick?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NavDropdown({
  items,
  isOpen,
  template = "classic",
  animStyle = "slide",
  direction = "ltr",
  language = "en",
  bgColor,
  textColor,
  onItemClick,
}: NavDropdownProps) {
  const isRtl = direction === "rtl";
  const visibleItems = items.filter((i) => i.isActive);
  if (!visibleItems.length) return null;

  const variantKey = (["fade", "slide", "scale", "flip"].includes(animStyle)
    ? animStyle
    : "slide") as DropdownAnimStyle;
  const variant = DROPDOWN_VARIANTS[variantKey];

  // CSS variable overrides
  const cssVars: React.CSSProperties = {
    ...(variant.wrapperStyle ?? {}),
    ...(bgColor ? ({ "--menu-dropdown-bg": bgColor } as React.CSSProperties) : {}),
    ...(textColor ? ({ "--menu-dropdown-text": textColor } as React.CSSProperties) : {}),
  };

  // Resolve the display label respecting current language
  function itemLabel(child: MenuItem) {
    return (language === "ar" && child.labelAr) ? child.labelAr : child.labelEn || child.labelAr || "";
  }

  // ── Panel wrapper class per template ──────────────────────────────────────
  const positionClass = isRtl ? "right-0" : "left-0";

  // Non-minimal templates get the border+shadow panel.
  // The top accent stripe is rendered inside as the first child so it can be
  // a proper soil-clay colour regardless of bgColor override.
  const panelClass =
    template === "minimal"
      ? `absolute top-full mt-2 z-[200] ${positionClass}`
      : `absolute top-full mt-2 z-[200] ${positionClass} rounded-2xl overflow-hidden border border-gray-200/80
         bg-[var(--menu-dropdown-bg,rgba(255,255,255,0.97))] backdrop-blur-md
         shadow-[0_8px_32px_rgba(0,0,0,0.10)]`;

  // ── Child item renderer per template ──────────────────────────────────────
  function renderItems() {
    if (template === "mega") {
      return (
        <MegaItems
          visibleItems={visibleItems}
          itemLabel={itemLabel}
          linkClass="block px-3.5 py-2 rounded-lg text-sm font-medium"
          textColor={textColor}
          onItemClick={onItemClick}
        />
      );
    }

    if (template === "minimal") {
      return (
        <MinimalItems
          visibleItems={visibleItems}
          itemLabel={itemLabel}
          textColor={textColor}
          onItemClick={onItemClick}
        />
      );
    }

    if (template === "modern") {
      return (
        <ModernItems
          visibleItems={visibleItems}
          itemLabel={itemLabel}
          textColor={textColor}
          onItemClick={onItemClick}
        />
      );
    }

    // classic (default)
    return (
      <ClassicItems
        visibleItems={visibleItems}
        itemLabel={itemLabel}
        textColor={textColor}
        onItemClick={onItemClick}
      />
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="nav-dropdown"
          className={panelClass}
          style={cssVars}
          initial={variant.hidden as Record<string, number>}
          animate={variant.visible as Record<string, number>}
          exit={variant.exit as Record<string, number>}
          transition={variant.transition as Record<string, unknown>}
        >
          {/* ── Soil-clay top accent bar (not on minimal) ── */}
          {template !== "minimal" && (
            <div className="h-[3px] bg-soil-clay w-full flex-shrink-0" />
          )}
          {renderItems()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Shared hover-highlight hook ──────────────────────────────────────────────
// Each template uses a motion.span with layoutId so the highlight glides
// smoothly as the cursor moves between items.

interface ItemsProps {
  visibleItems: MenuItem[];
  itemLabel: (child: MenuItem) => string;
  textColor?: string;
  linkClass?: string;
  onItemClick?: () => void;
}

// ── Classic ───────────────────────────────────────────────────────────────────
function ClassicItems({ visibleItems, itemLabel, textColor, onItemClick }: ItemsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const textCls = textColor
    ? `text-[${textColor}]`
    : "text-soil-dark/75";
  return (
    <div className="flex flex-col gap-0 p-1.5 min-w-[180px]">
      {visibleItems.map((child) => (
        <Link
          key={child.id}
          href={child.url || "/"}
          onClick={onItemClick}
          onMouseEnter={() => setHoveredId(child.id)}
          onMouseLeave={() => setHoveredId(null)}
          className={`relative block px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${textCls} hover:text-soil-clay`}
        >
          {hoveredId === child.id && (
            <motion.span
              layoutId="dropdown-hover-classic"
              className="absolute inset-0 rounded-lg bg-soil-clay/8"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          <span className="relative z-10">{itemLabel(child)}</span>
        </Link>
      ))}
    </div>
  );
}

// ── Mega ──────────────────────────────────────────────────────────────────────
function MegaItems({ visibleItems, itemLabel, textColor, onItemClick }: ItemsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const textCls = textColor ? `text-[${textColor}]` : "text-soil-dark/75";
  return (
    <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 p-2 min-w-[340px]">
      {visibleItems.map((child) => (
        <Link
          key={child.id}
          href={child.url || "/"}
          onClick={onItemClick}
          onMouseEnter={() => setHoveredId(child.id)}
          onMouseLeave={() => setHoveredId(null)}
          className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${textCls} hover:text-soil-clay`}
        >
          {hoveredId === child.id && (
            <motion.span
              layoutId="dropdown-hover-mega"
              className="absolute inset-0 rounded-lg bg-soil-clay/8"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          {child.icon && (
            <span className="relative z-10 flex-shrink-0 w-5 h-5 rounded bg-soil-clay/10 flex items-center justify-center text-xs text-soil-clay">
              {child.icon.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="relative z-10">{itemLabel(child)}</span>
        </Link>
      ))}
    </div>
  );
}

// ── Minimal ───────────────────────────────────────────────────────────────────
function MinimalItems({ visibleItems, itemLabel, textColor, onItemClick }: ItemsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const textCls = textColor ? `text-[${textColor}]` : "text-soil-dark/75";
  return (
    <div className="flex flex-col gap-0.5 min-w-[160px]">
      {visibleItems.map((child) => (
        <Link
          key={child.id}
          href={child.url || "/"}
          onClick={onItemClick}
          onMouseEnter={() => setHoveredId(child.id)}
          onMouseLeave={() => setHoveredId(null)}
          className={`relative block px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${textCls} hover:text-soil-clay`}
        >
          {hoveredId === child.id && (
            <motion.span
              layoutId="dropdown-hover-minimal"
              className="absolute inset-0 rounded-lg bg-soil-clay/8"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          <span className="relative z-10 hover:underline decoration-soil-clay/50 underline-offset-2">
            {itemLabel(child)}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ── Modern ────────────────────────────────────────────────────────────────────
function ModernItems({ visibleItems, itemLabel, textColor, onItemClick }: ItemsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const textCls = textColor ? `text-[${textColor}]` : "text-soil-dark/75";
  return (
    <div className="flex flex-col gap-0.5 p-1.5 min-w-[200px]">
      {visibleItems.map((child) => (
        <Link
          key={child.id}
          href={child.url || "/"}
          onClick={onItemClick}
          onMouseEnter={() => setHoveredId(child.id)}
          onMouseLeave={() => setHoveredId(null)}
          className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 group ${textCls} hover:text-soil-clay`}
        >
          {hoveredId === child.id && (
            <motion.span
              layoutId="dropdown-hover-modern"
              className="absolute inset-0 rounded-xl bg-soil-clay/6"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          {/* Left accent bar animates in on hover */}
          <span className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-colors duration-150 ${hoveredId === child.id ? "bg-soil-clay/60" : "bg-transparent"}`} />
          {child.icon && (
            <span className="relative z-10 w-6 h-6 rounded-lg bg-soil-sand/40 flex items-center justify-center text-xs text-soil-clay flex-shrink-0">
              {child.icon.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="relative z-10 min-w-0 truncate">{itemLabel(child)}</span>
        </Link>
      ))}
    </div>
  );
}
