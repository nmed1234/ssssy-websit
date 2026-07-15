"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Page } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageDuplicateDialogProps {
  page: Page | null; // null = closed
  onClose: () => void;
}

interface SlugCheckResult {
  available: boolean;
  suggestion?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateSlugFormat(v: string): string | null {
  if (!v) return "Slug is required.";
  if (v.length > 200) return "Slug must be 200 characters or fewer.";
  if (!SLUG_RE.test(v))
    return "Slug must contain only lowercase letters, digits, and hyphens (e.g. my-page).";
  return null;
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

// ─── Component ────────────────────────────────────────────────────────────────

export function PageDuplicateDialog({ page, onClose }: PageDuplicateDialogProps) {
  const router = useRouter();
  const isOpen = page !== null;
  const { containerRef, handleKeyDown } = useFocusTrap(isOpen, onClose);

  // ── Form state ──
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [slugFormatError, setSlugFormatError] = useState<string | null>(null);
  const [uniquenessState, setUniquenessState] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [slugSuggestion, setSlugSuggestion] = useState<string | undefined>(undefined);
  const debouncedSlug = useDebounce(slug, 400);

  // ── Submit state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Initialise fields when dialog opens ──
  useEffect(() => {
    if (!page) return;

    // Pre-fill title as "{original} (Copy)"
    const baseTitle = page.titleEn || page.titleAr || "Page";
    setTitleEn(`${baseTitle} (Copy)`);
    setSubmitError(null);

    // Set fallback slug immediately, then try to get a proper suggestion from API
    setSlug(`${page.slug}-copy`);
    setUniquenessState("idle");
    setSlugSuggestion(undefined);

    api
      .get<SlugCheckResult>(
        `/admin/pages/check-slug?slug=${encodeURIComponent(page.slug)}`
      )
      .then((res) => {
        const result = res.data as SlugCheckResult;
        if (result.suggestion) {
          // API provided a ready-to-use unique suggestion
          setSlug(result.suggestion);
        }
        // If original slug is available or no suggestion, keep the "-copy" fallback
      })
      .catch(() => {
        // keep the "-copy" fallback already set above
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

  // ── Slug format validation (immediate, on every keystroke) ──
  useEffect(() => {
    setSlugFormatError(validateSlugFormat(slug));
    setUniquenessState("idle");
    setSlugSuggestion(undefined);
  }, [slug]);

  // ── Slug uniqueness check (debounced 400 ms) ──
  useEffect(() => {
    if (!debouncedSlug || validateSlugFormat(debouncedSlug)) return;
    let cancelled = false;
    setUniquenessState("checking");
    api
      .get<SlugCheckResult>(
        `/admin/pages/check-slug?slug=${encodeURIComponent(debouncedSlug)}`
      )
      .then((res) => {
        if (cancelled) return;
        const result = res.data as SlugCheckResult;
        setUniquenessState(result.available ? "available" : "taken");
        setSlugSuggestion(result.available ? undefined : result.suggestion);
      })
      .catch(() => {
        if (!cancelled) setUniquenessState("idle");
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSlug]);

  // ── Derived: can submit? ──
  const canDuplicate =
    !slugFormatError && uniquenessState === "available" && !isSubmitting;

  // ── Duplicate action ──
  async function handleDuplicate() {
    if (!page || !canDuplicate) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.post<{ id?: string; data?: { id?: string } }>(
        `/admin/pages/${page.id}/duplicate`,
        { newTitle: titleEn.trim(), newSlug: slug.trim() }
      );
      const responseData = res.data as Record<string, unknown>;
      const newId: string | undefined =
        (responseData.id as string | undefined) ??
        ((responseData.data as Record<string, unknown> | undefined)
          ?.id as string | undefined);

      if (newId) {
        onClose();
        router.push(`/admin/pages/${newId}`);
      } else {
        setSubmitError(
          "Page duplicated but could not retrieve its ID. Please refresh the page list."
        );
      }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      const msg =
        axiosErr.response?.data?.message ??
        axiosErr.response?.data?.error ??
        "An unexpected error occurred. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render nothing when closed ──
  if (!isOpen) return null;

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
        aria-labelledby="dup-dialog-title"
        onKeyDown={handleKeyDown}
        className="relative z-50 w-full max-w-md bg-background rounded-xl shadow-2xl border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
          <h2 id="dup-dialog-title" className="text-lg font-semibold">
            Duplicate Page
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
        <div className="px-6 py-5 space-y-5">
          {/* Error banner */}
          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Title EN */}
          <div>
            <label
              htmlFor="dup-title-en"
              className="block text-sm font-medium mb-1.5"
            >
              Title (English)
            </label>
            <input
              id="dup-title-en"
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              maxLength={200}
              autoComplete="off"
              className="w-full border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-soil-clay/40 transition-colors"
              placeholder="e.g. About Us (Copy)"
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {titleEn.length}/200
            </p>
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="dup-slug"
              className="block text-sm font-medium mb-1.5"
            >
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="dup-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              maxLength={200}
              autoComplete="off"
              spellCheck={false}
              className={cn(
                "w-full border rounded-md px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-soil-clay/40 transition-colors",
                slugFormatError || uniquenessState === "taken"
                  ? "border-red-500"
                  : uniquenessState === "available"
                  ? "border-green-500"
                  : "border-input"
              )}
              placeholder="e.g. about-us-copy"
              aria-describedby="dup-slug-feedback"
              aria-invalid={!!(slugFormatError || uniquenessState === "taken")}
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {slug.length}/200
            </p>

            {/* Inline feedback */}
            <div
              id="dup-slug-feedback"
              aria-live="polite"
              className="mt-1.5 min-h-[20px]"
            >
              {uniquenessState === "checking" && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Checking availability…
                </p>
              )}
              {slugFormatError && (
                <p role="alert" className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {slugFormatError}
                </p>
              )}
              {!slugFormatError && uniquenessState === "taken" && (
                <div>
                  <p role="alert" className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> This slug is already taken.
                  </p>
                  {slugSuggestion && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Suggested alternative:{" "}
                      <button
                        type="button"
                        className="font-mono underline text-soil-clay hover:text-soil-dark"
                        onClick={() => setSlug(slugSuggestion)}
                      >
                        {slugSuggestion}
                      </button>
                    </p>
                  )}
                </div>
              )}
              {!slugFormatError && uniquenessState === "available" && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Slug is available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDuplicate}
            disabled={!canDuplicate}
            title={
              !canDuplicate && !isSubmitting
                ? "Fix the slug before duplicating"
                : undefined
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Duplicating…
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-1.5" /> Duplicate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PageDuplicateDialog;
