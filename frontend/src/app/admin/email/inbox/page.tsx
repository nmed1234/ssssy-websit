"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getFolders, getMessages, markAsRead, toggleStar, deleteMessages, moveToFolder,
} from "@/lib/email";
import type { EmailFolder, EmailMessage } from "@/types/email";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Inbox, Send, FileText, Trash2, Star, Archive, Mail, MailOpen,
  RefreshCw, ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const folderIcons: Record<string, React.ReactNode> = {
  INBOX: <Inbox className="h-4 w-4" />,
  SENT: <Send className="h-4 w-4" />,
  DRAFTS: <FileText className="h-4 w-4" />,
  TRASH: <Trash2 className="h-4 w-4" />,
};

const systemFolders = ["INBOX", "SENT", "DRAFTS", "TRASH"];

export default function EmailInboxPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string>("");
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFolders()
      .then((res) => {
        const data = res.data.data;
        setFolders(data);
        const inbox = data.find((f) => f.folderType === "INBOX");
        if (inbox) setActiveFolderId(inbox.id);
      })
      .catch(() => setError("Failed to load folders"))
      .finally(() => setLoading(false));
  }, []);

  const fetchMessages = useCallback(() => {
    if (!activeFolderId) return;
    setLoading(true);
    setError(null);
    getMessages(activeFolderId, page, 20)
      .then((res) => {
        const data = res.data.data;
        setMessages(data.content || []);
        setTotalPages(data.totalPages || 0);
      })
      .catch(() => setError("Failed to load messages"))
      .finally(() => setLoading(false));
  }, [activeFolderId, page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleFolderChange = (folderId: string) => {
    setActiveFolderId(folderId);
    setPage(0);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRead = async (msg: EmailMessage) => {
    try { await markAsRead(msg.id); } catch { }
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
  };

  const handleStar = async (msg: EmailMessage) => {
    try { await toggleStar(msg.id); } catch { }
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isStarred: !m.isStarred } : m));
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await deleteMessages(Array.from(selectedIds));
      setSelectedIds(new Set());
      fetchMessages();
    } catch { }
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const totalUnread = folders.reduce((sum, f) => sum + (f.unreadCount || 0), 0);

  return (
    <div className="h-full flex flex-col">
      <AdminPageHeader
        title={t("Email", "البريد الإلكتروني")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: "Email", href: "/admin/email" }, { label: "Inbox" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchMessages} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> {t("Refresh", "تحديث")}
            </Button>
            {selectedIds.size > 0 && (
              <>
                <span className="text-sm text-muted-foreground self-center">{selectedIds.size} {t("selected", "محدد")}</span>
                <Button variant="destructive" size="sm" onClick={handleDelete}>{t("Delete", "حذف")}</Button>
              </>
            )}
          </div>
        }
      />

      {error && (
        <Card className="border-red-200 bg-red-50/50 mb-4">
          <CardContent className="pt-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
        <Card className="w-56 shrink-0 hidden md:block">
          <CardContent className="p-2">
            <div className="space-y-1">
              {folders.filter((f) => systemFolders.includes(f.folderType)).map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleFolderChange(folder.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                    activeFolderId === folder.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                  }`}
                >
                  {folderIcons[folder.folderType] || <Mail className="h-4 w-4" />}
                  <span className="flex-1 capitalize">{folder.folderType.toLowerCase()}</span>
                  {(folder.unreadCount || 0) > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 min-w-[1.25rem] text-center">
                      {folder.unreadCount}
                    </Badge>
                  )}
                </button>
              ))}
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground px-3 py-1">
                {totalUnread} {t("unread across all folders", "غير مقروءة في جميع المجلدات")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-0">
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted rounded animate-shimmer" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>{t("No messages in", "لا توجد رسائل في")} {activeFolder?.folderType.toLowerCase() || t("this folder", "هذا المجلد")}</p>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer ${
                        !msg.isRead ? "bg-primary/5 font-medium" : ""
                      }`}
                      onClick={() => handleRead(msg)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(msg.id)}
                        onChange={() => toggleSelect(msg.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStar(msg); }}
                        className={`shrink-0 ${msg.isStarred ? "text-amber-400" : "text-muted-foreground hover:text-amber-400"}`}
                      >
                        <Star className="h-4 w-4" fill={msg.isStarred ? "currentColor" : "none"} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate">
                            {msg.senderName || msg.senderAddress || "Unknown"}
                          </span>
                          {!msg.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {msg.subject || "(no subject)"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 p-4 border-t">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{t("Page", "صفحة")} {page + 1} {t("of", "من")} {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
