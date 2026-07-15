"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkflowStatusBadgeProps {
  status: string;
  lastTransitionBy?: string;
  lastTransitionAt?: string;
  className?: string;
}

// ─── Color map per spec (Requirements 10.2, 10.4) ────────────────────────────

type StatusKey = "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED";

const STATUS_STYLES: Record<StatusKey, string> = {
  DRAFT:     "bg-gray-100 text-gray-600",
  REVIEW:    "bg-yellow-100 text-yellow-700",
  APPROVED:  "bg-green-100 text-green-700",
  PUBLISHED: "bg-blue-100 text-blue-700",
};

const UNKNOWN_STYLE = "bg-gray-100 text-gray-500";

// ─── Date formatter ───────────────────────────────────────────────────────────

/**
 * Formats an ISO date string as "DD MMM YYYY HH:mm" (e.g. "11 Jul 2026 10:30").
 * Uses Intl.DateTimeFormat — no external dependency required.
 */
function formatTransitionDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const day   = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" }); // e.g. "Jul"
    const year  = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const mins  = date.getMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${year} ${hours}:${mins}`;
  } catch {
    return isoString;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a coloured status pill for a page's workflow state.
 *
 * When `lastTransitionBy` or `lastTransitionAt` are provided a tooltip appears
 * on hover: "{STATUS} by {displayName} on {DD MMM YYYY HH:mm}".
 */
export function WorkflowStatusBadge({
  status,
  lastTransitionBy,
  lastTransitionAt,
  className,
}: WorkflowStatusBadgeProps) {
  const styleClass =
    STATUS_STYLES[status as StatusKey] ?? UNKNOWN_STYLE;

  const badge = (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styleClass,
        className
      )}
      aria-label={`Workflow status: ${status}`}
    >
      {status}
    </span>
  );

  // Only wrap in Tooltip when there is hover content to show (Req 10.4)
  if (!lastTransitionBy && !lastTransitionAt) {
    return badge;
  }

  const tooltipText = [
    status,
    lastTransitionBy ? `by ${lastTransitionBy}` : null,
    lastTransitionAt ? `on ${formatTransitionDate(lastTransitionAt)}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tooltip>
      {badge}
      <span>{tooltipText}</span>
    </Tooltip>
  );
}

export default WorkflowStatusBadge;
