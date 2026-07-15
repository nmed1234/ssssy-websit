"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchBar } from "@/components/admin/SearchBar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getSettings, setSetting } from "@/lib/settings";
import api from "@/lib/api";
import type { SystemConfig } from "@/types";
import { useLanguage } from "@/lib/language-context";

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Bilingual site name inline edit state
  const [siteNameEnEdit, setSiteNameEnEdit] = useState<string | null>(null);
  const [siteNameArEdit, setSiteNameArEdit] = useState<string | null>(null);
  const [siteNameSaving, setSiteNameSaving] = useState(false);

  // Bilingual footer copyright inline edit state
  const [copyrightEnEdit, setCopyrightEnEdit] = useState<string | null>(null);
  const [copyrightArEdit, setCopyrightArEdit] = useState<string | null>(null);
  const [copyrightSaving, setCopyrightSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await getSettings();
      const data = res.data.data;
      setSettings(data);
    } catch { }
    setLoading(false);
  }

  function startEdit(setting: SystemConfig) {
    setEditingId(setting.id);
    setEditValue(setting.configValue);
  }

  async function saveEdit(setting: SystemConfig) {
    setSaving(true);
    try {
      await setSetting({
        configKey: setting.configKey,
        configValue: editValue,
        configGroup: setting.configGroup,
        configType: setting.configType,
        isEncrypted: setting.isEncrypted,
      });
      setEditingId(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchSettings();
    } catch { }
    setSaving(false);
  }

  async function saveLogo(url: string) {
    const logoSetting = settings.find(s => s.configKey === "site.logo_url");
    if (!logoSetting) return;
    try {
      await setSetting({
        configKey: "site.logo_url",
        configValue: url,
        configGroup: logoSetting.configGroup || "site",
        configType: logoSetting.configType || "STRING",
        isEncrypted: false,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchSettings();
    } catch { }
  }

  async function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(localUrl);
    setLogoUploadError("");
    setLogoUploading(true);

    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await api.post("/media/files/upload-multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploaded = res.data?.data;
      let uploadedUrl = "";
      if (Array.isArray(uploaded) && uploaded.length > 0) {
        uploadedUrl = uploaded[0].url || uploaded[0].fileUrl || uploaded[0].path || "";
      } else if (uploaded?.url) {
        uploadedUrl = uploaded.url;
      }
      if (uploadedUrl) {
        setLogoPreviewUrl(uploadedUrl);
        await saveLogo(uploadedUrl);
      } else {
        setLogoUploadError(t("Upload succeeded but could not retrieve URL. Check the Media Library.", "نجح الرفع لكن تعذّر استرجاع الرابط. تحقق من مكتبة الوسائط."));
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t("Upload failed. Please try again.", "فشل الرفع. حاول مرة أخرى.");
      setLogoUploadError(message);
      setLogoPreviewUrl("");
    } finally {
      setLogoUploading(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    }
  }

  const logoSetting = settings.find(s => s.configKey === "site.logo_url");
  const currentLogoUrl = logoPreviewUrl || logoSetting?.configValue || "";

  const siteNameEnSetting = settings.find(s => s.configKey === "site.name_en");
  const siteNameArSetting = settings.find(s => s.configKey === "site.name_ar");

  async function saveSiteNameBilingual() {
    setSiteNameSaving(true);
    try {
      const saves: Promise<unknown>[] = [];
      if (siteNameEnEdit !== null && siteNameEnSetting) {
        saves.push(setSetting({
          configKey: "site.name_en",
          configValue: siteNameEnEdit,
          configGroup: siteNameEnSetting.configGroup || "site",
          configType: siteNameEnSetting.configType || "STRING",
          isEncrypted: false,
        }));
      }
      if (siteNameArEdit !== null && siteNameArSetting) {
        saves.push(setSetting({
          configKey: "site.name_ar",
          configValue: siteNameArEdit,
          configGroup: siteNameArSetting.configGroup || "site",
          configType: siteNameArSetting.configType || "STRING",
          isEncrypted: false,
        }));
      }
      await Promise.all(saves);
      setSiteNameEnEdit(null);
      setSiteNameArEdit(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchSettings();
    } catch { }
    setSiteNameSaving(false);
  }

  const copyrightEnSetting = settings.find(s => s.configKey === "footer.copyright_en");
  const copyrightArSetting = settings.find(s => s.configKey === "footer.copyright_ar");

  async function saveCopyrightBilingual() {
    setCopyrightSaving(true);
    try {
      const saves: Promise<unknown>[] = [];
      if (copyrightEnEdit !== null && copyrightEnSetting) {
        saves.push(setSetting({
          configKey: "footer.copyright_en",
          configValue: copyrightEnEdit,
          configGroup: copyrightEnSetting.configGroup || "footer",
          configType: copyrightEnSetting.configType || "STRING",
          isEncrypted: false,
        }));
      }
      if (copyrightArEdit !== null && copyrightArSetting) {
        saves.push(setSetting({
          configKey: "footer.copyright_ar",
          configValue: copyrightArEdit,
          configGroup: copyrightArSetting.configGroup || "footer",
          configType: copyrightArSetting.configType || "STRING",
          isEncrypted: false,
        }));
      }
      await Promise.all(saves);
      setCopyrightEnEdit(null);
      setCopyrightArEdit(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchSettings();
    } catch { }
    setCopyrightSaving(false);
  }

  const groups = Array.from(new Set(settings.map(s => s.configGroup).filter((x): x is string => !!x)));
  const defaultTab = groups[0] || "all";

  const filtered = settings.filter(s => {
    const q = search.toLowerCase();
    return !q || s.configKey.toLowerCase().includes(q) || (s.configValue || "").toLowerCase().includes(q);
  });

  function SettingsTable({ items }: { items: SystemConfig[] }) {
    if (items.length === 0) {
      return <p className="text-muted-foreground py-8 text-center">{t("No settings found", "لا توجد إعدادات")}</p>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 font-medium">{t("Key", "المفتاح")}</th>
              <th className="pb-3 font-medium">{t("Value", "القيمة")}</th>
              <th className="pb-3 font-medium">{t("Actions", "الإجراءات")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((config) => (
              <tr key={config.id} className="border-b last:border-0">
                <td className="py-3 font-mono text-xs">{config.configKey}</td>
                <td className="py-3 max-w-xs">
                  {editingId === config.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type={config.isEncrypted ? "password" : "text"}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 border rounded px-2 py-1 text-sm bg-background"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(config)} disabled={saving}
                        className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:opacity-90 disabled:opacity-50">
                        {t("Save", "حفظ")}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-muted/80">
                        {t("Cancel", "إلغاء")}
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground truncate block">
                      {config.isEncrypted ? "********" : config.configValue}
                    </span>
                  )}
                </td>
                <td className="py-3">
                  <button onClick={() => startEdit(config)}
                    className="text-xs text-primary hover:underline">
                    {t("Edit", "تعديل")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      {/* ── Bilingual Site Name Card ───────────────────────────────────────── */}
      {!loading && (siteNameEnSetting || siteNameArSetting) && (
        <div className="mb-6 border rounded-xl bg-card overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">{t("Site Name (Header Text)", "اسم الموقع (نص الترويسة)")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("The name displayed beside the logo in the public header — shown in the matching language.", "الاسم الظاهر بجانب الشعار في ترويسة الموقع — يعرض بحسب اللغة المحددة.")}
              </p>
            </div>
            {saved && <span className="text-xs text-green-600 font-medium">✓ {t("Saved", "تم الحفظ")}</span>}
          </div>
          <div className="px-5 py-5 space-y-4">
            {/* English name */}
            {siteNameEnSetting && (
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  🇬🇧 {t("English name", "الاسم بالإنجليزية")}
                </label>
                <input
                  type="text"
                  value={siteNameEnEdit !== null ? siteNameEnEdit : (siteNameEnSetting.configValue || "")}
                  onChange={(e) => setSiteNameEnEdit(e.target.value)}
                  className="w-full border rounded-md px-2.5 py-1.5 text-sm bg-background"
                  placeholder="Soil Science Society of Syria (SSSS)"
                  dir="ltr"
                />
              </div>
            )}
            {/* Arabic name */}
            {siteNameArSetting && (
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  🇸🇦 {t("Arabic name", "الاسم بالعربية")}
                </label>
                <input
                  type="text"
                  value={siteNameArEdit !== null ? siteNameArEdit : (siteNameArSetting.configValue || "")}
                  onChange={(e) => setSiteNameArEdit(e.target.value)}
                  className="w-full border rounded-md px-2.5 py-1.5 text-sm bg-background"
                  placeholder="جمعية علوم التربة السورية (SSSS)"
                  dir="rtl"
                />
              </div>
            )}
            {(siteNameEnEdit !== null || siteNameArEdit !== null) && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={saveSiteNameBilingual}
                  disabled={siteNameSaving}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {siteNameSaving ? t("Saving…", "جارٍ الحفظ…") : t("Save names", "حفظ الاسمين")}
                </button>
                <button
                  onClick={() => { setSiteNameEnEdit(null); setSiteNameArEdit(null); }}
                  className="px-2.5 py-1.5 bg-muted text-muted-foreground rounded-md text-xs hover:bg-muted/80"
                >
                  {t("Cancel", "إلغاء")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Footer Copyright Card ─────────────────────────────────────────── */}
      {!loading && (copyrightEnSetting || copyrightArSetting) && (
        <div className="mb-6 border rounded-xl bg-card overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">{t("Footer Copyright", "حقوق النشر في التذييل")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("The copyright line shown at the bottom of every page — displayed in the matching language.", "نص حقوق النشر في تذييل كل صفحة — يعرض بحسب اللغة المحددة.")}
              </p>
            </div>
            {saved && <span className="text-xs text-green-600 font-medium">✓ {t("Saved", "تم الحفظ")}</span>}
          </div>
          <div className="px-5 py-5 space-y-4">
            {copyrightEnSetting && (
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  🇬🇧 {t("English copyright", "حقوق النشر بالإنجليزية")}
                </label>
                <input
                  type="text"
                  value={copyrightEnEdit !== null ? copyrightEnEdit : (copyrightEnSetting.configValue || "")}
                  onChange={(e) => setCopyrightEnEdit(e.target.value)}
                  className="w-full border rounded-md px-2.5 py-1.5 text-sm bg-background"
                  placeholder="Soil Science Society of Syria (SSSS). All rights reserved."
                  dir="ltr"
                />
              </div>
            )}
            {copyrightArSetting && (
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  🇸🇦 {t("Arabic copyright", "حقوق النشر بالعربية")}
                </label>
                <input
                  type="text"
                  value={copyrightArEdit !== null ? copyrightArEdit : (copyrightArSetting.configValue || "")}
                  onChange={(e) => setCopyrightArEdit(e.target.value)}
                  className="w-full border rounded-md px-2.5 py-1.5 text-sm bg-background"
                  placeholder="جمعية علوم التربة السورية (SSSS). جميع الحقوق محفوظة."
                  dir="rtl"
                />
              </div>
            )}
            {(copyrightEnEdit !== null || copyrightArEdit !== null) && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={saveCopyrightBilingual}
                  disabled={copyrightSaving}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {copyrightSaving ? t("Saving…", "جارٍ الحفظ…") : t("Save copyright", "حفظ حقوق النشر")}
                </button>
                <button
                  onClick={() => { setCopyrightEnEdit(null); setCopyrightArEdit(null); }}
                  className="px-2.5 py-1.5 bg-muted text-muted-foreground rounded-md text-xs hover:bg-muted/80"
                >
                  {t("Cancel", "إلغاء")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Site Logo Upload Card ──────────────────────────────────────────── */}
      {!loading && (
        <div className="mb-6 border rounded-xl bg-card overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">{t("Site Logo", "شعار الموقع")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t("Shown in the public header and footer. Recommended: PNG or SVG, min 200×200px.", "يظهر في الترويسة والتذييل. يُنصح: PNG أو SVG، لا يقل عن 200×200 بكسل.")}</p>
            </div>
            {saved && <span className="text-xs text-green-600 font-medium">✓ {t("Saved", "تم الحفظ")}</span>}
          </div>

          <div className="px-5 py-5 flex items-start gap-6">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className={`w-24 h-24 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all ${
                currentLogoUrl ? "border-border bg-white shadow-sm" : "border-dashed border-border bg-muted"
              }`}>
                {currentLogoUrl ? (
                  <img src={currentLogoUrl} alt={t("Site logo", "شعار الموقع")} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-muted-foreground text-xs text-center px-2">{t("No logo", "لا يوجد شعار")}</span>
                )}
              </div>
              {logoUploading && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {t("Uploading…", "جارٍ الرفع…")}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5">{t("Upload new logo", "رفع شعار جديد")}</label>
                <div className="flex items-center gap-2">
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleLogoFileChange}
                    disabled={logoUploading}
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={logoUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {logoUploading ? t("Uploading…", "جارٍ الرفع…") : t("Choose file", "اختر ملفاً")}
                  </button>
                  <span className="text-xs text-muted-foreground">{t("PNG, SVG, JPG, WebP supported", "يدعم PNG وSVG وJPG وWebP")}</span>
                </div>
                {logoUploadError && (
                  <p className="text-xs text-red-500 mt-1">{logoUploadError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">{t("Or paste image URL", "أو الصق رابط الصورة")}</label>
                {logoSetting ? (
                  editingId === logoSetting.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 border rounded-md px-2.5 py-1.5 text-xs bg-background"
                        placeholder="https://example.com/logo.png"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(logoSetting)} disabled={saving}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs hover:opacity-90 disabled:opacity-50">
                        {t("Save", "حفظ")}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="px-2.5 py-1.5 bg-muted text-muted-foreground rounded-md text-xs hover:bg-muted/80">
                        {t("Cancel", "إلغاء")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-xs text-muted-foreground border rounded-md px-2.5 py-1.5 bg-muted/30 truncate">
                        {logoSetting.configValue || t("Not set — using default /logo.svg", "غير مُعيّن — يستخدم /logo.svg الافتراضي")}
                      </span>
                      <button onClick={() => startEdit(logoSetting)}
                        className="px-3 py-1.5 border rounded-md text-xs hover:bg-muted/50 transition-colors">
                        {t("Edit URL", "تعديل الرابط")}
                      </button>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-amber-600 border border-amber-200 rounded-md px-2.5 py-1.5 bg-amber-50">
                    {t("Run the V41 migration first to add the", "شغّل مهاجرة V41 أولاً لإضافة")} <code className="font-mono">site.logo_url</code> {t("setting to the database.", "إلى قاعدة البيانات.")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminPageHeader
        title={t("System Settings", "إعدادات النظام")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Settings", "الإعدادات") },
        ]}
      />
      {saved && <div className="mb-4 px-4 py-2 bg-green-100 text-green-700 rounded text-sm">✓ {t("Setting saved successfully", "تم حفظ الإعداد بنجاح")}</div>}

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder={t("Search settings...", "بحث في الإعدادات...")} />
      </div>

      {loading ? <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p> : search ? (
        <Card>
          <CardHeader><CardTitle>{t("Search Results", "نتائج البحث")} ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            <SettingsTable items={filtered} />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-4">
            {groups.map((g) => (
              <TabsTrigger key={g} value={g}>{g}</TabsTrigger>
            ))}
          </TabsList>
          {groups.map((g) => (
            <TabsContent key={g} value={g}>
              <Card>
                <CardHeader><CardTitle>{g} {t("Settings", "الإعدادات")}</CardTitle></CardHeader>
                <CardContent>
                  <SettingsTable items={settings.filter(s => s.configGroup === g)} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
