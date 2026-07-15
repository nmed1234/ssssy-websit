/**
 * DropZone — a visual drop target used between/inside blocks in the canvas.
 *
 * Renders a thin horizontal line that expands to a blue bar when an item is
 * being dragged over it.
 *
 * Uses @dnd-kit's `useDroppable` so it participates in the DnD context.
 */

"use client";

import { useDroppable } from "@dnd-kit/core";

interface DropZoneProps {
  /** Unique ID for this drop zone — must be unique within the DnD context */
  id: string;
  /** Human-readable label (parentId + index) used by the drop handler */
  parentId: string | "__root__";
  index: number;
}

export function DropZone({ id, parentId, index }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { parentId, index, kind: "dropzone" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative h-2 my-0.5 rounded transition-all ${
        isOver ? "bg-blue-400 h-5 scale-y-100" : "bg-transparent hover:bg-blue-100"
      }`}
    >
      {isOver && (
        <span className="absolute inset-y-0 left-0 right-0 flex items-center">
          <span className="w-full border-t-2 border-dashed border-blue-500" />
        </span>
      )}
    </div>
  );
}
