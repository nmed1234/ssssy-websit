"use client";

/**
 * MediaLibraryModal — full CMS media library modal.
 *
 * Features (Tasks 23.1–23.4):
 * 23.1 Folder tree sidebar with create/rename/delete
 * 23.2 Upgraded 100-image grid with alt-text warning badge + details panel trigger
 * 23.3 Upload zone with drag-and-drop, per-file progress, batch summary
 * 23.4 Metadata details panel (alt text, captions, tags) with save + image→folder drag
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Search,
  Loader2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Plus,
  AlertTriangle,
  Check,
  Upload,
} from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse, MediaFile, MediaFolder, PaginatedResponse } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

// ─── Upload state ─────────────────────────────────────────────────────────────

type UploadStatus = "pending" | "uploading" | "done" | "error";

interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  result?: MediaFile;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILES_PER_BATCH = 20;
const MAX_CONCURRENT = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

/** Build a recursive tree from a flat folder list */
function buildTree(flat: MediaFolder[]): MediaFolder[] {
  const map: Record<string, MediaFolder> = {};
  flat.forEach((f) => { map[f.id] = { ...f, children: [] }; });
  const roots: MediaFolder[] = [];
  flat.forEach((f) => {
    if (f.parentId && map[f.parentId]) {
      map[f.parentId].children!.push(map[f.id]);
    } else {
      roots.push(map[f.id]);
    }
  });
  return roots;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchFolders(): Promise<MediaFolder[]> {
  const res = await api.get<ApiResponse<MediaFolder[]>>("/admin/media-folders");
  return res.data.data ?? [];
}

async function fetchMediaPage(
  page: number,
  search: string,
  folderId: string | null
): Promise<{ content: MediaFile[]; last: boolean; totalElements: number }> {
  const params: Record<string, string | number> = { page, size: 100 };
  if (search.trim()) params.search = search.trim();
  if (folderId) params.folderId = folderId;
  const res = await api.get<ApiResponse<PaginatedResponse<MediaFile>>>(
    "/admin/media",
    { params }
  );
  const data = res.data.data;
  return {
    content: data.content ?? [],
    last: data.last ?? true,
    totalElements: data.totalElements ?? 0,
  };
}

// ─── ContextMenu ──────────────────────────────────────────────────────────────

interface ContextMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function ContextMenu({
  x, y, items, onClose,
}: {
  x: number; y: number; items: ContextMenuItem[]; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-[100] bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[120px]"
      style={{ top: y, left: x }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${item.danger ? "text-red-600" : "text-gray-700"}`}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── FolderNode ───────────────────────────────────────────────────────────────

interface FolderNodeProps {
  folder: MediaFolder;
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (folder: MediaFolder) => void;
  onDropImage: (imageId: string, folderId: string) => void;
}

function FolderNode({ folder, selectedFolderId, onSelect, onRename, onDelete, onDropImage }: FolderNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(folder.name);
  const [dragOver, setDragOver] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);
  const hasChildren = (folder.children?.length ?? 0) > 0;

  useEffect(() => { if (renaming) renameRef.current?.focus(); }, [renaming]);

  const handleRenameConfirm = () => {
    const trimmed = renameVal.trim();
    if (trimmed && trimmed !== folder.name) onRename(folder.id, trimmed);
    setRenaming(false);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer text-xs select-none group relative
          ${selectedFolderId === folder.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}
          ${dragOver ? "ring-2 ring-blue-400 bg-blue-50" : ""}`}
        onClick={() => onSelect(folder.id)}
        onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          const imageId = e.dataTransfer.getData("imageId");
          if (imageId) onDropImage(imageId, folder.id);
        }}
      >
        <button
          type="button"
          className="w-4 h-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        >
          {hasChildren ? (expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />) : <span className="w-3 h-3 block" />}
        </button>
        {expanded ? <FolderOpen className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" /> : <Folder className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
        {renaming ? (
          <input
            ref={renameRef}
            className="flex-1 border border-blue-300 rounded px-1 text-xs py-0 h-5 outline-none"
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onBlur={handleRenameConfirm}
            onKeyDown={(e) => { if (e.key === "Enter") handleRenameConfirm(); if (e.key === "Escape") setRenaming(false); }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{folder.name}</span>
        )}
        {folder.imageCount !== undefined && (
          <span className="text-[10px] text-gray-400 ml-1">({folder.imageCount})</span>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            { label: "Rename", onClick: () => { setRenaming(true); setRenameVal(folder.name); setContextMenu(null); } },
            { label: "Delete", onClick: () => { onDelete(folder); setContextMenu(null); }, danger: true },
          ]}
        />
      )}

      {expanded && hasChildren && (
        <div className="pl-4">
          {folder.children!.map((child) => (
            <FolderNode key={child.id} folder={child} selectedFolderId={selectedFolderId}
              onSelect={onSelect} onRename={onRename} onDelete={onDelete} onDropImage={onDropImage} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DeleteFolderDialog ───────────────────────────────────────────────────────

function DeleteFolderDialog({ folder, onConfirm, onCancel }: { folder: MediaFolder; onConfirm: () => void; onCancel: () => void; }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-5 w-80 max-w-[90vw]">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Delete folder &quot;{folder.name}&quot;?</h3>
        {(folder.imageCount ?? 0) > 0 && (
          <div className="flex items-start gap-2 mb-3 p-2 bg-yellow-50 rounded border border-yellow-200">
            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">
              This folder contains <strong>{folder.imageCount}</strong> {folder.imageCount === 1 ? "image" : "images"}.
              They will be moved to &quot;All Media&quot;.
            </p>
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs border border-gray-200 rounded hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={onConfirm} className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded">Delete Folder</button>
        </div>
      </div>
    </div>
  );
}

// ─── Field (shared form field) ─────────────────────────────────────────────────

function Field({ label, maxLength, value, onChange, placeholder, multiline, dir }: {
  label: string; maxLength: number; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; dir?: "rtl" | "ltr";
}) {
  const cls = "w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 resize-none";
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <label className="text-[11px] font-medium text-gray-600">{label}</label>
        <span className={`text-[10px] ${value.length > maxLength ? "text-red-500" : "text-gray-400"}`}>{value.length}/{maxLength}</span>
      </div>
      {multiline ? (
        <textarea className={cls} rows={2} maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir={dir} />
      ) : (
        <input type="text" className={cls} maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir={dir} />
      )}
    </div>
  );
}

/** Flatten folder tree for use in a dropdown */
function flattenFolders(folders: MediaFolder[], prefix = ""): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  for (const f of folders) {
    const label = prefix ? `${prefix} / ${f.name}` : f.name;
    result.push({ id: f.id, label });
    if (f.children?.length) result.push(...flattenFolders(f.children, label));
  }
  return result;
}

// ─── MetadataPanel ────────────────────────────────────────────────────────────

interface MetadataPanelProps {
  image: MediaFile;
  onClose: () => void;
  onSaved: (updated: MediaFile) => void;
  onToast: (msg: string, type: "success" | "error") => void;
  folders: MediaFolder[];
}

function MetadataPanel({ image, onClose, onSaved, onToast, folders }: MetadataPanelProps) {
  const [altEn, setAltEn] = useState(image.altTextEn ?? "");
  const [altAr, setAltAr] = useState(image.altTextAr ?? "");
  const [capEn, setCapEn] = useState(image.captionEn ?? "");
  const [capAr, setCapAr] = useState(image.captionAr ?? "");
  const [tags, setTags] = useState(image.tags ?? "");
  const [folderId, setFolderId] = useState(image.folderId ?? "");
  const [saving, setSaving] = useState(false);
  const flatFolders = flattenFolders(folders);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.patch<ApiResponse<MediaFile>>(`/admin/media/${image.id}`, {
        altTextEn: altEn, altTextAr: altAr, captionEn: capEn, captionAr: capAr, tags, folderId: folderId || null,
      });
      onSaved(res.data.data);
      onToast("Metadata saved", "success");
    } catch {
      onToast("Failed to save metadata", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-64 flex-shrink-0 border-l border-gray-200 flex flex-col bg-gray-50 overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-white">
        <span className="text-xs font-semibold text-gray-700">Image Details</span>
        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400" aria-label="Close details">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 flex justify-center bg-white border-b">
        {image.url ? (
          <img src={image.url} alt={image.altTextEn ?? image.originalFilename} className="w-24 h-24 object-cover rounded border border-gray-200"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">No preview</div>
        )}
      </div>
      <div className="px-3 py-2 text-[11px] text-gray-500 border-b bg-white space-y-0.5">
        <div><span className="font-medium text-gray-700">File: </span>{truncate(image.originalFilename, 36)}</div>
        <div><span className="font-medium text-gray-700">Size: </span>{formatBytes(image.sizeBytes)}</div>
        {image.width && image.height && <div><span className="font-medium text-gray-700">Dimensions: </span>{image.width}×{image.height}</div>}
        <div><span className="font-medium text-gray-700">Uploaded: </span>{formatDate(image.createdAt)}</div>
        {(image.uploaderDisplayName || image.uploaderName || image.userName) && (
          <div><span className="font-medium text-gray-700">By: </span>{image.uploaderDisplayName ?? image.uploaderName ?? image.userName}</div>
        )}
      </div>
      <div className="flex-1 px-3 py-3 space-y-3">
        <Field label="Alt Text EN" maxLength={300} value={altEn} onChange={setAltEn} placeholder="Describe the image in English" />
        <Field label="Alt Text AR" maxLength={300} value={altAr} onChange={setAltAr} placeholder="وصف الصورة بالعربية" dir="rtl" />
        <Field label="Caption EN" maxLength={500} value={capEn} onChange={setCapEn} placeholder="Caption (English)" multiline />
        <Field label="Caption AR" maxLength={500} value={capAr} onChange={setCapAr} placeholder="التسمية التوضيحية (عربي)" multiline dir="rtl" />
        <Field label="Tags" maxLength={500} value={tags} onChange={setTags} placeholder="tag1, tag2, tag3" />
        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Folder</label>
          <select className="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400" value={folderId} onChange={(e) => setFolderId(e.target.value)}>
            <option value="">— All Media (root) —</option>
            {flatFolders.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
      </div>
      <div className="px-3 py-2 border-t bg-white">
        <button type="button" disabled={saving} onClick={handleSave} className="w-full py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 flex items-center justify-center gap-1.5">
          {saving ? (<><Loader2 className="w-3 h-3 animate-spin" />Saving…</>) : (<><Check className="w-3 h-3" />Save Metadata</>)}
        </button>
      </div>
    </div>
  );
}

// ─── UploadZone ───────────────────────────────────────────────────────────────

interface UploadZoneProps {
  onUploaded: (file: MediaFile) => void;
  onToast: (msg: string, type: "success" | "error") => void;
}

function UploadZone({ onUploaded }: UploadZoneProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<UploadItem[]>([]);
  const activeRef = useRef(0);

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files).slice(0, MAX_FILES_PER_BATCH);
    const newItems: UploadItem[] = arr.map((f) => ({
      id: `${Date.now()}-${Math.random()}`, file: f, status: "pending" as UploadStatus, progress: 0,
    }));
    queueRef.current.push(...newItems);
    setItems((prev) => [...prev, ...newItems]);
    drainQueue();
  }

  function drainQueue() {
    while (activeRef.current < MAX_CONCURRENT && queueRef.current.length > 0) {
      const item = queueRef.current.shift()!;
      activeRef.current++;
      startUpload(item);
    }
  }

  function startUpload(item: UploadItem) {
    if (!ACCEPTED_TYPES.includes(item.file.type)) { finishItem(item.id, "error", 0, undefined, "Invalid file type"); activeRef.current--; drainQueue(); return; }
    if (item.file.size > MAX_FILE_SIZE) { finishItem(item.id, "error", 0, undefined, "File too large (max 10MB)"); activeRef.current--; drainQueue(); return; }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i)));
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const formData = new FormData();
    formData.append("file", item.file);
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, progress: pct } : i)));
      }
    };
    xhr.onload = () => {
      activeRef.current--;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText) as { success?: boolean; data?: MediaFile };
          finishItem(item.id, "done", 100, res?.data);
          if (res?.data) onUploaded(res.data);
        } catch { finishItem(item.id, "error", 0, undefined, "Invalid server response"); }
      } else {
        let msg = `HTTP ${xhr.status}`;
        try { const res = JSON.parse(xhr.responseText) as { message?: string }; if (res?.message) msg = res.message; } catch { /* ignore */ }
        finishItem(item.id, "error", 0, undefined, msg);
      }
      drainQueue();
    };
    xhr.onerror = () => { activeRef.current--; finishItem(item.id, "error", 0, undefined, "Network error"); drainQueue(); };
    xhr.open("POST", `${API_BASE}/admin/media`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  }

  function finishItem(id: string, status: UploadStatus, progress: number, result?: MediaFile, error?: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status, progress, result, error } : i)));
  }

  function retryItem(item: UploadItem) {
    const fresh: UploadItem = { ...item, status: "pending", progress: 0, error: undefined };
    setItems((prev) => prev.map((i) => (i.id === item.id ? fresh : i)));
    queueRef.current.push(fresh);
    drainQueue();
  }

  const doneCount = items.filter((i) => i.status === "done").length;
  const failCount = items.filter((i) => i.status === "error").length;
  const allDone = items.length > 0 && items.every((i) => i.status === "done" || i.status === "error");

  return (
    <div className="flex flex-col gap-3 p-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-600 font-medium">Drag &amp; drop files here, or click to browse</p>
        <p className="text-[11px] text-gray-400 mt-1">JPEG, PNG, GIF, WebP · max 10 MB each · up to 20 files</p>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden"
        onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }} />
      {items.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-gray-100 bg-white">
              <span className="flex-1 truncate text-gray-700">{item.file.name}</span>
              {item.status === "uploading" && (
                <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-8 text-right">{item.progress}%</span>
                </div>
              )}
              {item.status === "pending" && <span className="text-[10px] text-gray-400">Queued</span>}
              {item.status === "done" && <span className="text-[10px] text-green-600 flex items-center gap-0.5"><Check className="w-3 h-3" />Done</span>}
              {item.status === "error" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-red-500 truncate max-w-[100px]">{item.error}</span>
                  <button type="button" className="text-[10px] text-blue-600 underline flex-shrink-0" onClick={() => retryItem(item)}>Retry</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {allDone && (
        <div className={`text-xs rounded px-3 py-2 font-medium ${failCount === 0 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
          {doneCount} uploaded, {failCount} failed
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function MediaLibraryModal({ open, onClose, onSelect }: MediaLibraryModalProps) {
  // Folder state
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const newFolderRef = useRef<HTMLInputElement>(null);
  const [deletingFolder, setDeletingFolder] = useState<MediaFolder | null>(null);
  const queryClient = useQueryClient();

  // Image grid state
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [allImages, setAllImages] = useState<MediaFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);

  // Tab
  const [tab, setTab] = useState<"grid" | "upload">("grid");

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushToast(message: string, type: "success" | "error") {
    const id = `${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 3500);
  }

  // Folder query
  const { data: flatFolders = [], refetch: refetchFolders } = useQuery<MediaFolder[]>({
    queryKey: ["media-folders"],
    queryFn: fetchFolders,
    enabled: open,
    staleTime: 30_000,
  });
  const folderTree = buildTree(flatFolders);

  // Image query
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["media-library", search, page, selectedFolderId],
    queryFn: () => fetchMediaPage(page, search, selectedFolderId),
    enabled: open && tab === "grid",
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!data) return;
    if (page === 0) {
      setAllImages(data.content);
    } else {
      setAllImages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        return [...prev, ...data.content.filter((m) => !ids.has(m.id))];
      });
    }
  }, [data, page]);

  useEffect(() => { setPage(0); setAllImages([]); }, [search, selectedFolderId]);
  useEffect(() => { if (newFolderMode) newFolderRef.current?.focus(); }, [newFolderMode]);

  const handleSearch = useCallback(() => { setPage(0); setAllImages([]); setSearch(searchInput); }, [searchInput]);

  async function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await api.post("/admin/media-folders", { name, parentId: null });
      setNewFolderMode(false); setNewFolderName("");
      refetchFolders();
    } catch { pushToast("Failed to create folder", "error"); }
  }

  async function handleRenameFolder(id: string, name: string) {
    try { await api.patch(`/admin/media-folders/${id}`, { name }); refetchFolders(); }
    catch { pushToast("Failed to rename folder", "error"); }
  }

  async function handleDeleteFolder(folder: MediaFolder) {
    try {
      await api.delete(`/admin/media-folders/${folder.id}`);
      setDeletingFolder(null);
      if (selectedFolderId === folder.id) setSelectedFolderId(null);
      refetchFolders();
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
    } catch { pushToast("Failed to delete folder", "error"); setDeletingFolder(null); }
  }

  async function handleDropImageOnFolder(imageId: string, folderId: string) {
    const img = allImages.find((i) => i.id === imageId);
    if (!img) return;
    const prevFolderId = img.folderId;
    setAllImages((prev) => prev.map((i) => (i.id === imageId ? { ...i, folderId } : i)));
    try {
      await api.patch(`/admin/media/${imageId}`, { folderId });
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
    } catch {
      setAllImages((prev) => prev.map((i) => (i.id === imageId ? { ...i, folderId: prevFolderId } : i)));
      pushToast("Failed to move image", "error");
    }
  }

  function handleMetadataSaved(updated: MediaFile) {
    setAllImages((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
    setSelectedImage((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
  }

  if (!open) return null;

  const isLoadingFirst = isLoading && page === 0;
  const isLoadingMore = isFetching && page > 0;
  const hasMore = data ? !data.last : false;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-label="Media Library"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-xl shadow-xl w-[980px] max-w-[98vw] h-[85vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900">Media Library</h2>
            <div className="flex items-center gap-2">
              <div className="flex border border-gray-200 rounded overflow-hidden text-xs">
                <button type="button" className={`px-3 py-1 transition-colors ${tab === "grid" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`} onClick={() => setTab("grid")}>Browse</button>
                <button type="button" className={`px-3 py-1 transition-colors ${tab === "upload" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`} onClick={() => setTab("upload")}>Upload</button>
              </div>
              <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700" aria-label="Close"><X className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-44 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50 overflow-hidden">
              <div className="flex items-center justify-between px-2 py-1.5 border-b">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Folders</span>
                <button type="button" className="p-0.5 rounded hover:bg-gray-200 text-gray-500" title="New Folder" onClick={() => setNewFolderMode(true)}><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
                {newFolderMode && (
                  <div className="flex items-center gap-1 px-1 py-0.5">
                    <input ref={newFolderRef} className="flex-1 border border-blue-300 rounded px-1.5 text-xs py-0.5 outline-none" placeholder="Folder name" value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)} maxLength={100}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") { setNewFolderMode(false); setNewFolderName(""); } }}
                      onBlur={() => { if (!newFolderName.trim()) setNewFolderMode(false); }} />
                    <button type="button" className="text-[10px] text-blue-600" onClick={handleCreateFolder}><Check className="w-3 h-3" /></button>
                  </div>
                )}
                <div
                  className={`flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer text-xs select-none ${selectedFolderId === null ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
                  onClick={() => { setSelectedFolderId(null); setSelectedImage(null); }}
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium">All Media</span>
                </div>
                {folderTree.map((folder) => (
                  <FolderNode key={folder.id} folder={folder} selectedFolderId={selectedFolderId}
                    onSelect={(id) => { setSelectedFolderId(id === selectedFolderId ? null : id); setSelectedImage(null); }}
                    onRename={handleRenameFolder}
                    onDelete={(f) => setDeletingFolder(f)}
                    onDropImage={handleDropImageOnFolder}
                  />
                ))}
              </div>
            </div>

            {/* Main area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {tab === "upload" ? (
                <div className="flex-1 overflow-y-auto">
                  <UploadZone onUploaded={(f) => { setAllImages((prev) => [f, ...prev]); setTab("grid"); }} onToast={pushToast} />
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="px-3 py-2 border-b flex-shrink-0">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input type="text" className="w-full border border-gray-200 rounded pl-7 pr-2 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-400"
                          placeholder="Search images…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }} />
                      </div>
                      <button type="button" onClick={handleSearch} className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-200 transition-colors">Search</button>
                    </div>
                  </div>
                  {/* Grid + details */}
                  <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-3">
                      {isLoadingFirst ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /><span className="text-xs">Loading images…</span></div>
                      ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-500">
                          <p className="text-xs">Failed to load media library.</p>
                          <button type="button" onClick={() => { setPage(0); setAllImages([]); }} className="text-xs underline">Retry</button>
                        </div>
                      ) : allImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400"><p className="text-xs">No images found.</p></div>
                      ) : (
                        <>
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(82px,1fr))] gap-2">
                            {allImages.map((img) => {
                              const url = img.url ?? "";
                              const label = img.altTextEn?.trim() ? truncate(img.altTextEn, 30) : img.originalFilename;
                              const missingAlt = !img.altTextEn?.trim();
                              const isSelected = selectedImage?.id === img.id;
                              return (
                                <div key={img.id}
                                  className={`group relative flex flex-col cursor-pointer rounded-md overflow-visible border-2 transition-colors ${isSelected ? "border-blue-500" : "border-transparent hover:border-blue-300"}`}
                                  draggable onDragStart={(e) => { e.dataTransfer.setData("imageId", img.id); }}
                                  onClick={() => setSelectedImage((prev) => (prev?.id === img.id ? null : img))}
                                >
                                  <div className="relative w-full aspect-square bg-gray-100 rounded overflow-hidden">
                                    {url ? (
                                      <img src={img.thumbnailUrl ?? url} alt={img.altTextEn ?? img.originalFilename} loading="lazy"
                                        className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No preview</div>
                                    )}
                                    {missingAlt && <span className="absolute top-0.5 right-0.5 text-yellow-500 leading-none text-sm" title="Missing alt text">⚠</span>}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100">
                                      <button type="button" className="px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded shadow font-medium hover:bg-blue-700"
                                        onClick={(e) => { e.stopPropagation(); onSelect(url); onClose(); }}>Select</button>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-0.5 truncate px-0.5 leading-tight">{truncate(label, 30)}</p>
                                </div>
                              );
                            })}
                          </div>
                          {hasMore && (
                            <div className="mt-4 flex justify-center">
                              <button type="button" onClick={() => setPage((p) => p + 1)} disabled={isLoadingMore}
                                className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1.5">
                                {isLoadingMore ? (<><Loader2 className="w-3 h-3 animate-spin" />Loading…</>) : "Load More"}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {selectedImage && (
                      <MetadataPanel image={selectedImage} onClose={() => setSelectedImage(null)} onSaved={handleMetadataSaved} onToast={pushToast} folders={folderTree} />
                    )}
                  </div>
                  {data && (
                    <div className="px-4 py-2 border-t flex-shrink-0 text-[10px] text-gray-400">
                      {allImages.length} of {data.totalElements} images
                      {selectedFolderId && <span className="ml-2 text-blue-500">· folder filter active</span>}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {deletingFolder && (
        <DeleteFolderDialog folder={deletingFolder} onConfirm={() => handleDeleteFolder(deletingFolder)} onCancel={() => setDeletingFolder(null)} />
      )}

      <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium text-white pointer-events-auto transition-all ${t.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
