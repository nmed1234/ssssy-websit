"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { ApiResponse, Page } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

export default function NewPagePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    titleAr: "",
    titleEn: "",
    slug: "",
    layoutType: "FLEXIBLE",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const generateSlug = () => {
    const title = form.titleEn || form.titleAr;
    if (title && !form.slug) {
      setForm((prev) => ({
        ...prev,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      }));
    }
  };

  const handleSubmit = async () => {
    if (!form.titleEn && !form.titleAr) return;
    if (!form.slug) {
      generateSlug();
      if (!form.slug) return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await api.post<ApiResponse<Page>>("/admin/pages", form);
      const newPage = res.data.data;
      router.push(`/admin/pages/${newPage.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t("Failed to create page", "فشل إنشاء الصفحة");
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={t("New Page", "صفحة جديدة")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Pages", "الصفحات"), href: "/admin/pages" },
          { label: t("New Page", "صفحة جديدة") },
        ]}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t("Page Details", "تفاصيل الصفحة")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("Title (Arabic)", "العنوان (عربي)")}</label>
                <Input value={form.titleAr} onChange={set("titleAr")} placeholder="عنوان الصفحة" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("Title (English)", "العنوان (إنجليزي)")}</label>
                <Input value={form.titleEn} onChange={set("titleEn")} placeholder="Page title" onBlur={generateSlug} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("Slug", "الرابط المختصر")}</label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">/</span>
                <Input value={form.slug} onChange={set("slug")} placeholder="page-slug" className="flex-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("URL-friendly identifier. Auto-generated from English title.", "معرّف URL. يتم توليده تلقائياً من العنوان الإنجليزي.")}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("Layout Type", "نوع التخطيط")}</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.layoutType}
                onChange={set("layoutType")}
              >
                <option value="FLEXIBLE">{t("Flexible (Page Builder)", "مرن (محرر الصفحات)")}</option>
                <option value="FULL_WIDTH">{t("Full Width", "عرض كامل")}</option>
                <option value="SIDEBAR_LEFT">{t("Sidebar Left", "شريط جانبي يسار")}</option>
                <option value="SIDEBAR_RIGHT">{t("Sidebar Right", "شريط جانبي يمين")}</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => router.push("/admin/pages")} disabled={saving}>{t("Cancel", "إلغاء")}</Button>
              <Button onClick={handleSubmit} disabled={saving || (!form.titleEn && !form.titleAr)}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? t("Creating...", "جارٍ الإنشاء...") : t("Create & Edit", "إنشاء وتعديل")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
