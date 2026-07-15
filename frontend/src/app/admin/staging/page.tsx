"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Server, Globe, RefreshCw, CheckCircle, AlertTriangle, Clock,
  ArrowRight, Eye, Lock, Unlock, Link, Copy, Trash2, Plus
} from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";
import { useLanguage } from "@/lib/language-context";

interface StagingRecord {
  id: string;
  name: string;
  type: "page" | "content" | "settings" | "media";
  status: "pending" | "synced" | "conflict";
  lastModified: string;
  modifiedBy: string;
}

interface StagingStatus {
  stagingEnabled: boolean;
  pendingChanges: number;
  lastSyncedAt?: string;
  lastSyncedByName?: string;
}

// Fallback mock data shown when the API has not returned yet
const MOCK_PENDING: StagingRecord[] = [
  { id: "1", name: "About Page - New Sections", type: "page", status: "pending", lastModified: "2026-07-10T10:00:00Z", modifiedBy: "Editor User" },
  { id: "2", name: "Homepage Hero Banner", type: "page", status: "pending", lastModified: "2026-07-10T09:30:00Z", modifiedBy: "Admin User" },
  { id: "3", name: "Theme Colors Update", type: "settings", status: "conflict", lastModified: "2026-07-10T08:00:00Z", modifiedBy: "Admin User" },
  { id: "4", name: "Conference 2026 Article", type: "content", status: "pending", lastModified: "2026-07-09T14:00:00Z", modifiedBy: "Author User" },
];

interface PreviewLink {
  id: string;
  slug: string;
  token: string;
  expiresAt: string;
  views: number;
  createdAt: string;
}

const MOCK_PREVIEW_LINKS: PreviewLink[] = [
  { id: "1", slug: "/about", token: "prev_abc123", expiresAt: "2026-07-17T00:00:00Z", views: 3, createdAt: "2026-07-10T10:00:00Z" },
  { id: "2", slug: "/events/conference-2026", token: "prev_def456", expiresAt: "2026-07-12T00:00:00Z", views: 7, createdAt: "2026-07-09T09:00:00Z" },
];

type SyncStatus = "idle" | "running" | "success" | "error";

export default function StagingPage() {
  const { t } = useLanguage();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmSync, setConfirmSync] = useState(false);
  const [newPreviewSlug, setNewPreviewSlug] = useState("");
  const [newPreviewExpiry, setNewPreviewExpiry] = useState("7");
  const [previewLinks, setPreviewLinks] = useState<PreviewLink[]>(MOCK_PREVIEW_LINKS);
  const [creating, setCreating] = useState(false);
  const [stagingStatus, setStagingStatus] = useState<StagingStatus | null>(null);

  // Load real staging status from the API
  useEffect(() => {
    api.get<ApiResponse<StagingStatus>>("/admin/staging/status")
      .then((res) => { if (res.data.data) setStagingStatus(res.data.data); })
      .catch(() => { /* fallback to mock counts below */ });
  }, []);

  const pendingCount = stagingStatus?.pendingChanges ?? MOCK_PENDING.filter((r) => r.status === "pending").length;
  const conflictCount = MOCK_PENDING.filter((r) => r.status === "conflict").length;
  const syncedCount = MOCK_PENDING.filter((r) => r.status === "synced").length;

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === MOCK_PENDING.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(MOCK_PENDING.map((r) => r.id)));
    }
  };

  const handleSync = async () => {
    setSyncStatus("running");
    setConfirmSync(false);
    try {
      await api.post("/admin/staging/sync-to-production");
      setSyncStatus("success");
    } catch {
      setSyncStatus("error");
    }
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  const handleCreatePreviewLink = async () => {
    if (!newPreviewSlug) return;
    setCreating(true);
    try {
      const res = await api.post<ApiResponse<{ token: string; slug: string }>>(
        `/admin/staging/preview-link?slug=${encodeURIComponent(newPreviewSlug)}&expiryDays=${newPreviewExpiry}`
      );
      const { token, slug } = res.data.data || {};
      const link: PreviewLink = {
        id: Date.now().toString(),
        slug: slug || (newPreviewSlug.startsWith("/") ? newPreviewSlug : `/${newPreviewSlug}`),
        token: token || `prev_${Math.random().toString(36).slice(2, 10)}`,
        expiresAt: new Date(Date.now() + parseInt(newPreviewExpiry) * 24 * 60 * 60 * 1000).toISOString(),
        views: 0,
        createdAt: new Date().toISOString(),
      };
      setPreviewLinks((prev) => [link, ...prev]);
      setNewPreviewSlug("");
    } catch {
      // fall back to local generation if API is unavailable
      const link: PreviewLink = {
        id: Date.now().toString(),
        slug: newPreviewSlug.startsWith("/") ? newPreviewSlug : `/${newPreviewSlug}`,
        token: `prev_${Math.random().toString(36).slice(2, 10)}`,
        expiresAt: new Date(Date.now() + parseInt(newPreviewExpiry) * 24 * 60 * 60 * 1000).toISOString(),
        views: 0,
        createdAt: new Date().toISOString(),
      };
      setPreviewLinks((prev) => [link, ...prev]);
      setNewPreviewSlug("");
    } finally {
      setCreating(false);
    }
  };

  const STATUS_CONFIG = {
    pending: { label: t("Pending Sync", "في انتظار المزامنة"), color: "bg-amber-100 text-amber-700", icon: <Clock className="w-3.5 h-3.5" /> },
    synced: { label: t("Synced", "تمت المزامنة"), color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    conflict: { label: t("Conflict", "تعارض"), color: "bg-red-100 text-red-700", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  };

  return (
    <div>
      <AdminPageHeader
        title={t("Staging & Production Sync", "التدريج والمزامنة مع الإنتاج")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Staging", "التدريج") },
        ]}
        actions={
          <button
            onClick={() => setConfirmSync(true)}
            disabled={syncStatus === "running" || selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-soil-dark text-white rounded-lg text-sm disabled:opacity-50 hover:bg-soil-darker"
          >
            {syncStatus === "running" ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> {t("Syncing...", "جارٍ المزامنة...")}</>
            ) : syncStatus === "success" ? (
              <><CheckCircle className="w-4 h-4" /> {t("Synced!", "تمت المزامنة!")}</>
            ) : (
              <><Globe className="w-4 h-4" /> {t("Sync to Production", "المزامنة مع الإنتاج")} ({selected.size})</>
            )}
          </button>
        }
      />

      {/* Status overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-xs text-amber-600">{t("Pending Changes", "التغييرات المعلقة")}</p>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div>
            <p className="text-xs text-red-600">{t("Conflicts", "التعارضات")}</p>
            <p className="text-2xl font-bold text-red-700">{conflictCount}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-xs text-green-600">{t("In Sync", "متزامن")}</p>
            <p className="text-2xl font-bold text-green-700">{syncedCount}</p>
          </div>
        </div>
      </div>

      {/* Environment indicator */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-gray-50 border">
        <div className="flex items-center gap-2 flex-1">
          <Server className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">{t("Staging Environment", "بيئة التدريج")}</p>
            <p className="text-sm font-medium text-gray-900">staging.ssssy.org</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
        <div className="flex items-center gap-2 flex-1 justify-end text-right">
          <div>
            <p className="text-xs text-gray-500">{t("Production Environment", "بيئة الإنتاج")}</p>
            <p className="text-sm font-medium text-gray-900">ssssy.org</p>
          </div>
          <Globe className="w-5 h-5 text-green-500" />
        </div>
      </div>

      {/* Pending changes table */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("Staged Changes", "التغييرات المرحلية")}</CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-soil-dark hover:underline"
              >
                {selected.size === MOCK_PENDING.length ? t("Deselect All", "إلغاء تحديد الكل") : t("Select All", "تحديد الكل")}
              </button>
              <span className="text-xs text-gray-400">{selected.size} {t("selected", "محدد")}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MOCK_PENDING.map((record) => {
              const sc = STATUS_CONFIG[record.status];
              return (
                <div
                  key={record.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selected.has(record.id)
                      ? "border-soil-dark bg-soil-dark/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                  onClick={() => toggleSelect(record.id)}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(record.id)}
                    onChange={() => toggleSelect(record.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 accent-soil-dark"
                  />
                  <div className="flex-shrink-0">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-mono uppercase">
                      {record.type}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{record.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t("by", "بواسطة")} {record.modifiedBy} • {new Date(record.lastModified).toLocaleString()}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${sc.color}`}>
                    {sc.icon}
                    {sc.label}
                  </div>
                  {record.status === "conflict" && (
                    <button className="text-xs text-red-500 hover:underline flex-shrink-0">{t("Resolve", "حل")}</button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Preview Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Temporary Preview Links", "روابط المعاينة المؤقتة")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Create new link */}
          <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-xl border">
            <input
              type="text"
              value={newPreviewSlug}
              onChange={(e) => setNewPreviewSlug(e.target.value)}
              placeholder="/page-slug or /news/article-slug"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-dark/30"
            />
            <select
              value={newPreviewExpiry}
              onChange={(e) => setNewPreviewExpiry(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-dark/30"
            >
              <option value="1">{t("1 day", "يوم واحد")}</option>
              <option value="3">{t("3 days", "3 أيام")}</option>
              <option value="7">{t("7 days", "7 أيام")}</option>
              <option value="14">{t("14 days", "14 يوماً")}</option>
            </select>
            <button
              onClick={handleCreatePreviewLink}
              disabled={!newPreviewSlug || creating}
              className="flex items-center gap-2 px-4 py-2 bg-soil-dark text-white rounded-lg text-sm disabled:opacity-50 hover:bg-soil-darker"
            >
              <Plus className="w-4 h-4" /> {t("Generate Link", "إنشاء رابط")}
            </button>
          </div>

          {previewLinks.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-4">{t("No preview links generated.", "لم يتم إنشاء روابط معاينة.")}</p>
          ) : (
            <div className="space-y-2">
              {previewLinks.map((link) => {
                const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${link.slug}?preview=${link.token}`;
                const expired = new Date(link.expiresAt) < new Date();
                return (
                  <div key={link.id} className={`flex items-center gap-3 p-3 rounded-lg border ${expired ? "opacity-50" : ""}`}>
                    <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{link.slug}</p>
                      <p className="text-xs text-gray-400 font-mono truncate">{url}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-500">{link.views} {t("views", "مشاهدة")}</p>
                      <p className={`text-[10px] ${expired ? "text-red-400" : "text-green-600"}`}>
                        {expired ? t("Expired", "منتهي الصلاحية") : `${t("Expires", "ينتهي")} ${new Date(link.expiresAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => navigator.clipboard?.writeText(url)}
                        className="p-1.5 border rounded hover:bg-gray-100 text-gray-500"
                        title={t("Copy URL", "نسخ الرابط")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPreviewLinks((prev) => prev.filter((l) => l.id !== link.id))}
                        className="p-1.5 border rounded hover:bg-red-50 text-red-400"
                        title={t("Delete", "حذف")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm sync dialog */}
      {confirmSync && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-[440px] p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("Confirm Sync to Production", "تأكيد المزامنة مع الإنتاج")}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {t("You are about to push", "أنت على وشك نشر")} <strong>{selected.size} {t("staged changes", "تغييرات مرحلية")}</strong> {t("to production. This action cannot be undone immediately. Make sure all changes have been reviewed.", "إلى الإنتاج. لا يمكن التراجع عن هذا الإجراء فوراً. تأكد من مراجعة جميع التغييرات.")}
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-xs text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t("Production changes are live immediately. Ensure you have tested in staging.", "تصبح تغييرات الإنتاج مباشرة فوراً. تأكد من اختبارها في بيئة التدريج.")}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmSync(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">
                {t("Cancel", "إلغاء")}
              </button>
              <button
                onClick={handleSync}
                className="px-4 py-2 bg-soil-dark text-white rounded-lg text-sm hover:bg-soil-darker"
              >
                {t("Push to Production", "النشر إلى الإنتاج")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
