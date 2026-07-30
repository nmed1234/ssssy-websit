"use client";

/**
 * Phase 2 — Universal Dynamic Form Renderer.
 *
 * Reads a FormDefinition schema and renders all fields as React inputs.
 * Supports: text, email, textarea, richtext (plain-text fallback), number,
 *           date, datetime, select, multiselect, checkbox, radio, file, hidden.
 *
 * Usage:
 *   <DynamicForm slug="paper-submission" onSuccess={(sub) => console.log(sub)} />
 *
 * Or pass a FormDefinition directly to skip the API fetch:
 *   <DynamicForm form={myFormDef} onSuccess={...} />
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiResponse, FormDefinition, FormFieldDefinition } from "@/types";
import { useLanguage } from "@/lib/language-context";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DynamicFormProps {
  /** Fetch form by slug from /api/public/forms/{slug} */
  slug?: string;
  /** Or pass the FormDefinition directly to skip the API call */
  form?: FormDefinition;
  /** Called with submission response on success */
  onSuccess?: (data: unknown) => void;
  /** Called on submission error */
  onError?: (error: string) => void;
  /** Extra CSS class on the <form> element */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DynamicForm({ slug, form: formProp, onSuccess, onError, className = "" }: DynamicFormProps) {
  const { t, direction } = useLanguage();
  const [values, setValues] = useState<Record<string, string | boolean | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch schema from public API if slug provided and no direct form prop
  const { data: fetchedForm, isLoading } = useQuery({
    queryKey: ["dynamic-form", slug],
    queryFn: async () => {
      const res = await api.get<ApiResponse<FormDefinition>>(`/public/forms/${slug}`);
      return res.data.data;
    },
    enabled: !!slug && !formProp,
    staleTime: 5 * 60_000,
  });

  const formDef = formProp ?? fetchedForm;

  // Parse field schema
  let fields: FormFieldDefinition[] = [];
  if (formDef?.schemaJson) {
    try { fields = JSON.parse(formDef.schemaJson); } catch { /* ignore */ }
  }

  // Seed default values when form loads
  useEffect(() => {
    if (!fields.length) return;
    const defaults: Record<string, string | boolean | string[]> = {};
    for (const f of fields) {
      if (f.defaultValue != null) defaults[f.name] = f.defaultValue;
      if (f.type === "checkbox") defaults[f.name] = false;
      if (f.type === "multiselect") defaults[f.name] = [];
    }
    setValues((v) => ({ ...defaults, ...v }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDef?.id]);

  // Submission
  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post(`/public/forms/${formDef!.slug}/submit`, { data });
      return res.data;
    },
    onSuccess: (data) => {
      setSubmitted(true);
      onSuccess?.(data);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? t("Submission failed. Please try again.", "فشل الإرسال. يرجى المحاولة مرة أخرى.");
      setErrorMsg(msg);
      onError?.(msg);
    },
  });

  function handleChange(name: string, value: string | boolean | string[]) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    mutation.mutate(values as Record<string, unknown>);
  }

  // ─── Loading state ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
      </div>
    );
  }

  if (!formDef || fields.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-400">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{t("Form not available.", "النموذج غير متاح.")}</p>
      </div>
    );
  }

  // ─── Success state ───────────────────────────────────────────────────────────

  if (submitted) {
    const msg = t(
      formDef.successMessageEn ?? "Thank you! Your submission has been received.",
      formDef.successMessageAr ?? "شكراً! تم استلام نموذجك."
    );
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <p className="text-green-800 font-medium text-lg">{msg}</p>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const submitLabel = t(
    formDef.submitLabelEn ?? "Submit",
    formDef.submitLabelAr ?? "إرسال"
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`space-y-5 ${className}`}
      dir={direction}
    >
      {/* Error banner */}
      {errorMsg && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(v) => handleChange(field.name, v)}
          dir={direction}
        />
      ))}

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="gap-2 bg-green-700 hover:bg-green-800 text-white"
      >
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {submitLabel}
      </Button>
    </form>
  );
}

// ─── Field renderer ───────────────────────────────────────────────────────────

interface FieldRendererProps {
  field: FormFieldDefinition;
  value: string | boolean | string[] | undefined;
  onChange: (value: string | boolean | string[]) => void;
  dir: "ltr" | "rtl";
}

function FieldRenderer({ field, value, onChange, dir }: FieldRendererProps) {
  const label = dir === "rtl" && field.labelAr ? field.labelAr : field.labelEn;
  const placeholder = dir === "rtl" && field.placeholderAr ? field.placeholderAr : (field.placeholder ?? "");
  const helpText = dir === "rtl" && field.helpTextAr ? field.helpTextAr : field.helpText;

  if (field.type === "hidden") return null;

  const baseInput = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";

  return (
    <div className="space-y-1.5">
      {field.type !== "checkbox" && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* text | email | url | number */}
      {(["text", "email", "number"] as string[]).includes(field.type) && (
        <input
          type={field.type}
          placeholder={placeholder}
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
          min={field.validation?.min != null ? String(field.validation.min) : undefined}
          max={field.validation?.max != null ? String(field.validation.max) : undefined}
          pattern={field.validation?.pattern}
        />
      )}

      {/* textarea / richtext — render as textarea */}
      {(field.type === "textarea" || field.type === "richtext") && (
        <textarea
          placeholder={placeholder}
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} min-h-[120px] resize-y`}
          maxLength={field.validation?.maxLength}
        />
      )}

      {/* date / datetime */}
      {(field.type === "date" || field.type === "datetime") && (
        <input
          type={field.type === "datetime" ? "datetime-local" : "date"}
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        />
      )}

      {/* select */}
      {field.type === "select" && (
        <select
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        >
          <option value="">{placeholder || "—"}</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {dir === "rtl" && opt.labelAr ? opt.labelAr : opt.label}
            </option>
          ))}
        </select>
      )}

      {/* multiselect */}
      {field.type === "multiselect" && (
        <select
          multiple
          required={field.required}
          value={(value as string[]) ?? []}
          onChange={(e) =>
            onChange(Array.from(e.target.selectedOptions, (o) => o.value))
          }
          className={`${baseInput} min-h-[100px]`}
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {dir === "rtl" && opt.labelAr ? opt.labelAr : opt.label}
            </option>
          ))}
        </select>
      )}

      {/* radio */}
      {field.type === "radio" && (
        <div className="space-y-2">
          {(field.options ?? []).map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name={field.name}
                value={opt.value}
                checked={(value as string) === opt.value}
                onChange={() => onChange(opt.value)}
                required={field.required}
                className="text-green-600"
              />
              {dir === "rtl" && opt.labelAr ? opt.labelAr : opt.label}
            </label>
          ))}
        </div>
      )}

      {/* checkbox */}
      {field.type === "checkbox" && (
        <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={(value as boolean) ?? false}
            onChange={(e) => onChange(e.target.checked)}
            required={field.required}
            className="mt-0.5 text-green-600 h-4 w-4"
          />
          <span>{label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
        </label>
      )}

      {/* file */}
      {field.type === "file" && (
        <input
          type="file"
          required={field.required}
          onChange={(e) => onChange(e.target.files?.[0]?.name ?? "")}
          className="block w-full text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
      )}

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
    </div>
  );
}
