"use client";

import { useState, useRef } from "react";
import { Search, X, RotateCcw, FlipHorizontal, FlipVertical, Upload } from "lucide-react";

// Curated icon library using Lucide (already installed)
// Custom SVG icons uploaded by the user are stored in the "Custom" category.

const ICON_CATEGORIES: Record<string, string[]> = {
  "Navigation": ["Home", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "ChevronLeft", "ChevronRight", "ChevronUp", "ChevronDown", "Menu", "X", "ExternalLink", "Link", "Link2", "Map", "MapPin", "Navigation", "Navigation2", "Compass"],
  "Actions": ["Plus", "Minus", "Edit", "Edit2", "Edit3", "Trash", "Trash2", "Save", "Copy", "Clipboard", "Download", "Upload", "Share", "Share2", "Send", "RefreshCw", "RefreshCcw", "RotateCw", "RotateCcw", "Repeat", "Shuffle", "Maximize", "Minimize", "Expand", "Collapse"],
  "Communication": ["Mail", "MessageCircle", "MessageSquare", "Phone", "PhoneCall", "PhoneOff", "AtSign", "Bell", "BellOff", "Rss", "Podcast", "Radio"],
  "Media": ["Image", "Film", "Video", "Music", "Headphones", "Camera", "Mic", "Volume", "Volume1", "Volume2", "VolumeX", "Play", "Pause", "Stop", "SkipBack", "SkipForward", "Rewind", "FastForward"],
  "Files": ["File", "FileText", "FilePlus", "FileMinus", "Folder", "FolderOpen", "FolderPlus", "FolderMinus", "Archive", "Paperclip", "Printer"],
  "UI": ["Star", "Heart", "Bookmark", "Tag", "Flag", "Award", "Gift", "Zap", "Clock", "Calendar", "Eye", "EyeOff", "Lock", "Unlock", "Key", "Settings", "Sliders", "Filter", "Search", "Info", "HelpCircle", "AlertCircle", "AlertTriangle", "CheckCircle", "XCircle"],
  "Layout": ["Grid", "List", "Columns", "Layers", "Layout", "Sidebar", "LayoutGrid", "LayoutList", "LayoutDashboard", "PanelLeft", "PanelRight", "Table", "Rows"],
  "Users": ["User", "Users", "UserPlus", "UserMinus", "UserCheck", "UserX", "UserCircle", "Shield", "ShieldCheck", "ShieldOff"],
  "Science/Nature": ["Leaf", "Sun", "Moon", "Cloud", "CloudRain", "Droplets", "Wind", "Thermometer", "Microscope", "TestTube", "TestTube2", "Beaker", "FlaskConical", "Dna", "Atom", "Wheat", "Flower", "Mountain", "Trees"],
  "Data": ["BarChart", "BarChart2", "LineChart", "PieChart", "TrendingUp", "TrendingDown", "Activity", "Database", "Server", "Cpu", "HardDrive", "Globe"],
  "Social": ["Twitter", "Facebook", "Instagram", "Linkedin", "Youtube", "Github", "Gitlab", "Chrome", "Slack"],
};

const ALL_ICONS = Object.values(ICON_CATEGORIES).flat();

// Custom SVG storage (session-scoped; persisted to sessionStorage for page reloads)
const CUSTOM_SVG_KEY = "ssssy_custom_svgs";
function loadCustomSvgs(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(CUSTOM_SVG_KEY) || "{}"); } catch { return {}; }
}
function saveCustomSvgs(svgs: Record<string, string>) {
  try { sessionStorage.setItem(CUSTOM_SVG_KEY, JSON.stringify(svgs)); } catch { /* noop */ }
}

interface IconPickerModalProps {
  value?: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
  color?: string;
  size?: number;
}

export function IconPickerModal({ value, onChange, onClose, color = "currentColor", size = 24 }: IconPickerModalProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState(value || "");
  const [iconColor, setIconColor] = useState(color);
  const [iconSize, setIconSize] = useState(size);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  // Custom SVG icons uploaded this session
  const [customSvgs, setCustomSvgs] = useState<Record<string, string>>(() => loadCustomSvgs());
  const svgInputRef = useRef<HTMLInputElement>(null);

  const customIconNames = Object.keys(customSvgs);

  const filteredIcons = (() => {
    let base: string[];
    if (category === "__custom__") {
      base = customIconNames;
    } else {
      base = category ? (ICON_CATEGORIES[category] || []) : ALL_ICONS;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter((n) => n.toLowerCase().includes(q));
    }
    return base;
  })();

  const handleSelect = (name: string) => setSelected(name);

  const handleApply = () => {
    if (selected) onChange(selected);
    onClose();
  };

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const svgText = ev.target?.result as string;
      if (!svgText.includes("<svg")) return;
      const name = `custom::${file.name.replace(/\.svg$/i, "")}`;
      const updated = { ...loadCustomSvgs(), [name]: svgText };
      saveCustomSvgs(updated);
      setCustomSvgs(updated);
      setCategory("__custom__");
      setSelected(name);
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-uploaded
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-[860px] max-w-[95vw] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Icon Library</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Category sidebar */}
          <div className="w-44 border-r overflow-y-auto bg-gray-50 p-2">
            <button
              onClick={() => setCategory(null)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm mb-1 ${!category ? "bg-soil-dark text-white" : "hover:bg-gray-200 text-gray-700"}`}
            >
              All Icons ({ALL_ICONS.length})
            </button>
            {Object.keys(ICON_CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`w-full text-left px-3 py-1.5 rounded text-sm mb-1 ${category === cat ? "bg-soil-dark text-white" : "hover:bg-gray-200 text-gray-700"}`}
              >
                {cat} ({ICON_CATEGORIES[cat].length})
              </button>
            ))}
            {/* Custom SVG section */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setCategory("__custom__")}
                className={`w-full text-left px-3 py-1.5 rounded text-sm mb-1 ${category === "__custom__" ? "bg-soil-dark text-white" : "hover:bg-gray-200 text-gray-700"}`}
              >
                Custom SVG ({customIconNames.length})
              </button>
              {/* Hidden file input */}
              <input
                ref={svgInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={handleSvgUpload}
              />
              <button
                onClick={() => svgInputRef.current?.click()}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-blue-700 hover:bg-blue-50 border border-dashed border-blue-300"
              >
                <Upload className="w-3.5 h-3.5" /> Upload SVG
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-soil-dark/30"
                />
              </div>
            </div>

            {/* Icon grid */}
            <div className="flex-1 overflow-y-auto p-3">
              {filteredIcons.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No icons found</p>
              ) : (
                <div className="grid grid-cols-8 gap-1">
                  {filteredIcons.map((name) => (
                    <button
                      key={name}
                      onClick={() => handleSelect(name)}
                      title={name}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                        selected === name
                          ? "border-soil-dark bg-soil-dark/5"
                          : "border-transparent hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <IconDisplay name={name} color={iconColor} size={20} />
                      <span className="text-[9px] text-gray-500 truncate w-full text-center">{name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Properties panel */}
          <div className="w-48 border-l p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Icon Properties</h3>

            {selected ? (
              <>
                <div className="flex items-center justify-center p-4 bg-white rounded-lg border mb-4">
                  <IconDisplay name={selected} color={iconColor} size={iconSize} rotation={rotation} flipH={flipH} flipV={flipV} />
                </div>
                <p className="text-xs text-center text-gray-500 mb-4 font-medium">{selected}</p>
              </>
            ) : (
              <div className="flex items-center justify-center p-4 bg-white rounded-lg border mb-4 h-16">
                <span className="text-xs text-gray-400">Select an icon</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Color</label>
                <input
                  type="color"
                  value={iconColor === "currentColor" ? "#000000" : iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  className="w-full h-8 rounded border cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Size: {iconSize}px</label>
                <input
                  type="range" min={12} max={96} value={iconSize}
                  onChange={(e) => setIconSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Rotation: {rotation}°</label>
                <input
                  type="range" min={0} max={360} step={15} value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded border text-xs ${flipH ? "bg-soil-dark text-white border-soil-dark" : "hover:bg-gray-100"}`}
                >
                  <FlipHorizontal className="w-3 h-3" /> Flip H
                </button>
                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded border text-xs ${flipV ? "bg-soil-dark text-white border-soil-dark" : "hover:bg-gray-100"}`}
                >
                  <FlipVertical className="w-3 h-3" /> Flip V
                </button>
              </div>
              <button
                onClick={() => setRotation(0)}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded border text-xs hover:bg-gray-100"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            {filteredIcons.length} icons shown
            {selected && <span className="ml-2 text-soil-dark font-medium">• {selected} selected</span>}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!selected}
              className="px-4 py-2 bg-soil-dark text-white rounded-lg text-sm disabled:opacity-50 hover:bg-soil-darker"
            >
              Apply Icon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic icon renderer — supports Lucide (first-letter fallback) and custom SVG inline
function IconDisplay({ name, color, size, rotation = 0, flipH = false, flipV = false }: {
  name: string; color: string; size: number; rotation?: number; flipH?: boolean; flipV?: boolean;
}) {
  const transform = [
    rotation ? `rotate(${rotation}deg)` : "",
    flipH ? "scaleX(-1)" : "",
    flipV ? "scaleY(-1)" : "",
  ].filter(Boolean).join(" ");

  // Custom SVG icon — render inline SVG directly
  if (name.startsWith("custom::")) {
    const svgs = loadCustomSvgs();
    const svgText = svgs[name];
    if (svgText) {
      return (
        <span
          style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
            width: size, height: size, transform: transform || undefined, color }}
          title={name.replace("custom::", "")}
          dangerouslySetInnerHTML={{ __html: svgText
            .replace(/<svg([^>]*)>/, `<svg$1 width="${size}" height="${size}" fill="currentColor">`) }}
        />
      );
    }
  }

  // Lucide icon fallback — first letter indicator
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        transform: transform || undefined,
        color,
        fontSize: size * 0.6,
        fontWeight: "bold",
        background: "transparent",
      }}
      title={name}
    >
      {name.charAt(0)}
    </span>
  );
}
