"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeIn } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0.2,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeIn(direction)}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
