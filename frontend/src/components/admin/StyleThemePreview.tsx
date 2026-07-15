"use client";

import React from "react";
import { StyleThemeTokens } from "@/lib/style-themes";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// StyleThemePreview — renders a scoped mini mockup of a theme
// Uses --p-* CSS vars (NOT --style-*) so admin UI is unaffected.
// mode: "compact" = 6 color swatches strip
//       "full"    = hero strip + 3 cards + input + mini timeline
// ─────────────────────────────────────────────────────────────────────────────

interface StyleThemePreviewProps {
  theme: StyleThemeTokens;
  mode?: "compact" | "full";
  className?: string;
}

function scopedVars(t: StyleThemeTokens): React.CSSProperties {
  return {
    "--p-primary":   t.colorPrimary,
    "--p-secondary": t.colorSecondary,
    "--p-accent":    t.colorAccent,
    "--p-bg":        t.colorBg,
    "--p-surface":   t.colorSurface,
    "--p-fg":        t.colorFg,
    "--p-muted":     t.colorMuted,
    "--p-border":    t.colorBorder,
    "--p-radius":    t.radiusCard,
    "--p-hero-s":    t.gradientHeroStart,
    "--p-hero-m":    t.gradientHeroMid,
    "--p-hero-e":    t.gradientHeroEnd,
    "--p-shadow":    t.shadowCard,
  } as React.CSSProperties;
}

export function StyleThemePreview({ theme, mode = "compact", className }: StyleThemePreviewProps) {
  if (mode === "compact") {
    return (
      <div className={cn("flex gap-1.5 items-center", className)}>
        {theme.previewSwatches.map((color, i) => (
          <div
            key={i}
            title={color}
            className="w-5 h-5 rounded-full border border-black/10 flex-shrink-0"
            style={{ background: color }}
          />
        ))}
      </div>
    );
  }

  // Full preview
  const vars = scopedVars(theme);

  return (
    <div
      className={cn("rounded-lg overflow-hidden border border-black/10 text-[10px] select-none pointer-events-none", className)}
      style={{ ...vars, background: "var(--p-bg)", width: "100%", maxWidth: "300px" }}
    >
      {/* Mini hero strip */}
      <div
        className="px-4 py-5"
        style={{ background: `linear-gradient(135deg, var(--p-hero-s) 0%, var(--p-hero-m) 50%, var(--p-hero-e) 100%)` }}
      >
        <div className="h-2 w-20 rounded-full bg-white/70 mb-2" />
        <div className="h-1.5 w-28 rounded-full bg-white/50 mb-3" />
        <div
          className="inline-block px-3 py-1 rounded-full text-[9px] font-semibold"
          style={{ background: "var(--p-secondary)", color: "var(--p-surface)" }}
        >
          {theme.btnShape === "pill" ? "Join Us →" : "Join Us"}
        </div>
      </div>

      {/* 3 mini cards */}
      <div className="grid grid-cols-3 gap-1.5 p-2">
        {["Research", "Education", "Policy"].map((label) => (
          <div
            key={label}
            className="p-2"
            style={{
              background:   "var(--p-surface)",
              border:       "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              boxShadow:    "var(--p-shadow)",
            }}
          >
            <div className="h-1 w-8 rounded-full mb-1" style={{ background: "var(--p-primary)" }} />
            <div className="h-1 w-10 rounded-full" style={{ background: "var(--p-muted)", opacity: 0.5 }} />
          </div>
        ))}
      </div>

      {/* Mini form input */}
      <div className="px-2 pb-2">
        <div
          className="h-5 rounded flex items-center px-2 gap-1"
          style={{ background: "var(--p-surface)", border: "1px solid var(--p-border)", borderRadius: theme.radiusInput }}
        >
          <div className="h-1 w-16 rounded-full" style={{ background: "var(--p-muted)", opacity: 0.4 }} />
        </div>
      </div>

      {/* Mini timeline */}
      <div className="px-2 pb-2 flex flex-col gap-1">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--p-primary)" }} />
            <div className="h-1 rounded-full flex-1" style={{ background: "var(--p-muted)", opacity: 0.35 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
