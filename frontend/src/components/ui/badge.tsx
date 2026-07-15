import { cn } from "@/lib/utils";
import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-transparent", variants[variant], className)} {...props} />
  );
}

export { Badge };

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  IN_REVIEW: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  APPROVED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  REVISION_REQUESTED: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  PUBLISHED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  SCHEDULED: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  ARCHIVED: "bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400",
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium transition-all", style)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

const statusLabels: Record<string, string> = {
  DRAFT: "مسودة",
  SUBMITTED: "مقدمة للمراجعة",
  IN_REVIEW: "قيد المراجعة",
  APPROVED: "موافَق عليها",
  REJECTED: "مرفوضة",
  REVISION_REQUESTED: "طلب تعديل",
  PUBLISHED: "منشورة",
  SCHEDULED: "مجدولة",
  ARCHIVED: "مؤرشفة",
};

export function StatusBadgeAr({ status }: { status: string }) {
  const style = statusStyles[status] || "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium transition-all", style)}>
      {statusLabels[status] || status}
    </span>
  );
}
