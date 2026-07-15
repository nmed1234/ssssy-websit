/**
 * PropertyPanel — auto-generated property editor for the selected block.
 *
 * It reads the selected block's type from BLOCK_SCHEMA, groups fields into
 * Content / Layout / Style / Advanced tabs, and renders the correct input
 * widget for each field kind:
 *   text, textarea, richtext, number, select, toggle, color, url, image, items
 *
 * The parent must supply the selected block and an `onChange` handler that
 * receives the updated `props` object.  No mutation happens inside this file.
 */

"use client";

import React, { useState } from "react";
import { Layout, Trash2, Copy, ChevronUp, ChevronDown } from "lucide-react";
import type { Block, BlockProps } from "@/types/block";
import { BLOCK_SCHEMA, getBlockSchema } from "@/components/page-builder/schema/block-schema";
import type { FieldDef, PropGroup } from "@/components/page-builder/schema/block-schema";
import { ImageFieldWidget } from "@/components/page-builder/ImageFieldWidget";
import { TipTapField } from "@/components/page-builder/TipTapField";
import { EventsTab } from "@/components/page-builder/EventsTab";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = PropGroup;

/** Block types that show the Events tab */
const INTERACTIVE_TYPES = new Set(["button", "card", "cta", "hero", "banner", "image"]);

interface PropertyPanelProps {
  block: Block | null;
  /** Called with the full updated props whenever any field changes */
  onPropsChange: (blockId: string, newProps: BlockProps) => void;
  onDelete: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  /** Move block up one position in its parent */
  onMoveUp?: (blockId: string) => void;
  onMoveDown?: (blockId: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TAB_LABELS: Record<PropGroup, string> = {
  content:  "Content",
  layout:   "Layout",
  style:    "Style",
  advanced: "Advanced",
  events:   "Events",
};

function groupFields(fields: FieldDef[]): Partial<Record<PropGroup, FieldDef[]>> {
  const out: Partial<Record<PropGroup, FieldDef[]>> = {};
  for (const f of fields) {
    if (!out[f.group]) out[f.group] = [];
    out[f.group]!.push(f);
  }
  return out;
}

// ─── Input widgets ────────────────────────────────────────────────────────────

function inputCls(extra = "") {
  return `w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-400 ${extra}`;
}

function FieldWidget({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const strVal = value === null || value === undefined ? "" : String(value);

  switch (field.kind) {
    case "text":
      return (
        <input
          type="text"
          className={inputCls(field.dir === "rtl" ? "text-right" : "")}
          dir={field.dir}
          placeholder={field.placeholder}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "textarea":
      return (
        <textarea
          className={inputCls(`resize-y min-h-[64px] ${field.dir === "rtl" ? "text-right" : ""}`)}
          dir={field.dir}
          rows={field.rows ?? 3}
          placeholder={field.placeholder}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "richtext":
      return (
        <TipTapField
          value={strVal}
          onChange={(html) => onChange(html)}
          dir={field.dir}
        />
      );

    case "number": {
      const num = Number(value);
      return (
        <input
          type="number"
          className={inputCls()}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          value={isNaN(num) ? "" : num}
          onChange={(e) => onChange(e.target.valueAsNumber)}
        />
      );
    }

    case "select":
      return (
        <select
          className={inputCls()}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case "toggle":
      return (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            value ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${value ? "translate-x-4" : "translate-x-1"}`} />
        </button>
      );

    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={strVal.startsWith("#") ? strVal : "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-8 cursor-pointer rounded border border-gray-200 p-0.5"
          />
          <input
            type="text"
            className={inputCls("flex-1")}
            value={strVal}
            placeholder="#ffffff or rgba(…)"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "url":
      return (
        <input
          type="url"
          className={inputCls()}
          placeholder={field.placeholder ?? "https://…"}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "image":
      return (
        <ImageFieldWidget
          value={strVal}
          onChange={(url) => onChange(url)}
        />
      );

    case "items": {
      // Repeating-item editor: array of records
      const items: Record<string, unknown>[] = Array.isArray(value) ? (value as any) : [];
      return (
        <ItemsEditor
          items={items}
          schema={field.itemSchema}
          onChange={(newItems) => onChange(newItems)}
        />
      );
    }

    default:
      return (
        <input
          type="text"
          className={inputCls()}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

// ─── Items editor (repeating list of records) ─────────────────────────────────

function ItemsEditor({
  items,
  schema,
  onChange,
}: {
  items: Record<string, unknown>[];
  schema: FieldDef[];
  onChange: (items: Record<string, unknown>[]) => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) => {
    const s = new Set(expanded);
    s.has(i) ? s.delete(i) : s.add(i);
    setExpanded(s);
  };

  const updateItem = (i: number, key: string, v: unknown) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [key]: v } : item);
    onChange(next);
  };

  const addItem = () => {
    const blank: Record<string, unknown> = {};
    schema.forEach((f) => { blank[f.key] = ""; });
    onChange([...items, blank as Record<string, string | number | boolean | null | undefined>]);
    setExpanded(new Set<number>([...Array.from(expanded), items.length]));
  };

  const removeItem = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
  };

  const moveItem = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const firstLabelKey = schema.find((f) => f.kind === "text" || f.kind === "textarea")?.key ?? "title";

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => {
        const isOpen = expanded.has(i);
        const label = String(item[firstLabelKey] || `Item ${i + 1}`).slice(0, 28);
        return (
          <div key={i} className="border border-gray-200 rounded overflow-hidden">
            <div className="flex items-center bg-gray-50 px-2 py-1">
              <button type="button" onClick={() => toggle(i)} className="flex-1 text-left text-xs font-medium text-gray-700 truncate">
                {isOpen ? "▾" : "▸"} {label}
              </button>
              <button type="button" onClick={() => moveItem(i, -1)} className="p-0.5 text-gray-400 hover:text-gray-700" title="Move up"><ChevronUp className="w-3 h-3" /></button>
              <button type="button" onClick={() => moveItem(i, 1)}  className="p-0.5 text-gray-400 hover:text-gray-700" title="Move down"><ChevronDown className="w-3 h-3" /></button>
              <button type="button" onClick={() => removeItem(i)} className="p-0.5 text-red-400 hover:text-red-600 ml-1" title="Remove">✕</button>
            </div>
            {isOpen && (
              <div className="px-2 py-2 space-y-2">
                {schema.map((f) => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-gray-500 mb-0.5">{f.label}</label>
                    <FieldWidget
                      field={f}
                      value={item[f.key]}
                      onChange={(v) => updateItem(i, f.key, v)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={addItem}
        className="w-full text-xs text-blue-600 border border-dashed border-blue-300 rounded py-1.5 hover:bg-blue-50"
      >
        + Add item
      </button>
    </div>
  );
}

// ─── Raw JSON editor (fallback for unknown block types) ───────────────────────

function RawJsonEditor({
  block,
  onPropsChange,
}: {
  block: Block;
  onPropsChange: (blockId: string, newProps: BlockProps) => void;
}) {
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(block.props, null, 2)
  );
  const [error, setError] = useState<string | null>(null);

  // Keep jsonText in sync when block props change externally
  React.useEffect(() => {
    setJsonText(JSON.stringify(block.props, null, 2));
    setError(null);
  }, [block.id]); // only reset when the selected block changes

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(jsonText) as BlockProps;
      setError(null);
      onPropsChange(block.id, parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
        This block type (<code className="font-mono">{block.type}</code>) is not registered in the
        schema. Editing raw props JSON below.
      </p>
      <label className="block text-[11px] font-medium text-gray-600">
        Block Props (JSON)
      </label>
      <textarea
        className={`w-full border rounded px-2 py-1.5 text-xs font-mono bg-white focus:outline-none resize-y min-h-[240px] ${
          error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
        }`}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        onBlur={handleBlur}
        spellCheck={false}
      />
      {error && (
        <p className="text-[11px] text-red-500">{error}</p>
      )}
    </div>
  );
}

// ─── Main PropertyPanel ───────────────────────────────────────────────────────

export function PropertyPanel({
  block,
  onPropsChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");

  if (!block) {
    return (
      <div className="w-72 border-l bg-gray-50 flex flex-col items-center justify-center gap-2 p-6">
        <Layout className="w-8 h-8 text-gray-300" />
        <p className="text-xs text-gray-400 text-center">Select a block to edit its properties</p>
      </div>
    );
  }

  const schema = getBlockSchema(block.type);
  const isUnknownType = !(block.type in BLOCK_SCHEMA);
  const grouped = groupFields(schema.fields);
  const availableTabs = (["content", "layout", "style", "advanced"] as PropGroup[]).filter(
    (g) => (grouped[g]?.length ?? 0) > 0
  );

  // Add "events" tab for interactive block types
  if (INTERACTIVE_TYPES.has(block.type)) {
    availableTabs.push("events");
  }

  // If current tab has no fields, switch to first available
  const tab: ActiveTab = availableTabs.includes(activeTab) ? activeTab : (availableTabs[0] ?? "content");

  const handleChange = (key: string, value: unknown) => {
    onPropsChange(block.id, { ...block.props, [key]: value } as import("@/types/block").BlockProps);
  };

  const fields = grouped[tab] ?? [];

  return (
    <div className="w-72 border-l bg-white flex flex-col min-h-0">
      {/* Header */}
      <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm">{schema.icon}</span>
          <span className="text-xs font-semibold text-gray-800 truncate">{schema.label}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onMoveUp   && <button type="button" title="Move up"   onClick={() => onMoveUp(block.id)}   className="p-1 text-gray-400 hover:text-gray-700"><ChevronUp className="w-3.5 h-3.5" /></button>}
          {onMoveDown && <button type="button" title="Move down" onClick={() => onMoveDown(block.id)} className="p-1 text-gray-400 hover:text-gray-700"><ChevronDown className="w-3.5 h-3.5" /></button>}
          <button type="button" title="Duplicate" onClick={() => onDuplicate(block.id)} className="p-1 text-gray-400 hover:text-gray-700"><Copy className="w-3.5 h-3.5" /></button>
          <button type="button" title="Delete"    onClick={() => onDelete(block.id)}    className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Raw JSON editor for unknown block types */}
      {isUnknownType ? (
        <RawJsonEditor block={block} onPropsChange={onPropsChange} />
      ) : (
        <>
          {/* Tabs */}
          {availableTabs.length > 1 && (
            <div className="flex border-b flex-shrink-0">
              {availableTabs.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveTab(g)}
                  className={`flex-1 py-1.5 text-[11px] font-medium transition-colors ${
                    g === tab ? "bg-soil-dark text-white" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {TAB_LABELS[g]}
                </button>
              ))}
            </div>
          )}

          {/* Fields */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {tab === "events" ? (
              <EventsTab block={block} onPropsChange={onPropsChange} />
            ) : (
              <div className="p-3 space-y-3">
                {fields.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No fields in this tab</p>
                ) : (
                  fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        {field.label}
                        {field.helpText && (
                          <span className="ml-1 text-gray-400 font-normal">{field.helpText}</span>
                        )}
                      </label>
                      <FieldWidget
                        field={field}
                        value={block.props[field.key]}
                        onChange={(v) => handleChange(field.key, v)}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Block ID (for debugging) */}
      <div className="px-3 py-1.5 border-t bg-gray-50 flex-shrink-0">
        <p className="text-[9px] font-mono text-gray-300 truncate">{block.id}</p>
      </div>
    </div>
  );
}
