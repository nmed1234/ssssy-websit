"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminThemeSettings, updateThemeSettingByKey } from "@/lib/theme-settings";
import type { ThemeSetting } from "@/types";
import {
  Palette, Type, Ruler, CheckCircle, Save, RotateCcw,
  Eye, EyeOff, Copy, Plus, Trash2, Zap
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type GroupKey = "colors" | "brand_colors" | "fonts" | "layout" | "spacing" | "borders" | "shadows";

type GroupMetaEntry = { labelEn: string; labelAr: string; icon: React.ReactNode; descriptionEn: string; descriptionAr: string };

const GROUP_META: Record<GroupKey, GroupMetaEntry> = {
  colors: {
    labelEn: "UI Colors (HSL)",
    labelAr: "ألوان الواجهة (HSL)",
    icon: <Palette className="w-4 h-4" />,
    descriptionEn: "Core UI color palette using HSL values",
    descriptionAr: "لوحة ألوان الواجهة الأساسية باستخدام قيم HSL",
  },
  brand_colors: {
    labelEn: "Brand Colors",
    labelAr: "ألوان العلامة التجارية",
    icon: <Palette className="w-4 h-4" />,
    descriptionEn: "Primary brand colors in hex/rgb",
    descriptionAr: "الألوان الأساسية للعلامة التجارية بتنسيق hex/rgb",
  },
  fonts: {
    labelEn: "Typography",
    labelAr: "الطباعة",
    icon: <Type className="w-4 h-4" />,
    descriptionEn: "Font families and sizes used across the site",
    descriptionAr: "أنواع الخطوط والأحجام المستخدمة في الموقع",
  },
  layout: {
    labelEn: "Layout & Grid",
    labelAr: "التخطيط والشبكة",
    icon: <Ruler className="w-4 h-4" />,
    descriptionEn: "Container widths, breakpoints, and grid settings",
    descriptionAr: "عرض الحاويات ونقاط التوقف وإعدادات الشبكة",
  },
  spacing: {
    labelEn: "Spacing & Sizing",
    labelAr: "التباعد والأحجام",
    icon: <Ruler className="w-4 h-4" />,
    descriptionEn: "Global spacing scale and sizes",
    descriptionAr: "مقياس التباعد العام والأحجام",
  },
  borders: {
    labelEn: "Borders & Radius",
    labelAr: "الحدود ونصف القطر",
    icon: <Ruler className="w-4 h-4" />,
    descriptionEn: "Border radius tokens and border sizes",
    descriptionAr: "رموز نصف قطر الحدود وأحجامها",
  },
  shadows: {
    labelEn: "Shadows & Effects",
    labelAr: "الظلال والتأثيرات",
    icon: <Zap className="w-4 h-4" />,
    descriptionEn: "Box shadow and elevation tokens",
    descriptionAr: "رموز ظل الصندوق والارتفاع",
  },
};

function hslToHex(hsl: string): string {
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return "#888888";
  const h = parseInt(parts[0], 10);
  const s = parseInt(parts[1], 10) / 100;
  const l = parseInt(parts[2], 10) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function AdminThemesPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [editMap, setEditMap] = useState<Record<string, string>>({});
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [livePreview, setLivePreview] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>("colors");
  const [cssPreview, setCssPreview] = useState(false);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: async () => {
      const res = await getAdminThemeSettings();
      return res.data.data as ThemeSetting[];
    },
  });

  const groups: Record<string, ThemeSetting[]> = {};
  for (const s of settings) {
    const g = s.groupName || "general";
    if (!groups[g]) groups[g] = [];
    groups[g].push(s);
  }

  const getValue = (key: string, fallback: string) =>
    editMap[key] !== undefined ? editMap[key] : fallback;

  const handleChange = (key: string, value: string) => {
    setEditMap((prev) => ({ ...prev, [key]: value }));
    if (livePreview) {
      applyLiveCssVar(key, value);
    }
  };

  const applyLiveCssVar = (key: string, value: string) => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(`--${key}`, value);
    }
  };

  const handleSave = async (setting: ThemeSetting) => {
    const value = editMap[setting.settingKey];
    if (value === undefined || value === setting.settingValue) return;

    setSavingKeys((prev) => new Set(prev).add(setting.settingKey));
    try {
      await updateThemeSettingByKey(setting.settingKey, { settingValue: value });
      queryClient.invalidateQueries({ queryKey: ["theme-settings"] });
      setSavedKeys((prev) => new Set(prev).add(setting.settingKey));
      setTimeout(() => {
        setSavedKeys((prev) => { const n = new Set(prev); n.delete(setting.settingKey); return n; });
      }, 2000);
      setEditMap((prev) => { const n = { ...prev }; delete n[setting.settingKey]; return n; });
    } finally {
      setSavingKeys((prev) => { const n = new Set(prev); n.delete(setting.settingKey); return n; });
    }
  };

  const handleSaveAll = async () => {
    const dirtyKeys = Object.keys(editMap);
    for (const key of dirtyKeys) {
      const setting = settings.find((s) => s.settingKey === key);
      if (setting) await handleSave(setting);
    }
  };

  const handleReset = (setting: ThemeSetting) => {
    setEditMap((prev) => { const n = { ...prev }; delete n[setting.settingKey]; return n; });
    if (livePreview) {
      document.documentElement.style.removeProperty(`--${setting.settingKey}`);
    }
  };

  const generateCssVariables = () => {
    return settings.map((s) => `  --${s.settingKey}: ${editMap[s.settingKey] || s.settingValue};`).join("\n");
  };

  const dirtyCount = Object.keys(editMap).length;
  const activeGroupSettings = groups[activeGroup] || [];

  return (
    <div>
      <AdminPageHeader
        title={t("Theme & Design System", "نظام الثيمات والتصميم")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Themes", "الثيمات") },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCssPreview(!cssPreview)}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-100"
            >
              <Eye className="w-4 h-4" />
              {cssPreview ? t("Hide", "إخفاء") : t("View", "عرض")} CSS
            </button>
            <button
              onClick={() => setLivePreview(!livePreview)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${livePreview ? "bg-green-50 border-green-500 text-green-700" : "hover:bg-gray-100"}`}
            >
              <Zap className="w-4 h-4" />
              {t("Live Preview", "المعاينة المباشرة")} {livePreview ? t("ON", "مفعّل") : t("OFF", "معطّل")}
            </button>
            {dirtyCount > 0 && (
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-2 px-4 py-2 bg-soil-dark text-white rounded-lg text-sm hover:bg-soil-darker"
              >
                <Save className="w-4 h-4" />
                {t("Save All", "حفظ الكل")} ({dirtyCount})
              </button>
            )}
          </div>
        }
      />

      {/* CSS Preview Panel */}
      {cssPreview && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{t("CSS Custom Properties Preview", "معاينة خصائص CSS المخصصة")}</CardTitle>
              <button
                onClick={() => navigator.clipboard?.writeText(`:root {\n${generateCssVariables()}\n}`)}
                className="text-xs text-soil-dark hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> {t("Copy CSS", "نسخ CSS")}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto max-h-64">
              {`:root {\n${generateCssVariables()}\n}`}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-6">
        {/* Left sidebar: group navigation */}
        <div className="w-52 flex-shrink-0">
          <Card>
            <CardContent className="p-2">
              <p className="text-xs font-semibold text-gray-500 uppercase px-2 py-1.5">{t("Setting Groups", "مجموعات الإعدادات")}</p>
              {Object.keys(groups).map((groupName) => {
                const meta = GROUP_META[groupName as GroupKey];
                const dirty = groups[groupName].filter((s) => editMap[s.settingKey] !== undefined).length;
                return (
                  <button
                    key={groupName}
                    onClick={() => setActiveGroup(groupName)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
                      activeGroup === groupName ? "bg-soil-dark text-white" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={activeGroup === groupName ? "text-white" : "text-gray-400"}>
                        {meta?.icon || <Palette className="w-4 h-4" />}
                      </span>
                      <span className="capitalize font-medium">{meta ? t(meta.labelEn, meta.labelAr) : groupName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${activeGroup === groupName ? "text-white/60" : "text-gray-400"}`}>
                        {groups[groupName].length}
                      </span>
                      {dirty > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : activeGroupSettings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">{t("No settings in this group.", "لا توجد إعدادات في هذه المجموعة.")}</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base capitalize">
                      {GROUP_META[activeGroup as GroupKey]
                        ? t(GROUP_META[activeGroup as GroupKey].labelEn, GROUP_META[activeGroup as GroupKey].labelAr)
                        : activeGroup}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {GROUP_META[activeGroup as GroupKey]
                        ? t(GROUP_META[activeGroup as GroupKey].descriptionEn, GROUP_META[activeGroup as GroupKey].descriptionAr)
                        : ""}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">{activeGroupSettings.length} {t("settings", "إعداد")}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeGroupSettings.map((setting) => {
                    const currentValue = getValue(setting.settingKey, setting.settingValue);
                    const isDirty = editMap[setting.settingKey] !== undefined;
                    const isSaving = savingKeys.has(setting.settingKey);
                    const isSaved = savedKeys.has(setting.settingKey);
                    const isColor = setting.settingType === "color" ||
                      setting.settingKey.includes("color") ||
                      setting.settingKey.includes("bg") ||
                      setting.settingKey.includes("border");

                    return (
                      <div
                        key={setting.id}
                        className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                          isDirty ? "border-amber-300 bg-amber-50/40" : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        {/* Color swatch */}
                        {isColor && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div
                              className="w-8 h-8 rounded-lg border shadow-sm"
                              style={{
                                backgroundColor: currentValue.includes(" ")
                                  ? `hsl(${currentValue})`
                                  : currentValue,
                              }}
                            />
                            <input
                              type="color"
                              value={
                                currentValue.includes(" ")
                                  ? hslToHex(currentValue)
                                  : currentValue.startsWith("#")
                                  ? currentValue
                                  : "#888888"
                              }
                              onChange={(e) => {
                                const hex = e.target.value;
                                const newVal = currentValue.includes(" ")
                                  ? hexToHsl(hex)
                                  : hex;
                                handleChange(setting.settingKey, newVal);
                              }}
                              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                          </div>
                        )}

                        {/* Key + Input */}
                        <div className="flex-1 min-w-0">
                          <label className="text-xs font-medium text-gray-700 block mb-1">
                            {setting.label || setting.settingKey}
                            <span className="ml-1 text-gray-400 font-mono text-[10px]">({setting.settingKey})</span>
                          </label>
                          <input
                            type="text"
                            value={currentValue}
                            onChange={(e) => handleChange(setting.settingKey, e.target.value)}
                            className={`w-full border rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-soil-dark/30 ${
                              isDirty ? "border-amber-400" : ""
                            }`}
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isSaved ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : isDirty ? (
                            <>
                              <button
                                onClick={() => handleReset(setting)}
                                className="p-1.5 border rounded hover:bg-gray-100 text-gray-500"
                                title={t("Reset", "إعادة تعيين")}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleSave(setting)}
                                disabled={isSaving}
                                className="flex items-center gap-1 px-3 py-1.5 bg-soil-dark text-white rounded-lg text-xs disabled:opacity-50 hover:bg-soil-darker"
                              >
                                {isSaving ? "..." : <><Save className="w-3 h-3" /> {t("Save", "حفظ")}</>}
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
