"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltDegree?: number;
  perspective?: number;
  scaleOnHover?: number;
}

export function TiltCard({
  children,
  className,
  tiltDegree = 8,
  perspective = 1000,
  scaleOnHover = 1.02,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      rotateY.set(deltaX * tiltDegree);
      rotateX.set(-deltaY * tiltDegree);
    },
    [tiltDegree, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        perspective,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: scaleOnHover }}
      transition={{ scale: { duration: 0.2, ease: "easeOut" } }}
      className={cn("will-change-transform", className)}
    >
      <div style={{ transformStyle: "preserve-3d" }} className={cn({ "transition-shadow duration-300": isHovered })}>
        {children}
      </div>
    </motion.div>
  );
}
