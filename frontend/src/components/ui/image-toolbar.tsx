"use client";

import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, RefreshCw, Download, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageToolbarProps {
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onDownload?: () => void;
  onFullscreen?: () => void;
  showDownload?: boolean;
  showFullscreen?: boolean;
  className?: string;
}

export function ImageToolbar({
  onRotateLeft, onRotateRight, onFlipHorizontal, onFlipVertical,
  onZoomIn, onZoomOut, onReset, onDownload, onFullscreen,
  showDownload = true, showFullscreen = true, className,
}: ImageToolbarProps) {
  const btnClass = "p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button type="button" onClick={stop(onRotateLeft)} className={btnClass} aria-label="Rotate left">
        <RotateCcw className="h-4 w-4" />
      </button>
      <button type="button" onClick={stop(onRotateRight)} className={btnClass} aria-label="Rotate right">
        <RotateCw className="h-4 w-4" />
      </button>
      <div className="w-px h-5 bg-white/20 mx-1" />
      <button type="button" onClick={stop(onFlipHorizontal)} className={btnClass} aria-label="Flip horizontal">
        <FlipHorizontal className="h-4 w-4" />
      </button>
      <button type="button" onClick={stop(onFlipVertical)} className={btnClass} aria-label="Flip vertical">
        <FlipVertical className="h-4 w-4" />
      </button>
      <div className="w-px h-5 bg-white/20 mx-1" />
      <button type="button" onClick={stop(onZoomIn)} className={btnClass} aria-label="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </button>
      <button type="button" onClick={stop(onZoomOut)} className={btnClass} aria-label="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </button>
      <button type="button" onClick={stop(onReset)} className={btnClass} aria-label="Reset">
        <RefreshCw className="h-4 w-4" />
      </button>
      {showDownload && onDownload && (
        <>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button type="button" onClick={stop(onDownload)} className={btnClass} aria-label="Download">
            <Download className="h-4 w-4" />
          </button>
        </>
      )}
      {showFullscreen && onFullscreen && (
        <button type="button" onClick={stop(onFullscreen)} className={btnClass} aria-label="Fullscreen">
          <Maximize2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
