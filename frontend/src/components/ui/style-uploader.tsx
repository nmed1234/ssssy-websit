"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// StyleUploader — drag-and-drop file uploader
// 5 states: idle, hover, uploading, success (SVG checkmark draw), error
// No idle loops — animation only triggers on user interaction or upload complete
// ─────────────────────────────────────────────────────────────────────────────

export interface StyleUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  onFilesSelected?: (files: File[]) => void | Promise<void>;
  className?: string;
  label?: string;
  hint?: string;
}

type UploaderState = "idle" | "hover" | "uploading" | "success" | "error";

export function StyleUploader({
  accept,
  multiple = false,
  maxSizeMb = 10,
  onFilesSelected,
  className,
  label = "Drag & drop files here",
  hint,
}: StyleUploaderProps) {
  const [state, setState]   = useState<UploaderState>("idle");
  const [error, setError]   = useState<string | null>(null);
  const [files, setFiles]   = useState<File[]>([]);
  const inputRef            = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const maxBytes = maxSizeMb * 1024 * 1024;
    const valid: File[] = [];
    for (const f of Array.from(incoming)) {
      if (f.size > maxBytes) {
        setError(`"${f.name}" exceeds ${maxSizeMb} MB limit.`);
        setState("error");
        return;
      }
      valid.push(f);
    }
    setFiles(valid);
    setError(null);
    setState("uploading");
    try {
      await onFilesSelected?.(valid);
      setState("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setState("error");
    }
  }, [maxSizeMb, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("hover");
  }, []);

  const handleDragLeave = useCallback(() => {
    setState("idle");
  }, []);

  const reset = () => {
    setState("idle");
    setError(null);
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const borderColor =
    state === "hover"    ? "var(--style-color-primary)"    :
    state === "error"    ? "#ef4444"                         :
    state === "success"  ? "var(--style-color-secondary)"  :
                           "var(--style-color-border)";

  const bgColor =
    state === "hover"   ? "var(--style-color-primary)/5"  :
    state === "success" ? "var(--style-color-secondary)/5" :
                          "var(--style-color-surface)";

  return (
    <div className={cn("w-full", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label="File upload area"
        onClick={() => state !== "uploading" && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="relative flex flex-col items-center justify-center gap-3 p-8 rounded-[var(--style-radius-card)] border-2 border-dashed cursor-pointer min-h-[160px] text-center transition-all duration-[var(--style-anim-hover)] ease-[var(--style-anim-easing)] focus:outline-none focus:ring-[3px] focus:ring-[var(--style-color-primary)]/20"
        style={{ borderColor, background: bgColor }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => processFiles(e.target.files)}
        />

        <AnimatePresence mode="wait">
          {state === "idle" || state === "hover" ? (
            <motion.div key="idle"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8" style={{ color: "var(--style-color-muted)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--style-color-fg)" }}>{label}</p>
              {hint && <p className="text-xs" style={{ color: "var(--style-color-muted)" }}>{hint}</p>}
              <p className="text-xs" style={{ color: "var(--style-color-muted)" }}>
                {accept ? `Accepts: ${accept}` : "Any file type"} · Max {maxSizeMb} MB
              </p>
            </motion.div>
          ) : state === "uploading" ? (
            <motion.div key="uploading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Spinner — triggered by user action, not idle loop */}
              <svg className="h-8 w-8 animate-spin" style={{ color: "var(--style-color-primary)" }} viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <p className="text-sm font-medium" style={{ color: "var(--style-color-fg)" }}>Uploading…</p>
            </motion.div>
          ) : state === "success" ? (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-2"
            >
              {/* SVG checkmark draw — user-triggered, fires once */}
              <svg viewBox="0 0 40 40" className="h-10 w-10">
                <circle cx="20" cy="20" r="18" fill="none" stroke="var(--style-color-secondary)" strokeWidth="2" opacity="0.25" />
                <motion.path
                  d="M12 20 L18 26 L28 14"
                  fill="none"
                  stroke="var(--style-color-secondary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </svg>
              <p className="text-sm font-semibold" style={{ color: "var(--style-color-secondary)" }}>
                {files.length} file{files.length !== 1 ? "s" : ""} uploaded
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="text-xs underline mt-1"
                style={{ color: "var(--style-color-muted)" }}
              >
                Upload another
              </button>
            </motion.div>
          ) : (
            <motion.div key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm font-medium text-red-500">{error}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="text-xs underline"
                style={{ color: "var(--style-color-muted)" }}
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File list */}
      {files.length > 0 && state === "success" && (
        <ul className="mt-3 space-y-1">
          {files.map((f) => (
            <li key={f.name} className="flex items-center justify-between text-xs px-3 py-1.5 rounded" style={{ background: "var(--style-color-surface)", border: "1px solid var(--style-color-border)" }}>
              <span className="truncate" style={{ color: "var(--style-color-fg)" }}>{f.name}</span>
              <button type="button" onClick={reset} className="ml-2 flex-shrink-0">
                <X className="h-3.5 w-3.5" style={{ color: "var(--style-color-muted)" }} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
