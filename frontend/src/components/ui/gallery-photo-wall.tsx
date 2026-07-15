"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GalleryImage, Gallery3DLayouts } from "@/types/gallery";

interface PhotoWall3DProps {
  images: GalleryImage[];
  settings: Gallery3DLayouts;
  onImageClick: (index: number) => void;
  className?: string;
}

export function PhotoWall3D({ images, settings, onImageClick, className }: PhotoWall3DProps) {
  const positioned = useMemo(() => {
    return images.map((img, i) => {
      const angle = (Math.random() - 0.5) * settings.photoWallRotation * 2;
      const xOffset = (Math.random() - 0.5) * 40;
      const yOffset = (Math.random() - 0.5) * 20;
      const zIndex = i;
      return { ...img, angle, xOffset, yOffset, zIndex };
    });
  }, [images, settings.photoWallRotation]);

  if (!settings.photoWall || images.length === 0) return null;

  return (
    <div className={cn("relative w-full", className)} style={{ minHeight: "500px" }}>
      {positioned.map((img, i) => (
        <motion.button
          key={img.id || i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="absolute cursor-pointer hover:z-50 transition-all duration-300"
          style={{
            left: `calc(50% + ${img.xOffset}%)`,
            top: `calc(50% + ${img.yOffset}%)`,
            transform: `translate(-50%, -50%) rotate(${img.angle}deg)`,
            zIndex: img.zIndex,
            width: "clamp(120px, 18vw, 220px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
          onClick={() => onImageClick(i)}
          whileHover={{
            scale: 1.15,
            rotate: 0,
            zIndex: 100,
            transition: { duration: 0.2 },
          }}
        >
          <div className="bg-white p-2 pb-8 rounded-sm shadow-xl">
            {img.src ? (
              <img src={img.src} alt={img.alt || ""} className="w-full aspect-square object-cover" loading="lazy" />
            ) : (
              <div className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs">{img.title || ""}</div>
            )}
            {img.title && (
              <p className="text-center text-[10px] text-gray-600 mt-1 truncate px-1 font-medium">{img.title}</p>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
