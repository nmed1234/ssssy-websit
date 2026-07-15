"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, defaultChecked = false, onCheckedChange, disabled, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isControlled = checked !== undefined;
    const rawChecked = isControlled ? checked : internalChecked;
    const isChecked = rawChecked === true || rawChecked === "indeterminate";

    const handleClick = () => {
      if (disabled) return;
      const newValue = !isChecked;
      if (!isControlled) setInternalChecked(newValue);
      onCheckedChange?.(newValue);
    };

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={rawChecked === "indeterminate" ? "mixed" : isChecked}
        disabled={disabled}
        onClick={handleClick}
        ref={ref}
        className={cn(
          "peer inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-input ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-primary border-primary text-primary-foreground" : "bg-background hover:bg-muted",
          className
        )}
        {...props}
      >
        {isChecked && (
          <motion.span
            key={rawChecked === "indeterminate" ? "indeterminate" : "checked"}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {rawChecked === "indeterminate" ? (
              <Minus className="h-3.5 w-3.5" strokeWidth={3} />
            ) : (
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            )}
          </motion.span>
        )}
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
