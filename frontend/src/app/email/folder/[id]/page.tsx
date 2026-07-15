"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMessages, getFolderByType, getFolders } from "@/lib/email";
import type { EmailMessage, EmailFolder } from "@/types/email";
import { Folder, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 20;

export default function CustomFolderPage() {
  const params = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [folder, setFolder] = useState<EmailFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetch = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const foldersRes = await getFolders();
      if (foldersRes.data.success) {
        const found = foldersRes.data.data.find((f) => f.id === params.id);
        if (found) setFolder(found);
      }
      const msgRes = await getMessages(params.id as string, page, ITEMS_PER_PAGE);
      if (msgRes.data.success) {
        setMessages(msgRes.data.data.content);
        setTotalPages(msgRes.data.data.totalPages);
      }
    } catch {} finally { setLoading(false); }
  }, [params.id, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = searchQuery
    ? messages.filter((m) => (m.subject ?? "").toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-soil-clay" />
          <h1 className="text-sm font-medium text-soil-dark">{folder?.name || "Folder"}</h1>
        </div>
        <div className="relative flex-1 max-w-md ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-gray" />
          <input type="text" placeholder="Search folder..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay" />
        </div>
        <div className="ml-auto flex items-center gap-1 text-sm text-earth-gray">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span>{page + 1} / {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-soil-clay" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-earth-gray">
            <Folder className="h-12 w-12 mb-3 text-soil-sand" />
            <p className="text-lg font-medium">No messages</p>
            <p className="text-sm">This folder is empty</p>
          </div>
        ) : (
          filtered.map((msg) => (
            <div key={msg.id}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => router.push(`/email/message/${msg.id}`)}>
              <span className="w-36 text-sm truncate flex-shrink-0">{msg.senderName || msg.senderAddress}</span>
              <span className="flex-1 text-sm truncate">{msg.subject || "(No subject)"}</span>
              <span className="text-xs text-earth-gray flex-shrink-0 w-16 text-right">{msg.createdAt ? formatTimezone(msg.createdAt) : ""}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTimezone(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}
