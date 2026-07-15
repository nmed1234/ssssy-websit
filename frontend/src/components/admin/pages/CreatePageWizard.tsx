"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreatePageWizardProps {
  isOpen: boolean;
  onClose: () => void;
  // Translation mode: pre-fill fields and lock language
  initialLanguage?: "EN" | "AR";
  initialTitleEn?: string;
  initialTitleAr?: string;
  initialSlug?: string;
  translationGroupId?: string;  // link to existing group
  onCreated?: (newPageId: string) => void; // optional callback
}

type Language = "EN" | "AR";

interface SlugCheckResult {
  available: boolean;
  suggestion?: string;
}

interface PageTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  thumbnailUrl?: string;
  layoutJson?: string;
}

interface TemplateGroup {
  category: string;
  templates: PageTemplate[];
}

// ─── Built-in templates (always shown even without API data) ──────────────────

const BUILTIN_TEMPLATES: PageTemplate[] = [
  {
    id: "__blank",
    name: "Blank Page",
    category: "Layout",
    description: "Start with a completely empty canvas.",
    thumbnailUrl: "",
    layoutJson: JSON.stringify({ version: "1", blocks: [] }),
  },
  {
    id: "__article",
    name: "Article Layout",
    category: "Layout",
    description: "Header, body text, and sidebar for written content.",
    thumbnailUrl: "",
    layoutJson: JSON.stringify({ version: "1", blocks: [] }),
  },
  {
    id: "__landing",
    name: "Landing Page",
    category: "Landing",
    description: "Hero, features, CTA — perfect for campaigns.",
    thumbnailUrl: "",
    layoutJson: JSON.stringify({ version: "1", blocks: [] }),
  },
  {
    id: "__about",
    name: "About Page",
    category: "About",
    description: "Organisation story, mission and team section.",
    thumbnailUrl: "",
    layoutJson: JSON.stringify({ version: "1", blocks: [] }),
  },
];

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

function validateTitleEn(v: string): string | null {
  if (!v.trim()) return "English title is required.";
  if (v.length > 200) return "Title must be 200 characters or fewer.";
  return null;
}

function validateTitleAr(v: string): string | null {
  if (v.length > 200) return "Arabic title must be 200 characters or fewer.";
  return null;
}

function validateSlugFormat(v: string): string | null {
  if (!v) return "Slug is required.";
  if (v.length > 200) return "Slug must be 200 characters or fewer.";
  if (!SLUG_RE.test(v)) return "Slug must contain only lowercase letters, digits, and hyphens (e.g. my-page).";
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

// ─── Step-indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ["Title", "Slug", "Template"];
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                i < current
                  ? "bg-green-600 text-white"
                  : i === current
                  ? "bg-soil-clay text-white ring-2 ring-soil-clay/30"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={cn("text-xs font-medium hidden sm:inline", i === current ? "text-foreground" : "text-muted-foreground")}>
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && <div className="flex-1 h-px bg-border" />}
        </React.Fragment>
      ))}
      <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
        {current + 1} / {total}
      </span>
    </div>
  );
}

// ─── Step 1: Title fields ─────────────────────────────────────────────────────

interface Step1Props {
  titleEn: string;
  titleAr: string;
  language: Language;
  onTitleEnChange: (v: string) => void;
  onTitleArChange: (v: string) => void;
  onLanguageChange: (v: Language) => void;
  errors: { titleEn?: string; titleAr?: string };
  initialLanguage?: "EN" | "AR";
}

function Step1({
  titleEn, titleAr, language,
  onTitleEnChange, onTitleArChange, onLanguageChange,
  errors,
  initialLanguage,
}: Step1Props) {
  return (
    <div className="space-y-5">
      {/* Language selector */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Page Language</label>
        <div className="flex gap-2" role="radiogroup" aria-label="Page language">
          {(["EN", "AR"] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              role="radio"
              aria-checked={language === lang}
              onClick={() => !initialLanguage && onLanguageChange(lang)}
              disabled={!!initialLanguage}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium border transition-colors",
                language === lang
                  ? "bg-soil-clay text-white border-soil-clay"
                  : "border-input bg-background text-foreground hover:bg-accent",
                initialLanguage ? "opacity-60 cursor-not-allowed" : ""
              )}
            >
              {lang === "EN" ? "English" : "Arabic (عربي)"}
            </button>
          ))}
        </div>
        {initialLanguage && (
          <p className="mt-1 text-xs text-muted-foreground">Language is fixed for this translation.</p>
        )}
      </div>

      {/* Title EN */}
      <div>
        <label htmlFor="wizard-title-en" className="block text-sm font-medium mb-1.5">
          Title (English) <span className="text-red-500">*</span>
        </label>
        <input
          id="wizard-title-en"
          type="text"
          value={titleEn}
          onChange={(e) => onTitleEnChange(e.target.value)}
          maxLength={200}
          autoComplete="off"
          className={cn(
            "w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-soil-clay/40 transition-colors",
            errors.titleEn ? "border-red-500" : "border-input"
          )}
          placeholder="e.g. About Us"
          aria-describedby={errors.titleEn ? "err-title-en" : undefined}
          aria-invalid={!!errors.titleEn}
        />
        {errors.titleEn && (
          <p id="err-title-en" role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.titleEn}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground text-right">{titleEn.length}/200</p>
      </div>

      {/* Title AR */}
      <div>
        <label htmlFor="wizard-title-ar" className="block text-sm font-medium mb-1.5">
          Title (Arabic) <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <input
          id="wizard-title-ar"
          type="text"
          value={titleAr}
          onChange={(e) => onTitleArChange(e.target.value)}
          maxLength={200}
          dir="rtl"
          autoComplete="off"
          className={cn(
            "w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-soil-clay/40 transition-colors",
            errors.titleAr ? "border-red-500" : "border-input"
          )}
          placeholder="مثال: من نحن"
          aria-describedby={errors.titleAr ? "err-title-ar" : undefined}
          aria-invalid={!!errors.titleAr}
        />
        {errors.titleAr && (
          <p id="err-title-ar" role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.titleAr}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground text-right">{titleAr.length}/200</p>
      </div>
    </div>
  );
}

// ─── Step 2: Slug field ───────────────────────────────────────────────────────

interface Step2Props {
  slug: string;
  onSlugChange: (v: string) => void;
  formatError: string | null;
  uniquenessState: "idle" | "checking" | "available" | "taken";
  suggestion?: string;
}

function Step2({ slug, onSlugChange, formatError, uniquenessState, suggestion }: Step2Props) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const showPreview = !formatError && slug && uniquenessState !== "checking";

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="wizard-slug" className="block text-sm font-medium mb-1.5">
          URL Slug <span className="text-red-500">*</span>
        </label>
        <input
          id="wizard-slug"
          type="text"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          maxLength={200}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "w-full border rounded-md px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-soil-clay/40 transition-colors",
            formatError || uniquenessState === "taken"
              ? "border-red-500"
              : uniquenessState === "available"
              ? "border-green-500"
              : "border-input"
          )}
          placeholder="e.g. about-us"
          aria-describedby="slug-help slug-feedback"
          aria-invalid={!!(formatError || uniquenessState === "taken")}
        />
        <p id="slug-help" className="mt-1 text-xs text-muted-foreground text-right">{slug.length}/200</p>

        {/* Inline feedback */}
        <div id="slug-feedback" aria-live="polite" className="mt-1.5 min-h-[20px]">
          {uniquenessState === "checking" && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Checking availability…
            </p>
          )}
          {formatError && (
            <p role="alert" className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {formatError}
            </p>
          )}
          {!formatError && uniquenessState === "taken" && (
            <div>
              <p role="alert" className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> This slug is already taken.
              </p>
              {suggestion && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Suggested alternative:{" "}
                  <button
                    type="button"
                    className="font-mono underline text-soil-clay hover:text-soil-dark"
                    onClick={() => onSlugChange(suggestion)}
                  >
                    {suggestion}
                  </button>
                </p>
              )}
            </div>
          )}
          {!formatError && uniquenessState === "available" && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Slug is available.
            </p>
          )}
        </div>
      </div>

      {/* Live URL preview */}
      {showPreview && (
        <div className="rounded-md bg-muted px-3 py-2 text-sm font-mono text-muted-foreground break-all">
          <span className="text-xs uppercase tracking-wide text-muted-foreground/60 block mb-0.5">URL preview</span>
          {appUrl}/{slug}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Template selection ───────────────────────────────────────────────

interface Step3Props {
  templateGroups: TemplateGroup[];
  selectedTemplateId: string;
  onSelect: (id: string) => void;
  isLoadingTemplates: boolean;
}

function TemplateThumbnail({ url }: { url?: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="w-full h-24 object-cover rounded-t-md bg-muted"
        loading="lazy"
      />
    );
  }
  return (
    <div className="w-full h-24 rounded-t-md bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
      <svg className="w-8 h-8 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} />
        <path d="M3 9h18M9 21V9" strokeWidth={1.5} />
      </svg>
    </div>
  );
}

function Step3({ templateGroups, selectedTemplateId, onSelect, isLoadingTemplates }: Step3Props) {
  if (isLoadingTemplates) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading templates…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {templateGroups.map((group) => (
        <div key={group.category}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {group.category}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {group.templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onSelect(tpl.id)}
                className={cn(
                  "rounded-md border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-soil-clay/60 overflow-hidden",
                  selectedTemplateId === tpl.id
                    ? "border-soil-clay ring-2 ring-soil-clay/30"
                    : "border-input hover:border-soil-clay/40"
                )}
                aria-pressed={selectedTemplateId === tpl.id}
              >
                <TemplateThumbnail url={tpl.thumbnailUrl} />
                <div className="p-2">
                  <p className="text-xs font-semibold truncate">{tpl.name}</p>
                  {tpl.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tpl.description}</p>
                  )}
                </div>
                {selectedTemplateId === tpl.id && (
                  <div className="absolute top-1.5 right-1.5 bg-soil-clay rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function CreatePageWizard({
  isOpen,
  onClose,
  initialLanguage,
  initialTitleEn,
  initialTitleAr,
  initialSlug,
  translationGroupId,
  onCreated,
}: CreatePageWizardProps) {
  const router = useRouter();
  const { containerRef, handleKeyDown } = useFocusTrap(isOpen, onClose);

  // ── Wizard state ──
  const TOTAL_STEPS = 3;
  const [step, setStep] = useState(0);

  // Step 1
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [language, setLanguage] = useState<Language>("EN");
  const [step1Errors, setStep1Errors] = useState<{ titleEn?: string; titleAr?: string }>({});

  // Step 2
  const [slug, setSlug] = useState("");
  const [slugFormatError, setSlugFormatError] = useState<string | null>(null);
  const [uniquenessState, setUniquenessState] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [slugSuggestion, setSlugSuggestion] = useState<string | undefined>(undefined);
  const debouncedSlug = useDebounce(slug, 400);

  // Step 3
  const [templateGroups, setTemplateGroups] = useState<TemplateGroup[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("__blank");

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Reset when modal opens ──
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setTitleEn(initialTitleEn ?? "");
      setTitleAr(initialTitleAr ?? "");
      setLanguage(initialLanguage ?? "EN");
      setStep1Errors({});
      setSlug(initialSlug ?? "");
      setSlugFormatError(null);
      setUniquenessState("idle");
      setSlugSuggestion(undefined);
      setSelectedTemplateId("__blank");
      setSubmitError(null);
    }
  }, [isOpen]);

  // ── Lock body scroll ──
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  // ── Slug format validation (immediate) ──
  useEffect(() => {
    setSlugFormatError(validateSlugFormat(slug));
    // Reset uniqueness whenever slug changes
    setUniquenessState("idle");
    setSlugSuggestion(undefined);
  }, [slug]);

  // ── Slug uniqueness check (debounced) ──
  useEffect(() => {
    if (!debouncedSlug || validateSlugFormat(debouncedSlug)) return;
    let cancelled = false;
    setUniquenessState("checking");
    api
      .get<{ available: boolean; suggestion?: string }>(
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
    return () => { cancelled = true; };
  }, [debouncedSlug]);

  // ── Load templates when reaching step 2 (index 2) ──
  useEffect(() => {
    if (step !== 2) return;
    setIsLoadingTemplates(true);
    api
      .get<PageTemplate[]>("/admin/page-templates")
      .then((res) => {
        const apiTemplates: PageTemplate[] = Array.isArray(res.data)
          ? (res.data as PageTemplate[])
          : [];
        // Merge built-ins with API templates, grouped by category
        const all = [...BUILTIN_TEMPLATES, ...apiTemplates];
        const groupMap = new Map<string, PageTemplate[]>();
        all.forEach((t) => {
          const list = groupMap.get(t.category) ?? [];
          list.push(t);
          groupMap.set(t.category, list);
        });
        setTemplateGroups(
          Array.from(groupMap.entries()).map(([category, templates]) => ({ category, templates }))
        );
      })
      .catch(() => {
        // Fallback to built-ins only
        const groupMap = new Map<string, PageTemplate[]>();
        BUILTIN_TEMPLATES.forEach((t) => {
          const list = groupMap.get(t.category) ?? [];
          list.push(t);
          groupMap.set(t.category, list);
        });
        setTemplateGroups(
          Array.from(groupMap.entries()).map(([category, templates]) => ({ category, templates }))
        );
      })
      .finally(() => setIsLoadingTemplates(false));
  }, [step]);

  // ── Navigation guards ──

  function validateStep1(): boolean {
    const errors: { titleEn?: string; titleAr?: string } = {};
    const errEn = validateTitleEn(titleEn);
    const errAr = validateTitleAr(titleAr);
    if (errEn) errors.titleEn = errEn;
    if (errAr) errors.titleAr = errAr;
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  }

  function canAdvanceStep2(): boolean {
    return !slugFormatError && uniquenessState === "available";
  }

  function handleNext() {
    if (step === 0) {
      if (!validateStep1()) return;
      setStep(1);
    } else if (step === 1) {
      if (!canAdvanceStep2()) return;
      setStep(2);
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  // ── Create action ──

  async function handleCreate() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Find the selected template's layoutJson
      const allTemplates = templateGroups.flatMap((g) => g.templates);
      const tpl = allTemplates.find((t) => t.id === selectedTemplateId);
      const layoutJson = tpl?.layoutJson ?? JSON.stringify({ version: "1", blocks: [] });

      const payload: Record<string, unknown> = {
        titleEn: titleEn.trim(),
        titleAr: titleAr.trim() || undefined,
        slug: slug.trim(),
        language,
        layoutJson,
        workflowStatus: "DRAFT",
        isPublished: false,
      };

      // Include translationGroupId when provided (links this page to a translation group)
      if (translationGroupId) {
        payload.translationGroupId = translationGroupId;
      }

      const res = await api.post<{ id?: string; data?: { id?: string } }>("/admin/pages", payload);

      // Handle nested or flat response shape
      const responseData = res.data as Record<string, unknown>;
      const newId: string | undefined =
        (responseData.id as string | undefined) ??
        ((responseData.data as Record<string, unknown> | undefined)?.id as string | undefined);

      if (newId) {
        onClose();
        if (onCreated) {
          onCreated(newId);
        } else {
          router.push(`/admin/pages/${newId}`);
        }
      } else {
        setSubmitError("Page created but could not retrieve its ID. Please refresh the page list.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
      const msg =
        axiosErr.response?.data?.message ??
        axiosErr.response?.data?.error ??
        "An unexpected error occurred. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ──

  const isLastStep = step === TOTAL_STEPS - 1;

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
            aria-label="Create new page"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onKeyDown={handleKeyDown}
            className="relative z-50 w-full max-w-xl bg-background rounded-xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b shrink-0">
              <h2 className="text-lg font-semibold">Create New Page</h2>
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
              <StepIndicator current={step} total={TOTAL_STEPS} />

              {/* Error banner */}
              {submitError && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                >
                  {step === 0 && (
                    <Step1
                      titleEn={titleEn}
                      titleAr={titleAr}
                      language={language}
                      onTitleEnChange={setTitleEn}
                      onTitleArChange={setTitleAr}
                      onLanguageChange={setLanguage}
                      errors={step1Errors}
                      initialLanguage={initialLanguage}
                    />
                  )}
                  {step === 1 && (
                    <Step2
                      slug={slug}
                      onSlugChange={setSlug}
                      formatError={slugFormatError}
                      uniquenessState={uniquenessState}
                      suggestion={slugSuggestion}
                    />
                  )}
                  {step === 2 && (
                    <div className="relative">
                      <Step3
                        templateGroups={templateGroups}
                        selectedTemplateId={selectedTemplateId}
                        onSelect={setSelectedTemplateId}
                        isLoadingTemplates={isLoadingTemplates}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t shrink-0 bg-muted/30">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 0 || isSubmitting}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              {isLastStep ? (
                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Creating…</>
                  ) : (
                    <><Check className="w-4 h-4 mr-1.5" /> Create Page</>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    step === 1 && !canAdvanceStep2()
                  }
                  title={
                    step === 1 && !canAdvanceStep2()
                      ? "Fix the slug before continuing"
                      : undefined
                  }
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CreatePageWizard;
