"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Pause, Info, Camera, MapPin, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { ImageToolbar } from "./image-toolbar";
import { GalleryWatermark } from "./gallery-watermark";
import { GallerySocialShare } from "./gallery-social-share";
import { GalleryHotspotOverlay } from "./gallery-hotspot";
import { GalleryColorPalette } from "./gallery-color-palette";
import { GalleryKeyboardShortcuts } from "./gallery-keyboard-shortcuts";
import { cn } from "@/lib/utils";
import type {
  GalleryImage, GalleryLightbox as LightboxSettings, GalleryInteractionTools,
  GalleryWatermark as WatermarkSettings, GallerySocialSharing as SocialSettings,
  GalleryDownloadOptions as DownloadSettings, GalleryHotspot as HotspotSettings,
  GalleryColorIntelligence as ColorSettings, GalleryExif as ExifSettings,
  GalleryAccessControl as AccessSettings, GalleryCustomTheme as ThemeSettings,
} from "@/types/gallery";

const PdfBookViewer = dynamic(() => import("./gallery-pdf-book").then((mod) => mod.PdfBookViewer), { ssr: false });

function isPdfImage(img: GalleryImage): boolean {
  return img.mimeType === "application/pdf" || img.src.toLowerCase().endsWith(".pdf");
}

interface InteractiveLightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  lightboxSettings: LightboxSettings;
  interactionTools: GalleryInteractionTools;
  watermark?: WatermarkSettings;
  socialSharing?: SocialSettings;
  downloadOptions?: DownloadSettings;
  hotspotSettings?: HotspotSettings;
  colorSettings?: ColorSettings;
  exifSettings?: ExifSettings;
  accessControl?: AccessSettings;
  themeSettings?: ThemeSettings;
  keyboardShortcutsEnabled?: boolean;
  showShortcutGuide?: boolean;
}

export function InteractiveLightbox({
  images, currentIndex, isOpen, onClose, onIndexChange,
  lightboxSettings, interactionTools,
  watermark, socialSharing, downloadOptions, hotspotSettings,
  colorSettings, exifSettings, accessControl, themeSettings,
  keyboardShortcutsEnabled, showShortcutGuide,
}: InteractiveLightboxProps) {
  const current = images[currentIndex];
  const isPdf = current ? isPdfImage(current) : false;
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const slideshowRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setRotate(0); setFlipH(false); setFlipV(false); setZoom(1); setIsSlideshow(false); setShowInfo(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setRotate(0); setFlipH(false); setFlipV(false); setZoom(1); setShowInfo(false);
  }, [currentIndex]);

  useEffect(() => {
    if (isSlideshow && lightboxSettings.slideshowEnabled) {
      slideshowRef.current = setInterval(() => {
        onIndexChange((currentIndex + 1) % images.length);
      }, lightboxSettings.slideshowInterval);
    }
    return () => { if (slideshowRef.current) clearInterval(slideshowRef.current); };
  }, [isSlideshow, currentIndex, images.length, lightboxSettings.slideshowInterval, onIndexChange]);

  useEffect(() => {
    if (!lightboxSettings.keyboardNavigation || !isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (!isPdf) {
        if (e.key === "ArrowLeft") onIndexChange((currentIndex - 1 + images.length) % images.length);
        if (e.key === "ArrowRight") onIndexChange((currentIndex + 1) % images.length);
      }
      if (e.key === " " && lightboxSettings.slideshowEnabled) { e.preventDefault(); setIsSlideshow(s => !s); }
      if (!isPdf) {
        if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z + 0.25, 5));
        if (e.key === "-") setZoom(z => Math.max(z - 0.25, 0.25));
        if (e.key === "0") { setRotate(0); setFlipH(false); setFlipV(false); setZoom(1); }
        if (e.key === "r") setRotate(r => r + 90);
        if (e.key === "R") setRotate(r => r - 90);
        if (e.key === "h" || e.key === "H") setFlipH(h => !h);
        if (e.key === "v" || e.key === "V") setFlipV(v => !v);
      }
      if (e.key === "f" || e.key === "F") handleFullscreen();
      if (e.key === "i" || e.key === "I") setShowInfo(s => !s);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, currentIndex, images.length, onIndexChange, onClose, lightboxSettings, isPdf]);

  const handleDownload = useCallback(() => {
    if (!current?.src || accessControl?.disableDownload) return;
    const template = downloadOptions?.filenameTemplate || "{title}";
    const filename = template.replace("{title}", current.alt || "image").replace("{album}", "gallery") + ".jpg";
    const a = document.createElement("a");
    a.href = current.src;
    a.download = filename;
    a.click();
  }, [current, downloadOptions]);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (accessControl?.disableRightClick) e.preventDefault();
  }, [accessControl]);

  if (!current) return null;

  const imageStyle: React.CSSProperties = {
    transform: isPdf ? undefined : `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) scale(${zoom})`,
    transition: isPdf ? undefined : (lightboxSettings.transitionType === "none" ? "none" : "transform 0.3s ease"),
    maxWidth: "90vw",
    maxHeight: "75vh",
    objectFit: "contain" as const,
  };

  const variants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    slide: { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -50 } },
    zoom: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 } },
    none: { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } },
  };
  const transitionVar = variants[lightboxSettings.transitionType] || variants.zoom;
  const showWatermark = watermark?.enabled && !lightboxSettings.enableDownload;
  const hasExif = current.exif && exifSettings?.enabled && exifSettings.displayMode !== "off";

  const themeOverrides: React.CSSProperties = {};
  if (themeSettings?.enabled && themeSettings.backgroundColor) {
    themeOverrides.backgroundColor = themeSettings.backgroundColor;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          style={{ backgroundColor: `rgba(0,0,0,${1 - lightboxSettings.backgroundBlur / 100})`, backdropFilter: `blur(${lightboxSettings.backgroundBlur}px)`, ...themeOverrides }}
          onClick={onClose}
          onContextMenu={handleContextMenu}
        >
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              {lightboxSettings.showCounter && (
                <span className="text-white/70 text-sm">{currentIndex + 1} / {images.length}</span>
              )}
              {colorSettings?.enabled && colorSettings.showPalette && (
                <GalleryColorPalette imageSrc={current.src} settings={colorSettings} />
              )}
            </div>
            <div className="flex items-center gap-2">
              {exifSettings?.enabled && exifSettings.displayMode !== "off" && (
                <button onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Toggle info">
                  <Info className="h-4 w-4" />
                </button>
              )}
              {socialSharing?.enabled && (
                <GallerySocialShare settings={socialSharing} imageUrl={current.src} title={current.title} description={current.description} />
              )}
              <GalleryKeyboardShortcuts enabled={keyboardShortcutsEnabled ?? false} showReferenceOnQuestion={showShortcutGuide ?? true} />
              {lightboxSettings.slideshowEnabled && (
                <button onClick={(e) => { e.stopPropagation(); setIsSlideshow(!isSlideshow); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label={isSlideshow ? "Pause" : "Play"}>
                  {isSlideshow ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative px-4">
            {showWatermark && <GalleryWatermark settings={watermark} />}
            {lightboxSettings.showNavigation && images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); onIndexChange((currentIndex - 1 + images.length) % images.length); }} className="absolute left-2 md:left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10" aria-label="Previous">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onIndexChange((currentIndex + 1) % images.length); }} className="absolute right-2 md:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10" aria-label="Next">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <motion.div
              key={currentIndex}
              variants={isPdf ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : transitionVar}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex items-center justify-center w-full"
            >
              {isPdf ? (
                <PdfBookViewer file={current.src} title={current.title} className="w-full" />
              ) : current.src ? (
                <img src={current.src} alt={current.alt || ""} style={imageStyle} className="select-none" draggable={false} />
              ) : (
                <div className="w-64 h-64 rounded-lg bg-white/10 flex items-center justify-center text-white/40 text-lg">{current.title || "No Image"}</div>
              )}
              {!isPdf && current.hotspotData && hotspotSettings?.enabled && (
                <GalleryHotspotOverlay hotspots={current.hotspotData} settings={hotspotSettings} imageWidth={current.width || 800} imageHeight={current.height || 600} />
              )}
            </motion.div>

            {showInfo && hasExif && current.exif && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-4 top-4 bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-lg p-4 max-w-[220px] z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-2 text-xs text-white/80">
                  {exifSettings.showCamera && current.exif.camera && (
                    <div className="flex items-center gap-2"><Camera className="h-3 w-3 shrink-0" /><span>{current.exif.camera}{current.exif.lens ? ` + ${current.exif.lens}` : ""}</span></div>
                  )}
                  {exifSettings.showDate && current.exif.dateTaken && (
                    <div className="flex items-center gap-2"><Clock className="h-3 w-3 shrink-0" /><span>{current.exif.dateTaken}</span></div>
                  )}
                  {exifSettings.showSettings && (
                    <div className="text-white/60">{current.exif.iso && `ISO ${current.exif.iso}`}{current.exif.aperture && ` · ${current.exif.aperture}`}{current.exif.shutterSpeed && ` · ${current.exif.shutterSpeed}`}{current.exif.focalLength && ` · ${current.exif.focalLength}mm`}</div>
                  )}
                  {exifSettings.showGps && current.exif.gpsLat && current.exif.gpsLng && (
                    <div className="flex items-center gap-2"><MapPin className="h-3 w-3 shrink-0" /><span>{current.exif.gpsLat.toFixed(4)}, {current.exif.gpsLng.toFixed(4)}</span></div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div className="shrink-0 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="text-center md:text-left">
              {current.title && <p className="text-white/90 text-sm font-medium">{current.title}</p>}
              {current.description && <p className="text-white/60 text-xs mt-0.5">{current.description}</p>}
              {downloadOptions?.showLicense && downloadOptions.licenseText && (
                <p className="text-white/40 text-[10px] mt-0.5">{downloadOptions.licenseText}</p>
              )}
            </div>
            {!isPdf && (
              <ImageToolbar
                onRotateLeft={() => setRotate(r => r - 90)}
                onRotateRight={() => setRotate(r => r + 90)}
                onFlipHorizontal={() => setFlipH(h => !h)}
                onFlipVertical={() => setFlipV(v => !v)}
                onZoomIn={() => setZoom(z => Math.min(z + 0.25, 5))}
                onZoomOut={() => setZoom(z => Math.max(z - 0.25, 0.25))}
                onReset={() => { setRotate(0); setFlipH(false); setFlipV(false); setZoom(1); }}
                onDownload={downloadOptions?.enabled && !accessControl?.disableDownload ? handleDownload : undefined}
                onFullscreen={interactionTools.enableZoomTool ? handleFullscreen : undefined}
                showDownload={!!(downloadOptions?.enabled && !accessControl?.disableDownload)}
                showFullscreen={interactionTools.enableZoomTool}
                className="justify-center md:justify-end"
              />
            )}
          </div>

          {lightboxSettings.showThumbnails && images.length > 1 && (
            <div className="shrink-0 px-4 py-2 overflow-x-auto">
              <div className="flex gap-2 justify-center">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => onIndexChange(i)} className={cn("w-12 h-12 rounded-md overflow-hidden shrink-0 border-2 transition-all", i === currentIndex ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80")}>
                    <img src={img.thumbnail || img.src} alt={img.alt || ""} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
