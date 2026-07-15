"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// StyleInput — floating label + CSS-only focus glow
// No Framer Motion whileFocus — transition handled entirely by CSS.
// ─────────────────────────────────────────────────────────────────────────────

export interface StyleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const StyleInput = forwardRef<HTMLInputElement, StyleInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          id={inputId}
          placeholder={label ? " " : props.placeholder}
          className={cn(
            "peer w-full px-4 py-3 rounded-[var(--style-radius-input)]",
            "outline-none",                          // kill browser native outline always
            "border bg-[var(--style-color-surface)]",
            "text-[var(--style-color-fg)] placeholder-transparent",
            "transition-[border-color,box-shadow] duration-[250ms] ease-out",
            error
              ? "border-red-400 [box-shadow:0_0_0_3px_rgba(248,113,113,0.15)]"
              : [
                  "border-soil-taupe/70",            // warm soil tone at rest
                  "focus:border-soil-clay",           // soil-clay (#6D4C41) on focus
                  "focus:[box-shadow:0_0_0_3px_rgba(109,76,65,0.14)]", // matching warm ring
                ],
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 top-[0.8rem] text-[var(--style-color-muted)] text-sm pointer-events-none",
              // Label float: 250ms ease-out matches the input transition
              "transition-[transform,font-size,color,background-color,padding] duration-[250ms] ease-out",
              // Floated state (focused)
              "peer-focus:-translate-y-[1.35rem] peer-focus:text-[0.7rem] peer-focus:text-[var(--style-color-primary)]",
              "peer-focus:bg-[var(--style-color-surface)] peer-focus:px-1",
              // Floated state (has value)
              "peer-not-placeholder-shown:-translate-y-[1.35rem] peer-not-placeholder-shown:text-[0.7rem]",
              "peer-not-placeholder-shown:bg-[var(--style-color-surface)] peer-not-placeholder-shown:px-1",
            )}
          >
            {label}
          </label>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
StyleInput.displayName = "StyleInput";
