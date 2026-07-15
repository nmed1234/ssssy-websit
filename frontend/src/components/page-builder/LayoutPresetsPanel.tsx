/**
 * LayoutPresetsPanel — floating card that lets an editor insert a pre-built
 * multi-block layout with a single click.
 *
 * The panel is NOT a modal; it is anchored below the "+ Layout" button and
 * closes on outside mousedown or Escape key.
 *
 * Requirements: 4.2, 4.3, 4.4, 4.6
 */

"use client";

import React, { useEffect, useRef } from "react";
import type { Block } from "@/types/block";
import { createBlock } from "@/components/page-builder/schema/tree-utils";

// ─── Preset definitions ────────────────────────────────────────────────────────

export interface LayoutPreset {
  id: string;
  label: string;
  icon: string;
  build: () => Block[];
}

// Each build() calls createBlock() fresh so every invocation yields new UUIDs.
// (REQ-4.4: unique IDs via generateId)

function build2Col(): Block[] {
  const row = createBlock("row");
  const col1 = createBlock("column");
  const col2 = createBlock("column");
  row.children = [col1, col2];
  return [row];
}

function build3Col(): Block[] {
  const row = createBlock("row");
  const col1 = createBlock("column");
  const col2 = createBlock("column");
  const col3 = createBlock("column");
  row.children = [col1, col2, col3];
  return [row];
}

function buildFullWidth(): Block[] {
  const section = createBlock("section");
  section.children = [];
  return [section];
}

function buildHeroText(): Block[] {
  const hero = createBlock("hero");
  const section = createBlock("section");
  const para = createBlock("paragraph");
  section.children = [para];
  return [hero, section];
}

function build2ColImg(): Block[] {
  const row = createBlock("row");
  const imgCol = createBlock("column");
  const img = createBlock("image");
  imgCol.children = [img];
  const textCol = createBlock("column");
  const para = createBlock("paragraph");
  textCol.children = [para];
  row.children = [imgCol, textCol];
  return [row];
}

function build4Card(): Block[] {
  const group = createBlock("card-group");
  const cards = [
    createBlock("card"),
    createBlock("card"),
    createBlock("card"),
    createBlock("card"),
  ];
  group.children = cards;
  return [group];
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  { id: "2-col",      label: "2 Columns",           icon: "⎢ ⎢",   build: build2Col },
  { id: "3-col",      label: "3 Columns",           icon: "⎢ ⎢ ⎢", build: build3Col },
  { id: "full-width", label: "Full Width Section",  icon: "▭",      build: buildFullWidth },
  { id: "hero-text",  label: "Hero + Text",         icon: "🎯 ¶",   build: buildHeroText },
  { id: "2-col-img",  label: "Image + Text",        icon: "🖼 ¶",   build: build2ColImg },
  { id: "4-card",     label: "4-Card Grid",         icon: "▣▣▣▣",  build: build4Card },
];

// ─── Component ────────────────────────────────────────────────────────────────

export interface LayoutPresetsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (blocks: Block[]) => void;
}

export function LayoutPresetsPanel({ isOpen, onClose, onInsert }: LayoutPresetsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside mousedown (REQ-4.6)
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onClose]);

  // Close on Escape key (REQ-4.6)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-64"
      role="dialog"
      aria-label="Layout presets"
    >
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
        Insert Layout
      </p>
      <div className="grid grid-cols-2 gap-2">
        {LAYOUT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onInsert(preset.build())}
            className="flex flex-col items-center gap-1 p-2 rounded-md border border-gray-200 hover:border-soil-dark hover:bg-soil-light/10 transition-colors text-center cursor-pointer"
            title={preset.label}
          >
            <span className="text-lg leading-none">{preset.icon}</span>
            <span className="text-xs text-gray-600 leading-tight">{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
