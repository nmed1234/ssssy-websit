"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Tag, ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

export default function TagsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Tag[]>>("/tags");
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      await api.post("/tags", form);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tags"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: body }: { id: string; data: Record<string, unknown> }) => {
      await api.put(`/tags/${id}`, body);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tags"] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/tags/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tags"] }); },
  });

  return (
    <div>
      <AdminPageHeader
        title={t("Tags", "الوسوم")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Tags", "الوسوم") },
        ]}
        actions={<Button onClick={() => setShowForm(true)}>{t("Create Tag", "إنشاء وسم")}</Button>}
      />
      <Card>
        <CardHeader><CardTitle>{t("All Tags", "جميع الوسوم")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">{t("Name (AR)", "الاسم (عربي)")}</th>
                    <th className="pb-3 font-medium">{t("Name (EN)", "الاسم (إنجليزي)")}</th>
                    <th className="pb-3 font-medium">{t("Slug", "الرابط المختصر")}</th>
                    <th className="pb-3 font-medium">{t("Actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((tag) => (
                    <tr key={tag.id} className="border-b last:border-0">
                      <td className="py-3">{tag.nameAr}</td>
                      <td className="py-3 text-muted-foreground">{tag.nameEn || "-"}</td>
                      <td className="py-3 text-muted-foreground">{tag.slug}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing(tag)}>{t("Edit", "تعديل")}</Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm(t("Delete tag?", "حذف الوسم؟"))) deleteMutation.mutate(tag.id); }}>{t("Delete", "حذف")}</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.length === 0) && (
                    <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">{t("No tags", "لا توجد وسوم")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <TagFormModal onSave={(f) => createMutation.mutate(f)} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <TagFormModal initial={editing} onSave={(f) => updateMutation.mutate({ id: editing.id, data: f })} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function TagFormModal({ initial, onSave, onClose }: { initial?: Tag; onSave: (form: Record<string, unknown>) => void; onClose: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    nameAr: initial?.nameAr || "",
    nameEn: initial?.nameEn || "",
    slug: initial?.slug || "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{initial ? t("Edit Tag", "تعديل الوسم") : t("Create Tag", "إنشاء وسم")}</h2>
        <div className="space-y-4">
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
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>{t("Cancel", "إلغاء")}</Button>
          <Button onClick={() => onSave(form)} disabled={!form.nameAr || !form.slug}>{initial ? t("Save", "حفظ") : t("Create", "إنشاء")}</Button>
        </div>
      </div>
    </div>
  );
}
