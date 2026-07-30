"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getFolders, getMessages, markAsRead, toggleStar, deleteMessages } from "@/lib/email";
import type { EmailFolder, EmailMessage } from "@/types/email";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import {
  Inbox, Send, FileText, Trash2, AlertTriangle, Archive,
  Mail, Star, RefreshCw, ChevronLeft, ChevronRight,
  Paperclip, Loader2, ArrowLeft, Clock, Edit3, ExternalLink, Download,
  CheckSquare, Square,
} from "lucide-react";

const FOLDER_META: Record<string, { icon: React.FC<{ className?: string }>; label: string; color: string; bg: string }> = {
  INBOX:   { icon: Inbox,         label: "Inbox",   color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/20" },
  SENT:    { icon: Send,          label: "Sent",    color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  DRAFTS:  { icon: FileText,      label: "Drafts",  color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-900/20" },
  TRASH:   { icon: Trash2,        label: "Trash",   color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/20" },
  SPAM:    { icon: AlertTriangle, label: "Spam",    color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ARCHIVE: { icon: Archive,       label: "Archive", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
};

function fmtTime(s: string) {
  try {
    const d = new Date(s), diff = Date.now() - d.getTime();
    if (diff < 60_000)        return "Just now";
    if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000)    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604_800_000)   return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

function Avatar({ name }: { name: string }) {
  const l = (name || "?").charAt(0).toUpperCase();
  const pal = ["bg-blue-500","bg-emerald-500","bg-violet-500","bg-rose-500","bg-amber-500","bg-teal-500"];
  return (
    <div className={`w-8 h-8 rounded-full ${pal[l.charCodeAt(0) % pal.length]} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
      {l}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted" />
      <div className="flex-1 space-y-1.5"><div className="h-3 w-28 bg-muted rounded" /><div className="h-3 w-3/4 bg-muted rounded" /></div>
      <div className="h-3 w-10 bg-muted rounded" />
    </div>
  );
}

export default function AdminEmailInboxPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [folders,         setFolders]         = useState<EmailFolder[]>([]);
  const [activeFolderId,  setActiveFolderId]   = useState("");
  const [messages,        setMessages]         = useState<EmailMessage[]>([]);
  const [loading,         setLoading]          = useState(true);
  const [foldersLoaded,   setFoldersLoaded]    = useState(false);
  const [page,            setPage]             = useState(0);
  const [totalPages,      setTotalPages]       = useState(0);
  const [selected,        setSelected]         = useState<Set<string>>(new Set());
  const [preview,         setPreview]          = useState<EmailMessage | null>(null);
  const [hoverId,         setHoverId]          = useState<string | null>(null);
  const [error,           setError]            = useState<string | null>(null);

  useEffect(() => {
    getFolders()
      .then((res) => {
        const data = res.data.data ?? [];
        setFolders(data);
        const inbox = data.find((f) => f.folderType === "INBOX");
        if (inbox) setActiveFolderId(inbox.id);
      })
      .catch(() => setError("Failed to load folders"))
      .finally(() => setFoldersLoaded(true));
  }, []);

  const fetchMessages = useCallback(() => {
    if (!activeFolderId) return;
    setLoading(true);
    setError(null);
    getMessages(activeFolderId, page, 20)
      .then((res) => {
        setMessages(res.data.data.content ?? []);
        setTotalPages(res.data.data.totalPages ?? 0);
      })
      .catch(() => setError("Failed to load messages"))
      .finally(() => setLoading(false));
  }, [activeFolderId, page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleOpen = async (msg: EmailMessage) => {
    if (!msg.isRead) {
      await markAsRead(msg.id).catch(() => {});
      setMessages((p) => p.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
    }
    setPreview(msg);
  };

  const handleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleStar(id).catch(() => {});
    setMessages((p) => p.map((m) => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
    if (preview?.id === id) setPreview((p) => p ? { ...p, isStarred: !p.isStarred } : p);
  };

  const handleDeleteSelected = async () => {
    if (!selected.size) return;
    await deleteMessages(Array.from(selected)).catch(() => {});
    setSelected(new Set());
    setPreview(null);
    fetchMessages();
  };

  const handleDeletePreview = async () => {
    if (!preview) return;
    await deleteMessages([preview.id]).catch(() => {});
    setPreview(null);
    fetchMessages();
  };

  const handleFolderChange = (id: string) => {
    setActiveFolderId(id);
    setPage(0);
    setSelected(new Set());
    setPreview(null);
  };

  const activeFolder  = folders.find((f) => f.id === activeFolderId);
  const totalUnread   = folders.reduce((s, f) => s + (f.unreadCount ?? 0), 0);
  const activeFolderMeta = activeFolder ? (FOLDER_META[activeFolder.folderType] ?? { label: activeFolder.name, color: "text-muted-foreground", bg: "" }) : null;
  const allSel = messages.length > 0 && messages.every((m) => selected.has(m.id));

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title={t("Email Inbox", "البريد الوارد")}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Email", href: "/admin/email" },
          { label: "Inbox" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/email/inbox">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1.5" />
                {t("Full Client", "البريد الكامل")}
              </Button>
            </Link>
            <Link href="/email/compose">
              <Button size="sm" className="bg-soil-clay hover:bg-soil-dark text-white">
                <Edit3 className="h-4 w-4 mr-1.5" />
                {t("Compose", "إنشاء")}
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={fetchMessages} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {selected.size > 0 && (
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4 mr-1" /> {t("Delete", "حذف")} ({selected.size})
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="mx-0 mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
        {/* ── Folder sidebar ────────────────────────────────────── */}
        <div className="w-52 shrink-0 hidden md:flex flex-col bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border shrink-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {!foldersLoaded
              ? [...Array(6)].map((_, i) => <div key={i} className="h-8 bg-muted rounded-lg animate-pulse" />)
              : folders.filter((f) => f.systemFolder).sort((a, b) => a.sortOrder - b.sortOrder).map((folder) => {
                  const meta = FOLDER_META[folder.folderType];
                  const Icon = meta?.icon ?? Mail;
                  const isActive = folder.id === activeFolderId;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => handleFolderChange(folder.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        isActive
                          ? "bg-soil-clay/10 text-soil-clay font-medium border-l-2 border-soil-clay"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div className={`p-1 rounded-md ${isActive ? "bg-soil-clay/15" : (meta?.bg ?? "")}`}>
                        <Icon className={`h-3.5 w-3.5 ${isActive ? "text-soil-clay" : (meta?.color ?? "text-muted-foreground")}`} />
                      </div>
                      <span className="flex-1 truncate">{meta?.label ?? folder.name}</span>
                      {(folder.unreadCount ?? 0) > 0 && (
                        <span className="bg-soil-clay text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {folder.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
          </nav>
          {totalUnread > 0 && (
            <div className="p-3 border-t border-border shrink-0">
              <p className="text-xs text-muted-foreground"><span className="font-medium text-soil-clay">{totalUnread}</span> unread total</p>
            </div>
          )}
        </div>

        {/* ── Message list ──────────────────────────────────────── */}
        <div className={`flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-all ${
          preview ? "hidden md:flex md:w-[360px] shrink-0" : "flex-1"
        }`}>
          {/* List toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20 shrink-0">
            <button
              onClick={allSel ? () => setSelected(new Set()) : () => setSelected(new Set(messages.map((m) => m.id)))}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {allSel ? <CheckSquare className="h-4 w-4 text-soil-clay" /> : <Square className="h-4 w-4" />}
            </button>
            {activeFolderMeta && (
              <span className="text-sm font-medium text-foreground flex-1 flex items-center gap-1.5">
                {activeFolderMeta.label}
              </span>
            )}
            <div className="flex items-center gap-1 text-muted-foreground ml-auto">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-1 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-xs">{page + 1}/{Math.max(totalPages, 1)}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="p-1 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          {/* List body */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loading ? (
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                <Mail className="h-10 w-10 opacity-20" />
                <p className="text-sm">No messages</p>
              </div>
            ) : messages.map((msg) => {
              const isSel = selected.has(msg.id);
              const isPrev = preview?.id === msg.id;
              const isHov = hoverId === msg.id;
              const sender = msg.senderName || msg.senderAddress || "Unknown";
              return (
                <div
                  key={msg.id}
                  onMouseEnter={() => setHoverId(msg.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => handleOpen(msg)}
                  className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    isPrev ? "bg-soil-clay/8 border-r-2 border-r-soil-clay"
                    : isSel ? "bg-soil-clay/5"
                    : !msg.isRead ? "bg-white dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/8"
                    : "hover:bg-muted/40"
                  }`}
                >
                  {!msg.isRead && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-soil-clay" />}
                  <div
                    className={`shrink-0 mt-0.5 transition-all duration-150 ${isSel || isHov ? "opacity-100 w-5" : "opacity-0 w-0 overflow-hidden"}`}
                    onClick={(e) => { e.stopPropagation(); setSelected((p) => { const n = new Set(p); n.has(msg.id) ? n.delete(msg.id) : n.add(msg.id); return n; }); }}
                  >
                    {isSel ? <CheckSquare className="h-4 w-4 text-soil-clay" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className={`transition-all duration-150 shrink-0 ${isSel || isHov ? "w-0 overflow-hidden opacity-0" : "w-8 opacity-100"}`}>
                    <Avatar name={sender} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-sm truncate ${!msg.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>{sender}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{msg.createdAt ? fmtTime(msg.createdAt) : ""}</span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${!msg.isRead ? "text-foreground" : "text-muted-foreground"}`}>{msg.subject || "(no subject)"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {msg.isStarred && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                    {msg.hasAttachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                    <div className={`flex items-center gap-0.5 transition-opacity ${isHov ? "opacity-100" : "opacity-0"}`}>
                      <button onClick={(e) => handleStar(msg.id, e)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-amber-400 transition-colors">
                        <Star className={`h-3.5 w-3.5 ${msg.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Preview pane ──────────────────────────────────────── */}
        <AnimatePresence>
          {preview && (
            <motion.div
              key={preview.id}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/20 shrink-0">
                <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors md:hidden"><ArrowLeft className="h-4 w-4" /></button>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push(`/email/compose?reply=${preview.id}`)}>Reply</Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push(`/email/compose?forward=${preview.id}`)}>Forward</Button>
                <button onClick={(e) => handleStar(preview.id, e)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Star className={`h-4 w-4 ${preview.isStarred ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                </button>
                <button onClick={handleDeletePreview} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>

              {/* Subject + sender */}
              <div className="px-5 py-5 border-b border-border shrink-0">
                <h2 className="text-lg font-semibold text-foreground mb-4 leading-snug">{preview.subject || "(No subject)"}</h2>
                <div className="flex items-start gap-3">
                  <Avatar name={preview.senderName || preview.senderAddress || "?"} />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-semibold text-sm text-foreground">{preview.senderName || preview.senderAddress}</p>
                    {preview.senderName && <p className="text-xs text-muted-foreground">{preview.senderAddress}</p>}
                    {preview.recipients?.filter((r) => r.recipientType === "TO").length > 0 && (
                      <p className="text-xs text-muted-foreground">To: {preview.recipients.filter((r) => r.recipientType === "TO").map((r) => r.name || r.address).join(", ")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />{preview.createdAt ? new Date(preview.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed">
                {preview.bodyHtml
                  ? <div className="prose prose-sm max-w-none dark:prose-invert [&_a]:text-soil-clay" dangerouslySetInnerHTML={{ __html: preview.bodyHtml }} />
                  : <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">{preview.bodyText || "(No content)"}</pre>}
              </div>

              {/* Attachments */}
              {(preview.attachments?.length ?? 0) > 0 && (
                <div className="px-5 py-3 border-t border-border bg-muted/20 shrink-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {preview.attachments.length} Attachment{preview.attachments.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {preview.attachments.map((att) => (
                      <div key={att.id} className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-background rounded-lg border border-border hover:border-soil-clay/40 transition-colors cursor-pointer text-xs">
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[160px] text-foreground">{att.filename}</span>
                        {att.sizeBytes > 0 && <span className="text-muted-foreground">({(att.sizeBytes / 1024).toFixed(0)} KB)</span>}
                        <Download className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
