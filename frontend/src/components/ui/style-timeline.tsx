"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { listItem } from "@/lib/animation-variants";

// ─────────────────────────────────────────────────────────────────────────────
// StyleTimeline — Vertical (scroll-driven line) + Horizontal (snap-scroll)
// Animation rules:
//   - Vertical: connecting line draws as it enters viewport (scroll-driven, no loop)
//   - Items: fade-in + translate-up on scroll entry (once)
//   - Horizontal: pure CSS overflow-x snap, CSS hover states only
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineItem {
  id?:      string;
  date?:    string;
  title?:   string;
  content?: string;
  icon?:    React.ReactNode;
  badge?:   string;
}

export interface StyleTimelineProps {
  items:       TimelineItem[];
  orientation?: "vertical" | "horizontal";
  className?:   string;
  maxWidth?:    string;
}

// ─── Vertical Timeline ────────────────────────────────────────────────────────
function VerticalTimeline({ items, className, maxWidth = "max-w-3xl" }: Omit<StyleTimelineProps, "orientation">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 15%"],
  });
  // Line height grows from 0% to 100% as user scrolls through the section
  const lineScaleY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className={cn("relative", maxWidth, "mx-auto px-4", className)}>
      {/* Scroll-driven connecting line */}
      <div
        className="absolute left-[0.9375rem] top-0 bottom-0 w-0.5 overflow-hidden"
        style={{ background: "var(--style-color-border)" }}
        aria-hidden
      >
        <motion.div
          className="w-full origin-top"
          style={{
            height: lineScaleY,
            background: "var(--style-color-primary)",
          }}
        />
      </div>

      <div className="space-y-0">
        {items.map((item, i) => (
          <motion.div
            key={item.id ?? i}
            variants={listItem}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="relative pl-10 pb-8 last:pb-0"
          >
            {/* Dot */}
            <div
              className="absolute left-0 top-1 w-[1.875rem] h-[1.875rem] rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--style-color-primary)",
                boxShadow:  "0 0 0 3px var(--style-color-surface), 0 0 0 5px var(--style-color-border)",
              }}
            >
              {item.icon ? (
                <span className="text-[var(--style-color-surface)] [&>svg]:h-3.5 [&>svg]:w-3.5">{item.icon}</span>
              ) : (
                <div className="w-2 h-2 rounded-full bg-[var(--style-color-surface)]" />
              )}
            </div>

            {/* Content card */}
            <div
              className="rounded-[var(--style-radius-card)] p-4 transition-shadow duration-[var(--style-anim-hover)]"
              style={{
                background: "var(--style-color-surface)",
                border:     "1px solid var(--style-color-border)",
                boxShadow:  "var(--style-shadow-card)",
              }}
            >
              <div className="flex items-center gap-3 mb-1">
                {item.date && (
                  <span className="text-xs font-medium tabular-nums" style={{ color: "var(--style-color-accent)" }}>
                    {item.date}
                  </span>
                )}
                {item.badge && (
                  <span
                    className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--style-color-primary)",
                      color:      "var(--style-color-surface)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              {item.title && (
                <h3 className="font-semibold mb-1" style={{ color: "var(--style-color-fg)", fontWeight: "var(--style-font-weight-heading)" }}>
                  {item.title}
                </h3>
              )}
              {item.content && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--style-color-muted)", lineHeight: "var(--style-line-height-body)" }}>
                  {item.content}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal Timeline ──────────────────────────────────────────────────────
function HorizontalTimeline({ items, className }: Omit<StyleTimelineProps, "orientation">) {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {/* Baseline */}
      <div
        className="absolute left-0 right-0 h-0.5 top-8"
        style={{ background: "var(--style-color-border)" }}
        aria-hidden
      />

      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id ?? i}
            variants={listItem}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, root: trackRef, margin: "-30px" }}
            className="snap-start flex-shrink-0 w-52 pt-14 relative"
          >
            {/* Dot on line */}
            <div
              className="absolute top-[1.625rem] left-6 w-3 h-3 rounded-full -translate-y-1/2 ring-2 ring-[var(--style-color-surface)]"
              style={{ background: "var(--style-color-primary)" }}
            />

            {/* Card */}
            <div
              className="rounded-[var(--style-radius-card)] p-4 transition-all duration-[var(--style-anim-hover)] hover:translate-y-[-2px]"
              style={{
                background: "var(--style-color-surface)",
                border:     "1px solid var(--style-color-border)",
                boxShadow:  "var(--style-shadow-card)",
              }}
            >
              {item.date && (
                <p className="text-xs font-medium mb-1" style={{ color: "var(--style-color-accent)" }}>
                  {item.date}
                </p>
              )}
              {item.title && (
                <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ color: "var(--style-color-fg)" }}>
                  {item.title}
                </h3>
              )}
              {item.content && (
                <p className="text-xs line-clamp-3" style={{ color: "var(--style-color-muted)" }}>
                  {item.content}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function StyleTimeline({ orientation = "vertical", ...props }: StyleTimelineProps) {
  return orientation === "horizontal"
    ? <HorizontalTimeline {...props} />
    : <VerticalTimeline   {...props} />;
}
