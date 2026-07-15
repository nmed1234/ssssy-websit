"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveLightbox } from "./interactive-lightbox";
import { GalleryWatermark } from "./gallery-watermark";
import { GalleryBeforeAfter } from "./gallery-before-after";
import { GalleryColorPalette } from "./gallery-color-palette";
import { PhotoWall3D } from "./gallery-photo-wall";
import { CoverFlow3D } from "./gallery-cover-flow";
import { GalleryKenBurnsDisplay } from "./gallery-ken-burns";
import GalleryPanorama from "./gallery-panorama";
import GalleryColorSearch, { filterImagesByColor } from "./gallery-color-search";
import { useGalleryAutoTheme, GalleryThemeProvider } from "./gallery-auto-theme";
import GalleryVirtualScroll from "./gallery-virtual-scroll";
import { DEFAULT_GALLERY_SETTINGS } from "@/types/gallery";
import type { GallerySettings, GalleryImage } from "@/types/gallery";

function isPdfGalleryImage(img: GalleryImage): boolean {
  return img.mimeType === "application/pdf" || img.src.toLowerCase().endsWith(".pdf");
}

interface AdvancedGalleryProps {
  images: GalleryImage[];
  settings?: Partial<GallerySettings>;
  className?: string;
  albumId?: string;
  accessToken?: string;
}

export function AdvancedGallery({ images: rawImages, settings: partialSettings, className, albumId, accessToken }: AdvancedGalleryProps) {
  const settings: GallerySettings = useMemo(() => mergeSettings(DEFAULT_GALLERY_SETTINGS, partialSettings), [partialSettings]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const allPaletteColors = useMemo(() => {
    const colors = new Set<string>();
    rawImages.forEach((img) => {
      if (img.palette) {
        img.palette.forEach((c) => colors.add(c));
      }
    });
    return Array.from(colors).slice(0, 12);
  }, [rawImages]);

  const images = useMemo(() => {
    if (!selectedColor) return rawImages;
    return filterImagesByColor(rawImages, selectedColor);
  }, [rawImages, selectedColor]);

  const theme = useGalleryAutoTheme(
    images.length > 0 && settings.colorIntelligence.autoThemeGallery ? images[lightboxIndex ?? 0]?.src || null : null,
    settings.colorIntelligence.autoThemeGallery
  );

  const has3d = settings.layouts3d.coverFlow || settings.layouts3d.photoWall;
  const hasPanorama = images.some((img) => {
    if (!img.width || !img.height) return false;
    return img.width / img.height > 2.5;
  });
  const showBeforeAfter = settings.beforeAfter.enabled && images.some((img) => img.beforeSrc);
  const useVirtualScroll = settings.performance.virtualScroll && images.length > 100;

  const columns = useMemo(() => {
    const c = settings.layout.columns;
    return `grid-cols-${c.mobile} sm:grid-cols-${c.tablet} lg:grid-cols-${c.desktop} xl:grid-cols-${c.wide}`;
  }, [settings.layout.columns]);

  const gapStyle = { gap: settings.layout.gap };
  const borderRadiusStyle = { borderRadius: settings.layout.borderRadius };

  const filterStyle = useMemo(() => {
    const f = settings.imageEffects;
    if (f.defaultFilter === "none") return {};
    const filterMap: Record<string, string> = {
      grayscale: `grayscale(${f.filterAmount}%)`,
      sepia: `sepia(${f.filterAmount}%)`,
      blur: `blur(${f.filterAmount}px)`,
      saturate: `saturate(${f.filterAmount}%)`,
      contrast: `contrast(${f.filterAmount}%)`,
    };
    return {
      filter: `${filterMap[f.defaultFilter] || ""} brightness(${f.brightness}%) hue-rotate(${f.hueRotate}deg)`,
      transition: settings.animation.filterTransition === "smooth" ? "filter 0.3s ease" : undefined,
    };
  }, [settings.imageEffects, settings.animation.filterTransition]);

  const hoverFilterStyle = useMemo(() => {
    if (settings.hoverEffects.effect === "grayscale") return { filter: "grayscale(0%)" };
    if (settings.hoverEffects.effect === "blur") return { filter: "blur(0)" };
    return {};
  }, [settings.hoverEffects.effect]);

  const overlayBg = useMemo(() => {
    const o = settings.hoverEffects;
    const baseColor = o.overlayColor === "dark" ? "0,0,0" :
      o.overlayColor === "light" ? "255,255,255" :
      o.overlayColor === "primary" ? "46,125,50" : "0,0,0";
    return `rgba(${baseColor}, ${o.overlayOpacity / 100})`;
  }, [settings.hoverEffects]);

  const entranceVar = useMemo((): Variants => {
    const a = settings.animation.entranceAnimation;
    if (a === "none") return { hidden: { opacity: 1 }, show: { opacity: 1 } };
    if (a === "fade") return { hidden: { opacity: 0 }, show: { opacity: 1 } };
    if (a === "scale") return { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } };
    return { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
  }, [settings.animation.entranceAnimation]);

  const containerVariants: Variants = useMemo(() => ({
    hidden: entranceVar.hidden,
    show: {
      ...entranceVar.show,
      transition: { staggerChildren: settings.animation.staggerDelay / 1000, delayChildren: settings.animation.pageLoadAnimation ? 0.2 : 0 },
    },
  }), [entranceVar, settings.animation.staggerDelay, settings.animation.pageLoadAnimation]);

  const itemVariants: Variants = useMemo(() => ({
    hidden: entranceVar.hidden,
    show: {
      ...entranceVar.show,
      transition: { duration: settings.animation.animationDuration / 1000, ease: "easeOut" },
    },
  }), [entranceVar, settings.animation.animationDuration]);

  function renderLightbox() {
    if (lightboxIndex === null) return null;
    return (
      <InteractiveLightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
        lightboxSettings={settings.lightbox}
        interactionTools={settings.interactionTools}
        watermark={settings.watermark}
        socialSharing={settings.socialSharing}
        downloadOptions={settings.downloadOptions}
        hotspotSettings={settings.hotspot}
        colorSettings={settings.colorIntelligence}
        exifSettings={settings.exif}
        accessControl={settings.accessControl}
        themeSettings={settings.customTheme}
        keyboardShortcutsEnabled={true}
        showShortcutGuide={true}
      />
    );
  }

  if (images.length === 0) {
    return <div className="text-center py-12 text-muted-foreground"><p>No images in gallery</p></div>;
  }

  const showWatermarkInGrid = settings.watermark.enabled && !settings.lightbox.enabled;

  const galleryContent = (
    <div ref={galleryRef} className={cn("relative", className)}>
      {settings.colorIntelligence.enabled && settings.colorIntelligence.enableColorSearch && allPaletteColors.length > 0 && (
        <div className="mb-4">
          <GalleryColorSearch palette={allPaletteColors} onColorSelect={setSelectedColor} selectedColor={selectedColor} />
        </div>
      )}

      {showBeforeAfter ? (
        <div className="space-y-6">
          {images.map((img, i) => {
            const _isPdf = isPdfGalleryImage(img);
            if (img.beforeSrc && !_isPdf) return (
              <GalleryBeforeAfter
                key={img.id || i}
                beforeSrc={img.beforeSrc!}
                afterSrc={img.src}
                settings={settings.beforeAfter}
                alt={img.alt}
              />
            );
            return (
              <div key={img.id || i} className="relative overflow-hidden rounded-lg" style={{ borderRadius: settings.layout.borderRadius }}>
                {showWatermarkInGrid && <GalleryWatermark settings={settings.watermark} />}
                {_isPdf ? (
                  <button onClick={() => setLightboxIndex(i)} className="w-full block">
                    <div className="w-full h-64 flex flex-col items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", borderRadius: settings.layout.borderRadius }}>
                      <FileText className="h-12 w-12 text-red-400/80" />
                      <span className="text-white/40 text-sm">{img.title || "PDF Document"}</span>
                    </div>
                  </button>
                ) : img.src ? (
                  hasPanorama && img.width && img.height && img.width / img.height > 2.5 ? (
                    <button onClick={() => setLightboxIndex(i)} className="w-full block">
                      <GalleryPanorama src={img.src} alt={img.alt || ""} width={img.width} height={Math.min(img.height, 500)} />
                    </button>
                  ) : (
                    <button onClick={() => setLightboxIndex(i)} className="w-full">
                      <img src={img.src} alt={img.alt || ""} className="w-full object-cover" style={{ maxHeight: "70vh", ...filterStyle }} loading="lazy" />
                    </button>
                  )
                ) : (
                  <div className="w-full h-64 bg-muted flex items-center justify-center text-muted-foreground">{img.title || "No Image"}</div>
                )}
                {!_isPdf && settings.colorIntelligence.enabled && settings.colorIntelligence.showPalette && (
                  <GalleryColorPalette imageSrc={img.src} settings={settings.colorIntelligence} className="absolute bottom-2 right-2" />
                )}
              </div>
            );
          })}
        </div>
      ) : useVirtualScroll ? (
        <GalleryVirtualScroll
          items={images.map((img, i) => ({
            id: img.id || `img-${i}`,
            height: img.height ? Math.min(img.height, 400) : 300,
            render: () => (
              <GalleryImageItem
                image={img} index={i} settings={settings} filterStyle={filterStyle}
                hoverFilterStyle={hoverFilterStyle} overlayBg={overlayBg}
                borderRadiusStyle={borderRadiusStyle} itemVariants={itemVariants}
                onClick={() => setLightboxIndex(i)}
              />
            ),
          }))}
          containerHeight={800}
        />
      ) : settings.layout.type === "carousel" ? (
        <CarouselLayout
          images={images} settings={settings} filterStyle={filterStyle}
          borderRadiusStyle={borderRadiusStyle} gapStyle={gapStyle}
          onImageClick={(i) => setLightboxIndex(i)}
        />
      ) : settings.layout.type === "masonry" ? (
        <MasonryLayout
          images={images} settings={settings} filterStyle={filterStyle}
          hoverFilterStyle={hoverFilterStyle} overlayBg={overlayBg}
          borderRadiusStyle={borderRadiusStyle}
          containerVariants={containerVariants} itemVariants={itemVariants}
          onImageClick={(i) => setLightboxIndex(i)}
        />
      ) : (
        <GridLayout
          images={images} settings={settings} filterStyle={filterStyle}
          hoverFilterStyle={hoverFilterStyle} overlayBg={overlayBg}
          borderRadiusStyle={borderRadiusStyle} columns={columns} gapStyle={gapStyle}
          containerVariants={containerVariants} itemVariants={itemVariants}
          onImageClick={(i) => setLightboxIndex(i)}
        />
      )}

      {renderLightbox()}
    </div>
  );

  if (settings.colorIntelligence.autoThemeGallery) {
    return <GalleryThemeProvider theme={theme}>{galleryContent}</GalleryThemeProvider>;
  }

  return galleryContent;
}

function GalleryImageItem({
  image, index, settings, filterStyle, hoverFilterStyle, overlayBg,
  borderRadiusStyle, itemVariants, onClick,
}: {
  image: GalleryImage; index: number; settings: GallerySettings;
  filterStyle: React.CSSProperties; hoverFilterStyle: React.CSSProperties;
  overlayBg: string; borderRadiusStyle: React.CSSProperties;
  itemVariants: Variants;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isPdf = isPdfGalleryImage(image);

  const aspectClass = settings.layout.aspectRatio === "square" ? "aspect-square" :
    settings.layout.aspectRatio === "landscape" ? "aspect-video" :
    settings.layout.aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-auto";

  const hoverTransform = settings.hoverEffects.effect === "zoom" ? "scale(1.08)" :
    settings.hoverEffects.effect === "slide-up" ? "translateY(-8px)" : "none";

  const showWatermark = settings.watermark.enabled && !settings.lightbox.enabled;

  return (
    <motion.div
      variants={itemVariants}
      className={cn("break-inside-avoid relative group", aspectClass)}
      style={{ ...borderRadiusStyle, overflow: "hidden", maxHeight: settings.layout.maxImageHeight ? `${settings.layout.maxImageHeight}px` : undefined }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      layout
    >
      <button onClick={onClick} className="relative w-full h-full block cursor-pointer text-left" aria-label={`View ${image.alt || image.title || (isPdf ? "PDF" : "image")}`}>
        <div className="w-full h-full overflow-hidden" style={{ borderRadius: settings.layout.borderRadius, background: isPdf ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)" : undefined }}>
          {showWatermark && <GalleryWatermark settings={settings.watermark} />}
          {isPdf ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
              <FileText className="h-10 w-10 text-red-400/80" />
              <span className="text-white/40 text-xs text-center truncate max-w-full px-2">{image.title || "PDF Document"}</span>
            </div>
          ) : image.src ? (
            <img src={image.src} alt={image.alt || ""} loading="lazy" className="w-full h-full object-cover transition-transform duration-500"
              style={{ ...filterStyle, transform: isHovered ? hoverTransform : "none", ...(isHovered ? hoverFilterStyle : {}) }} />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">{image.title || "No Image"}</div>
          )}
        </div>

        <div className="absolute inset-0 transition-opacity duration-300 flex flex-col justify-end p-4"
          style={{ backgroundColor: isHovered ? overlayBg : "transparent", opacity: isHovered ? 1 : 0, borderRadius: settings.layout.borderRadius }}>
          {settings.hoverEffects.showTitleOnHover && image.title && (
            <span className="text-white font-medium text-sm transition-transform duration-300" style={{ transform: isHovered ? "translateY(0)" : "translateY(8px)" }}>{image.title}</span>
          )}
          {settings.hoverEffects.showDescriptionOnHover && image.description && (
            <span className="text-white/70 text-xs mt-1 transition-transform duration-300" style={{ transform: isHovered ? "translateY(0)" : "translateY(8px)" }}>{image.description}</span>
          )}
        </div>
      </button>

      {!isPdf && settings.colorIntelligence.enabled && settings.colorIntelligence.showPalette && (
        <GalleryColorPalette imageSrc={image.src} settings={settings.colorIntelligence} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  );
}

function GridLayout({ images, settings, filterStyle, hoverFilterStyle, overlayBg, borderRadiusStyle, columns, gapStyle, containerVariants, itemVariants, onImageClick }: LayoutProps) {
  const cv: Variants = containerVariants ?? { hidden: {}, show: {} };
  const iv: Variants = itemVariants ?? { hidden: {}, show: {} };
  return (
    <motion.div variants={cv} initial={settings.animation.entranceAnimation !== "none" ? "hidden" : "show"} whileInView={settings.animation.entranceAnimation !== "none" ? "show" : undefined} viewport={{ once: true }} className={cn("grid", columns)} style={gapStyle}>
      {images.map((image, i) => (
        <GalleryImageItem key={image.id || i} image={image} index={i} settings={settings} filterStyle={filterStyle} hoverFilterStyle={hoverFilterStyle} overlayBg={overlayBg} borderRadiusStyle={borderRadiusStyle} itemVariants={iv} onClick={() => onImageClick(i)} />
      ))}
    </motion.div>
  );
}

function MasonryLayout({ images, settings, filterStyle, hoverFilterStyle, overlayBg, borderRadiusStyle, containerVariants, itemVariants, onImageClick }: Omit<LayoutProps, "columns" | "gapStyle">) {
  const cv: Variants = containerVariants ?? { hidden: {}, show: {} };
  const iv: Variants = itemVariants ?? { hidden: {}, show: {} };
  const cols = settings.layout.columns.desktop;
  const colWidth = `${100 / cols}%`;
  const gap = settings.layout.gap;
  const columns = useMemo(() => {
    const colArrays: GalleryImage[][] = Array.from({ length: cols }, () => []);
    images.forEach((img, i) => colArrays[i % cols].push(img));
    return colArrays;
  }, [images, cols]);
  return (
    <motion.div variants={cv} initial={settings.animation.entranceAnimation !== "none" ? "hidden" : "show"} whileInView={settings.animation.entranceAnimation !== "none" ? "show" : undefined} viewport={{ once: true }} className="flex" style={{ gap }}>
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col" style={{ width: colWidth, gap }}>
          {col.map((image, i) => (
            <GalleryImageItem key={image.id || `${colIndex}-${i}`} image={image} index={images.indexOf(image)} settings={settings} filterStyle={filterStyle} hoverFilterStyle={hoverFilterStyle} overlayBg={overlayBg} borderRadiusStyle={borderRadiusStyle} itemVariants={iv} onClick={() => onImageClick(images.indexOf(image))} />
          ))}
        </div>
      ))}
    </motion.div>
  );
}

function CarouselLayout({ images, settings, filterStyle, borderRadiusStyle, gapStyle, onImageClick }: Omit<LayoutProps, "hoverFilterStyle" | "overlayBg" | "containerVariants" | "itemVariants">) {
  const [scrollPos, setScrollPos] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="relative">
      <div ref={containerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide" style={{ gap: settings.layout.gap, scrollBehavior: "smooth" }} onScroll={(e) => setScrollPos((e.target as HTMLDivElement).scrollLeft)}>
        {images.map((image, i) => {
          const _isPdf = isPdfGalleryImage(image);
          return (
          <div key={image.id || i} className="snap-start shrink-0" style={{ width: `${100 / settings.layout.columns.desktop}%`, minWidth: "280px", borderRadius: settings.layout.borderRadius }}>
            <button onClick={() => onImageClick(i)} className="relative w-full block cursor-pointer" style={{ aspectRatio: settings.layout.aspectRatio === "square" ? "1" : settings.layout.aspectRatio === "portrait" ? "3/4" : "16/9" }}>
              {settings.watermark.enabled && <GalleryWatermark settings={settings.watermark} />}
              {_isPdf ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", borderRadius: settings.layout.borderRadius }}>
                  <FileText className="h-10 w-10 text-red-400/80" />
                  <span className="text-white/40 text-xs text-center px-2 truncate max-w-full">{image.title || "PDF Document"}</span>
                </div>
              ) : image.src ? (
                <img src={image.src} alt={image.alt || ""} loading="lazy" className="w-full h-full object-cover" style={{ borderRadius: settings.layout.borderRadius, ...filterStyle }} />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground" style={{ borderRadius: settings.layout.borderRadius }}>{image.title || "No Image"}</div>
              )}
            </button>
          </div>
          );
        })}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, i) => (
            <button key={i} onClick={() => { const child = containerRef.current?.children[i] as HTMLElement; child?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" }); }}
              className={cn("w-2 h-2 rounded-full transition-all", Math.round(scrollPos / (containerRef.current?.scrollWidth! / images.length || 1)) === i ? "bg-primary w-4" : "bg-muted-foreground/30")}
              aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

interface LayoutProps {
  images: GalleryImage[];
  settings: GallerySettings;
  filterStyle: React.CSSProperties;
  hoverFilterStyle: React.CSSProperties;
  overlayBg: string;
  borderRadiusStyle: React.CSSProperties;
  gapStyle: React.CSSProperties;
  columns?: string;
  containerVariants?: Variants;
  itemVariants?: Variants;
  onImageClick: (index: number) => void;
}

function mergeSettings(defaults: GallerySettings, partial?: Partial<GallerySettings>): GallerySettings {
  if (!partial) return defaults;
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
