"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";
import { toast } from "@/components/ui/toast";
import {
  getAdminPublications,
  createPublication,
  updatePublication,
  deletePublication,
} from "@/lib/publications";
import type { Publication, ApiResponse, PaginatedResponse } from "@/types";
import { Plus, Pencil, Trash2, X, Save, BookOpen, ExternalLink } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PubForm {
  titleEn: string;
  titleAr: string;
  slug: string;
  abstractEn: string;
  abstractAr: string;
  authors: string;
  year: string;
  category: string;
  coverImageUrl: string;
  pdfUrl: string;
  fileSizeKb: string;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: PubForm = {
  titleEn: "", titleAr: "", slug: "", abstractEn: "", abstractAr: "",
  authors: "", year: "", category: "", coverImageUrl: "", pdfUrl: "",
  fileSizeKb: "", isActive: true, sortOrder: "0",
};

function pubToForm(p: Publication): PubForm {
  return {
    titleEn: p.titleEn ?? "",
    titleAr: p.titleAr ?? "",
    slug: p.slug ?? "",
    abstractEn: p.abstractEn ?? "",
    abstractAr: p.abstractAr ?? "",
    authors: p.authors ?? "",
    year: p.year ? String(p.year) : "",
    category: p.category ?? "",
    coverImageUrl: p.coverImageUrl ?? "",
    pdfUrl: p.pdfUrl ?? "",
    fileSizeKb: p.fileSizeKb ? String(p.fileSizeKb) : "",
    isActive: p.isActive,
    sortOrder: String(p.sortOrder ?? 0),
  };
}

function formToPayload(f: PubForm): Partial<Publication> {
  return {
    titleEn: f.titleEn,
    titleAr: f.titleAr || undefined,
    slug: f.slug || undefined,
    abstractEn: f.abstractEn || undefined,
    abstractAr: f.abstractAr || undefined,
    authors: f.authors || undefined,
    year: f.year ? Number(f.year) : undefined,
    category: f.category || undefined,
    coverImageUrl: f.coverImageUrl || undefined,
    pdfUrl: f.pdfUrl || undefined,
    fileSizeKb: f.fileSizeKb ? Number(f.fileSizeKb) : undefined,
    isActive: f.isActive,
    sortOrder: Number(f.sortOrder) || 0,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminPublicationsPage() {
  const qc = useQueryClient();
  const { t } = useLanguage();

  const [showPanel, setShowPanel] = useState(false);
  const [editing, setEditing]     = useState<Publication | null>(null);
  const [form, setForm]           = useState<PubForm>(emptyForm);
  const [search, setSearch]       = useState("");
  const [saving, setSaving]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ── Query ──────────────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-publications"],
    queryFn: async () => {
      const res = await getAdminPublications(0, 200);
      return res.data.data;
    },
  });

  const publications: Publication[] = data?.content ?? [];

  // ── Filtered list ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return publications;
    return publications.filter(
      (p) =>
        (p.titleEn ?? "").toLowerCase().includes(q) ||
        (p.titleAr ?? "").toLowerCase().includes(q) ||
        (p.authors ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q),
    );
  }, [publications, search]);

  // ── Mutations ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: Partial<Publication>) => createPublication(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-publications"] });
      closePanel();
      toast({ title: t("Publication created", "تم إنشاء المنشور"), variant: "success" });
    },
    onError: () => toast({ title: t("Failed to create publication", "فشل إنشاء المنشور"), variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Publication> }) =>
      updatePublication(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-publications"] });
      closePanel();
      toast({ title: t("Publication updated", "تم تحديث المنشور"), variant: "success" });
    },
    onError: () => toast({ title: t("Failed to update publication", "فشل تحديث المنشور"), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePublication(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-publications"] });
      setConfirmDelete(null);
      toast({ title: t("Publication deleted", "تم حذف المنشور"), variant: "success" });
    },
    onError: () => toast({ title: t("Failed to delete", "فشل الحذف"), variant: "destructive" }),
  });

  // ── Panel helpers ──────────────────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowPanel(true);
  }

  function openEdit(pub: Publication) {
    setEditing(pub);
    setForm(pubToForm(pub));
    setShowPanel(true);
  }

  function closePanel() {
    setShowPanel(false);
    setEditing(null);
    setSaving(false);
  }

  function handleField(k: keyof PubForm, v: string | boolean) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSave() {
    if (!form.titleEn.trim()) {
      toast({ title: t("Title (EN) is required", "العنوان الإنجليزي مطلوب"), variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = formToPayload(form);
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div>
      <AdminPageHeader
        title={t("Publications", "المنشورات")}
        description={t("Manage research papers, reports, and conference proceedings", "إدارة الأوراق البحثية والتقارير ووقائع المؤتمرات")}
        breadcrumbs={[
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Publications", "المنشورات") },
        ]}
        actions={
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("Add Publication", "إضافة منشور")}
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder={t("Search by title, author, or category…", "بحث بالعنوان أو المؤلف أو الفئة…")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <CardContent className="pt-4">
            <p className="text-red-700">{t("Failed to load publications.", "فشل تحميل المنشورات.")}</p>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">{t("Title", "العنوان")}</th>
                    <th className="pb-3 font-medium">{t("Authors", "المؤلفون")}</th>
                    <th className="pb-3 font-medium">{t("Year", "السنة")}</th>
                    <th className="pb-3 font-medium">{t("Category", "الفئة")}</th>
                    <th className="pb-3 font-medium">{t("PDF", "PDF")}</th>
                    <th className="pb-3 font-medium">{t("Status", "الحالة")}</th>
                    <th className="pb-3 font-medium">{t("Actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pub) => (
                    <tr key={pub.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 max-w-xs">
                        <p className="font-medium line-clamp-1">{pub.titleEn}</p>
                        {pub.titleAr && <p className="text-xs text-muted-foreground line-clamp-1" dir="rtl">{pub.titleAr}</p>}
                      </td>
                      <td className="py-3 text-muted-foreground text-xs max-w-[140px] line-clamp-1">{pub.authors}</td>
                      <td className="py-3 text-muted-foreground">{pub.year}</td>
                      <td className="py-3">
                        {pub.category && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">{pub.category}</span>
                        )}
                      </td>
                      <td className="py-3">
                        {pub.pdfUrl ? (
                          <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-soil-clay hover:underline">
                            <ExternalLink className="h-3 w-3" /> PDF
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${pub.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {pub.isActive ? t("Active","نشط") : t("Inactive","غير نشط")}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(pub)}
                            className="p-1.5 rounded hover:bg-gray-100 text-muted-foreground hover:text-soil-dark">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(pub.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        {t("No publications found.", "لا توجد منشورات.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Delete confirm dialog ─────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-lg mb-2">{t("Delete Publication?","حذف المنشور؟")}</h3>
            <p className="text-muted-foreground text-sm mb-6">{t("This action cannot be undone.","لا يمكن التراجع عن هذا الإجراء.")}</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>{t("Cancel","إلغاء")}</Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(confirmDelete)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? t("Deleting…","جارٍ الحذف…") : t("Delete","حذف")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-over form panel ─────────────────────────────────────────── */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={closePanel} />
          <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-lg">
                {editing ? t("Edit Publication","تعديل منشور") : t("Add Publication","إضافة منشور")}
              </h2>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving || createMutation.isPending || updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? t("Saving…","جارٍ الحفظ…") : t("Save","حفظ")}
                </Button>
                <button onClick={closePanel} className="p-1.5 rounded hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Title EN */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("Title (English) *","العنوان (إنجليزي) *")}</label>
                <Input value={form.titleEn} onChange={e => handleField("titleEn", e.target.value)} placeholder="Soil Management Research…" />
              </div>
              {/* Title AR */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("Title (Arabic)","العنوان (عربي)")}</label>
                <Input value={form.titleAr} onChange={e => handleField("titleAr", e.target.value)} placeholder="بحث في إدارة التربة…" dir="rtl" />
              </div>
              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("Slug (auto if blank)","الرابط (تلقائي إن تُرك فارغاً)")}</label>
                <Input value={form.slug} onChange={e => handleField("slug", e.target.value)} placeholder="soil-management-research" />
              </div>
              {/* Authors */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("Authors","المؤلفون")}</label>
                <Input value={form.authors} onChange={e => handleField("authors", e.target.value)} placeholder="Dr. Ahmad Al-Rashid, Prof. Layla Hassan" />
              </div>
              {/* Year + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("Year","السنة")}</label>
                  <Input type="number" value={form.year} onChange={e => handleField("year", e.target.value)} placeholder="2024" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("Category","الفئة")}</label>
                  <Input value={form.category} onChange={e => handleField("category", e.target.value)} placeholder="Research Paper" />
                </div>
              </div>
              {/* Abstract EN */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("Abstract (English)","الملخص (إنجليزي)")}</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
                  value={form.abstractEn}
                  onChange={e => handleField("abstractEn", e.target.value)}
                  placeholder="A comprehensive study of…"
                />
              </div>
              {/* Abstract AR */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("Abstract (Arabic)","الملخص (عربي)")}</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
                  value={form.abstractAr}
                  onChange={e => handleField("abstractAr", e.target.value)}
                  placeholder="دراسة شاملة لـ…"
                  dir="rtl"
                />
              </div>
              {/* PDF URL */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("PDF URL","رابط PDF")}</label>
                <Input value={form.pdfUrl} onChange={e => handleField("pdfUrl", e.target.value)} placeholder="https://example.com/paper.pdf" />
              </div>
              {/* Cover Image URL */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("Cover Image URL","رابط صورة الغلاف")}</label>
                <Input value={form.coverImageUrl} onChange={e => handleField("coverImageUrl", e.target.value)} placeholder="https://…" />
              </div>
              {/* File Size + Sort Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("File Size (KB)","حجم الملف (KB)")}</label>
                  <Input type="number" value={form.fileSizeKb} onChange={e => handleField("fileSizeKb", e.target.value)} placeholder="2048" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("Sort Order","ترتيب العرض")}</label>
                  <Input type="number" value={form.sortOrder} onChange={e => handleField("sortOrder", e.target.value)} />
                </div>
              </div>
              {/* Active toggle */}
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={form.isActive} onChange={e => handleField("isActive", e.target.checked)} />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-forest after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
                <span className="text-sm font-medium">{t("Active","نشط")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
