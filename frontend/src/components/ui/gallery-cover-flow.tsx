"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage, Gallery3DLayouts } from "@/types/gallery";

interface CoverFlow3DProps {
  images: GalleryImage[];
  settings: Gallery3DLayouts;
  onImageClick: (index: number) => void;
  className?: string;
}

export function CoverFlow3D({ images, settings, onImageClick, className }: CoverFlow3DProps) {
  const [centerIndex, setCenterIndex] = useState(0);

  if (!settings.coverFlow || images.length === 0) return null;

  const goPrev = () => setCenterIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setCenterIndex((i) => (i + 1) % images.length);

  const visibleIndices = [-2, -1, 0, 1, 2].map((offset) => (centerIndex + offset + images.length) % images.length);

  return (
    <div className={cn("relative w-full overflow-hidden py-8", className)} style={{ minHeight: "400px" }}>
      <div className="flex items-center justify-center h-full perspective-[1200px]" style={{ perspective: "1200px" }}>
        {visibleIndices.map((imgIndex, slotIndex) => {
          const img = images[imgIndex];
          const offset = slotIndex - 2;
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);

          const rotateY = offset * 45;
          const translateX = offset * (isCenter ? 0 : offset > 0 ? 80 : -80);
          const translateZ = -absOffset * 120;
          const scale = 1 - absOffset * 0.15;
          const opacity = 1 - absOffset * 0.25;

          return (
            <motion.button
              key={imgIndex}
              initial={false}
              animate={{
                rotateY,
                x: translateX,
                z: translateZ,
                scale,
                opacity: Math.max(0, opacity),
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute cursor-pointer"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
              onClick={() => {
                if (isCenter) onImageClick(imgIndex);
                else if (offset < 0) goPrev();
                else goNext();
              }}
            >
              <div
                className="overflow-hidden"
                style={{
                  width: isCenter ? "clamp(200px, 30vw, 320px)" : "clamp(120px, 18vw, 200px)",
                  boxShadow: isCenter ? "0 8px 30px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.15)",
                  borderRadius: "8px",
                }}
              >
                {img.src ? (
                  <img src={img.src} alt={img.alt || ""} className="w-full aspect-video object-cover" loading="lazy" />
                ) : (
                  <div className="w-full aspect-video bg-muted flex items-center justify-center text-muted-foreground text-xs">{img.title || ""}</div>
                )}
              </div>
              {settings.coverFlowReflection && (
                <div
                  className="mt-1 overflow-hidden opacity-30"
                  style={{
                    width: isCenter ? "clamp(200px, 30vw, 320px)" : "clamp(120px, 18vw, 200px)",
                    borderRadius: "8px",
                    transform: "scaleY(-1)",
                    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
                  }}
                >
                  {img.src ? (
                    <img src={img.src} alt="" className="w-full aspect-video object-cover" />
                  ) : (
                    <div className="w-full aspect-video bg-muted" />
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {images.length > 1 && (
        <>
          <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors z-10" aria-label="Previous">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors z-10" aria-label="Next">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCenterIndex(i)}
            className={cn("w-2 h-2 rounded-full transition-all", i === centerIndex ? "bg-primary w-4" : "bg-muted-foreground/30")}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
