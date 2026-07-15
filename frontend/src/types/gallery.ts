export interface GalleryImage {
  id: string;
  src: string;
  thumbnail?: string;
  alt?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  beforeSrc?: string;
  hotspotData?: GalleryHotspotData[];
  exif?: GalleryExifData;
  dominantColor?: string;
  palette?: string[];
}

export interface GalleryLayout {
  type: "grid" | "masonry" | "mosaic" | "carousel";
  columns: { mobile: number; tablet: number; desktop: number; wide: number };
  gap: number;
  aspectRatio: "square" | "landscape" | "portrait" | "auto" | "original";
  maxImageHeight: number | null;
  borderRadius: number;
}

export interface GalleryLightbox {
  enabled: boolean;
  backgroundBlur: number;
  transitionType: "fade" | "slide" | "zoom" | "none";
  showNavigation: boolean;
  showThumbnails: boolean;
  showCounter: boolean;
  keyboardNavigation: boolean;
  swipeToClose: boolean;
  enableZoom: boolean;
  enableDownload: boolean;
  enableFullscreen: boolean;
  slideshowEnabled: boolean;
  slideshowInterval: number;
}

export interface GalleryHoverEffects {
  effect: "zoom" | "grayscale" | "blur" | "color-shift" | "slide-up" | "tilt" | "none";
  overlayColor: "dark" | "light" | "primary" | "custom";
  overlayOpacity: number;
  showTitleOnHover: boolean;
  showDescriptionOnHover: boolean;
}

export interface GalleryImageEffects {
  defaultFilter: "none" | "grayscale" | "sepia" | "blur" | "saturate" | "contrast";
  filterAmount: number;
  brightness: number;
  hueRotate: number;
}

export interface GalleryAnimation {
  entranceAnimation: "fade" | "slide-up" | "scale" | "none";
  staggerDelay: number;
  animationDuration: number;
  filterTransition: "instant" | "smooth";
  pageLoadAnimation: boolean;
}

export interface GalleryInteractionTools {
  enableRotate: boolean;
  enableFlip: boolean;
  enableZoomTool: boolean;
  enableReset: boolean;
  enablePinchZoom: boolean;
  enableMouseWheelZoom: boolean;
}

export interface GalleryWatermark {
  enabled: boolean;
  type: "text" | "image";
  text: string;
  imageUrl: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  opacity: number;
  size: number;
  margin: number;
}

export interface GallerySocialSharing {
  enabled: boolean;
  platforms: ("whatsapp" | "twitter" | "facebook" | "linkedin" | "telegram" | "email")[];
  showQrCode: boolean;
  showEmbedButton: boolean;
}

export interface GalleryDownloadOptions {
  enabled: boolean;
  allowOriginal: boolean;
  allowLarge: boolean;
  allowMedium: boolean;
  allowSmall: boolean;
  bulkDownload: boolean;
  filenameTemplate: string;
  requirePermission: boolean;
  showLicense: boolean;
  licenseText: string;
}

export interface GalleryAccessControl {
  enabled: boolean;
  passwordProtected: boolean;
  password: string;
  expireLinks: boolean;
  expireAfterHours: number;
  disableRightClick: boolean;
  disableDownload: boolean;
  viewLimitEnabled: boolean;
  maxViews: number;
}

export interface GalleryKenBurns {
  enabled: boolean;
  zoomRatio: number;
  panDirection: "random" | "left-right" | "top-bottom" | "diagonal";
  duration: number;
  transitionType: "crossfade" | "slide" | "zoom" | "wipe" | "dissolve" | "flash" | "none";
  backgroundMusicUrl?: string;
}

export interface GalleryBeforeAfter {
  enabled: boolean;
  defaultPosition: number;
  labelPosition: "top" | "bottom" | "overlay";
  showLabels: boolean;
  labelLeft: string;
  labelRight: string;
  handleStyle: "circle" | "line" | "dashed";
}

export interface GalleryHotspotData {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  link?: string;
}

export interface GalleryHotspot {
  enabled: boolean;
  markerColor: string;
  markerSize: number;
  markerIcon: "circle" | "pin" | "plus" | "number";
  tooltipStyle: "dark" | "light" | "glass";
  showOnHover: boolean;
}

export interface GalleryColorIntelligence {
  enabled: boolean;
  showPalette: boolean;
  enableColorSearch: boolean;
  paletteSize: number;
  autoThemeGallery: boolean;
}

export interface GalleryExifData {
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  dateTaken?: string;
  gpsLat?: number;
  gpsLng?: number;
}

export interface GalleryExif {
  enabled: boolean;
  displayMode: "tooltip" | "sidebar" | "off";
  showCamera: boolean;
  showLens: boolean;
  showSettings: boolean;
  showGps: boolean;
  showDate: boolean;
}

export interface GalleryCustomTheme {
  enabled: boolean;
  customCss: string;
  backgroundColor: string;
  captionFont: string;
  captionSize: number;
  captionColor: string;
  captionPosition: "top" | "bottom" | "overlay" | "tooltip";
  gridGap: number;
  borderRadius: number;
  shadowDepth: "none" | "sm" | "md" | "lg" | "xl";
}

export interface Gallery3DLayouts {
  coverFlow: boolean;
  photoWall: boolean;
  panoramaViewer: boolean;
  cardFlip: boolean;
  photoWallRotation: number;
  coverFlowReflection: boolean;
}

export interface GalleryAnalytics {
  enabled: boolean;
  trackViews: boolean;
  trackDownloads: boolean;
  showCounters: boolean;
  exportEnabled: boolean;
}

export interface GalleryPerformance {
  enableWebp: boolean;
  enableSrcset: boolean;
  breakpoints: number[];
  enableLqip: boolean;
  preloadAdjacent: boolean;
  virtualScroll: boolean;
  compressionLevel: number;
}

export interface GalleryAiFeatures {
  enabled: boolean;
  apiKey: string;
  autoAltText: boolean;
  autoTags: boolean;
  smartCrop: boolean;
  backgroundRemoval: boolean;
  upscaleEnabled: boolean;
}

export interface GallerySettings {
  images: GalleryImage[];
  layout: GalleryLayout;
  lightbox: GalleryLightbox;
  hoverEffects: GalleryHoverEffects;
  imageEffects: GalleryImageEffects;
  animation: GalleryAnimation;
  interactionTools: GalleryInteractionTools;
  watermark: GalleryWatermark;
  socialSharing: GallerySocialSharing;
  downloadOptions: GalleryDownloadOptions;
  accessControl: GalleryAccessControl;
  kenBurns: GalleryKenBurns;
  beforeAfter: GalleryBeforeAfter;
  hotspot: GalleryHotspot;
  colorIntelligence: GalleryColorIntelligence;
  exif: GalleryExif;
  customTheme: GalleryCustomTheme;
  layouts3d: Gallery3DLayouts;
  analytics: GalleryAnalytics;
  performance: GalleryPerformance;
  aiFeatures: GalleryAiFeatures;
}

export const DEFAULT_GALLERY_SETTINGS: GallerySettings = {
  images: [],
  layout: {
    type: "grid",
    columns: { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
    gap: 16,
    aspectRatio: "landscape",
    maxImageHeight: null,
    borderRadius: 8,
  },
  lightbox: {
    enabled: true,
    backgroundBlur: 8,
    transitionType: "zoom",
    showNavigation: true,
    showThumbnails: false,
    showCounter: true,
    keyboardNavigation: true,
    swipeToClose: true,
    enableZoom: true,
    enableDownload: true,
    enableFullscreen: true,
    slideshowEnabled: false,
    slideshowInterval: 3000,
  },
  hoverEffects: {
    effect: "zoom",
    overlayColor: "dark",
    overlayOpacity: 60,
    showTitleOnHover: true,
    showDescriptionOnHover: false,
  },
  imageEffects: {
    defaultFilter: "none",
    filterAmount: 100,
    brightness: 100,
    hueRotate: 0,
  },
  animation: {
    entranceAnimation: "slide-up",
    staggerDelay: 80,
    animationDuration: 400,
    filterTransition: "smooth",
    pageLoadAnimation: true,
  },
  interactionTools: {
    enableRotate: true,
    enableFlip: true,
    enableZoomTool: true,
    enableReset: true,
    enablePinchZoom: true,
    enableMouseWheelZoom: true,
  },
  watermark: {
    enabled: false,
    type: "text",
    text: "© SSSSY",
    imageUrl: "",
    position: "bottom-right",
    opacity: 50,
    size: 10,
    margin: 12,
  },
  socialSharing: {
    enabled: false,
    platforms: ["whatsapp", "twitter", "facebook"],
    showQrCode: false,
    showEmbedButton: false,
  },
  downloadOptions: {
    enabled: true,
    allowOriginal: true,
    allowLarge: true,
    allowMedium: true,
    allowSmall: false,
    bulkDownload: false,
    filenameTemplate: "{title}-{album}",
    requirePermission: false,
    showLicense: false,
    licenseText: "CC BY-NC 4.0",
  },
  accessControl: {
    enabled: false,
    passwordProtected: false,
    password: "",
    expireLinks: false,
    expireAfterHours: 24,
    disableRightClick: false,
    disableDownload: false,
    viewLimitEnabled: false,
    maxViews: 100,
  },
  kenBurns: {
    enabled: false,
    zoomRatio: 1.15,
    panDirection: "random",
    duration: 6000,
    transitionType: "crossfade",
    backgroundMusicUrl: "",
  },
  beforeAfter: {
    enabled: false,
    defaultPosition: 50,
    labelPosition: "overlay",
    showLabels: true,
    labelLeft: "Before",
    labelRight: "After",
    handleStyle: "circle",
  },
  hotspot: {
    enabled: false,
    markerColor: "#ef4444",
    markerSize: 24,
    markerIcon: "pin",
    tooltipStyle: "dark",
    showOnHover: false,
  },
  colorIntelligence: {
    enabled: false,
    showPalette: false,
    enableColorSearch: false,
    paletteSize: 5,
    autoThemeGallery: false,
  },
  exif: {
    enabled: false,
    displayMode: "tooltip",
    showCamera: true,
    showLens: true,
    showSettings: true,
    showGps: false,
    showDate: true,
  },
  customTheme: {
    enabled: false,
    customCss: "",
    backgroundColor: "",
    captionFont: "inherit",
    captionSize: 14,
    captionColor: "#ffffff",
    captionPosition: "overlay",
    gridGap: 16,
    borderRadius: 8,
    shadowDepth: "md",
  },
  layouts3d: {
    coverFlow: false,
    photoWall: false,
    panoramaViewer: false,
    cardFlip: false,
    photoWallRotation: 5,
    coverFlowReflection: true,
  },
  analytics: {
    enabled: false,
    trackViews: true,
    trackDownloads: true,
    showCounters: false,
    exportEnabled: false,
  },
  performance: {
    enableWebp: false,
    enableSrcset: false,
    breakpoints: [320, 640, 768, 1024, 1280, 1536],
    enableLqip: false,
    preloadAdjacent: true,
    virtualScroll: false,
    compressionLevel: 80,
  },
  aiFeatures: {
    enabled: false,
    apiKey: "",
    autoAltText: false,
    autoTags: false,
    smartCrop: false,
    backgroundRemoval: false,
    upscaleEnabled: false,
  },
};
