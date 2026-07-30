"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ContentItem, Category, Tag, ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { BilingualBodyEditor } from "@/components/admin/BilingualBodyEditor";
import { getVersionHistory, rollbackContentItem } from "@/lib/content-versions";
import type { ContentVersionHistory } from "@/lib/content-versions";
import {
  approveContent, rejectContent, requestRevision, submitForReview, publishContent,
} from "@/lib/workflow";
import {
  RotateCcw, History, CheckCircle, XCircle, Send, AlertTriangle, Archive,
  Image as ImageIcon, X, ChevronDown, Calendar, ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { MediaLibraryModal } from "@/components/page-builder/MediaLibraryModal";

// ─── Arabic → Latin slug transliteration ─────────────────────────────────────
const AR_MAP: Record<string, string> = {
  ا:"a",أ:"a",إ:"i",آ:"aa",ب:"b",ت:"t",ث:"th",ج:"j",ح:"h",خ:"kh",
  د:"d",ذ:"dh",ر:"r",ز:"z",س:"s",ش:"sh",ص:"s",ض:"d",ط:"t",ظ:"z",
  ع:"a",غ:"gh",ف:"f",ق:"q",ك:"k",ل:"l",م:"m",ن:"n",ه:"h",و:"w",
  ي:"y",ى:"a",ة:"a",ء:"",ئ:"y",ؤ:"w",لا:"la",
};
function toSlug(text: string): string {
  let s = text;
  for (const [ar, en] of Object.entries(AR_MAP)) s = s.split(ar).join(en);
  return s.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  PUBLISHED:          "bg-emerald-100 text-emerald-700",
  DRAFT:              "bg-yellow-100  text-yellow-700",
  REVIEW:             "bg-blue-100    text-blue-700",
  IN_REVIEW:          "bg-blue-100    text-blue-700",
  SUBMITTED:          "bg-indigo-100  text-indigo-700",
  APPROVED:           "bg-teal-100    text-teal-700",
  REJECTED:           "bg-red-100     text-red-700",
  REVISION_REQUESTED: "bg-orange-100  text-orange-700",
  SCHEDULED:          "bg-purple-100  text-purple-700",
  ARCHIVED:           "bg-gray-100    text-gray-500",
};

// ─── Public preview URL ───────────────────────────────────────────────────────
function previewUrl(item: ContentItem): string {
  const type = (item.contentType || "").toLowerCase();
  if (type === "news") return `/news/${item.slug}`;
  if (type === "article" || type === "publication") return `/content/${type}/${item.slug}`;
  return `/news/${item.slug}`;
}

// ─── Version History Panel ────────────────────────────────────────────────────
function VersionHistoryPanel({ contentId }: { contentId: string }) {
  const { t } = useLanguage();
  const [versions, setVersions] = useState<ContentVersionHistory[]>([]);
  const [loading, setLoading]   = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const [rolling, setRolling]   = useState<number | null>(null);
  const [error, setError]       = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await getVersionHistory("content", contentId);
      setVersions(res.data.data || []); setLoaded(true);
    } catch { setError(t("Failed to load version history.", "فشل تحميل سجل الإصدارات.")); }
    finally   { setLoading(false); }
  }

  async function handleRollback(versionNumber: number) {
    if (!confirm(t(`Roll back to version ${versionNumber}? This cannot be undone.`, `الرجوع إلى الإصدار ${versionNumber}؟ لا يمكن التراجع عن هذا.`))) return;
    setRolling(versionNumber);
    try   { await rollbackContentItem(contentId, versionNumber); window.location.reload(); }
    catch { alert(t("Rollback failed.", "فشل الرجوع إلى الإصدار.")); }
    finally { setRolling(null); }
  }

  if (!loaded) return (
    <div className="py-10 text-center">
      <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("Version history captures every save as a restorable snapshot.", "يسجّل كل حفظ كلقطة قابلة للاستعادة.")}</p>
      <Button variant="outline" onClick={load} disabled={loading}>
        {loading ? t("Loading…", "جارٍ التحميل…") : t("Load Version History", "تحميل سجل الإصدارات")}
      </Button>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );

  if (versions.length === 0) return (
    <div className="py-10 text-center">
      <p className="text-sm text-muted-foreground">{t("No versions saved yet. Versions are created automatically on save.", "لا توجد إصدارات محفوظة بعد. يتم إنشاؤها تلقائياً عند الحفظ.")}</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="pb-2 font-medium text-xs text-muted-foreground text-left">{t("Version", "الإصدار")}</th>
            <th className="pb-2 font-medium text-xs text-muted-foreground text-left">{t("Description", "الوصف")}</th>
            <th className="pb-2 font-medium text-xs text-muted-foreground text-left">{t("Author", "المؤلف")}</th>
            <th className="pb-2 font-medium text-xs text-muted-foreground text-left">{t("Date", "التاريخ")}</th>
            <th className="pb-2 font-medium text-xs text-muted-foreground text-left">{t("Actions", "الإجراءات")}</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((v) => (
            <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
              <td className="py-2.5 font-mono text-xs">v{v.versionNumber}</td>
              <td className="py-2.5 text-muted-foreground text-xs">{v.changeDescription || "—"}</td>
              <td className="py-2.5 text-muted-foreground text-xs">{v.createdByName || "—"}</td>
              <td className="py-2.5 text-muted-foreground text-xs">{v.createdAt ? new Date(v.createdAt).toLocaleString() : "—"}</td>
              <td className="py-2.5">
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
  const [active, setActive]     = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState("");

  const STATUS_LABELS: Record<string, string> = {
    DRAFT:              t("Draft",                "مسودة"),
    SUBMITTED:          t("Submitted for Review", "مُرسل للمراجعة"),
    IN_REVIEW:          t("In Review",            "قيد المراجعة"),
    APPROVED:           t("Approved",             "معتمد"),
    REJECTED:           t("Rejected",             "مرفوض"),
    REVISION_REQUESTED: t("Revision Requested",   "طُلب تعديل"),
    PUBLISHED:          t("Published",            "منشور"),
    SCHEDULED:          t("Scheduled",            "مجدول"),
    ARCHIVED:           t("Archived",             "مؤرشف"),
  };

  async function doAction(fn: () => Promise<unknown>, label: string) {
    setLoading(true); setMsg("");
    try {
      await fn();
      setMsg(`✓ ${label} ${t("successful", "تم بنجاح")}`);
      setActive(null); setComments(""); onRefresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setMsg(`✗ ${err?.response?.data?.message || t("Action failed", "فشل الإجراء")}`);
    } finally { setLoading(false); }
  }

  const status = item.status || "DRAFT";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
        <span className="text-sm font-medium">{t("Current Status:", "الحالة الحالية:")}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
          {STATUS_LABELS[status] || status}
        </span>
      </div>

      {/* ── Action buttons — one row per possible current status ─────────── */}
      <div className="flex flex-wrap gap-2">

        {/* DRAFT → submit for review */}
        {status === "DRAFT" && (
          <button onClick={() => setActive("submit")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Send className="w-3.5 h-3.5" /> {t("Submit for Review", "إرسال للمراجعة")}
          </button>
        )}

        {/* SUBMITTED → reviewer can start review or reject */}
        {status === "SUBMITTED" && <>
          <button onClick={() => setActive("review")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition-colors">
            <Send className="w-3.5 h-3.5" /> {t("Start Review", "بدء المراجعة")}
          </button>
          <button onClick={() => setActive("reject")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
            <XCircle className="w-3.5 h-3.5" /> {t("Reject", "رفض")}
          </button>
        </>}

        {/* REVIEW / IN_REVIEW → approve | reject | request revision */}
        {(status === "IN_REVIEW" || status === "REVIEW") && <>
          <button onClick={() => setActive("approve")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
            <CheckCircle className="w-3.5 h-3.5" /> {t("Approve", "موافقة")}
          </button>
          <button onClick={() => setActive("reject")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
            <XCircle className="w-3.5 h-3.5" /> {t("Reject", "رفض")}
          </button>
          <button onClick={() => setActive("revision")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors">
            <AlertTriangle className="w-3.5 h-3.5" /> {t("Request Revision", "طلب تعديل")}
          </button>
        </>}

        {/* APPROVED → publish */}
        {status === "APPROVED" && (
          <button onClick={() => setActive("publish")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors">
            <CheckCircle className="w-3.5 h-3.5" /> {t("Publish", "نشر")}
          </button>
        )}

        {/* REJECTED / REVISION_REQUESTED → re-submit */}
        {(status === "REJECTED" || status === "REVISION_REQUESTED") && (
          <button onClick={() => setActive("submit")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Send className="w-3.5 h-3.5" /> {t("Re-submit", "إعادة الإرسال")}
          </button>
        )}

        {/* PUBLISHED → archive */}
        {status === "PUBLISHED" && (
          <button onClick={() => setActive("archive")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
            <Archive className="w-3.5 h-3.5" /> {t("Archive", "أرشفة")}
          </button>
        )}

        {/* SCHEDULED → can be un-published back to draft */}
        {status === "SCHEDULED" && (
          <button onClick={() => setActive("unpublish")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> {t("Cancel Schedule", "إلغاء الجدولة")}
          </button>
        )}

        {/* ARCHIVED → restore to draft */}
        {status === "ARCHIVED" && (
          <button onClick={() => setActive("restore")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> {t("Restore to Draft", "استعادة كمسودة")}
          </button>
        )}
      </div>

      {active && (
        <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
          <p className="text-sm font-semibold">
            {active === "submit"    && t("Submit for Review",       "إرسال للمراجعة")}
            {active === "review"    && t("Start Review",            "بدء المراجعة")}
            {active === "approve"   && t("Approve Content",         "موافقة على المحتوى")}
            {active === "reject"    && t("Reject Content",          "رفض المحتوى")}
            {active === "revision"  && t("Request Revision",        "طلب تعديل")}
            {active === "publish"   && t("Publish Content",         "نشر المحتوى")}
            {active === "archive"   && t("Archive Content",         "أرشفة المحتوى")}
            {active === "unpublish" && t("Cancel Scheduled Publish","إلغاء النشر المجدول")}
            {active === "restore"   && t("Restore to Draft",        "استعادة كمسودة")}
          </p>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={active === "revision" ? t("Revision notes (required)…", "ملاحظات التعديل (مطلوبة)…") : t("Comments (optional)…", "تعليقات (اختياري)…")}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-soil-dark/30 bg-background"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (active === "submit")    doAction(() => submitForReview(item.id, comments),                          t("Submission",       "الإرسال"));
                if (active === "review")    doAction(() => api.post(`/content/${item.id}/workflow/review`, {}),          t("Review started",   "بدأت المراجعة"));
                if (active === "approve")   doAction(() => approveContent(item.id, comments),                           t("Approval",         "الموافقة"));
                if (active === "reject")    doAction(() => rejectContent(item.id, comments),                            t("Rejection",        "الرفض"));
                if (active === "revision")  doAction(() => requestRevision(item.id, comments),                          t("Revision Request", "طلب التعديل"));
                if (active === "publish")   doAction(() => publishContent(item.id, comments),                           t("Publishing",       "النشر"));
                if (active === "archive")   doAction(() => api.post(`/content/${item.id}/workflow/archive`, {}),         t("Archived",         "الأرشفة"));
                if (active === "unpublish") doAction(() => api.post(`/content/${item.id}/workflow/unpublish`, {}),       t("Schedule cancelled","إلغاء الجدولة"));
                if (active === "restore")   doAction(() => api.post(`/content/${item.id}/workflow/restore`, {}),         t("Restored",         "الاستعادة"));
              }}
              disabled={loading || (active === "revision" && !comments.trim())}
              className="px-4 py-2 bg-soil-dark text-white rounded-lg text-sm hover:bg-soil-darker disabled:opacity-50 transition-colors"
            >
              {loading ? t("Processing…", "جارٍ المعالجة…") : t("Confirm", "تأكيد")}
            </button>
            <button onClick={() => { setActive(null); setComments(""); }}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-muted transition-colors">
              {t("Cancel", "إلغاء")}
            </button>
          </div>
        </div>
      )}
      {msg && <p className={`text-sm font-medium ${msg.startsWith("✓") ? "text-emerald-600" : "text-red-600"}`}>{msg}</p>}
    </div>
  );
}

// ─── Main Edit Page ───────────────────────────────────────────────────────────
export default function EditContentPage({ params }: { params: { id: string } }) {
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const { t, direction } = useLanguage();

  const { data: item, isLoading, refetch } = useQuery({
    queryKey: ["content", params.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContentItem>>(`/content/${params.id}`);
      return res.data.data;
    },
  });

  const [form, setForm] = useState<Record<string, unknown>>({});
  const [isDirty, setIsDirty]             = useState(false);
  const [mediaOpen, setMediaOpen]         = useState(false);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const splitRef                           = useRef<HTMLDivElement>(null);

  // Populate form when item loads
  useEffect(() => {
    if (item && Object.keys(form).length === 0) {
      setForm({
        titleAr: item.titleAr || "",
        titleEn: item.titleEn || "",
        slug: item.slug || "",
        // Bilingual content
        excerptAr: item.excerptAr || "",
        bodyAr: item.bodyAr || "",
        excerpt: item.excerpt || "",       // EN excerpt
        bodyEn: item.bodyEn || "",
        body: item.body || item.bodyAr || "",  // legacy compat
        contentType: item.contentType || "ARTICLE",
        categoryId: item.category?.id || "",
        tagIds: item.tags?.map((tg: Tag) => tg.id) || [],
        scheduledAt: item.scheduledAt
          ? new Date(item.scheduledAt).toISOString().slice(0, 16)
          : "",
        metaTitle: item.metaTitle || "",
        metaDescription: item.metaDescription || "",
        metaKeywords: item.metaKeywords || "",
        ogTitle: item.ogTitle || "",
        ogDescription: item.ogDescription || "",
        ogImageUrl: item.ogImageUrl || "",
        featuredImage: item.featuredImage || "",
        isFeatured: item.isFeatured || false,
        isPinned: item.isPinned || false,
        isMemberOnly: item.isMemberOnly || false,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  // Track dirty
  useEffect(() => { if (Object.keys(form).length > 0) setIsDirty(true); }, [form]);

  // Close split menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (splitRef.current && !splitRef.current.contains(e.target as Node)) setShowSplitMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Warn on tab close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<ApiResponse<Category[]>>("/categories")).data.data,
  });
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => (await api.get<ApiResponse<Tag[]>>("/tags")).data.data,
  });

  const updateMutation = useMutation({
    mutationFn: async () => api.put(`/content/${params.id}`, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["content"] }); setIsDirty(false); router.push("/admin/content"); },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`/content/${params.id}`),
    onSuccess: () => router.push("/admin/content"),
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleTag = (tagId: string) => {
    setForm((prev) => {
      const tagIds: string[] = (prev.tagIds as string[]) || [];
      return { ...prev, tagIds: tagIds.includes(tagId) ? tagIds.filter((id) => id !== tagId) : [...tagIds, tagId] };
    });
  };

  const handleCancel = () => {
    if (isDirty && !confirm(t("You have unsaved changes. Leave anyway?", "لديك تغييرات غير محفوظة. هل تريد المغادرة؟"))) return;
    router.push("/admin/content");
  };

  if (isLoading) return (
    <div className="space-y-4 p-8">
      {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
    </div>
  );
  if (!item) return <p className="text-muted-foreground p-8">{t("Content not found", "المحتوى غير موجود")}</p>;

  const titleDisplay = (form.titleAr || form.titleEn || t("Untitled", "بلا عنوان")) as string;

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title={`${t("Edit", "تعديل")}: ${titleDisplay}`}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Content", "المحتوى"), href: "/admin/content" },
          { label: t("Edit", "تعديل") },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge — translated label */}
            {item.status && (
              <Badge className={STATUS_STYLES[item.status] || "bg-gray-100 text-gray-600"}>
                {t(
                  {
                    DRAFT:              "Draft",
                    SUBMITTED:          "Submitted",
                    IN_REVIEW:          "In Review",
                    REVIEW:             "In Review",
                    APPROVED:           "Approved",
                    REJECTED:           "Rejected",
                    REVISION_REQUESTED: "Revision Requested",
                    PUBLISHED:          "Published",
                    SCHEDULED:          "Scheduled",
                    ARCHIVED:           "Archived",
                  }[item.status] ?? item.status,
                  {
                    DRAFT:              "مسودة",
                    SUBMITTED:          "مُرسل للمراجعة",
                    IN_REVIEW:          "قيد المراجعة",
                    REVIEW:             "قيد المراجعة",
                    APPROVED:           "معتمد",
                    REJECTED:           "مرفوض",
                    REVISION_REQUESTED: "طُلب تعديل",
                    PUBLISHED:          "منشور",
                    SCHEDULED:          "مجدول",
                    ARCHIVED:           "مؤرشف",
                  }[item.status] ?? item.status,
                )}
              </Badge>
            )}
            {/* Preview on site */}
            <a
              href={previewUrl(item)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("Preview", "معاينة")}
            </a>
            <Button variant="outline" onClick={handleCancel}>{t("Cancel", "إلغاء")}</Button>
            <Button variant="destructive"
              onClick={() => { if (confirm(t("Delete content?", "حذف المحتوى؟"))) deleteMutation.mutate(); }}>
              {t("Delete", "حذف")}
            </Button>
            {/* Split save button — logical (RTL-aware) radius/border classes */}
            <div ref={splitRef} className="relative flex">
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="rounded-e-none border-e border-e-white/30"
              >
                {updateMutation.isPending ? t("Saving...", "جارٍ الحفظ...") : t("Save", "حفظ")}
              </Button>
              <Button
                onClick={() => setShowSplitMenu((v) => !v)}
                disabled={updateMutation.isPending}
                className="rounded-s-none px-2"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showSplitMenu && (
                <div className="absolute top-full end-0 mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    className="w-full text-start px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    onClick={() => { setShowSplitMenu(false); updateMutation.mutate(); }}
                  >
                    {t("Save & Stay", "حفظ والبقاء")}
                  </button>
                </div>
              )}
            </div>
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

        {/* ── EDIT TAB ─────────────────────────────────────────────────────── */}
        <TabsContent value="edit" className="space-y-8">

          {/* Titles + meta */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
              {t("Basic Information", "المعلومات الأساسية")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("Arabic Title *", "العنوان (عربي) *")}</label>
                <Input value={form.titleAr as string || ""} dir="rtl" placeholder="أدخل العنوان بالعربية"
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...prev, titleAr: val,
                      ...((prev.slug === toSlug(prev.titleAr as string) || prev.slug === "")
                        ? { slug: toSlug(val) } : {}),
                    }));
                  }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("English Title", "العنوان (إنجليزي)")}</label>
                <Input value={form.titleEn as string || ""} dir="ltr" placeholder="Enter title in English" onChange={set("titleEn")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("URL Slug *", "الرابط المختصر *")}</label>
                <Input value={form.slug as string || ""} dir="ltr" onChange={set("slug")} placeholder="url-friendly-slug" />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("Only lowercase letters, numbers and hyphens.", "أحرف صغيرة وأرقام وشرطات فقط.")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("Content Type", "نوع المحتوى")}</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.contentType as string || "ARTICLE"} onChange={set("contentType")}>
                  <option value="ARTICLE">{t("Article", "مقال")}</option>
                  <option value="NEWS">{t("News", "أخبار")}</option>
                  <option value="PUBLICATION">{t("Publication", "منشور")}</option>
                  <option value="PAGE">{t("Page", "صفحة")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("Category", "التصنيف")}</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.categoryId as string || ""} onChange={set("categoryId")}>
                  <option value="">{t("None", "بلا")}</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {direction === "rtl" ? (cat.nameAr || cat.nameEn) : (cat.nameEn || cat.nameAr)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("Tags", "الوسوم")}</label>
                <div className="flex flex-wrap gap-1.5 pt-1 min-h-[2.5rem]">
                  {tags?.map((tag) => {
                    const selected = ((form.tagIds as string[]) || []).includes(tag.id);
                    return (
                      <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                          selected ? "bg-soil-clay text-white border-soil-clay" : "bg-card text-muted-foreground border-input hover:border-soil-clay/50"
                        }`}>
                        {direction === "rtl" ? (tag.nameAr || tag.nameEn) : (tag.nameEn || tag.nameAr)}
                      </button>
                    );
                  })}
                </div>
                {((form.tagIds as string[]) || []).length > 0 && (
                  <button type="button" onClick={() => setForm((p) => ({ ...p, tagIds: [] }))}
                    className="text-xs text-muted-foreground hover:text-destructive mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {t("Clear all tags", "مسح كل الوسوم")} ({((form.tagIds as string[]) || []).length})
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Featured Image */}
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
                  <img src={form.featuredImage as string} alt="" className="w-full h-full object-cover" />
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
                  {form.featuredImage ? t("Change Image", "تغيير الصورة") : t("Select from Media Library", "اختر من مكتبة الوسائط")}
                </Button>
                {!!form.featuredImage && (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                    onClick={() => setForm((p) => ({ ...p, featuredImage: "" }))}>
                    <X className="h-3.5 w-3.5 me-1.5" />{t("Remove", "إزالة")}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground max-w-[220px]">
                  {t("Recommended: 1200×630 px, JPG/PNG/WebP", "مستحسن: ١٢٠٠×٦٣٠ بكسل")}
                </p>
              </div>
            </div>
          </section>

          {/* ── Bilingual Excerpt + Body ──────────────────────────── */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
              {t("Content (Arabic & English)", "المحتوى (عربي وإنجليزي)")}
            </h2>
            <BilingualBodyEditor
              excerptAr={form.excerptAr as string || ""}
              bodyAr={form.bodyAr as string || ""}
              excerptEn={form.excerpt as string || ""}
              bodyEn={form.bodyEn as string || ""}
              onExcerptArChange={(v) => setForm((p) => ({ ...p, excerptAr: v }))}
              onBodyArChange={(v)    => setForm((p) => ({ ...p, bodyAr: v, body: v }))}
              onExcerptEnChange={(v) => setForm((p) => ({ ...p, excerpt: v }))}
              onBodyEnChange={(v)    => setForm((p) => ({ ...p, bodyEn: v }))}
            />
          </section>

          {/* Flags + Scheduling */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
              {t("Visibility & Scheduling", "الظهور والجدولة")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {(
                  [
                    ["isFeatured",  t("Featured",     "مميز"),         t("Show in featured sections", "يظهر في الأقسام المميزة")],
                    ["isPinned",    t("Pinned",        "مثبت"),         t("Pin to top of listing",    "تثبيت في أعلى القائمة")],
                    ["isMemberOnly", t("Members Only", "للأعضاء فقط"), t("Visible only to members",  "مرئي للأعضاء فقط")],
                  ] as [string, string, string][]
                ).map(([key, label, hint]) => (
                  <label key={key} className="flex items-start gap-2 cursor-pointer select-none">
                    <input type="checkbox"
                      checked={!!form[key]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-input" />
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
                <input type="datetime-local"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.scheduledAt as string || ""}
                  onChange={set("scheduledAt")} />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("Leave empty to publish immediately on approval.", "اتركه فارغاً للنشر فور الموافقة.")}
                </p>
              </div>
            </div>
          </section>

        </TabsContent>

        {/* ── WORKFLOW TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="workflow" className="space-y-4">
          <WorkflowActions item={item} onRefresh={() => refetch()} />
        </TabsContent>

        {/* ── SEO TAB ──────────────────────────────────────────────────────── */}
        <TabsContent value="seo" className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">{t("Meta Title", "عنوان الميتا")}</label>
              <Input value={form.metaTitle as string || ""} onChange={set("metaTitle")}
                placeholder={(form.titleEn || form.titleAr) as string || ""} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">{t("Meta Description", "وصف الميتا")}</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[72px]"
                value={form.metaDescription as string || ""}
                onChange={set("metaDescription")}
                placeholder={form.excerpt as string || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("Meta Keywords", "كلمات الميتا")}</label>
              <Input value={form.metaKeywords as string || ""} onChange={set("metaKeywords")}
                placeholder={t("keyword1, keyword2", "كلمة1، كلمة2")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("OG Title (social share)", "عنوان OG (المشاركة)")}</label>
              <Input value={form.ogTitle as string || ""} onChange={set("ogTitle")}
                placeholder={(form.metaTitle || form.titleEn) as string || ""} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("OG Description", "وصف OG")}</label>
              <Input value={form.ogDescription as string || ""} onChange={set("ogDescription")}
                placeholder={(form.metaDescription || form.excerpt) as string || ""} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("OG Image URL", "رابط صورة OG")}</label>
              <div className="flex gap-2">
                <Input value={(form.ogImageUrl || form.featuredImage) as string || ""} onChange={set("ogImageUrl")} placeholder="https://…" />
                <Button variant="outline" size="icon" onClick={() => setMediaOpen(true)}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Google Search Preview */}
          {!!(form.metaTitle || form.titleEn || form.titleAr) && (
            <div className="rounded-xl border border-border bg-card p-5 mt-2">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {t("Search Result Preview", "معاينة نتيجة البحث")}
              </p>
              <div className="space-y-0.5 max-w-xl">
                <p className="text-xs text-muted-foreground">ssssy.org › {(form.slug || item.slug) as string}</p>
                <p className="text-[17px] font-medium text-blue-600 leading-snug line-clamp-1">
                  {(form.metaTitle || form.titleEn || form.titleAr) as string}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                  {(form.metaDescription || form.excerpt || t("No description provided.", "لا يوجد وصف.")) as string}
                </p>
              </div>
              {/* Social card preview if OG image is set */}
              {!!(form.ogImageUrl || form.featuredImage) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {t("Social Share Preview", "معاينة المشاركة الاجتماعية")}
                  </p>
                  <div className="rounded-lg border border-border overflow-hidden max-w-sm">
                    <img src={(form.ogImageUrl || form.featuredImage) as string} alt="" className="w-full h-36 object-cover" />
                    <div className="p-3 bg-muted/30">
                      <p className="text-xs text-muted-foreground uppercase">ssssy.org</p>
                      <p className="text-sm font-semibold line-clamp-1">
                        {(form.ogTitle || form.metaTitle || form.titleEn || form.titleAr) as string}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(form.ogDescription || form.metaDescription || form.excerpt) as string}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── VERSIONS TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="versions">
          <VersionHistoryPanel contentId={params.id} />
        </TabsContent>
      </Tabs>

      {/* Media Library Modal */}
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
