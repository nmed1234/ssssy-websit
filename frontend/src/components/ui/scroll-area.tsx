"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
}

function ScrollArea({ className, orientation = "vertical", children, ...props }: ScrollAreaProps) {
  const overflowClass = orientation === "vertical"
    ? "overflow-y-auto"
    : orientation === "horizontal"
    ? "overflow-x-auto"
    : "overflow-auto";

  return (
    <div
      className={cn(
        "relative",
        overflowClass,
        "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2",
        "[&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-track]:rounded",
        "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
