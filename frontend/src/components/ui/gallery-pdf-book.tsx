"use client";

/**
 * PdfBookViewer — native browser PDF viewer (no react-pdf / pdfjs-dist).
 *
 * External PDF URLs are routed through /api/public/pdf-proxy so that
 * X-Frame-Options restrictions on the origin server are bypassed — the
 * browser sees the PDF as coming from our own origin.
 *
 * The component fills 100% of its parent's width AND height — the parent
 * is responsible for setting the dimensions (e.g. the modal dialog).
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Download, ExternalLink, FileText, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

/** Wraps external http/https URLs through the backend proxy to bypass X-Frame-Options. */
function toProxiedUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return `${API_BASE}/public/pdf-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export interface PdfBookViewerProps {
  file: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

export function PdfBookViewer({ file, className }: PdfBookViewerProps) {
  const proxiedFile = toProxiedUrl(file);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col w-full h-full", className)}
    >
      {/* Toolbar — open-in-tab, download, fullscreen */}
      <div className="flex items-center justify-end gap-2 px-3 py-1.5 shrink-0 border-b border-white/10">
        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80"
          title="Open in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Open</span>
        </a>
        <a
          href={file}
          download
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80"
          title="Download PDF"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Download</span>
        </a>
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80"
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
        </button>
      </div>

      {loadError ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-white/50">
          <FileText className="h-12 w-12 opacity-30" />
          <p className="text-sm">Unable to display PDF in browser.</p>
          <a
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open PDF
          </a>
        </div>
      ) : (
        <object
          data={proxiedFile}
          type="application/pdf"
          className="w-full flex-1 min-h-0"
          style={{ display: "block" }}
          onError={() => setLoadError(true)}
        >
          <div className="flex flex-col items-center justify-center h-full gap-4 text-white/50">
            <FileText className="h-12 w-12 opacity-30" />
            <p className="text-sm">Your browser cannot display this PDF.</p>
            <a
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open PDF
            </a>
          </div>
        </object>
      )}
    </div>
  );
}
