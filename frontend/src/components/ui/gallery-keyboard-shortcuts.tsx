"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyboardShortcut {
  key: string;
  label: string;
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  { key: "←", label: "Previous image" },
  { key: "→", label: "Next image" },
  { key: "Esc", label: "Close lightbox" },
  { key: "Space", label: "Play / Pause slideshow" },
  { key: "+", label: "Zoom in" },
  { key: "-", label: "Zoom out" },
  { key: "0", label: "Reset zoom / rotation" },
  { key: "F", label: "Toggle fullscreen" },
  { key: "R", label: "Rotate right" },
  { key: "Shift+R", label: "Rotate left" },
  { key: "H", label: "Flip horizontal" },
  { key: "V", label: "Flip vertical" },
  { key: "?", label: "Toggle this guide" },
];

interface GalleryKeyboardShortcutsProps {
  enabled: boolean;
  showReferenceOnQuestion: boolean;
  className?: string;
}

export function GalleryKeyboardShortcuts({ enabled, showReferenceOnQuestion, className }: GalleryKeyboardShortcutsProps) {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!enabled || !showReferenceOnQuestion) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowGuide((prev) => !prev);
      }
      if (e.key === "Escape" && showGuide) setShowGuide(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, showReferenceOnQuestion, showGuide]);

  if (!enabled) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setShowGuide(true); }}
        className={cn("p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors", className)}
        aria-label="Keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/95 border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2"><Keyboard className="h-4 w-4" /> Keyboard Shortcuts</h3>
                <button onClick={() => setShowGuide(false)} className="text-white/60 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-1.5">
                {DEFAULT_SHORTCUTS.map((s) => (
                  <div key={s.key} className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">{s.label}</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/10 text-white text-xs font-mono min-w-[28px] text-center">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
