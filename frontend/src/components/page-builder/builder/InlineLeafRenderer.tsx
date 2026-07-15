/**
 * InlineLeafRenderer — canvas-side component that renders a leaf block's key
 * text fields using InlineTextField so each is individually double-click
 * editable.
 *
 * Architecture:
 *   - BlockRenderer provides the full visual base (pointer-events-none)
 *   - An overlay div positions InlineTextField instances for every key field
 *     in the LEAF_KEY_FIELDS registry
 *   - For items-bearing block types, InlineItemsEditor is rendered below the
 *     text fields so repeating items can be added/edited/removed on the canvas
 *   - Block types not in the registry fall back to BlockRenderer-only rendering
 */

"use client";

import React from "react";
import { BlockRenderer } from "../BlockRenderer";
import { InlineTextField, type TagName } from "./InlineTextField";
import { InlineItemsEditor, ITEMS_EDITOR_REGISTRY } from "./InlineItemsEditor";
import type { Block } from "@/types/block";

// ─── Key field descriptor ──────────────────────────────────────────────────────

interface LeafKeyField {
  propKey: string;
  propKeyAr: string;
  tag: TagName;
  className: string;
  multiline?: boolean;
  placeholder: string;
}

// ─── LEAF_KEY_FIELDS registry ─────────────────────────────────────────────────
//
// Maps each covered leaf block type to the ordered list of key text fields that
// should be overlaid with InlineTextField instances on the builder canvas.
//
// Covers all block types from Requirement 2.2, plus title-only types.

export const LEAF_KEY_FIELDS: Record<string, LeafKeyField[]> = {
  // ── Heading ──────────────────────────────────────────────────────────────
  heading: [
    {
      propKey: "text",
      propKeyAr: "textAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Heading…",
    },
  ],

  // ── Paragraph ────────────────────────────────────────────────────────────
  paragraph: [
    {
      propKey: "text",
      propKeyAr: "textAr",
      tag: "p",
      className: "text-base leading-relaxed",
      placeholder: "Paragraph…",
      multiline: true,
    },
  ],

  // ── Button ───────────────────────────────────────────────────────────────
  button: [
    {
      propKey: "label",
      propKeyAr: "labelAr",
      tag: "span",
      className: "font-medium",
      placeholder: "Button label…",
    },
  ],

  // ── Card ─────────────────────────────────────────────────────────────────
  card: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h3",
      className: "font-heading text-lg font-semibold",
      placeholder: "Card title…",
    },
    {
      propKey: "subtitle",
      propKeyAr: "subtitleAr",
      tag: "p",
      className: "text-sm text-muted-foreground",
      placeholder: "Subtitle…",
    },
    {
      propKey: "buttonLabel",
      propKeyAr: "buttonLabelAr",
      tag: "span",
      className: "text-sm font-medium",
      placeholder: "Button…",
    },
  ],

  // ── Hero ─────────────────────────────────────────────────────────────────
  hero: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h1",
      className: "font-heading text-4xl font-bold",
      placeholder: "Hero title…",
    },
    {
      propKey: "subtitle",
      propKeyAr: "subtitleAr",
      tag: "p",
      className: "text-lg",
      placeholder: "Subtitle…",
      multiline: true,
    },
    {
      propKey: "buttonLabel",
      propKeyAr: "buttonLabelAr",
      tag: "span",
      className: "font-medium",
      placeholder: "Button…",
    },
  ],

  // ── CTA ──────────────────────────────────────────────────────────────────
  cta: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "CTA title…",
    },
    {
      propKey: "text",
      propKeyAr: "textAr",
      tag: "p",
      className: "text-base",
      placeholder: "Body text…",
      multiline: true,
    },
    {
      propKey: "buttonLabel",
      propKeyAr: "buttonLabelAr",
      tag: "span",
      className: "font-medium",
      placeholder: "Button…",
    },
  ],

  // ── Banner ───────────────────────────────────────────────────────────────
  banner: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Title…",
    },
    {
      propKey: "text",
      propKeyAr: "textAr",
      tag: "p",
      className: "text-base",
      placeholder: "Body text…",
      multiline: true,
    },
    {
      propKey: "buttonLabel",
      propKeyAr: "buttonLabelAr",
      tag: "span",
      className: "font-medium",
      placeholder: "Button…",
    },
  ],

  // ── Blockquote ───────────────────────────────────────────────────────────
  blockquote: [
    {
      propKey: "text",
      propKeyAr: "textAr",
      tag: "p",
      className: "italic text-lg",
      placeholder: "Quote…",
      multiline: true,
    },
    {
      propKey: "attribution",
      propKeyAr: "attributionAr",
      tag: "span",
      className: "text-sm font-medium",
      placeholder: "Attribution…",
    },
  ],

  // ── Alert ────────────────────────────────────────────────────────────────
  alert: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h3",
      className: "font-semibold",
      placeholder: "Alert title…",
    },
    {
      propKey: "message",
      propKeyAr: "messageAr",
      tag: "p",
      className: "text-sm",
      placeholder: "Message…",
      multiline: true,
    },
  ],

  // ── Title-only leaf types ─────────────────────────────────────────────────
  stats: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Stats title…",
    },
  ],

  testimonial: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Section title…",
    },
  ],

  team: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Team title…",
    },
  ],

  accordion: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Section title…",
    },
  ],

  faq: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "FAQ title…",
    },
  ],

  // ── Newsletter form ───────────────────────────────────────────────────────
  "newsletter-form": [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Form title…",
    },
    {
      propKey: "text",
      propKeyAr: "textAr",
      tag: "p",
      className: "text-base",
      placeholder: "Body text…",
      multiline: true,
    },
    {
      propKey: "buttonLabel",
      propKeyAr: "buttonLabelAr",
      tag: "span",
      className: "font-medium",
      placeholder: "Button…",
    },
  ],

  // ── Dynamic / feed blocks (title only) ────────────────────────────────────
  "news-feed": [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Section title…",
    },
  ],

  "events-feed": [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Section title…",
    },
  ],

  "contact-form": [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Form title…",
    },
  ],

  map: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Map title…",
    },
  ],

  gallery: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Gallery title…",
    },
  ],

  carousel: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Carousel title…",
    },
  ],

  timeline: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Timeline title…",
    },
  ],

  progress: [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Section title…",
    },
  ],

  "pricing-table": [
    {
      propKey: "title",
      propKeyAr: "titleAr",
      tag: "h2",
      className: "font-heading text-2xl font-bold",
      placeholder: "Pricing title…",
    },
  ],
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface InlineLeafRendererProps {
  block: Block;
  onUpdateItems?: (blockId: string, itemsKey: string, newItems: Record<string, unknown>[]) => void;
}

// ─── InlineLeafRenderer ───────────────────────────────────────────────────────

/**
 * Renders a leaf block on the builder canvas.
 *
 * For block types in LEAF_KEY_FIELDS:
 *   - Renders BlockRenderer output as a pointer-events-none visual base layer
 *   - Overlays InlineTextField instances for each registered key field
 *   - Suppresses the overlay div's pointer events so individual InlineTextField
 *     elements (which have pointer-events-auto internally) receive clicks
 *
 * For block types NOT in LEAF_KEY_FIELDS:
 *   - Renders BlockRenderer wrapped in pointer-events-none / select-none
 *     (the BlockWrapper's transparent overlay handles interaction)
 */
export function InlineLeafRenderer({ block, onUpdateItems }: InlineLeafRendererProps) {
  const fields = LEAF_KEY_FIELDS[block.type];

  // Fallback: type not covered — render BlockRenderer in a non-interactive wrapper.
  // The BlockWrapper's transparent overlay handles selection/double-click.
  if (!fields) {
    return (
      <div className="pointer-events-none select-none">
        <BlockRenderer blocks={[block]} ignoreVisibility />
      </div>
    );
  }

  return (
    <div className="relative group/inline">
      {/* Visual base — full rendered output, non-interactive */}
      <div className="pointer-events-none select-none">
        <BlockRenderer blocks={[block]} ignoreVisibility />
      </div>

      {/* InlineTextField overlay — pointer-events-none on the wrapper so only
          individual fields receive pointer events (via their own pointer-events-auto) */}
      <div className="absolute inset-0 z-[5] p-2 flex flex-col gap-1 pointer-events-none">
        {fields.map((f) => (
          <InlineTextField
            key={f.propKey}
            blockId={block.id}
            propKey={f.propKey}
            propKeyAr={f.propKeyAr}
            value={String(block.props[f.propKey] ?? "")}
            valueAr={String(block.props[f.propKeyAr] ?? "")}
            tag={f.tag}
            className={f.className}
            placeholder={f.placeholder}
            multiline={f.multiline}
          />
        ))}
      </div>

      {/* InlineItemsEditor — for repeating items (timeline, accordion, faq, etc.) */}
      {(() => {
        const entry = ITEMS_EDITOR_REGISTRY[block.type];
        if (!entry) return null;
        const items = (block.props[entry.itemsKey] as Record<string, unknown>[] | undefined) ?? [];
        return (
          <div className="relative z-[6] px-2 pb-2">
            <InlineItemsEditor
              blockId={block.id}
              itemsKey={entry.itemsKey}
              items={items}
              itemFields={entry.itemFields}
              onItemsChange={(newItems) => {
                onUpdateItems?.(block.id, entry.itemsKey, newItems);
              }}
            />
          </div>
        );
      })()}
    </div>
  );
}
