/**
 * LayersPanel — tree view of the full block hierarchy.
 *
 * Shows the nested block tree on the left sidebar "Layers" tab.
 * Features:
 *   - Click to select
 *   - Collapse / expand containers
 *   - Visibility toggle (eye icon)
 *   - Duplicate and delete via hover icons
 *   - Synced with canvas selection (selected block is highlighted)
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ChevronRight, ChevronDown, Eye, EyeOff, Copy, Trash2,
} from "lucide-react";
import type { Block } from "@/types/block";
import { getBlockSchema } from "@/components/page-builder/schema/block-schema";
import {
  removeBlock,
  duplicateBlock,
  updateBlockProps,
} from "@/components/page-builder/schema/tree-utils";

interface LayersPanelProps {
  blocks: Block[];
  selectedId: string | null;
  onSelect:       (id: string) => void;
  onBlocksChange: (blocks: Block[]) => void;
}

export function LayersPanel({
  blocks,
  selectedId,
  onSelect,
  onBlocksChange,
}: LayersPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto py-1">
      {blocks.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6 px-3">
          No blocks yet.<br />Drag from Components to start.
        </p>
      ) : (
        <LayerList
          blocks={blocks}
          allBlocks={blocks}
          selectedId={selectedId}
          onSelect={onSelect}
          onBlocksChange={onBlocksChange}
          depth={0}
        />
      )}
    </div>
  );
}

// ─── LayerList ────────────────────────────────────────────────────────────────

function LayerList({
  blocks,
  allBlocks,
  selectedId,
  onSelect,
  onBlocksChange,
  depth,
}: {
  blocks: Block[];
  allBlocks: Block[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBlocksChange: (blocks: Block[]) => void;
  depth: number;
}) {
  return (
    <>
      {blocks.map((block) => (
        <LayerNode
          key={block.id}
          block={block}
          allBlocks={allBlocks}
          selectedId={selectedId}
          onSelect={onSelect}
          onBlocksChange={onBlocksChange}
          depth={depth}
        />
      ))}
    </>
  );
}

// ─── LayerNode ────────────────────────────────────────────────────────────────

function LayerNode({
  block,
  allBlocks,
  selectedId,
  onSelect,
  onBlocksChange,
  depth,
}: {
  block: Block;
  allBlocks: Block[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBlocksChange: (blocks: Block[]) => void;
  depth: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const schema = getBlockSchema(block.type);
  const hasChildren = schema.isContainer && (block.children?.length ?? 0) > 0;
  const isSelected = selectedId === block.id;
  const isHidden = block.props.visibility === "HIDDEN";

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  const label =
    String(
      block.props.titleEn ||
      block.props.title ||
      block.props.text ||
      block.props.textEn ||
      block.props.label ||
      ""
    ).slice(0, 24) || schema.label;

  const handleDelete = useCallback(() => {
    const { blocks: next } = removeBlock(allBlocks, block.id);
    onBlocksChange(next);
  }, [allBlocks, block.id, onBlocksChange]);

  const handleDuplicate = useCallback(() => {
    onBlocksChange(duplicateBlock(allBlocks, block.id));
  }, [allBlocks, block.id, onBlocksChange]);

  const toggleVisibility = useCallback(() => {
    const current = block.props.visibility;
    const next = current === "HIDDEN" ? "ALWAYS" : "HIDDEN";
    onBlocksChange(updateBlockProps(allBlocks, block.id, { visibility: next }));
  }, [allBlocks, block.id, block.props.visibility, onBlocksChange]);

  return (
    <div>
      {/* Row */}
      <div
        ref={nodeRef}
        className={`group flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors ${
          isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
        }`}
        style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
        onClick={() => onSelect(block.id)}
      >
        {/* Collapse toggle */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
            className="text-gray-400 hover:text-gray-700 flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}

        {/* Icon */}
        <span className="text-sm flex-shrink-0">{schema.icon}</span>

        {/* Label */}
        <span className={`text-xs flex-1 truncate ${isHidden ? "opacity-40 line-through" : ""}`}>
          {label}
        </span>

        {/* Hover actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            type="button"
            title={isHidden ? "Show" : "Hide"}
            onClick={(e) => { e.stopPropagation(); toggleVisibility(); }}
            className="p-0.5 text-gray-400 hover:text-gray-700"
          >
            {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button
            type="button"
            title="Duplicate"
            onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}
            className="p-0.5 text-gray-400 hover:text-gray-700"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="p-0.5 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Children */}
      {!collapsed && hasChildren && (
        <LayerList
          blocks={block.children!}
          allBlocks={allBlocks}
          selectedId={selectedId}
          onSelect={onSelect}
          onBlocksChange={onBlocksChange}
          depth={depth + 1}
        />
      )}
    </div>
  );
}
