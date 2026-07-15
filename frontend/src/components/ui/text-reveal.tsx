"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

interface TextRevealProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  delay?: number;
  mode?: "word" | "char";
  once?: boolean;
}

const charVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.4, ease: "easeOut" },
  }),
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
};

export function TextReveal({
  children,
  as: Tag = "h2",
  className = "",
  mode = "word",
  once = true,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px" });

  const items = mode === "char" ? children.split("") : children.split(" ");
  const variant = mode === "char" ? charVariants : wordVariants;

  return (
    <div ref={ref} className={className}>
      <Tag className="inline flex-wrap">
        {items.map((item, i) => (
          <motion.span
            key={`${item}-${i}`}
            className="inline-block"
            custom={i}
            variants={variant}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {item}{mode === "word" && i < items.length - 1 ? "\u00A0" : ""}
          </motion.span>
        ))}
      </Tag>
    </div>
  );
}
