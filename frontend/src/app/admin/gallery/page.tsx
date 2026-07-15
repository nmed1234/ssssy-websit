"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getSettings, setSetting } from "@/lib/settings";
import { DEFAULT_GALLERY_SETTINGS, type GallerySettings } from "@/types/gallery";
import { Save, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function AdminGallerySettingsPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<GallerySettings>(DEFAULT_GALLERY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchGallerySettings(); }, []);

  async function fetchGallerySettings() {
    setLoading(true);
    try {
      const res = await getSettings();
      const galleryConfig = res.data.data.find((c: { configKey: string }) => c.configKey === "gallery_settings");
      if (galleryConfig?.configValue) {
        setSettings(mergeGallerySettings(DEFAULT_GALLERY_SETTINGS, JSON.parse(galleryConfig.configValue)));
      }
    } catch {}
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setSetting({ configKey: "gallery_settings", configValue: JSON.stringify(settings), configGroup: "gallery", configType: "JSON" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }

  function handleReset() { setSettings(DEFAULT_GALLERY_SETTINGS); }

  function updateSetting<K extends keyof GallerySettings>(group: K, value: Partial<GallerySettings[K]>) {
    setSettings((prev) => ({ ...prev, [group]: { ...prev[group], ...value } as GallerySettings[K] }));
  }

  const tabs = [
    { value: "layout", label: "Layout" },
    { value: "lightbox", label: "Lightbox" },
    { value: "hover", label: "Hover" },
    { value: "filters", label: "Filters" },
    { value: "animation", label: "Animation" },
    { value: "tools", label: "Tools" },
    { value: "watermark", label: "Watermark" },
    { value: "sharing", label: "Sharing" },
    { value: "download", label: "Download" },
    { value: "access", label: "Access" },
    { value: "kenburns", label: "Ken Burns" },
    { value: "beforeafter", label: "Before/After" },
    { value: "hotspot", label: "Hotspots" },
    { value: "color", label: "Color" },
    { value: "exif", label: "EXIF" },
    { value: "theme", label: "Theme" },
    { value: "3d", label: "3D Layouts" },
    { value: "analytics", label: "Analytics" },
    { value: "performance", label: "Performance" },
    { value: "ai", label: "AI Features" },
  ];

  return (
    <div>
      <AdminPageHeader title={t("Gallery Settings", "إعدادات المعرض")} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: t("Gallery Settings", "إعدادات المعرض") }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="h-4 w-4 mr-1" /> Reset</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}</Button>
          </div>
        }
      />
      {saved && <div className="mb-4 px-4 py-2 bg-green-100 text-green-700 rounded text-sm">Settings saved!</div>}

      {loading ? <p className="text-muted-foreground">Loading...</p> : (
        <Tabs defaultValue="layout">
          <TabsList className="mb-4 flex-wrap h-auto">
            {tabs.map((t) => <TabsTrigger key={t.value} value={t.value} className="text-xs py-1.5">{t.label}</TabsTrigger>)}
          </TabsList>

          <TabsContent value="layout">
            <Card><CardHeader><CardTitle>Layout Settings</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField label="Layout Type" value={settings.layout.type} onChange={(v) => updateSetting("layout", { type: v as "grid" | "masonry" | "carousel" })} options={[["grid", "Grid"], ["masonry", "Masonry"], ["carousel", "Carousel"]]} />
                <SelectField label="Aspect Ratio" value={settings.layout.aspectRatio} onChange={(v) => updateSetting("layout", { aspectRatio: v as "square" | "landscape" | "portrait" | "auto" })} options={[["landscape", "Landscape 16:9"], ["square", "Square 1:1"], ["portrait", "Portrait 3:4"], ["auto", "Auto"]]} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberField label="Desktop Columns" value={settings.layout.columns.desktop} min={1} max={8} onChange={(v) => updateSetting("layout", { columns: { ...settings.layout.columns, desktop: v } })} />
                <NumberField label="Tablet Columns" value={settings.layout.columns.tablet} min={1} max={6} onChange={(v) => updateSetting("layout", { columns: { ...settings.layout.columns, tablet: v } })} />
                <NumberField label="Mobile Columns" value={settings.layout.columns.mobile} min={1} max={4} onChange={(v) => updateSetting("layout", { columns: { ...settings.layout.columns, mobile: v } })} />
                <NumberField label="Wide Columns" value={settings.layout.columns.wide} min={1} max={10} onChange={(v) => updateSetting("layout", { columns: { ...settings.layout.columns, wide: v } })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NumberField label="Gap (px)" value={settings.layout.gap} min={0} max={64} onChange={(v) => updateSetting("layout", { gap: v })} />
                <NumberField label="Border Radius (px)" value={settings.layout.borderRadius} min={0} max={32} onChange={(v) => updateSetting("layout", { borderRadius: v })} />
                <NumberField label="Max Height (px, 0=auto)" value={settings.layout.maxImageHeight ?? 0} min={0} max={1200} onChange={(v) => updateSetting("layout", { maxImageHeight: v || null })} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="lightbox">
            <Card><CardHeader><CardTitle>Lightbox Settings</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Lightbox" checked={settings.lightbox.enabled} onChange={(v) => updateSetting("lightbox", { enabled: v })} />
              {settings.lightbox.enabled && <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField label="Transition" value={settings.lightbox.transitionType} onChange={(v) => updateSetting("lightbox", { transitionType: v as "fade" | "slide" | "zoom" | "none" })} options={[["zoom", "Zoom"], ["fade", "Fade"], ["slide", "Slide"], ["none", "None"]]} />
                  <NumberField label="Bg Blur (px)" value={settings.lightbox.backgroundBlur} min={0} max={20} onChange={(v) => updateSetting("lightbox", { backgroundBlur: v })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Navigation Arrows" checked={settings.lightbox.showNavigation} onChange={(v) => updateSetting("lightbox", { showNavigation: v })} />
                  <SwitchField label="Image Counter" checked={settings.lightbox.showCounter} onChange={(v) => updateSetting("lightbox", { showCounter: v })} />
                  <SwitchField label="Thumbnail Strip" checked={settings.lightbox.showThumbnails} onChange={(v) => updateSetting("lightbox", { showThumbnails: v })} />
                  <SwitchField label="Keyboard Nav" checked={settings.lightbox.keyboardNavigation} onChange={(v) => updateSetting("lightbox", { keyboardNavigation: v })} />
                  <SwitchField label="Swipe to Close" checked={settings.lightbox.swipeToClose} onChange={(v) => updateSetting("lightbox", { swipeToClose: v })} />
                  <SwitchField label="Zoom in Lightbox" checked={settings.lightbox.enableZoom} onChange={(v) => updateSetting("lightbox", { enableZoom: v })} />
                  <SwitchField label="Download Button" checked={settings.lightbox.enableDownload} onChange={(v) => updateSetting("lightbox", { enableDownload: v })} />
                  <SwitchField label="Fullscreen Button" checked={settings.lightbox.enableFullscreen} onChange={(v) => updateSetting("lightbox", { enableFullscreen: v })} />
                </div>
                <div className="border-t pt-4">
                  <SwitchField label="Slideshow" checked={settings.lightbox.slideshowEnabled} onChange={(v) => updateSetting("lightbox", { slideshowEnabled: v })} />
                  {settings.lightbox.slideshowEnabled && <NumberField label="Interval (ms)" value={settings.lightbox.slideshowInterval} min={1000} max={15000} step={500} onChange={(v) => updateSetting("lightbox", { slideshowInterval: v })} />}
                </div>
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="hover">
            <Card><CardHeader><CardTitle>Hover Effects</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField label="Hover Effect" value={settings.hoverEffects.effect} onChange={(v) => updateSetting("hoverEffects", { effect: v as "zoom" | "grayscale" | "blur" | "color-shift" | "slide-up" | "none" })} options={[["zoom", "Zoom"], ["grayscale", "Grayscale→Color"], ["blur", "Blur→Clear"], ["color-shift", "Color Shift"], ["slide-up", "Slide Up"], ["none", "None"]]} />
                <SelectField label="Overlay Color" value={settings.hoverEffects.overlayColor} onChange={(v) => updateSetting("hoverEffects", { overlayColor: v as "dark" | "light" | "primary" | "custom" })} options={[["dark", "Dark"], ["light", "Light"], ["primary", "Primary"], ["custom", "Custom"]]} />
              </div>
              <NumberField label="Overlay Opacity (%)" value={settings.hoverEffects.overlayOpacity} min={0} max={100} onChange={(v) => updateSetting("hoverEffects", { overlayOpacity: v })} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SwitchField label="Show Title on Hover" checked={settings.hoverEffects.showTitleOnHover} onChange={(v) => updateSetting("hoverEffects", { showTitleOnHover: v })} />
                <SwitchField label="Show Description on Hover" checked={settings.hoverEffects.showDescriptionOnHover} onChange={(v) => updateSetting("hoverEffects", { showDescriptionOnHover: v })} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="filters">
            <Card><CardHeader><CardTitle>Image Effects (CSS Filters)</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField label="Default Filter" value={settings.imageEffects.defaultFilter} onChange={(v) => updateSetting("imageEffects", { defaultFilter: v as "none" | "grayscale" | "sepia" | "blur" | "saturate" | "contrast" })} options={[["none", "None"], ["grayscale", "Grayscale"], ["sepia", "Sepia"], ["blur", "Blur"], ["saturate", "Saturate"], ["contrast", "Contrast"]]} />
                <SelectField label="Filter Transition" value={settings.animation.filterTransition} onChange={(v) => updateSetting("animation", { filterTransition: v as "instant" | "smooth" })} options={[["smooth", "Smooth"], ["instant", "Instant"]]} />
              </div>
              {settings.imageEffects.defaultFilter !== "none" && <NumberField label={settings.imageEffects.defaultFilter === "blur" ? "Filter Amount (px)" : "Filter Amount (%)"} value={settings.imageEffects.filterAmount} min={0} max={settings.imageEffects.defaultFilter === "blur" ? 20 : 200} onChange={(v) => updateSetting("imageEffects", { filterAmount: v })} />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberField label="Brightness (%)" value={settings.imageEffects.brightness} min={50} max={150} onChange={(v) => updateSetting("imageEffects", { brightness: v })} />
                <NumberField label="Hue Rotate (deg)" value={settings.imageEffects.hueRotate} min={0} max={360} onChange={(v) => updateSetting("imageEffects", { hueRotate: v })} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="animation">
            <Card><CardHeader><CardTitle>Animation Settings</CardTitle></CardHeader><CardContent className="space-y-4">
              <SelectField label="Entrance Animation" value={settings.animation.entranceAnimation} onChange={(v) => updateSetting("animation", { entranceAnimation: v as "fade" | "slide-up" | "scale" | "none" })} options={[["slide-up", "Slide Up"], ["fade", "Fade"], ["scale", "Scale"], ["none", "None"]]} />
              {settings.animation.entranceAnimation !== "none" && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NumberField label="Stagger Delay (ms)" value={settings.animation.staggerDelay} min={0} max={500} step={10} onChange={(v) => updateSetting("animation", { staggerDelay: v })} />
                <NumberField label="Duration (ms)" value={settings.animation.animationDuration} min={100} max={2000} step={50} onChange={(v) => updateSetting("animation", { animationDuration: v })} />
                <SwitchField label="Page Load Animation" checked={settings.animation.pageLoadAnimation} onChange={(v) => updateSetting("animation", { pageLoadAnimation: v })} />
              </div>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card><CardHeader><CardTitle>Interaction Tools (Lightbox)</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SwitchField label="Rotate" checked={settings.interactionTools.enableRotate} onChange={(v) => updateSetting("interactionTools", { enableRotate: v })} />
                <SwitchField label="Flip" checked={settings.interactionTools.enableFlip} onChange={(v) => updateSetting("interactionTools", { enableFlip: v })} />
                <SwitchField label="Zoom Tool" checked={settings.interactionTools.enableZoomTool} onChange={(v) => updateSetting("interactionTools", { enableZoomTool: v })} />
                <SwitchField label="Reset" checked={settings.interactionTools.enableReset} onChange={(v) => updateSetting("interactionTools", { enableReset: v })} />
                <SwitchField label="Pinch Zoom" checked={settings.interactionTools.enablePinchZoom} onChange={(v) => updateSetting("interactionTools", { enablePinchZoom: v })} />
                <SwitchField label="Mouse Wheel Zoom" checked={settings.interactionTools.enableMouseWheelZoom} onChange={(v) => updateSetting("interactionTools", { enableMouseWheelZoom: v })} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="watermark">
            <Card><CardHeader><CardTitle>Watermark & Branding</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Watermark" checked={settings.watermark.enabled} onChange={(v) => updateSetting("watermark", { enabled: v })} />
              {settings.watermark.enabled && <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField label="Watermark Type" value={settings.watermark.type} onChange={(v) => updateSetting("watermark", { type: v as "text" | "image" })} options={[["text", "Text"], ["image", "Image"]]} />
                  <SelectField label="Position" value={settings.watermark.position} onChange={(v) => updateSetting("watermark", { position: v as "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" })} options={[["top-left", "Top Left"], ["top-right", "Top Right"], ["bottom-left", "Bottom Left"], ["bottom-right", "Bottom Right"], ["center", "Center"]]} />
                </div>
                {settings.watermark.type === "text" && <TextField label="Watermark Text" value={settings.watermark.text} onChange={(v) => updateSetting("watermark", { text: v })} />}
                {settings.watermark.type === "image" && <TextField label="Watermark Image URL" value={settings.watermark.imageUrl} onChange={(v) => updateSetting("watermark", { imageUrl: v })} />}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <NumberField label="Opacity (%)" value={settings.watermark.opacity} min={0} max={100} onChange={(v) => updateSetting("watermark", { opacity: v })} />
                  <NumberField label="Size (% of width)" value={settings.watermark.size} min={1} max={50} onChange={(v) => updateSetting("watermark", { size: v })} />
                  <NumberField label="Margin (px)" value={settings.watermark.margin} min={0} max={64} onChange={(v) => updateSetting("watermark", { margin: v })} />
                </div>
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="sharing">
            <Card><CardHeader><CardTitle>Social Sharing & Embed</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Social Sharing" checked={settings.socialSharing.enabled} onChange={(v) => updateSetting("socialSharing", { enabled: v })} />
              {settings.socialSharing.enabled && <>
                <div className="space-y-2"><Label>Platforms</Label>
                  <div className="flex flex-wrap gap-3">
                    {["whatsapp", "twitter", "facebook", "linkedin", "telegram", "email"].map((p) => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={settings.socialSharing.platforms.includes(p as any)} onChange={() => {
                          const platforms = settings.socialSharing.platforms.includes(p as any)
                            ? settings.socialSharing.platforms.filter((x) => x !== p)
                            : [...settings.socialSharing.platforms, p as any];
                          updateSetting("socialSharing", { platforms });
                        }} className="rounded" />
                        <span className="text-sm capitalize">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Show QR Code" checked={settings.socialSharing.showQrCode} onChange={(v) => updateSetting("socialSharing", { showQrCode: v })} />
                  <SwitchField label="Show Embed Button" checked={settings.socialSharing.showEmbedButton} onChange={(v) => updateSetting("socialSharing", { showEmbedButton: v })} />
                </div>
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="download">
            <Card><CardHeader><CardTitle>Download Options</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Downloads" checked={settings.downloadOptions.enabled} onChange={(v) => updateSetting("downloadOptions", { enabled: v })} />
              {settings.downloadOptions.enabled && <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Allow Original Size" checked={settings.downloadOptions.allowOriginal} onChange={(v) => updateSetting("downloadOptions", { allowOriginal: v })} />
                  <SwitchField label="Allow Large Size" checked={settings.downloadOptions.allowLarge} onChange={(v) => updateSetting("downloadOptions", { allowLarge: v })} />
                  <SwitchField label="Allow Medium Size" checked={settings.downloadOptions.allowMedium} onChange={(v) => updateSetting("downloadOptions", { allowMedium: v })} />
                  <SwitchField label="Allow Small Size" checked={settings.downloadOptions.allowSmall} onChange={(v) => updateSetting("downloadOptions", { allowSmall: v })} />
                  <SwitchField label="Bulk Download (ZIP)" checked={settings.downloadOptions.bulkDownload} onChange={(v) => updateSetting("downloadOptions", { bulkDownload: v })} />
                  <SwitchField label="Require Permission" checked={settings.downloadOptions.requirePermission} onChange={(v) => updateSetting("downloadOptions", { requirePermission: v })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField label="Filename Template ({title}, {album})" value={settings.downloadOptions.filenameTemplate} onChange={(v) => updateSetting("downloadOptions", { filenameTemplate: v })} />
                  <SwitchField label="Show License" checked={settings.downloadOptions.showLicense} onChange={(v) => updateSetting("downloadOptions", { showLicense: v })} />
                </div>
                {settings.downloadOptions.showLicense && <TextField label="License Text" value={settings.downloadOptions.licenseText} onChange={(v) => updateSetting("downloadOptions", { licenseText: v })} />}
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="access">
            <Card><CardHeader><CardTitle>Access Control & Privacy</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Access Control" checked={settings.accessControl.enabled} onChange={(v) => updateSetting("accessControl", { enabled: v })} />
              {settings.accessControl.enabled && <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Password Protected" checked={settings.accessControl.passwordProtected} onChange={(v) => updateSetting("accessControl", { passwordProtected: v })} />
                  {settings.accessControl.passwordProtected && <TextField label="Access Password" value={settings.accessControl.password} onChange={(v) => updateSetting("accessControl", { password: v })} />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Disable Right Click" checked={settings.accessControl.disableRightClick} onChange={(v) => updateSetting("accessControl", { disableRightClick: v })} />
                  <SwitchField label="Disable Download" checked={settings.accessControl.disableDownload} onChange={(v) => updateSetting("accessControl", { disableDownload: v })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Expiring Share Links" checked={settings.accessControl.expireLinks} onChange={(v) => updateSetting("accessControl", { expireLinks: v })} />
                  {settings.accessControl.expireLinks && <NumberField label="Expire After (hours)" value={settings.accessControl.expireAfterHours} min={1} max={720} onChange={(v) => updateSetting("accessControl", { expireAfterHours: v })} />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="View Limit" checked={settings.accessControl.viewLimitEnabled} onChange={(v) => updateSetting("accessControl", { viewLimitEnabled: v })} />
                  {settings.accessControl.viewLimitEnabled && <NumberField label="Max Views" value={settings.accessControl.maxViews} min={1} max={10000} onChange={(v) => updateSetting("accessControl", { maxViews: v })} />}
                </div>
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="kenburns">
            <Card><CardHeader><CardTitle>Ken Burns Slideshow Effect</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Ken Burns" checked={settings.kenBurns.enabled} onChange={(v) => updateSetting("kenBurns", { enabled: v })} />
              {settings.kenBurns.enabled && <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField label="Pan Direction" value={settings.kenBurns.panDirection} onChange={(v) => updateSetting("kenBurns", { panDirection: v as "random" | "left-right" | "top-bottom" | "diagonal" })} options={[["random", "Random"], ["left-right", "Left ↔ Right"], ["top-bottom", "Top ↔ Bottom"], ["diagonal", "Diagonal"]]} />
                  <SelectField label="Transition Type" value={settings.kenBurns.transitionType} onChange={(v) => updateSetting("kenBurns", { transitionType: v as "crossfade" | "slide" | "zoom" | "wipe" | "dissolve" | "flash" | "none" })} options={[["crossfade", "Crossfade"], ["slide", "Slide"], ["zoom", "Zoom"], ["wipe", "Wipe"], ["dissolve", "Dissolve"], ["flash", "Flash"], ["none", "None"]]} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberField label="Zoom Ratio (1.0-2.0)" value={settings.kenBurns.zoomRatio} min={1} max={2} step={0.05} onChange={(v) => updateSetting("kenBurns", { zoomRatio: v })} />
                  <NumberField label="Duration (ms)" value={settings.kenBurns.duration} min={2000} max={30000} step={500} onChange={(v) => updateSetting("kenBurns", { duration: v })} />
                </div>
                <TextField label="Background Music URL (optional)" value={settings.kenBurns.backgroundMusicUrl || ""} onChange={(v) => updateSetting("kenBurns", { backgroundMusicUrl: v })} />
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="beforeafter">
            <Card><CardHeader><CardTitle>Before/After Comparison</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Before/After" checked={settings.beforeAfter.enabled} onChange={(v) => updateSetting("beforeAfter", { enabled: v })} />
              {settings.beforeAfter.enabled && <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField label="Handle Style" value={settings.beforeAfter.handleStyle} onChange={(v) => updateSetting("beforeAfter", { handleStyle: v as "circle" | "line" | "dashed" })} options={[["circle", "Circle"], ["line", "Line"], ["dashed", "Dashed"]]} />
                  <SelectField label="Label Position" value={settings.beforeAfter.labelPosition} onChange={(v) => updateSetting("beforeAfter", { labelPosition: v as "top" | "bottom" | "overlay" })} options={[["overlay", "Overlay"], ["top", "Top"], ["bottom", "Bottom"]]} />
                </div>
                <NumberField label="Default Position (%)" value={settings.beforeAfter.defaultPosition} min={1} max={99} onChange={(v) => updateSetting("beforeAfter", { defaultPosition: v })} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Show Labels" checked={settings.beforeAfter.showLabels} onChange={(v) => updateSetting("beforeAfter", { showLabels: v })} />
                </div>
                {settings.beforeAfter.showLabels && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField label="Left Label (Before)" value={settings.beforeAfter.labelLeft} onChange={(v) => updateSetting("beforeAfter", { labelLeft: v })} />
                  <TextField label="Right Label (After)" value={settings.beforeAfter.labelRight} onChange={(v) => updateSetting("beforeAfter", { labelRight: v })} />
                </div>}
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="hotspot">
            <Card><CardHeader><CardTitle>Image Hotspots / Annotations</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Hotspots" checked={settings.hotspot.enabled} onChange={(v) => updateSetting("hotspot", { enabled: v })} />
              {settings.hotspot.enabled && <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField label="Marker Icon" value={settings.hotspot.markerIcon} onChange={(v) => updateSetting("hotspot", { markerIcon: v as "circle" | "pin" | "plus" | "number" })} options={[["pin", "Pin"], ["circle", "Circle"], ["plus", "Plus"], ["number", "Number"]]} />
                  <SelectField label="Tooltip Style" value={settings.hotspot.tooltipStyle} onChange={(v) => updateSetting("hotspot", { tooltipStyle: v as "dark" | "light" | "glass" })} options={[["dark", "Dark"], ["light", "Light"], ["glass", "Glass"]]} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField label="Marker Color (hex)" value={settings.hotspot.markerColor} onChange={(v) => updateSetting("hotspot", { markerColor: v })} />
                  <NumberField label="Marker Size (px)" value={settings.hotspot.markerSize} min={16} max={48} onChange={(v) => updateSetting("hotspot", { markerSize: v })} />
                  <SwitchField label="Show on Hover Only" checked={settings.hotspot.showOnHover} onChange={(v) => updateSetting("hotspot", { showOnHover: v })} />
                </div>
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="color">
            <Card><CardHeader><CardTitle>Color Intelligence</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Color Intelligence" checked={settings.colorIntelligence.enabled} onChange={(v) => updateSetting("colorIntelligence", { enabled: v })} />
              {settings.colorIntelligence.enabled && <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Show Color Palette" checked={settings.colorIntelligence.showPalette} onChange={(v) => updateSetting("colorIntelligence", { showPalette: v })} />
                  <SwitchField label="Enable Color Search" checked={settings.colorIntelligence.enableColorSearch} onChange={(v) => updateSetting("colorIntelligence", { enableColorSearch: v })} />
                  <SwitchField label="Auto-Theme Gallery" checked={settings.colorIntelligence.autoThemeGallery} onChange={(v) => updateSetting("colorIntelligence", { autoThemeGallery: v })} />
                  <NumberField label="Palette Colors" value={settings.colorIntelligence.paletteSize} min={1} max={20} onChange={(v) => updateSetting("colorIntelligence", { paletteSize: v })} />
                </div>
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="exif">
            <Card><CardHeader><CardTitle>EXIF & Metadata Viewer</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable EXIF Display" checked={settings.exif.enabled} onChange={(v) => updateSetting("exif", { enabled: v })} />
              {settings.exif.enabled && <>
                <SelectField label="Display Mode" value={settings.exif.displayMode} onChange={(v) => updateSetting("exif", { displayMode: v as "tooltip" | "sidebar" | "off" })} options={[["tooltip", "Info Panel"], ["sidebar", "Sidebar"], ["off", "Off"]]} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Show Camera" checked={settings.exif.showCamera} onChange={(v) => updateSetting("exif", { showCamera: v })} />
                  <SwitchField label="Show Lens" checked={settings.exif.showLens} onChange={(v) => updateSetting("exif", { showLens: v })} />
                  <SwitchField label="Show Settings (ISO/etc)" checked={settings.exif.showSettings} onChange={(v) => updateSetting("exif", { showSettings: v })} />
                  <SwitchField label="Show GPS" checked={settings.exif.showGps} onChange={(v) => updateSetting("exif", { showGps: v })} />
                  <SwitchField label="Show Date" checked={settings.exif.showDate} onChange={(v) => updateSetting("exif", { showDate: v })} />
                </div>
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card><CardHeader><CardTitle>Custom Theme / CSS</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Custom Theme" checked={settings.customTheme.enabled} onChange={(v) => updateSetting("customTheme", { enabled: v })} />
              {settings.customTheme.enabled && <>
                <div className="space-y-2"><Label>Custom CSS</Label>
                  <textarea value={settings.customTheme.customCss} onChange={(e) => updateSetting("customTheme", { customCss: e.target.value })}
                    className="w-full h-32 border rounded-lg p-3 text-xs font-mono bg-background resize-y" placeholder="/* Custom CSS for gallery */&#10;.gallery-image { border: 2px solid gold; }" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField label="Background Color (hex or empty)" value={settings.customTheme.backgroundColor} onChange={(v) => updateSetting("customTheme", { backgroundColor: v })} />
                  <SelectField label="Caption Position" value={settings.customTheme.captionPosition} onChange={(v) => updateSetting("customTheme", { captionPosition: v as "top" | "bottom" | "overlay" | "tooltip" })} options={[["overlay", "Overlay"], ["bottom", "Bottom"], ["top", "Top"], ["tooltip", "Tooltip"]]} />
                  <SelectField label="Shadow Depth" value={settings.customTheme.shadowDepth} onChange={(v) => updateSetting("customTheme", { shadowDepth: v as "none" | "sm" | "md" | "lg" | "xl" })} options={[["none", "None"], ["sm", "Small"], ["md", "Medium"], ["lg", "Large"], ["xl", "X-Large"]]} />
                  <TextField label="Caption Font" value={settings.customTheme.captionFont} onChange={(v) => updateSetting("customTheme", { captionFont: v })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <NumberField label="Caption Size (px)" value={settings.customTheme.captionSize} min={10} max={32} onChange={(v) => updateSetting("customTheme", { captionSize: v })} />
                  <TextField label="Caption Color (hex)" value={settings.customTheme.captionColor} onChange={(v) => updateSetting("customTheme", { captionColor: v })} />
                  <NumberField label="Grid Gap (px)" value={settings.customTheme.gridGap} min={0} max={64} onChange={(v) => updateSetting("customTheme", { gridGap: v })} />
                </div>
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="3d">
            <Card><CardHeader><CardTitle>3D & Immersive Layouts</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SwitchField label="Cover Flow (3D Carousel)" checked={settings.layouts3d.coverFlow} onChange={(v) => updateSetting("layouts3d", { coverFlow: v })} />
                <SwitchField label="Photo Wall (Polaroid)" checked={settings.layouts3d.photoWall} onChange={(v) => updateSetting("layouts3d", { photoWall: v })} />
                <SwitchField label="Card Flip on Hover" checked={settings.layouts3d.cardFlip} onChange={(v) => updateSetting("layouts3d", { cardFlip: v })} />
              </div>
              {settings.layouts3d.photoWall && <NumberField label="Photo Wall Rotation (deg)" value={settings.layouts3d.photoWallRotation} min={0} max={30} onChange={(v) => updateSetting("layouts3d", { photoWallRotation: v })} />}
              {settings.layouts3d.coverFlow && <SwitchField label="Cover Flow Reflection" checked={settings.layouts3d.coverFlowReflection} onChange={(v) => updateSetting("layouts3d", { coverFlowReflection: v })} />}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card><CardHeader><CardTitle>Analytics & Tracking</CardTitle></CardHeader><CardContent className="space-y-4">
              <SwitchField label="Enable Analytics" checked={settings.analytics.enabled} onChange={(v) => updateSetting("analytics", { enabled: v })} />
              {settings.analytics.enabled && <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Track Views" checked={settings.analytics.trackViews} onChange={(v) => updateSetting("analytics", { trackViews: v })} />
                  <SwitchField label="Track Downloads" checked={settings.analytics.trackDownloads} onChange={(v) => updateSetting("analytics", { trackDownloads: v })} />
                  <SwitchField label="Show Counters" checked={settings.analytics.showCounters} onChange={(v) => updateSetting("analytics", { showCounters: v })} />
                  <SwitchField label="Export CSV" checked={settings.analytics.exportEnabled} onChange={(v) => updateSetting("analytics", { exportEnabled: v })} />
                </div>
              </>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card><CardHeader><CardTitle>Performance Optimizations</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SwitchField label="Enable WebP/AVIF" checked={settings.performance.enableWebp} onChange={(v) => updateSetting("performance", { enableWebp: v })} />
                <SwitchField label="Auto srcset" checked={settings.performance.enableSrcset} onChange={(v) => updateSetting("performance", { enableSrcset: v })} />
                <SwitchField label="LQIP Blur Placeholder" checked={settings.performance.enableLqip} onChange={(v) => updateSetting("performance", { enableLqip: v })} />
                <SwitchField label="Preload Adjacent" checked={settings.performance.preloadAdjacent} onChange={(v) => updateSetting("performance", { preloadAdjacent: v })} />
                <SwitchField label="Virtual Scroll" checked={settings.performance.virtualScroll} onChange={(v) => updateSetting("performance", { virtualScroll: v })} />
              </div>
              {settings.performance.enableSrcset && <div className="space-y-2"><Label>Breakpoints (comma-separated)</Label>
                <Input value={settings.performance.breakpoints.join(", ")} onChange={(e) => updateSetting("performance", { breakpoints: e.target.value.split(",").map(Number).filter(Boolean) })} placeholder="320, 640, 768, 1024, 1280, 1536" />
              </div>}
              <NumberField label="Compression Level (1-100)" value={settings.performance.compressionLevel} min={1} max={100} onChange={(v) => updateSetting("performance", { compressionLevel: v })} />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card><CardHeader><CardTitle>AI Features (API-Key Driven)</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">These features require an external AI/vision API key (e.g., OpenAI, Google Vision).</div>
              <SwitchField label="Enable AI Features" checked={settings.aiFeatures.enabled} onChange={(v) => updateSetting("aiFeatures", { enabled: v })} />
              {settings.aiFeatures.enabled && <>
                <TextField label="API Key" value={settings.aiFeatures.apiKey} onChange={(v) => updateSetting("aiFeatures", { apiKey: v })} type="password" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField label="Auto Alt-Text" checked={settings.aiFeatures.autoAltText} onChange={(v) => updateSetting("aiFeatures", { autoAltText: v })} />
                  <SwitchField label="Auto Tagging" checked={settings.aiFeatures.autoTags} onChange={(v) => updateSetting("aiFeatures", { autoTags: v })} />
                  <SwitchField label="Smart Crop" checked={settings.aiFeatures.smartCrop} onChange={(v) => updateSetting("aiFeatures", { smartCrop: v })} />
                  <SwitchField label="Background Removal" checked={settings.aiFeatures.backgroundRemoval} onChange={(v) => updateSetting("aiFeatures", { backgroundRemoval: v })} />
                  <SwitchField label="Image Upscale" checked={settings.aiFeatures.upscaleEnabled} onChange={(v) => updateSetting("aiFeatures", { upscaleEnabled: v })} />
                </div>
              </>}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function SwitchField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <div className="flex items-center justify-between py-2"><Label className="cursor-pointer text-sm">{label}</Label><Switch checked={checked} onCheckedChange={onChange} /></div>;
}

function NumberField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label><Input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))} /></div>;
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label><Input type={type} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{options.map(([val, display]) => <SelectItem key={val} value={val}>{display}</SelectItem>)}</SelectContent></Select></div>;
}

function mergeGallerySettings(defaults: GallerySettings, partial: Partial<GallerySettings>): GallerySettings {
  return {
    images: partial.images ?? defaults.images,
    layout: { ...defaults.layout, ...partial.layout },
    lightbox: { ...defaults.lightbox, ...partial.lightbox },
    hoverEffects: { ...defaults.hoverEffects, ...partial.hoverEffects },
    imageEffects: { ...defaults.imageEffects, ...partial.imageEffects },
    animation: { ...defaults.animation, ...partial.animation },
    interactionTools: { ...defaults.interactionTools, ...partial.interactionTools },
    watermark: { ...defaults.watermark, ...partial.watermark },
    socialSharing: { ...defaults.socialSharing, ...partial.socialSharing },
    downloadOptions: { ...defaults.downloadOptions, ...partial.downloadOptions },
    accessControl: { ...defaults.accessControl, ...partial.accessControl },
    kenBurns: { ...defaults.kenBurns, ...partial.kenBurns },
    beforeAfter: { ...defaults.beforeAfter, ...partial.beforeAfter },
    hotspot: { ...defaults.hotspot, ...partial.hotspot },
    colorIntelligence: { ...defaults.colorIntelligence, ...partial.colorIntelligence },
    exif: { ...defaults.exif, ...partial.exif },
    customTheme: { ...defaults.customTheme, ...partial.customTheme },
    layouts3d: { ...defaults.layouts3d, ...partial.layouts3d },
    analytics: { ...defaults.analytics, ...partial.analytics },
    performance: { ...defaults.performance, ...partial.performance },
    aiFeatures: { ...defaults.aiFeatures, ...partial.aiFeatures },
  };
}
