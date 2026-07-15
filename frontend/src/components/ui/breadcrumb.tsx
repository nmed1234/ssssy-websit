import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Slash } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: "chevron" | "slash";
}

function Breadcrumb({ items, separator = "chevron", className, ...props }: BreadcrumbProps) {
  const SeparatorIcon = separator === "chevron" ? ChevronRight : Slash;
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)} {...props}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <SeparatorIcon className="h-4 w-4 mx-0.5" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb };
