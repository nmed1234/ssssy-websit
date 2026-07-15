"use client";

import React, { forwardRef, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// StyleTextarea — auto-grow + floating label + CSS focus glow
// ─────────────────────────────────────────────────────────────────────────────

export interface StyleTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  minRows?: number;
}

export const StyleTextarea = forwardRef<HTMLTextAreaElement, StyleTextareaProps>(
  ({ label, error, minRows = 3, className, id, onChange, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const combinedRef = (ref as React.RefCallback<HTMLTextAreaElement>) || internalRef;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const el = e.currentTarget;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
        onChange?.(e);
      },
      [onChange]
    );

    return (
      <div className="relative w-full">
        <textarea
          ref={combinedRef}
          id={inputId}
          rows={minRows}
          placeholder={label ? " " : props.placeholder}
          onChange={handleChange}
          className={cn(
            "peer w-full px-4 py-3 rounded-[var(--style-radius-input)]",
            "outline-none",                          // kill browser native outline always
            "border bg-[var(--style-color-surface)]",
            "text-[var(--style-color-fg)] placeholder-transparent resize-none overflow-hidden",
            "transition-[border-color,box-shadow] duration-[250ms] ease-out",
            error
              ? "border-red-400 [box-shadow:0_0_0_3px_rgba(248,113,113,0.15)]"
              : [
                  "border-soil-taupe/70",
                  "focus:border-soil-clay",
                  "focus:[box-shadow:0_0_0_3px_rgba(109,76,65,0.14)]",
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
              "transition-[transform,font-size,color,background-color,padding] duration-[250ms] ease-out",
              "peer-focus:-translate-y-[1.35rem] peer-focus:text-[0.7rem] peer-focus:text-[var(--style-color-primary)]",
              "peer-focus:bg-[var(--style-color-surface)] peer-focus:px-1",
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
StyleTextarea.displayName = "StyleTextarea";
