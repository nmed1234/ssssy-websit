"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerContainer, listItem } from "@/lib/animation-variants";
import { useMemo } from "react";

interface MasonryGridProps {
  children: React.ReactNode[];
  className?: string;
  columnCount?: number;
}

export function MasonryGrid({ children, className, columnCount = 4 }: MasonryGridProps) {
  const cols = Math.min(columnCount, children.length);

  const columnStyle = useMemo(() => ({
    columnCount: cols as number,
    columnGap: "1rem",
  }), [cols]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={cn(
        "space-y-4",
        className
      )}
      style={columnStyle}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={listItem}
          className="break-inside-avoid"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
