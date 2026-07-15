import type { Variants } from "framer-motion";

export const fadeIn = (direction: "up" | "down" | "left" | "right" = "up"): Variants => ({
  hidden: {
    opacity: 0,
    ...(direction === "up" && { y: 24 }),
    ...(direction === "down" && { y: -24 }),
    ...(direction === "left" && { x: -24 }),
    ...(direction === "right" && { x: 24 }),
  },
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
});

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export const slideIn = (direction: "bottom" | "left" | "right" = "bottom"): Variants => ({
  hidden: {
    ...(direction === "bottom" && { y: "100%" }),
    ...(direction === "left" && { x: "-100%" }),
    ...(direction === "right" && { x: "100%" }),
  },
  show: {
    y: 0,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
});

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const cardHover: Variants = {
  rest: {
    scale: 1,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  },
  hover: {
    scale: 1.02,
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
  },
};

export const buttonTap: Variants = {
  rest: { scale: 1 },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

export const listItem: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};
