"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";
import {
  Puzzle, Upload, Play, Pause, Trash2, Settings, RefreshCw,
  CheckCircle, XCircle, Clock, AlertTriangle, Loader2, ChevronDown, ChevronUp, Shield,
  Blocks, Route, Layout,
} from "lucide-react";
import { CmsSDK } from "@/lib/cms-sdk";
import type { PluginBlockDefinition, PluginAdminRoute } from "@/lib/cms-sdk";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PluginRecord {
  id: string;
  pluginId: string;
  pluginName: string;
  version: string;
  author?: string;
  description?: string;
  /** INSTALLED | ACTIVE | INACTIVE | ERROR | UNINSTALLED */
  status: string;
  /** CLASSPATH | JAR */
  source: string;
  jarPath?: string;
  errorMessage?: string;
  configJson?: string;
  manifestJson?: string;
  permissions?: string[];
  installedAt?: string;
  activatedAt?: string;
  deactivatedAt?: string;
  updatedAt?: string;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string; labelAr: string }> = {
  ACTIVE:     { color: "bg-green-100 text-green-700",  icon: <CheckCircle className="h-3 w-3" />, label: "Active",     labelAr: "نشط"          },
  INACTIVE:   { color: "bg-gray-100 text-gray-600",    icon: <Pause className="h-3 w-3" />,       label: "Inactive",   labelAr: "غير نشط"      },
  INSTALLED:  { color: "bg-blue-100 text-blue-700",    icon: <Clock className="h-3 w-3" />,        label: "Installed",  labelAr: "مثبّت"         },
  ERROR:      { color: "bg-red-100 text-red-700",      icon: <XCircle className="h-3 w-3" />,      label: "Error",      labelAr: "خطأ"           },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "plugins" | "extensions";

export default function AdminPluginsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("plugins");

  // Live SDK registry state — updates whenever a plugin calls CmsSDK.register*()
  const [registeredBlocks, setRegisteredBlocks] = useState<PluginBlockDefinition[]>(() => CmsSDK.getAllBlocks());
  const [registeredRoutes, setRegisteredRoutes] = useState<PluginAdminRoute[]>(() => CmsSDK.getAllAdminRoutes());

  useEffect(() => {
    const unsubscribe = CmsSDK.subscribe(() => {
      setRegisteredBlocks(CmsSDK.getAllBlocks());
      setRegisteredRoutes(CmsSDK.getAllAdminRoutes());
    });
    return unsubscribe;
  }, []);

  const { data: plugins = [], isLoading, refetch } = useQuery({
    queryKey: ["plugins"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PluginRecord[]>>("/admin/plugins");
      return res.data.data;
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/plugins/${id}/activate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plugins"] }),
    onError: (err: unknown) => alert(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Activation failed"
    ),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/plugins/${id}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plugins"] }),
  });

  const uninstallMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/plugins/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plugins"] }),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/admin/plugins/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setUploadError(msg ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const activeCount  = plugins.filter(p => p.status === "ACTIVE").length;
  const errorCount   = plugins.filter(p => p.status === "ERROR").length;
  const totalCount   = plugins.length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("Plugin Manager", "مدير الإضافات")}
        description={t(
          "Install, activate, and configure backend plugins — like WordPress Plugins but for the CMS core.",
          "تثبيت الإضافات وتفعيلها وتهيئتها — مثل إضافات WordPress ولكن لنواة نظام إدارة المحتوى."
        )}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {t("Refresh", "تحديث")}
            </button>
            <label className={`flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}>
              {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
              {t("Upload Plugin JAR", "رفع ملف الإضافة")}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jar,.zip"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        }
      />

      {/* Upload error banner */}
      {uploadError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{uploadError}</span>
          <button onClick={() => setUploadError("")} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard value={totalCount}    label={t("Installed", "مثبّتة")}       color="text-gray-700" />
        <StatCard value={activeCount}   label={t("Active", "نشطة")}             color="text-green-600" />
        <StatCard value={errorCount}    label={t("Errors", "أخطاء")}            color="text-red-600" />
        <StatCard value={registeredBlocks.length + registeredRoutes.length}
                  label={t("Frontend Extensions", "تمديدات الواجهة")}
                  color="text-purple-600" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab("plugins")}
            className={`flex items-center gap-1.5 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "plugins"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Puzzle className="h-4 w-4" />
            {t("Backend Plugins", "الإضافات الخلفية")}
            <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{totalCount}</span>
          </button>
          <button
            onClick={() => setActiveTab("extensions")}
            className={`flex items-center gap-1.5 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "extensions"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Blocks className="h-4 w-4" />
            {t("Frontend Extensions", "تمديدات الواجهة")}
            <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {registeredBlocks.length + registeredRoutes.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "plugins" && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
            </div>
          ) : plugins.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <div className="space-y-3">
              {plugins.map((plugin) => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  expanded={expandedId === plugin.id}
                  onToggle={() => setExpandedId(expandedId === plugin.id ? null : plugin.id)}
                  onActivate={() => activateMutation.mutate(plugin.id)}
                  onDeactivate={() => deactivateMutation.mutate(plugin.id)}
                  onUninstall={() => {
                    if (confirm(t(
                      `Uninstall "${plugin.pluginName}"? This removes the JAR file permanently.`,
                      `إلغاء تثبيت "${plugin.pluginName}"؟ سيتم حذف ملف JAR بشكل دائم.`
                    ))) uninstallMutation.mutate(plugin.id);
                  }}
                  isActivating={activateMutation.isPending}
                  isDeactivating={deactivateMutation.isPending}
                />
              ))}
            </div>
          )}

          {/* How it works callout */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-sm text-purple-800 space-y-2">
            <p className="font-semibold">{t("How plugins work", "كيف تعمل الإضافات")}</p>
            <ul className="space-y-1 text-purple-700 list-disc ml-4">
              <li>{t("CLASSPATH plugins are Spring @Component beans annotated with @CmsPluginMeta — auto-discovered at startup.", "إضافات CLASSPATH هي beans تم تحليلها تلقائياً عند البدء.")}</li>
              <li>{t("JAR plugins are uploaded here, loaded via URLClassLoader, and activated on demand.", "إضافات JAR تُرفع هنا، وتُحمّل عند الطلب.")}</li>
              <li>{t("Plugins can subscribe to CMS events (ContentPublished, FormSubmitted, etc.) without modifying core code.", "يمكن للإضافات الاشتراك في أحداث النظام دون تعديل الكود الأساسي.")}</li>
              <li>{t("Declare permissions in @CmsPluginMeta — only declared services are accessible.", "أعلن الصلاحيات في @CmsPluginMeta — فقط الخدمات المُعلنة متاحة.")}</li>
            </ul>
          </div>
        </>
      )}

      {activeTab === "extensions" && (
        <FrontendExtensionsTab
          blocks={registeredBlocks}
          routes={registeredRoutes}
          t={t}
        />
      )}
    </div>
  );
}

// ─── Plugin Card ──────────────────────────────────────────────────────────────

function PluginCard({
  plugin, expanded, onToggle, onActivate, onDeactivate, onUninstall,
  isActivating, isDeactivating,
}: {
  plugin: PluginRecord;
  expanded: boolean;
  onToggle: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onUninstall: () => void;
  isActivating: boolean;
  isDeactivating: boolean;
}) {
  const { t } = useLanguage();
  const sc = STATUS_CONFIG[plugin.status] ?? STATUS_CONFIG.INSTALLED;
  const isClasspath = plugin.source === "CLASSPATH";

  return (
    <div className={`border rounded-xl overflow-hidden bg-white transition-shadow ${
      plugin.status === "ERROR" ? "border-red-300" : "border-gray-200"
    } ${expanded ? "shadow-md" : "shadow-sm hover:shadow-md"}`}>
      {/* Card header — always visible */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Puzzle className="h-5 w-5 text-purple-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{plugin.pluginName}</h3>
            <span className="text-xs text-gray-400 font-mono">v{plugin.version}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
              {sc.icon}
              {t(sc.label, sc.labelAr)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
              isClasspath ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
            }`}>
              {plugin.source}
            </span>
          </div>
          {plugin.description && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{plugin.description}</p>
          )}
        </div>

        {/* Action buttons — always visible */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {plugin.status !== "ACTIVE" && (
            <button
              onClick={(e) => { e.stopPropagation(); onActivate(); }}
              disabled={isActivating}
              className="flex items-center gap-1.5 text-xs text-green-700 border border-green-300 hover:bg-green-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isActivating ? <Loader2 className="animate-spin h-3 w-3" /> : <Play className="h-3 w-3" />}
              {t("Activate", "تفعيل")}
            </button>
          )}
          {plugin.status === "ACTIVE" && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeactivate(); }}
              disabled={isDeactivating}
              className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-300 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isDeactivating ? <Loader2 className="animate-spin h-3 w-3" /> : <Pause className="h-3 w-3" />}
              {t("Deactivate", "تعطيل")}
            </button>
          )}
          {!isClasspath && (
            <button
              onClick={(e) => { e.stopPropagation(); onUninstall(); }}
              className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
              title={t("Uninstall", "إلغاء التثبيت")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 space-y-4">
          {/* Error banner */}
          {plugin.status === "ERROR" && plugin.errorMessage && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{plugin.errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t("Plugin ID", "معرّف الإضافة")}</p>
              <p className="font-mono text-gray-800">{plugin.pluginId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t("Author", "المؤلف")}</p>
              <p className="text-gray-700">{plugin.author || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t("Installed", "تاريخ التثبيت")}</p>
              <p className="text-gray-700">
                {plugin.installedAt ? new Date(plugin.installedAt).toLocaleString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t("Last Activated", "آخر تفعيل")}</p>
              <p className="text-gray-700">
                {plugin.activatedAt ? new Date(plugin.activatedAt).toLocaleString() : "—"}
              </p>
            </div>
          </div>

          {/* Permissions */}
          {(plugin.permissions?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                {t("Declared Permissions", "الصلاحيات المُعلنة")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {plugin.permissions!.map((perm) => (
                  <span key={perm} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-mono">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Config editor */}
          <ConfigEditor pluginId={plugin.id} initialConfig={plugin.configJson ?? "{}"} />

          {/* JAR path */}
          {plugin.jarPath && (
            <p className="text-xs text-gray-400 font-mono">
              {t("JAR:", "ملف JAR:")} {plugin.jarPath}
            </p>
          )}

          {/* Classpath notice */}
          {isClasspath && (
            <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
              {t(
                "This is a classpath plugin built into the application. It cannot be uninstalled via the UI — remove the @Component annotation and redeploy.",
                "هذه إضافة classpath مدمجة في التطبيق. لا يمكن إلغاء تثبيتها من هنا — أزل @Component وأعد النشر."
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Config Editor ────────────────────────────────────────────────────────────

function ConfigEditor({ pluginId, initialConfig }: { pluginId: string; initialConfig: string }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState(
    () => { try { return JSON.stringify(JSON.parse(initialConfig), null, 2); } catch { return "{}"; } }
  );
  const [dirty, setDirty] = useState(false);
  const [jsonError, setJsonError] = useState("");

  const saveMutation = useMutation({
    mutationFn: () => api.put(`/admin/plugins/${pluginId}/config`, { configJson: config }),
    onSuccess: () => { setDirty(false); queryClient.invalidateQueries({ queryKey: ["plugins"] }); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setJsonError(msg ?? t("Save failed", "فشل الحفظ"));
    },
  });

  const handleChange = (v: string) => {
    setConfig(v);
    setDirty(true);
    try { JSON.parse(v); setJsonError(""); } catch { setJsonError(t("Invalid JSON", "JSON غير صحيح")); }
  };

  if (initialConfig === "{}") return null; // skip if no config schema

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
          <Settings className="h-3.5 w-3.5" />
          {t("Plugin Configuration (JSON)", "إعداد الإضافة (JSON)")}
        </p>
        {dirty && (
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!!jsonError || saveMutation.isPending}
            className="text-xs text-purple-700 border border-purple-300 hover:bg-purple-50 px-2 py-1 rounded-lg font-medium disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin h-3 w-3" /> : t("Save Config", "حفظ الإعداد")}
          </button>
        )}
      </div>
      <textarea
        value={config}
        onChange={(e) => handleChange(e.target.value)}
        rows={5}
        spellCheck={false}
        className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y bg-white ${
          jsonError ? "border-red-400" : "border-gray-300"
        }`}
      />
      {jsonError && <p className="text-xs text-red-600 mt-1">{jsonError}</p>}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function EmptyState({ t }: { t: (en: string, ar: string) => string }) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
      <Puzzle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
      <p className="text-gray-500 font-medium">{t("No plugins installed yet", "لا توجد إضافات مثبّتة بعد")}</p>
      <p className="text-sm text-gray-400 mt-1">
        {t(
          "Upload a .jar file above to install a new plugin, or annotate a Spring @Component with @CmsPluginMeta.",
          "ارفع ملف .jar لتثبيت إضافة جديدة، أو أضف @CmsPluginMeta لـ Spring @Component."
        )}
      </p>
    </div>
  );
}

// ─── Frontend Extensions Tab ──────────────────────────────────────────────────

function FrontendExtensionsTab({
  blocks,
  routes,
  t,
}: {
  blocks: PluginBlockDefinition[];
  routes: PluginAdminRoute[];
  t: (en: string, ar: string) => string;
}) {
  const hasExtensions = blocks.length > 0 || routes.length > 0;

  if (!hasExtensions) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
        <Blocks className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">
          {t("No frontend extensions registered yet", "لا توجد تمديدات واجهة مسجّلة بعد")}
        </p>
        <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
          {t(
            "Install a plugin that includes a frontend bundle, or call CmsSDK.registerBlock() from your code.",
            "ثبّت إضافة تتضمن حزمة واجهة، أو استدع CmsSDK.registerBlock() من كودك."
          )}
        </p>
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-left max-w-lg mx-auto text-xs font-mono text-gray-600">
          {`import { CmsSDK } from '@ssssy/cms-sdk';`}<br />
          {`CmsSDK.registerBlock({`}<br />
          {`  type: 'my-block',`}<br />
          {`  label: 'My Custom Block',`}<br />
          {`  render: (props) => <MyBlock {...props} />,`}<br />
          {`});`}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registered Blocks */}
      {blocks.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Layout className="h-4 w-4 text-purple-600" />
            {t("Page-Builder Blocks", "مكونات بناء الصفحات")}
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{blocks.length}</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {blocks.map((block) => (
              <div key={block.type} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Blocks className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{block.label}</p>
                    <p className="font-mono text-xs text-gray-400">{block.type}</p>
                  </div>
                </div>
                {block.schema && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.keys(block.schema).map((prop) => (
                      <span key={prop} className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded font-mono">
                        {prop}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registered Admin Routes */}
      {routes.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Route className="h-4 w-4 text-blue-600" />
            {t("Admin Routes", "مسارات الإدارة")}
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{routes.length}</span>
          </h3>
          <div className="space-y-2">
            {routes.map((route) => (
              <div key={route.path} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Route className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{route.label}</p>
                  {route.labelAr && (
                    <p className="text-xs text-gray-500 font-arabic" dir="rtl">{route.labelAr}</p>
                  )}
                </div>
                <span className="font-mono text-xs text-gray-400">/admin/{route.path}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
        <p className="font-semibold mb-1">{t("How frontend plugins work", "كيف تعمل إضافات الواجهة")}</p>
        <p>{t(
          "Install a backend plugin that declares a frontendBundleUrl in its manifest. The PluginLoader component loads the JS bundle at runtime. The bundle calls CmsSDK.registerBlock() / registerAdminRoute() and extensions appear here immediately.",
          "ثبّت إضافة خلفية تتضمن frontendBundleUrl في manifestها. مكوّن PluginLoader يحمّل الحزمة عند التشغيل. تستدعي الحزمة CmsSDK.registerBlock() وتظهر التمديدات هنا فوراً."
        )}</p>
      </div>
    </div>
  );
}
