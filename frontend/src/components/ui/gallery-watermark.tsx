"use client";

import { cn } from "@/lib/utils";
import type { GalleryWatermark as WatermarkSettings } from "@/types/gallery";

interface GalleryWatermarkProps {
  settings: WatermarkSettings;
  className?: string;
}

export function GalleryWatermark({ settings, className }: GalleryWatermarkProps) {
  if (!settings.enabled) return null;

  const positionClass = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  }[settings.position];

  return (
    <div
      className={cn("absolute pointer-events-none z-10", positionClass, className)}
      style={{
        opacity: settings.opacity / 100,
        margin: settings.margin,
        maxWidth: `${settings.size}%`,
      }}
    >
      {settings.type === "text" ? (
        <span className="text-white font-bold text-sm md:text-base lg:text-lg drop-shadow-lg" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
          {settings.text}
        </span>
      ) : settings.imageUrl ? (
        <img src={settings.imageUrl} alt="Watermark" className="w-full h-auto" />
      ) : null}
    </div>
  );
}
