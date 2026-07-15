"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext() {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) throw new Error("Collapsible compound components must be used within <Collapsible>");
  return ctx;
}

function Collapsible({ open: controlledOpen, onOpenChange, children, className }: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;
  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <div className={cn(className)}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

function CollapsibleTrigger({ className, children, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useCollapsibleContext();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn("flex items-center gap-2 w-full text-left", className)}
      {...props}
    >
      {children}
    </button>
  );
}

function CollapsibleContent({ className, children, ...props }: HTMLMotionProps<"div">) {
  const { open } = useCollapsibleContext();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn("overflow-hidden", className)}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
