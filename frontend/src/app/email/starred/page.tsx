"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStarredMessages, toggleStar, deleteMessages, markAsRead } from "@/lib/email";
import type { EmailMessage } from "@/types/email";
import { Star, Trash2, RefreshCw, ChevronLeft, ChevronRight, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 20;

export default function StarredPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStarredMessages(page, ITEMS_PER_PAGE);
      if (res.data.success) {
        setMessages(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    await deleteMessages(Array.from(selectedIds));
    setSelectedIds(new Set());
    fetchMessages();
  };

  const handleStar = async (id: string) => {
    await toggleStar(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleOpen = (msg: EmailMessage) => {
    if (!msg.isRead) markAsRead(msg.id);
    router.push(`/email/message/${msg.id}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /> Starred</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchMessages}><RefreshCw className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={selectedIds.size === 0}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground"><Mail className="h-12 w-12 mb-2 opacity-20" /><p>No starred messages</p></div>
      ) : (
        <div className="flex-1 overflow-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer hover:bg-accent/50 ${!msg.isRead ? "font-semibold bg-accent/20" : ""}`} onClick={() => handleOpen(msg)}>
              <input type="checkbox" checked={selectedIds.has(msg.id)} onChange={() => toggleSelect(msg.id)} onClick={(e) => e.stopPropagation()} className="shrink-0" />
              <Star className="h-4 w-4 shrink-0 text-yellow-500 fill-yellow-500" onClick={(e) => { e.stopPropagation(); handleStar(msg.id); }} />
              <span className="w-40 truncate text-sm">{msg.senderName || msg.senderAddress}</span>
              <span className="flex-1 truncate text-sm">{msg.subject || "(no subject)"}</span>
              {msg.hasAttachments && <span className="text-xs text-muted-foreground">📎</span>}
              <span className="text-xs text-muted-foreground shrink-0">{new Date(msg.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
