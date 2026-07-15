"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";
import { Palette, Plus, Trash2, CheckCircle, Edit2, Save, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Theme {
  id: string;
  nameEn: string;
  nameAr?: string;
  themeJson: string;
  isActive: boolean;
  isSystem: boolean;
  createdByName?: string;
  createdAt?: string;
}

function safeJson(v: string) {
  try { return JSON.parse(v); } catch { return {}; }
}

export default function ThemePresetsPage() {
  const qc = useQueryClient();
  const { t } = useLanguage();
  const { data: themes = [], isLoading } = useQuery<Theme[]>({
    queryKey: ["themes"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Theme[]>>("/admin/themes");
      return res.data.data || [];
    },
  });

  const [editing, setEditing] = useState<Theme | null>(null);
  const [form, setForm] = useState({ nameEn: "", nameAr: "", themeJson: "{}" });
  const [creating, setCreating] = useState(false);
  const [jsonError, setJsonError] = useState("");

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/themes/${id}/activate`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["themes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/themes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["themes"] }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      try { JSON.parse(form.themeJson); } catch { throw new Error("Invalid JSON"); }
      if (editing) {
        return api.put(`/admin/themes/${editing.id}`, form);
      }
      return api.post("/admin/themes", form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["themes"] });
      setEditing(null);
      setCreating(false);
      setForm({ nameEn: "", nameAr: "", themeJson: "{}" });
    },
  });

  function openEdit(t: Theme) {
    setEditing(t);
    setForm({ nameEn: t.nameEn, nameAr: t.nameAr || "", themeJson: t.themeJson || "{}" });
    setCreating(false);
    setJsonError("");
  }

  function validateJson(v: string) {
    try { JSON.parse(v); setJsonError(""); } catch { setJsonError("Invalid JSON"); }
  }

  return (
    <div>
      <AdminPageHeader
        title={t("Theme Presets", "إعدادات السمات")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: t("Theme Presets", "إعدادات السمات") }]}
        actions={
          <button onClick={() => { setCreating(true); setEditing(null); setForm({ nameEn: "", nameAr: "", themeJson: JSON.stringify({ colors: {}, fonts: {}, layout: {} }, null, 2) }); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-soil-dark text-white rounded-lg text-sm hover:bg-soil-darker">
            <Plus className="w-4 h-4" /> {t("New Theme", "سمة جديدة")}
          </button>
        }
      />

      {/* Editor panel */}
      {(creating || editing) && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{editing ? `${t("Editing", "تعديل")}: ${editing.nameEn}` : t("Create New Theme", "إنشاء سمة جديدة")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("Name (EN)", "الاسم (إنجليزي)")} *</label>
                <input className="w-full border rounded px-3 py-2 text-sm" value={form.nameEn}
                  onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("Name (AR)", "الاسم (عربي)")}</label>
                <input className="w-full border rounded px-3 py-2 text-sm" dir="rtl" value={form.nameAr}
                  onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Theme JSON (colors, fonts, layout tokens)", "JSON السمة (ألوان، خطوط، تخطيط)")}</label>
              <textarea
                rows={12}
                value={form.themeJson}
                onChange={(e) => { setForm((p) => ({ ...p, themeJson: e.target.value })); validateJson(e.target.value); }}
                className={`w-full border rounded px-3 py-2 text-xs font-mono ${jsonError ? "border-red-400" : ""}`}
              />
              {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !!jsonError}
                className="flex items-center gap-1.5 px-4 py-2 bg-soil-dark text-white rounded text-sm disabled:opacity-50">
                <Save className="w-4 h-4" /> {saveMutation.isPending ? t("Saving…", "جارٍ الحفظ…") : t("Save Theme", "حفظ السمة")}
              </button>
              <button onClick={() => { setEditing(null); setCreating(false); }} className="flex items-center gap-1.5 px-4 py-2 border rounded text-sm">
                <X className="w-4 h-4" /> {t("Cancel", "إلغاء")}
              </button>
              {saveMutation.isError && <span className="text-red-500 text-xs">{String((saveMutation.error as any)?.message)}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))
        ) : themes.map((theme) => {
          const parsed = safeJson(theme.themeJson);
          const primary = parsed.colors?.primary || "#3E2723";
          const secondary = parsed.colors?.secondary || "#558B2F";
          const bg = parsed.colors?.background || "#FFF8E1";
          return (
            <Card key={theme.id} className={`relative ${theme.isActive ? "ring-2 ring-green-500" : ""}`}>
              {/* Color preview */}
              <div className="flex h-16 rounded-t-lg overflow-hidden">
                <div style={{ background: primary }} className="flex-1" />
                <div style={{ background: secondary }} className="flex-1" />
                <div style={{ background: bg }} className="flex-1" />
              </div>
              <CardContent className="pt-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{theme.nameEn}</h3>
                    {theme.nameAr && <p className="text-xs text-muted-foreground" dir="rtl">{theme.nameAr}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {theme.isActive && (
                      <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3 h-3" /> {t("Active", "نشط")}
                      </span>
                    )}
                    {theme.isSystem && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{t("System", "نظام")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {!theme.isActive && (
                    <button onClick={() => activateMutation.mutate(theme.id)}
                      disabled={activateMutation.isPending}
                      className="flex-1 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                      {t("Activate", "تفعيل")}
                    </button>
                  )}
                  <button onClick={() => openEdit(theme)}
                    className="py-1.5 px-3 text-xs border rounded hover:bg-gray-50 flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> {t("Edit", "تعديل")}
                  </button>
                  {!theme.isSystem && (
                    <button onClick={() => { if (confirm(t("Delete this theme?", "هل تريد حذف هذه السمة؟"))) deleteMutation.mutate(theme.id); }}
                      className="py-1.5 px-2 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {themes.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <Palette className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p>{t("No themes yet. Create your first theme preset.", "لا توجد سمات بعد. أنشئ أول سمة لك.")}</p>
        </div>
      )}
    </div>
  );
}
