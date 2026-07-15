// Server component — no "use client" directive needed
import React from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// StyleParagraph — respects theme typography tokens via CSS vars
// ─────────────────────────────────────────────────────────────────────────────

export interface StyleParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "sm" | "base" | "lg" | "xl";
  variant?: "default" | "muted" | "lead";
}

const sizeMap: Record<string, string> = {
  sm:   "text-fluid-sm",
  base: "text-fluid-base",
  lg:   "text-fluid-lg",
  xl:   "text-fluid-xl",
};

export function StyleParagraph({
  size = "base",
  variant = "default",
  className,
  children,
  style,
  ...props
}: StyleParagraphProps) {
  return (
    <p
      className={cn(
        sizeMap[size],
        variant === "muted"   && "text-[var(--style-color-muted)]",
        variant === "default" && "text-[var(--style-color-fg)]",
        variant === "lead"    && "text-[var(--style-color-fg)] font-medium",
        className
      )}
      style={{
        lineHeight:    "var(--style-line-height-body)",
        fontWeight:    variant === "lead" ? "var(--style-font-weight-heading)" : "var(--style-font-weight-body)",
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
}
