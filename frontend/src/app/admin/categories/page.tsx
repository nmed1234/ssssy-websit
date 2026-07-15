"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Category, ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>("/categories");
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      await api.post("/categories", form);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: body }: { id: string; data: Record<string, unknown> }) => {
      await api.put(`/categories/${id}`, body);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/categories/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); },
  });

  return (
    <div>
      <AdminPageHeader
        title={t("Categories", "التصنيفات")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Categories", "التصنيفات") },
        ]}
        actions={<Button onClick={() => setShowForm(true)}>{t("Create Category", "إنشاء تصنيف")}</Button>}
      />
      <Card>
        <CardHeader><CardTitle>{t("All Categories", "جميع التصنيفات")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">{t("Name (AR)", "الاسم (عربي)")}</th>
                    <th className="pb-3 font-medium">{t("Name (EN)", "الاسم (إنجليزي)")}</th>
                    <th className="pb-3 font-medium">{t("Slug", "الرابط المختصر")}</th>
                    <th className="pb-3 font-medium">{t("Status", "الحالة")}</th>
                    <th className="pb-3 font-medium">{t("Actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((cat) => (
                    <tr key={cat.id} className="border-b last:border-0">
                      <td className="py-3">{cat.nameAr}</td>
                      <td className="py-3 text-muted-foreground">{cat.nameEn || "-"}</td>
                      <td className="py-3 text-muted-foreground">{cat.slug}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${cat.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {cat.isActive ? t("Active", "نشط") : t("Inactive", "غير نشط")}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing(cat)}>{t("Edit", "تعديل")}</Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm(t("Delete category?", "حذف التصنيف؟"))) deleteMutation.mutate(cat.id); }}>{t("Delete", "حذف")}</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.length === 0) && (
                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">{t("No categories", "لا توجد تصنيفات")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <CategoryFormModal onSave={(f) => createMutation.mutate(f)} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <CategoryFormModal
          initial={editing}
          onSave={(f) => updateMutation.mutate({ id: editing.id, data: f })}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CategoryFormModal({ initial, onSave, onClose }: { initial?: Category; onSave: (form: Record<string, unknown>) => void; onClose: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    nameAr: initial?.nameAr || "",
    nameEn: initial?.nameEn || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    sortOrder: initial?.sortOrder ?? 0,
    isActive: initial?.isActive ?? true,
    parentId: initial?.parentId || "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{initial ? t("Edit Category", "تعديل التصنيف") : t("Create Category", "إنشاء تصنيف")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("Name (Ar) *", "الاسم (عربي) *")}</label>
            <Input value={form.nameAr} onChange={set("nameAr")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Name (En)", "الاسم (إنجليزي)")}</label>
            <Input value={form.nameEn} onChange={set("nameEn")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Slug *", "الرابط المختصر *")}</label>
            <Input value={form.slug} onChange={set("slug")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Sort Order", "ترتيب العرض")}</label>
            <Input type="number" value={form.sortOrder} onChange={set("sortOrder")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("Description", "الوصف")}</label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={form.description} onChange={set("description")} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
            <label htmlFor="isActive" className="text-sm font-medium">{t("Active", "نشط")}</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>{t("Cancel", "إلغاء")}</Button>
          <Button onClick={() => onSave(form)} disabled={!form.nameAr || !form.slug}>{initial ? t("Save", "حفظ") : t("Create", "إنشاء")}</Button>
        </div>
      </div>
    </div>
  );
}
