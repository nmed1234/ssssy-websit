"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight, Music, Volume2, VolumeX } from "lucide-react";
import type { GalleryImage, GalleryKenBurns as KenBurnsSettings } from "@/types/gallery";

interface GalleryKenBurnsDisplayProps {
  images: GalleryImage[];
  settings: KenBurnsSettings;
  className?: string;
}

export function GalleryKenBurnsDisplay({ images, settings, className }: GalleryKenBurnsDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    timerRef.current = setTimeout(() => {
      setDirection(1);
      setCurrentIndex((i) => (i + 1) % images.length);
    }, settings.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentIndex, images.length, settings.duration]);

  useEffect(() => {
    const musicUrl = (settings as any).backgroundMusicUrl as string | undefined;
    if (musicUrl) {
      audioRef.current = new Audio(musicUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      if (isPlaying && !isMuted) audioRef.current.play().catch(() => {});
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [(settings as any).backgroundMusicUrl]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && !isMuted) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying, isMuted]);

  if (images.length === 0) return null;

  const current = images[currentIndex];
  const musicUrl = (settings as any).backgroundMusicUrl as string | undefined;

  const getTransform = () => {
    const zoom = settings.zoomRatio;
    const dir = settings.panDirection;
    if (dir === "left-right") return `scale(${zoom}) translateX(${currentIndex % 2 === 0 ? "-2%" : "2%"})`;
    if (dir === "top-bottom") return `scale(${zoom}) translateY(${currentIndex % 2 === 0 ? "-2%" : "2%"})`;
    if (dir === "diagonal") return `scale(${zoom}) translate(${currentIndex % 2 === 0 ? "-2%, -2%" : "2%, 2%"})`;
    return `scale(${zoom})`;
  };

  const variants: Record<string, any> = {
    crossfade: { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } },
    slide: { enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }) },
    zoom: { enter: { scale: 0.8, opacity: 0 }, center: { scale: 1, opacity: 1 }, exit: { scale: 1.2, opacity: 0 } },
    wipe: { enter: { clipPath: "circle(0%)" }, center: { clipPath: "circle(100%)" }, exit: { clipPath: "circle(0%)" } },
    dissolve: { enter: { opacity: 0, filter: "blur(10px)" }, center: { opacity: 1, filter: "blur(0px)" }, exit: { opacity: 0, filter: "blur(10px)" } },
    flash: { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0, filter: "brightness(2)" } },
    none: { enter: { opacity: 1 }, center: { opacity: 1 }, exit: { opacity: 1 } },
  };

  const v = variants[settings.transitionType] || variants.crossfade;

  return (
    <div className={`relative overflow-hidden ${className || ""}`} style={{ aspectRatio: "16/9", maxHeight: "70vh" }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={v}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: settings.transitionType === "none" ? 0 : settings.duration / 3000 }}
          className="absolute inset-0"
          style={{ transform: getTransform(), transition: `transform ${settings.duration}ms ease-in-out` }}
        >
          {current.src && (
            <img src={current.src} alt={current.alt || ""} className="w-full h-full object-cover" />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-6">
        {current.title && <h3 className="text-white text-xl font-bold drop-shadow-lg">{current.title}</h3>}
        {current.description && <p className="text-white/80 text-sm drop-shadow mt-1">{current.description}</p>}
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        {musicUrl && (
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors" title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}
        <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>

      {musicUrl && (
        <div className="absolute top-4 left-4 px-2 py-1 rounded-full bg-black/30 text-white/80 text-xs flex items-center gap-1">
          <Music className="h-3 w-3" />
          <span className="hidden sm:inline">Background music</span>
        </div>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1">
          {images.map((_, i) => (
            <button key={i} onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
              className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? "bg-white w-4" : "bg-white/40 hover:bg-white/60"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
