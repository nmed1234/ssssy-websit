"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { GalleryColorIntelligence as ColorSettings } from "@/types/gallery";

interface GalleryColorPaletteProps {
  imageSrc: string;
  settings: ColorSettings;
  className?: string;
}

export function GalleryColorPalette({ imageSrc, settings, className }: GalleryColorPaletteProps) {
  const palette = useMemo(() => extractColors(imageSrc, settings.paletteSize), [imageSrc, settings.paletteSize]);

  if (!settings.enabled || !settings.showPalette || palette.length === 0) return null;

  return (
    <div className={cn("flex gap-1", className)}>
      {palette.map((color, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
}

function extractColors(src: string, count: number): string[] {
  if (typeof window === "undefined") return [];
  const cacheKey = `palette_${src}_${count}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    const canvas = document.createElement("canvas");
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, 50, 50);
    const imageData = ctx.getImageData(0, 0, 50, 50).data;

    const colorBuckets: Record<string, number> = {};
    for (let i = 0; i < imageData.length; i += 16) {
      const r = Math.round(imageData[i] / 32) * 32;
      const g = Math.round(imageData[i + 1] / 32) * 32;
      const b = Math.round(imageData[i + 2] / 32) * 32;
      const key = `${r},${g},${b}`;
      colorBuckets[key] = (colorBuckets[key] || 0) + 1;
    }

    const sorted = Object.entries(colorBuckets)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([key]) => {
        const [r, g, b] = key.split(",").map(Number);
        return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      });

    sessionStorage.setItem(cacheKey, JSON.stringify(sorted));
    setTimeout(() => sessionStorage.removeItem(cacheKey), 60000);
    return sorted;
  } catch {
    return [];
  }
}
