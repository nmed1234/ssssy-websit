"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMessages, getFolderByType, getFolders,
  getStarredMessages, deleteMessages, toggleStar,
  markAsRead, moveToFolder,
} from "@/lib/email";
import type { EmailMessage, EmailFolder } from "@/types/email";
import {
  Search, Star, Trash2, RefreshCw, ChevronLeft, ChevronRight,
  Paperclip, Loader2, ArrowLeft, Clock, Reply, Forward,
  FolderOpen, PenSquare, CheckSquare, Square, X,
  Download, MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 25;

/* ── Time formatting ──────────────────────────────────────────────── */
function fmtTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000)        return "Just now";
    if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000)    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604_800_000)   return d.toLocaleDateString([], { weekday: "short" });
    if (diff < 31_536_000_000) return d.toLocaleDateString([], { month: "short", day: "numeric" });
    return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  } catch { return ""; }
}

/* ── Avatar initials ──────────────────────────────────────────────── */
function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const letter = (name || "?").charAt(0).toUpperCase();
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-violet-500",
    "bg-rose-500", "bg-amber-500", "bg-teal-500", "bg-indigo-500",
  ];
  const color = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div className={`${size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"} rounded-full ${color} text-white flex items-center justify-center font-semibold shrink-0`}>
      {letter}
    </div>
  );
}

/* ── Skeleton message row ─────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 bg-muted rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-3 w-10 bg-muted rounded animate-pulse" />
    </div>
  );
}

/* ── Props ────────────────────────────────────────────────────────── */
interface FolderMessageListProps {
  folderType?: string;
  folderId?: string;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  showEmptyButton?: boolean;
  emptyButtonLabel?: string;
  showReplyForward?: boolean;
}

/* ══════════════════════════════════════════════════════════════════ */
export default function FolderMessageList({
  folderType,
  folderId,
  emptyIcon,
  emptyMessage = "This folder is empty",
  showEmptyButton = false,
  emptyButtonLabel = "Empty Folder",
  showReplyForward = true,
}: FolderMessageListProps) {
  const router = useRouter();

  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [allFolders, setAllFolders] = useState<EmailFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [emptying, setEmptying] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [previewMessage, setPreviewMessage] = useState<EmailMessage | null>(null);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Load folder list for Move dropdown ──────────────────────── */
  useEffect(() => {
    getFolders()
      .then((res) => { if (res.data.success) setAllFolders(res.data.data); })
      .catch(() => {});
  }, []);

  /* ── Close move menu on outside click ────────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node)) {
        setShowMoveMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Fetch messages ───────────────────────────────────────────── */
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      if (folderType === "starred") {
        const res = await getStarredMessages(page, PAGE_SIZE);
        if (res.data.success) {
          setMessages(res.data.data.content);
          setTotalPages(res.data.data.totalPages);
          setTotal(res.data.data.totalElements ?? 0);
        }
        return;
      }
      let resolvedId = folderId;
      if (!resolvedId && folderType) {
        const fr = await getFolderByType(folderType);
        if (!fr.data.success) return;
        resolvedId = fr.data.data.id;
      }
      if (!resolvedId) return;
      const msgRes = await getMessages(resolvedId, page, PAGE_SIZE);
      if (msgRes.data.success) {
        setMessages(msgRes.data.data.content);
        setTotalPages(msgRes.data.data.totalPages);
        setTotal(msgRes.data.data.totalElements ?? 0);
      }
    } catch { } finally { setLoading(false); }
  }, [folderType, folderId, page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  /* ── Selection ────────────────────────────────────────────────── */
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(filtered.map((m) => m.id)));
  const clearSel  = () => setSelectedIds(new Set());

  /* ── Actions ──────────────────────────────────────────────────── */
  const handleDelete = async (ids?: string[]) => {
    const toDelete = ids ?? Array.from(selectedIds);
    if (!toDelete.length) return;
    await deleteMessages(toDelete).catch(() => {});
    setSelectedIds(new Set());
    if (previewMessage && toDelete.includes(previewMessage.id)) setPreviewMessage(null);
    fetchMessages();
  };

  const handleStar = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await toggleStar(id).catch(() => {});
    setMessages((p) => p.map((m) => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
    if (previewMessage?.id === id) setPreviewMessage((p) => p ? { ...p, isStarred: !p.isStarred } : p);
  };

  const handleSelect = async (msg: EmailMessage) => {
    if (!msg.isRead) {
      await markAsRead(msg.id).catch(() => {});
      setMessages((p) => p.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
      if (previewMessage?.id === msg.id) setPreviewMessage({ ...msg, isRead: true });
    }
    setPreviewMessage(msg);
  };

  const handleMarkAllRead = async () => {
    const unread = messages.filter((m) => !m.isRead);
    await Promise.all(unread.map((m) => markAsRead(m.id).catch(() => {}))).catch(() => {});
    setMessages((p) => p.map((m) => ({ ...m, isRead: true })));
  };

  const handleMoveSelected = async (targetFolderId: string) => {
    if (!selectedIds.size) return;
    await moveToFolder(Array.from(selectedIds), targetFolderId).catch(() => {});
    setSelectedIds(new Set());
    setShowMoveMenu(false);
    fetchMessages();
  };

  const handleEmptyFolder = async () => {
    if (!messages.length) return;
    setEmptying(true);
    try {
      await deleteMessages(messages.map((m) => m.id));
      setMessages([]);
      setPreviewMessage(null);
      setTotal(0);
    } catch { } finally { setEmptying(false); }
  };

  /* ── Filter (client-side search) ─────────────────────────────── */
  const filtered = searchQuery
    ? messages.filter((m) =>
        (m.subject ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.senderName ?? m.senderAddress ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.previewText ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const allSel = filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id));
  const hasUnread = messages.some((m) => !m.isRead);

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-[#f8f5f2] dark:bg-[#1c1814]">
      {/* ── Top toolbar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card shrink-0">
        {previewMessage && (
          <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0" onClick={() => setPreviewMessage(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Select-all toggle */}
        <button
          onClick={allSel ? clearSel : selectAll}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title={allSel ? "Deselect all" : "Select all"}
        >
          {allSel ? <CheckSquare className="h-4 w-4 text-soil-clay" /> : <Square className="h-4 w-4" />}
        </button>

        {/* Search input */}
        <div className="relative flex-1 max-w-sm min-w-[120px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-soil-clay/50 bg-background"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Refresh */}
        <button onClick={fetchMessages} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>

        {/* Mark all read */}
        {hasUnread && (
          <button onClick={handleMarkAllRead} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted hidden sm:block">
            Mark all read
          </button>
        )}

        {/* Empty folder button */}
        {showEmptyButton && messages.length > 0 && (
          <button
            onClick={handleEmptyFolder}
            disabled={emptying}
            className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
          >
            {emptying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            <span className="hidden sm:inline">{emptyButtonLabel}</span>
          </button>
        )}

        {/* Bulk actions toolbar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-1.5 bg-soil-clay/8 border border-soil-clay/20 rounded-lg px-2.5 py-1"
            >
              <span className="text-xs font-medium text-soil-clay">{selectedIds.size}</span>
              <button onClick={() => handleDelete()} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline">Delete</span>
              </button>
              <div className="relative" ref={moveMenuRef}>
                <button onClick={() => setShowMoveMenu(!showMoveMenu)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors">
                  <FolderOpen className="h-3 w-3" />
                  <span className="hidden sm:inline">Move</span>
                </button>
                {showMoveMenu && (
                  <div className="absolute top-full right-0 mt-1 z-30 bg-card border border-border rounded-xl shadow-lg min-w-[160px] py-1 overflow-hidden">
                    {allFolders.filter((f) => f.systemFolder && f.folderType !== folderType).map((f) => (
                      <button key={f.id} onClick={() => handleMoveSelected(f.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={clearSel} className="p-0.5 text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          {!loading && total > 0 && <span className="hidden sm:inline">{total} messages</span>}
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="p-1 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>{page + 1}/{Math.max(totalPages, 1)}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="p-1 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Content: list + preview split ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Message list ────────────────────────────────────────── */}
        <div className={`flex flex-col overflow-hidden transition-all duration-200 ${
          previewMessage ? "hidden md:flex md:w-[360px] lg:w-[400px] shrink-0" : "w-full"
        }`}>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="divide-y divide-border">
                {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground gap-3">
                {emptyIcon && <div className="opacity-20 text-muted-foreground">{emptyIcon}</div>}
                <p className="text-base font-medium text-foreground">{emptyMessage}</p>
                <p className="text-sm text-muted-foreground">{searchQuery ? "Try a different search term" : "Nothing here yet"}</p>
                <Button
                  variant="outline" size="sm"
                  onClick={() => router.push("/email/compose")}
                  className="mt-1 text-soil-clay border-soil-clay/30 hover:bg-soil-clay/5"
                >
                  <PenSquare className="h-3.5 w-3.5 mr-1.5" /> Compose message
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((msg) => {
                  const isSelected  = selectedIds.has(msg.id);
                  const isPreview   = previewMessage?.id === msg.id;
                  const isHovered   = hoverId === msg.id;
                  const senderLabel = msg.senderName || msg.senderAddress || "Unknown";

                  return (
                    <div
                      key={msg.id}
                      onMouseEnter={() => setHoverId(msg.id)}
                      onMouseLeave={() => setHoverId(null)}
                      onClick={() => handleSelect(msg)}
                      className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        isPreview
                          ? "bg-soil-clay/8 border-r-2 border-r-soil-clay"
                          : isSelected
                          ? "bg-soil-clay/5"
                          : !msg.isRead
                          ? "bg-white dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/8"
                          : "hover:bg-white/60 dark:hover:bg-white/3"
                      }`}
                    >
                      {/* Unread indicator */}
                      {!msg.isRead && (
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-soil-clay shrink-0" />
                      )}

                      {/* Checkbox (shows on hover/select) */}
                      <div
                        className={`shrink-0 mt-0.5 transition-all duration-150 ${
                          isSelected || isHovered ? "opacity-100 w-5" : "opacity-0 w-0 overflow-hidden"
                        }`}
                        onClick={(e) => toggleSelect(msg.id, e)}
                      >
                        {isSelected
                          ? <CheckSquare className="h-4 w-4 text-soil-clay" />
                          : <Square className="h-4 w-4 text-muted-foreground" />}
                      </div>

                      {/* Avatar (collapses when checkbox shows) */}
                      <div className={`transition-all duration-150 shrink-0 ${
                        isSelected || isHovered ? "w-0 overflow-hidden opacity-0" : "w-8 opacity-100"
                      }`}>
                        <Avatar name={senderLabel} size="sm" />
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`text-sm truncate ${!msg.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                            {senderLabel}
                          </span>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {msg.createdAt ? fmtTime(msg.createdAt) : ""}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${!msg.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                          {msg.subject || "(No subject)"}
                        </p>
                        {msg.previewText && (
                          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{msg.previewText}</p>
                        )}
                      </div>

                      {/* Right-side indicators */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {msg.isStarred && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                        {msg.hasAttachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}

                        {/* Hover action buttons */}
                        <div className={`flex items-center gap-0.5 transition-opacity duration-100 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStar(msg.id, e); }}
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-amber-400 transition-colors"
                            title="Star"
                          >
                            <Star className={`h-3.5 w-3.5 ${msg.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete([msg.id]); }}
                            className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Preview pane ──────────────────────────────────────────── */}
        <AnimatePresence>
          {previewMessage && (
            <motion.div
              key={previewMessage.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col flex-1 overflow-hidden border-l border-border bg-card"
            >
              {/* Preview toolbar */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border shrink-0 bg-muted/20">
                <button
                  onClick={() => setPreviewMessage(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="flex-1" />

                {showReplyForward && (
                  <>
                    <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => router.push(`/email/compose?reply=${previewMessage.id}`)}>
                      <Reply className="h-3.5 w-3.5 mr-1" /> Reply
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => router.push(`/email/compose?forward=${previewMessage.id}`)}>
                      <Forward className="h-3.5 w-3.5 mr-1" /> Forward
                    </Button>
                  </>
                )}

                <button
                  onClick={() => handleStar(previewMessage.id)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  title="Star"
                >
                  <Star className={`h-4 w-4 ${previewMessage.isStarred ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                </button>

                <button
                  onClick={() => handleDelete([previewMessage.id])}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => router.push(`/email/message/${previewMessage.id}`)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  title="Open full view"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Subject + sender */}
              <div className="px-6 py-5 border-b border-border shrink-0">
                <h2 className="text-xl font-semibold text-foreground mb-4 leading-snug">
                  {previewMessage.subject || "(No subject)"}
                </h2>
                <div className="flex items-start gap-3">
                  <Avatar name={previewMessage.senderName || previewMessage.senderAddress || "?"} size="md" />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-semibold text-sm text-foreground">
                      {previewMessage.senderName || previewMessage.senderAddress}
                    </p>
                    {previewMessage.senderName && (
                      <p className="text-xs text-muted-foreground">{previewMessage.senderAddress}</p>
                    )}
                    {previewMessage.recipients?.filter((r) => r.recipientType === "TO").length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        To: {previewMessage.recipients.filter((r) => r.recipientType === "TO").map((r) => r.name || r.address).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{previewMessage.createdAt ? new Date(previewMessage.createdAt).toLocaleString() : ""}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed">
                {previewMessage.bodyHtml ? (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert [&_a]:text-soil-clay"
                    dangerouslySetInnerHTML={{ __html: previewMessage.bodyHtml }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                    {previewMessage.bodyText || "(No content)"}
                  </pre>
                )}
              </div>

              {/* Attachments */}
              {previewMessage.attachments && previewMessage.attachments.length > 0 && (
                <div className="px-6 py-4 border-t border-border bg-muted/20 shrink-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {previewMessage.attachments.length} Attachment{previewMessage.attachments.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {previewMessage.attachments.map((att) => (
                      <div key={att.id} className="group flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border hover:border-soil-clay/40 transition-colors cursor-pointer">
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate max-w-[180px]">{att.filename}</span>
                        {att.sizeBytes > 0 && (
                          <span className="text-xs text-muted-foreground">({(att.sizeBytes / 1024).toFixed(0)} KB)</span>
                        )}
                        <Download className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
