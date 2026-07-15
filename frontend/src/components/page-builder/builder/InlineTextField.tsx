/**
 * InlineTextField — renders a text value normally and activates an in-place
 * contentEditable when the user double-clicks it inside the builder canvas.
 *
 * Usage in CanvasBlockRenderer:
 *
 *   <InlineTextField
 *     blockId={block.id}
 *     propKey="title"
 *     propKeyAr="titleAr"
 *     value={props.title}
 *     valueAr={props.titleAr}
 *     tag="h1"
 *     className="font-heading text-4xl font-bold text-white"
 *     placeholder="Enter title…"
 *   />
 *
 * Rules:
 *   - Double-click activates editing for this specific field
 *   - Enter (no shift) or blur commits the value
 *   - Escape cancels (reverts to original)
 *   - Propagation is stopped so the block wrapper's dbl-click doesn't fire
 *   - The rendered element keeps ALL its CSS classes — it looks the same while editing
 *   - When propKeyAr is provided, an EN/AR toggle badge appears on hover
 *   - The active prop key at double-click time is snapshotted into context
 */

"use client";

import React, { useRef, useCallback, useContext, createContext, useState } from "react";

// ─── Context ──────────────────────────────────────────────────────────────────

export interface InlineEditState {
  /** blockId + propKey pair that is currently being edited, or null */
  editing: { blockId: string; propKey: string } | null;
  startEditing: (blockId: string, propKey: string) => void;
  stopEditing: () => void;
  /** Called by the field when it commits a new value */
  commitEdit: (blockId: string, propKey: string, value: string) => void;
}

export const InlineEditContext = createContext<InlineEditState | null>(null);

export function useInlineEdit(): InlineEditState {
  const ctx = useContext(InlineEditContext);
  if (!ctx) throw new Error("useInlineEdit must be used inside InlineEditProvider");
  return ctx;
}

// ─── Provider (mounted in BuilderCanvas) ─────────────────────────────────────

export function InlineEditProvider({
  children,
  onCommit,
}: {
  children: React.ReactNode;
  /** Called with blockId, propKey, newValue when user confirms an edit */
  onCommit: (blockId: string, propKey: string, value: string) => void;
}) {
  const [editing, setEditing] = useState<{ blockId: string; propKey: string } | null>(null);

  const startEditing = useCallback((blockId: string, propKey: string) => {
    setEditing({ blockId, propKey });
  }, []);

  const stopEditing = useCallback(() => {
    setEditing(null);
  }, []);

  const commitEdit = useCallback((blockId: string, propKey: string, value: string) => {
    onCommit(blockId, propKey, value);
    setEditing(null);
  }, [onCommit]);

  return (
    <InlineEditContext.Provider value={{ editing, startEditing, stopEditing, commitEdit }}>
      {children}
    </InlineEditContext.Provider>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type TagName = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "a";

// ─── InlineTextField ──────────────────────────────────────────────────────────

interface InlineTextFieldProps {
  /** The block this field belongs to */
  blockId: string;
  /** The English prop key in block.props to read/write — always required */
  propKey: string;
  /** The Arabic prop key — optional; when provided, EN/AR toggle is shown */
  propKeyAr?: string;
  /** Current English display value */
  value: string;
  /** Current Arabic display value — optional; used when propKeyAr is provided */
  valueAr?: string;
  /** HTML tag to render */
  tag?: TagName;
  /** CSS classes applied to the element in BOTH view and edit mode */
  className?: string;
  /** Inline styles applied to the element */
  style?: React.CSSProperties;
  /** Shown when value is empty */
  placeholder?: string;
  /** Whether to allow multi-line (Shift+Enter for newlines, Enter commits) */
  multiline?: boolean;
}

export function InlineTextField({
  blockId,
  propKey,
  propKeyAr,
  value,
  valueAr,
  tag: Tag = "span",
  className = "",
  style,
  placeholder = "Click to edit…",
  multiline = false,
}: InlineTextFieldProps) {
  const { editing, startEditing, stopEditing, commitEdit } = useInlineEdit();
  const ref = useRef<HTMLElement>(null);
  const originalValue = useRef(value);

  // ── Internal language state ────────────────────────────────────────────────
  const [activeLang, setActiveLang] = useState<"en" | "ar">("en");

  // Derive active key and value from the current language selection
  const activeKey = activeLang === "ar" && propKeyAr ? propKeyAr : propKey;
  const activeValue = activeLang === "ar" && valueAr ? valueAr : value;

  const isEditing =
    editing?.blockId === blockId && editing?.propKey === activeKey;

  // When entering edit mode, snapshot activeValue (not value) and record the
  // active key so commits always target the key that was live at double-click time.
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      originalValue.current = activeValue;
      startEditing(blockId, activeKey);
      // Focus after React re-renders
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.focus();
          // Place cursor at end
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(ref.current);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      });
    },
    [blockId, activeKey, activeValue, startEditing]
  );

  // Use activeKey (snapshotted at double-click time via context) to commit
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      const newValue = e.currentTarget.textContent ?? "";
      commitEdit(blockId, activeKey, newValue);
    },
    [blockId, activeKey, commitEdit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        // Restore original text without triggering blur commit
        if (ref.current) ref.current.textContent = originalValue.current;
        stopEditing();
        return;
      }
      if (e.key === "Enter") {
        if (!multiline || !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          (e.currentTarget as HTMLElement).blur(); // triggers handleBlur → commit
        }
      }
    },
    [multiline, stopEditing]
  );

  // ── View mode (not editing) ───────────────────────────────────────────────
  if (!isEditing) {
    const displayValue = activeValue || placeholder;
    const isEmpty = !activeValue;

    return (
      <span className="relative group/inline pointer-events-auto">
        {/* EN/AR toggle badge — only shown when propKeyAr is provided and not editing */}
        {propKeyAr && (
          <span
            className="absolute -top-5 right-0 flex gap-0.5 opacity-0 group-hover/inline:opacity-100 transition-opacity z-20"
            style={{ fontSize: "9px" }}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveLang("en"); }}
              className={`px-1 py-0.5 rounded text-[9px] font-medium border ${
                activeLang === "en"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-500 border-gray-300"
              }`}
            >EN</button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveLang("ar"); }}
              className={`px-1 py-0.5 rounded text-[9px] font-medium border ${
                activeLang === "ar"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-500 border-gray-300"
              }`}
            >AR</button>
          </span>
        )}
        <Tag
          className={`${className} ${isEmpty ? "opacity-40 italic" : ""} group-hover/inline:outline-dashed group-hover/inline:outline-1 group-hover/inline:outline-blue-300 group-hover/inline:outline-offset-1 rounded-[2px] cursor-text`}
          style={style}
          onDoubleClick={handleDoubleClick}
          title="Double-click to edit"
        >
          {displayValue}
        </Tag>
      </span>
    );
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  return (
    <Tag
      ref={ref as React.RefObject<never>}
      contentEditable
      suppressContentEditableWarning
      className={`${className} outline-none ring-2 ring-blue-400 ring-offset-1 rounded-[2px] min-w-[2em] cursor-text`}
      style={{ ...style, whiteSpace: multiline ? "pre-wrap" : undefined }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {activeValue}
    </Tag>
  );
}

// ─── InlineImageField ─────────────────────────────────────────────────────────
// Shows a small edit button overlay on images so the user can change the URL

export function InlineImageHint({
  blockId,
  propKey,
  onOpenPropertyPanel,
}: {
  blockId: string;
  propKey: string;
  onOpenPropertyPanel?: () => void;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10 bg-black/20 rounded cursor-pointer"
      title="Click to change image in the Property Panel"
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpenPropertyPanel?.();
      }}
    >
      <div className="bg-white text-xs font-medium text-gray-700 px-2 py-1 rounded shadow">
        🖼 Change image
      </div>
    </div>
  );
}
