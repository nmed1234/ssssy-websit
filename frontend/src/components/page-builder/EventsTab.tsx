"use client";

/**
 * EventsTab — configure click-event actions for interactive block types.
 *
 * Renders in the PropertyPanel when the selected block is one of the
 * interactive types (button, card, cta, hero, banner, image).
 *
 * The click action is stored as:
 *   block.props.events = { onClick: EventAction }
 *
 * The `events` prop may arrive as a JSON string or already-parsed object.
 */

import React, { useState, useCallback } from "react";
import type { Block, BlockProps } from "@/types/block";
import type { EventAction } from "@/types/block";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventsTabProps {
  block: Block;
  onPropsChange: (id: string, props: BlockProps) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse block.props.events — may be a JSON string or already an object */
function parseEvents(raw: unknown): { onClick?: EventAction } {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as { onClick?: EventAction }; } catch { return {}; }
  }
  if (typeof raw === "object" && raw !== null) return raw as { onClick?: EventAction };
  return {};
}

function inputCls(extra = "") {
  return `w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-400 ${extra}`;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium text-gray-600 mb-0.5">{children}</label>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{children}</p>
  );
}

// ─── Action type options ──────────────────────────────────────────────────────

const ACTION_TYPES: Array<{ value: EventAction["type"] | ""; label: string }> = [
  { value: "",          label: "— None —" },
  { value: "navigate",  label: "Navigate to URL" },
  { value: "scroll",    label: "Scroll to anchor" },
  { value: "toggle",    label: "Toggle visibility" },
  { value: "api",       label: "Call API endpoint" },
  { value: "download",  label: "Download file" },
  { value: "clipboard", label: "Copy to clipboard" },
];

// ─── Type-specific field panels ───────────────────────────────────────────────

function NavigateFields({
  action,
  onChange,
}: {
  action: Extract<EventAction, { type: "navigate" }>;
  onChange: (a: EventAction) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label>URL</Label>
        <input
          type="url"
          className={inputCls()}
          placeholder="https://… or /path"
          value={action.url}
          onChange={(e) => onChange({ ...action, url: e.target.value })}
        />
      </div>
      <div>
        <Label>Open in</Label>
        <select
          className={inputCls()}
          value={action.target ?? "_self"}
          onChange={(e) => onChange({ ...action, target: e.target.value as "_self" | "_blank" })}
        >
          <option value="_self">Same tab</option>
          <option value="_blank">New tab</option>
        </select>
      </div>
    </div>
  );
}

function ScrollFields({
  action,
  onChange,
}: {
  action: Extract<EventAction, { type: "scroll" }>;
  onChange: (a: EventAction) => void;
}) {
  return (
    <div>
      <Label>Anchor element ID</Label>
      <input
        type="text"
        className={inputCls()}
        placeholder="e.g. about-section"
        value={action.anchor}
        onChange={(e) => onChange({ ...action, anchor: e.target.value })}
      />
      <p className="text-[10px] text-gray-400 mt-0.5">The target element must have this HTML id attribute.</p>
    </div>
  );
}

function ToggleFields({
  action,
  onChange,
}: {
  action: Extract<EventAction, { type: "toggle" }>;
  onChange: (a: EventAction) => void;
}) {
  return (
    <div>
      <Label>Target block ID</Label>
      <input
        type="text"
        className={inputCls()}
        placeholder="Block id to show/hide"
        value={action.targetId}
        onChange={(e) => onChange({ ...action, targetId: e.target.value })}
      />
      <p className="text-[10px] text-gray-400 mt-0.5">Set the HTML id on the target block via its Advanced tab.</p>
    </div>
  );
}

function ApiFields({
  action,
  onChange,
}: {
  action: Extract<EventAction, { type: "api" }>;
  onChange: (a: EventAction) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label>HTTP Method</Label>
        <select
          className={inputCls()}
          value={action.method}
          onChange={(e) => onChange({ ...action, method: e.target.value as "GET" | "POST" | "PUT" })}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
        </select>
      </div>
      <div>
        <Label>URL</Label>
        <input
          type="url"
          className={inputCls()}
          placeholder="https://… or /api/…"
          value={action.url}
          onChange={(e) => onChange({ ...action, url: e.target.value })}
        />
      </div>
      <div>
        <Label>Request body (JSON)</Label>
        <textarea
          className={inputCls("resize-y min-h-[56px] font-mono")}
          rows={3}
          placeholder='{"key":"value"}'
          value={action.body ?? ""}
          onChange={(e) => onChange({ ...action, body: e.target.value })}
        />
      </div>
      <div>
        <Label>Success message</Label>
        <input
          type="text"
          className={inputCls()}
          placeholder="Done!"
          value={action.successMsg ?? ""}
          onChange={(e) => onChange({ ...action, successMsg: e.target.value })}
        />
      </div>
      <div>
        <Label>Error message</Label>
        <input
          type="text"
          className={inputCls()}
          placeholder="Action failed. Please try again."
          value={action.errorMsg ?? ""}
          onChange={(e) => onChange({ ...action, errorMsg: e.target.value })}
        />
      </div>
    </div>
  );
}

function DownloadFields({
  action,
  onChange,
}: {
  action: Extract<EventAction, { type: "download" }>;
  onChange: (a: EventAction) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label>File URL</Label>
        <input
          type="url"
          className={inputCls()}
          placeholder="https://…/file.pdf"
          value={action.url}
          onChange={(e) => onChange({ ...action, url: e.target.value })}
        />
      </div>
      <div>
        <Label>Filename (optional)</Label>
        <input
          type="text"
          className={inputCls()}
          placeholder="document.pdf"
          value={action.filename ?? ""}
          onChange={(e) => onChange({ ...action, filename: e.target.value })}
        />
      </div>
    </div>
  );
}

function ClipboardFields({
  action,
  onChange,
}: {
  action: Extract<EventAction, { type: "clipboard" }>;
  onChange: (a: EventAction) => void;
}) {
  return (
    <div>
      <Label>Text to copy</Label>
      <textarea
        className={inputCls("resize-y min-h-[56px]")}
        rows={2}
        placeholder="Text that will be copied to the clipboard"
        value={action.text}
        onChange={(e) => onChange({ ...action, text: e.target.value })}
      />
    </div>
  );
}

// ─── Default actions for each type ───────────────────────────────────────────

function defaultAction(type: EventAction["type"]): EventAction {
  switch (type) {
    case "navigate":  return { type: "navigate",  url: "" };
    case "scroll":    return { type: "scroll",    anchor: "" };
    case "toggle":    return { type: "toggle",    targetId: "" };
    case "api":       return { type: "api",       method: "POST", url: "" };
    case "download":  return { type: "download",  url: "" };
    case "clipboard": return { type: "clipboard", text: "" };
    case "modal":     return { type: "modal",     modalId: "" };
  }
}

// ─── EventsTab component ──────────────────────────────────────────────────────

export function EventsTab({ block, onPropsChange }: EventsTabProps) {
  const events = parseEvents(block.props.events);
  const currentAction = events.onClick;
  const currentType: EventAction["type"] | "" = currentAction?.type ?? "";

  // Local state to track action type selection (for optimistic UI)
  const [selectedType, setSelectedType] = useState<EventAction["type"] | "">(currentType);

  const saveAction = useCallback(
    (action: EventAction | null) => {
      const newEvents = action ? { onClick: action } : {};
      onPropsChange(block.id, {
        ...block.props,
        events: newEvents as Record<string, unknown>,
      });
    },
    [block, onPropsChange]
  );

  const handleTypeChange = (type: EventAction["type"] | "") => {
    setSelectedType(type);
    if (!type) {
      saveAction(null);
    } else {
      saveAction(defaultAction(type));
    }
  };

  const handleActionChange = (action: EventAction) => {
    saveAction(action);
  };

  // Resolve which action to display: use persisted if same type, otherwise use default
  const displayAction: EventAction | undefined =
    currentAction?.type === selectedType
      ? currentAction
      : selectedType
      ? defaultAction(selectedType)
      : undefined;

  return (
    <div className="p-3 space-y-4">
      {/* Click action */}
      <div>
        <SectionHeading>Click Action</SectionHeading>
        <div className="space-y-2">
          <div>
            <Label>Action type</Label>
            <select
              className={inputCls()}
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value as EventAction["type"] | "")}
            >
              {ACTION_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Type-specific fields */}
          {displayAction?.type === "navigate" && (
            <NavigateFields
              action={displayAction}
              onChange={handleActionChange}
            />
          )}
          {displayAction?.type === "scroll" && (
            <ScrollFields
              action={displayAction}
              onChange={handleActionChange}
            />
          )}
          {displayAction?.type === "toggle" && (
            <ToggleFields
              action={displayAction}
              onChange={handleActionChange}
            />
          )}
          {displayAction?.type === "api" && (
            <ApiFields
              action={displayAction}
              onChange={handleActionChange}
            />
          )}
          {displayAction?.type === "download" && (
            <DownloadFields
              action={displayAction}
              onChange={handleActionChange}
            />
          )}
          {displayAction?.type === "clipboard" && (
            <ClipboardFields
              action={displayAction}
              onChange={handleActionChange}
            />
          )}
        </div>
      </div>

      {selectedType && (
        <p className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 rounded px-2 py-1.5">
          This action will run when visitors click this block on the public page.
        </p>
      )}
    </div>
  );
}
