"use client";

/**
 * PdfBookViewer — canvas-based PDF renderer using pdfjs-dist.
 *
 * WHY NO IFRAME
 * ─────────────
 * Firefox's built-in PDF.js viewer runs at resource://pdf.js/… which is
 * always a "third-party context" regardless of the iframe's src origin.
 * Firefox's Dynamic First-Party Isolation (dFPI) partitions all network
 * requests made by that viewer, causing "Invalid PDF structure" even when
 * the src URL is same-origin (localhost:3000).
 *
 * SOLUTION
 * ────────
 * • Fetch the PDF bytes with a plain fetch() through /api/pdf-proxy.
 *   fetch() runs in the page's own first-party context — no partitioning.
 * • Pass the ArrayBuffer to pdfjs-dist which renders each page to a
 *   <canvas> element inside the page DOM — no iframe, no resource:// context.
 *
 * WORKER
 * ──────
 * pdfjs-dist 6.x ships its own worker. We use the bundled worker URL from
 * the package so Next.js does not need any extra Webpack config.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

// ── pdfjs-dist dynamic import ────────────────────────────────────────────────
// Imported lazily so the ~3 MB bundle is only loaded when a PDF is opened.
let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    // Point the worker at the static file in /public — served same-origin,
    // no webpack asset URL resolution needed, works in all Next.js build modes.
    // The postinstall script copies the correct v6 worker there.
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  return pdfjsLib;
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface PdfBookViewerProps {
  file: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

type LoadState = "loading" | "ready" | "error";

// ── Component ────────────────────────────────────────────────────────────────
export function PdfBookViewer({ file, className }: PdfBookViewerProps) {
  const { direction } = useLanguage();
  const isRtl = direction === "rtl";

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // pdfjs-dist has no exported Document type, any is intentional
  const pdfDocRef = useRef<any>(null); // eslint-disable-line
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  // ── Fullscreen listener ──────────────────────────────────────────────────
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

  // ── Helpers ──────────────────────────────────────────────────────────────
  const goTo = useCallback(
    (page: number) => setCurrentPage(Math.max(1, Math.min(numPages, page))),
    [numPages]
  );
  const zoomIn  = useCallback(() => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2))), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2))), []);

  // ── Scroll wheel — change page on vertical scroll ───────────────────────
  // Only triggers when the canvas fits inside the scroll area without needing
  // to scroll (i.e. the scroll area is not overflowing).  When the zoomed
  // canvas is taller than the container the normal scroll behaviour is
  // preserved; once the user reaches the top/bottom edge, the next scroll
  // tick flips the page.
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    let accumulated = 0;
    const THRESHOLD = 60; // px of deltaY needed to flip a page

    const onWheel = (e: WheelEvent) => {
      if (loadState !== "ready") return;

      const atTop    = el.scrollTop === 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const scrollingDown = e.deltaY > 0;
      const scrollingUp   = e.deltaY < 0;

      // If the content is taller than the viewport and we're not at an edge,
      // let the default scroll run.
      if (!(atBottom && scrollingDown) && !(atTop && scrollingUp)) return;

      e.preventDefault();
      accumulated += e.deltaY;

      if (accumulated >= THRESHOLD && currentPage < numPages) {
        accumulated = 0;
        goTo(currentPage + 1);
      } else if (accumulated <= -THRESHOLD && currentPage > 1) {
        accumulated = 0;
        goTo(currentPage - 1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [loadState, currentPage, numPages, goTo]);

  // ── Reset + auto-load when file changes ─────────────────────────────────
  useEffect(() => {
    if (!file) return;

    // Reset visible state for the new file.
    setLoadState("loading");
    setErrorMsg(null);
    setNumPages(0);
    setCurrentPage(1);

    let cancelled = false;

    // Destroy any previous document.
    if (pdfDocRef.current) {
      pdfDocRef.current.cleanup();
      pdfDocRef.current = null;
    }

    // Always route through the Next.js proxy (handles CORS, dFPI, auth).
    const fetchUrl = `/api/pdf-proxy?url=${encodeURIComponent(file)}`;

    (async () => {
      try {
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const buffer = await res.arrayBuffer();
        if (cancelled) return;

        const pdfjs = await getPdfjs();
        if (cancelled) return;

        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const pdfDoc = await loadingTask.promise;
        if (cancelled) {
          await loadingTask.destroy();
          return;
        }

        pdfDocRef.current = pdfDoc;
        setNumPages(pdfDoc.numPages);
        setLoadState("ready");
      } catch (err: unknown) {
        if (cancelled) return;
        console.error("[PdfBookViewer] load error:", err);
        const name = (err as { name?: string })?.name ?? "";
        const msg  = err instanceof Error ? err.message : String(err);
        let display: string;
        if (name === "InvalidPDFException" || msg.includes("Invalid PDF")) {
          display = "This PDF file appears to be corrupt or was not transferred completely. Try downloading it directly.";
        } else if (msg.includes("504") || msg.includes("Gateway Timeout") || msg.includes("timed out")) {
          display = "The PDF source took too long to respond. Try downloading it directly.";
        } else if (msg.includes("502") || msg.includes("Bad Gateway")) {
          display = "The remote server did not return a valid PDF.";
        } else if (msg.includes("401") || msg.includes("403") || msg.includes("404")) {
          display = `Could not access the PDF file (HTTP ${msg.match(/\d{3}/)?.[0] ?? "error"}).`;
        } else {
          display = `Failed to load PDF: ${msg}`;
        }
        setErrorMsg(display);
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
      if (pdfDocRef.current) {
        pdfDocRef.current.cleanup();
        pdfDocRef.current = null;
      }
    };
  }, [file]);

  // ── Render current page to canvas ────────────────────────────────────────
  useEffect(() => {
    if (loadState !== "ready" || !pdfDocRef.current || !canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    let cancelled = false;

    (async () => {
      try {
        const page = await pdfDocRef.current.getPage(currentPage);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas   = canvasRef.current!;
        const ctx      = canvas.getContext("2d")!;

        canvas.width  = viewport.width;
        canvas.height = viewport.height;

        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (err: unknown) {
        const name = (err as { name?: string })?.name ?? "";
        if (name !== "RenderingCancelledException") {
          console.error("[PdfBookViewer] render error:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [loadState, currentPage, scale]);

  // ── RTL-aware navigation ──────────────────────────────────────────────────
  // In RTL (Arabic) the "previous page" button is on the RIGHT (ChevronRight)
  // and "next page" is on the LEFT (ChevronLeft) — matching the reading
  // direction where pages flow right-to-left.
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft  : ChevronRight;

  const prevDisabled = currentPage <= 1      || loadState !== "ready";
  const nextDisabled = currentPage >= numPages || loadState !== "ready";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col w-full h-full bg-neutral-900", className)}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 shrink-0 border-b border-white/10">
        {/* Page navigation */}
        <div className="flex items-center gap-1 text-white/70 text-xs">
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={prevDisabled}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
            aria-label="Previous page"
          >
            <PrevIcon className="h-4 w-4" />
          </button>
          <span className="min-w-[6rem] text-center" dir="ltr">
            {loadState === "ready" ? `${currentPage} / ${numPages}` : "—"}
          </span>
          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={nextDisabled}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
            aria-label="Next page"
          >
            <NextIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom + open/download/fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5 || loadState !== "ready"}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors text-white/80"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-white/50 text-xs w-10 text-center" dir="ltr">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 3 || loadState !== "ready"}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors text-white/80"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
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
            href={`/api/pdf-proxy?url=${encodeURIComponent(file)}`}
            download={`${file.split("/").pop() ?? "document"}.pdf`}
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
            {isFullscreen ? (
              <Minimize className="h-3.5 w-3.5" />
            ) : (
              <Maximize className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-auto flex items-start justify-center p-4 min-h-0"
      >
        {loadState === "loading" ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
            <div className="h-8 w-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            <span className="text-sm">Loading PDF…</span>
          </div>
        ) : loadState === "error" ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-white/50">
            <FileText className="h-12 w-12 opacity-30" />
            <p className="text-sm text-center max-w-xs">
              {errorMsg ?? "Unable to display PDF in browser."}
            </p>
            <a
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open PDF directly
            </a>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="shadow-2xl max-w-full"
            style={{ display: "block" }}
          />
        )}
      </div>
    </div>
  );
}
