/**
 * @ssssy/cms-sdk — CmsWorkflowButton Component
 *
 * A button that fires a workflow action on a content item.
 * Automatically hides if the user doesn't have the required role or the
 * action is not available for the current workflow state.
 *
 * Usage:
 *   <CmsWorkflowButton
 *     client={cmsClient}
 *     contentId={article.id}
 *     action="APPROVE"
 *     label="Approve Article"
 *     requiredRole="EDITOR"
 *     onSuccess={() => router.refresh()}
 *   />
 */

"use client";

import React from "react";
import { useWorkflow, useAuth } from "../hooks";
import type { CmsClient } from "../client";

interface CmsWorkflowButtonProps {
  client: CmsClient;
  contentId: string;
  /** The workflow action to fire, e.g. "APPROVE", "REJECT", "PUBLISH" */
  action: string;
  /** Button label */
  label: string;
  /** Minimum role required to show/use this button */
  requiredRole?: string;
  /** Optional comment attached to the transition */
  comment?: string;
  /** Called after the transition fires successfully */
  onSuccess?: () => void;
  /** Called if the transition fails */
  onError?: (err: string) => void;
  className?: string;
  variant?: "primary" | "danger" | "secondary";
}

export function CmsWorkflowButton({
  client,
  contentId,
  action,
  label,
  requiredRole,
  comment,
  onSuccess,
  onError,
  className = "",
  variant = "primary",
}: CmsWorkflowButtonProps) {
  const { state, fire, firing } = useWorkflow(client, contentId);
  const auth = useAuth(client);

  // Role guard
  if (requiredRole && !auth.hasRole(requiredRole)) return null;

  // Only show if this action is available in the current state
  const actionAvailable = state?.availableTransitions.some((t) => t.action === action);
  if (!actionAvailable && state !== null) return null;

  const variantClasses: Record<string, string> = {
    primary: "bg-green-700 hover:bg-green-800 text-white",
    danger:  "bg-red-600 hover:bg-red-700 text-white",
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };

  const handleClick = async () => {
    try {
      fire(action, comment);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Action failed";
      onError?.(msg);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={firing}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {firing && (
        <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" />
      )}
      {label}
    </button>
  );
}
