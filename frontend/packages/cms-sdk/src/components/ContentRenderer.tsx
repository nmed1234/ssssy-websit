/**
 * @ssssy/cms-sdk — ContentRenderer Component
 *
 * Renders a DynamicContentEntry using:
 *   1. A plugin-registered renderer (if one is registered for this content type)
 *   2. The built-in default field-list renderer (fallback)
 *
 * Usage:
 *   <ContentRenderer entry={entry} />
 *   // OR with custom fallback:
 *   <ContentRenderer entry={entry} fallback={<MyCustomView entry={entry} />} />
 */

"use client";

import React from "react";
import { CmsSDK } from "../registry";
import type { DynamicContentEntry, ContentTypeDefinition } from "../types";

interface ContentRendererProps {
  entry: DynamicContentEntry;
  /** Optional content type definition for richer field labels in default renderer */
  contentType?: ContentTypeDefinition;
  /** Override the default field-list renderer */
  fallback?: React.ReactNode;
  className?: string;
}

export function ContentRenderer({ entry, contentType, fallback, className = "" }: ContentRendererProps) {
  // Check if a plugin has registered a renderer for this content type
  const pluginRenderer = CmsSDK.getContentRenderer(entry.contentTypeName);

  if (pluginRenderer) {
    return pluginRenderer.render(entry);
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: render all fields from the JSONB data
  return <DefaultFieldRenderer entry={entry} contentType={contentType} className={className} />;
}

// ─── Default field renderer ───────────────────────────────────────────────────

function DefaultFieldRenderer({
  entry, contentType, className,
}: {
  entry: DynamicContentEntry;
  contentType?: ContentTypeDefinition;
  className?: string;
}) {
  let fieldData: Record<string, unknown> = {};
  try {
    fieldData = JSON.parse(entry.fieldData ?? "{}") as Record<string, unknown>;
  } catch { /* ignore */ }

  const fieldDefs = contentType?.fields ?? [];

  return (
    <div className={`space-y-4 ${className}`}>
      {fieldDefs.length > 0 ? (
        fieldDefs.map((field) => {
          const value = fieldData[field.fieldName];
          if (value == null) return null;
          return (
            <div key={field.fieldName}>
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {field.fieldLabelEn}
              </dt>
              <dd className="text-gray-800 text-sm leading-relaxed">
                {String(value)}
              </dd>
            </div>
          );
        })
      ) : (
        // No field definitions — render raw key/value pairs
        Object.entries(fieldData).map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {key.replace(/_/g, " ")}
            </dt>
            <dd className="text-gray-800 text-sm leading-relaxed">
              {String(value ?? "")}
            </dd>
          </div>
        ))
      )}
    </div>
  );
}
