"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getMessages, getFolderByType, getFolders, deleteMessages, toggleStar, markAsRead, moveToFolder } from "@/lib/email";
import type { EmailMessage, EmailFolder } from "@/types/email";
import {
  Search, Star, Trash2, RefreshCw, ChevronLeft, ChevronRight,
  Paperclip, Loader2, ArrowLeft, Clock, Reply, Forward,
  FolderOpen, CheckSquare, Square, X, Download, MoreVertical,
  PenSquare, Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 25;

/* ── Helpers ────────────────────────────────────────────────────── */
function fmtTime(s: string): string {
  try {
    const d = new Date(s), diff = Date.now() - d.getTime();
    if (diff < 60_000)          return "Just now";
    if (diff < 3_600_000)       return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000)      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604_800_000)     return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const l = (name || "?").charAt(0).toUpperCase();
  const pal = ["bg-blue-500","bg-emerald-500","bg-violet-500","bg-rose-500","bg-amber-500","bg-teal-500","bg-indigo-500"];
  return (
    <div className={`${size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"} rounded-full ${pal[l.charCodeAt(0) % pal.length]} text-white flex items-center justify-center font-semibold shrink-0`}>
      {l}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 bg-muted rounded" />
        <div className="h-3 w-3/4 bg-muted rounded" />
      </div>
      <div className="h-3 w-10 bg-muted rounded" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function InboxPage() {
  const router = useRouter();

  const [messages, setMessages]         = useState<EmailMessage[]>([]);
  const [allFolders, setAllFolders]     = useState<EmailFolder[]>([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [total, setTotal]               = useState(0);
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery]   = useState("");
  const [preview, setPreview]           = useState<EmailMessage | null>(null);
  const [hoverId, setHoverId]           = useState<string | null>(null);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const moveMenuRef                     = useRef<HTMLDivElement>(null);

  // Swipe (mobile)
  const [swipingId, setSwipingId]           = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset]       = useState(0);
  const [revealedId, setRevealedId]         = useState<string | null>(null);
  const touchStartX                         = useRef(0);

  /* ── Load ───────────────────────────────────────────────────── */
  useEffect(() => {
    getFolders().then((r) => { if (r.data.success) setAllFolders(r.data.data); }).catch(() => {});
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const fr = await getFolderByType("INBOX");
      if (!fr.data.success) return;
      const mr = await getMessages(fr.data.data.id, page, PAGE_SIZE);
      if (mr.data.success) {
        setMessages(mr.data.data.content);
        setTotalPages(mr.data.data.totalPages);
        setTotal(mr.data.data.totalElements ?? 0);
      }
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  /* ── Close move menu outside ──────────────────────────────── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node)) setShowMoveMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Keyboard shortcuts ───────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape") { setPreview(null); setSelectedIds(new Set()); }
      if (e.key === "c" || e.key === "C") router.push("/email/compose");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  /* ── Selection ────────────────────────────────────────────── */
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const filtered = searchQuery
    ? messages.filter((m) =>
        (m.subject ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.senderName ?? m.senderAddress ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.previewText ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;
  const allSel = filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id));

  /* ── Actions ──────────────────────────────────────────────── */
  const handleDelete = async (ids?: string[]) => {
    const del = ids ?? Array.from(selectedIds);
    if (!del.length) return;
    await deleteMessages(del).catch(() => {});
    setSelectedIds(new Set());
    if (preview && del.includes(preview.id)) setPreview(null);
    fetchMessages();
  };

  const handleStar = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await toggleStar(id).catch(() => {});
    setMessages((p) => p.map((m) => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
    if (preview?.id === id) setPreview((p) => p ? { ...p, isStarred: !p.isStarred } : p);
  };

  const handleOpen = async (msg: EmailMessage) => {
    if (!msg.isRead) {
      await markAsRead(msg.id).catch(() => {});
      setMessages((p) => p.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
    }
    setPreview(msg);
  };

  const handleMarkAllRead = async () => {
    await Promise.all(messages.filter((m) => !m.isRead).map((m) => markAsRead(m.id).catch(() => {}))).catch(() => {});
    setMessages((p) => p.map((m) => ({ ...m, isRead: true })));
  };

  const handleMove = async (folderId: string) => {
    if (!selectedIds.size) return;
    await moveToFolder(Array.from(selectedIds), folderId).catch(() => {});
    setSelectedIds(new Set());
    setShowMoveMenu(false);
    fetchMessages();
  };

  /* ── Mobile swipe ─────────────────────────────────────────── */
  const onTouchStart = (id: string) => (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipingId(id);
    setSwipeOffset(revealedId === id ? -120 : 0);
  };
  const onTouchMove = (id: string) => (e: React.TouchEvent) => {
    if (swipingId !== id) return;
    const dx = touchStartX.current - e.touches[0].clientX;
    const base = revealedId === id ? -120 : 0;
    setSwipeOffset(Math.max(-200, Math.min(-base + dx > 0 ? -(dx) : 0, 30)));
  };
  const onTouchEnd = (id: string) => () => {
    if (swipingId !== id) return;
    const wasRevealed = revealedId === id;
    if (!wasRevealed && swipeOffset < -80) setRevealedId(id);
    else if (wasRevealed && swipeOffset > -50) setRevealedId(null);
    setSwipingId(null); setSwipeOffset(0);
  };

  const hasUnread = messages.some((m) => !m.isRead);

  return (
    <div className="flex flex-col h-full bg-[#f8f5f2] dark:bg-[#1c1814]">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card shrink-0">
        {preview && (
          <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0" onClick={() => setPreview(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <button
          onClick={allSel ? () => setSelectedIds(new Set()) : () => setSelectedIds(new Set(filtered.map((m) => m.id)))}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {allSel ? <CheckSquare className="h-4 w-4 text-soil-clay" /> : <Square className="h-4 w-4" />}
        </button>
        <div className="relative flex-1 max-w-sm min-w-[120px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text" placeholder="Search inbox…" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-soil-clay/50 bg-background"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <button onClick={fetchMessages} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors" title="Refresh (R)">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
        {hasUnread && (
          <button onClick={handleMarkAllRead} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors hidden sm:block">
            Mark all read
          </button>
        )}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-1.5 bg-soil-clay/8 border border-soil-clay/20 rounded-lg px-2.5 py-1"
            >
              <span className="text-xs font-medium text-soil-clay">{selectedIds.size}</span>
              <button onClick={() => handleDelete()} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 className="h-3 w-3" /><span className="hidden sm:inline">Delete</span>
              </button>
              <div className="relative" ref={moveMenuRef}>
                <button onClick={() => setShowMoveMenu(!showMoveMenu)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors">
                  <FolderOpen className="h-3 w-3" /><span className="hidden sm:inline">Move</span>
                </button>
                {showMoveMenu && (
                  <div className="absolute top-full right-0 mt-1 z-30 bg-card border border-border rounded-xl shadow-lg min-w-[160px] py-1">
                    {allFolders.filter((f) => f.systemFolder && f.folderType !== "INBOX").map((f) => (
                      <button key={f.id} onClick={() => handleMove(f.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">{f.name}</button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedIds(new Set())} className="p-0.5 text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          {!loading && total > 0 && <span className="hidden sm:inline">{total} messages</span>}
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-1 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
          <span>{page + 1}/{Math.max(totalPages, 1)}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="p-1 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Message list */}
        <div className={`flex flex-col overflow-hidden transition-all duration-200 ${
          preview ? "hidden md:flex md:w-[360px] lg:w-[400px] shrink-0" : "w-full"
        }`}>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="divide-y divide-border">{[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 gap-3 text-muted-foreground">
                <PenSquare className="h-12 w-12 opacity-10" />
                <p className="text-base font-medium text-foreground">{searchQuery ? `No results for "${searchQuery}"` : "Your inbox is empty"}</p>
                <p className="text-sm">Nothing to show here</p>
                <Button variant="outline" size="sm" onClick={() => router.push("/email/compose")} className="mt-1 text-soil-clay border-soil-clay/30 hover:bg-soil-clay/5">
                  <PenSquare className="h-3.5 w-3.5 mr-1.5" /> Compose message
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((msg) => {
                  const isSel = selectedIds.has(msg.id);
                  const isPrev = preview?.id === msg.id;
                  const isHov = hoverId === msg.id;
                  const sender = msg.senderName || msg.senderAddress || "Unknown";
                  const isRevealed = revealedId === msg.id;

                  return (
                    <div key={msg.id} className="relative overflow-hidden">
                      {/* Swipe actions (mobile) */}
                      {isRevealed && (
                        <div className="absolute inset-y-0 right-0 flex items-stretch z-10">
                          <button onClick={() => { setRevealedId(null); handleDelete([msg.id]); }} className="px-5 bg-red-500 hover:bg-red-600 text-white text-xs flex items-center gap-1 transition-colors">
                            <Trash2 className="h-4 w-4" /><span>Delete</span>
                          </button>
                          <button onClick={() => { setRevealedId(null); handleStar(msg.id); }} className="px-4 bg-amber-400 hover:bg-amber-500 text-white text-xs flex items-center gap-1 transition-colors">
                            <Star className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      <div
                        onMouseEnter={() => setHoverId(msg.id)}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => { if (Math.abs(swipeOffset) < 10) handleOpen(msg); }}
                        onTouchStart={onTouchStart(msg.id)}
                        onTouchMove={onTouchMove(msg.id)}
                        onTouchEnd={onTouchEnd(msg.id)}
                        style={{
                          transform: swipingId === msg.id ? `translateX(${swipeOffset}px)` : isRevealed ? "translateX(-120px)" : "",
                          transition: swipingId === msg.id ? "none" : "transform 0.2s ease",
                        }}
                        className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          isPrev ? "bg-soil-clay/8 border-r-2 border-r-soil-clay"
                          : isSel ? "bg-soil-clay/5"
                          : !msg.isRead ? "bg-white dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/8"
                          : "hover:bg-white/60 dark:hover:bg-white/3"
                        }`}
                      >
                        {!msg.isRead && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-soil-clay" />}
                        <div className={`shrink-0 mt-0.5 transition-all duration-150 ${isSel || isHov ? "opacity-100 w-5" : "opacity-0 w-0 overflow-hidden"}`} onClick={(e) => toggleSelect(msg.id, e)}>
                          {isSel ? <CheckSquare className="h-4 w-4 text-soil-clay" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className={`transition-all duration-150 shrink-0 ${isSel || isHov ? "w-0 overflow-hidden opacity-0" : "w-8 opacity-100"}`}>
                          <Avatar name={sender} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className={`text-sm truncate ${!msg.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>{sender}</span>
                            <span className="text-[11px] text-muted-foreground shrink-0">{msg.createdAt ? fmtTime(msg.createdAt) : ""}</span>
                          </div>
                          <p className={`text-xs truncate mt-0.5 ${!msg.isRead ? "text-foreground" : "text-muted-foreground"}`}>{msg.subject || "(No subject)"}</p>
                          {msg.previewText && <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{msg.previewText}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {msg.isStarred && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                          {msg.hasAttachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                          <div className={`flex items-center gap-0.5 transition-opacity duration-100 ${isHov ? "opacity-100" : "opacity-0"}`}>
                            <button onClick={(e) => handleStar(msg.id, e)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-amber-400 transition-colors">
                              <Star className={`h-3.5 w-3.5 ${msg.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete([msg.id]); }} className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Preview pane */}
        <AnimatePresence>
          {preview && (
            <motion.div key={preview.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              className="flex flex-col flex-1 overflow-hidden border-l border-border bg-card"
            >
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border shrink-0 bg-muted/20">
                <button onClick={() => setPreview(null)} className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><ArrowLeft className="h-4 w-4" /></button>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => router.push(`/email/compose?reply=${preview.id}`)}><Reply className="h-3.5 w-3.5 mr-1" /> Reply</Button>
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => router.push(`/email/compose?forward=${preview.id}`)}><Forward className="h-3.5 w-3.5 mr-1" /> Forward</Button>
                <button onClick={() => handleStar(preview.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Star className={`h-4 w-4 ${preview.isStarred ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                </button>
                <button onClick={() => handleDelete([preview.id])} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                <button onClick={() => router.push(`/email/message/${preview.id}`)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Open full view"><MoreVertical className="h-4 w-4" /></button>
              </div>

              <div className="px-6 py-5 border-b border-border shrink-0">
                <h2 className="text-xl font-semibold text-foreground mb-4 leading-snug">{preview.subject || "(No subject)"}</h2>
                <div className="flex items-start gap-3">
                  <Avatar name={preview.senderName || preview.senderAddress || "?"} size="md" />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-semibold text-sm text-foreground">{preview.senderName || preview.senderAddress}</p>
                    {preview.senderName && <p className="text-xs text-muted-foreground">{preview.senderAddress}</p>}
                    {preview.recipients?.filter((r) => r.recipientType === "TO").length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        To: {preview.recipients.filter((r) => r.recipientType === "TO").map((r) => r.name || r.address).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{preview.createdAt ? new Date(preview.createdAt).toLocaleString() : ""}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed">
                {preview.bodyHtml
                  ? <div className="prose prose-sm max-w-none dark:prose-invert [&_a]:text-soil-clay" dangerouslySetInnerHTML={{ __html: preview.bodyHtml }} />
                  : <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">{preview.bodyText || "(No content)"}</pre>}
              </div>

              {(preview.attachments?.length ?? 0) > 0 && (
                <div className="px-6 py-4 border-t border-border bg-muted/20 shrink-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{preview.attachments.length} Attachment{preview.attachments.length !== 1 ? "s" : ""}</p>
                  <div className="flex flex-wrap gap-2">
                    {preview.attachments.map((att) => (
                      <div key={att.id} className="group flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border hover:border-soil-clay/40 transition-colors cursor-pointer">
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate max-w-[180px]">{att.filename}</span>
                        {att.sizeBytes > 0 && <span className="text-xs text-muted-foreground">({(att.sizeBytes / 1024).toFixed(0)} KB)</span>}
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
