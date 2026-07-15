"use client";

/**
 * SectionBuilderPanel
 *
 * A full-height slide-over panel that opens when the admin clicks "Edit Content"
 * on a section row.  Layout:
 *
 *   ┌──────────────────────────────────────────────────┐
 *   │  Header: section name • type badge • Save • Close │
 *   ├──────────────────────────┬───────────────────────┤
 *   │  Left pane (60%)         │  Right pane (40%)     │
 *   │  3 tabs:                 │  Scaled live preview  │
 *   │   Content (data)         │  (CSS scale 0.45)     │
 *   │   Layout (config)        │                       │
 *   │   Style (styling)        │                       │
 *   │  ───────────────         │                       │
 *   │  ▶ Advanced JSON         │                       │
 *   └──────────────────────────┴───────────────────────┘
 *
 * Design decisions:
 *  - Preview: CSS transform scale(0.45) thumbnail with pointer-events-none
 *  - Bilingual: AR optional, EN fallback (amber badge in field renderer)
 *  - Save: serialises form state back to JSON strings → updateSiteSection()
 *  - Keyboard: Escape = close, Ctrl/Cmd+S = save
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Eye,
  Monitor,
  Smartphone,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSchema } from "@/lib/section-field-schemas";
import { SectionFieldRenderer } from "@/components/admin/SectionFieldRenderer";
import { updateSiteSection } from "@/lib/site-sections";
import { toast } from "@/components/ui/toast";
import type { SiteSection } from "@/types";
import { useLanguage } from "@/lib/language-context";

// Section component map for preview
import {
  HeroSection,
  HeroCarouselSection,
  OurFocusAreasSection,
  JoinOurCommunitySection,
  TestimonialsSection,
  StatisticsSection,
  NewsletterSection,
  ContactFormSection,
  PublicationsCarouselSection,
} from "@/components/sections";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionBuilderPanelProps {
  section: SiteSection;
  onClose: () => void;
  onSaved: () => void;
}

type PanelTab = "content" | "layout" | "style";
type PreviewLang = "en" | "ar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJson(val: unknown): Record<string, unknown> {
  if (!val) return {};
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return {}; }
  }
  return val as Record<string, unknown>;
}

function serializeJson(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2);
}

// ---------------------------------------------------------------------------
// Component-type display metadata
// ---------------------------------------------------------------------------

const TYPE_BADGE_COLORS: Record<string, string> = {
  hero:                    "bg-blue-100 text-blue-700",
  "hero-carousel":         "bg-blue-200 text-blue-800",
  cta:                     "bg-orange-100 text-orange-700",
  "card-group":            "bg-green-100 text-green-700",
  stats:                   "bg-purple-100 text-purple-700",
  counter:                 "bg-purple-100 text-purple-700",
  testimonial:             "bg-pink-100 text-pink-700",
  newsletter:              "bg-teal-100 text-teal-700",
  "contact-form":          "bg-yellow-100 text-yellow-700",
  "publications-carousel": "bg-amber-100 text-amber-700",
  team:                    "bg-indigo-100 text-indigo-700",
  timeline:                "bg-red-100 text-red-700",
  faq:                     "bg-cyan-100 text-cyan-700",
  banner:                  "bg-lime-100 text-lime-700",
};

// ---------------------------------------------------------------------------
// Preview renderer — renders the matching section component with current values
// ---------------------------------------------------------------------------

function SectionPreviewRenderer({
  componentType,
  slug,
  config,
  data,
}: {
  componentType: string;
  slug?: string;
  config: Record<string, unknown>;
  data: Record<string, unknown>;
}) {
  if (componentType === "hero-carousel") {
    return <HeroCarouselSection config={{ ...config, slides: (config.slides as unknown[]) ?? [] }} />;
  }
  if (componentType === "hero" || slug === "hero-banner") {
    return <HeroSection config={config} />;
  }
  if (componentType === "card-group") {
    return <OurFocusAreasSection config={config} data={data} />;
  }
  if (componentType === "cta") {
    return <JoinOurCommunitySection config={config} />;
  }
  if (componentType === "stats" || componentType === "counter") {
    return <StatisticsSection data={data} config={config} />;
  }
  if (componentType === "testimonial") {
    return <TestimonialsSection data={data} config={config} />;
  }
  if (componentType === "newsletter") {
    return <NewsletterSection config={config} />;
  }
  if (componentType === "contact-form") {
    return <ContactFormSection config={config} />;
  }
  if (componentType === "publications-carousel") {
    return <PublicationsCarouselSection config={config} />;
  }

  // Generic fallback preview
  const title =
    (config.titleEn as string) ||
    (config.title as string) ||
    (data.titleEn as string) ||
    (data.title as string) ||
    componentType;
  return (
    <div className="py-16 px-8 bg-gray-50 text-center">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
        {componentType} preview
      </p>
      <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function SectionBuilderPanel({
  section,
  onClose,
  onSaved,
}: SectionBuilderPanelProps) {
  const { language, t } = useLanguage();
  const schema = getSchema(section.componentType);

  // Form state — three flat value maps matching the three JSON columns
  const [dataValues, setDataValues] = useState<Record<string, unknown>>(
    () => parseJson(section.data)
  );
  const [configValues, setConfigValues] = useState<Record<string, unknown>>(
    () => parseJson(section.config)
  );
  const [stylingValues, setStylingValues] = useState<Record<string, unknown>>(
    () => parseJson(section.styling)
  );

  // Advanced JSON editors (fallback)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rawData, setRawData] = useState(() => serializeJson(parseJson(section.data)));
  const [rawConfig, setRawConfig] = useState(() => serializeJson(parseJson(section.config)));
  const [rawStyling, setRawStyling] = useState(() => serializeJson(parseJson(section.styling)));

  const [activeTab, setActiveTab] = useState<PanelTab>("content");
  const [previewLang, setPreviewLang] = useState<PreviewLang>(language as PreviewLang ?? "en");
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Keep raw JSON in sync when visual fields change (with 200ms debounce)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      setRawData(serializeJson(dataValues));
      setRawConfig(serializeJson(configValues));
      setRawStyling(serializeJson(stylingValues));
    }, 200);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [dataValues, configValues, stylingValues]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataValues, configValues, stylingValues]);

  // Parse raw advanced JSON back to values when the user edits them
  function applyRawJson() {
    try {
      setDataValues(JSON.parse(rawData));
      setConfigValues(JSON.parse(rawConfig));
      setStylingValues(JSON.parse(rawStyling));
    } catch {
      toast({ title: "Invalid JSON", description: "Please fix the JSON before applying.", variant: "destructive" });
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateSiteSection(section.id, {
        data: serializeJson(dataValues) as any,
        config: serializeJson(configValues) as any,
        styling: serializeJson(stylingValues) as any,
      });
      toast({ title: t("Section saved", "تم حفظ القسم"), variant: "success" });
      onSaved();
    } catch {
      toast({ title: t("Failed to save", "فشل الحفظ"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // Live preview data (debounced — the 200ms sync above feeds this)
  const previewConfig = useMemo(() => configValues, [configValues]);
  const previewData   = useMemo(() => dataValues, [dataValues]);

  const typeBadge = TYPE_BADGE_COLORS[section.componentType] ?? "bg-gray-100 text-gray-700";

  // Tab field counts for badge indicators
  const contentFieldCount = schema.dataFields.length;
  const layoutFieldCount  = schema.configFields.length;
  const styleFieldCount   = schema.stylingFields.length;

  // Preview container width
  const PREVIEW_FULL_WIDTH = 1280;
  const PREVIEW_MOBILE_WIDTH = 390;
  const PREVIEW_PANEL_WIDTH_RATIO = 0.38; // ~38vw
  const [panelWidth, setPanelWidth] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function measure() {
      if (previewRef.current) setPanelWidth(previewRef.current.offsetWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const targetWidth   = previewMode === "mobile" ? PREVIEW_MOBILE_WIDTH : PREVIEW_FULL_WIDTH;
  const scaleRatio    = panelWidth > 0 ? panelWidth / targetWidth : 0.35;
  const scaledHeight  = panelWidth > 0 ? panelWidth / scaleRatio * 0.35 : 240;

  const panel = (
    <div className="fixed inset-0 z-[200] flex">
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <motion.div
        key="panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="absolute right-0 top-0 h-full w-full max-w-5xl bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide shrink-0",
                typeBadge
              )}
            >
              {section.componentType}
            </span>
            <h2 className="font-semibold text-gray-900 text-sm truncate">{section.name}</h2>
            {section.slug && (
              <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                /{section.slug}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Preview language toggle */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setPreviewLang("en")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                  previewLang === "en" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                )}
              >
                <Globe className="h-3 w-3 inline mr-1" />EN
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang("ar")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                  previewLang === "ar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                )}
              >
                AR عر
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-soil-dark text-white rounded-lg hover:bg-deep-soil disabled:opacity-60 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? t("Saving…", "جاري الحفظ…") : t("Save", "حفظ")}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Body: two-pane layout ───────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left pane: field editors ─── */}
          <div className="flex flex-col w-[60%] border-r border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 shrink-0 px-1">
              {(
                [
                  { id: "content" as PanelTab, labelEn: "Content",  labelAr: "المحتوى",     count: contentFieldCount },
                  { id: "layout"  as PanelTab, labelEn: "Layout",   labelAr: "التخطيط",     count: layoutFieldCount  },
                  { id: "style"   as PanelTab, labelEn: "Style",    labelAr: "التصميم",     count: styleFieldCount   },
                ] as { id: PanelTab; labelEn: string; labelAr: string; count: number }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2",
                    activeTab === tab.id
                      ? "border-soil-clay text-soil-dark"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  {previewLang === "ar" ? tab.labelAr : tab.labelEn}
                  {tab.count > 0 && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                        activeTab === tab.id
                          ? "bg-soil-clay text-white"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Field scroll area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-5">
                {/* Content tab — data fields */}
                {activeTab === "content" && (
                  <>
                    {schema.dataFields.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400">
                        {previewLang === "ar"
                          ? "هذا النوع لا يحتوي على حقول محتوى"
                          : "No content fields for this section type"}
                      </div>
                    ) : (
                      schema.dataFields.map((field) => (
                        <SectionFieldRenderer
                          key={field.key}
                          field={field}
                          values={dataValues}
                          onChange={setDataValues}
                          previewLang={previewLang}
                        />
                      ))
                    )}
                  </>
                )}

                {/* Layout tab — config fields */}
                {activeTab === "layout" && (
                  <>
                    {schema.configFields.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400">
                        {previewLang === "ar"
                          ? "هذا النوع لا يحتوي على حقول تخطيط"
                          : "No layout fields for this section type"}
                      </div>
                    ) : (
                      schema.configFields.map((field) => (
                        <SectionFieldRenderer
                          key={field.key}
                          field={field}
                          values={configValues}
                          onChange={setConfigValues}
                          previewLang={previewLang}
                        />
                      ))
                    )}
                  </>
                )}

                {/* Style tab — styling fields */}
                {activeTab === "style" && (
                  <>
                    {schema.stylingFields.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400">
                        {previewLang === "ar"
                          ? "هذا النوع لا يحتوي على حقول تصميم"
                          : "No style fields for this section type"}
                      </div>
                    ) : (
                      schema.stylingFields.map((field) => (
                        <SectionFieldRenderer
                          key={field.key}
                          field={field}
                          values={stylingValues}
                          onChange={setStylingValues}
                          previewLang={previewLang}
                        />
                      ))
                    )}
                  </>
                )}
              </div>

              {/* ── Advanced JSON (collapsible) ── */}
              <div className="mx-5 mb-6 border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <span>
                    {previewLang === "ar" ? "تحرير JSON المتقدم" : "Advanced JSON Editors"}
                  </span>
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="p-4 space-y-3 bg-white">
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      ⚠ {previewLang === "ar"
                        ? "التحرير المباشر يؤثر على كل الحقول. اضغط \"تطبيق\" لنقل التغييرات."
                        : "Direct JSON edits override visual fields. Click Apply to sync changes back."}
                    </p>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                        Data JSON
                      </label>
                      <textarea
                        value={rawData}
                        onChange={(e) => setRawData(e.target.value)}
                        rows={6}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-soil-clay/40"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                        Config JSON
                      </label>
                      <textarea
                        value={rawConfig}
                        onChange={(e) => setRawConfig(e.target.value)}
                        rows={6}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-soil-clay/40"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                        Styling JSON
                      </label>
                      <textarea
                        value={rawStyling}
                        onChange={(e) => setRawStyling(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-soil-clay/40"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyRawJson}
                      className="px-4 py-2 text-xs font-semibold bg-soil-clay text-white rounded-lg hover:bg-soil-dark transition-colors"
                    >
                      {previewLang === "ar" ? "تطبيق JSON" : "Apply JSON"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right pane: live preview ─── */}
          <div className="flex flex-col w-[40%] bg-gray-100 overflow-hidden">
            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {previewLang === "ar" ? "معاينة" : "Preview"}
              </span>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    previewMode === "desktop" ? "bg-soil-dark text-white" : "text-gray-400 hover:text-gray-600"
                  )}
                  title="Desktop preview"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    previewMode === "mobile" ? "bg-soil-dark text-white" : "text-gray-400 hover:text-gray-600"
                  )}
                  title="Mobile preview"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Preview viewport */}
            <div
              ref={previewRef}
              className="flex-1 overflow-hidden p-3 flex flex-col items-center"
              dir={previewLang === "ar" ? "rtl" : "ltr"}
            >
              <div
                className="relative overflow-hidden rounded-lg shadow-md bg-white w-full"
                style={{ height: scaledHeight || 240 }}
              >
                {/* Scale wrapper */}
                <div
                  style={{
                    width: targetWidth,
                    transformOrigin: "top left",
                    transform: `scale(${scaleRatio || 0.35})`,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  <SectionPreviewRenderer
                    componentType={section.componentType}
                    slug={section.slug}
                    config={previewConfig}
                    data={previewData}
                  />
                </div>
                {/* Interaction blocker overlay */}
                <div className="absolute inset-0" />
              </div>

              {/* Preview labels */}
              <p className="text-xs text-gray-400 mt-2 text-center">
                {previewMode === "mobile"
                  ? `Mobile (${PREVIEW_MOBILE_WIDTH}px)`
                  : `Desktop (${PREVIEW_FULL_WIDTH}px)`}
                {" — "}
                {previewLang === "ar" ? "عرض بالعربية" : "Showing in English"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400">
            {previewLang === "ar"
              ? "Ctrl+S للحفظ • Esc للإغلاق"
              : "Ctrl+S to save  •  Esc to close"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {previewLang === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-soil-dark text-white rounded-lg hover:bg-deep-soil disabled:opacity-60 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              {saving
                ? (previewLang === "ar" ? "جاري الحفظ…" : "Saving…")
                : (previewLang === "ar" ? "حفظ التغييرات" : "Save Changes")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Render into body portal to escape any stacking context
  if (typeof window === "undefined") return null;
  return createPortal(
    <AnimatePresence>{panel}</AnimatePresence>,
    document.body
  );
}
