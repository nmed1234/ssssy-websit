"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, GripVertical, Trash2, Copy, Eye, EyeOff, Plus } from "lucide-react";
import type { PageSection } from "@/types";

interface ComponentTreePanelProps {
  sections: PageSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

function componentTypeLabel(type: string): string {
  return type
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function componentTypeIcon(type: string): string {
  if (type.includes("hero")) return "🖼";
  if (type.includes("gallery")) return "📷";
  if (type.includes("text") || type.includes("paragraph")) return "📝";
  if (type.includes("video")) return "🎬";
  if (type.includes("form") || type.includes("contact")) return "📋";
  if (type.includes("team") || type.includes("board")) return "👥";
  if (type.includes("news") || type.includes("blog")) return "📰";
  if (type.includes("event")) return "📅";
  if (type.includes("map")) return "🗺";
  if (type.includes("cta")) return "🚀";
  if (type.includes("stats")) return "📊";
  if (type.includes("faq")) return "❓";
  if (type.includes("spacer") || type.includes("divider")) return "—";
  return "⬛";
}

export function ComponentTreePanel({
  sections,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onReorder,
}: ComponentTreePanelProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed(next);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      onReorder(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Component Tree ({sections.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sections.length === 0 ? (
          <div className="p-4 text-center">
            <Plus className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No components yet. Add from the palette.</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {sections.map((section, index) => (
              <TreeNode
                key={section.id}
                section={section}
                index={index}
                isSelected={selectedId === section.id}
                isDragging={dragIndex === index}
                isDragOver={dragOverIndex === index}
                isCollapsed={collapsed.has(section.id)}
                onSelect={() => onSelect(section.id)}
                onDelete={() => onDelete(section.id)}
                onDuplicate={() => onDuplicate(section.id)}
                onToggleVisibility={() => onToggleVisibility(section.id)}
                onToggleCollapse={() => toggleCollapse(section.id)}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary footer */}
      <div className="px-3 py-2 border-t bg-gray-50 text-xs text-gray-400">
        {sections.filter((s) => s.visibility !== "HIDDEN").length} visible •{" "}
        {sections.filter((s) => s.visibility === "HIDDEN").length} hidden
      </div>
    </div>
  );
}

interface TreeNodeProps {
  section: PageSection;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onToggleCollapse: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function TreeNode({
  section, index, isSelected, isDragging, isDragOver, isCollapsed,
  onSelect, onDelete, onDuplicate, onToggleVisibility, onToggleCollapse,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: TreeNodeProps) {
  const isHidden = section.visibility === "HIDDEN";
  const label = (section.data as any)?.title || (section.data as any)?.heading || componentTypeLabel(section.componentType);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`rounded-md transition-all ${
        isDragOver ? "border-t-2 border-soil-dark" : ""
      } ${isDragging ? "opacity-40" : ""}`}
    >
      <div
        onClick={onSelect}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${
          isSelected
            ? "bg-soil-dark text-white"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        {/* Drag handle */}
        <div
          className={`cursor-grab active:cursor-grabbing flex-shrink-0 opacity-30 group-hover:opacity-70 ${isSelected ? "opacity-70" : ""}`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3" />
        </div>

        {/* Expand/collapse toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
          className="flex-shrink-0 opacity-50 hover:opacity-100"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* Icon + Label */}
        <span className="flex-shrink-0 text-sm">{componentTypeIcon(section.componentType)}</span>
        <span className="flex-1 text-xs font-medium truncate" title={label}>
          {label}
        </span>

        {/* Index badge */}
        <span className={`flex-shrink-0 text-[10px] px-1 rounded ${isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>
          {index + 1}
        </span>

        {/* Actions (shown on hover or selected) */}
        <div className={`flex-shrink-0 flex items-center gap-0.5 ${isSelected ? "visible" : "invisible group-hover:visible"}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
            className={`p-0.5 rounded hover:opacity-80 ${isSelected ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
            title={isHidden ? "Show" : "Hide"}
          >
            {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className={`p-0.5 rounded hover:opacity-80 ${isSelected ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
            title="Duplicate"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className={`p-0.5 rounded hover:opacity-80 ${isSelected ? "text-red-300 hover:text-red-100" : "text-gray-400 hover:text-red-500"}`}
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expanded: show properties preview */}
      {!isCollapsed && isSelected && (
        <div className="ml-8 mt-0.5 p-2 bg-soil-dark/5 rounded text-[10px] text-gray-500 border-l-2 border-soil-dark/20">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium text-gray-600">Type:</span>
            <span className="font-mono text-gray-700">{section.componentType}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-600">Visibility:</span>
            <span className={isHidden ? "text-red-500" : "text-green-600"}>{section.visibility || "ALWAYS"}</span>
          </div>
          {(section.version ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-600">Version:</span>
              <span>{section.version}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
