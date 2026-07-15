"use client";
import { useEffect, useState, useCallback } from "react";

export interface GalleryThemeColors {
  background: string;
  overlay: string;
  accent: string;
  text: string;
}

const DEFAULT_THEME: GalleryThemeColors = {
  background: "#000000",
  overlay: "rgba(0,0,0,0.8)",
  accent: "#3b82f6",
  text: "#ffffff",
};

export function useGalleryAutoTheme(
  imageUrl: string | null,
  enabled: boolean
): GalleryThemeColors {
  const [theme, setTheme] = useState<GalleryThemeColors>(DEFAULT_THEME);

  const extractColors = useCallback(async (url: string) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, 100, 100);
      const data = ctx.getImageData(0, 0, 100, 100).data;

      const colorCounts: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 16) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }

      const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length === 0) return;

      const dominant = sorted[0][0].split(",").map(Number);
      const secondary = sorted.length > 1 ? sorted[1][0].split(",").map(Number) : dominant;

      const lum = (dominant[0] * 299 + dominant[1] * 587 + dominant[2] * 114) / 1000;
      const isDark = lum < 128;

      setTheme({
        background: isDark ? `rgb(${dominant[0]},${dominant[1]},${dominant[2]})` : `rgb(${Math.max(0, dominant[0] - 40)},${Math.max(0, dominant[1] - 40)},${Math.max(0, dominant[2] - 40)})`,
        overlay: isDark ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.7)",
        accent: `rgb(${secondary[0]},${secondary[1]},${secondary[2]})`,
        text: isDark ? "#ffffff" : "#f0f0f0",
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (enabled && imageUrl) {
      extractColors(imageUrl);
    } else if (!enabled) {
      setTheme(DEFAULT_THEME);
    }
  }, [imageUrl, enabled, extractColors]);

  return theme;
}

export function GalleryThemeProvider({
  theme,
  children,
}: {
  theme: GalleryThemeColors;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        "--gallery-bg": theme.background,
        "--gallery-overlay": theme.overlay,
        "--gallery-accent": theme.accent,
        "--gallery-text": theme.text,
      } as React.CSSProperties}
      className="[&_.gallery-container]:bg-[var(--gallery-bg)] [&_.gallery-overlay]:bg-[var(--gallery-overlay)] [&_.gallery-accent]:text-[var(--gallery-accent)] [&_.gallery-text]:text-[var(--gallery-text)]"
    >
      {children}
    </div>
  );
}
