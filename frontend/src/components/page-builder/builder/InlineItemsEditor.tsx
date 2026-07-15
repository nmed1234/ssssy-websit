/**
 * InlineItemsEditor — renders a block's repeating items array as editable
 * card rows directly on the builder canvas.
 *
 * Architecture:
 *   - Each item is a bordered card with labeled contentEditable fields
 *   - Uses local contentEditable state (NOT InlineEditProvider) to allow
 *     multiple fields to be edited independently
 *   - "Add item" appends a new empty item
 *   - "×" removes an item
 *   - Drag handle (⠿) enables drag-to-reorder
 *   - Only text/textarea kind fields are exposed for inline editing
 *   - Image, URL, color, toggle, number, select fields remain Property Panel only
 */

import React, { useRef } from "react";

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface ItemFieldDef {
  key: string;
  label: string;
  multiline?: boolean; // true for textarea-kind fields
  dir?: "rtl";         // for Arabic fields
}

export interface ItemsEditorRegistryEntry {
  itemsKey: string;
  itemFields: ItemFieldDef[]; // already filtered to text/textarea only
}

export interface InlineItemsEditorProps {
  blockId: string;
  itemsKey: string;
  items: Record<string, unknown>[];
  itemFields: ItemFieldDef[];
  onItemsChange: (newItems: Record<string, unknown>[]) => void;
}

// ─── ITEMS_EDITOR_REGISTRY ────────────────────────────────────────────────────
// Maps block types to their items config.
// Only text/textarea kind fields are included (image, url, color, toggle, number, select are excluded).

export const ITEMS_EDITOR_REGISTRY: Record<string, ItemsEditorRegistryEntry> = {
  timeline: {
    itemsKey: "items",
    itemFields: [
      { key: "date",      label: "Date / Year" },
      { key: "title",     label: "Event Title (EN)" },
      { key: "titleAr",   label: "العنوان (AR)",     dir: "rtl" },
      { key: "content",   label: "Description (EN)", multiline: true },
      { key: "contentAr", label: "الوصف (AR)",       multiline: true, dir: "rtl" },
    ],
  },
  accordion: {
    itemsKey: "items",
    itemFields: [
      { key: "title",     label: "Heading (EN)" },
      { key: "titleAr",   label: "العنوان (AR)",  dir: "rtl" },
      { key: "content",   label: "Body (EN)",     multiline: true },
      { key: "contentAr", label: "المحتوى (AR)", multiline: true, dir: "rtl" },
    ],
  },
  faq: {
    itemsKey: "items",
    itemFields: [
      { key: "question",   label: "Question (EN)" },
      { key: "questionAr", label: "السؤال (AR)",   dir: "rtl" },
      { key: "answer",     label: "Answer (EN)",   multiline: true },
      { key: "answerAr",   label: "الإجابة (AR)", multiline: true, dir: "rtl" },
    ],
  },
  stats: {
    itemsKey: "items",
    itemFields: [
      { key: "value",   label: "Value (e.g. 1,200+)" },
      { key: "label",   label: "Label (EN)" },
      { key: "labelAr", label: "التسمية (AR)", dir: "rtl" },
      { key: "icon",    label: "Icon (emoji)" },
    ],
  },
  testimonial: {
    itemsKey: "items",
    itemFields: [
      { key: "quote",   label: "Quote (EN)",     multiline: true },
      { key: "quoteAr", label: "الاقتباس (AR)", multiline: true, dir: "rtl" },
      { key: "name",    label: "Author Name" },
      { key: "role",    label: "Role / Company" },
    ],
  },
  team: {
    itemsKey: "items",
    itemFields: [
      { key: "name",   label: "Name (EN)" },
      { key: "nameAr", label: "الاسم (AR)",           dir: "rtl" },
      { key: "role",   label: "Role / Title (EN)" },
      { key: "roleAr", label: "الدور / اللقب (AR)",  dir: "rtl" },
      { key: "bio",    label: "Bio (EN)",              multiline: true },
      { key: "bioAr",  label: "السيرة الذاتية (AR)", multiline: true, dir: "rtl" },
    ],
  },
  gallery: {
    itemsKey: "items",
    itemFields: [
      { key: "alt",     label: "Alt Text" },
      { key: "caption", label: "Caption" },
    ],
  },
  carousel: {
    itemsKey: "items",
    itemFields: [
      { key: "title",   label: "Slide Title" },
      { key: "content", label: "Slide Body", multiline: true },
    ],
  },
  "pricing-table": {
    itemsKey: "items",
    itemFields: [
      { key: "name",        label: "Plan Name" },
      { key: "price",       label: "Price" },
      { key: "period",      label: "Period" },
      { key: "description", label: "Description", multiline: true },
      { key: "cta",         label: "CTA Button" },
    ],
  },
  progress: {
    itemsKey: "items",
    itemFields: [
      { key: "label", label: "Skill / Label" },
    ],
  },
  "about-vision-mission-section": {
    itemsKey: "panels",
    itemFields: [
      { key: "icon",          label: "Icon (emoji or Lucide name)" },
      { key: "titleEn",       label: "Panel Title (EN)" },
      { key: "titleAr",       label: "عنوان اللوحة (AR)",   dir: "rtl" },
      { key: "contentEn",     label: "Panel Content (EN)",   multiline: true },
      { key: "contentAr",     label: "محتوى اللوحة (AR)",   multiline: true, dir: "rtl" },
      { key: "buttonLabelEn", label: "Button Label (EN)" },
      { key: "buttonLabelAr", label: "نص الزر (AR)",         dir: "rtl" },
    ],
  },
  "about-timeline-section": {
    itemsKey: "items",
    itemFields: [
      { key: "year",    label: "Year" },
      { key: "titleEn", label: "Title (EN)" },
      { key: "titleAr", label: "العنوان (AR)",    dir: "rtl" },
      { key: "descEn",  label: "Description (EN)", multiline: true },
      { key: "descAr",  label: "الوصف (AR)",      multiline: true, dir: "rtl" },
    ],
  },
  "about-overview-section": {
    itemsKey: "paragraphs",
    itemFields: [
      { key: "textEn", label: "Paragraph (EN)", multiline: true },
      { key: "textAr", label: "الفقرة (AR)",    multiline: true, dir: "rtl" },
    ],
  },
  "about-organizational-chart-section": {
    itemsKey: "paragraphs",
    itemFields: [
      { key: "textEn", label: "Paragraph (EN)", multiline: true },
      { key: "textAr", label: "الفقرة (AR)",    multiline: true, dir: "rtl" },
    ],
  },
  "board-term-information-section": {
    itemsKey: "paragraphs",
    itemFields: [
      { key: "textEn", label: "Paragraph (EN)", multiline: true },
      { key: "textAr", label: "الفقرة (AR)",    multiline: true, dir: "rtl" },
    ],
  },
  "about-documents-section": {
    itemsKey: "documents",
    itemFields: [
      { key: "labelEn",  label: "Label (EN)" },
      { key: "labelAr",  label: "التسمية (AR)", dir: "rtl" },
      { key: "fileType", label: "File Type (e.g. PDF)" },
    ],
  },
  "about-gallery-section": {
    itemsKey: "images",
    itemFields: [
      { key: "alt",     label: "Alt Text" },
      { key: "caption", label: "Caption" },
    ],
  },
  "president-message-content-section": {
    itemsKey: "paragraphs",
    itemFields: [
      { key: "textEn", label: "Paragraph (EN)", multiline: true },
      { key: "textAr", label: "الفقرة (AR)",    multiline: true, dir: "rtl" },
    ],
  },
};

// ─── InlineItemsEditor Component ─────────────────────────────────────────────

export function InlineItemsEditor({
  blockId: _blockId, // used for context identification (kept for future use / caller awareness)
  itemsKey: _itemsKey,
  items,
  itemFields,
  onItemsChange,
}: InlineItemsEditorProps): React.ReactElement {
  // Track drag-and-drop index
  const dragIndexRef = useRef<number | null>(null);

  // ── Add / Remove ────────────────────────────────────────────────────────────

  const handleAddItem = () => {
    const emptyItem = Object.fromEntries(itemFields.map((f) => [f.key, ""]));
    onItemsChange([...items, emptyItem]);
  };

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  // ── Field commit (local contentEditable blur) ────────────────────────────────

  const handleFieldBlur = (
    e: React.FocusEvent<HTMLSpanElement>,
    index: number,
    fieldKey: string
  ) => {
    const newValue = e.currentTarget.textContent ?? "";
    onItemsChange(
      items.map((item, i) =>
        i === index ? { ...item, [fieldKey]: newValue } : item
      )
    );
  };

  // ── Keyboard handlers ───────────────────────────────────────────────────────

  const handleFieldKeyDown = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    multiline?: boolean
  ) => {
    if (e.key === "Enter" && !e.shiftKey && !multiline) {
      // Commit single-line field on Enter (without Shift)
      e.preventDefault();
      e.currentTarget.blur();
    }
    if (e.key === "Escape") {
      // Revert to original value on Escape
      const original = e.currentTarget.dataset.original ?? "";
      e.currentTarget.textContent = original;
      e.currentTarget.blur();
    }
  };

  // ── Drag-to-reorder ─────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === toIndex) return;

    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onItemsChange(updated);
    dragIndexRef.current = null;
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mt-1">
      {/* Section header */}
      <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
        <span>⊞</span> Items ({items.length})
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <p className="text-[10px] text-gray-400 italic mb-1 px-1">
          No items yet — click ＋ to add one
        </p>
      )}

      {/* Item cards */}
      {items.map((item, idx) => (
        <div
          key={idx}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, idx)}
          className="border border-dashed border-blue-200 rounded-md p-2 mb-2 relative bg-white/50"
        >
          {/* Delete button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveItem(idx);
            }}
            className="absolute top-1 right-7 text-red-400 hover:text-red-500 text-xs cursor-pointer leading-none w-4 h-4 flex items-center justify-center rounded hover:bg-red-50"
            title="Remove item"
            aria-label="Remove item"
          >
            ×
          </button>

          {/* Drag handle */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-1 right-1 text-gray-300 hover:text-gray-500 text-xs cursor-grab active:cursor-grabbing leading-none w-4 h-4 flex items-center justify-center"
            title="Drag to reorder"
            aria-label="Drag to reorder"
            tabIndex={-1}
          >
            ⠿
          </button>

          {/* Fields */}
          <div className="pr-8 flex flex-wrap gap-x-2 gap-y-1">
            {itemFields.map((f) => {
              const rawValue = item[f.key];
              const strValue =
                rawValue !== null && rawValue !== undefined
                  ? String(rawValue)
                  : "";

              return (
                <div key={f.key} className={f.multiline ? "w-full" : "flex-1 min-w-[80px]"}>
                  {/* Field label */}
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide block mb-0.5">
                    {f.label}
                  </span>
                  {/* Field contentEditable */}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    dir={f.dir}
                    data-original={strValue}
                    onFocus={(e) => {
                      // Snapshot current value for Escape revert
                      e.currentTarget.dataset.original = e.currentTarget.textContent ?? "";
                    }}
                    onBlur={(e) => handleFieldBlur(e, idx, f.key)}
                    onKeyDown={(e) => handleFieldKeyDown(e, f.multiline)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className={[
                      "block w-full text-[11px] text-gray-700 bg-transparent",
                      "border border-transparent rounded px-1 py-0.5",
                      "focus:outline-none focus:border-blue-300 focus:bg-white",
                      "hover:border-blue-200 hover:bg-white/80",
                      "transition-colors cursor-text",
                      f.multiline ? "min-h-[2.5rem] whitespace-pre-wrap" : "whitespace-nowrap overflow-hidden",
                      !strValue ? "text-gray-300" : "",
                      f.dir === "rtl" ? "text-right" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ minWidth: "2rem" }}
                  >
                    {strValue || (
                      <span className="text-gray-300 pointer-events-none select-none">
                        {f.label}…
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add item button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleAddItem();
        }}
        className="w-full border border-dashed border-gray-300 rounded-md p-2 text-center text-xs text-gray-400 hover:text-gray-600 hover:border-gray-400 cursor-pointer transition-colors mt-1"
      >
        ＋ Add item
      </button>
    </div>
  );
}
