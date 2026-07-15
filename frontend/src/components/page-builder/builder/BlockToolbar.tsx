/**
 * BlockToolbar — the floating toolbar that appears when hovering / selecting a block.
 *
 * It is rendered as an absolutely-positioned overlay on top of the block in the canvas.
 * The parent (BuilderCanvas) positions it by wrapping each block in `position: relative`.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { GripVertical, Copy, Trash2, Plus, MoreHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getBlockSchema } from "@/components/page-builder/schema/block-schema";
import { useAuth } from "@/lib/auth-context";
import { InlineComponentPicker } from "./InlineComponentPicker";
import type { Block } from "@/types/block";

interface BlockToolbarProps {
  blockId: string;
  blockType: string;
  /** Full block object — needed for Save as Preset */
  block?: Block;
  isSelected: boolean;
  /** Position the toolbar at the top (default) or bottom */
  position?: "top" | "bottom";
  onSelect:    () => void;
  onDuplicate: () => void;
  onDelete:    () => void;
  /** Provided only for container blocks — called with the chosen block type */
  onAddChild?: (type: string) => void;
  onSaveAsPreset?: () => void;
  /** dnd-kit drag handle attributes — spread onto the drag-handle button */
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

// ─── SaveAsPresetPopover ──────────────────────────────────────────────────────

interface SaveAsPresetPopoverProps {
  block: Block;
  onClose: () => void;
}

function SaveAsPresetPopover({ block, onClose }: SaveAsPresetPopoverProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  async function handleConfirm() {
    if (!nameEn.trim()) {
      toast.error("Please enter a name (EN)");
      return;
    }
    setSaving(true);
    try {
      const token = user?.accessToken;
      const body = {
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim(),
        componentType: block.type,
        configJson: {},
        dataJson: { ...block.props, children: block.children },
        stylingJson: {},
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "/api"}/component-presets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `HTTP ${res.status}`);
      }
      toast.success("Preset saved!");
      await queryClient.invalidateQueries({ queryKey: ["component-presets"] });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      toast.error(`Failed to save preset: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-[11px] font-semibold text-gray-700 mb-2">Save as Preset</p>

      {/* Name EN */}
      <div className="mb-2">
        <label className="block text-[10px] text-gray-500 mb-0.5">Name (EN)</label>
        <input
          type="text"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="e.g. Hero with Button"
          className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          dir="ltr"
          autoFocus
        />
      </div>

      {/* Name AR */}
      <div className="mb-3">
        <label className="block text-[10px] text-gray-500 mb-0.5">Name (AR)</label>
        <input
          type="text"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          placeholder="مثال: قسم بطولي مع زر"
          className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
          dir="rtl"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-2.5 py-1 text-[10px] rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving}
          className="px-2.5 py-1 text-[10px] rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Confirm"}
        </button>
      </div>
    </div>
  );
}

// ─── MoreOptionsMenu ──────────────────────────────────────────────────────────

interface MoreOptionsMenuProps {
  block: Block;
  onClose: () => void;
  onOpenPresetForm: () => void;
}

function MoreOptionsMenu({ onClose, onOpenPresetForm }: MoreOptionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[140px]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
          onOpenPresetForm();
        }}
      >
        💾 Save as Preset
      </button>
    </div>
  );
}

// ─── BlockToolbar ─────────────────────────────────────────────────────────────

export function BlockToolbar({
  blockId,
  blockType,
  block,
  isSelected,
  position = "top",
  onSelect,
  onDuplicate,
  onDelete,
  onAddChild,
  dragHandleProps,
}: BlockToolbarProps) {
  const schema = getBlockSchema(blockType);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [presetFormOpen, setPresetFormOpen] = useState(false);

  // Synthetic block for cases where the full block wasn't passed
  const effectiveBlock: Block = block ?? {
    id: blockId,
    type: blockType,
    props: {},
  };

  const isContainer = schema.isContainer && !!onAddChild;

  return (
    <div
      className={`absolute ${position === "top" ? "top-0" : "bottom-0"} left-0 right-0 z-30 flex items-center justify-between px-1.5 py-0.5
        ${isSelected
          ? "opacity-100 bg-blue-600"
          : "opacity-0 group-hover:opacity-100 bg-gray-700/80"
        }
        transition-opacity pointer-events-auto`}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {/* Left: drag handle + type label */}
      <div className="flex items-center gap-1 min-w-0">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-white/70 hover:text-white p-0.5"
          title="Drag to move"
          onClick={(e) => e.stopPropagation()}
          {...dragHandleProps}
        >
          <GripVertical className="w-3 h-3" />
        </button>
        <span className="text-[10px] font-mono text-white/80 truncate">
          {schema.icon} {schema.label}
        </span>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-0.5">
        {/* "+ Add" button — only for containers */}
        {isContainer && (
          <div className="relative">
            <button
              type="button"
              title="Add child component"
              onClick={(e) => {
                e.stopPropagation();
                setPickerOpen((prev) => !prev);
              }}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                pickerOpen
                  ? "bg-white text-blue-700"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>

            {pickerOpen && (
              <InlineComponentPicker
                onSelect={(type) => {
                  onAddChild(type);
                  setPickerOpen(false);
                }}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        )}

        <button
          type="button"
          title="Duplicate"
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="p-0.5 text-white/70 hover:text-white"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          type="button"
          title="Delete"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-0.5 text-white/70 hover:text-red-300"
        >
          <Trash2 className="w-3 h-3" />
        </button>

        {/* ⋯ More options button */}
        <div className="relative">
          <button
            type="button"
            title="More options"
            onClick={(e) => {
              e.stopPropagation();
              setMoreMenuOpen((prev) => !prev);
              setPresetFormOpen(false);
            }}
            className={`p-0.5 rounded transition-colors ${
              moreMenuOpen || presetFormOpen
                ? "text-white bg-white/20"
                : "text-white/70 hover:text-white"
            }`}
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>

          {/* More options popover menu */}
          {moreMenuOpen && (
            <MoreOptionsMenu
              block={effectiveBlock}
              onClose={() => setMoreMenuOpen(false)}
              onOpenPresetForm={() => setPresetFormOpen(true)}
            />
          )}

          {/* Save as Preset inline form */}
          {presetFormOpen && (
            <SaveAsPresetPopover
              block={effectiveBlock}
              onClose={() => setPresetFormOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
