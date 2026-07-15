import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: [React.ReactNode, React.ReactNode];
  className?: string;
}

function Tooltip({ children, className }: TooltipProps) {
  const [trigger, content] = React.Children.toArray(children);
  return (
    <div className={cn("group relative inline-flex", className)}>
      {trigger}
      <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-border">
        {content}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-border" />
      </div>
    </div>
  );
}

export { Tooltip };
