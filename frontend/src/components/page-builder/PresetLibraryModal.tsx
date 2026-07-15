"use client";

import { useState } from "react";
import { X, Search, Layers, Star, Save } from "lucide-react";
import type { ComponentPreset } from "@/lib/component-presets";

interface PresetLibraryModalProps {
  presets: ComponentPreset[];
  onApply: (preset: ComponentPreset) => void;
  onSave?: (name: string, nameAr: string) => void;
  onClose: () => void;
  loading?: boolean;
}

const SYSTEM_COMPONENT_TYPES = [
  "hero-banner", "hero-text", "hero-split",
  "features-grid", "features-list", "features-icons",
  "testimonials", "testimonials-slider",
  "cta", "cta-centered", "cta-split",
  "stats", "stats-grid", "stats-counter",
  "gallery", "gallery-masonry", "gallery-slider",
  "team", "team-grid", "team-cards",
  "faq", "faq-accordion",
  "contact-form", "contact-info",
  "pricing", "pricing-table",
  "blog-feed", "blog-grid",
  "video-hero", "video-embed",
  "text-block", "rich-text",
  "image-text", "image-grid",
  "timeline", "roadmap",
  "newsletter-signup",
  "spacer", "divider",
];

export function PresetLibraryModal({
  presets,
  onApply,
  onSave,
  onClose,
  loading = false,
}: PresetLibraryModalProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"system" | "custom" | "types">("system");
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveNameAr, setSaveNameAr] = useState("");

  const systemPresets = presets.filter((p) => p.isSystem);
  const customPresets = presets.filter((p) => !p.isSystem);

  const filterPresets = (list: ComponentPreset[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        (p.nameEn || "").toLowerCase().includes(q) ||
        (p.nameAr || "").toLowerCase().includes(q) ||
        (p.componentType || "").toLowerCase().includes(q)
    );
  };

  const filteredSystem = filterPresets(systemPresets);
  const filteredCustom = filterPresets(customPresets);
  const filteredTypes = SYSTEM_COMPONENT_TYPES.filter((t) =>
    !search.trim() || t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-[820px] max-w-[95vw] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-soil-dark" />
            <h2 className="text-lg font-semibold text-gray-900">Preset Library</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search + Tabs */}
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search presets and component types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-soil-dark/30"
            />
          </div>
          <div className="flex gap-2">
            {(["system", "custom", "types"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-soil-dark text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab === "system" ? `System (${filteredSystem.length})` :
                 tab === "custom" ? `My Presets (${filteredCustom.length})` :
                 `Component Types (${filteredTypes.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-gray-500 text-sm">Loading presets...</span>
            </div>
          ) : activeTab === "types" ? (
            <div className="grid grid-cols-3 gap-3">
              {filteredTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    // Create a virtual preset from the type
                    const virtual: ComponentPreset = {
                      id: `type:${type}`,
                      componentType: type,
                      nameEn: type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                      isSystem: true,
                      configJson: "{}",
                      dataJson: "{}",
                      stylingJson: "{}",
                    };
                    onApply(virtual);
                    onClose();
                  }}
                  className="text-left border rounded-lg p-3 hover:border-soil-dark hover:bg-soil-dark/5 transition-colors group"
                >
                  <div className="w-full h-16 rounded bg-gray-100 group-hover:bg-soil-dark/10 flex items-center justify-center mb-2 text-2xl text-gray-400 group-hover:text-soil-dark transition-colors">
                    {type.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-soil-dark">
                    {type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{type}</p>
                </button>
              ))}
            </div>
          ) : (
            <div>
              {(activeTab === "system" ? filteredSystem : filteredCustom).length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    {search ? "No presets match your search" :
                     activeTab === "custom" ? "No custom presets yet. Save a section as a preset to see it here." :
                     "No system presets available."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {(activeTab === "system" ? filteredSystem : filteredCustom).map((preset) => (
                    <div
                      key={preset.id}
                      className="border rounded-lg overflow-hidden group hover:border-soil-dark hover:shadow-md transition-all"
                    >
                      <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl text-gray-400 group-hover:text-soil-dark transition-colors">
                        {(preset.nameEn || preset.componentType || "P").charAt(0).toUpperCase()}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-800">
                          {preset.nameEn || preset.componentType}
                        </p>
                        {preset.nameAr && (
                          <p className="text-xs text-gray-400 mt-0.5 text-right" dir="rtl">{preset.nameAr}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{preset.componentType}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {preset.isSystem && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px]">
                              System
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            onApply(preset);
                            onClose();
                          }}
                          className="mt-2 w-full text-center py-1.5 bg-soil-dark text-white text-xs rounded hover:bg-soil-darker transition-colors"
                        >
                          Apply Preset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save current section as preset (shown in custom tab) */}
        {activeTab === "custom" && onSave && (
          <div className="p-4 border-t bg-gray-50">
            {!saving ? (
              <button
                onClick={() => setSaving(true)}
                className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg text-sm text-gray-600 hover:border-soil-dark hover:text-soil-dark w-full justify-center"
              >
                <Save className="w-4 h-4" />
                Save Current Section as Custom Preset
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Preset name (English)"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-soil-dark/30"
                />
                <input
                  type="text"
                  placeholder="اسم القالب (عربي)"
                  value={saveNameAr}
                  onChange={(e) => setSaveNameAr(e.target.value)}
                  className="flex-1 border rounded px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-soil-dark/30"
                  dir="rtl"
                />
                <button
                  onClick={() => { onSave(saveName, saveNameAr); setSaving(false); setSaveName(""); setSaveNameAr(""); }}
                  disabled={!saveName.trim()}
                  className="px-3 py-1.5 bg-soil-dark text-white rounded text-sm disabled:opacity-50"
                >
                  Save
                </button>
                <button onClick={() => setSaving(false)} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100">
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end p-3 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
