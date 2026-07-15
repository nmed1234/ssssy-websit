"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Serialized current page layout (output of serializeLayout) */
  layoutJson: string;
}

type Category = "Layout" | "Landing" | "About" | "Contact" | "Blog";

const CATEGORIES: Category[] = ["Layout", "Landing", "About", "Contact", "Blog"];

// ─── Focus-trap hook ──────────────────────────────────────────────────────────

function useFocusTrap(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement;
    const timer = setTimeout(() => {
      const first = containerRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

// ─── Modal ────────────────────────────────────────────────────────────────────

export function SaveAsTemplateModal({
  isOpen,
  onClose,
  layoutJson,
}: SaveAsTemplateModalProps) {
  const { containerRef, handleKeyDown } = useFocusTrap(isOpen, onClose);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Layout");
  const [description, setDescription] = useState("");

  // Validation errors
  const [nameError, setNameError] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ── Reset on open ──
  useEffect(() => {
    if (isOpen) {
      setName("");
      setCategory("Layout");
      setDescription("");
      setNameError(null);
      setSubmitError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // ── Lock body scroll ──
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // ── Validation ──
  function validateName(value: string): string | null {
    if (!value.trim()) return "Template name is required.";
    if (value.trim().length > 100) return "Name must be 100 characters or fewer.";
    return null;
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setName(val);
    setNameError(validateName(val));
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nameErr = validateName(name);
    if (nameErr) {
      setNameError(nameErr);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.post("/admin/page-templates", {
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        layoutJson,
      });

      setSuccess(true);
      // Auto-close after 1.5 s
      setTimeout(() => {
        onClose();
      }, 1500);
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
      setSubmitting(false);
    }
  }

  // ── Render ──
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Save page as template"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onKeyDown={handleKeyDown}
            className="relative z-50 w-full max-w-md bg-background rounded-xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b shrink-0">
              <h2 className="text-lg font-semibold">Save as Template</h2>
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
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Success banner */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-md bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm"
                  role="status"
                >
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Template saved! View all templates at{" "}
                    <a
                      href="/admin/templates"
                      className="font-medium underline hover:no-underline"
                    >
                      /admin/templates
                    </a>
                    .
                  </span>
                </motion.div>
              )}

              {/* Error banner */}
              {submitError && !success && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {!success && (
                <form id="save-template-form" onSubmit={handleSubmit} noValidate>
                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="tpl-name"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Template Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="tpl-name"
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        maxLength={100}
                        autoComplete="off"
                        className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-soil-dark/30 transition-colors ${
                          nameError ? "border-red-500" : "border-input"
                        }`}
                        placeholder="e.g. Landing Page with Hero"
                        aria-describedby={nameError ? "tpl-name-err" : undefined}
                        aria-invalid={!!nameError}
                      />
                      {nameError && (
                        <p
                          id="tpl-name-err"
                          role="alert"
                          className="mt-1 text-xs text-red-600 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" /> {nameError}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground text-right">
                        {name.length}/100
                      </p>
                    </div>

                    {/* Category */}
                    <div>
                      <label
                        htmlFor="tpl-category"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="tpl-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-soil-dark/30 bg-background transition-colors"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="tpl-description"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Description{" "}
                        <span className="text-muted-foreground text-xs">(optional)</span>
                      </label>
                      <textarea
                        id="tpl-description"
                        value={description}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) setDescription(e.target.value);
                        }}
                        maxLength={500}
                        rows={3}
                        className="w-full border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-soil-dark/30 resize-none transition-colors"
                        placeholder="Describe what this template is best suited for…"
                      />
                      <p className="mt-1 text-xs text-muted-foreground text-right">
                        {description.length}/500
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0 bg-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="save-template-form"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1.5" /> Save Template
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SaveAsTemplateModal;
