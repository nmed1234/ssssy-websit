"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Page } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageDeleteDialogProps {
  page: Page | null; // null = dialog closed
  onClose: () => void;
}

interface LinkedMenuItem {
  id: string;
  menuId: string;
  menuName: string;
  labelEn?: string;
  labelAr?: string;
  pageId?: string;
  isActive?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── Focus-trap hook ──────────────────────────────────────────────────────────

function useFocusTrap(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement;
    const timer = setTimeout(() => {
      const first = containerRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }, 50);
    return () => {
      clearTimeout(timer);
      (previousFocusRef.current as HTMLElement | null)?.focus();
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  return { containerRef, handleKeyDown };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateString?: string): string {
  if (!dateString) return "unknown date";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

/** Deduplicate linked menu items by menuName so we display each menu once. */
function uniqueMenuNames(items: LinkedMenuItem[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const item of items) {
    const name = item.menuName || `Menu ${item.menuId}`;
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PageDeleteDialog({ page, onClose }: PageDeleteDialogProps) {
  const router = useRouter();
  const isOpen = page !== null;
  const { containerRef, handleKeyDown } = useFocusTrap(isOpen, onClose);

  // ── Menu items fetch state ──
  const [menuItems, setMenuItems] = useState<LinkedMenuItem[]>([]);
  const [menuFetchState, setMenuFetchState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");

  // ── Title confirmation (published pages only) ──
  const [confirmTitle, setConfirmTitle] = useState("");

  // ── Delete state ──
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Fetch linked menu items when dialog opens ──
  useEffect(() => {
    if (!page) {
      // Reset state when closed
      setMenuItems([]);
      setMenuFetchState("idle");
      setConfirmTitle("");
      setDeleteError(null);
      return;
    }

    setMenuFetchState("loading");
    setMenuItems([]);
    setConfirmTitle("");
    setDeleteError(null);

    api
      .get<ApiResponse<LinkedMenuItem[]>>(
        `/admin/menus/items?pageId=${encodeURIComponent(page.id)}`
      )
      .then((res) => {
        const responseData = res.data as ApiResponse<LinkedMenuItem[]>;
        const items = Array.isArray(responseData.data) ? responseData.data : [];
        setMenuItems(items);
        setMenuFetchState("done");
      })
      .catch(() => {
        // Req 22.1: if fetch fails, show error but still allow deletion
        setMenuFetchState("error");
      });
  }, [page]);

  // ── Lock body scroll while open ──
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // ── Derived state ──
  const isPublished = page?.isPublished === true;
  const pageTitle = page?.titleEn || page?.titleAr || "";

  // Req 22.2: published pages require exact title match (case-sensitive)
  // Req 22.3: non-published pages allow deletion immediately
  const canDelete = isPublished
    ? confirmTitle === pageTitle && !isDeleting
    : !isDeleting;

  // ── Delete action ──
  async function handleDelete() {
    if (!page || !canDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      // Req 22.4: call DELETE /api/admin/pages/{id}
      await api.delete(`/admin/pages/${page.id}`);
      onClose();
      router.push("/admin/pages");
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      const msg =
        axiosErr.response?.data?.message ??
        axiosErr.response?.data?.error ??
        "An unexpected error occurred. Please try again.";
      // Req 22.5: show inline error, keep dialog open for retry
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Render nothing when closed ──
  if (!isOpen) return null;

  const linkedMenuNames = uniqueMenuNames(menuItems);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="del-dialog-title"
        onKeyDown={handleKeyDown}
        className="relative z-50 w-full max-w-md bg-background rounded-xl shadow-2xl border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
          <h2
            id="del-dialog-title"
            className="text-lg font-semibold text-red-600 flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Page
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 opacity-60 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Delete error banner */}
          {deleteError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          {/* Page name */}
          <p className="text-sm text-muted-foreground">
            You are about to delete{" "}
            <span className="font-semibold text-foreground">
              {pageTitle || "this page"}
            </span>
            . This action cannot be undone.
          </p>

          {/* Req 22.2: Published page warning */}
          {isPublished && (
            <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium">This page is currently published.</p>
                <p className="mt-0.5 text-amber-700">
                  Last updated:{" "}
                  <span className="font-mono text-xs">
                    {formatDate(page?.updatedAt || page?.lastTransitionAt)}
                  </span>
                </p>
                <p className="mt-1">
                  Deleting it will take it offline immediately.
                </p>
              </div>
            </div>
          )}

          {/* Req 22.1: Linked menus section */}
          <div>
            <p className="text-sm font-medium mb-1.5">Linked menus</p>
            {menuFetchState === "loading" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking menu links…</span>
              </div>
            )}
            {menuFetchState === "error" && (
              <div className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 text-xs">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Could not load linked menus. You can still proceed with
                  deletion.
                </span>
              </div>
            )}
            {menuFetchState === "done" && linkedMenuNames.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No linked menus.
              </p>
            )}
            {menuFetchState === "done" && linkedMenuNames.length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs text-amber-700 font-medium mb-1">
                  This page is linked from the following{" "}
                  {linkedMenuNames.length === 1 ? "menu" : "menus"}:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {linkedMenuNames.map((name) => (
                    <li key={name} className="text-sm text-amber-800 font-medium">
                      {name}
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-xs text-amber-700">
                  Menu items pointing to this page will become broken links
                  after deletion.
                </p>
              </div>
            )}
          </div>

          {/* Req 22.2: Title confirmation input for published pages */}
          {isPublished && (
            <div>
              <label
                htmlFor="del-confirm-title"
                className="block text-sm font-medium mb-1.5"
              >
                To confirm, type the exact page title:{" "}
                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                  {pageTitle}
                </span>
              </label>
              <input
                id="del-confirm-title"
                type="text"
                value={confirmTitle}
                onChange={(e) => setConfirmTitle(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className={cn(
                  "w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400/40 transition-colors",
                  confirmTitle.length > 0 && confirmTitle !== pageTitle
                    ? "border-red-400"
                    : confirmTitle === pageTitle
                    ? "border-green-500"
                    : "border-input"
                )}
                placeholder="Type the page title exactly as shown above"
                aria-describedby="del-confirm-hint"
              />
              <p
                id="del-confirm-hint"
                className="mt-1 text-xs text-muted-foreground"
              >
                Case-sensitive. The Delete button will be enabled once the
                title matches exactly.
              </p>
            </div>
          )}

          {/* Non-published: simple confirmation message */}
          {!isPublished && (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this page?
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete}
            title={
              isPublished && confirmTitle !== pageTitle
                ? "Type the exact page title to enable deletion"
                : undefined
            }
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PageDeleteDialog;
