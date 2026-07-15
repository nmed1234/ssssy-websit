"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { COMPONENT_CATEGORIES } from "@/components/page-builder/ComponentPalette";

interface InlineComponentPickerProps {
  onSelect: (blockType: string) => void;
  onClose: () => void;
}

/**
 * InlineComponentPicker — compact floating dropdown (200px wide) that lists
 * all block types from COMPONENT_CATEGORIES, grouped by category.
 * Appears below the "+ Add" button in BlockToolbar.
 */
export function InlineComponentPicker({ onSelect, onClose }: InlineComponentPickerProps) {
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Use capture so we catch the event before it reaches overlay handlers
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const q = search.toLowerCase().trim();
  const filtered = COMPONENT_CATEGORIES.map((cat) => ({
    ...cat,
    items: q
      ? cat.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
        )
      : cat.items,
  })).filter((cat) => cat.items.length > 0);

  return (
    <div
      ref={containerRef}
      // Stop click / pointer events from bubbling to canvas (which would deselect)
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{ width: 200 }}
      className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b bg-gray-50 flex-shrink-0">
        <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
          Add Component
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-0.5 text-gray-400 hover:text-gray-700 rounded"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 border-b flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            autoFocus
            className="w-full pl-6 pr-2 py-1 text-[11px] rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Categories + items */}
      <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
        {filtered.length === 0 ? (
          <p className="text-[11px] text-gray-400 text-center py-3">No matches</p>
        ) : (
          filtered.map((cat) => (
            <div key={cat.name}>
              <div className="px-2 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100 sticky top-0">
                {cat.label}
              </div>
              {cat.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item.type);
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-left transition-colors"
                >
                  <span className="w-4 text-center text-sm shrink-0 leading-none">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
