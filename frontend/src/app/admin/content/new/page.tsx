"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Category, Tag, ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";
import { MediaLibraryModal } from "@/components/page-builder/MediaLibraryModal";
import { BilingualBodyEditor } from "@/components/admin/BilingualBodyEditor";
import {
  Image as ImageIcon, X, ChevronDown, Calendar,
} from "lucide-react";

// ─── Arabic → Latin slug transliteration ─────────────────────────────────────
const AR_MAP: Record<string, string> = {
  ا:"a",أ:"a",إ:"i",آ:"aa",ب:"b",ت:"t",ث:"th",ج:"j",ح:"h",خ:"kh",
  د:"d",ذ:"dh",ر:"r",ز:"z",س:"s",ش:"sh",ص:"s",ض:"d",ط:"t",ظ:"z",
  ع:"a",غ:"gh",ف:"f",ق:"q",ك:"k",ل:"l",م:"m",ن:"n",ه:"h",و:"w",
  ي:"y",ى:"a",ة:"a",ء:"",ئ:"y",ؤ:"w",لا:"la",
};

function toSlug(text: string): string {
  let s = text;
  // Replace Arabic characters
  for (const [ar, en] of Object.entries(AR_MAP)) {
    s = s.split(ar).join(en);
  }
  return s
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewContentPage() {
  const router = useRouter();
  const { t, direction } = useLanguage();

  const [form, setForm] = useState({
    titleAr: "", titleEn: "", slug: "",
    // Bilingual content
    excerptAr: "", bodyAr: "",   // Arabic
    excerpt:   "", bodyEn: "",   // English (excerpt = EN teaser, bodyEn = EN body)
    body: "",                    // legacy — kept for API compat (mirrors bodyAr)
    contentType: "ARTICLE", categoryId: "", tagIds: [] as string[],
    scheduledAt: "",
    metaTitle: "", metaDescription: "", metaKeywords: "",
    ogTitle: "", ogDescription: "", ogImageUrl: "",
    featuredImage: "",
    isFeatured: false, isPinned: false, isMemberOnly: false,
  });

  const [isDirty, setIsDirty]               = useState(false);
  const [mediaOpen, setMediaOpen]           = useState(false);
  const [showSplitMenu, setShowSplitMenu]   = useState(false);
  const splitRef                             = useRef<HTMLDivElement>(null);

  // Track dirty state
  useEffect(() => { setIsDirty(true); }, [form]);
  // Close split dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (splitRef.current && !splitRef.current.contains(e.target as Node)) {
        setShowSplitMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  // Warn on browser tab close when dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

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
    mutationFn: async (submitForReview?: boolean) => {
      const payload = submitForReview
        ? { ...form, status: "SUBMITTED" }
        : { ...form, status: "DRAFT" };
      await api.post("/content", payload);
    },
    onSuccess: () => {
      setIsDirty(false);
      router.push("/admin/content");
    },
  });
  const saveDraft   = () => createMutation.mutate(false);
  const saveSubmit  = () => createMutation.mutate(true);

  const set = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleCancel = () => {
    if (isDirty && !confirm(t(
      "You have unsaved changes. Leave anyway?",
      "لديك تغييرات غير محفوظة. هل تريد المغادرة؟",
    ))) return;
    router.push("/admin/content");
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              {t("Cancel", "إلغاء")}
            </Button>

            {/* Split save button — uses logical (RTL-aware) border/radius classes */}
            <div ref={splitRef} className="relative flex">
              <Button
                  onClick={saveDraft}
                  disabled={createMutation.isPending}
                  className="rounded-e-none border-e border-e-white/30"
                >
                {createMutation.isPending
                  ? t("Saving...", "جارٍ الحفظ...")
                  : t("Save as Draft", "حفظ كمسودة")}
              </Button>
              <Button
                onClick={() => setShowSplitMenu((v) => !v)}
                disabled={createMutation.isPending}
                className="rounded-s-none px-2"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showSplitMenu && (
                <div className="absolute top-full end-0 mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    className="w-full text-start px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    onClick={() => { setShowSplitMenu(false); saveSubmit(); }}
                  >
                    {t("Save & Submit for Review", "حفظ وإرسال للمراجعة")}
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      <div className="space-y-8">

        {/* ── Titles + Slug ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
            {t("Basic Information", "المعلومات الأساسية")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("Arabic Title *", "العنوان (عربي) *")}
              </label>
              <Input
                value={form.titleAr}
                dir="rtl"
                placeholder="أدخل العنوان بالعربية"
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    titleAr: val,
                    // Auto-generate slug from AR title only if not yet manually set
                    ...(prev.slug === toSlug(prev.titleAr) || prev.slug === ""
                      ? { slug: toSlug(val) }
                      : {}),
                  }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("English Title", "العنوان (إنجليزي)")}
              </label>
              <Input
                value={form.titleEn}
                dir="ltr"
                placeholder="Enter title in English"
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    titleEn: val,
                    // If Arabic title is empty, also derive slug from EN title
                    ...(prev.titleAr === "" && (prev.slug === toSlug(prev.titleEn) || prev.slug === "")
                      ? { slug: toSlug(val) }
                      : {}),
                  }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("URL Slug *", "الرابط المختصر *")}
              </label>
              <Input value={form.slug} onChange={set("slug")} dir="ltr" placeholder="url-friendly-slug" />
              <p className="text-xs text-muted-foreground mt-1">
                {t("Auto-generated from title. Only lowercase letters, numbers and hyphens.", "يُولَّد تلقائياً من العنوان. أحرف صغيرة وأرقام وشرطات فقط.")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("Content Type", "نوع المحتوى")}
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.contentType}
                onChange={set("contentType")}
              >
                <option value="ARTICLE">{t("Article", "مقال")}</option>
                <option value="NEWS">{t("News", "أخبار")}</option>
                <option value="PUBLICATION">{t("Publication", "منشور")}</option>
                <option value="PAGE">{t("Page", "صفحة")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("Category", "التصنيف")}
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.categoryId}
                onChange={set("categoryId")}
              >
                <option value="">{t("None", "بلا")}</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {direction === "rtl" ? (cat.nameAr || cat.nameEn) : (cat.nameEn || cat.nameAr)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("Tags", "الوسوم")}
              </label>
              <div className="flex flex-wrap gap-1.5 pt-1 min-h-[2.5rem]">
                {tags?.map((tag) => {
                  const selected = form.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        selected
                          ? "bg-soil-clay text-white border-soil-clay"
                          : "bg-card text-muted-foreground border-input hover:border-soil-clay/50"
                      }`}
                    >
                      {direction === "rtl" ? (tag.nameAr || tag.nameEn) : (tag.nameEn || tag.nameAr)}
                    </button>
                  );
                })}
              </div>
              {form.tagIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, tagIds: [] }))}
                  className="text-xs text-muted-foreground hover:text-destructive mt-1 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  {t("Clear all tags", "مسح كل الوسوم")} ({form.tagIds.length})
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Featured Image ────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
            {t("Featured Image", "الصورة الرئيسية")}
          </h2>
          <div className="flex items-start gap-4">
            <div
              className="w-40 h-28 rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-soil-clay/50 transition-colors"
              onClick={() => setMediaOpen(true)}
            >
              {form.featuredImage ? (
                <img src={form.featuredImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">{t("Click to pick", "انقر للاختيار")}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setMediaOpen(true)}>
                <ImageIcon className="h-3.5 w-3.5 me-1.5" />
                {form.featuredImage
                  ? t("Change Image", "تغيير الصورة")
                  : t("Select from Media Library", "اختر من مكتبة الوسائط")}
              </Button>
              {form.featuredImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setForm((p) => ({ ...p, featuredImage: "" }))}
                >
                  <X className="h-3.5 w-3.5 me-1.5" />
                  {t("Remove", "إزالة")}
                </Button>
              )}
              <p className="text-xs text-muted-foreground max-w-[220px]">
                {t("Recommended: 1200×630 px, JPG/PNG/WebP", "مستحسن: ١٢٠٠×٦٣٠ بكسل، JPG/PNG/WebP")}
              </p>
            </div>
          </div>
        </section>

        {/* ── Bilingual Excerpt + Body ──────────────────────────────────── */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
            {t("Content (Arabic & English)", "المحتوى (عربي وإنجليزي)")}
          </h2>
          <BilingualBodyEditor
            excerptAr={form.excerptAr}
            bodyAr={form.bodyAr}
            excerptEn={form.excerpt}
            bodyEn={form.bodyEn}
            onExcerptArChange={(v) => setForm((p) => ({ ...p, excerptAr: v }))}
            onBodyArChange={(v)    => setForm((p) => ({ ...p, bodyAr: v, body: v }))}
            onExcerptEnChange={(v) => setForm((p) => ({ ...p, excerpt: v }))}
            onBodyEnChange={(v)    => setForm((p) => ({ ...p, bodyEn: v }))}
          />
        </section>

        {/* ── Flags + Scheduling ────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
            {t("Visibility & Scheduling", "الظهور والجدولة")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {(
                [
                  ["isFeatured", t("Featured", "مميز"), t("Show in featured sections", "يظهر في الأقسام المميزة")],
                  ["isPinned",   t("Pinned",   "مثبت"),  t("Pin to top of listing",    "تثبيت في أعلى القائمة")],
                  ["isMemberOnly", t("Members Only", "للأعضاء فقط"), t("Visible only to registered members", "مرئي للأعضاء المسجلين فقط")],
                ] as [string, string, string][]
              ).map(([key, label, hint]) => (
                <label key={key} className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!(form as Record<string, unknown>)[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 rounded border-input"
                  />
                  <div>
                    <p className="text-sm font-medium leading-none">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
                  </div>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {t("Scheduled Publish Date", "تاريخ النشر المجدول")}
                </span>
              </label>
              <input
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.scheduledAt}
                onChange={set("scheduledAt")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("Leave empty to publish immediately on approval.", "اتركه فارغاً للنشر فور الموافقة.")}
              </p>
            </div>
          </div>
        </section>

        {/* ── SEO & Social ──────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
            {t("SEO & Social Sharing", "السيو والمشاركة الاجتماعية")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">{t("Meta Title", "عنوان الميتا")}</label>
              <Input value={form.metaTitle} onChange={set("metaTitle")} placeholder={form.titleEn || form.titleAr} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">{t("Meta Description", "وصف الميتا")}</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[72px]"
                value={form.metaDescription}
                onChange={set("metaDescription")}
                placeholder={form.excerpt}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("Meta Keywords", "كلمات الميتا")}</label>
              <Input value={form.metaKeywords} onChange={set("metaKeywords")} placeholder={t("keyword1, keyword2", "كلمة1، كلمة2")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("OG Title (social share)", "عنوان OG (المشاركة)")}</label>
              <Input value={form.ogTitle} onChange={set("ogTitle")} placeholder={form.metaTitle || form.titleEn} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("OG Description", "وصف OG")}</label>
              <Input value={form.ogDescription} onChange={set("ogDescription")} placeholder={form.metaDescription} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("OG Image URL", "رابط صورة OG")}</label>
              <div className="flex gap-2">
                <Input value={form.ogImageUrl || form.featuredImage} onChange={set("ogImageUrl")} placeholder="https://…" />
                <Button variant="outline" size="icon" onClick={() => setMediaOpen(true)} title={t("Pick from media library", "اختر من مكتبة الوسائط")}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* ── Google Snippet Preview ─────────────────────────────────── */}
          {(form.metaTitle || form.titleEn || form.titleAr) && (
            <div className="rounded-xl border border-border bg-card p-4 mt-2">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {t("Search Result Preview", "معاينة نتيجة البحث")}
              </p>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  ssssy.org › {form.slug || "your-slug"}
                </p>
                <p className="text-[17px] font-medium text-blue-600 hover:underline cursor-pointer leading-snug line-clamp-1">
                  {form.metaTitle || form.titleEn || form.titleAr}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                  {form.metaDescription || form.excerpt || t("No description provided.", "لا يوجد وصف.")}
                </p>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* ── Media Library Modal ──────────────────────────────────────────── */}
      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          setForm((p) => ({ ...p, featuredImage: url, ogImageUrl: p.ogImageUrl || url }));
          setMediaOpen(false);
        }}
      />
    </div>
  );
}
