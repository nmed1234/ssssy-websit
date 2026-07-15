"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";

interface HoverCardContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

function useHoverCardContext() {
  const ctx = React.useContext(HoverCardContext);
  if (!ctx) throw new Error("HoverCard compound components must be used within <HoverCard>");
  return ctx;
}

function HoverCard({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <HoverCardContext.Provider value={{ open, setOpen }}>
      <div
        className="relative inline-flex"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
}

function HoverCardTrigger({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("inline-flex", className)} {...props}>
      {children}
    </div>
  );
}

function HoverCardContent({ className, align = "center", children, ...props }: HTMLMotionProps<"div"> & { align?: "start" | "center" | "end" }) {
  const { open } = useHoverCardContext();
  const alignClass = align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "absolute z-50 mt-1 min-w-[12rem] rounded-md border bg-popover p-4 text-popover-foreground shadow-md",
            "top-full",
            alignClass,
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
