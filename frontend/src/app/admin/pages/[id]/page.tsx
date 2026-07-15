"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PresetLibraryModal } from "@/components/page-builder/PresetLibraryModal";
import { PageBuilderRoot, serializeLayout } from "@/components/page-builder/builder/PageBuilderRoot";
import type { PageBuilderHandle } from "@/components/page-builder/builder/PageBuilderRoot";
import { resolvePageLayout, migrateLegacySections } from "@/components/page-builder/schema/page-layout";
import { emptyLayout } from "@/components/page-builder/schema/tree-utils";
import { getPage, getPageSections, updatePage } from "@/lib/pages";
import { getVersionHistory, rollbackContentItem } from "@/lib/content-versions";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { WorkflowPanel } from "@/components/admin/pages/WorkflowPanel";
import { SeoEditorPanel } from "@/components/admin/pages/SeoEditorPanel";
import { MenuPlacementSection } from "@/components/admin/pages/MenuPlacementSection";
import { SaveAsTemplateModal } from "@/components/admin/pages/SaveAsTemplateModal";
import { CreatePageWizard } from "@/components/admin/pages/CreatePageWizard";
import { LayoutJsonDebugModal } from "@/components/admin/pages/LayoutJsonDebugModal";
import type { SeoFields } from "@/components/admin/pages/SeoEditorPanel";
import type { Page } from "@/types/index";
import type { PageLayout as BlockPageLayout } from "@/types/block";
import type { ComponentPreset } from "@/lib/component-presets";
import { Layers, History, Code2, Eye, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

// ─── Admin Page Editor ────────────────────────────────────────────────────────

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { t } = useLanguage();

  const { user: authUser } = useAuth();

  const [page, setPage] = useState<Page | null>(null);
  const [layout, setLayout] = useState<BlockPageLayout>(emptyLayout());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<string>("DRAFT");
  const [lastTransitionBy, setLastTransitionBy] = useState<string | undefined>(undefined);
  const [lastTransitionAt, setLastTransitionAt] = useState<string | undefined>(undefined);

  const [legacySections, setLegacySections] = useState<any[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);

  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [debugJsonOpen, setDebugJsonOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");

  const [languageOpen, setLanguageOpen] = useState(false);
  const [translationWizardOpen, setTranslationWizardOpen] = useState(false);
  const [metaDescription, setMetaDescription] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  const [previewing, setPreviewing] = useState(false);
  const [builderHandle, setBuilderHandle] = useState<PageBuilderHandle | null>(null);

  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();
  const handleSaveRef = useRef<() => Promise<void>>();

  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  useEffect(() => {
    if (id === "new") { setLoading(false); return; }

    setPage(null);
    setLayout(emptyLayout());
    setLegacySections([]);
    setLoading(true);
    setLoadError(null);

    let cancelled = false;

    Promise.all([
      getPage(id),
      getPageSections(id),
    ]).then(([pageRes, sectionsRes]) => {
      if (cancelled) return;
      const p = pageRes.data.data;
      if (!p) {
        setLoadError(t("Failed to load page", "فشل تحميل الصفحة"));
        return;
      }
      setPage(p);
      setMetaTitle(p.metaTitle ?? "");
      setMetaDescription(p.metaDescription ?? "");
      setOgTitle(p.ogTitle ?? "");
      setOgDescription(p.ogDescription ?? "");
      setOgImageUrl(p.ogImageUrl ?? "");
      setWorkflowStatus(p.workflowStatus ?? "DRAFT");
      setLastTransitionBy(p.lastTransitionBy ?? undefined);
      setLastTransitionAt(p.lastTransitionAt ?? undefined);

      const raw = sectionsRes.data.data ?? [];
      const parsed = raw.map((s: any) => ({
        ...s,
        config:  typeof s.config  === "string" ? safeJson(s.config)  : (s.config  ?? {}),
        data:    typeof s.data    === "string" ? safeJson(s.data)    : (s.data    ?? {}),
        styling: typeof s.styling === "string" ? safeJson(s.styling) : (s.styling ?? {}),
      }));
      setLegacySections(parsed);
      const resolved = resolvePageLayout(p.layoutJson, parsed);
      setLayout(resolved);
    }).catch(() => {
      if (!cancelled) setLoadError(t("Failed to load page", "فشل تحميل الصفحة"));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [id, retryCount]);

  useEffect(() => {
    setRetryCount(0);
  }, [id]);

  function safeJson(v: string) {
    try { return JSON.parse(v); } catch { return {}; }
  }

  const handleLayoutChange = useCallback((newLayout: BlockPageLayout) => {
    setLayout(newLayout);
    setIsDirty(true);
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      handleSaveRef.current?.();
    }, 30000);
  }, []);

  const handleWorkflowStatusChange = useCallback((newState: string) => {
    setWorkflowStatus(newState);
    getPage(id).then((res) => {
      const p = res.data.data;
      if (p) {
        setLastTransitionBy(p.lastTransitionBy ?? undefined);
        setLastTransitionAt(p.lastTransitionAt ?? undefined);
      }
    }).catch(() => { /* ignore */ });
  }, [id]);

  useEffect(() => {
    return () => {
      clearTimeout(autoSaveRef.current);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        builderHandle?.undo();
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        builderHandle?.redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [builderHandle]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  async function handleSave() {
    if (!page) return;
    setSaving(true);
    try {
      await updatePage(page.id, {
        titleAr: page.titleAr,
        titleEn: page.titleEn,
        slug: page.slug,
        isPublished: page.isPublished,
        isHomepage: page.isHomepage,
        layoutJson: serializeLayout(layout),
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        ogImageUrl,
      });
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  handleSaveRef.current = handleSave;

  async function handlePreview() {
    if (!page) return;
    setPreviewing(true);
    try {
      const res = await api.post(`/preview/pages/${page.id}`, {
        layoutJson: serializeLayout(layout),
      });
      const { token } = res.data?.data ?? res.data ?? {};
      if (token) {
        window.open(`/api/preview/pages/${page.id}?token=${token}`, "_blank", "noopener,noreferrer");
      } else {
        window.open(`/page/${page.slug}`, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Preview token generation failed:", err);
      window.open(`/page/${page.slug}`, "_blank", "noopener,noreferrer");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleMigrate() {
    if (!page) return;
    const hasExisting = !!page.layoutJson;
    const msg = hasExisting
      ? t("Re-migrate this page's legacy sections to the Block Builder format? This will OVERWRITE the current layout with fresh data from page_sections and reload.", "إعادة هجرة الأقسام القديمة لتنسيق Block Builder؟ سيُستبدل التخطيط الحالي ببيانات page_sections وإعادة التحميل.")
      : t("Migrate this page's legacy sections to the Block Builder format? This will save the layout and reload the page.", "هجرة الأقسام القديمة إلى Block Builder؟ سيحفظ التخطيط ويعيد تحميل الصفحة.");
    if (!confirm(msg)) return;
    setIsMigrating(true);
    try {
      const migratedLayout = migrateLegacySections(legacySections);
      await updatePage(page.id, {
        titleAr: page.titleAr,
        titleEn: page.titleEn,
        slug: page.slug,
        isPublished: page.isPublished,
        isHomepage: page.isHomepage,
        layoutJson: JSON.stringify(migratedLayout),
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        ogImageUrl,
      });
      window.location.reload();
    } catch (err) {
      console.error("Migration failed:", err);
      alert(t("Migration failed. Please try again.", "فشلت الهجرة. حاول مرة أخرى."));
    } finally {
      setIsMigrating(false);
    }
  }

  async function loadVersions() {
    if (!page) return;
    setVersionsLoading(true);
    try {
      const res = await getVersionHistory("page", page.id);
      setVersions(res.data.data ?? []);
    } catch { setVersions([]); }
    finally { setVersionsLoading(false); }
  }

  async function handleRollback(versionNumber: number) {
    if (!page || !confirm(t(`Roll back to version ${versionNumber}?`, `الرجوع إلى الإصدار ${versionNumber}؟`))) return;
    await rollbackContentItem(page.id, versionNumber);
    window.location.reload();
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">{t("Loading page…", "جارٍ تحميل الصفحة…")}</div>;
  }
  if (loadError && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white border border-red-200 rounded-lg shadow-sm p-6 max-w-md w-full mx-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-sm font-bold">!</span>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">{t("Failed to load page", "فشل تحميل الصفحة")}</h2>
              <p className="text-sm text-gray-500 mb-4">
                {retryCount >= 3
                  ? t("Maximum retry attempts reached. Please refresh the page or contact support.", "تم الوصول إلى الحد الأقصى لمحاولات إعادة المحاولة. يرجى تحديث الصفحة.")
                  : t("An error occurred while loading this page. Please try again.", "حدث خطأ أثناء تحميل الصفحة. حاول مرة أخرى.")}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/admin/pages")}
                  className="text-sm text-gray-500 hover:text-gray-800 underline"
                >
                  ← {t("Back to Pages", "رجوع إلى الصفحات")}
                </button>
                {retryCount < 3 ? (
                  <button
                    onClick={() => setRetryCount((c) => c + 1)}
                    className="px-4 py-2 bg-soil-dark text-white rounded text-sm hover:bg-soil-darker"
                  >
                    {t("Retry", "إعادة المحاولة")} {retryCount > 0 ? `(${retryCount}/3)` : ""}
                  </button>
                ) : (
                  <span className="text-xs text-red-500 font-medium">{t("Maximum retry attempts reached", "تم الوصول إلى الحد الأقصى")}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!page) {
    return (
      <div className="text-center py-12">
        <h1 className="font-heading text-3xl font-bold text-soil-dark mb-4">{t("Page not found", "الصفحة غير موجودة")}</h1>
        <p className="text-muted-foreground">{t("This page does not exist or has been deleted.", "هذه الصفحة غير موجودة أو تم حذفها.")}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">

      {/* ── Topbar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/pages")}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← {t("Pages", "الصفحات")}
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="font-semibold text-sm text-gray-800 truncate max-w-xs">
            {page.titleEn || page.titleAr || t("Untitled", "بلا عنوان")}
          </h1>
          <span
            className={
              (page.language ?? "EN") === "AR"
                ? "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-green-100 text-green-700"
                : "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-blue-100 text-blue-700"
            }
          >
            {page.language ?? "EN"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => builderHandle?.undo()}
            disabled={!builderHandle?.canUndo}
            title="Undo (Ctrl+Z)"
            className="flex items-center gap-1 px-2 py-1.5 text-xs border rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↩ {t("Undo", "تراجع")}
          </button>
          <button
            onClick={() => builderHandle?.redo()}
            disabled={!builderHandle?.canRedo}
            title="Redo (Ctrl+Y)"
            className="flex items-center gap-1 px-2 py-1.5 text-xs border rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↪ {t("Redo", "إعادة")}
          </button>
          {legacySections.length > 0 && (
            <button
              onClick={handleMigrate}
              disabled={isMigrating}
              title={page.layoutJson
                ? t("Re-migrate legacy page_sections to fix empty property panel fields", "إعادة هجرة الأقسام القديمة لإصلاح حقول لوحة الخصائص")
                : t("Convert legacy page_sections to Block Builder format", "تحويل الأقسام القديمة إلى تنسيق Block Builder")}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded disabled:opacity-50 ${
                page.layoutJson
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              {isMigrating
                ? t("Migrating…", "جارٍ الهجرة…")
                : page.layoutJson
                  ? `⚡ ${t("Re-migrate Sections", "إعادة هجرة الأقسام")}`
                  : `⚡ ${t("Migrate to Block Builder", "هجرة إلى Block Builder")}`}
            </button>
          )}
          <button
            onClick={() => setSeoOpen(!seoOpen)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-gray-50"
          >
            <Code2 className="w-3.5 h-3.5" /> SEO
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-gray-50 ${menuOpen ? "bg-gray-100" : ""}`}
          >
            ☰ {t("Menus", "القوائم")}
          </button>
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-gray-50 ${languageOpen ? "bg-gray-100" : ""}`}
          >
            🌐 {t("Language", "اللغة")}
          </button>
          <button
            onClick={() => { setShowVersions(!showVersions); if (!showVersions) loadVersions(); }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-gray-50"
          >
            <History className="w-3.5 h-3.5" /> {t("Versions", "الإصدارات")}
          </button>
          <button
            onClick={() => setWorkflowOpen(!workflowOpen)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-gray-50 ${workflowOpen ? "bg-gray-100" : ""}`}
          >
            <Layers className="w-3.5 h-3.5" /> {t("Workflow", "سير العمل")}
          </button>
          <button
            onClick={handlePreview}
            disabled={previewing}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <Eye className="w-3.5 h-3.5" /> {previewing ? t("Previewing…", "جارٍ المعاينة…") : t("Preview", "معاينة")}
          </button>
          {authUser?.role === "ADMIN" && (
            <button
              onClick={() => setDebugJsonOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-gray-50 font-mono text-purple-700 border-purple-200 hover:bg-purple-50"
              title={t("Debug: View raw layout JSON (ADMIN only)", "تصحيح: عرض JSON الخام (للمسؤول فقط)")}
            >
              {"{ }"} JSON
            </button>
          )}
          <button
            onClick={() => setSaveTemplateOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-gray-50"
          >
            📋 {t("Save as Template", "حفظ كقالب")}
          </button>
          {saving ? (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {t("Saving…", "جارٍ الحفظ…")}
            </span>
          ) : isDirty ? (
            <span className="text-xs text-amber-500 font-medium">● {t("Unsaved changes", "تغييرات غير محفوظة")}</span>
          ) : (
            <span className="text-xs text-green-600 font-medium">● {t("Saved", "محفوظ")}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-soil-dark text-white rounded text-sm hover:bg-soil-darker disabled:opacity-50"
          >
            {saving ? t("Saving…", "جارٍ الحفظ…") : t("Save", "حفظ")}
          </button>
        </div>
      </div>

      {/* ── Version history drawer ────────────────────────────────────────── */}
      {showVersions && (
        <div className="border-b bg-white px-4 py-3 flex-shrink-0 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">{t("Version History", "سجل الإصدارات")}</h3>
            <button onClick={() => setShowVersions(false)} className="text-xs text-gray-500 hover:text-gray-800">
              {t("Close", "إغلاق")} ✕
            </button>
          </div>
          {versionsLoading ? (
            <p className="text-xs text-gray-400">{t("Loading…", "جارٍ التحميل…")}</p>
          ) : versions.length === 0 ? (
            <p className="text-xs text-gray-400">{t("No versions saved yet.", "لا توجد إصدارات محفوظة بعد.")}</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-1 font-medium">{t("Version", "الإصدار")}</th>
                  <th className="text-left pb-1 font-medium">{t("Description", "الوصف")}</th>
                  <th className="text-left pb-1 font-medium">{t("By", "بواسطة")}</th>
                  <th className="text-left pb-1 font-medium">{t("Date", "التاريخ")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {versions.map((v: any) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="py-1 font-mono">v{v.versionNumber}</td>
                    <td className="py-1 text-gray-600">{v.changeDescription || "—"}</td>
                    <td className="py-1 text-gray-600">{v.createdByName || "—"}</td>
                    <td className="py-1 text-gray-500">
                      {v.createdAt ? new Date(v.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="py-1">
                      <button
                        onClick={() => handleRollback(v.versionNumber)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <RotateCcw className="w-3 h-3" /> {t("Rollback", "رجوع")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Builder + SEO + Workflow panels ────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden">
          <PageBuilderRoot
            initialLayout={layout}
            onChange={handleLayoutChange}
            onReady={setBuilderHandle}
          />
        </div>
        {seoOpen && (
          <div className="w-80 border-l bg-white flex-shrink-0 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t("SEO & Open Graph", "السيو وOpen Graph")}</h2>
              <button
                onClick={() => setSeoOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <SeoEditorPanel
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              ogTitle={ogTitle}
              ogDescription={ogDescription}
              ogImageUrl={ogImageUrl}
              pageTitle={page.titleEn || page.titleAr || ""}
              pageSlug={page.slug || ""}
              onChange={(field: keyof SeoFields, value: string) => {
                if (field === "metaTitle") setMetaTitle(value);
                else if (field === "metaDescription") setMetaDescription(value);
                else if (field === "ogTitle") setOgTitle(value);
                else if (field === "ogDescription") setOgDescription(value);
                else if (field === "ogImageUrl") setOgImageUrl(value);
                setIsDirty(true);
              }}
            />
          </div>
        )}
        {workflowOpen && (
          <div className="w-72 border-l bg-white flex-shrink-0 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t("Workflow", "سير العمل")}</h2>
              <button
                onClick={() => setWorkflowOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <WorkflowPanel
              pageId={page.id}
              currentState={workflowStatus}
              currentUserRole={authUser?.role ?? "EDITOR"}
              lastTransitionBy={lastTransitionBy}
              lastTransitionAt={lastTransitionAt}
              onStatusChange={handleWorkflowStatusChange}
            />
          </div>
        )}
        {menuOpen && (
          <div className="w-72 border-l bg-white flex-shrink-0 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t("Menu Placement", "موضع القائمة")}</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <MenuPlacementSection
              pageId={page.id}
              pageSlug={page.slug ?? ""}
              pageTitleEn={page.titleEn ?? ""}
              pageTitleAr={page.titleAr ?? ""}
            />
          </div>
        )}
        {languageOpen && (
          <div className="w-72 border-l bg-white flex-shrink-0 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t("Language", "اللغة")}</h2>
              <button
                onClick={() => setLanguageOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t("Current Language", "اللغة الحالية")}</p>
                <span
                  className={
                    (page.language ?? "EN") === "AR"
                      ? "inline-flex items-center px-2 py-1 rounded text-sm font-mono font-semibold bg-green-100 text-green-700"
                      : "inline-flex items-center px-2 py-1 rounded text-sm font-mono font-semibold bg-blue-100 text-blue-700"
                  }
                >
                  {page.language ?? "EN"}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t("Translation Group ID", "معرّف مجموعة الترجمة")}</p>
                <p className="text-xs text-gray-400 font-mono break-all">
                  {page.translationGroupId ?? t("None", "لا يوجد")}
                </p>
              </div>
              <hr className="border-gray-100" />
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  {t("Create a paired translation of this page in", "إنشاء ترجمة مقابلة لهذه الصفحة باللغة")}{" "}
                  <strong>{(page.language ?? "EN") === "AR" ? t("English (EN)", "الإنجليزية (EN)") : t("Arabic (AR)", "العربية (AR)")}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setTranslationWizardOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-blue-200 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  🌐 {t("Add Translation", "إضافة ترجمة")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreatePageWizard
        isOpen={translationWizardOpen}
        onClose={() => setTranslationWizardOpen(false)}
        initialLanguage={(page.language ?? "EN") === "AR" ? "EN" : "AR"}
        initialTitleEn={page.titleEn ?? ""}
        initialTitleAr={page.titleAr ?? ""}
        initialSlug={page.slug ?? ""}
        translationGroupId={page.translationGroupId ?? page.id}
        onCreated={(newPageId) => {
          setTranslationWizardOpen(false);
          setLanguageOpen(false);
        }}
      />

      <SaveAsTemplateModal
        isOpen={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        layoutJson={serializeLayout(layout)}
      />

      {page && (
        <LayoutJsonDebugModal
          isOpen={debugJsonOpen}
          onClose={() => setDebugJsonOpen(false)}
          pageId={page.id}
        />
      )}
    </div>
  );
}

// Need to add useCallback import
import { useCallback } from "react";
