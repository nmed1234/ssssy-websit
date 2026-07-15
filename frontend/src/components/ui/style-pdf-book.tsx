"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// StylePdfBook — 3D page-flip PDF/document viewer
// - User-triggered flip animation (click, keyboard, swipe) — no idle loops
// - Bookmark tabs for chapter navigation
// - Keyboard: ArrowLeft / ArrowRight / Home / End
// ─────────────────────────────────────────────────────────────────────────────

export interface BookPage {
  id: string;
  title?: string;
  content: React.ReactNode;
  /** Chapter tab label (optional — used for bookmark tabs in the sidebar) */
  chapterLabel?: string;
}

export interface StylePdfBookProps {
  pages: BookPage[];
  initialPage?: number;
  showBookmarks?: boolean;
  className?: string;
  aspectRatio?: "a4" | "letter" | "square";
}

const ASPECT: Record<string, string> = {
  a4:     "aspect-[1/1.414]",
  letter: "aspect-[1/1.294]",
  square: "aspect-square",
};

type FlipDir = "forward" | "backward" | null;

export function StylePdfBook({
  pages,
  initialPage = 0,
  showBookmarks = true,
  className,
  aspectRatio = "a4",
}: StylePdfBookProps) {
  const [current,  setCurrent]  = useState(Math.max(0, Math.min(initialPage, pages.length - 1)));
  const [flipping, setFlipping] = useState<FlipDir>(null);
  const [prev,     setPrev]     = useState<number | null>(null);
  const containerRef            = useRef<HTMLDivElement>(null);

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((target: number, dir: FlipDir) => {
    if (flipping || target === current) return;
    if (target < 0 || target >= pages.length) return;
    setPrev(current);
    setFlipping(dir);
    // After animation duration (600ms), commit
    setTimeout(() => {
      setCurrent(target);
      setFlipping(null);
      setPrev(null);
    }, 620);
  }, [current, flipping, pages.length]);

  const goNext = useCallback(() => goTo(current + 1, "forward"),  [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1, "backward"), [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")  goNext();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")    goPrev();
      if (e.key === "Home") goTo(0, "backward");
      if (e.key === "End")  goTo(pages.length - 1, "forward");
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [goNext, goPrev, goTo, pages.length]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) goNext();
    if (dx >  40) goPrev();
    touchStartX.current = null;
  };

  // Chapters with unique labels
  const chapters = pages.filter((p) => p.chapterLabel);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn("flex gap-4 outline-none", className)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label="Document viewer"
      role="region"
    >
      {/* Bookmark sidebar */}
      {showBookmarks && chapters.length > 0 && (
        <div className="flex flex-col gap-1 pt-4 flex-shrink-0">
          {chapters.map((p) => {
            const idx = pages.indexOf(p);
            const isActive = idx === current;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => goTo(idx, idx > current ? "forward" : "backward")}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-l-md text-xs font-medium transition-all duration-200 text-left max-w-[7rem] truncate",
                  isActive
                    ? "text-[var(--style-color-surface)] pl-3"
                    : "text-[var(--style-color-muted)] hover:text-[var(--style-color-fg)]"
                )}
                style={{
                  background: isActive ? "var(--style-color-primary)" : "transparent",
                  borderRight: `3px solid ${isActive ? "var(--style-color-primary)" : "transparent"}`,
                }}
                title={p.chapterLabel}
              >
                <Bookmark className="h-3 w-3 flex-shrink-0" />
                {p.chapterLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* Book stage */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Page */}
        <div
          className={cn("relative w-full overflow-hidden rounded-[var(--style-radius-card)]", ASPECT[aspectRatio])}
          style={{
            perspective: "2000px",
            boxShadow:   "var(--style-shadow-card)",
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={current}
              initial={{
                opacity: 0,
                rotateY: flipping === "forward" ? 15 : flipping === "backward" ? -15 : 0,
                x:       flipping === "forward" ? 40  : flipping === "backward" ? -40 : 0,
              }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{
                opacity: 0,
                rotateY: flipping === "forward" ? -15 : flipping === "backward" ? 15 : 0,
                x:       flipping === "forward" ? -40  : flipping === "backward" ? 40 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.645, 0.045, 0.355, 1.0] }}
              className="absolute inset-0 w-full h-full overflow-y-auto"
              style={{ background: "var(--style-color-surface)" }}
            >
              <div className="p-6 md:p-10 h-full">
                {pages[current]?.title && (
                  <h3 className="font-heading text-xl font-semibold mb-4" style={{ color: "var(--style-color-primary)" }}>
                    {pages[current].title}
                  </h3>
                )}
                {pages[current]?.content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={current === 0 || !!flipping}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[var(--style-radius-btn)] transition-all duration-150 disabled:opacity-30"
            style={{
              background: "var(--style-color-surface)",
              border:     "1px solid var(--style-color-border)",
              color:      "var(--style-color-fg)",
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="text-xs tabular-nums" style={{ color: "var(--style-color-muted)" }}>
            {current + 1} / {pages.length}
          </span>

          <button
            type="button"
            onClick={goNext}
            disabled={current === pages.length - 1 || !!flipping}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[var(--style-radius-btn)] transition-all duration-150 disabled:opacity-30"
            style={{
              background: "var(--style-color-primary)",
              color:      "var(--style-color-surface)",
            }}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
