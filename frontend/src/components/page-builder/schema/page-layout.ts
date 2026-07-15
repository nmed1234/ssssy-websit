/**
 * page-layout.ts — helpers for persisting and loading the page block tree.
 *
 * Responsibilities:
 *   1. Parse `layout_json` from the API response into a `PageLayout` struct.
 *   2. Serialize a `PageLayout` back to a JSON string for saving.
 *   3. Migrate the old flat `PageSection[]` format into a `PageLayout` tree
 *      (one-time conversion on first load for existing pages).
 *
 * Data model:
 *   - `pages.layout_json` stores the full block tree as JSON.
 *   - Each block has `{ id, type, props, children }`.
 *   - `block.props` is the SINGLE source of truth for all content and style.
 *   - BlockRenderer reads ONLY from `block.props` — no content-string lookups.
 */

import type { Block, PageLayout } from "@/types/block";
import { parseLayout, serializeLayout, emptyLayout, generateId } from "./tree-utils";
import { getDefaultProps } from "./default-props";
import { getBlockSchema } from "./block-schema";

export { parseLayout, serializeLayout, emptyLayout };

// ─── Legacy section type registry ─────────────────────────────────────────────

/**
 * All known legacy component_type strings from the page_sections table.
 * Used by the admin "Migrate to Block Builder" button to detect pages that
 * still use the old page_sections rows and offer migration.
 */
export const LEGACY_SECTION_TYPES: Set<string> = new Set([
  "about-hero-banner",
  "about-overview-section",
  "about-vision-mission-section",
  "about-organizational-chart-section",
  "about-timeline-section",
  "about-documents-section",
  "about-gallery-section",
  "board-hero-banner",
  "board-members-intro-grid",
  "board-members-grid",
  "board-term-information-section",
  "contact-hero-banner",
  "contact-form-section",
  "newsletter-hero-banner",
  "president-message-hero-banner",
  "president-message-content-section",
  "publications-hero-banner",
  "news-list-section",
  "events-list-section",
  "jobs-list-section",
  "members-list-section",
  "publications-list-section",
  "board-list-section",
]);

// ─── Legacy page_sections format ─────────────────────────────────────────────

/** Shape returned by /api/public/pages/{slug}/sections */
interface LegacyPageSection {
  id: string;
  pageId?: string;
  componentType: string;
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
  styling?: Record<string, unknown>;
  sortOrder?: number;
  visibility?: string;
}

/**
 * Scans `obj` for an array value to use as the items list for a block.
 *
 * Resolution order:
 *  1. `obj[itemsKey]` — exact match on the schema items field key.
 *  2. Any value in `obj` that is a non-empty array (covers legacy nested keys
 *     like `data.panels`, `data.paragraphs`, `data.images`, etc.).
 */
export function findItemsArray(
  obj: Record<string, unknown>,
  itemsKey: string,
): unknown[] | undefined {
  if (Array.isArray(obj[itemsKey])) return obj[itemsKey] as unknown[];
  for (const value of Object.values(obj)) {
    if (Array.isArray(value) && value.length > 0) return value as unknown[];
  }
  return undefined;
}

/**
 * Converts an old flat `PageSection[]` into a `PageLayout` block tree.
 *
 * After V40 migration, `page_sections.data` contains real text values like
 * `{ "title": "About Us", "titleAr": "عن الجمعية", "paragraphs": [...] }`
 * so this function simply merges config + data + styling into a flat `props`
 * object and wraps each section as a Block.
 *
 * Strategy:
 *  - Merge: `{ ...styling, ...config, ...data }` — data wins on key collision.
 *  - Route items arrays to the correct schema key (`panels`, `paragraphs`, etc.)
 *  - Apply `getDefaultProps` as a base so blocks have sensible fallback values.
 *  - Preserve the section's original `id` so DB rows stay valid.
 */
export function migrateLegacySections(sections: LegacyPageSection[]): PageLayout {
  const sorted = [...sections].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const blocks: Block[] = sorted.map((sec): Block => {
    const data    = (sec.data    ?? {}) as Record<string, unknown>;
    const config  = (sec.config  ?? {}) as Record<string, unknown>;
    const styling = (sec.styling ?? {}) as Record<string, unknown>;

    // Merge: data wins over config wins over styling
    const mergedScalars: Record<string, unknown> = { ...styling, ...config, ...data };

    // Route items arrays to the schema key with kind === "items"
    const schema    = getBlockSchema(sec.componentType);
    const itemsField = schema.fields.find((f) => f.kind === "items");

    if (itemsField) {
      const itemsKey = itemsField.key;
      const resolved =
        findItemsArray(data,    itemsKey) ??
        findItemsArray(config,  itemsKey) ??
        findItemsArray(styling, itemsKey) ??
        [];
      mergedScalars[itemsKey] = resolved;
    }

    // Apply defaults as base, then real data on top
    const props: Record<string, unknown> = {
      ...getDefaultProps(sec.componentType),
      ...mergedScalars,
    };

    // Preserve section-level visibility
    if (sec.visibility) props.visibility = sec.visibility;

    return {
      id:       sec.id || generateId(),
      type:     sec.componentType,
      props:    props as import("@/types/block").BlockProps,
      children: schema.isContainer ? [] : undefined,
    };
  });

  return { version: "1", blocks };
}

/**
 * Decides which layout format to use and returns a `PageLayout`.
 *
 * Priority:
 *  1. If `layoutJson` is set → parse it directly (builder-saved format).
 *  2. If legacy sections exist → migrate them on-the-fly.
 *  3. Otherwise → return an empty layout.
 *
 * Usage in page editors:
 *   const layout = resolvePageLayout(page.layoutJson, legacySections);
 */
export function resolvePageLayout(
  layoutJson: string | null | undefined,
  legacySections: LegacyPageSection[]
): PageLayout {
  if (layoutJson) {
    return parseLayout(layoutJson);
  }
  if (legacySections.length > 0) {
    return migrateLegacySections(legacySections);
  }
  return emptyLayout();
}
