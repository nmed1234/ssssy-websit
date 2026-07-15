"use client";
import { useRef, useEffect, useState } from "react";

interface PanoramaViewerProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export default function GalleryPanorama({ src, alt = "", width: w = 1200, height: h = 500 }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setOffsetX((prev) => {
        const max = 0;
        const min = -(w - container.clientWidth);
        return Math.max(min, Math.min(max, prev - e.deltaY * 2));
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [w]);

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startOffsetRef.current = offsetX;
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    const dx = e.clientX - startXRef.current;
    const max = 0;
    const min = -(w - (containerRef.current?.clientWidth || w));
    setOffsetX(Math.max(min, Math.min(max, startOffsetRef.current + dx)));
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg cursor-grab active:cursor-grabbing"
      style={{ width: "100%", maxWidth: "100%", height: h }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="img"
      aria-label={`Panorama: ${alt}`}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="pointer-events-none select-none"
        style={{
          width: w,
          height: "100%",
          objectFit: "cover",
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-xs rounded-full">
        Drag to explore &middot; Scroll to pan
      </div>
    </div>
  );
}
