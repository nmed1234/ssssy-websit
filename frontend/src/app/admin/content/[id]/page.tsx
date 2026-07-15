"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ContentItem, Category, Tag, ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { getVersionHistory, rollbackContentItem } from "@/lib/content-versions";
import type { ContentVersionHistory } from "@/lib/content-versions";
import {
  approveContent, rejectContent, requestRevision, submitForReview, publishContent
} from "@/lib/workflow";
import { RotateCcw, History, CheckCircle, XCircle, Send, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

// ─── Version History Panel ────────────────────────────────────────────────────
function VersionHistoryPanel({ contentId }: { contentId: string }) {
  const { t } = useLanguage();
  const [versions, setVersions] = useState<ContentVersionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [rolling, setRolling] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getVersionHistory("content", contentId);
      setVersions(res.data.data || []);
      setLoaded(true);
    } catch {
      setError(t("Failed to load version history.", "فشل تحميل سجل الإصدارات."));
    } finally {
      setLoading(false);
    }
  }

  async function handleRollback(versionNumber: number) {
    if (!confirm(t(`Roll back to version ${versionNumber}? This cannot be undone.`, `الرجوع إلى الإصدار ${versionNumber}؟ لا يمكن التراجع عن هذا.`))) return;
    setRolling(versionNumber);
    try {
      await rollbackContentItem(contentId, versionNumber);
      window.location.reload();
    } catch {
      alert(t("Rollback failed.", "فشل الرجوع إلى الإصدار."));
    } finally {
      setRolling(null);
    }
  }

  if (!loaded) {
    return (
      <div className="py-8 text-center">
        <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-4">{t("Version history captures every save as a restorable snapshot.", "يسجّل كل حفظ كلقطة قابلة للاستعادة.")}</p>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? t("Loading…", "جارٍ التحميل…") : t("Load Version History", "تحميل سجل الإصدارات")}
        </Button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-400">{t("No versions saved yet. Versions are created automatically on save.", "لا توجد إصدارات محفوظة بعد. يتم إنشاؤها تلقائياً عند الحفظ.")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium text-xs text-muted-foreground">{t("Version", "الإصدار")}</th>
            <th className="pb-2 font-medium text-xs text-muted-foreground">{t("Description", "الوصف")}</th>
            <th className="pb-2 font-medium text-xs text-muted-foreground">{t("Author", "المؤلف")}</th>
            <th className="pb-2 font-medium text-xs text-muted-foreground">{t("Date", "التاريخ")}</th>
            <th className="pb-2 font-medium text-xs text-muted-foreground">{t("Actions", "الإجراءات")}</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((v) => (
            <tr key={v.id} className="border-b last:border-0">
              <td className="py-2 font-mono text-xs">v{v.versionNumber}</td>
              <td className="py-2 text-muted-foreground text-xs">{v.changeDescription || "—"}</td>
              <td className="py-2 text-muted-foreground text-xs">{v.createdByName || "—"}</td>
              <td className="py-2 text-muted-foreground text-xs">
                {v.createdAt ? new Date(v.createdAt).toLocaleString() : "—"}
              </td>
              <td className="py-2">
                <button
                  onClick={() => handleRollback(v.versionNumber)}
                  disabled={rolling === v.versionNumber}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  <RotateCcw className="w-3 h-3" />
                  {rolling === v.versionNumber ? t("Rolling back…", "جارٍ الرجوع…") : t("Rollback", "رجوع للإصدار")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Workflow Action Panel ─────────────────────────────────────────────────────
function WorkflowActions({ item, onRefresh }: { item: ContentItem; onRefresh: () => void }) {
  const { t } = useLanguage();
  const [comments, setComments] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const STATUS_LABELS: Record<string, string> = {
    DRAFT: t("Draft", "مسودة"),
    SUBMITTED: t("Submitted for Review", "مُرسل للمراجعة"),
    IN_REVIEW: t("In Review", "قيد المراجعة"),
    APPROVED: t("Approved", "معتمد"),
    REJECTED: t("Rejected", "مرفوض"),
    REVISION_REQUESTED: t("Revision Requested", "طُلب تعديل"),
    PUBLISHED: t("Published", "منشور"),
    SCHEDULED: t("Scheduled", "مجدول"),
    ARCHIVED: t("Archived", "مؤرشف"),
  };

  const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    REVISION_REQUESTED: "bg-orange-100 text-orange-700",
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    SCHEDULED: "bg-purple-100 text-purple-700",
    ARCHIVED: "bg-gray-100 text-gray-500",
  };

  async function doAction(fn: () => Promise<unknown>, label: string) {
    setLoading(true);
    setMsg("");
    try {
      await fn();
      setMsg(`✓ ${label} ${t("successful", "تم بنجاح")}`);
      setActive(null);
      setComments("");
      onRefresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setMsg(`✗ ${err?.response?.data?.message || t("Action failed", "فشل الإجراء")}`);
    } finally {
      setLoading(false);
    }
  }

  const status = item.status || "DRAFT";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{t("Current Status:", "الحالة الحالية:")}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
          {STATUS_LABELS[status] || status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {status === "DRAFT" && (
          <button onClick={() => setActive("submit")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Send className="w-3.5 h-3.5" /> {t("Submit for Review", "إرسال للمراجعة")}
          </button>
        )}
        {status === "IN_REVIEW" && (
          <>
            <button onClick={() => setActive("approve")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              <CheckCircle className="w-3.5 h-3.5" /> {t("Approve", "موافقة")}
            </button>
            <button onClick={() => setActive("reject")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
              <XCircle className="w-3.5 h-3.5" /> {t("Reject", "رفض")}
            </button>
            <button onClick={() => setActive("revision")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
              <AlertTriangle className="w-3.5 h-3.5" /> {t("Request Revision", "طلب تعديل")}
            </button>
          </>
        )}
        {status === "APPROVED" && (
          <button onClick={() => setActive("publish")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
            <CheckCircle className="w-3.5 h-3.5" /> {t("Publish", "نشر")}
          </button>
        )}
        {(status === "REJECTED" || status === "REVISION_REQUESTED") && (
          <button onClick={() => setActive("submit")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Send className="w-3.5 h-3.5" /> {t("Re-submit", "إعادة الإرسال")}
          </button>
        )}
      </div>

      {active && (
        <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
          <p className="text-sm font-medium">
            {active === "submit" && t("Submit for Review", "إرسال للمراجعة")}
            {active === "approve" && t("Approve Content", "موافقة على المحتوى")}
            {active === "reject" && t("Reject Content", "رفض المحتوى")}
            {active === "revision" && t("Request Revision", "طلب تعديل")}
            {active === "publish" && t("Publish Content", "نشر المحتوى")}
          </p>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={active === "revision" ? t("Revision notes (required)…", "ملاحظات التعديل (مطلوبة)…") : t("Comments (optional)…", "تعليقات (اختياري)…")}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-soil-dark/30"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (active === "submit") doAction(() => submitForReview(item.id, comments), t("Submission", "الإرسال"));
                else if (active === "approve") doAction(() => approveContent(item.id, comments), t("Approval", "الموافقة"));
                else if (active === "reject") doAction(() => rejectContent(item.id, comments), t("Rejection", "الرفض"));
                else if (active === "revision") doAction(() => requestRevision(item.id, comments), t("Revision Request", "طلب التعديل"));
                else if (active === "publish") doAction(() => publishContent(item.id, comments), t("Publishing", "النشر"));
              }}
              disabled={loading || (active === "revision" && !comments.trim())}
              className="px-4 py-2 bg-soil-dark text-white rounded-lg text-sm hover:bg-soil-darker disabled:opacity-50"
            >
              {loading ? t("Processing…", "جارٍ المعالجة…") : t("Confirm", "تأكيد")}
            </button>
            <button onClick={() => { setActive(null); setComments(""); }}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">
              {t("Cancel", "إلغاء")}
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p className={`text-sm ${msg.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>{msg}</p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EditContentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: item, isLoading, refetch } = useQuery({
    queryKey: ["content", params.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContentItem>>(`/content/${params.id}`);
      return res.data.data;
    },
  });

  const [form, setForm] = useState<Record<string, unknown>>({});

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

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/content/${params.id}`, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      router.push("/admin/content");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/content/${params.id}`);
    },
    onSuccess: () => router.push("/admin/content"),
  });

  if (item && Object.keys(form).length === 0) {
    setForm({
      titleAr: item.titleAr || "",
      titleEn: item.titleEn || "",
      slug: item.slug || "",
      excerpt: item.excerpt || "",
      body: item.body || "",
      contentType: item.contentType || "ARTICLE",
      categoryId: item.category?.id || "",
      tagIds: item.tags?.map((t: Tag) => t.id) || [],
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      metaKeywords: item.metaKeywords || "",
      ogTitle: item.ogTitle || "",
      ogDescription: item.ogDescription || "",
      ogImageUrl: item.ogImageUrl || "",
      isFeatured: item.isFeatured || false,
      isPinned: item.isPinned || false,
      isMemberOnly: item.isMemberOnly || false,
    });
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleTag = (tagId: string) => {
    setForm((prev) => {
      const tagIds: string[] = (prev.tagIds as string[]) || [];
      return {
        ...prev,
        tagIds: tagIds.includes(tagId) ? tagIds.filter((t: string) => t !== tagId) : [...tagIds, tagId],
      };
    });
  };

  if (isLoading) return <p className="text-muted-foreground p-8">{t("Loading...", "جارٍ التحميل...")}</p>;
  if (!item) return <p className="text-muted-foreground p-8">{t("Content not found", "المحتوى غير موجود")}</p>;

  const statusColors: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-700",
    DRAFT: "bg-yellow-100 text-yellow-700",
    REVIEW: "bg-blue-100 text-blue-700",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    ARCHIVED: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title={`${t("Edit", "تعديل")}: ${(form.titleAr || form.titleEn || t("Untitled", "بلا عنوان")) as string}`}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Content", "المحتوى"), href: "/admin/content" },
          { label: t("Edit", "تعديل") },
        ]}
        actions={
          <div className="flex gap-3">
            {item.status && <Badge className={statusColors[item.status]}>{item.status}</Badge>}
            <Button variant="outline" onClick={() => router.push("/admin/content")}>{t("Cancel", "إلغاء")}</Button>
            <Button variant="destructive" onClick={() => { if (confirm(t("Delete content?", "حذف المحتوى؟"))) deleteMutation.mutate(); }}>{t("Delete", "حذف")}</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t("Saving...", "جارٍ الحفظ...") : t("Save", "حفظ")}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="edit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="edit">{t("Edit", "تعديل")}</TabsTrigger>
          <TabsTrigger value="workflow">{t("Workflow", "سير العمل")}</TabsTrigger>
          <TabsTrigger value="seo">{t("SEO & Social", "السيو والتواصل")}</TabsTrigger>
          <TabsTrigger value="versions">{t("Versions", "الإصدارات")}</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("Title (Ar) *", "العنوان (عربي) *")}</label>
              <Input value={form.titleAr as string || ""} onChange={set("titleAr")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("Title (En)", "العنوان (إنجليزي)")}</label>
              <Input value={form.titleEn as string || ""} onChange={set("titleEn")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("Slug *", "الرابط المختصر *")}</label>
              <Input value={form.slug as string || ""} onChange={set("slug")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("Content Type", "نوع المحتوى")}</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.contentType as string || "ARTICLE"} onChange={set("contentType")}>
                <option value="ARTICLE">{t("Article", "مقال")}</option>
                <option value="NEWS">{t("News", "أخبار")}</option>
                <option value="PUBLICATION">{t("Publication", "منشور")}</option>
                <option value="PAGE">{t("Page", "صفحة")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("Category", "التصنيف")}</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.categoryId as string || ""} onChange={set("categoryId")}>
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
                    className={`px-2 py-1 rounded-full text-xs border ${((form.tagIds as string[]) || []).includes(tag.id) ? "bg-soil-clay text-white border-soil-clay" : "bg-card text-muted-foreground border-input"}`}
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
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={form.excerpt as string || ""} onChange={set("excerpt")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("Body", "المحتوى")}</label>
            <RichTextEditor value={form.body as string || ""} onChange={(v) => setForm((prev) => ({ ...prev, body: v }))} />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} />
              {t("Featured", "مميز")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isPinned} onChange={(e) => setForm((p) => ({ ...p, isPinned: e.target.checked }))} />
              {t("Pinned", "مثبت")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isMemberOnly} onChange={(e) => setForm((p) => ({ ...p, isMemberOnly: e.target.checked }))} />
              {t("Members Only", "للأعضاء فقط")}
            </label>
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <WorkflowActions item={item} onRefresh={() => refetch()} />
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("Meta Title", "عنوان الميتا")}</label>
              <Input value={form.metaTitle as string || ""} onChange={set("metaTitle")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("Meta Description", "وصف الميتا")}</label>
              <Input value={form.metaDescription as string || ""} onChange={set("metaDescription")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("Meta Keywords", "كلمات الميتا")}</label>
              <Input value={form.metaKeywords as string || ""} onChange={set("metaKeywords")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("OG Title (social share)", "عنوان OG (المشاركة)")}</label>
              <Input value={form.ogTitle as string || ""} onChange={set("ogTitle")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("OG Description", "وصف OG")}</label>
              <Input value={form.ogDescription as string || ""} onChange={set("ogDescription")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("OG Image URL", "رابط صورة OG")}</label>
              <Input value={form.ogImageUrl as string || ""} onChange={set("ogImageUrl")} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="versions">
          <VersionHistoryPanel contentId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
