"use client";

/**
 * ImageFieldWidget — enhanced image field with URL input, PC upload, and media library browse.
 *
 * Features:
 * - URL text input (direct entry)
 * - "📁 Upload" button — opens native file picker, validates ≤ 10 MB, uploads via XHR
 *   with progress bar, uses JWT from localStorage (same pattern as api.ts interceptor)
 * - "🖼 Browse Library" button — opens MediaLibraryModal
 * - Thumbnail preview when a URL is set
 * - Inline error display for validation and upload failures
 */

import React, { useRef, useState } from "react";
import { MediaLibraryModal } from "./MediaLibraryModal";

interface ImageFieldWidgetProps {
  value: string;
  onChange: (url: string) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function inputCls(extra = "") {
  return `w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-400 ${extra}`;
}

export function ImageFieldWidget({ value, onChange }: ImageFieldWidgetProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const strVal = value ?? "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so the same file can be re-selected if needed
    e.target.value = "";

    // Client-side size validation
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large (max 10MB)");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      setProgress(0);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText) as {
            success?: boolean;
            data?: { url?: string };
          };
          const url = res?.data?.url;
          if (url) {
            onChange(url);
          } else {
            setError("Upload failed: no URL returned");
          }
        } catch {
          setError("Upload failed: invalid server response");
        }
      } else {
        let msg = `${xhr.status}`;
        try {
          const res = JSON.parse(xhr.responseText) as { message?: string };
          if (res?.message) msg = res.message;
        } catch {
          // ignore parse error
        }
        setError(`Upload failed: ${msg}`);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setProgress(0);
      setError("Upload failed: network error");
    };

    xhr.open("POST", `${API_BASE}/media/upload`);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.send(formData);
  };

  return (
    <div className="space-y-1.5">
      {/* URL input */}
      <input
        type="url"
        className={inputCls()}
        placeholder="https://… or /path/to/image.jpg"
        value={strVal}
        onChange={(e) => {
          setError(null);
          onChange(e.target.value);
        }}
      />

      {/* Action buttons */}
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={uploading}
          onClick={() => {
            setError(null);
            fileRef.current?.click();
          }}
          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📁 Upload
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
        >
          🖼 Browse Library
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-0.5">
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500">Uploading… {progress}%</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-[11px] text-red-500">{error}</p>
      )}

      {/* Thumbnail preview */}
      {strVal && !uploading && (
        <img
          src={strVal}
          alt="preview"
          className="w-full max-h-20 object-cover rounded border border-gray-200"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {/* Media Library Modal */}
      {libraryOpen && (
        <MediaLibraryModal
          open={libraryOpen}
          onClose={() => setLibraryOpen(false)}
          onSelect={(url) => {
            onChange(url);
            setLibraryOpen(false);
          }}
        />
      )}
    </div>
  );
}
