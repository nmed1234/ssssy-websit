/**
 * BuilderCanvas — the editing canvas for the page builder.
 *
 * Renders each block using the real BlockRenderer (same output as the public
 * page), then layers a transparent selection/drag overlay on top with
 * pointer-events controlled so clicks reach the overlay, not the content.
 *
 * Editing interactions:
 *   - Click any block → selects it (blue ring) + loads PropertyPanel
 *   - Double-click leaf block → InlineTextField handles inline edit activation
 *   - Double-click container → drills down (BreadcrumbNav updates)
 *   - Drag handle on toolbar → reorders via @dnd-kit
 *   - Drag from palette + drop onto a DropZone → inserts new block
 */

"use client";

import React, {
  useCallback,
  useState,
  createContext,
  useContext,
} from "react";
import {
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Block } from "@/types/block";
import { getBlockSchema } from "@/components/page-builder/schema/block-schema";
import {
  createBlock,
  moveBlock,
  insertBlock,
  removeBlock,
  duplicateBlock,
  updateBlockProps,
} from "@/components/page-builder/schema/tree-utils";
import { BuilderModeProvider } from "@/components/page-builder/BuilderModeContext";
import { LayoutPresetsPanel } from "@/components/page-builder/LayoutPresetsPanel";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { BlockToolbar } from "./BlockToolbar";
import { CanvasBlockRenderer } from "./CanvasBlockRenderer";
import { InlineEditProvider, useInlineEdit } from "./InlineTextField";
import { InlineLeafRenderer } from "./InlineLeafRenderer";

// ─── Canvas context ───────────────────────────────────────────────────────────

interface CanvasContextValue {
  blocks: Block[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onBlocksChange: (blocks: Block[]) => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

function useCanvas() {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used inside BuilderCanvas");
  return ctx;
}

// ─── Drag-data shapes ─────────────────────────────────────────────────────────

type DragData =
  | { kind: "palette"; blockType: string }
  | { kind: "block";   id: string };

// ─── BuilderCanvas ────────────────────────────────────────────────────────────

export interface BuilderCanvasProps {
  blocks: Block[];
  selectedId: string | null;
  onSelect:       (id: string | null) => void;
  onBlocksChange: (blocks: Block[]) => void;
  zoom?: number;
  setZoom?: (zoom: number) => void;
  device?: "desktop" | "tablet" | "mobile";
  setDevice?: (device: "desktop" | "tablet" | "mobile") => void;
  /** Active drag item — provided by the parent DndContext in PageBuilderRoot */
  activeData?: DragData | null;
}

export function BuilderCanvas({
  blocks,
  selectedId,
  onSelect,
  onBlocksChange,
  zoom = 100,
  setZoom,
  device = "desktop",
  setDevice,
  activeData = null,
}: BuilderCanvasProps) {
  const [navPath, setNavPath] = useState<string[]>([]);
  const [presetsOpen, setPresetsOpen] = useState(false);

  const ZOOM_PRESETS = [50, 75, 100, 125, 150];

  const ctxValue: CanvasContextValue = {
    blocks,
    selectedId,
    setSelectedId: onSelect,
    onBlocksChange,
  };

  return (
    <InlineEditProvider onCommit={(blockId, propKey, value) => {
      onBlocksChange(updateBlockProps(blocks, blockId, { [propKey]: value }));
    }}>
    <BuilderModeProvider>
    <CanvasContext.Provider value={ctxValue}>
        <div className="flex flex-col h-full overflow-hidden bg-gray-100">
          {/* Breadcrumb */}
          <BreadcrumbNav
            blocks={blocks}
            path={navPath}
            onNavigate={(id) => {
              if (id === null) { setNavPath([]); onSelect(null); }
              else {
                const idx = navPath.indexOf(id);
                setNavPath(navPath.slice(0, idx + 1));
                onSelect(id);
              }
            }}
          />

          {/* ── Zoom & Device toolbar ─────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b bg-white flex-shrink-0 gap-4">
            {/* + Layout button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPresetsOpen(true)}
                className="px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors bg-white border text-gray-600 hover:bg-gray-50"
                title="Insert a layout preset"
              >
                + Layout
              </button>
              <LayoutPresetsPanel
                isOpen={presetsOpen}
                onClose={() => setPresetsOpen(false)}
                onInsert={(presetBlocks) => {
                  onBlocksChange([...blocks, ...presetBlocks]);
                  onSelect(presetBlocks[0].id);
                  setPresetsOpen(false);
                }}
              />
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoom?.(Math.max(25, zoom - 25))}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold text-sm"
                title="Zoom out"
              >
                −
              </button>
              <span className="text-xs font-mono text-gray-700 w-10 text-center">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom?.(Math.min(200, zoom + 25))}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold text-sm"
                title="Zoom in"
              >
                +
              </button>
              <select
                value={ZOOM_PRESETS.includes(zoom) ? zoom : ""}
                onChange={(e) => { if (e.target.value) setZoom?.(Number(e.target.value)); }}
                className="ml-1 text-xs border rounded px-1 py-0.5 bg-white text-gray-600"
                title="Zoom preset"
              >
                {!ZOOM_PRESETS.includes(zoom) && (
                  <option value="" disabled>{zoom}%</option>
                )}
                {ZOOM_PRESETS.map((p) => (
                  <option key={p} value={p}>{p}%</option>
                ))}
              </select>
            </div>

            {/* Device preview buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDevice?.("desktop")}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
                  device === "desktop"
                    ? "bg-soil-dark text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
                title="Desktop (full width)"
              >
                🖥 Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice?.("tablet")}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
                  device === "tablet"
                    ? "bg-soil-dark text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
                title="Tablet (768px)"
              >
                □ Tablet
              </button>
              <button
                type="button"
                onClick={() => setDevice?.("mobile")}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
                  device === "mobile"
                    ? "bg-soil-dark text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
                title="Mobile (375px)"
              >
                □ Mobile
              </button>
            </div>
          </div>

          {/* Canvas scroll area */}
          <div
            className="flex-1 bg-gray-100 py-6 px-8"
            style={{ overflow: "auto" }}
            onClick={() => { onSelect(null); }}
          >
            {/* Zoom wrapper */}
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              {/* Device constraint wrapper */}
              <div
                className="max-w-5xl mx-auto"
                style={{
                  width: device === "desktop" ? "100%" : device === "tablet" ? "768px" : "375px",
                  margin: device !== "desktop" ? "0 auto" : undefined,
                  border: device !== "desktop" ? "1px solid #e5e7eb" : undefined,
                  borderRadius: device !== "desktop" ? "12px" : undefined,
                  overflow: device !== "desktop" ? "hidden" : undefined,
                }}
              >
                {blocks.length === 0 ? (
                  <EmptyRootDropZone />
                ) : (
                  <BlockList
                    blocks={blocks}
                    parentId="__root__"
                    depth={0}
                    onBreadcrumb={(b) => { setNavPath((p) => [...p, b.id]); onSelect(b.id); }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

    </CanvasContext.Provider>
    </BuilderModeProvider>
    </InlineEditProvider>
  );
}

// ─── EmptyRootDropZone ────────────────────────────────────────────────────────

function EmptyRootDropZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: "root-empty",
    data: { parentId: "__root__", index: 0, kind: "dropzone" },
  });
  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-xl p-20 text-center transition-colors ${
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
      }`}
    >
      <p className="text-sm text-gray-400 mb-1">Drag components here to build your page</p>
      <p className="text-xs text-gray-300">Drop from the left panel, or click a component to add it</p>
    </div>
  );
}

// ─── BlockList ────────────────────────────────────────────────────────────────

function BlockList({
  blocks,
  parentId,
  depth,
  onBreadcrumb,
}: {
  blocks: Block[];
  parentId: string | "__root__";
  depth: number;
  onBreadcrumb: (b: Block) => void;
}) {
  return (
    <div>
      <InnerDropZone parentId={parentId} index={0} label={`${parentId}-0`} />
      {blocks.map((block, i) => (
        <React.Fragment key={block.id}>
          <BlockWrapper
            block={block}
            parentId={parentId}
            index={i}
            depth={depth}
            onBreadcrumb={onBreadcrumb}
          />
          <InnerDropZone parentId={parentId} index={i + 1} label={`${parentId}-${i + 1}`} />
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── InnerDropZone ────────────────────────────────────────────────────────────

function InnerDropZone({
  parentId,
  index,
  label,
}: {
  parentId: string | "__root__";
  index: number;
  label: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `dz-${label}`,
    data: { parentId, index, kind: "dropzone" },
  });
  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-100 rounded ${
        isOver ? "h-8 bg-blue-100 border-2 border-dashed border-blue-400 my-1" : "h-1"
      }`}
    />
  );
}

// ─── BlockWrapper ─────────────────────────────────────────────────────────────
/**
 * Wraps a block with:
 *
 * For CONTAINER blocks:
 *   1. CanvasBlockRenderer — renders the visual shell with children inline via renderChildren
 *   2. Selection ring via ring-* classes on the wrapper
 *   3. BlockToolbar (appears on hover / when selected)
 *
 * For LEAF blocks:
 *   1. InlineLeafRenderer — renders BlockRenderer base + InlineTextField overlay
 *   2. A transparent click/drag overlay (hidden when this block is actively being edited)
 *   3. Selection ring via ring-* classes on the wrapper
 *   4. BlockToolbar (hidden during active editing)
 */
function BlockWrapper({
  block,
  parentId,
  index,
  depth,
  onBreadcrumb,
}: {
  block: Block;
  parentId: string | "__root__";
  index: number;
  depth: number;
  onBreadcrumb: (b: Block) => void;
}) {
  const {
    blocks,
    selectedId,
    setSelectedId,
    onBlocksChange,
  } = useCanvas();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { kind: "block", id: block.id } satisfies DragData,
  });

  const { editing } = useInlineEdit();
  const isActivelyEditing = editing?.blockId === block.id;

  const wrapperStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
  };

  const isSelected = selectedId === block.id;
  const isParentOfSelected =
    !isSelected &&
    !!selectedId &&
    !!(block.children?.some((c) => c.id === selectedId));
  const schema = getBlockSchema(block.type);

  const ringClasses = isSelected
    ? "ring-2 ring-blue-500 ring-offset-1"
    : isParentOfSelected
    ? "ring-1 ring-blue-200 ring-offset-1"
    : "hover:ring-1 hover:ring-blue-300 hover:ring-offset-1";

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(block.id);
  }, [block.id, setSelectedId]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(block.id);
    if (schema.isContainer) {
      onBreadcrumb(block);
    }
    // InlineTextField handles double-click activation internally for leaf blocks
  }, [block, schema.isContainer, setSelectedId, onBreadcrumb]);

  const handleDelete = useCallback(() => {
    const { blocks: next } = removeBlock(blocks, block.id);
    onBlocksChange(next);
    if (selectedId === block.id) setSelectedId(null);
  }, [blocks, block.id, onBlocksChange, selectedId, setSelectedId]);

  const handleDuplicate = useCallback(() => {
    onBlocksChange(duplicateBlock(blocks, block.id));
  }, [blocks, block.id, onBlocksChange]);

  // ── Container blocks — use CanvasBlockRenderer ──────────────────────────────
  if (schema.isContainer && !isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={wrapperStyle}
        className={`group relative mb-2 rounded-sm transition-all ${ringClasses}`}
      >
        <BlockToolbar
          blockId={block.id}
          blockType={block.type}
          block={block}
          isSelected={isSelected}
          onSelect={() => setSelectedId(block.id)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onAddChild={(type: string) => {
            const child = createBlock(type);
            const newBlocks = insertBlock(blocks, block.id, block.children?.length ?? 0, child);
            onBlocksChange(newBlocks);
            setSelectedId(child.id);
          }}
          dragHandleProps={{ ...listeners, ...attributes } as any}
        />
        <CanvasBlockRenderer
          block={block}
          onSelectSelf={(e) => { e.stopPropagation(); setSelectedId(block.id); }}
          onUpdateItems={(blockId, itemsKey, newItems) => {
            onBlocksChange(updateBlockProps(blocks, blockId, { [itemsKey]: newItems as unknown as string }));
          }}
          renderChildren={() => {
            const children = block.children ?? [];
            if (children.length === 0) {
              return <EmptyContainerDropZone containerId={block.id} />;
            }
            return (
              <BlockList
                blocks={children}
                parentId={block.id}
                depth={depth + 1}
                onBreadcrumb={onBreadcrumb}
              />
            );
          }}
        />
      </div>
    );
  }

  // ── Leaf blocks (and containers while dragging)
  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      className={`group relative mb-2 rounded-sm transition-all ${ringClasses}`}
    >
      {/* InlineLeafRenderer — renders BlockRenderer base + InlineTextField overlay */}
      <InlineLeafRenderer
        block={block}
        onUpdateItems={(blockId, itemsKey, newItems) => {
          onBlocksChange(updateBlockProps(blocks, blockId, { [itemsKey]: newItems as unknown as string }));
        }}
      />

      {/* Transparent overlay — hidden when this block is actively being edited */}
      {!isActivelyEditing && (
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        />
      )}

      {/* Block toolbar — hidden during active editing */}
      {!isActivelyEditing && (
        <BlockToolbar
          blockId={block.id}
          blockType={block.type}
          block={block}
          isSelected={isSelected}
          onSelect={() => setSelectedId(block.id)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          dragHandleProps={{ ...listeners, ...attributes } as any}
        />
      )}
    </div>
  );
}

// ─── EmptyContainerDropZone ───────────────────────────────────────────────────

function EmptyContainerDropZone({ containerId }: { containerId: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `container-empty-${containerId}`,
    data: { parentId: containerId, index: 0, kind: "dropzone" },
  });
  return (
    <div
      ref={setNodeRef}
      className={`relative z-20 flex items-center justify-center h-10 m-1 rounded text-xs text-gray-400 transition-colors ${
        isOver ? "bg-blue-50 text-blue-500 border border-dashed border-blue-300" : "border border-dashed border-gray-200"
      }`}
    >
      {isOver ? "Drop here" : "Empty — drop a block inside"}
    </div>
  );
}

// ─── PaletteItemDraggable ─────────────────────────────────────────────────────

export function PaletteItemDraggable({
  blockType,
  children,
}: {
  blockType: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${blockType}`,
    data: { kind: "palette", blockType } satisfies DragData,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
