"use client";

import React, { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BUILTIN_THEMES, CLASSIC_SOIL_THEME, type StyleThemeTokens } from "@/lib/style-themes";
import { useStyleTheme } from "@/lib/style-theme-context";
import { StyleThemePreview } from "@/components/admin/StyleThemePreview";
import { Shield, CheckCircle2, Palette, Eye, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// Admin › Style Themes
// 3 tabs: Built-in Themes | Custom Themes | Live Preview
// ─────────────────────────────────────────────────────────────────────────────

type Tab = "builtin" | "custom" | "preview";

export default function StyleThemesPage() {
  const { activeStyleTheme, applyStyleTheme } = useStyleTheme();
  const [activeTab, setActiveTab] = useState<Tab>("builtin");
  const [saving, setSaving] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<StyleThemeTokens>(activeStyleTheme);

  async function applyAndSave(theme: StyleThemeTokens) {
    setSaving(true);
    applyStyleTheme(theme);
    setPreviewTheme(theme);
    try {
      await api.put(`/admin/theme-settings/upsert/style_theme_preset`, {
        settingValue: theme.id,
      });
      toast.success(`Applied "${theme.name}"`);
    } catch {
      toast.error("Failed to save theme. Changes are preview-only.");
    } finally {
      setSaving(false);
    }
  }

  async function restoreDefault() {
    await applyAndSave(CLASSIC_SOIL_THEME);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "builtin",  label: "Built-in Themes" },
    { id: "custom",   label: "Custom Themes" },
    { id: "preview",  label: "Live Preview" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <AdminPageHeader
        title="Style Themes"
        description="Choose a built-in theme or create a custom one. The active theme instantly updates --style-* CSS variables site-wide."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={restoreDefault}
            disabled={saving || activeStyleTheme.id === "classic-soil"}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restore Classic Soil
          </Button>
        }
      />

      {/* ── Tab bar ── */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-soil-clay text-soil-dark"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Built-in Themes ── */}
      {activeTab === "builtin" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {BUILTIN_THEMES.map((theme) => {
            const isActive = activeStyleTheme.id === theme.id;
            return (
              <div
                key={theme.id}
                className={cn(
                  "relative rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer group",
                  isActive ? "border-soil-clay shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                )}
                onClick={() => !saving && applyAndSave(theme)}
              >
                {/* Protected badge */}
                {theme.isProtected && (
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    <Shield className="h-2.5 w-2.5" />
                    Protected
                  </div>
                )}

                {/* Active badge */}
                {isActive && (
                  <div className="absolute top-2 right-2 z-10">
                    <CheckCircle2 className="h-5 w-5 text-soil-clay" />
                  </div>
                )}

                {/* Full preview mockup */}
                <div className="p-3 pt-7">
                  <StyleThemePreview theme={theme} mode="full" className="mx-auto" />
                </div>

                {/* Footer */}
                <div className="px-3 pb-3 space-y-0.5">
                  <p className="font-semibold text-sm text-gray-800">{theme.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{theme.description}</p>
                  <StyleThemePreview theme={theme} mode="compact" className="mt-2" />
                </div>

                {/* Apply overlay on hover (when not active) */}
                {!isActive && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/4 transition-colors duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full px-3 py-1.5 text-xs font-semibold shadow-md text-soil-dark">
                      Apply Theme
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Custom Themes ── */}
      {activeTab === "custom" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <Palette className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">Custom Theme Builder</p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Create a fully custom theme by overriding any token. Custom themes are stored as JSON in the
              <code className="mx-1 px-1 py-0.5 bg-gray-200 rounded text-xs font-mono">style_theme_preset</code>
              site setting.
            </p>
            <p className="text-xs text-gray-400 mt-4">Custom theme editor coming soon.</p>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">Manual JSON Override</p>
            <p className="text-xs text-blue-600 mb-3">
              You can manually paste a full <code className="font-mono">StyleThemeTokens</code> JSON object
              into the <strong>Settings → style_theme_preset</strong> key to use a custom theme.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={() => window.open("/admin/settings", "_blank")}
            >
              Open Settings
            </Button>
          </div>
        </div>
      )}

      {/* ── Live Preview ── */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <Eye className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Live Preview Mode</p>
              <p className="text-xs text-amber-600 mt-1">
                Click any theme below to preview it live on this admin panel. Changes are not saved
                until you click &ldquo;Apply &amp; Save&rdquo;.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BUILTIN_THEMES.map((theme) => {
              const isPreviewing = previewTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setPreviewTheme(theme);
                    applyStyleTheme(theme); // live preview — no DB save
                  }}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all duration-200",
                    isPreviewing ? "border-soil-clay" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <StyleThemePreview theme={theme} mode="compact" className="mb-2" />
                  <p className="text-xs font-semibold text-gray-700 truncate">{theme.name}</p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => applyAndSave(previewTheme)}
              disabled={saving}
              className="bg-soil-clay hover:bg-soil-dark text-white"
            >
              {saving ? "Saving…" : `Apply & Save "${previewTheme.name}"`}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setPreviewTheme(activeStyleTheme); applyStyleTheme(activeStyleTheme); }}
              disabled={previewTheme.id === activeStyleTheme.id}
            >
              Revert to Saved
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
