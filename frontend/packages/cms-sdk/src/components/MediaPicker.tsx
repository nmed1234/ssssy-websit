/**
 * @ssssy/cms-sdk — MediaPicker Component
 *
 * A modal browser for picking media files from the CMS media library (MinIO).
 * Returns the selected file URL via onSelect.
 *
 * Usage:
 *   <MediaPicker
 *     client={cmsClient}
 *     open={showPicker}
 *     onClose={() => setShowPicker(false)}
 *     onSelect={(file) => setImageUrl(file.url)}
 *     accept="image"
 *   />
 */

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { CmsClient } from "../client";

interface MediaFile {
  id: string;
  filename: string;
  originalFilename?: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
}

interface MediaPickerProps {
  client: CmsClient;
  open: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
  /** Filter by MIME type prefix: "image", "video", "application/pdf" */
  accept?: string;
}

export function MediaPicker({ open, onClose, onSelect, accept, client }: MediaPickerProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["sdk-media-picker", page, search, accept],
    queryFn: async () => {
      // Use the axios instance from the SDK's client (access via the client's internal instance)
      // We call the media endpoint directly using the base URL from the client
      const baseUrl = (client as unknown as { http: { defaults: { baseURL: string } } }).http?.defaults?.baseURL;
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params: Record<string, unknown> = { page, size: 24 };
      if (search) params.search = search;
      if (accept) params.mimeType = accept;
      const { data } = await axios.get<ApiResponse<PaginatedResponse<MediaFile>>>(
        `${baseUrl}/media`,
        { headers, params }
      );
      return data.data;
    },
    enabled: open,
    staleTime: 30_000,
  });

  if (!open) return null;

  const files = data?.content ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Media Library</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search files..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {files.map((file) => (
                <MediaThumbnail
                  key={file.id}
                  file={file}
                  onSelect={() => { onSelect(file); onClose(); }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {(data?.totalElements ?? 0) > 24 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">
              {Math.min((page + 1) * 24, data?.totalElements ?? 0)} / {data?.totalElements ?? 0} files
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * 24 >= (data?.totalElements ?? 0)}
              className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MediaThumbnail({ file, onSelect }: { file: MediaFile; onSelect: () => void }) {
  const isImage = file.mimeType.startsWith("image/");

  return (
    <button
      onClick={onSelect}
      className="group relative aspect-square border border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 hover:ring-2 hover:ring-blue-300 transition-all bg-gray-50"
      title={file.originalFilename ?? file.filename}
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={file.url}
          alt={file.originalFilename ?? file.filename}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 text-2xl">
          📄
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
        {file.originalFilename ?? file.filename}
      </div>
    </button>
  );
}
