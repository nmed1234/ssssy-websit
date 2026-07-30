"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/lib/language-context";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  getAdminSiteSections,
  createSiteSection,
  updateSiteSection,
  deleteSiteSection,
  publishSiteSection,
  unpublishSiteSection,
} from "@/lib/site-sections";
import type { SiteSection, Block } from "@/types";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
  Wand2,
  LayoutList,
  Monitor,
  Smartphone,
  Clock,
  Globe,
  CheckCircle,
  AlertCircle,
  Copy,
  History,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { SectionBuilderPanel } from "@/components/admin/SectionBuilderPanel";
import { toast } from "@/components/ui/toast";
import SectionTemplateGallery from "@/components/admin/SectionTemplateGallery";
import CustomSectionBuilder from "@/components/admin/CustomSectionBuilder";
import VersionHistoryDrawer from "@/components/admin/VersionHistoryDrawer";
import type { SectionTemplate } from "@/lib/section-templates";

// ── Type badge colors ─────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  hero: "bg-blue-100 text-blue-700",
  "hero-carousel": "bg-blue-200 text-blue-800",
  cta: "bg-orange-100 text-orange-700",
  "card-group": "bg-green-100 text-green-700",
  stats: "bg-purple-100 text-purple-700",
  counter: "bg-purple-100 text-purple-700",
  testimonial: "bg-pink-100 text-pink-700",
  testimonials: "bg-pink-100 text-pink-700",
  newsletter: "bg-teal-100 text-teal-700",
  "contact-form": "bg-yellow-100 text-yellow-700",
  "publications-carousel": "bg-amber-100 text-amber-700",
  team: "bg-indigo-100 text-indigo-700",
  timeline: "bg-red-100 text-red-700",
  faq: "bg-cyan-100 text-cyan-700",
  banner: "bg-lime-100 text-lime-700",
  custom: "bg-gray-100 text-gray-700",
  "latest-news-feed": "bg-sky-100 text-sky-700",
  "upcoming-events-feed": "bg-emerald-100 text-emerald-700",
};

const LOCATION_OPTIONS = ["all", "general", "homepage", "footer", "sidebar"];
const STATUS_OPTIONS = ["all", "DRAFT", "PUBLISHED"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseBlocks(section: SiteSection): Block[] {
  const raw = section.data;
  const d = typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : (raw ?? {});
  return (d as Record<string, unknown>).blocks as Block[] ?? [];
}

function parseSectionTitle(s: SiteSection): string {
  const c = typeof s.config === "string" ? (() => { try { return JSON.parse(s.config); } catch { return {}; } })() : (s.config ?? {});
  const d = typeof s.data === "string" ? (() => { try { return JSON.parse(s.data); } catch { return {}; } })() : (s.data ?? {});
  const cfg = c as Record<string, unknown>;
  const dat = d as Record<string, unknown>;
  return (cfg.titleEn || cfg.title || dat.titleEn || dat.title || "") as string;
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, t }: { status?: string; t: (en: string, ar: string) => string }) {
  if (status === "PUBLISHED") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
        <CheckCircle className="h-3 w-3" />
        {t("Published", "منشور")}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
      <AlertCircle className="h-3 w-3" />
      {t("Draft", "مسودة")}
    </span>
  );
}

// ── Canvas View mini-section preview ─────────────────────────────────────────
function CanvasSectionCard({
  section,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
  index,
}: {
  section: SiteSection;
  onEdit: () => void;
  onDragStart: (i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (i: number) => void;
  index: number;
}) {
  const { t } = useLanguage();
  const title = parseSectionTitle(section);
  const typeColor = TYPE_COLORS[section.componentType] ?? "bg-gray-100 text-gray-600";

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e, index); }}
      onDrop={() => onDrop(index)}
      className="group relative bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-md transition-all cursor-pointer overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      onClick={onEdit}
    >
      {/* Drag handle */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 z-10">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      {/* Section mini-preview area */}
      <div className="bg-gray-50 mx-4 mt-4 mb-3 rounded-lg overflow-hidden border border-gray-100" style={{ height: 64 }}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-2xl opacity-50">{
            section.componentType === "hero" ? "🏔" :
            section.componentType === "hero-carousel" ? "🎠" :
            section.componentType === "cta" ? "📢" :
            section.componentType === "card-group" ? "🃏" :
            section.componentType === "stats" || section.componentType === "counter" ? "📊" :
            section.componentType === "testimonials" || section.componentType === "testimonial" ? "💬" :
            section.componentType === "newsletter" ? "📧" :
            section.componentType === "contact-form" ? "📋" :
            section.componentType === "publications-carousel" ? "📚" :
            section.componentType === "faq" ? "❓" :
            section.componentType === "timeline" ? "⏱" :
            section.componentType === "team" ? "👥" :
            section.componentType === "banner" ? "📣" :
            section.componentType === "custom" ? "🔧" :
            section.componentType === "latest-news-feed" ? "📰" :
            section.componentType === "upcoming-events-feed" ? "📅" :
            "📄"
          }</span>
        </div>
      </div>

      {/* Section info */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${typeColor}`}>{section.componentType}</span>
          <StatusBadge status={section.status} t={t} />
        </div>
        <p className="text-sm font-semibold text-gray-900 truncate">{section.name}</p>
        {title && <p className="text-xs text-gray-400 truncate">{title}</p>}
      </div>

      {/* Click-to-edit overlay hint */}
      <div className="absolute inset-0 bg-green-50/0 group-hover:bg-green-50/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
        <span className="bg-white text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-green-200">{t("Click to Edit", "انقر للتعديل")}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SiteSectionsAdminPage() {
  const { t } = useLanguage();
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState<"list" | "canvas">(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("sectionsMgrView") as "list" | "canvas") ?? "list";
    return "list";
  });

  // Canvas frame style (persisted)
  const [canvasStyle, setCanvasStyle] = useState<"borderless" | "browser">(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("sectionsMgrCanvasStyle") as "borderless" | "browser") ?? "borderless";
    return "borderless";
  });

  // Canvas preview width
  const [canvasWidth, setCanvasWidth] = useState<"desktop" | "mobile">("desktop");

  // Filters
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Panel states
  const [builderSection, setBuilderSection] = useState<SiteSection | null>(null);
  const [customBuilderSection, setCustomBuilderSection] = useState<SiteSection | null>(null);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [historySection, setHistorySection] = useState<SiteSection | null>(null);

  // Drag reorder
  const dragIndex = useRef<number | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSiteSections();
      setSections(res.data?.data ?? []);
    } catch {
      toast({ title: t("Failed to load sections", "فشل تحميل الأقسام"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Persist view preferences ──────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("sectionsMgrView", viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem("sectionsMgrCanvasStyle", canvasStyle); }, [canvasStyle]);

  // ── Filtered sections ─────────────────────────────────────────────────────
  const filtered = sections.filter(s => {
    const matchLoc = locationFilter === "all" || s.location === locationFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.componentType.toLowerCase().includes(q);
    return matchLoc && matchStatus && matchSearch;
  });

  // ── Toggle active ─────────────────────────────────────────────────────────
  const toggleActive = useCallback(async (s: SiteSection) => {
    try {
      await updateSiteSection(s.id, { isActive: !s.isActive } as Partial<SiteSection>);
      setSections(prev => prev.map(x => x.id === s.id ? { ...x, isActive: !s.isActive } : x));
    } catch { toast({ title: t("Failed to update", "فشل التحديث"), variant: "destructive" }); }
  }, []);

  // ── Publish / Unpublish ───────────────────────────────────────────────────
  const handlePublish = useCallback(async (s: SiteSection) => {
    try {
      await publishSiteSection(s.id);
      setSections(prev => prev.map(x => x.id === s.id ? { ...x, status: "PUBLISHED" } : x));
      toast({ title: t("Published!", "تم النشر!"), description: t(`"${s.name}" is now live`, `"${s.name}" منشور الآن`), variant: "success" });
    } catch { toast({ title: t("Failed to publish", "فشل النشر"), variant: "destructive" }); }
  }, []);

  const handleUnpublish = useCallback(async (s: SiteSection) => {
    try {
      await unpublishSiteSection(s.id);
      setSections(prev => prev.map(x => x.id === s.id ? { ...x, status: "DRAFT" } : x));
      toast({ title: t("Unpublished", "تم إلغاء النشر"), description: t(`"${s.name}" is now draft-only`, `"${s.name}" مسودة الآن`), variant: "success" });
    } catch { toast({ title: t("Failed to unpublish", "فشل إلغاء النشر"), variant: "destructive" }); }
  }, []);

  // ── Duplicate ─────────────────────────────────────────────────────────────
  const handleDuplicate = useCallback(async (s: SiteSection) => {
    try {
      const res = await createSiteSection({
        name: `${s.name} (Copy)`,
        slug: s.slug ? `${s.slug}-copy-${Date.now()}` : undefined,
        componentType: s.componentType,
        location: s.location,
        config: (typeof s.config === "object" ? JSON.stringify(s.config) : s.config) as unknown as Record<string, unknown>,
        data: (typeof s.data === "object" ? JSON.stringify(s.data) : s.data) as unknown as Record<string, unknown>,
        styling: (typeof s.styling === "object" ? JSON.stringify(s.styling) : s.styling) as unknown as Record<string, unknown>,
        isActive: false,
        sortOrder: (s.sortOrder ?? 0) + 1,
      });
      if (res.data?.data) {
        setSections(prev => [...prev, res.data!.data!]);
        toast({ title: t("Section duplicated", "تم تكرار القسم"), variant: "success" });
      }
    } catch { toast({ title: t("Failed to duplicate", "فشل التكرار"), variant: "destructive" }); }
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (s: SiteSection) => {
    if (!confirm(t(`Delete "${s.name}"? This cannot be undone.`, `حذف "${s.name}"؟ لا يمكن التراجع عن هذا الإجراء.`))) return;
    try {
      await deleteSiteSection(s.id);
      setSections(prev => prev.filter(x => x.id !== s.id));
      toast({ title: t("Section deleted", "تم حذف القسم"), variant: "success" });
    } catch { toast({ title: t("Failed to delete", "فشل الحذف"), variant: "destructive" }); }
  }, []);

  // ── Template gallery selection ────────────────────────────────────────────
  const handleTemplateSelect = useCallback(async (template: SectionTemplate) => {
    setShowTemplateGallery(false);
    try {
      const res = await createSiteSection({
        name: template.name,
        componentType: template.componentType,
        location: "homepage",
        config: JSON.stringify(template.defaultConfig) as unknown as Record<string, unknown>,
        data: JSON.stringify(template.defaultData) as unknown as Record<string, unknown>,
        styling: JSON.stringify(template.defaultStyling) as unknown as Record<string, unknown>,
        isActive: true,
        sortOrder: sections.length,
      });
      if (res.data?.data) {
        const newSection = res.data.data;
        setSections(prev => [...prev, newSection]);
        // Open the appropriate builder immediately
        if (template.componentType === "custom") {
          setCustomBuilderSection(newSection);
        } else {
          setBuilderSection(newSection);
        }
        toast({ title: t(`"${template.name}" added`, `تمت إضافة "${template.name}"`), variant: "success" });
      }
    } catch { toast({ title: t("Failed to create section", "فشل إنشاء القسم"), variant: "destructive" }); }
  }, [sections.length]);

  // ── Custom section save ───────────────────────────────────────────────────
  const handleCustomSave = useCallback(async (blocks: Block[]) => {
    if (!customBuilderSection) return;
    const data = typeof customBuilderSection.data === "string"
      ? (() => { try { return JSON.parse(customBuilderSection.data as string); } catch { return {}; } })()
      : (customBuilderSection.data ?? {});
    const updated = { ...(data as Record<string, unknown>), blocks };
    await updateSiteSection(customBuilderSection.id, { data: JSON.stringify(updated) as unknown as Record<string, unknown> });
    await load();
  }, [customBuilderSection, load]);

  // ── Drag reorder ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback((i: number) => { dragIndex.current = i; }, []);
  const handleDragOver = useCallback((e: React.DragEvent, i: number) => { e.preventDefault(); }, []);
  const handleDrop = useCallback(async (targetIndex: number) => {
    if (dragIndex.current === null || dragIndex.current === targetIndex) return;
    const reordered = [...filtered];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(targetIndex, 0, moved);
    dragIndex.current = null;
    // Persist sort orders
    await Promise.all(reordered.map((s, i) =>
      updateSiteSection(s.id, { sortOrder: i } as Partial<SiteSection>)
    ));
    await load();
  }, [filtered, load]);

  // ── Open builder for a section ────────────────────────────────────────────
  const openBuilder = useCallback((s: SiteSection) => {
    if (s.componentType === "custom") {
      setCustomBuilderSection(s);
    } else {
      setBuilderSection(s);
    }
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <AdminPageHeader
        title={t("Site Sections", "أقسام الموقع")}
        description={t("Manage homepage and site sections — drag to reorder, edit content, and control publishing", "إدارة أقسام الصفحة الرئيسية والموقع — اسحب لإعادة الترتيب وتعديل المحتوى والتحكم في النشر")}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("Preview Site", "معاينة الموقع")}
            </Link>
            <button
              onClick={() => setShowTemplateGallery(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("Add Section", "إضافة قسم")}
            </button>
          </div>
        }
      />

      {/* ── Toolbar: filters + view toggle ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("Search sections...", "بحث في الأقسام...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>

        {/* Location filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            {LOCATION_OPTIONS.map(l => <option key={l} value={l}>{l === "all" ? t("All Locations", "كل المواقع") : l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === "all" ? t("All Statuses", "كل الحالات") : s === "PUBLISHED" ? t("Published", "منشور") : t("Draft", "مسودة")}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          {/* Canvas style toggle (only when canvas view is active) */}
          {viewMode === "canvas" && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              <button
                onClick={() => setCanvasStyle("borderless")}
                className={`px-3 py-2 font-medium transition-colors ${canvasStyle === "borderless" ? "bg-green-700 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                title={t("Borderless Canvas", "لوحة بدون حدود")}
              >
                ⬜ {t("Borderless", "بدون حدود")}
              </button>
              <button
                onClick={() => setCanvasStyle("browser")}
                className={`px-3 py-2 font-medium transition-colors ${canvasStyle === "browser" ? "bg-green-700 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                title={t("Browser Chrome", "إطار المتصفح")}
              >
                🌐 {t("Browser", "متصفح")}
              </button>
            </div>
          )}

          {/* Preview width (canvas only) */}
          {viewMode === "canvas" && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => setCanvasWidth("desktop")} className={`px-2 py-2 transition-colors ${canvasWidth === "desktop" ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}><Monitor className="h-3.5 w-3.5" /></button>
              <button onClick={() => setCanvasWidth("mobile")} className={`px-2 py-2 transition-colors ${canvasWidth === "mobile" ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}><Smartphone className="h-3.5 w-3.5" /></button>
            </div>
          )}

          {/* List / Canvas toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${viewMode === "list" ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
              <LayoutList className="h-3.5 w-3.5" />{t("List", "قائمة")}
            </button>
            <button onClick={() => setViewMode("canvas")} className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${viewMode === "canvas" ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
              <Globe className="h-3.5 w-3.5" />{t("Canvas", "لوحة")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span><strong className="text-gray-900">{sections.length}</strong> {t("total", "إجمالي")}</span>
        <span><strong className="text-green-700">{sections.filter(s => s.status === "PUBLISHED").length}</strong> {t("published", "منشور")}</span>
        <span><strong className="text-amber-600">{sections.filter(s => s.status !== "PUBLISHED").length}</strong> {t("draft", "مسودة")}</span>
        <span><strong className="text-gray-900">{filtered.length}</strong> {t("showing", "معروض")}</span>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <Plus className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{t("No sections found", "لم يتم العثور على أقسام")}</p>
          <p className="text-xs mt-1">{t("Try adjusting filters or add a new section", "جرّب ضبط الفلاتر أو أضف قسمًا جديدًا")}</p>
          <button onClick={() => setShowTemplateGallery(true)} className="mt-4 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800">
            {t("Add First Section", "أضف أول قسم")}
          </button>
        </div>

      ) : viewMode === "list" ? (
        // ── LIST VIEW ──────────────────────────────────────────────────
        <div className="space-y-3">
          {filtered.map((s, index) => {
            const title = parseSectionTitle(s);
            const typeColor = TYPE_COLORS[s.componentType] ?? "bg-gray-100 text-gray-600";
            return (
              <div
                key={s.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                {/* Drag handle */}
                <GripVertical className="h-5 w-5 text-gray-300 group-hover:text-gray-400 flex-shrink-0 cursor-grab" />

                {/* Sort order */}
                <span className="text-xs text-gray-300 font-mono w-4 text-center flex-shrink-0">{(s.sortOrder ?? index) + 1}</span>

                {/* Section info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${typeColor}`}>{s.componentType}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{s.location}</span>
                    <StatusBadge status={s.status} t={t} />
                    {!s.isActive && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{t("Hidden", "مخفي")}</span>}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm truncate">{s.name}</p>
                  {title && <p className="text-xs text-gray-400 truncate">{title}</p>}
                </div>

                {/* Version count */}
                {(s.versionCount ?? 0) > 0 && (
                  <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:flex items-center gap-1">
                    <History className="h-3 w-3" />
                    v{s.versionCount}
                  </span>
                )}

                {/* Published-at */}
                {s.publishedAt && (
                  <span className="text-xs text-gray-400 flex-shrink-0 hidden lg:flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(s.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Edit content */}
                  <button
                    onClick={() => openBuilder(s)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span className="hidden sm:inline">{t("Edit", "تعديل")}</span>
                  </button>

                  {/* Publish / Unpublish */}
                  {s.status === "PUBLISHED" ? (
                    <button onClick={() => handleUnpublish(s)} title={t("Unpublish", "إلغاء النشر")} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  ) : (
                    <button onClick={() => handlePublish(s)} title={t("Publish", "نشر")} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors">
                      <AlertCircle className="h-4 w-4" />
                    </button>
                  )}

                  {/* Version history */}
                  <button onClick={() => setHistorySection(s)} title={t("Version history", "سجل الإصدارات")} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <History className="h-4 w-4" />
                  </button>

                  {/* Toggle visibility */}
                  <button onClick={() => toggleActive(s)} title={s.isActive ? t("Hide section", "إخفاء القسم") : t("Show section", "إظهار القسم")} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    {s.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  {/* Duplicate */}
                  <button onClick={() => handleDuplicate(s)} title={t("Duplicate", "تكرار")} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(s)} title={t("Delete", "حذف")} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      ) : (
        // ── CANVAS VIEW ────────────────────────────────────────────────
        <div className={canvasStyle === "browser" ? "rounded-xl border border-gray-300 overflow-hidden shadow-sm" : ""}>
          {/* Browser chrome header */}
          {canvasStyle === "browser" && (
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200 max-w-sm mx-auto text-center">
                {typeof window !== "undefined" ? window.location.hostname : "localhost:3000"}
              </div>
            </div>
          )}

          {/* Sections canvas */}
          <div
            className={`${canvasStyle === "borderless" ? "" : "bg-white"} p-6`}
            style={{ maxWidth: canvasWidth === "mobile" ? 430 : "100%", margin: "0 auto" }}
          >
            <div className={`grid gap-4 ${canvasWidth === "mobile" ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"}`}>
              {filtered.map((s, index) => (
                <CanvasSectionCard
                  key={s.id}
                  section={s}
                  index={index}
                  onEdit={() => openBuilder(s)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
              {/* Add section tile */}
              <button
                onClick={() => setShowTemplateGallery(true)}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-green-400 hover:text-green-600 transition-all"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">{t("Add Section", "إضافة قسم")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals & Panels ─────────────────────────────────────────────── */}

      {/* Template Gallery */}
      {showTemplateGallery && (
        <SectionTemplateGallery
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}

      {/* Section Builder Panel (for non-custom sections) */}
      {builderSection && (
        <SectionBuilderPanel
          section={builderSection}
          onClose={() => { setBuilderSection(null); load(); }}
          onSaved={async () => {
            // Re-fetch sections so the list is up to date, then update the
            // open panel's section prop with the freshly saved version so
            // repeated saves keep working correctly.
            try {
              const res = await getAdminSiteSections();
              const updated = res.data?.data ?? [];
              setSections(updated);
              const fresh = updated.find((s) => s.id === builderSection.id);
              if (fresh) setBuilderSection(fresh);
            } catch {
              // non-critical — panel stays open with in-memory state
            }
          }}
          canPublish
        />
      )}

      {/* Custom Section Builder */}
      {customBuilderSection && (
        <CustomSectionBuilder
          sectionName={customBuilderSection.name}
          initialBlocks={parseBlocks(customBuilderSection)}
          onSave={handleCustomSave}
          onClose={() => setCustomBuilderSection(null)}
        />
      )}

      {/* Version History Drawer */}
      {historySection && (
        <VersionHistoryDrawer
          sectionId={historySection.id}
          sectionName={historySection.name}
          currentVersionCount={historySection.versionCount ?? 0}
          onClose={() => setHistorySection(null)}
          onRolledBack={load}
        />
      )}
    </div>
  );
}
