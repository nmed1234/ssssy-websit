"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { GalleryHotspotData as HotspotData, GalleryHotspot as HotspotSettings } from "@/types/gallery";
import { MapPin, Plus, Circle } from "lucide-react";

interface GalleryHotspotOverlayProps {
  hotspots: HotspotData[];
  settings: HotspotSettings;
  imageWidth: number;
  imageHeight: number;
  className?: string;
}

export function GalleryHotspotOverlay({ hotspots, settings, imageWidth, imageHeight, className }: GalleryHotspotOverlayProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!settings.enabled || hotspots.length === 0) return null;

  const IconComponent = settings.markerIcon === "pin" ? MapPin :
    settings.markerIcon === "plus" ? Plus :
    settings.markerIcon === "number" ? Circle : Circle;

  return (
    <div className={cn("absolute inset-0 z-20", className)}>
      {hotspots.map((hotspot, i) => (
        <div
          key={hotspot.id}
          className="absolute"
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          onMouseEnter={() => settings.showOnHover && setActiveId(hotspot.id)}
          onMouseLeave={() => settings.showOnHover && setActiveId(null)}
          onClick={() => {
            if (hotspot.link) window.open(hotspot.link, "_blank");
            else setActiveId(activeId === hotspot.id ? null : hotspot.id);
          }}
        >
          <button
            className={cn(
              "flex items-center justify-center transition-transform hover:scale-110",
              settings.markerIcon === "number" ? "rounded-full bg-white text-black font-bold text-xs" : "text-white drop-shadow-lg"
            )}
            style={{
              width: settings.markerSize,
              height: settings.markerSize,
              color: settings.markerColor,
              backgroundColor: settings.markerIcon === "number" ? settings.markerColor : "transparent",
              borderRadius: settings.markerIcon === "circle" ? "50%" : undefined,
            }}
            aria-label={hotspot.title}
          >
            {settings.markerIcon === "number" ? i + 1 : <IconComponent className="w-full h-full" style={{ color: settings.markerColor }} />}
          </button>

          {(activeId === hotspot.id || !settings.showOnHover) && (
            <div
              className={cn(
                "absolute z-30 mt-2 p-3 rounded-lg shadow-xl min-w-[180px] max-w-[260px] left-1/2 -translate-x-1/2",
                settings.tooltipStyle === "dark" && "bg-gray-900/95 text-white border border-white/10",
                settings.tooltipStyle === "light" && "bg-white/95 text-gray-900 border border-gray-200",
                settings.tooltipStyle === "glass" && "bg-white/20 backdrop-blur-md text-white border border-white/20",
              )}
            >
              <p className="font-medium text-sm">{hotspot.title}</p>
              {hotspot.description && <p className="text-xs mt-1 opacity-80">{hotspot.description}</p>}
              {hotspot.link && <p className="text-xs mt-1 underline opacity-70">Click to visit</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
