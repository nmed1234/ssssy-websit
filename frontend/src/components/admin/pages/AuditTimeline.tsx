"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Matches PageAuditRecord from the backend spec. */
export interface AuditRecord {
  id: string;
  action: AuditAction;
  userId: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  timestamp: string; // ISO-8601
  changedFields: Record<string, { before: unknown; after: unknown }>;
}

type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "UNPUBLISH"
  | "WORKFLOW_TRANSITION"
  | string;

interface PagedResponse<T> {
  data?: {
    content?: T[];
    data?: T[];
    totalPages?: number;
    totalElements?: number;
    number?: number;
  };
  // flat response fallback
  content?: T[];
  totalPages?: number;
  number?: number;
}

export interface AuditTimelineProps {
  /** ID of the page whose audit trail to display. */
  pageId: string;
  /** Page size for each API request. Defaults to 20. */
  pageSize?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_ACTION_TYPES: AuditAction[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "PUBLISH",
  "UNPUBLISH",
  "WORKFLOW_TRANSITION",
];

/** Human-readable labels for each action. */
const ACTION_LABELS: Record<string, string> = {
  CREATE: "Page Created",
  UPDATE: "Page Updated",
  DELETE: "Page Deleted",
  PUBLISH: "Published",
  UNPUBLISH: "Unpublished",
  WORKFLOW_TRANSITION: "Workflow Transition",
};

/** Tailwind colour classes per action (dot + bg). */
const ACTION_COLORS: Record<string, { dot: string; badge: string }> = {
  CREATE: { dot: "bg-green-500", badge: "bg-green-100 text-green-700" },
  UPDATE: { dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  DELETE: { dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
  PUBLISH: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  UNPUBLISH: { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  WORKFLOW_TRANSITION: { dot: "bg-purple-500", badge: "bg-purple-100 text-purple-700" },
};

const DEFAULT_COLORS = { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600" };

// ─── Date utilities ───────────────────────────────────────────────────────────

/**
 * Formats an ISO timestamp as "DD MMM YYYY HH:mm".
 * Example: "11 Jul 2026 10:30"
 */
function formatFull(iso: string): string {
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mon = months[d.getMonth()];
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${mon} ${year} ${hh}:${mm}`;
  } catch {
    return iso;
  }
}

/**
 * Returns a human-readable relative time string like "3 hours ago".
 */
function formatRelative(iso: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    if (diffMs < 0) return "just now";
    const secs = Math.floor(diffMs / 1000);
    if (secs < 60) return secs <= 1 ? "just now" : `${secs} seconds ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return mins === 1 ? "1 minute ago" : `${mins} minutes ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return days === 1 ? "1 day ago" : `${days} days ago`;
    const mos = Math.floor(days / 30);
    if (mos < 12) return mos === 1 ? "1 month ago" : `${mos} months ago`;
    const yrs = Math.floor(mos / 12);
    return yrs === 1 ? "1 year ago" : `${yrs} years ago`;
  } catch {
    return iso;
  }
}

// ─── ChangedFieldsDetail ──────────────────────────────────────────────────────

interface ChangedFieldsDetailProps {
  changedFields: Record<string, { before: unknown; after: unknown }>;
  action: AuditAction;
}

function ChangedFieldsDetail({ changedFields, action }: ChangedFieldsDetailProps) {
  const entries = Object.entries(changedFields);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 rounded-md border border-border bg-muted/30 p-3 text-xs space-y-1.5">
      {entries.map(([field, { before, after }]) => {
        const isWorkflow = action === "WORKFLOW_TRANSITION" && field === "workflowStatus";
        return (
          <div key={field} className="flex flex-wrap items-start gap-x-2 gap-y-0.5">
            <span className="font-medium text-foreground/70 capitalize min-w-[100px]">
              {field.replace(/([A-Z])/g, " $1").trim()}
            </span>
            {before !== undefined && before !== null && String(before) !== "" && (
              <span className={cn(
                "rounded px-1.5 py-0.5 line-through",
                isWorkflow ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"
              )}>
                {String(before)}
              </span>
            )}
            {(before !== undefined || after !== undefined) && (
              <span className="text-muted-foreground">→</span>
            )}
            {after !== undefined && after !== null && (
              <span className={cn(
                "rounded px-1.5 py-0.5",
                isWorkflow ? "bg-green-100 text-green-700" : "bg-background border border-border"
              )}>
                {String(after)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── TimelineEntry ────────────────────────────────────────────────────────────

interface TimelineEntryProps {
  record: AuditRecord;
  isLast: boolean;
}

function TimelineEntry({ record, isLast }: TimelineEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = ACTION_COLORS[record.action] ?? DEFAULT_COLORS;
  const label = ACTION_LABELS[record.action] ?? record.action;
  const hasFields = Object.keys(record.changedFields ?? {}).length > 0;

  return (
    <div className="flex gap-4">
      {/* Dot + connector line */}
      <div className="flex flex-col items-center shrink-0">
        <div className={cn("mt-1 h-3 w-3 rounded-full ring-2 ring-background shrink-0", colors.dot)} />
        {!isLast && <div className="mt-1 w-0.5 flex-1 bg-border" />}
      </div>

      {/* Content */}
      <div className={cn("pb-6 flex-1 min-w-0", isLast && "pb-0")}>
        {/* Header row */}
        <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
          {/* Action badge */}
          <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium", colors.badge)}>
            {label}
          </span>

          {/* User */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar
              src={record.userAvatarUrl}
              alt={record.userDisplayName}
              size="sm"
              className="h-5 w-5 text-[10px]"
            />
            <span className="text-sm font-medium truncate">{record.userDisplayName}</span>
          </div>

          {/* Relative timestamp with full datetime tooltip */}
          <span
            className="ml-auto text-xs text-muted-foreground whitespace-nowrap shrink-0"
            title={formatFull(record.timestamp)}
          >
            {formatRelative(record.timestamp)}
          </span>
        </div>

        {/* Changed fields toggle */}
        {hasFields && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 text-xs text-primary hover:underline focus:outline-none focus-visible:underline"
            aria-expanded={expanded}
          >
            {expanded ? "Hide details" : "Show details"}
          </button>
        )}

        {expanded && (
          <ChangedFieldsDetail
            changedFields={record.changedFields}
            action={record.action}
          />
        )}
      </div>
    </div>
  );
}

// ─── AuditTimeline ────────────────────────────────────────────────────────────

/**
 * Vertical paginated audit trail timeline with user and action-type filters.
 *
 * Requirements: 12.3, 12.4, 12.5
 */
export function AuditTimeline({ pageId, pageSize = 20 }: AuditTimelineProps) {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState<string>("__all__");
  const [selectedActions, setSelectedActions] = useState<Set<AuditAction>>(
    new Set(ALL_ACTION_TYPES)
  );

  // ── Pagination & data state ───────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(0);
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accumulated list for infinite-scroll / append mode (page > 0)
  const [allRecords, setAllRecords] = useState<AuditRecord[]>([]);

  // Users who appear in the loaded records (built from fetched data)
  const [knownUsers, setKnownUsers] = useState<{ id: string; name: string }[]>([]);
  // Ref to track whether a user list has been populated from server data
  const usersPopulated = useRef(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<PagedResponse<AuditRecord>>(
          `/admin/pages/${pageId}/audit-trail`,
          { params: { page, size: pageSize } }
        );

        // Normalise response shape — backend may wrap in { data: { content: [...] } }
        // or return { content: [...] } directly
        const payload = (res.data as PagedResponse<AuditRecord>) ?? {};
        const inner = payload.data ?? payload;
        const rawContent: AuditRecord[] =
          (inner as { content?: AuditRecord[] }).content ??
          (inner as AuditRecord[]) ?? [];
        const rawTotalPages: number =
          (inner as { totalPages?: number }).totalPages ?? 1;

        setTotalPages(rawTotalPages);

        if (append) {
          setAllRecords((prev) => [...prev, ...rawContent]);
        } else {
          setAllRecords(rawContent);
        }
        setRecords(rawContent);

        // Populate the user dropdown the first time
        if (!usersPopulated.current && rawContent.length > 0) {
          usersPopulated.current = true;
          const seen = new Map<string, string>();
          rawContent.forEach((r) => seen.set(r.userId, r.userDisplayName));
          setKnownUsers(Array.from(seen.entries()).map(([id, name]) => ({ id, name })));
        } else if (rawContent.length > 0) {
          setKnownUsers((prev) => {
            const seen = new Map(prev.map((u) => [u.id, u.name]));
            rawContent.forEach((r) => seen.set(r.userId, r.userDisplayName));
            return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
          });
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load audit trail.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [pageId, pageSize]
  );

  // Reset and fetch from page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
    setAllRecords([]);
    usersPopulated.current = false;
    fetchPage(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, selectedUser, selectedActions]);

  // ── Derived: client-side filter by user / action ──────────────────────────
  const filtered = allRecords.filter((r) => {
    const userMatch = selectedUser === "__all__" || r.userId === selectedUser;
    const actionMatch = selectedActions.has(r.action);
    return userMatch && actionMatch;
  });

  // ── Action checkbox toggle ─────────────────────────────────────────────────
  const toggleAction = (action: AuditAction) => {
    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (next.has(action)) {
        // Must keep at least one selected
        if (next.size > 1) next.delete(action);
      } else {
        next.add(action);
      }
      return next;
    });
  };

  // ── Load next page (append) ───────────────────────────────────────────────
  const loadNextPage = () => {
    const next = currentPage + 1;
    if (next >= totalPages) return;
    setCurrentPage(next);
    fetchPage(next, true);
  };

  // ── Load previous page (replace) ──────────────────────────────────────────
  const loadPrevPage = () => {
    const prev = currentPage - 1;
    if (prev < 0) return;
    setCurrentPage(prev);
    setAllRecords([]);
    fetchPage(prev, false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* ── Filter controls ────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* User filter */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <label htmlFor="audit-user-filter" className="text-sm font-medium whitespace-nowrap">
              Filter by user
            </label>
            <div className="relative flex-1">
              <Select value={selectedUser} onValueChange={(v) => setSelectedUser(v)}>
                <SelectTrigger id="audit-user-filter" className="h-9 text-sm">
                  <SelectValue>
                    {selectedUser === "__all__"
                      ? "All users"
                      : knownUsers.find((u) => u.id === selectedUser)?.name ?? selectedUser}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="top-10">
                  <SelectItem value="__all__">All users</SelectItem>
                  {knownUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-9"
            onClick={() => {
              setCurrentPage(0);
              setAllRecords([]);
              usersPopulated.current = false;
              fetchPage(0, false);
            }}
            disabled={loading}
            aria-label="Refresh audit trail"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>

        {/* Action type checkboxes */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Action types</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {ALL_ACTION_TYPES.map((action) => {
              const colors = ACTION_COLORS[action] ?? DEFAULT_COLORS;
              const label = ACTION_LABELS[action] ?? action;
              return (
                <label
                  key={action}
                  className="flex items-center gap-2 cursor-pointer select-none text-sm"
                >
                  <Checkbox
                    checked={selectedActions.has(action)}
                    onCheckedChange={() => toggleAction(action)}
                    aria-label={`Toggle ${label}`}
                  />
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      colors.badge
                    )}
                  >
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* ── Timeline ───────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-6">
        {loading && allRecords.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading audit trail…</span>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Failed to load audit trail</p>
              <p className="mt-0.5 text-destructive/80">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setAllRecords([]);
                  setCurrentPage(0);
                  fetchPage(0, false);
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No audit records match the current filters.
          </div>
        ) : (
          <div role="list" aria-label="Audit trail">
            {filtered.map((record, idx) => (
              <div key={record.id} role="listitem">
                <TimelineEntry
                  record={record}
                  isLast={idx === filtered.length - 1}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Load-more / pagination ──────────────────────────────────────── */}
        {!error && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPrevPage}
              disabled={currentPage === 0 || loading}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-xs text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>

            {/* "Load more" appends to list; previous replaces */}
            <Button
              variant="outline"
              size="sm"
              onClick={loadNextPage}
              disabled={currentPage >= totalPages - 1 || loading}
              aria-label="Load more records"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1" />
              )}
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditTimeline;
