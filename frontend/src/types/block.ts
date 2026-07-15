/**
 * Block — the single universal data unit for the page builder.
 *
 * Every element on a page is a Block.  Containers (section, row, column, grid,
 * flexbox, tabs, accordion, card-group) carry a `children` array; leaf blocks
 * (heading, paragraph, image, button, …) leave `children` undefined.
 *
 * The entire page tree is stored as `Block[]` in `pages.layout_json` (TEXT/JSONB).
 * No relational join is needed to fetch a page — one column, one query.
 */

// ─── Core types ──────────────────────────────────────────────────────────────

/** A single node in the page block tree */
export interface Block {
  /** Stable UUID, generated client-side with crypto.randomUUID() */
  id: string;
  /** Component type key, e.g. "section", "heading", "card-group" */
  type: string;
  /**
   * All editable properties live here in a single flat object.
   * Text content, layout settings, and style properties are all props.
   * The PropertyPanel groups them into tabs (Content / Layout / Style / Advanced)
   * using BLOCK_SCHEMA metadata — but storage is always flat.
   */
  props: BlockProps;
  /** Nested children — present only on container block types */
  children?: Block[];
}

/** Loosely-typed props bag; individual values are always strings, numbers,
 *  booleans, or arrays of records (for repeating item blocks like card-group). */
export type BlockProps = Record<string, BlockPropValue>;

export type BlockPropValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | BlockItemRecord[]   // repeating items inside a single leaf block (legacy compat)
  | Record<string, unknown>;

/** A record inside a repeating-items prop (e.g. stats items, gallery images) */
export type BlockItemRecord = Record<string, string | number | boolean | null | undefined>;

// ─── Visibility / visibility rule ────────────────────────────────────────────

export type Visibility =
  | "ALWAYS"
  | "HIDDEN"
  | "LOGGED_IN"
  | "LOGGED_OUT"
  | "MEMBER_ONLY"
  | "DESKTOP_ONLY"
  | "MOBILE_ONLY";

// ─── The serialised page layout ───────────────────────────────────────────────

/**
 * The top-level structure stored in `pages.layout_json`.
 * `version` allows us to handle future format migrations gracefully.
 */
export interface PageLayout {
  /** Schema version — currently "1" */
  version: "1";
  /** Root-level block list (the page's direct children) */
  blocks: Block[];
}

// ─── Event / Action types ─────────────────────────────────────────────────────

/**
 * EventAction — describes what happens when an interactive block is clicked.
 * Stored as `block.props.events = { onClick: EventAction }`.
 */
export type EventAction =
  | { type: "navigate"; url: string; target?: "_self" | "_blank" }
  | { type: "modal"; modalId: string }
  | { type: "toggle"; targetId: string }
  | { type: "scroll"; anchor: string }
  | { type: "download"; url: string; filename?: string }
  | { type: "clipboard"; text: string }
  | { type: "api"; method: "GET" | "POST" | "PUT"; url: string; body?: string; successMsg?: string; errorMsg?: string };

/**
 * VisibilityRule — a single conditional-visibility rule for a block.
 * All rules are AND-evaluated; all must pass for the block to render.
 */
export type VisibilityRule =
  | { type: "auth"; level: "loggedIn" | "loggedOut" | "member" | "editor" | "publisher" | "admin" }
  | { type: "dateRange"; start?: string; end?: string }
  | { type: "device"; device: "mobile" | "tablet" | "desktop" };

// ─── Container type guard ─────────────────────────────────────────────────────

/** Block types that are allowed to hold children */
export const CONTAINER_TYPES = new Set<string>([
  "section",
  "row",
  "column",
  "grid",
  "flexbox",
  "tabs",
  "accordion",
  "card-group",
]);

export function isContainer(type: string): boolean {
  return CONTAINER_TYPES.has(type);
}

// ─── Selection context ────────────────────────────────────────────────────────

/**
 * Identifies the currently selected block by its full path in the tree.
 * `path` is an array of block IDs from root to the selected node, e.g.
 * `["section-id", "row-id", "heading-id"]`
 */
export interface BlockSelection {
  id: string;
  path: string[];
}

// ─── Drag-and-drop transfer types ─────────────────────────────────────────────

export type DragSource =
  | { kind: "palette"; blockType: string }          // dragging from the component palette
  | { kind: "block";   id: string; path: string[] }; // dragging an existing block

export interface DropTarget {
  /** ID of the container block that will receive the dropped block */
  parentId: string | "__root__";
  /** Index inside `parent.children` where the block should be inserted */
  index: number;
}
