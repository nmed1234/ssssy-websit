/**
 * PageBuilderRoot — top-level orchestrator for the page builder.
 *
 * Layout:
 *   ┌───────────┬─────────────────────────┬──────────┐
 *   │ LEFT      │ CENTER (canvas)         │ RIGHT    │
 *   │ Palette   │                         │ Property │
 *   │ Layers    │ BuilderCanvas           │ Panel    │
 *   └───────────┴─────────────────────────┴──────────┘
 *
 * DnD architecture:
 *   DndContext lives HERE (PageBuilderRoot) so that BOTH the palette sidebar
 *   AND the canvas drop zones share the same drag context.
 *   Previously DndContext was inside BuilderCanvas, making palette drags
 *   invisible to the canvas drop zones (different context boundaries).
 *
 *   Palette items use <PaletteItemDraggable> (useDraggable from @dnd-kit).
 *   Canvas drop zones use useDroppable / useSortable from @dnd-kit.
 *   handleDragEnd here routes drops to the correct handler.
 */

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Block } from "@/types/block";
import type { PageLayout } from "@/types/block";
import {
  createBlock,
  insertBlock,
  removeBlock,
  duplicateBlock,
  updateBlockProps,
  findBlock,
  findPath,
  moveBlock,
} from "@/components/page-builder/schema/tree-utils";
import { serializeLayout, emptyLayout } from "@/components/page-builder/schema/tree-utils";
import { getBlockSchema } from "@/components/page-builder/schema/block-schema";
import { BuilderCanvas, PaletteItemDraggable } from "./BuilderCanvas";
import { PropertyPanel } from "./PropertyPanel";
import { LayersPanel } from "./LayersPanel";
import { ComponentPalette } from "@/components/page-builder/ComponentPalette";

// ─── Drag data shape (must match BuilderCanvas's internal DragData type) ─────

type DragData =
  | { kind: "palette"; blockType: string }
  | { kind: "block";   id: string };

// ─── Types ────────────────────────────────────────────────────────────────────

type SidebarTab = "palette" | "layers";

/** Interface exposed to the parent via `onReady` so it can call undo/redo */
export interface PageBuilderHandle {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface PageBuilderRootProps {
  /** Initial layout — pass emptyLayout() for a new page */
  initialLayout: PageLayout;
  /** Called whenever the layout changes (use for auto-save or dirty tracking) */
  onChange?: (layout: PageLayout) => void;
  /**
   * Called once on mount and whenever canUndo/canRedo change.
   * Passes undo/redo functions and current capability flags to the parent.
   */
  onReady?: (handle: PageBuilderHandle) => void;
}

// ─── PageBuilderRoot ──────────────────────────────────────────────────────────

export function PageBuilderRoot({ initialLayout, onChange, onReady }: PageBuilderRootProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialLayout.blocks);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("palette");

  // ── Canvas zoom and device preview ───────────────────────────────────────
  const [zoom, setZoom] = useState(100);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // ── Active drag data (for DragOverlay) ───────────────────────────────────
  const [activeData, setActiveData] = useState<DragData | null>(null);

  // ── DnD sensors ──────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  // ── Undo / Redo history ───────────────────────────────────────────────────
  const historyRef = useRef<Block[][]>([initialLayout.blocks]);
  const historyIndexRef = useRef(0);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [historyLength, setHistoryLength] = useState(1);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  const notifyChange = useCallback((newBlocks: Block[]) => {
    onChange?.({ version: "1", blocks: newBlocks });
  }, [onChange]);

  const handleBlocksChange = useCallback((newBlocks: Block[]) => {
    const base = historyRef.current.slice(0, historyIndexRef.current + 1);
    const updated = [...base, newBlocks];
    const capped = updated.length > 50 ? updated.slice(updated.length - 50) : updated;
    historyRef.current = capped;
    const newIndex = capped.length - 1;
    historyIndexRef.current = newIndex;
    setHistoryIndex(newIndex);
    setHistoryLength(capped.length);
    setBlocks(newBlocks);
    notifyChange(newBlocks);
  }, [notifyChange]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const newIndex = historyIndexRef.current - 1;
    const prevBlocks = historyRef.current[newIndex];
    historyIndexRef.current = newIndex;
    setHistoryIndex(newIndex);
    setBlocks(prevBlocks);
    notifyChange(prevBlocks);
  }, [notifyChange]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const newIndex = historyIndexRef.current + 1;
    const nextBlocks = historyRef.current[newIndex];
    historyIndexRef.current = newIndex;
    setHistoryIndex(newIndex);
    setBlocks(nextBlocks);
    notifyChange(nextBlocks);
  }, [notifyChange]);

  useEffect(() => {
    onReady?.({ undo, redo, canUndo, canRedo });
  }, [onReady, undo, redo, canUndo, canRedo]);

  const handlePropsChange = useCallback((blockId: string, newProps: Record<string, unknown>) => {
    handleBlocksChange(updateBlockProps(blocks, blockId, newProps));
  }, [blocks, handleBlocksChange]);

  const handleDelete = useCallback((blockId: string) => {
    const { blocks: newBlocks } = removeBlock(blocks, blockId);
    handleBlocksChange(newBlocks);
    if (selectedId === blockId) setSelectedId(null);
  }, [blocks, selectedId, handleBlocksChange]);

  const handleDuplicate = useCallback((blockId: string) => {
    handleBlocksChange(duplicateBlock(blocks, blockId));
  }, [blocks, handleBlocksChange]);

  // ── Palette click-to-add (no drag involved) ───────────────────────────────
  const handlePaletteAdd = useCallback((type: string) => {
    const newBlock = createBlock(type);
    const target = selectedId ? findBlock(blocks, selectedId) : null;
    let newBlocks: Block[];
    if (target && getBlockSchema(target.type).isContainer) {
      newBlocks = insertBlock(blocks, target.id, (target.children?.length ?? 0), newBlock);
    } else {
      newBlocks = [...blocks, newBlock];
    }
    handleBlocksChange(newBlocks);
    setSelectedId(newBlock.id);
  }, [blocks, selectedId, handleBlocksChange]);

  // ── DnD handlers (owned here so palette is inside the same context) ───────

  function handleDragStart(e: DragStartEvent) {
    setActiveData((e.active.data.current as DragData | undefined) ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveData(null);
    const { active, over } = e;
    if (!over) return;

    const dragData = active.data.current as DragData | undefined;
    const dropData = over.data.current as { parentId: string; index: number; kind?: string } | undefined;
    if (!dragData) return;

    if (dragData.kind === "palette") {
      // Drop from palette → insert new block at target position
      const parentId: string = dropData?.parentId ?? "__root__";
      const index: number    = dropData?.index    ?? blocks.length;
      const newBlock = createBlock(dragData.blockType);
      const newBlocks = insertBlock(blocks, parentId, index, newBlock);
      handleBlocksChange(newBlocks);
      setSelectedId(newBlock.id);
      return;
    }

    if (dragData.kind === "block") {
      // Reorder existing block
      if (dragData.id === dropData?.parentId) return;
      const parentId: string = dropData?.parentId ?? "__root__";
      const index: number    = dropData?.index    ?? blocks.length;
      handleBlocksChange(moveBlock(blocks, dragData.id, parentId, index));
      return;
    }
  }

  const selectedBlock = selectedId ? findBlock(blocks, selectedId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full overflow-hidden">
        {/* ── Left sidebar ── */}
        <div className="flex flex-col w-56 border-r bg-white flex-shrink-0 min-h-0">
          {/* Tab switcher */}
          <div className="flex border-b flex-shrink-0">
            <button
              type="button"
              onClick={() => setSidebarTab("palette")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                sidebarTab === "palette" ? "bg-soil-dark text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Components
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab("layers")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                sidebarTab === "layers" ? "bg-soil-dark text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Layers
            </button>
          </div>

          {/* Panel content — ComponentPalette is INSIDE DndContext so its
              PaletteItemDraggable wrappers connect to the same drag context
              as the canvas drop zones */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {sidebarTab === "palette" ? (
              <ComponentPalette onAdd={handlePaletteAdd} PaletteWrapper={PaletteItemDraggable} />
            ) : (
              <LayersPanel
                blocks={blocks}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onBlocksChange={handleBlocksChange}
              />
            )}
          </div>
        </div>

        {/* ── Center canvas ── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <BuilderCanvas
            blocks={blocks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onBlocksChange={handleBlocksChange}
            zoom={zoom}
            setZoom={setZoom}
            device={device}
            setDevice={setDevice}
            activeData={activeData}
          />
        </div>

        {/* ── Right property panel ── */}
        <PropertyPanel
          block={selectedBlock}
          onPropsChange={(id, newProps) => handlePropsChange(id, newProps as Record<string, unknown>)}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      </div>

      {/* Drag overlay — renders a floating ghost while dragging */}
      <DragOverlay>
        {activeData?.kind === "palette" && (
          <div className="bg-white border-2 border-blue-400 rounded px-3 py-2 text-xs font-medium shadow-lg">
            + {activeData.blockType}
          </div>
        )}
        {activeData?.kind === "block" && (
          <div className="bg-white border-2 border-blue-400 rounded px-3 py-2 text-xs font-medium shadow-lg opacity-80">
            Moving block…
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Exported helpers for parent pages ────────────────────────────────────────

/** Serialises a PageLayout to the JSON string stored in pages.layout_json */
export { serializeLayout };
/** Creates an empty layout (used for new pages) */
export { emptyLayout };
