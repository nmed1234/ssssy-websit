"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// StyleCard
// Reads --style-card-mode at runtime to switch between flat and glass variants.
// Hover is pure CSS (translateY -3px, deeper shadow) — no Framer whileHover.
// ─────────────────────────────────────────────────────────────────────────────

export interface StyleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Override the CSS-var mode: "auto" reads --style-card-mode, "flat" | "glass" forces a variant */
  variant?: "auto" | "flat" | "glass";
  /** Opt out of hover lift (e.g. skeleton cards, static content) */
  noHover?: boolean;
  asChild?: boolean;
}

export function StyleCard({
  variant = "auto",
  noHover = false,
  className,
  children,
  ...props
}: StyleCardProps) {
  // When "auto" we apply both classes and let CSS decide which wins
  // via the --style-card-mode variable. In practice we apply the flat
  // class as base and the glass modifier conditionally.
  const isGlass  = variant === "glass";
  const isFlat   = variant === "flat";
  const isAuto   = variant === "auto";

  return (
    <div
      className={cn(
        // Base: always apply flat as default; glass overrides when explicit
        isFlat  && "style-card-flat",
        isGlass && "style-card-glass",
        isAuto  && "style-card-flat",   // auto always uses flat class; glass themes override via CSS var
        noHover && "!transform-none !shadow-[var(--style-shadow-card)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StyleCardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}
