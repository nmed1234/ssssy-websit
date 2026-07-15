/**
 * BreadcrumbNav — shows the drill-down path from root to the selected block.
 *
 * Each crumb is clickable to "navigate up" to that ancestor level.
 * Receiving an empty path shows just "Page".
 */

"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { findBlock } from "@/components/page-builder/schema/tree-utils";
import { getBlockSchema } from "@/components/page-builder/schema/block-schema";
import type { Block } from "@/types/block";

interface BreadcrumbNavProps {
  /** All root-level blocks (to look up labels) */
  blocks: Block[];
  /** Array of block IDs from root to current selection */
  path: string[];
  /** Called when user clicks a crumb — receives the ID clicked (or null for root) */
  onNavigate: (id: string | null) => void;
}

function blockLabel(block: Block): string {
  const schema = getBlockSchema(block.type);
  const title =
    (block.props.titleEn as string) ||
    (block.props.title as string) ||
    (block.props.text as string) ||
    (block.props.label as string);
  if (title) return String(title).slice(0, 20);
  return schema.label;
}

export function BreadcrumbNav({ blocks, path, onNavigate }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center gap-0.5 px-3 py-1 text-[11px] text-gray-500 border-b bg-gray-50 overflow-x-auto flex-shrink-0">
      {/* Root crumb */}
      <button
        type="button"
        onClick={() => onNavigate(null)}
        className="hover:text-gray-900 font-medium whitespace-nowrap"
      >
        Page
      </button>

      {path.map((id) => {
        const block = findBlock(blocks, id);
        if (!block) return null;
        const schema = getBlockSchema(block.type);
        return (
          <React.Fragment key={id}>
            <ChevronRight className="w-3 h-3 flex-shrink-0 text-gray-300" />
            <button
              type="button"
              onClick={() => onNavigate(id)}
              className="hover:text-gray-900 font-medium whitespace-nowrap"
            >
              {schema.icon} {blockLabel(block)}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
