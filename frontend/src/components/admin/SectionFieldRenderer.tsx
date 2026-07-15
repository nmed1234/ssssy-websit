"use client";

/**
 * SectionFieldRenderer
 *
 * Generic field renderer used by the Section Builder Panel.
 * Dispatches to sub-components based on `field.type`:
 *
 *   text / textarea  → BilingualInput (EN | AR tab pair)
 *   url              → plain URL text input
 *   number           → number input
 *   image            → ImagePickerField (MediaLibraryModal + Paste URL)
 *   color-class      → ColorClassPicker (Tailwind class swatches)
 *   repeater         → RepeaterField (add / remove / drag-to-reorder rows)
 */

import React, { useState, useRef } from "react";
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldDef } from "@/lib/section-field-schemas";
import { BG_COLOR_OPTIONS, TEXT_COLOR_OPTIONS } from "@/lib/section-field-schemas";
import { MediaLibraryModal } from "@/components/page-builder/MediaLibraryModal";
import { useLanguage } from "@/lib/language-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FieldRendererProps {
  field: FieldDef;
  /** Current flat value map for the entire data/config/styling object */
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  /** "en" | "ar" — active preview language (used to default the bilingual tab) */
  previewLang?: "en" | "ar";
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

export function SectionFieldRenderer({ field, values, onChange, previewLang }: FieldRendererProps) {
  switch (field.type) {
    case "text":
    case "textarea":
      return field.bilingual ? (
        <BilingualInput field={field} values={values} onChange={onChange} defaultLang={previewLang} />
      ) : (
        <MonoInput field={field} values={values} onChange={onChange} />
      );
    case "url":
      return <UrlInput field={field} values={values} onChange={onChange} />;
    case "number":
      return <NumberInput field={field} values={values} onChange={onChange} />;
    case "image":
      return <ImagePickerField field={field} values={values} onChange={onChange} />;
    case "color-class":
      return <ColorClassPicker field={field} values={values} onChange={onChange} />;
    case "repeater":
      return <RepeaterField field={field} values={values} onChange={onChange} previewLang={previewLang} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Shared label helper
// ---------------------------------------------------------------------------

function FieldLabel({ field, extra }: { field: FieldDef; extra?: React.ReactNode }) {
  const { language } = useLanguage();
  const label = language === "ar" ? field.labelAr : field.labelEn;
  return (
    <div className="flex items-center justify-between mb-1">
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</label>
      {extra}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BilingualInput — text / textarea with EN | AR tab switcher
// ---------------------------------------------------------------------------

function BilingualInput({
  field,
  values,
  onChange,
  defaultLang,
}: {
  field: FieldDef;
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
  defaultLang?: "en" | "ar";
}) {
  const [activeLang, setActiveLang] = useState<"en" | "ar">(defaultLang ?? "en");

  const enKey = `${field.key}En`;
  const arKey = `${field.key}Ar`;

  const enVal = (values[enKey] as string) ?? (values[field.key] as string) ?? "";
  const arVal = (values[arKey] as string) ?? "";

  const arEmpty = arVal.trim() === "";

  function update(lang: "en" | "ar", val: string) {
    const key = lang === "en" ? enKey : arKey;
    onChange({ ...values, [key]: val });
  }

  const currentVal = activeLang === "en" ? enVal : arVal;
  const placeholder =
    activeLang === "en"
      ? field.placeholder ?? ""
      : field.placeholderAr ?? field.placeholder ?? "";

  const isRtl = activeLang === "ar";

  return (
    <div>
      <FieldLabel
        field={field}
        extra={
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setActiveLang("en")}
              className={cn(
                "px-2 py-0.5 text-xs rounded font-medium transition-colors",
                activeLang === "en"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setActiveLang("ar")}
              className={cn(
                "px-2 py-0.5 text-xs rounded font-medium transition-colors relative",
                activeLang === "ar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              AR
              {arEmpty && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400"
                  title="Arabic text not set — will fall back to English"
                />
              )}
            </button>
          </div>
        }
      />

      {/* Amber fallback badge */}
      {activeLang === "ar" && arEmpty && (
        <p className="text-amber-600 text-xs mb-1 flex items-center gap-1">
          <span>⚠</span> No Arabic text — site will display English fallback
        </p>
      )}

      {field.type === "textarea" ? (
        <textarea
          dir={isRtl ? "rtl" : "ltr"}
          value={currentVal}
          placeholder={placeholder}
          onChange={(e) => update(activeLang, e.target.value)}
          rows={3}
          className={cn(
            "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-soil-clay/40 focus:border-soil-clay",
            isRtl && "font-arabic text-right"
          )}
        />
      ) : (
        <input
          type="text"
          dir={isRtl ? "rtl" : "ltr"}
          value={currentVal}
          placeholder={placeholder}
          onChange={(e) => update(activeLang, e.target.value)}
          className={cn(
            "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/40 focus:border-soil-clay",
            isRtl && "font-arabic text-right"
          )}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MonoInput — single-language text input (non-bilingual fields)
// ---------------------------------------------------------------------------

function MonoInput({
  field,
  values,
  onChange,
}: {
  field: FieldDef;
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const val = (values[field.key] as string) ?? "";

  return (
    <div>
      <FieldLabel field={field} />
      {field.type === "textarea" ? (
        <textarea
          value={val}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange({ ...values, [field.key]: e.target.value })}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-soil-clay/40 focus:border-soil-clay"
        />
      ) : (
        <input
          type="text"
          value={val}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange({ ...values, [field.key]: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/40 focus:border-soil-clay"
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// UrlInput — URL input with link icon
// ---------------------------------------------------------------------------

function UrlInput({
  field,
  values,
  onChange,
}: {
  field: FieldDef;
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const val = (values[field.key] as string) ?? "";
  return (
    <div>
      <FieldLabel field={field} />
      <div className="relative">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={val}
          placeholder={field.placeholder ?? "https://…"}
          onChange={(e) => onChange({ ...values, [field.key]: e.target.value })}
          className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-soil-clay/40 focus:border-soil-clay"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NumberInput
// ---------------------------------------------------------------------------

function NumberInput({
  field,
  values,
  onChange,
}: {
  field: FieldDef;
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const val = (values[field.key] as number) ?? "";
  return (
    <div>
      <FieldLabel field={field} />
      <input
        type="number"
        value={val}
        placeholder={field.placeholder ?? ""}
        onChange={(e) => onChange({ ...values, [field.key]: parseInt(e.target.value) || 0 })}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/40 focus:border-soil-clay"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ImagePickerField — URL input + MediaLibraryModal button
// ---------------------------------------------------------------------------

function ImagePickerField({
  field,
  values,
  onChange,
}: {
  field: FieldDef;
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const { language } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const val = (values[field.key] as string) ?? "";

  return (
    <div>
      <FieldLabel field={field} />
      <div className="space-y-2">
        {/* Preview */}
        {val && (
          <div className="relative w-full h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={val}
              alt="preview"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <button
              type="button"
              onClick={() => onChange({ ...values, [field.key]: "" })}
              className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 text-gray-500 hover:text-red-500 shadow"
              title="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Paste URL row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={val}
            placeholder={language === "ar" ? "لصق رابط الصورة..." : "Paste image URL…"}
            onChange={(e) => onChange({ ...values, [field.key]: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-soil-clay/40 focus:border-soil-clay"
          />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 px-3 py-2 text-xs font-medium bg-soil-dark text-white rounded-lg hover:bg-deep-soil transition-colors"
          >
            {language === "ar" ? "مكتبة الصور" : "Browse"}
          </button>
        </div>
      </div>

      {modalOpen && (
        <MediaLibraryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSelect={(url) => {
            onChange({ ...values, [field.key]: url });
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColorClassPicker — palette of Tailwind class swatches
// ---------------------------------------------------------------------------

function ColorClassPicker({
  field,
  values,
  onChange,
}: {
  field: FieldDef;
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const isText = field.key.toLowerCase().includes("text");
  const options = isText ? TEXT_COLOR_OPTIONS : BG_COLOR_OPTIONS;
  const current = (values[field.key] as string) ?? "";

  return (
    <div>
      <FieldLabel field={field} />
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            title={opt.label}
            onClick={() => onChange({ ...values, [field.key]: opt.value })}
            className={cn(
              "relative w-8 h-8 rounded-lg border-2 transition-all",
              current === opt.value
                ? "border-soil-clay ring-2 ring-soil-clay/40 scale-110"
                : "border-gray-200 hover:border-gray-400"
            )}
            style={{
              background: opt.preview.startsWith("linear-gradient")
                ? opt.preview
                : opt.preview,
              backgroundColor: opt.preview.startsWith("linear-gradient")
                ? undefined
                : opt.preview,
            }}
          >
            {current === opt.value && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={opt.preview === "#ffffff" ? "#666" : "#fff"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </button>
        ))}
        {/* Custom input */}
        <input
          type="text"
          value={current}
          onChange={(e) => onChange({ ...values, [field.key]: e.target.value })}
          placeholder="custom class…"
          className="flex-1 min-w-[120px] border border-gray-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-soil-clay/40"
          title="Enter a custom Tailwind class"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RepeaterField — drag-to-reorder list of item rows
// ---------------------------------------------------------------------------

interface RepeaterItem {
  [key: string]: unknown;
}

function RepeaterField({
  field,
  values,
  onChange,
  previewLang,
}: {
  field: FieldDef;
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
  previewLang?: "en" | "ar";
}) {
  const { language } = useLanguage();
  const items: RepeaterItem[] = Array.isArray(values[field.key])
    ? (values[field.key] as RepeaterItem[])
    : [];

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Drag state
  const dragIdx = useRef<number | null>(null);

  function updateItems(next: RepeaterItem[]) {
    onChange({ ...values, [field.key]: next });
  }

  function addItem() {
    const empty: RepeaterItem = {};
    (field.subFields ?? []).forEach((sf) => {
      if (sf.bilingual) {
        empty[`${sf.key}En`] = "";
        empty[`${sf.key}Ar`] = "";
      } else {
        empty[sf.key] = "";
      }
    });
    const next = [...items, empty];
    updateItems(next);
    setExpandedIdx(next.length - 1);
  }

  function removeItem(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    updateItems(next);
    if (expandedIdx === idx) setExpandedIdx(null);
  }

  function updateItemField(idx: number, subValues: Record<string, unknown>) {
    const next = items.map((item, i) => (i === idx ? { ...item, ...subValues } : item));
    updateItems(next);
  }

  function getItemTitle(item: RepeaterItem, idx: number): string {
    if (!field.itemTitleKey) return `Item ${idx + 1}`;
    const titleEnKey = `${field.itemTitleKey}En`;
    const val =
      (item[titleEnKey] as string) ||
      (item[field.itemTitleKey] as string) ||
      `Item ${idx + 1}`;
    return String(val).slice(0, 50);
  }

  // Drag handlers
  function handleDragStart(idx: number) {
    dragIdx.current = idx;
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(idx, 0, moved);
    dragIdx.current = idx;
    updateItems(next);
    if (expandedIdx === null) return;
    // keep expanded item tracking
    if (expandedIdx === dragIdx.current) setExpandedIdx(idx);
  }

  function handleDragEnd() {
    dragIdx.current = null;
  }

  return (
    <div className="space-y-1">
      <FieldLabel
        field={field}
        extra={
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs text-soil-clay hover:text-soil-dark font-medium"
          >
            <Plus className="h-3 w-3" />
            {language === "ar" ? "إضافة" : "Add"}
          </button>
        }
      />

      {items.length === 0 && (
        <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">
          {language === "ar" ? "لا توجد عناصر بعد" : "No items yet — click Add to get started"}
        </div>
      )}

      <div className="space-y-1">
        {items.map((item, idx) => {
          const isOpen = expandedIdx === idx;
          return (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden"
            >
              {/* Row header */}
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none hover:bg-gray-50">
                <GripVertical className="h-4 w-4 text-gray-300 cursor-grab shrink-0" />
                <span
                  className="flex-1 text-xs font-medium text-gray-700 truncate"
                  onClick={() => setExpandedIdx(isOpen ? null : idx)}
                >
                  {getItemTitle(item, idx)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-gray-300 hover:text-red-500 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedIdx(isOpen ? null : idx)}
                  className="p-1 text-gray-400 shrink-0"
                >
                  {isOpen ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Expanded sub-fields */}
              {isOpen && (
                <div className="border-t border-gray-100 px-3 py-3 space-y-3 bg-gray-50/50">
                  {(field.subFields ?? []).map((subField) => (
                    <SectionFieldRenderer
                      key={subField.key}
                      field={subField}
                      values={item as Record<string, unknown>}
                      onChange={(updated) => updateItemField(idx, updated)}
                      previewLang={previewLang}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
