"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchBar } from "@/components/admin/SearchBar";
import {
  getAllContentStrings,
  createContentString,
  updateContentString,
  deleteContentString,
  type ContentStringResponse,
} from "@/lib/content-strings";
import { Plus, Save, Trash2, X, Edit3, Check, Search, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type EditState = {
  id: string | null;
  stringKey: string;
  valueEn: string;
  valueAr: string;
  stringGroup: string;
  description: string;
};

const emptyForm: EditState = {
  id: null,
  stringKey: "",
  valueEn: "",
  valueAr: "",
  stringGroup: "general",
  description: "",
};

export default function AdminContentStringsPage() {
  const { t } = useLanguage();
  const [strings, setStrings] = useState<ContentStringResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditState>(emptyForm);
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchStrings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllContentStrings();
      setStrings(res.data.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchStrings(); }, [fetchStrings]);

  const groups = Array.from(new Set(strings.map((s) => s.stringGroup))).sort();

  const filtered = strings.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch = !q
      || s.stringKey.toLowerCase().includes(q)
      || s.valueEn.toLowerCase().includes(q)
      || s.valueAr.toLowerCase().includes(q);
    const matchesGroup = !groupFilter || s.stringGroup === groupFilter;
    return matchesSearch && matchesGroup;
  });

  function startEdit(s: ContentStringResponse) {
    setEditingId(s.id);
    setForm({
      id: s.id,
      stringKey: s.stringKey,
      valueEn: s.valueEn,
      valueAr: s.valueAr,
      stringGroup: s.stringGroup,
      description: s.description || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(id: string) {
    setSaving(true);
    try {
      await updateContentString(id, {
        stringKey: form.stringKey,
        valueEn: form.valueEn,
        valueAr: form.valueAr,
        stringGroup: form.stringGroup,
        description: form.description,
      });
      setEditingId(null);
      await fetchStrings();
    } catch {}
    setSaving(false);
  }

  async function handleCreate() {
    setSaving(true);
    try {
      await createContentString({
        stringKey: form.stringKey,
        valueEn: form.valueEn,
        valueAr: form.valueAr,
        stringGroup: form.stringGroup || "general",
        description: form.description,
      });
      setShowNewForm(false);
      setForm(emptyForm);
      await fetchStrings();
    } catch {}
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this content string?")) return;
    try {
      await deleteContentString(id);
      await fetchStrings();
    } catch {}
  }

  return (
    <div>
      <AdminPageHeader
        title={t("Content Strings", "نصوص المحتوى")}
        description={t(
          "Manage all translatable text on the website. Edit English and Arabic values for each string key.",
          "إدارة جميع النصوص القابلة للترجمة على الموقع. تعديل القيم الإنجليزية والعربية لكل مفتاح نص."
        )}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Content Strings", "نصوص المحتوى") },
        ]}
        actions={
          <Button size="sm" onClick={() => { setShowNewForm(true); setEditingId(null); setForm(emptyForm); }}>
            <Plus className="h-4 w-4 mr-1" /> {t("Add String", "إضافة نص")}
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={t("Search keys or values...", "البحث في المفاتيح أو القيم...")}
              />
            </div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="">{t("All Groups", "جميع المجموعات")}</option>
              {groups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {showNewForm && (
        <Card className="mb-4 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{t("New Content String", "نص محتوى جديد")}</span>
              <button onClick={() => { setShowNewForm(false); setForm(emptyForm); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EditForm form={form} onChange={setForm} t={t} />
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => { setShowNewForm(false); setForm(emptyForm); }}>{t("Cancel", "إلغاء")}</Button>
              <Button size="sm" onClick={handleCreate} disabled={saving || !form.stringKey}>
                <Save className="h-4 w-4 mr-1" /> {t("Create", "إنشاء")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t("Loading...", "جارٍ التحميل...")}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t("No content strings found", "لا توجد نصوص محتوى")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wider">{t("Key", "المفتاح")}</th>
                    <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wider">{t("English", "الإنجليزية")}</th>
                    <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wider">{t("Arabic", "العربية")}</th>
                    <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wider">{t("Group", "المجموعة")}</th>
                    <th className="text-right px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wider">{t("Actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      {editingId === s.id ? (
                        <>
                          <td colSpan={5} className="px-4 py-2">
                            <EditForm form={form} onChange={setForm} t={t} />
                            <div className="flex justify-end gap-2 mt-2">
                              <Button variant="outline" size="sm" onClick={cancelEdit}>{t("Cancel", "إلغاء")}</Button>
                              <Button size="sm" onClick={() => handleSave(s.id)} disabled={saving}>
                                <Save className="h-4 w-4 mr-1" /> {t("Save", "حفظ")}
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2.5">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{s.stringKey}</code>
                            {s.description && <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>}
                          </td>
                          <td className="px-4 py-2.5 max-w-[240px] truncate" title={s.valueEn}>{s.valueEn || <span className="text-muted-foreground italic">{t("empty", "فارغ")}</span>}</td>
                          <td className="px-4 py-2.5 max-w-[240px] truncate text-right" dir="rtl" title={s.valueAr}>{s.valueAr || <span className="text-muted-foreground italic">فارغ</span>}</td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{s.stringGroup}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => startEdit(s)} className="p-1.5 rounded hover:bg-muted-foreground/10 transition-colors" title={t("Edit", "تعديل")}>
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors" title={t("Delete", "حذف")}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EditForm({ form, onChange, t }: { form: EditState; onChange: (f: EditState) => void; t: (en: string, ar: string) => string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">{t("Key", "المفتاح")}</Label>
        <Input value={form.stringKey} onChange={(e) => onChange({ ...form, stringKey: e.target.value })} placeholder="nav.home" className="text-xs font-mono" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("Group", "المجموعة")}</Label>
        <Input value={form.stringGroup} onChange={(e) => onChange({ ...form, stringGroup: e.target.value })} placeholder="general" className="text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("English", "الإنجليزية")}</Label>
        <textarea value={form.valueEn} onChange={(e) => onChange({ ...form, valueEn: e.target.value })}
          className="w-full min-h-[60px] px-3 py-2 rounded-lg border bg-background text-sm resize-y" dir="ltr" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("Arabic", "العربية")}</Label>
        <textarea value={form.valueAr} onChange={(e) => onChange({ ...form, valueAr: e.target.value })}
          className="w-full min-h-[60px] px-3 py-2 rounded-lg border bg-background text-sm resize-y" dir="rtl" />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label className="text-xs">{t("Description", "الوصف")}</Label>
        <Input value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} placeholder={t("Where this string is used", "أين يُستخدم هذا النص")} className="text-xs" />
      </div>
    </div>
  );
}
