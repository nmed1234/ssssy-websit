"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Category, Tag, ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { useLanguage } from "@/lib/language-context";

export default function NewContentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    titleAr: "", titleEn: "", slug: "", excerpt: "", body: "",
    contentType: "ARTICLE", categoryId: "", tagIds: [] as string[],
    metaTitle: "", metaDescription: "", metaKeywords: "",
    ogTitle: "", ogDescription: "", ogImageUrl: "",
    isFeatured: false, isPinned: false, isMemberOnly: false,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>("/categories");
      return res.data.data;
    },
  });

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Tag[]>>("/tags");
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post("/content", form);
    },
    onSuccess: () => router.push("/admin/content"),
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((t) => t !== tagId) : [...prev.tagIds, tagId],
    }));
  };

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title={t("New Content", "محتوى جديد")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Content", "المحتوى"), href: "/admin/content" },
          { label: t("New", "جديد") },
        ]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/admin/content")}>{t("Cancel", "إلغاء")}</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? t("Saving...", "جارٍ الحفظ...") : t("Create", "إنشاء")}
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("Title (Ar) *", "العنوان (عربي) *")}</label>
            <Input value={form.titleAr} onChange={(e) => { set("titleAr")(e); if (!form.slug) setForm((p) => ({ ...p, slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })); }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Title (En)", "العنوان (إنجليزي)")}</label>
            <Input value={form.titleEn} onChange={set("titleEn")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Slug *", "الرابط المختصر *")}</label>
            <Input value={form.slug} onChange={set("slug")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Content Type", "نوع المحتوى")}</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.contentType} onChange={set("contentType")}>
              <option value="ARTICLE">{t("Article", "مقال")}</option>
              <option value="NEWS">{t("News", "أخبار")}</option>
              <option value="PUBLICATION">{t("Publication", "منشور")}</option>
              <option value="PAGE">{t("Page", "صفحة")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Category", "التصنيف")}</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.categoryId} onChange={set("categoryId")}>
              <option value="">{t("None", "بلا")}</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nameAr || cat.nameEn}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Tags", "الوسوم")}</label>
            <div className="flex flex-wrap gap-2 pt-2">
              {tags?.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`px-2 py-1 rounded-full text-xs border ${form.tagIds.includes(tag.id) ? "bg-soil-clay text-white border-soil-clay" : "bg-card text-muted-foreground border-input"}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.nameAr || tag.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("Excerpt", "مقتطف")}</label>
          <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={form.excerpt} onChange={set("excerpt")} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("Body", "المحتوى")}</label>
          <RichTextEditor value={form.body} onChange={(v) => setForm((prev) => ({ ...prev, body: v }))} />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} />
            {t("Featured", "مميز")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm((p) => ({ ...p, isPinned: e.target.checked }))} />
            {t("Pinned", "مثبت")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isMemberOnly} onChange={(e) => setForm((p) => ({ ...p, isMemberOnly: e.target.checked }))} />
            {t("Members Only", "للأعضاء فقط")}
          </label>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">{t("SEO & Social", "السيو والتواصل الاجتماعي")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("Meta Title", "عنوان الميتا")}</label>
              <Input value={form.metaTitle} onChange={set("metaTitle")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("Meta Description", "وصف الميتا")}</label>
              <Input value={form.metaDescription} onChange={set("metaDescription")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("Meta Keywords", "كلمات الميتا")}</label>
              <Input value={form.metaKeywords} onChange={set("metaKeywords")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("OG Title (social share)", "عنوان OG (المشاركة)")}</label>
              <Input value={form.ogTitle} onChange={set("ogTitle")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("OG Description", "وصف OG")}</label>
              <Input value={form.ogDescription} onChange={set("ogDescription")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("OG Image URL", "رابط صورة OG")}</label>
              <Input value={form.ogImageUrl} onChange={set("ogImageUrl")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
