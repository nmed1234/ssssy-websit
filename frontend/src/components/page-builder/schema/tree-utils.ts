/**
 * tree-utils.ts — Pure functions for operating on the nested Block tree.
 *
 * All functions are immutable — they return a new tree without mutating the input.
 * This makes them safe to use with React state and easy to test.
 */

import { v4 as uuidv4 } from "uuid";
import type { Block, PageLayout } from "@/types/block";
import { getDefaultProps } from "./default-props";
import { getBlockSchema } from "./block-schema";

// ─── ID generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return uuidv4();
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/** Creates a new Block node with default props for the given type */
export function createBlock(type: string): Block {
  const schema = getBlockSchema(type);
  return {
    id: generateId(),
    type,
    props: getDefaultProps(type),
    children: schema.isContainer ? [] : undefined,
  };
}

// ─── Traversal ────────────────────────────────────────────────────────────────

/** Returns the block with the given id, or null if not found */
export function findBlock(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlock(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Returns the full path (array of IDs from root to node) for the block with the given id */
export function findPath(blocks: Block[], id: string, prefix: string[] = []): string[] | null {
  for (const block of blocks) {
    const path = [...prefix, block.id];
    if (block.id === id) return path;
    if (block.children) {
      const found = findPath(block.children, id, path);
      if (found) return found;
    }
  }
  return null;
}

/** Returns the parent block of the block with the given id, or null if it is a root block */
export function findParent(blocks: Block[], id: string, parent: Block | null = null): Block | null {
  for (const block of blocks) {
    if (block.id === id) return parent;
    if (block.children) {
      const found = findParent(block.children, id, block);
      if (found !== undefined) return found;
    }
  }
  return null;  // not found — caller should treat null as "not found, not root"
}

// ─── Immutable mutations ──────────────────────────────────────────────────────

/**
 * Returns a new block tree with the props of block `id` merged with `updates`.
 */
export function updateBlockProps(
  blocks: Block[],
  id: string,
  updates: Record<string, unknown>
): Block[] {
  return blocks.map((block) => {
    if (block.id === id) {
      return { ...block, props: { ...block.props, ...updates } as import("@/types/block").BlockProps };
    }
    if (block.children) {
      return { ...block, children: updateBlockProps(block.children, id, updates) };
    }
    return block;
  });
}

/**
 * Returns a new block tree with block `id` replaced entirely with `replacement`.
 */
export function replaceBlock(blocks: Block[], id: string, replacement: Block): Block[] {
  return blocks.map((block) => {
    if (block.id === id) return replacement;
    if (block.children) {
      return { ...block, children: replaceBlock(block.children, id, replacement) };
    }
    return block;
  });
}

/**
 * Inserts `newBlock` as a child of parent block `parentId` at position `index`.
 * If `parentId` is `"__root__"`, inserts into the root-level blocks array.
 */
export function insertBlock(
  blocks: Block[],
  parentId: string | "__root__",
  index: number,
  newBlock: Block
): Block[] {
  if (parentId === "__root__") {
    const next = [...blocks];
    next.splice(index, 0, newBlock);
    return next;
  }
  return blocks.map((block) => {
    if (block.id === parentId) {
      const children = [...(block.children ?? [])];
      children.splice(index, 0, newBlock);
      return { ...block, children };
    }
    if (block.children) {
      return { ...block, children: insertBlock(block.children, parentId, index, newBlock) };
    }
    return block;
  });
}

/**
 * Appends `newBlock` as the last child of parent block `parentId`.
 * If `parentId` is `"__root__"`, appends to the root-level array.
 */
export function appendBlock(
  blocks: Block[],
  parentId: string | "__root__",
  newBlock: Block
): Block[] {
  if (parentId === "__root__") return [...blocks, newBlock];
  return blocks.map((block) => {
    if (block.id === parentId) {
      return { ...block, children: [...(block.children ?? []), newBlock] };
    }
    if (block.children) {
      return { ...block, children: appendBlock(block.children, parentId, newBlock) };
    }
    return block;
  });
}

/**
 * Removes the block with the given id from anywhere in the tree.
 * Returns the new tree and a boolean indicating whether the block was found.
 */
export function removeBlock(blocks: Block[], id: string): { blocks: Block[]; removed: boolean } {
  const filtered = blocks.filter((b) => b.id !== id);
  if (filtered.length < blocks.length) {
    return { blocks: filtered, removed: true };
  }
  let removed = false;
  const next = blocks.map((block) => {
    if (block.children) {
      const result = removeBlock(block.children, id);
      if (result.removed) {
        removed = true;
        return { ...block, children: result.blocks };
      }
    }
    return block;
  });
  return { blocks: next, removed };
}

/**
 * Moves the block identified by `sourceId` to a new position:
 * child of `targetParentId` at index `targetIndex`.
 *
 * Returns the new root blocks array.
 */
export function moveBlock(
  blocks: Block[],
  sourceId: string,
  targetParentId: string | "__root__",
  targetIndex: number
): Block[] {
  // Find and extract the source block
  const source = findBlock(blocks, sourceId);
  if (!source) return blocks;

  // Remove it from its current position
  const { blocks: withoutSource } = removeBlock(blocks, sourceId);

  // Insert at the new position
  return insertBlock(withoutSource, targetParentId, targetIndex, source);
}

/**
 * Duplicates the block with the given id (and all its descendants),
 * inserting the copy immediately after the original.
 */
export function duplicateBlock(blocks: Block[], id: string): Block[] {
  const deepClone = (block: Block): Block => ({
    ...block,
    id: generateId(),
    props: { ...block.props },
    children: block.children?.map(deepClone),
  });

  const insertAfter = (arr: Block[]): { arr: Block[]; inserted: boolean } => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        const copy = deepClone(arr[i]);
        const next = [...arr];
        next.splice(i + 1, 0, copy);
        return { arr: next, inserted: true };
      }
      if (arr[i].children) {
        const result = insertAfter(arr[i].children!);
        if (result.inserted) {
          return {
            arr: arr.map((b) => (b.id === arr[i].id ? { ...b, children: result.arr } : b)),
            inserted: true,
          };
        }
      }
    }
    return { arr, inserted: false };
  };

  return insertAfter(blocks).arr;
}

/**
 * Reorders a block within its parent: moves it from `fromIndex` to `toIndex`.
 * `parentId === "__root__"` operates on the root-level array.
 */
export function reorderBlock(
  blocks: Block[],
  parentId: string | "__root__",
  fromIndex: number,
  toIndex: number
): Block[] {
  const reorder = (arr: Block[]): Block[] => {
    const next = [...arr];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  };

  if (parentId === "__root__") return reorder(blocks);

  return blocks.map((block) => {
    if (block.id === parentId && block.children) {
      return { ...block, children: reorder(block.children) };
    }
    if (block.children) {
      return { ...block, children: reorderBlock(block.children, parentId, fromIndex, toIndex) };
    }
    return block;
  });
}

// ─── Serialisation ────────────────────────────────────────────────────────────

export function emptyLayout(): PageLayout {
  return { version: "1", blocks: [] };
}

export function parseLayout(json: string | null | undefined): PageLayout {
  if (!json) return emptyLayout();
  try {
    const parsed = JSON.parse(json);
    if (parsed?.version === "1" && Array.isArray(parsed.blocks)) {
      return parsed as PageLayout;
    }
    // Legacy: if it's just an array, wrap it
    if (Array.isArray(parsed)) {
      return { version: "1", blocks: parsed };
    }
  } catch {}
  return emptyLayout();
}

export function serializeLayout(layout: PageLayout): string {
  return JSON.stringify(layout);
}

// ─── Tree statistics ──────────────────────────────────────────────────────────

export function countBlocks(blocks: Block[]): number {
  return blocks.reduce((sum, b) => sum + 1 + countBlocks(b.children ?? []), 0);
}

/** Returns a flat list of all block IDs in depth-first order */
export function flatIds(blocks: Block[]): string[] {
  return blocks.flatMap((b) => [b.id, ...flatIds(b.children ?? [])]);
}
