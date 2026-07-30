"use client";

/**
 * BilingualBodyEditor
 *
 * Renders two tabbed sections:
 *   1. Arabic (RTL) — excerpt_ar + body_ar
 *   2. English (LTR) — excerpt (EN) + body_en
 *
 * Props surface the four field values + onChange callbacks so the parent
 * form keeps full ownership of state.
 */

import { useState } from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { useLanguage } from "@/lib/language-context";
import { AlertCircle, Globe } from "lucide-react";

const EXCERPT_LIMIT = 300;

interface Props {
  // Arabic fields
  excerptAr: string;
  bodyAr: string;
  // English fields
  excerptEn: string;   // maps to form.excerpt
  bodyEn: string;
  // Callbacks
  onExcerptArChange: (v: string) => void;
  onBodyArChange:    (v: string) => void;
  onExcerptEnChange: (v: string) => void;
  onBodyEnChange:    (v: string) => void;
}

export function BilingualBodyEditor({
  excerptAr, bodyAr, excerptEn, bodyEn,
  onExcerptArChange, onBodyArChange,
  onExcerptEnChange, onBodyEnChange,
}: Props) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"ar" | "en">("ar");

  const arLen  = excerptAr.length;
  const enLen  = excerptEn.length;
  const arOver = arLen > EXCERPT_LIMIT;
  const enOver = enLen > EXCERPT_LIMIT;

  const hasArBody = bodyAr.replace(/<[^>]*>/g, "").trim().length > 0;
  const hasEnBody = bodyEn.replace(/<[^>]*>/g, "").trim().length > 0;

  return (
    <div className="space-y-0 rounded-xl border border-border overflow-hidden">

      {/* ── Language tab bar ─────────────────────────────────────────────── */}
      <div className="flex items-center border-b border-border bg-muted/30">
        <button
          type="button"
          onClick={() => setTab("ar")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "ar"
              ? "border-soil-clay text-soil-clay bg-white"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          {t("Arabic", "العربية")}
          {/* Dot indicator when content exists */}
          {hasArBody && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ms-1" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("en")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "en"
              ? "border-soil-clay text-soil-clay bg-white"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          {t("English", "الإنجليزية")}
          {hasEnBody && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ms-1" />
          )}
        </button>

        {/* Missing-content warning chips */}
        <div className="ms-auto flex items-center gap-2 px-4">
          {!hasArBody && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <AlertCircle className="h-3 w-3" />
              {t("Arabic body empty", "المحتوى العربي فارغ")}
            </span>
          )}
          {!hasEnBody && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <AlertCircle className="h-3 w-3" />
              {t("English body empty", "المحتوى الإنجليزي فارغ")}
            </span>
          )}
        </div>
      </div>

      {/* ── Arabic panel ─────────────────────────────────────────────────── */}
      <div className={`p-5 space-y-4 ${tab === "ar" ? "" : "hidden"}`} dir="rtl">
        {/* Excerpt AR */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {t("Arabic Excerpt", "المقتطف (عربي)")}
            </label>
            <span className={`text-xs ${arOver ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
              {arOver && <AlertCircle className="inline h-3 w-3 me-1" />}
              {arLen} / {EXCERPT_LIMIT}
            </span>
          </div>
          <textarea
            dir="rtl"
            value={excerptAr}
            onChange={(e) => onExcerptArChange(e.target.value)}
            rows={3}
            placeholder="ملخص قصير يظهر في القوائم ونتائج البحث…"
            className={`w-full rounded-lg border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-soil-dark/30 leading-relaxed ${
              arOver ? "border-red-400" : "border-input"
            }`}
          />
        </div>
        {/* Body AR */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {t("Arabic Body", "المحتوى (عربي)")}
          </label>
          <div dir="rtl">
            <RichTextEditor value={bodyAr} onChange={onBodyArChange} />
          </div>
        </div>
      </div>

      {/* ── English panel ─────────────────────────────────────────────────── */}
      <div className={`p-5 space-y-4 ${tab === "en" ? "" : "hidden"}`} dir="ltr">
        {/* Excerpt EN */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              English Excerpt
            </label>
            <span className={`text-xs ${enOver ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
              {enOver && <AlertCircle className="inline h-3 w-3 me-1" />}
              {enLen} / {EXCERPT_LIMIT}
            </span>
          </div>
          <textarea
            dir="ltr"
            value={excerptEn}
            onChange={(e) => onExcerptEnChange(e.target.value)}
            rows={3}
            placeholder="A short summary shown in listings and search results…"
            className={`w-full rounded-lg border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-soil-dark/30 leading-relaxed ${
              enOver ? "border-red-400" : "border-input"
            }`}
          />
        </div>
        {/* Body EN */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">English Body</label>
          <RichTextEditor value={bodyEn} onChange={onBodyEnChange} />
        </div>
      </div>

    </div>
  );
}
