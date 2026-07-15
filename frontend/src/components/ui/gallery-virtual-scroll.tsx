"use client";
import { useRef, useState, useEffect, useCallback } from "react";

interface VirtualScrollItem {
  id: string;
  height: number;
  render: (item: VirtualScrollItem, index: number) => React.ReactNode;
}

interface GalleryVirtualScrollProps {
  items: VirtualScrollItem[];
  containerHeight?: number;
  overscan?: number;
}

export default function GalleryVirtualScroll({ items, containerHeight = 800, overscan = 5 }: GalleryVirtualScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.reduce((sum, item) => sum + item.height, 0);

  const getItemOffset = useCallback((index: number) => {
    let offset = 0;
    for (let i = 0; i < index; i++) offset += items[i].height;
    return offset;
  }, [items]);

  const visibleRange = useCallback(() => {
    const start = Math.max(0, findStartIndex(scrollTop - overscan * 200));
    let end = start;
    let accumulated = 0;
    for (let i = start; i < items.length; i++) {
      accumulated += items[i].height;
      if (accumulated > containerHeight + overscan * 400) {
        end = i + 1;
        break;
      }
      end = i + 1;
    }
    return { start, end: Math.min(end, items.length) };
  }, [scrollTop, items, containerHeight, overscan]);

  function findStartIndex(targetOffset: number): number {
    let offset = 0;
    for (let i = 0; i < items.length; i++) {
      if (offset + items[i].height > targetOffset) return i;
      offset += items[i].height;
    }
    return items.length - 1;
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => setScrollTop(container.scrollTop);
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const { start, end } = visibleRange();

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto"
      style={{ height: containerHeight, position: "relative" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {items.slice(start, end).map((item, i) => {
          const idx = start + i;
          const top = getItemOffset(idx);
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${top}px)`,
                height: item.height,
              }}
            >
              {item.render(item, idx)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function useVirtualGallery(items: { id: string; height?: number }[]) {
  return items.map((item) => ({
    id: item.id,
    height: item.height || 300,
    render: () => null,
  }));
}
