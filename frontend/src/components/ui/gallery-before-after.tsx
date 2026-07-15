"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { GalleryBeforeAfter as BeforeAfterSettings } from "@/types/gallery";

interface GalleryBeforeAfterProps {
  beforeSrc: string;
  afterSrc: string;
  settings: BeforeAfterSettings;
  alt?: string;
  className?: string;
}

export function GalleryBeforeAfter({ beforeSrc, afterSrc, settings, alt, className }: GalleryBeforeAfterProps) {
  const [position, setPosition] = useState(settings.defaultPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(99, Math.max(1, x)));
  }, []);

  if (!settings.enabled) return null;

  const handleMouseDown = () => { dragging.current = true; };
  const handleMouseUp = () => { dragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePosition(e.clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { updatePosition(e.touches[0].clientX); };

  const handleStyle = settings.handleStyle === "circle" ? "rounded-full w-10 h-10" :
    settings.handleStyle === "dashed" ? "w-0.5 h-full border-l-2 border-dashed" : "w-0.5 h-full";

  return (
    <div
      ref={containerRef}
      className={cn("relative select-none overflow-hidden", className)}
      style={{ aspectRatio: "16/9", maxHeight: "70vh" }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <img src={afterSrc} alt={alt ? `${alt} (after)` : ""} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={beforeSrc} alt={alt ? `${alt} (before)` : ""} className="absolute top-0 left-0 w-full h-full object-cover max-w-none" style={{ width: `${100 / (position / 100)}%` }} draggable={false} />
      </div>

      <div className="absolute top-0 bottom-0" style={{ left: `${position}%`, transform: "translateX(-50%)" }}>
        <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 shadow-lg flex items-center justify-center cursor-ew-resize z-10", handleStyle)}>
          {settings.handleStyle === "circle" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
              <path d="M9 5l-7 7 7 7M15 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </div>

      {settings.showLabels && (
        <>
          {settings.labelPosition === "overlay" ? (
            <>
              <span className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium bg-black/50 text-white">{settings.labelLeft}</span>
              <span className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium bg-black/50 text-white">{settings.labelRight}</span>
            </>
          ) : settings.labelPosition === "top" ? (
            <>
              <span className="absolute top-1 left-2 text-xs text-white/70 drop-shadow">{settings.labelLeft}</span>
              <span className="absolute top-1 right-2 text-xs text-white/70 drop-shadow">{settings.labelRight}</span>
            </>
          ) : (
            <>
              <span className="absolute bottom-2 left-2 text-xs text-white/70 drop-shadow">{settings.labelLeft}</span>
              <span className="absolute bottom-2 right-2 text-xs text-white/70 drop-shadow">{settings.labelRight}</span>
            </>
          )}
        </>
      )}
    </div>
  );
}
