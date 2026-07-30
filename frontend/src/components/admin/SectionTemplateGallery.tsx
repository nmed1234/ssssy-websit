"use client";

import { useState, useMemo } from "react";
import { X, Search, Plus, Zap } from "lucide-react";
import {
  SECTION_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type SectionTemplate,
  type TemplateCategory,
} from "@/lib/section-templates";

interface Props {
  onSelect: (template: SectionTemplate) => void;
  onClose: () => void;
}

// SVG wireframe mockups per component type
function TemplateMockup({ type }: { type: string }) {
  const style = { width: "100%", height: "100%", display: "block" };
  const bg = "#f3f4f6";
  const line = "#d1d5db";
  const accent = "#6b7280";
  const dark = "#374151";
  const green = "#4ade80";

  if (type === "hero" || type === "banner") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#1e3a2f" />
      <rect x="20" y="22" width="120" height="12" rx="3" fill="white" opacity="0.9" />
      <rect x="20" y="40" width="160" height="7" rx="2" fill="white" opacity="0.5" />
      <rect x="20" y="52" width="140" height="7" rx="2" fill="white" opacity="0.5" />
      <rect x="20" y="70" width="60" height="20" rx="4" fill={green} />
      <rect x="88" y="70" width="60" height="20" rx="4" fill="none" stroke="white" strokeWidth="1.5" />
    </svg>
  );

  if (type === "hero-carousel") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#1e3a2f" />
      <rect x="20" y="25" width="110" height="10" rx="3" fill="white" opacity="0.9" />
      <rect x="20" y="42" width="150" height="6" rx="2" fill="white" opacity="0.5" />
      <rect x="20" y="54" width="130" height="6" rx="2" fill="white" opacity="0.5" />
      <rect x="20" y="70" width="55" height="18" rx="4" fill={green} />
      <g fill="white" opacity="0.6">
        <circle cx="125" cy="108" r="4" />
        <circle cx="138" cy="108" r="3" fill="white" opacity="0.3" />
        <circle cx="151" cy="108" r="3" fill="white" opacity="0.3" />
      </g>
      <polygon points="255,60 265,55 265,65" fill="white" opacity="0.6" />
      <polygon points="25,60 15,55 15,65" fill="white" opacity="0.6" />
    </svg>
  );

  if (type === "cta") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#166534" />
      <rect x="60" y="30" width="160" height="10" rx="3" fill="white" opacity="0.9" />
      <rect x="80" y="48" width="120" height="6" rx="2" fill="white" opacity="0.5" />
      <rect x="100" y="70" width="80" height="22" rx="4" fill="white" />
      <rect x="112" y="77" width="56" height="8" rx="2" fill="#166534" />
    </svg>
  );

  if (type === "card-group") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="8" width="80" height="6" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={10 + i * 92} y="22" width="84" height="88" rx="6" fill="white" stroke={line} strokeWidth="1" />
          <rect x={25 + i * 92} y="34" width="20" height="20" rx="10" fill="#d1fae5" />
          <rect x={18 + i * 92} y="62" width="50" height="6" rx="2" fill={dark} />
          <rect x={18 + i * 92} y="74" width="60" height="4" rx="1" fill={line} />
          <rect x={18 + i * 92} y="83" width="50" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "stats" || type === "counter") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#1e3a2f" />
      <rect x="80" y="12" width="120" height="8" rx="2" fill="white" opacity="0.6" />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x={14 + i * 64} y="36" width="56" height="70" rx="4" fill="white" opacity="0.1" />
          <rect x={22 + i * 64} y="50" width="40" height="12" rx="2" fill={green} />
          <rect x={24 + i * 64} y="68" width="36" height="6" rx="1" fill="white" opacity="0.5" />
          <rect x={28 + i * 64} y="78" width="28" height="4" rx="1" fill="white" opacity="0.3" />
        </g>
      ))}
    </svg>
  );

  if (type === "testimonials" || type === "testimonial") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="8" width="120" height="7" rx="2" fill={dark} />
      {[0, 1].map(i => (
        <g key={i}>
          <rect x={10 + i * 140} y="24" width="126" height="86" rx="6" fill="white" stroke={line} strokeWidth="1" />
          <rect x={20 + i * 140} y="36" width="80" height="5" rx="1" fill={line} />
          <rect x={20 + i * 140} y="46" width="100" height="4" rx="1" fill={line} />
          <rect x={20 + i * 140} y="55" width="90" height="4" rx="1" fill={line} />
          <circle cx={25 + i * 140} cy="82" r="10" fill="#d1fae5" />
          <rect x={42 + i * 140} y="76" width="50" height="5" rx="1" fill={dark} />
          <rect x={42 + i * 140} y="85" width="40" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "newsletter") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#166534" />
      <rect x="60" y="24" width="160" height="9" rx="3" fill="white" opacity="0.9" />
      <rect x="70" y="40" width="140" height="5" rx="1" fill="white" opacity="0.5" />
      <rect x="30" y="60" width="165" height="28" rx="4" fill="white" opacity="0.15" />
      <rect x="36" y="68" width="100" height="12" rx="2" fill="white" opacity="0.2" />
      <rect x="200" y="60" width="50" height="28" rx="4" fill={green} />
      <rect x="207" y="70" width="36" height="8" rx="2" fill="#166534" />
    </svg>
  );

  if (type === "contact-form") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="8" width="120" height="7" rx="2" fill={dark} />
      <rect x="20" y="26" width="240" height="16" rx="3" fill="white" stroke={line} strokeWidth="1" />
      <rect x="20" y="48" width="112" height="16" rx="3" fill="white" stroke={line} strokeWidth="1" />
      <rect x="148" y="48" width="112" height="16" rx="3" fill="white" stroke={line} strokeWidth="1" />
      <rect x="20" y="70" width="240" height="28" rx="3" fill="white" stroke={line} strokeWidth="1" />
      <rect x="90" y="104" width="100" height="14" rx="4" fill="#1e3a2f" />
    </svg>
  );

  if (type === "faq") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="70" y="8" width="140" height="7" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="20" y={24 + i * 30} width="240" height="24" rx="4" fill="white" stroke={line} strokeWidth="1" />
          <rect x="32" y={32 + i * 30} width="140" height="6" rx="1" fill={accent} />
          <rect x="238" y={30 + i * 30} width="14" height="10" rx="2" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "timeline") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <line x1="50" y1="10" x2="50" y2="115" stroke={line} strokeWidth="2" />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <circle cx="50" cy={24 + i * 34} r="6" fill="#166534" />
          <rect x="66" y={14 + i * 34} width="30" height="6" rx="1" fill={dark} />
          <rect x="66" y={25 + i * 34} width="150" height="4" rx="1" fill={accent} />
          <rect x="66" y={33 + i * 34} width="120" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "team") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="90" y="6" width="100" height="6" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={15 + i * 88} y="20" width="78" height="92" rx="6" fill="white" stroke={line} strokeWidth="1" />
          <circle cx={54 + i * 88} cy="48" r="18" fill="#d1fae5" />
          <rect x={25 + i * 88} y="74" width="58" height="5" rx="1" fill={dark} />
          <rect x={30 + i * 88} y="84" width="48" height="4" rx="1" fill={accent} />
          <rect x={28 + i * 88} y="94" width="52" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "publications-carousel") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="70" y="8" width="140" height="7" rx="2" fill={dark} />
      {[-1, 0, 1].map((offset, i) => (
        <g key={i}>
          <rect x={60 + offset * 94} y="24" width="80" height="88" rx="6" fill="white" stroke={line} strokeWidth="1" opacity={offset === 0 ? 1 : 0.6} />
          <rect x={64 + offset * 94} y="28" width="72" height="40" rx="3" fill={bg} />
          <rect x={66 + offset * 94} y="76" width="60" height="5" rx="1" fill={dark} opacity={offset === 0 ? 1 : 0.5} />
          <rect x={66 + offset * 94} y="86" width="50" height="4" rx="1" fill={line} opacity={offset === 0 ? 1 : 0.5} />
        </g>
      ))}
      <polygon points="22,64 12,58 12,70" fill={accent} />
      <polygon points="258,64 268,58 268,70" fill={accent} />
    </svg>
  );

  if (type === "latest-news-feed") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="6" width="80" height="7" rx="2" fill={dark} />
      <rect x="210" y="6" width="60" height="7" rx="2" fill={accent} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={10 + i * 90} y="20" width="82" height="92" rx="5" fill="white" stroke={line} strokeWidth="1" />
          <rect x={14 + i * 90} y="24" width="74" height="44" rx="3" fill={bg} />
          <rect x={14 + i * 90} y="74" width="50" height="5" rx="1" fill={dark} />
          <rect x={14 + i * 90} y="84" width="64" height="4" rx="1" fill={line} />
          <rect x={14 + i * 90} y="93" width="56" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "upcoming-events-feed") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="6" width="110" height="7" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={10 + i * 90} y="20" width="82" height="92" rx="5" fill="white" stroke={line} strokeWidth="1" />
          <rect x={14 + i * 90} y="24" width="4" height="88" rx="2" fill="#166534" />
          <rect x={24 + i * 90} y="30" width="50" height="6" rx="1" fill="#166534" />
          <rect x={24 + i * 90} y="42" width="60" height="5" rx="1" fill={dark} />
          <rect x={24 + i * 90} y="52" width="55" height="4" rx="1" fill={line} />
          <rect x={24 + i * 90} y="84" width="40" height="4" rx="1" fill={accent} />
        </g>
      ))}
    </svg>
  );

  if (type === "custom") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="70" y="30" width="140" height="60" rx="8" fill="white" stroke={line} strokeWidth="1.5" strokeDasharray="6,4" />
      <line x1="140" y1="52" x2="140" y2="66" stroke={accent} strokeWidth="2" />
      <line x1="133" y1="59" x2="147" y2="59" stroke={accent} strokeWidth="2" />
      <text x="140" y="84" textAnchor="middle" fill={accent} fontSize="9" fontFamily="sans-serif">Start from blank</text>
    </svg>
  );

  // ── New mockups ──────────────────────────────────────────────────────────

  if (type === "features-grid") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="70" y="6" width="140" height="8" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={10 + i * 92} y="22" width="84" height="90" rx="5" fill="white" stroke={line} strokeWidth="1" />
          <rect x={22 + i * 92} y="32" width="22" height="22" rx="11" fill="#dbeafe" />
          <rect x={16 + i * 92} y="62" width="56" height="6" rx="2" fill={dark} />
          <rect x={16 + i * 92} y="74" width="64" height="4" rx="1" fill={line} />
          <rect x={16 + i * 92} y="83" width="54" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "features-alternating") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="8" width="120" height="48" rx="5" fill="#dbeafe" />
      <rect x="144" y="14" width="126" height="8" rx="2" fill={dark} />
      <rect x="144" y="28" width="116" height="4" rx="1" fill={line} />
      <rect x="144" y="36" width="100" height="4" rx="1" fill={line} />
      <rect x="144" y="44" width="60" height="12" rx="3" fill="#1d4ed8" opacity="0.8" />
      <rect x="10" y="68" width="126" height="8" rx="2" fill={dark} />
      <rect x="10" y="80" width="116" height="4" rx="1" fill={line} />
      <rect x="10" y="88" width="100" height="4" rx="1" fill={line} />
      <rect x="148" y="64" width="122" height="48" rx="5" fill="#dbeafe" />
    </svg>
  );

  if (type === "feature-highlight") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="8" width="124" height="104" rx="5" fill="#dbeafe" />
      <rect x="144" y="10" width="126" height="9" rx="2" fill={dark} />
      <rect x="144" y="25" width="116" height="4" rx="1" fill={line} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <circle cx="154" cy={42 + i * 14} r="4" fill="#16a34a" />
          <rect x="164" cy={40 + i * 14} y={40 + i * 14} width="96" height="4" rx="1" fill={accent} />
        </g>
      ))}
      <rect x="144" y="96" width="70" height="14" rx="3" fill="#1e3a2f" />
    </svg>
  );

  if (type === "blog-grid") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="6" width="80" height="7" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={10 + i * 90} y="20" width="82" height="92" rx="5" fill="white" stroke={line} strokeWidth="1" />
          <rect x={14 + i * 90} y="24" width="74" height="40" rx="3" fill="#e0f2fe" />
          <rect x={14 + i * 90} y="70" width="36" height="4" rx="1" fill="#0ea5e9" />
          <rect x={14 + i * 90} y="79" width="60" height="5" rx="1" fill={dark} />
          <rect x={14 + i * 90} y="89" width="54" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "blog-featured") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="8" width="155" height="104" rx="5" fill="#e0f2fe" />
      <rect x="174" y="8" width="96" height="104" rx="5" fill="white" stroke={line} strokeWidth="1" />
      <rect x="14" y="76" width="90" height="7" rx="2" fill={dark} />
      <rect x="14" y="88" width="140" height="4" rx="1" fill={line} />
      <rect x="14" y="97" width="120" height="4" rx="1" fill={line} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="180" y={16 + i * 28} width="84" height="5" rx="1" fill={dark} />
          <rect x="180" y={25 + i * 28} width="70" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "portfolio-masonry") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={10 + i * 90} y="20" width="80" height={i === 1 ? 92 : 58} rx="5" fill="#f0fdf4" stroke={line} strokeWidth="1" />
          <rect x={10 + i * 90} y={i === 1 ? 80 : 46} width="80" height="16" rx="0 0 5 5" fill="rgba(0,0,0,0.07)" />
          <rect x={18 + i * 90} y={i === 1 ? 85 : 51} width="52" height="5" rx="1" fill={dark} />
        </g>
      ))}
    </svg>
  );

  if (type === "case-study-cards") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      {[0, 1].map(i => (
        <g key={i}>
          <rect x="10" y={22 + i * 52} width="260" height="44" rx="5" fill="white" stroke={line} strokeWidth="1" />
          <rect x="18" y={30 + i * 52} width="100" height="6" rx="2" fill={dark} />
          <rect x="18" y={42 + i * 52} width="140" height="4" rx="1" fill={line} />
          <rect x="190" y={30 + i * 52} width="40" height="14" rx="2" fill="#d1fae5" />
          <rect x="240" y={30 + i * 52} width="22" height="14" rx="2" fill="#dbeafe" />
        </g>
      ))}
    </svg>
  );

  if (type === "pricing-cards") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={8 + i * 90} y="20" width="82" height="92" rx="6" fill={i === 1 ? "#1e3a2f" : "white"} stroke={i === 1 ? "none" : line} strokeWidth="1" />
          <rect x={18 + i * 90} y="30" width="40" height="7" rx="2" fill={i === 1 ? "white" : dark} opacity={i === 1 ? 0.9 : 1} />
          <rect x={18 + i * 90} y="44" width="30" height="12" rx="2" fill={i === 1 ? "#4ade80" : line} />
          {[0, 1, 2].map(j => (
            <rect key={j} x={18 + i * 90} y={64 + j * 10} width="55" height="4" rx="1" fill={i === 1 ? "rgba(255,255,255,0.4)" : line} />
          ))}
          <rect x={18 + i * 90} y="100" width="55" height="10" rx="3" fill={i === 1 ? "#4ade80" : line} />
        </g>
      ))}
    </svg>
  );

  if (type === "pricing-table") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="6" width="80" height="7" rx="2" fill={dark} />
      <rect x="10" y="20" width="260" height="14" rx="3" fill="#1e3a2f" />
      <rect x="18" y="25" width="50" height="4" rx="1" fill="white" opacity="0.5" />
      <rect x="118" y="25" width="40" height="4" rx="1" fill="white" opacity="0.7" />
      <rect x="198" y="25" width="40" height="4" rx="1" fill="#4ade80" />
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <rect x="10" y={38 + i * 14} width="260" height="12" rx="2" fill={i % 2 === 0 ? "white" : bg} stroke={line} strokeWidth="0.5" />
          <rect x="18" y={42 + i * 14} width="70" height="4" rx="1" fill={accent} />
          <rect x="136" y={42 + i * 14} width="16" height="8" rx="2" fill="#d1fae5" />
          <rect x="216" y={42 + i * 14} width="16" height="8" rx="2" fill="#d1fae5" />
        </g>
      ))}
    </svg>
  );

  if (type === "testimonials-carousel") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="8" width="260" height="88" rx="8" fill="white" stroke={line} strokeWidth="1" />
      <rect x="50" y="20" width="180" height="7" rx="2" fill={accent} />
      <rect x="40" y="33" width="200" height="5" rx="1" fill={line} />
      <rect x="50" y="42" width="180" height="5" rx="1" fill={line} />
      <rect x="60" y="51" width="160" height="5" rx="1" fill={line} />
      <circle cx="50" cy="76" r="10" fill="#d1fae5" />
      <rect x="67" y="70" width="70" height="5" rx="1" fill={dark} />
      <rect x="67" y="79" width="50" height="4" rx="1" fill={line} />
      <g fill="#f59e0b">
        {[0,1,2,3,4].map(i => <rect key={i} x={176 + i * 10} y="72" width="7" height="7" rx="1" />)}
      </g>
      <g fill="#9ca3af" opacity="0.5">
        <circle cx="130" cy="108" r="4" />
        <circle cx="143" cy="108" r="3" />
        <circle cx="156" cy="108" r="3" />
      </g>
      <polygon points="22,56 12,50 12,62" fill={accent} />
      <polygon points="258,56 268,50 268,62" fill={accent} />
    </svg>
  );

  if (type === "testimonials-wall") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={8 + i * 90} y="20" width="82" height="54" rx="5" fill="white" stroke={line} strokeWidth="1" />
          <rect x={16 + i * 90} y="30" width="64" height="4" rx="1" fill={line} />
          <rect x={16 + i * 90} y="38" width="56" height="4" rx="1" fill={line} />
          <circle cx={20 + i * 90} cy="60" r="6" fill="#d1fae5" />
          <rect x={30 + i * 90} y="56" width="44" height="4" rx="1" fill={dark} />
          <rect x={30 + i * 90} y="64" width="36" height="3" rx="1" fill={line} />
        </g>
      ))}
      {[0, 1].map(i => (
        <g key={i}>
          <rect x={8 + i * 135} y="82" width="124" height="32" rx="5" fill="white" stroke={line} strokeWidth="1" />
          <rect x={16 + i * 135} y="90" width="96" height="4" rx="1" fill={line} />
          <circle cx={20 + i * 135} cy="104" r="6" fill="#d1fae5" />
          <rect x={30 + i * 135} y="100" width="60" height="4" rx="1" fill={dark} />
        </g>
      ))}
    </svg>
  );

  if (type === "team-leadership") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x={6 + i * 68} y="20" width="62" height="92" rx="6" fill="white" stroke={line} strokeWidth="1" />
          <circle cx={37 + i * 68} cy="48" r="20" fill="#dbeafe" />
          <rect x={12 + i * 68} y="74" width="50" height="5" rx="1" fill={dark} />
          <rect x={15 + i * 68} y="84" width="44" height="4" rx="1" fill="#3b82f6" opacity="0.7" />
          <rect x={13 + i * 68} y="93" width="46" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "team-compact") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="8" width="120" height="7" rx="2" fill={dark} />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <g key={i}>
          <circle cx={20 + (i % 3) * 90} cy={42 + Math.floor(i / 3) * 52} r="16" fill="#dbeafe" />
          <rect x={42 + (i % 3) * 90} y={36 + Math.floor(i / 3) * 52} width="50" height="5" rx="1" fill={dark} />
          <rect x={42 + (i % 3) * 90} y={46 + Math.floor(i / 3) * 52} width="40" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "gallery-grid") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={10 + (i % 3) * 90} y={18 + Math.floor(i / 3) * 50} width="82" height="44" rx="4" fill="#e0f2fe" stroke={line} strokeWidth="0.5" />
      ))}
    </svg>
  );

  if (type === "image-slider") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#1e293b" />
      <rect x="20" y="10" width="240" height="80" rx="5" fill="#334155" />
      <rect x="30" y="72" width="180" height="5" rx="1" fill="white" opacity="0.7" />
      <rect x="30" y="62" width="120" height="7" rx="2" fill="white" opacity="0.9" />
      <g fill="white" opacity="0.6">
        <circle cx="122" cy="105" r="4" />
        <circle cx="136" cy="105" r="3" fill="white" opacity="0.3" />
        <circle cx="150" cy="105" r="3" fill="white" opacity="0.3" />
      </g>
      <polygon points="248,52 258,46 258,58" fill="white" opacity="0.6" />
      <polygon points="32,52 22,46 22,58" fill="white" opacity="0.6" />
    </svg>
  );

  if (type === "video-hero") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#0f172a" />
      <rect width="280" height="120" fill="rgba(0,0,0,0.45)" />
      <rect x="60" y="22" width="160" height="10" rx="3" fill="white" opacity="0.9" />
      <rect x="80" y="38" width="120" height="5" rx="1" fill="white" opacity="0.5" />
      <circle cx="140" cy="76" r="20" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5" />
      <polygon points="133,68 133,84 153,76" fill="white" opacity="0.85" />
    </svg>
  );

  if (type === "video-embed") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      <rect x="20" y="22" width="240" height="84" rx="6" fill="#1e293b" />
      <circle cx="140" cy="64" r="22" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="1.5" />
      <polygon points="132,54 132,74 154,64" fill="white" opacity="0.85" />
    </svg>
  );

  if (type === "steps-horizontal") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="70" y="6" width="140" height="7" rx="2" fill={dark} />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <circle cx={26 + i * 60} cy="40" r="12" fill="#1e3a2f" />
          <rect x={14 + i * 60} y="36" width="24" height="8" rx="2" fill="#4ade80" opacity="0.9" />
          <rect x={8 + i * 60} y="60" width="40" height="5" rx="1" fill={dark} />
          <rect x={10 + i * 60} y="70" width="36" height="4" rx="1" fill={line} />
          <rect x={12 + i * 60} y="78" width="32" height="4" rx="1" fill={line} />
          {i < 3 && <line x1={42 + i * 60} y1="40" x2={52 + i * 60} y2="40" stroke={line} strokeWidth="1.5" strokeDasharray="3,2" />}
        </g>
      ))}
    </svg>
  );

  if (type === "steps-vertical") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <line x1="30" y1="16" x2="30" y2="115" stroke={line} strokeWidth="1.5" />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <circle cx="30" cy={22 + i * 26} r="8" fill="#1e3a2f" />
          <rect x="44" y={16 + i * 26} width="28" height="5" rx="1" fill={dark} />
          <rect x="44" y={25 + i * 26} width="130" height="4" rx="1" fill={accent} />
        </g>
      ))}
    </svg>
  );

  if (type === "logos-strip") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="60" y="10" width="160" height="6" rx="2" fill={line} />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={8 + i * 44} y="32" width="38" height="24" rx="4" fill="white" stroke={line} strokeWidth="1" />
      ))}
      <rect x="8" y="68" width="264" height="6" rx="2" fill={line} opacity="0.5" />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={8 + i * 44} y="84" width="38" height="24" rx="4" fill="white" stroke={line} strokeWidth="1" />
      ))}
    </svg>
  );

  if (type === "logos-marquee") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="60" y="8" width="160" height="7" rx="2" fill={dark} />
      <rect x="0" y="28" width="280" height="34" fill="white" />
      {[-1, 0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={i * 46 - 10} y="34" width="38" height="22" rx="4" fill={bg} stroke={line} strokeWidth="1" />
      ))}
      <rect x="0" y="28" width="18" height="34" fill={`url(#fl)`} opacity="0.8" />
      <rect x="262" y="28" width="18" height="34" fill={bg} opacity="0.9" />
      <rect x="0" y="76" width="280" height="34" fill="white" />
      {[-1, 0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={i * 46 + 16} y="82" width="38" height="22" rx="4" fill={bg} stroke={line} strokeWidth="1" />
      ))}
    </svg>
  );

  if (type === "tabs-content") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="70" y="6" width="140" height="7" rx="2" fill={dark} />
      <rect x="10" y="20" width="68" height="16" rx="3" fill="#1e3a2f" />
      <rect x="84" y="20" width="68" height="16" rx="3" fill={line} />
      <rect x="158" y="20" width="68" height="16" rx="3" fill={line} />
      <rect x="10" y="36" width="260" height="76" rx="0 0 6 6" fill="white" stroke={line} strokeWidth="1" />
      <rect x="20" y="48" width="100" height="8" rx="2" fill={dark} />
      <rect x="20" y="62" width="220" height="4" rx="1" fill={line} />
      <rect x="20" y="70" width="200" height="4" rx="1" fill={line} />
      <rect x="20" y="78" width="180" height="4" rx="1" fill={line} />
      <rect x="20" y="96" width="60" height="12" rx="3" fill="#1e3a2f" />
    </svg>
  );

  if (type === "comparison-slider") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="70" y="6" width="140" height="7" rx="2" fill={dark} />
      <rect x="10" y="20" width="126" height="90" rx="5" fill="#fef2f2" />
      <rect x="144" y="20" width="126" height="90" rx="5" fill="#f0fdf4" />
      <rect x="10" y="20" width="62" height="10" rx="2" fill="#ef4444" opacity="0.8" />
      <rect x="10" y="20" width="36" height="10" rx="2" fill="white" opacity="0.7" />
      <rect x="144" y="20" width="62" height="10" rx="2" fill="#22c55e" opacity="0.8" />
      <line x1="140" y1="14" x2="140" y2="116" stroke={dark} strokeWidth="2" />
      <circle cx="140" cy="65" r="10" fill={dark} />
      <polygon points="134,61 134,69 126,65" fill="white" />
      <polygon points="146,61 146,69 154,65" fill="white" />
    </svg>
  );

  if (type === "competitor-comparison") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="8" width="80" height="7" rx="2" fill={dark} />
      <rect x="10" y="22" width="260" height="14" rx="3" fill="#1e3a2f" />
      <rect x="18" y="28" width="80" height="4" rx="1" fill="white" opacity="0.5" />
      <rect x="138" y="28" width="40" height="4" rx="1" fill="#4ade80" />
      <rect x="210" y="28" width="40" height="4" rx="1" fill="white" opacity="0.4" />
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <rect x="10" y={40 + i * 14} width="260" height="12" rx="2" fill={i % 2 === 0 ? "white" : bg} />
          <rect x="18" y={44 + i * 14} width="80" height="4" rx="1" fill={accent} />
          <rect x="148" y={43 + i * 14} width="14" height="6" rx="2" fill="#d1fae5" />
          <rect x="218" y={43 + i * 14} width="14" height="6" rx="2" fill="#fee2e2" />
        </g>
      ))}
    </svg>
  );

  if (type === "map-location" || type === "offices-map") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      <rect x="10" y="20" width="170" height="92" rx="5" fill="#e0f2fe" />
      <rect x="30" y="40" width="130" height="10" rx="2" fill="#93c5fd" />
      <rect x="20" y="58" width="110" height="6" rx="2" fill="#bfdbfe" />
      <rect x="20" y="70" width="90" height="4" rx="1" fill="#93c5fd" />
      <polygon points="90,42 86,54 94,54" fill="#1d4ed8" />
      <circle cx="90" cy="42" r="5" fill="#1d4ed8" />
      <rect x="188" y="20" width="84" height="92" rx="5" fill="white" stroke={line} strokeWidth="1" />
      <rect x="196" y="30" width="60" height="5" rx="1" fill={dark} />
      <rect x="196" y="40" width="52" height="4" rx="1" fill={line} />
      <rect x="196" y="50" width="48" height="4" rx="1" fill={line} />
      <rect x="196" y="70" width="60" height="12" rx="3" fill="#1e3a2f" />
    </svg>
  );

  if (type === "hero-split") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="white" />
      <rect x="10" y="16" width="6" height="5" rx="1" fill="#4ade80" />
      <rect x="20" y="15" width="80" height="6" rx="1" fill={line} />
      <rect x="10" y="28" width="120" height="12" rx="3" fill={dark} />
      <rect x="10" y="46" width="110" height="5" rx="1" fill={accent} />
      <rect x="10" y="56" width="100" height="4" rx="1" fill={line} />
      <rect x="10" y="76" width="55" height="16" rx="4" fill="#1e3a2f" />
      <rect x="72" y="76" width="55" height="16" rx="4" fill="none" stroke="#1e3a2f" strokeWidth="1.5" />
      <rect x="148" y="10" width="122" height="100" rx="6" fill="#dbeafe" />
    </svg>
  );

  if (type === "hero-minimal") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="white" />
      <rect x="90" y="12" width="100" height="8" rx="4" fill="#f0fdf4" stroke="#4ade80" strokeWidth="1" />
      <rect x="30" y="28" width="220" height="14" rx="3" fill={dark} />
      <rect x="50" y="48" width="180" height="5" rx="1" fill={accent} />
      <rect x="60" y="57" width="160" height="5" rx="1" fill={line} />
      <rect x="70" y="74" width="140" height="22" rx="5" fill="#1e3a2f" />
      <rect x="82" y="81" width="116" height="8" rx="2" fill="#4ade80" opacity="0.8" />
    </svg>
  );

  if (type === "hero-announcement") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#0f172a" />
      <rect x="60" y="18" width="160" height="10" rx="5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <rect x="80" y="36" width="120" height="12" rx="3" fill="white" opacity="0.9" />
      <rect x="60" y="54" width="160" height="5" rx="1" fill="white" opacity="0.4" />
      <rect x="32" y="70" width="50" height="22" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="35" y="74" width="44" height="5" rx="1" fill="#4ade80" />
      <rect x="35" y="84" width="44" height="5" rx="1" fill="white" opacity="0.4" />
      <rect x="98" y="70" width="50" height="22" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="164" y="70" width="50" height="22" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="90" y="100" width="100" height="14" rx="4" fill="#4ade80" />
    </svg>
  );

  if (type === "rich-text") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="50" y="8" width="180" height="9" rx="2" fill={dark} />
      <rect x="20" y="26" width="240" height="5" rx="1" fill={line} />
      <rect x="20" y="35" width="230" height="4" rx="1" fill={line} />
      <rect x="20" y="44" width="220" height="4" rx="1" fill={line} />
      <rect x="20" y="58" width="6" height="24" rx="2" fill="#4ade80" />
      <rect x="32" y="60" width="220" height="5" rx="1" fill={accent} />
      <rect x="32" y="69" width="200" height="4" rx="1" fill={accent} opacity="0.6" />
      <rect x="32" y="78" width="180" height="4" rx="1" fill={accent} opacity="0.4" />
      <rect x="20" y="92" width="240" height="4" rx="1" fill={line} />
      <rect x="20" y="101" width="200" height="4" rx="1" fill={line} />
    </svg>
  );

  if (type === "split-content") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="10" width="120" height="100" rx="6" fill="#dbeafe" />
      <rect x="144" y="12" width="126" height="10" rx="3" fill={dark} />
      <rect x="144" y="28" width="116" height="4" rx="1" fill={line} />
      <rect x="144" y="36" width="100" height="4" rx="1" fill={line} />
      <rect x="144" y="44" width="110" height="4" rx="1" fill={line} />
      <rect x="144" y="52" width="96" height="4" rx="1" fill={line} />
      <rect x="144" y="70" width="70" height="14" rx="4" fill="#1e3a2f" />
    </svg>
  );

  if (type === "icon-list") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="60" y="6" width="160" height="7" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <circle cx={22} cy={28 + i * 22} r="7" fill="#d1fae5" />
          <rect x={34} y={24 + i * 22} width="90" height="5" rx="1" fill={dark} />
          <circle cx={152} cy={28 + i * 22} r="7" fill="#d1fae5" />
          <rect x={164} y={24 + i * 22} width="90" height="5" rx="1" fill={dark} />
        </g>
      ))}
    </svg>
  );

  if (type === "stats-progress") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="60" y="6" width="160" height="7" rx="2" fill={dark} />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x="20" y={24 + i * 22} width="180" height="5" rx="1" fill={dark} />
          <rect x="210" y={22 + i * 22} width="36" height="8" rx="2" fill={line} />
          <rect x="222" y={23 + i * 22} width="22" height="6" rx="1" fill={dark} />
          <rect x="20" y={34 + i * 22} width="220" height="6" rx="3" fill={line} />
          <rect x="20" y={34 + i * 22} width={80 + i * 35} height="6" rx="3" fill="#4ade80" />
        </g>
      ))}
    </svg>
  );

  if (type === "stats-impact") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#111827" />
      <rect x="60" y="8" width="160" height="8" rx="2" fill="white" opacity="0.6" />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x={14 + i * 64} y="28" width="58" height="80" rx="4" fill="rgba(255,255,255,0.05)" />
          <rect x={18 + i * 64} y="38" width="48" height="16" rx="2" fill="#4ade80" opacity="0.9" />
          <rect x={18 + i * 64} y="60" width="44" height="5" rx="1" fill="white" opacity="0.7" />
          <rect x={22 + i * 64} y="70" width="36" height="4" rx="1" fill="white" opacity="0.3" />
        </g>
      ))}
    </svg>
  );

  if (type === "services-cards") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="70" y="6" width="140" height="7" rx="2" fill={dark} />
      {[0, 1].map(r => (
        [0, 1].map(c => (
          <g key={`${r}-${c}`}>
            <rect x={8 + c * 136} y={20 + r * 50} width="124" height="44" rx="5" fill="white" stroke={line} strokeWidth="1" />
            <rect x={16 + c * 136} y={28 + r * 50} width="18" height="18" rx="9" fill="#dbeafe" />
            <rect x={40 + c * 136} y={28 + r * 50} width="72" height="5" rx="1" fill={dark} />
            <rect x={40 + c * 136} y={37 + r * 50} width="84" height="4" rx="1" fill={line} />
            <rect x={40 + c * 136} y={46 + r * 50} width="64" height="4" rx="1" fill={line} />
          </g>
        ))
      ))}
    </svg>
  );

  if (type === "news-cards-horizontal") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="6" width="80" height="7" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="10" y={20 + i * 32} width="260" height="26" rx="4" fill="white" stroke={line} strokeWidth="1" />
          <rect x="16" y={24 + i * 32} width="36" height="18" rx="3" fill="#e0f2fe" />
          <rect x="58" y={26 + i * 32} width="120" height="5" rx="1" fill={dark} />
          <rect x="58" y={35 + i * 32} width="90" height="4" rx="1" fill={line} />
          <rect x="236" y={26 + i * 32} width="26" height="4" rx="1" fill="#0ea5e9" />
        </g>
      ))}
    </svg>
  );

  if (type === "waitlist-form") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#0f172a" />
      <rect x="50" y="14" width="180" height="10" rx="3" fill="white" opacity="0.9" />
      <rect x="40" y="30" width="200" height="5" rx="1" fill="white" opacity="0.4" />
      <rect x="40" y="40" width="180" height="5" rx="1" fill="white" opacity="0.4" />
      <rect x="20" y="58" width="166" height="28" rx="4" fill="rgba(255,255,255,0.1)" />
      <rect x="28" y="68" width="110" height="8" rx="2" fill="white" opacity="0.2" />
      <rect x="194" y="58" width="66" height="28" rx="4" fill="#4ade80" />
      <rect x="200" y="68" width="54" height="8" rx="2" fill="#166534" />
      <rect x="80" y="96" width="120" height="4" rx="1" fill="white" opacity="0.2" />
    </svg>
  );

  if (type === "multi-step-form") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="70" y="6" width="140" height="7" rx="2" fill={dark} />
      <g>
        {[0, 1, 2].map(i => (
          <g key={i}>
            <circle cx={60 + i * 80} cy="28" r="10" fill={i === 0 ? "#1e3a2f" : i === 1 ? "#dbeafe" : bg} stroke={i === 2 ? line : "none"} strokeWidth="1" />
            <rect x={52 + i * 80} y="24" width="16" height="8" rx="2" fill={i === 0 ? "#4ade80" : line} />
            {i < 2 && <line x1={74 + i * 80} y1="28" x2={94 + i * 80} y2="28" stroke={line} strokeWidth="1" strokeDasharray="4,2" />}
          </g>
        ))}
      </g>
      <rect x="20" y="46" width="240" height="12" rx="3" fill="white" stroke={line} strokeWidth="1" />
      <rect x="20" y="64" width="112" height="12" rx="3" fill="white" stroke={line} strokeWidth="1" />
      <rect x="148" y="64" width="112" height="12" rx="3" fill="white" stroke={line} strokeWidth="1" />
      <rect x="20" y="82" width="240" height="20" rx="3" fill="white" stroke={line} strokeWidth="1" />
      <rect x="90" y="108" width="100" height="10" rx="4" fill="#1e3a2f" />
    </svg>
  );

  if (type === "jobs-feed") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="6" width="100" height="7" rx="2" fill={dark} />
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <rect x="10" y={20 + i * 19} width="260" height="14" rx="3" fill="white" stroke={line} strokeWidth="1" />
          <rect x="18" y={24 + i * 19} width="100" height="5" rx="1" fill={dark} />
          <rect x="180" y={23 + i * 19} width="40" height="7" rx="2" fill="#dbeafe" />
          <rect x="232" y={23 + i * 19} width="30" height="7" rx="2" fill="#d1fae5" />
        </g>
      ))}
    </svg>
  );

  if (type === "members-feed") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <g key={i}>
          <rect x={8 + (i % 3) * 90} y={20 + Math.floor(i / 3) * 50} width="82" height="44" rx="5" fill="white" stroke={line} strokeWidth="1" />
          <circle cx={49 + (i % 3) * 90} cy={34 + Math.floor(i / 3) * 50} r="12" fill="#dbeafe" />
          <rect x={22 + (i % 3) * 90} y={50 + Math.floor(i / 3) * 50} width="58" height="4" rx="1" fill={dark} />
          <rect x={28 + (i % 3) * 90} y={58 + Math.floor(i / 3) * 50} width="46" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "podcast-section") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="10" y={20 + i * 31} width="260" height="26" rx="4" fill="white" stroke={line} strokeWidth="1" />
          <rect x="16" y={24 + i * 31} width="36" height="18" rx="4" fill="#f3e8ff" />
          <circle cx="34" cy={33 + i * 31} r="8" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
          <polygon points={`31,${30 + i * 31} 31,${37 + i * 31} 38,${33 + i * 31}`} fill="#7c3aed" />
          <rect x="60" y={26 + i * 31} width="120" height="5" rx="1" fill={dark} />
          <rect x="60" y={35 + i * 31} width="80" height="4" rx="1" fill={line} />
          <rect x="218" y={26 + i * 31} width="44" height="4" rx="1" fill={accent} />
        </g>
      ))}
    </svg>
  );

  if (type === "social-feed") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <g key={i}>
          <rect x={8 + (i % 3) * 90} y={20 + Math.floor(i / 3) * 50} width="82" height="44" rx="3" fill="#f1f5f9" />
          <rect x={10 + (i % 3) * 90} y={22 + Math.floor(i / 3) * 50} width="6" height="6" rx="3" fill="#e2e8f0" />
          <rect x={50 + (i % 3) * 90} y={22 + Math.floor(i / 3) * 50} width="38" height="30" rx="2" fill="#e2e8f0" />
          <rect x={10 + (i % 3) * 90} y={56 + Math.floor(i / 3) * 50} width="70" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "about-section") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="10" y="10" width="110" height="100" rx="6" fill="#dbeafe" />
      <rect x="134" y="10" width="136" height="10" rx="3" fill={dark} />
      <rect x="134" y="26" width="126" height="5" rx="1" fill={line} />
      <rect x="134" y="35" width="116" height="4" rx="1" fill={line} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="134" y={52 + i * 20} width="136" height="16" rx="3" fill="white" stroke={line} strokeWidth="1" />
          <rect x="140" y={56 + i * 20} width="18" height="8" rx="2" fill="#d1fae5" />
          <rect x="164" y={58 + i * 20} width="80" height="4" rx="1" fill={dark} />
        </g>
      ))}
    </svg>
  );

  if (type === "awards-section") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="80" y="6" width="120" height="7" rx="2" fill={dark} />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x={8 + i * 66} y="20" width="58" height="46" rx="5" fill="white" stroke={line} strokeWidth="1" />
          <rect x={18 + i * 66} y="28" width="22" height="22" rx="2" fill="#fef3c7" />
          <rect x={14 + i * 66} y="54" width="40" height="4" rx="1" fill={dark} />
          <rect x={16 + i * 66} y="62" width="36" height="3" rx="1" fill={line} />
        </g>
      ))}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={8 + i * 90} y="74" width="82" height="36" rx="4" fill="white" stroke={line} strokeWidth="1" />
          <rect x="16" y="80" width="30" height="5" rx="1" fill={dark} />
          <rect x="16" y="89" width="66" height="4" rx="1" fill={line} />
          <rect x="16" y="97" width="54" height="4" rx="1" fill={line} />
        </g>
      ))}
    </svg>
  );

  if (type === "cta-newsletter") return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill="#4338ca" />
      <rect x="12" y="24" width="110" height="10" rx="3" fill="white" opacity="0.9" />
      <rect x="12" y="40" width="100" height="5" rx="1" fill="white" opacity="0.5" />
      <rect x="12" y="50" width="90" height="5" rx="1" fill="white" opacity="0.5" />
      <rect x="144" y="30" width="120" height="26" rx="4" fill="rgba(255,255,255,0.15)" />
      <rect x="152" y="38" width="74" height="10" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="230" y="30" width="34" height="26" rx="4" fill="white" />
      <rect x="236" y="38" width="22" height="10" rx="2" fill="#4338ca" />
      <rect x="144" y="70" width="130" height="4" rx="1" fill="white" opacity="0.3" />
    </svg>
  );

  // Generic fallback
  return (
    <svg viewBox="0 0 280 120" style={style}>
      <rect width="280" height="120" fill={bg} />
      <rect x="20" y="20" width="240" height="80" rx="6" fill="white" stroke={line} strokeWidth="1" />
      <rect x="90" y="40" width="100" height="8" rx="2" fill={dark} />
      <rect x="60" y="56" width="160" height="5" rx="1" fill={line} />
      <rect x="70" y="66" width="140" height="5" rx="1" fill={line} />
    </svg>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Hero: "bg-blue-100 text-blue-700",
  Features: "bg-violet-100 text-violet-700",
  Content: "bg-purple-100 text-purple-700",
  Cards: "bg-green-100 text-green-700",
  Statistics: "bg-amber-100 text-amber-700",
  Media: "bg-pink-100 text-pink-700",
  Testimonials: "bg-rose-100 text-rose-700",
  Team: "bg-teal-100 text-teal-700",
  Blog: "bg-sky-100 text-sky-700",
  Portfolio: "bg-indigo-100 text-indigo-700",
  Pricing: "bg-emerald-100 text-emerald-700",
  Gallery: "bg-fuchsia-100 text-fuchsia-700",
  Video: "bg-red-100 text-red-700",
  Steps: "bg-lime-100 text-lime-700",
  Logos: "bg-slate-100 text-slate-700",
  Tabs: "bg-blue-100 text-blue-600",
  Comparison: "bg-orange-100 text-orange-700",
  Maps: "bg-cyan-100 text-cyan-700",
  Forms: "bg-orange-100 text-orange-700",
  Dynamic: "bg-cyan-100 text-cyan-700",
  Custom: "bg-gray-100 text-gray-700",
};

export default function SectionTemplateGallery({ onSelect, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return SECTION_TEMPLATES.filter((t) => {
      const matchesCat = activeCategory === "All" || t.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.nameAr.includes(q) ||
        t.componentType.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-5xl mx-4 rounded-2xl bg-white shadow-2xl flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Section</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Choose a template or start from blank
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Search + Category tabs ─────────────────────────────────── */}
        <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            />
          </div>
          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(["All", ...TEMPLATE_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as TemplateCategory | "All")}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Template Grid ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No templates match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer hint ───────────────────────────────────────────── */}
        <div className="px-6 py-3 border-t border-gray-100 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            All templates include bilingual placeholder content (EN + AR) — edit any field in the builder
          </p>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: SectionTemplate;
  onSelect: (t: SectionTemplate) => void;
}) {
  const isBlank = template.id === "custom-blank";
  const isDynamic = template.category === "Dynamic";

  return (
    <div className="group relative border border-gray-200 rounded-xl overflow-hidden hover:border-green-400 hover:shadow-md transition-all cursor-pointer bg-white">
      {/* Mockup preview */}
      <div
        className="relative w-full overflow-hidden bg-gray-50"
        style={{ height: 120 }}
      >
        <TemplateMockup type={template.componentType} />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/10 transition-colors" />
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                CATEGORY_COLORS[template.category] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {template.category}
            </span>
            {isDynamic && (
              <span className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700">
                <Zap className="h-2.5 w-2.5" />
                Live
              </span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">
          {template.name}
        </h3>
        <p className="text-xs text-gray-400 mb-1">{template.nameAr}</p>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Action button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onSelect(template)}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            isBlank
              ? "border-2 border-dashed border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-700 bg-transparent"
              : "bg-green-700 text-white hover:bg-green-800"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          {isBlank ? "Start from Blank" : "Use Template"}
        </button>
      </div>
    </div>
  );
}
