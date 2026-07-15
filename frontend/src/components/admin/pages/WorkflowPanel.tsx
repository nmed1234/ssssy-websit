"use client";

import React, { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WorkflowStatusBadge } from "@/components/admin/WorkflowStatusBadge";
import api from "@/lib/api";
import { toast } from "@/components/ui/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Subset of roles that matter for the page workflow. */
type UserRole = "ADMIN" | "PUBLISHER" | "EDITOR" | string;

/** The four page workflow states. */
type WorkflowState = "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED";

/** What the PATCH /api/admin/pages/{id}/workflow endpoint accepts. */
interface WorkflowTransitionRequest {
  toState: WorkflowState;
  notes?: string;
}

/** Backend response shape after a successful transition. */
interface WorkflowTransitionResponse {
  workflowStatus?: string;
  data?: { workflowStatus?: string };
}

export interface WorkflowPanelProps {
  /** ID of the page being edited. */
  pageId: string;
  /** Current workflow state of the page. */
  currentState: WorkflowState | string;
  /** Role of the currently authenticated user. */
  currentUserRole: UserRole;
  /** Optional: display name of the last person who transitioned the workflow. */
  lastTransitionBy?: string;
  /** Optional: ISO timestamp of the last transition. */
  lastTransitionAt?: string;
  /** Called with the new state string after a successful transition. */
  onStatusChange?: (newState: string) => void;
}

// ─── Transition permission matrix (per spec Requirement 9.2–9.9) ─────────────

interface Transition {
  toState: WorkflowState;
  label: string;
  /** Roles allowed to trigger this transition. */
  allowedRoles: UserRole[];
  /** The state the page must currently be in. */
  fromState: WorkflowState;
  /** Whether this transition requires a non-empty notes/reason field. */
  requiresNotes: boolean;
  variant: "default" | "destructive" | "outline" | "secondary";
}

const TRANSITIONS: Transition[] = [
  {
    fromState:    "DRAFT",
    toState:      "REVIEW",
    label:        "Submit for Review",
    allowedRoles: ["EDITOR", "PUBLISHER", "ADMIN"],
    requiresNotes: false,
    variant:      "default",
  },
  {
    fromState:    "REVIEW",
    toState:      "APPROVED",
    label:        "Approve",
    allowedRoles: ["PUBLISHER", "ADMIN"],
    requiresNotes: false,
    variant:      "secondary",
  },
  {
    fromState:    "REVIEW",
    toState:      "DRAFT",
    label:        "Reject",
    allowedRoles: ["PUBLISHER", "ADMIN"],
    requiresNotes: true,
    variant:      "destructive",
  },
  {
    fromState:    "APPROVED",
    toState:      "PUBLISHED",
    label:        "Publish",
    allowedRoles: ["PUBLISHER", "ADMIN"],
    requiresNotes: false,
    variant:      "default",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvailableTransitions(
  currentState: string,
  userRole: string
): Transition[] {
  return TRANSITIONS.filter(
    (t) =>
      t.fromState === currentState &&
      t.allowedRoles.includes(userRole)
  );
}

// ─── Rejection notes sub-panel ────────────────────────────────────────────────

interface RejectionNotesProps {
  notes: string;
  onChange: (v: string) => void;
  error: string | null;
}

function RejectionNotes({ notes, onChange, error }: RejectionNotesProps) {
  const MAX = 1000;
  return (
    <div className="mt-3 space-y-1.5">
      <label
        htmlFor="wf-rejection-notes"
        className="block text-xs font-medium text-foreground"
      >
        Rejection Reason <span className="text-red-500">*</span>
      </label>
      <textarea
        id="wf-rejection-notes"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX}
        rows={3}
        placeholder="Explain why this page is being rejected…"
        className={cn(
          "w-full resize-none rounded-md border px-3 py-2 text-sm outline-none",
          "focus:ring-2 focus:ring-soil-clay/40 transition-colors",
          error ? "border-red-500" : "border-input"
        )}
        aria-describedby={error ? "wf-notes-error" : undefined}
        aria-invalid={!!error}
      />
      <div className="flex items-start justify-between gap-2">
        {error ? (
          <p
            id="wf-notes-error"
            role="alert"
            className="text-xs text-red-600 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3 shrink-0" />
            {error}
          </p>
        ) : (
          <span />
        )}
        <span className="text-xs text-muted-foreground whitespace-nowrap ml-auto">
          {notes.length}/{MAX}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * WorkflowPanel — sidebar panel for the page editor.
 *
 * Displays the current workflow status badge and action buttons filtered by
 * the current user's role and the page's current state (Requirements 9.2–9.7).
 */
export function WorkflowPanel({
  pageId,
  currentState,
  currentUserRole,
  lastTransitionBy,
  lastTransitionAt,
  onStatusChange,
}: WorkflowPanelProps) {
  const available = getAvailableTransitions(currentState, currentUserRole);

  // Which action button was clicked (to show its inline confirm / notes UI)
  const [pendingTransition, setPendingTransition] = useState<Transition | null>(null);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Reset local state whenever the page changes ──
  React.useEffect(() => {
    setPendingTransition(null);
    setNotes("");
    setNotesError(null);
    setApiError(null);
  }, [pageId, currentState]);

  // ── Action handlers ──

  function handleActionClick(transition: Transition) {
    // If the same button is clicked again, cancel the pending action
    if (pendingTransition?.toState === transition.toState) {
      setPendingTransition(null);
      setNotes("");
      setNotesError(null);
      setApiError(null);
      return;
    }
    setPendingTransition(transition);
    setNotes("");
    setNotesError(null);
    setApiError(null);
  }

  async function handleConfirm() {
    if (!pendingTransition) return;

    // Validate rejection notes if required
    if (pendingTransition.requiresNotes) {
      if (!notes.trim()) {
        setNotesError("A rejection reason is required (1–1000 characters).");
        return;
      }
      if (notes.trim().length > 1000) {
        setNotesError("Rejection reason must be 1000 characters or fewer.");
        return;
      }
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload: WorkflowTransitionRequest = {
        toState: pendingTransition.toState,
        ...(pendingTransition.requiresNotes ? { notes: notes.trim() } : {}),
      };

      const res = await api.patch<WorkflowTransitionResponse>(
        `/admin/pages/${pageId}/workflow`,
        payload
      );

      // Resolve new state from response (handle both flat and nested shapes)
      const responseData = res.data as WorkflowTransitionResponse;
      const newState: string =
        responseData.workflowStatus ??
        responseData.data?.workflowStatus ??
        pendingTransition.toState;

      // Notify parent and reset
      onStatusChange?.(newState);
      setPendingTransition(null);
      setNotes("");
      setNotesError(null);

      toast({
        title: "Workflow updated",
        description: `Page moved to ${newState}.`,
        variant: "success",
      });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      const msg =
        axiosErr.response?.data?.message ??
        axiosErr.response?.data?.error ??
        "Failed to update workflow status. Please try again.";

      // Show error without changing the displayed status (Req 9.7)
      setApiError(msg);
      toast({
        title: "Workflow error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    setPendingTransition(null);
    setNotes("");
    setNotesError(null);
    setApiError(null);
  }

  // ── Render ──

  return (
    <section
      aria-label="Workflow"
      className="rounded-lg border bg-card p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold">Workflow</h3>
        <WorkflowStatusBadge
          status={currentState}
          lastTransitionBy={lastTransitionBy}
          lastTransitionAt={lastTransitionAt}
        />
      </div>

      {/* API error banner */}
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Action buttons */}
      {available.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Available actions</p>
          <div className="flex flex-col gap-2">
            {available.map((transition) => {
              const isPending = pendingTransition?.toState === transition.toState;
              return (
                <div key={transition.toState}>
                  <Button
                    type="button"
                    variant={transition.variant}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleActionClick(transition)}
                    disabled={isSubmitting}
                    aria-pressed={isPending}
                    aria-expanded={isPending && transition.requiresNotes}
                  >
                    {isPending && isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : null}
                    {transition.label}
                  </Button>

                  {/* Inline confirmation / rejection notes panel */}
                  {isPending && (
                    <div
                      className="mt-2 rounded-md border bg-muted/40 p-3"
                      role="region"
                      aria-label={`Confirm: ${transition.label}`}
                    >
                      {transition.requiresNotes && (
                        <RejectionNotes
                          notes={notes}
                          onChange={(v) => {
                            setNotes(v);
                            if (notesError && v.trim()) setNotesError(null);
                          }}
                          error={notesError}
                        />
                      )}

                      {!transition.requiresNotes && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Confirm: <strong>{transition.label}</strong>?
                        </p>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Button
                          type="button"
                          size="sm"
                          variant={transition.variant}
                          onClick={handleConfirm}
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          ) : null}
                          Confirm
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No actions available for your role in the current state.
        </p>
      )}
    </section>
  );
}

export default WorkflowPanel;
