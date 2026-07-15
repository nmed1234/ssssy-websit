"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface LayoutJsonDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
}

export function LayoutJsonDebugModal({ isOpen, onClose, pageId }: LayoutJsonDebugModalProps) {
  const [jsonText, setJsonText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchJson = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    setError(null);
    setJsonText(null);
    try {
      const res = await api.get(`/admin/pages/${pageId}/layout-json`);
      // res.data is the parsed JSON object; re-stringify with 2-space indent
      const text = JSON.stringify(res.data, null, 2);
      setJsonText(text);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setError("Page not found or has been deleted.");
      } else {
        setError("Failed to fetch layout JSON. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  // Fetch whenever modal opens
  useEffect(() => {
    if (isOpen) {
      fetchJson();
    } else {
      // Reset state when closed
      setJsonText(null);
      setError(null);
      setCopied(false);
    }
  }, [isOpen, fetchJson]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  async function handleCopy() {
    if (!jsonText) return;
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  if (!isOpen) return null;

  return (
    /* Full-screen overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="debug-json-modal-title"
    >
      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0">
          <h2
            id="debug-json-modal-title"
            className="text-sm font-semibold text-gray-800 font-mono"
          >
            Debug: Layout JSON
          </h2>
          <div className="flex items-center gap-2">
            {jsonText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 text-xs border rounded hover:bg-gray-50 font-mono text-gray-600"
                title="Copy JSON to clipboard"
              >
                {copied ? "✔ Copied!" : "📋 Copy"}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 text-base font-bold"
              aria-label="Close modal"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <svg
                className="animate-spin h-6 w-6 text-purple-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="Loading"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <span className="ml-3 text-sm text-gray-500">Loading layout JSON…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <span className="text-red-500 text-lg">⚠</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {jsonText && !loading && (
            <pre className="bg-gray-900 text-green-400 font-mono text-xs rounded-lg p-4 overflow-x-auto whitespace-pre leading-relaxed">
              <code>{jsonText}</code>
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
          <span className="text-xs text-gray-400 font-mono">
            Page ID: {pageId}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs border rounded hover:bg-gray-100 text-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
