"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  pullDistance?: number;
  springStrength?: number;
}

export function MagneticWrapper({
  children,
  className,
  pullDistance = 20,
  springStrength = 150,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: springStrength, damping: 15 });
  const springY = useSpring(y, { stiffness: springStrength, damping: 15 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      x.set(deltaX * pullDistance);
      y.set(deltaY * pullDistance);
    },
    [pullDistance, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
