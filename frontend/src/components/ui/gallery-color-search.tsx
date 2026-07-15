"use client";

interface GalleryColorSearchProps {
  palette: string[];
  onColorSelect: (color: string | null) => void;
  selectedColor?: string | null;
}

export default function GalleryColorSearch({ palette, onColorSelect, selectedColor }: GalleryColorSearchProps) {
  if (!palette || palette.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground font-medium">Filter by color</div>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onColorSelect(null)}
          className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center text-[10px] font-bold ${
            !selectedColor ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border hover:border-muted-foreground"
          }`}
          title="Show all"
          aria-label="Clear color filter"
        >
          ✕
        </button>
        {palette.map((color, i) => (
          <button
            key={i}
            onClick={() => onColorSelect(color)}
            className={`w-7 h-7 rounded-full border-2 transition-all ${
              selectedColor === color ? "border-primary ring-2 ring-primary/30 scale-110" : "border-transparent hover:scale-110"
            }`}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`Filter by color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}

export function colorDistance(c1: string, c2: string): number {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  if (!rgb1 || !rgb2) return Infinity;
  return Math.sqrt(
    (rgb1.r - rgb2.r) ** 2 +
    (rgb1.g - rgb2.g) ** 2 +
    (rgb1.b - rgb2.b) ** 2
  );
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6 && clean.length !== 3) return null;
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function filterImagesByColor<T extends { palette?: string[] }>(
  images: T[],
  targetColor: string | null,
  threshold = 150
): T[] {
  if (!targetColor) return images;
  return images.filter((img) => {
    if (!img.palette || img.palette.length === 0) return false;
    return img.palette.some((c) => colorDistance(c, targetColor) <= threshold);
  });
}
