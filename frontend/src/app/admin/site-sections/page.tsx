"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  getAdminSiteSections,
  createSiteSection,
  updateSiteSection,
  deleteSiteSection,
} from "@/lib/site-sections";
import type { SiteSection } from "@/types";
import {
  Plus,
  Save,
  Trash2,
  X,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
  Wand2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { SectionBuilderPanel } from "@/components/admin/SectionBuilderPanel";
import { toast } from "@/components/ui/toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionForm {
  name: string;
  slug: string;
  componentType: string;
  location: string;
  config: string;
  data: string;
  styling: string;
  isActive: boolean;
  sortOrder: number;
  _showJson: boolean;
}

const emptyForm: SectionForm = {
  name: "",
  slug: "",
  componentType: "hero",
  location: "general",
  config: "{}",
  data: "{}",
  styling: "{}",
  isActive: true,
  sortOrder: 0,
  _showJson: false,
};

const componentTypes = [
  "hero", "hero-carousel", "banner", "container", "section", "grid", "card-group",
  "cta", "stats", "counter", "testimonial", "team", "timeline",
  "newsletter", "contact-form", "publications-carousel", "columns", "faq",
  "pricing-table", "search", "map", "chart", "divider", "spacer",
];

const locationOptions = ["general", "homepage", "footer", "sidebar"];

// Type badge color map
const TYPE_COLORS: Record<string, string> = {
  hero:           "bg-blue-100 text-blue-700",
  cta:            "bg-orange-100 text-orange-700",
  "card-group":   "bg-green-100 text-green-700",
  stats:          "bg-purple-100 text-purple-700",
  counter:        "bg-purple-100 text-purple-700",
  testimonial:    "bg-pink-100 text-pink-700",
  newsletter:     "bg-teal-100 text-teal-700",
  "contact-form": "bg-yellow-100 text-yellow-700",
  team:           "bg-indigo-100 text-indigo-700",
  timeline:       "bg-red-100 text-red-700",
  faq:            "bg-cyan-100 text-cyan-700",
  banner:         "bg-lime-100 text-lime-700",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseSectionTitle(section: SiteSection): string {
  const parse = (v: unknown) => {
    if (!v) return null;
    if (typeof v === "string") { try { return JSON.parse(v); } catch { return null; } }
    return v;
  };
  const data   = parse(section.data)   as Record<string, unknown> | null;
  const config = parse(section.config) as Record<string, unknown> | null;
  return (
    (config?.titleEn as string) ||
    (config?.title as string) ||
    (data?.titleEn as string) ||
    (data?.title as string) ||
    ""
  );
}

function formatJsonPreview(val: unknown): string {
  if (!val) return "{}";
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      const str = JSON.stringify(parsed);
      return str.length > 80 ? str.slice(0, 80) + "…" : str;
    } catch { return (val as string).length > 80 ? (val as string).slice(0, 80) + "…" : val as string; }
  }
  const str = JSON.stringify(val);
  return str.length > 80 ? str.slice(0, 80) + "…" : str;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AdminSiteSectionsPage() {
  const { t } = useLanguage();
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Section Builder Panel
  const [builderSection, setBuilderSection] = useState<SiteSection | null>(null);

  // Advanced form (create / JSON edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState<SectionForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Drag-to-reorder state
  const dragIdx = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSiteSections();
      setSections(res.data.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  // ── Builder panel handlers ──────────────────────────────────────────────

  function openBuilder(section: SiteSection) {
    setEditingId(null); // close advanced form if open
    setBuilderSection(section);
  }

  // ── Advanced form handlers ──────────────────────────────────────────────

  function startEdit(s: SiteSection) {
    setBuilderSection(null);
    setEditingId(s.id);
    setForm({
      name: s.name,
      slug: s.slug || "",
      componentType: s.componentType,
      location: s.location || "general",
      config: typeof s.config === "string" ? s.config : JSON.stringify(s.config || {}, null, 2),
      data: typeof s.data === "string" ? s.data : JSON.stringify(s.data || {}, null, 2),
      styling: typeof s.styling === "string" ? s.styling : JSON.stringify(s.styling || {}, null, 2),
      isActive: s.isActive,
      sortOrder: s.sortOrder ?? 0,
      _showJson: true,
    });
  }

  function cancelEdit() { setEditingId(null); setForm(emptyForm); }
  function cancelCreate() { setShowNewForm(false); setForm(emptyForm); }

  function setField<K extends keyof SectionForm>(field: K, value: SectionForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleActive(s: SiteSection) {
    updateSiteSection(s.id, { isActive: !s.isActive }).then(() => fetchSections());
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        componentType: form.componentType,
        location: form.location || "general",
        config: form.config || "{}",
        data: form.data || "{}",
        styling: form.styling || "{}",
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      } as any;
      if (editingId) {
        await updateSiteSection(editingId, payload);
      } else {
        await createSiteSection(payload);
      }
      cancelEdit();
      cancelCreate();
      fetchSections();
    } catch {}
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this site section?")) return;
    try { await deleteSiteSection(id); fetchSections(); } catch {}
  }

  // ── Drag-to-reorder ─────────────────────────────────────────────────────

  function handleDragStart(idx: number) {
    dragIdx.current = idx;
    setIsDragging(true);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const next = [...sections];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(idx, 0, moved);
    dragIdx.current = idx;
    setSections(next);
  }

  async function handleDrop() {
    setIsDragging(false);
    dragIdx.current = null;
    // Assign new sortOrder values (0-based) and persist
    const updates = sections.map((s, i) => ({ id: s.id, sortOrder: i }));
    try {
      await Promise.all(
        updates.map(({ id, sortOrder }) => updateSiteSection(id, { sortOrder }))
      );
      toast({ title: t("Order updated", "تم تحديث الترتيب"), variant: "success" });
    } catch {
      toast({ title: t("Failed to save order", "فشل حفظ الترتيب"), variant: "destructive" });
      fetchSections(); // revert on failure
    }
  }

  function handleDragEnd() {
    if (isDragging) handleDrop();
  }

  // ── Shared form content ─────────────────────────────────────────────────

  const formContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" value={form.name || ""} onChange={(e) => setField("name", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Hero Banner" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input type="text" value={form.slug || ""} onChange={(e) => setField("slug", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono" placeholder="hero-banner" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Component Type *</label>
          <select value={form.componentType || "hero"} onChange={(e) => setField("componentType", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm">
            {componentTypes.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select value={form.location || "general"} onChange={(e) => setField("location", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm">
            {locationOptions.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input type="number" value={form.sortOrder ?? 0} onChange={(e) => setField("sortOrder", parseInt(e.target.value) || 0)}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm pb-1">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setField("isActive", e.target.checked)} className="rounded" />
            Active
          </label>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">JSON Editors</span>
        <button onClick={() => setField("_showJson", !form._showJson)} className="text-xs text-blue-600 hover:underline">
          {form._showJson ? "Hide" : "Show"}
        </button>
      </div>
      {form._showJson && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Config (JSON)</label>
            <textarea value={form.config || "{}"} onChange={(e) => setField("config", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono h-32 resize-y" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data (JSON)</label>
            <textarea value={form.data || "{}"} onChange={(e) => setField("data", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono h-32 resize-y" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Styling (JSON)</label>
            <textarea value={form.styling || "{}"} onChange={(e) => setField("styling", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono h-32 resize-y" />
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={editingId ? cancelEdit : cancelCreate}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
        <button onClick={handleSave} disabled={saving || !form.name?.trim()}
          className="px-4 py-2 text-sm text-white bg-soil-dark rounded-lg hover:bg-soil-darker disabled:opacity-50 flex items-center gap-1">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : editingId ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <AdminPageHeader
        title={t("Site Sections", "أقسام الموقع")}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: t("Site Sections", "أقسام الموقع") },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/sections"
              target="_blank"
              className="px-4 py-2 bg-white text-soil-dark border border-soil-sand rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" /> Preview
            </Link>
            {!showNewForm && (
              <button
                onClick={() => { setEditingId(null); setForm({ ...emptyForm }); setShowNewForm(true); }}
                className="px-4 py-2 bg-soil-dark text-white rounded-lg text-sm hover:bg-soil-darker flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> New Section
              </button>
            )}
          </div>
        }
      />

      {/* New section form */}
      {showNewForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-base mb-4">New Section</h3>
            {formContent}
          </CardContent>
        </Card>
      )}

      {/* Drag hint */}
      {sections.length > 1 && (
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5 px-1">
          <GripVertical className="h-3 w-3" />
          {t("Drag rows to reorder — order is auto-saved", "اسحب الصفوف لإعادة الترتيب — يحفظ تلقائياً")}
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              {t("No site sections yet.", "لا توجد أقسام بعد.")}
            </p>
          ) : (
            <div className="divide-y">
              {sections.map((s, idx) => {
                const isEditing = editingId === s.id;
                const sectionTitle = parseSectionTitle(s);
                const typeBadge = TYPE_COLORS[s.componentType] ?? "bg-gray-100 text-gray-700";

                return (
                  <div
                    key={s.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 hover:bg-gray-50/70 transition-colors ${isDragging ? "cursor-grabbing" : ""}`}
                  >
                    {isEditing ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-sm text-gray-700">
                            {t("Editing", "تحرير")}: {s.name}
                          </h3>
                          <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {formContent}
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        {/* Drag handle */}
                        <div className="shrink-0 flex items-center pt-0.5">
                          <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
                        </div>

                        {/* Section info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-gray-800">{s.name}</span>
                            {s.slug && (
                              <span className="text-xs text-gray-400 font-mono">/{s.slug}</span>
                            )}
                            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${typeBadge}`}>
                              {s.componentType}
                            </span>
                            {s.location && s.location !== "general" && (
                              <span className="text-xs px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 font-medium">
                                {s.location}
                              </span>
                            )}
                            {!s.isActive && (
                              <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 font-medium">
                                {t("inactive", "غير نشط")}
                              </span>
                            )}
                          </div>

                          {/* Section title preview */}
                          {sectionTitle && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{sectionTitle}</p>
                          )}

                          {/* JSON preview */}
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400 font-mono">
                            <span title="config">cfg: {formatJsonPreview(s.config)}</span>
                            <span title="data">data: {formatJsonPreview(s.data)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Edit Content — opens Visual Builder */}
                          <button
                            onClick={() => openBuilder(s)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-soil-dark text-white rounded-lg hover:bg-deep-soil transition-colors"
                            title={t("Open Section Builder", "فتح منشئ القسم")}
                          >
                            <Wand2 className="h-3.5 w-3.5" />
                            {t("Edit Content", "تحرير المحتوى")}
                          </button>

                          {/* Divider */}
                          <div className="w-px h-5 bg-gray-200 mx-1" />

                          {/* Toggle active */}
                          <button
                            onClick={() => toggleActive(s)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                            title={s.isActive ? t("Deactivate", "إلغاء التفعيل") : t("Activate", "تفعيل")}
                          >
                            {s.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>

                          {/* Advanced JSON edit */}
                          <button
                            onClick={() => startEdit(s)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                            title={t("Advanced (JSON Edit)", "متقدم (تحرير JSON)")}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                            title={t("Delete", "حذف")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Builder Panel — portal-level overlay */}
      {builderSection && (
        <SectionBuilderPanel
          section={builderSection}
          onClose={() => setBuilderSection(null)}
          onSaved={() => {
            setBuilderSection(null);
            fetchSections();
          }}
        />
      )}
    </div>
  );
}
