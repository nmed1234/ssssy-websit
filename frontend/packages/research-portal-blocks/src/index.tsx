/**
 * Research Portal Blocks — Reference Frontend Plugin
 *
 * Demonstrates the CmsSDK frontend plugin runtime by registering 3 page-builder blocks:
 *
 * 1. ResearchCitationBlock  — renders a formatted DOI citation card
 * 2. ResearchHighlightBlock — a callout box for key research findings
 * 3. ResearchStatsBlock     — a row of numeric research statistics
 *
 * In production, this file would be built as a standalone JS bundle
 * (e.g. via `vite build --lib`), uploaded to MinIO, and referenced in
 * the plugin's manifest.json as "frontendBundleUrl".
 *
 * The bundle auto-registers on load:
 *   CmsSDK.registerBlock({ type: 'research-citation', ... })
 *
 * No webpack rebuild of the main app is needed.
 */

"use client";

import React from "react";
import { CmsSDK } from "@ssssy/cms-sdk";

// ─── Block 1: Research Citation ───────────────────────────────────────────────

function ResearchCitationBlock({
  doi,
  authors,
  title,
  journal,
  year,
}: {
  doi?: string;
  authors?: string;
  title?: string;
  journal?: string;
  year?: string;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 font-mono text-sm">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-blue-600 font-bold text-xs">DOI</span>
        </div>
        <div className="flex-1">
          {title && <p className="font-semibold text-gray-900 not-italic mb-1">{title}</p>}
          {authors && <p className="text-gray-600 text-xs mb-1">{authors}</p>}
          {(journal || year) && (
            <p className="text-gray-500 text-xs italic">
              {[journal, year].filter(Boolean).join(", ")}
            </p>
          )}
          {doi && (
            <a
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline mt-1 block"
            >
              https://doi.org/{doi}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Block 2: Research Highlight ──────────────────────────────────────────────

function ResearchHighlightBlock({
  heading,
  body,
  color = "blue",
}: {
  heading?: string;
  body?: string;
  color?: "blue" | "green" | "purple" | "amber";
}) {
  const colorMap: Record<string, string> = {
    blue:   "border-blue-400 bg-blue-50",
    green:  "border-green-400 bg-green-50",
    purple: "border-purple-400 bg-purple-50",
    amber:  "border-amber-400 bg-amber-50",
  };
  const textMap: Record<string, string> = {
    blue: "text-blue-800", green: "text-green-800", purple: "text-purple-800", amber: "text-amber-800",
  };

  return (
    <div className={`border-l-4 rounded-r-xl p-5 ${colorMap[color] ?? colorMap.blue}`}>
      {heading && (
        <p className={`font-bold text-sm mb-1 ${textMap[color] ?? textMap.blue}`}>{heading}</p>
      )}
      {body && (
        <p className={`text-sm leading-relaxed ${textMap[color] ?? textMap.blue}`}>{body}</p>
      )}
    </div>
  );
}

// ─── Block 3: Research Stats ──────────────────────────────────────────────────

function ResearchStatsBlock({
  stat1Label = "Papers Published",
  stat1Value = "0",
  stat2Label = "Researchers",
  stat2Value = "0",
  stat3Label = "Citations",
  stat3Value = "0",
}: {
  stat1Label?: string;
  stat1Value?: string;
  stat2Label?: string;
  stat2Value?: string;
  stat3Label?: string;
  stat3Value?: string;
}) {
  const stats = [
    { label: stat1Label, value: stat1Value },
    { label: stat2Label, value: stat2Value },
    { label: stat3Label, value: stat3Value },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
          <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Plugin self-registration ─────────────────────────────────────────────────

CmsSDK.registerBlock({
  type: "research-citation",
  label: "Research Citation",
  icon: "BookOpen",
  schema: {
    doi:     { type: "text",   label: "DOI",           defaultValue: "10.xxxx/xxxxx" },
    title:   { type: "text",   label: "Paper Title",   defaultValue: "" },
    authors: { type: "text",   label: "Authors",       defaultValue: "" },
    journal: { type: "text",   label: "Journal",       defaultValue: "" },
    year:    { type: "text",   label: "Year",          defaultValue: "" },
  },
  render: (props) => <ResearchCitationBlock {...(props as Parameters<typeof ResearchCitationBlock>[0])} />,
});

CmsSDK.registerBlock({
  type: "research-highlight",
  label: "Research Highlight",
  icon: "Lightbulb",
  schema: {
    heading: { type: "text",   label: "Heading",       defaultValue: "Key Finding" },
    body:    { type: "text",   label: "Body Text",     defaultValue: "" },
    color:   { type: "select", label: "Color",         defaultValue: "blue" },
  },
  render: (props) => <ResearchHighlightBlock {...(props as Parameters<typeof ResearchHighlightBlock>[0])} />,
});

CmsSDK.registerBlock({
  type: "research-stats",
  label: "Research Stats",
  icon: "BarChart2",
  schema: {
    stat1Label: { type: "text", label: "Stat 1 Label", defaultValue: "Papers Published" },
    stat1Value: { type: "text", label: "Stat 1 Value", defaultValue: "0" },
    stat2Label: { type: "text", label: "Stat 2 Label", defaultValue: "Researchers" },
    stat2Value: { type: "text", label: "Stat 2 Value", defaultValue: "0" },
    stat3Label: { type: "text", label: "Stat 3 Label", defaultValue: "Citations" },
    stat3Value: { type: "text", label: "Stat 3 Value", defaultValue: "0" },
  },
  render: (props) => <ResearchStatsBlock {...(props as Parameters<typeof ResearchStatsBlock>[0])} />,
});

// Register admin route for research portal management
CmsSDK.registerAdminRoute({
  path: "research-portal",
  label: "Research Portal",
  labelAr: "بوابة البحوث",
  icon: "FlaskConical",
});

console.log("[ResearchPortalPlugin] Registered 3 blocks + 1 admin route via CmsSDK");

export {};
