"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMessages, getFolderByType, deleteMessages, toggleStar, markAsRead } from "@/lib/email";
import type { EmailMessage, EmailFolder } from "@/types/email";
import { Inbox, Search, Star, Trash2, RefreshCw, ChevronLeft, ChevronRight, Paperclip, Loader2, ArrowLeft, Download, Clock, User, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/use-media-query";

const ITEMS_PER_PAGE = 20;

export default function InboxPage() {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [folder, setFolder] = useState<EmailFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [previewMessage, setPreviewMessage] = useState<EmailMessage | null>(null);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const [touchStartX, setTouchStartX] = useState(0);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipedLeftIds, setSwipedLeftIds] = useState<Set<string>>(new Set());
  const swipedRef = useRef(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const folderRes = await getFolderByType("INBOX");
      if (!folderRes.data.success) return;
      setFolder(folderRes.data.data);
      const msgRes = await getMessages(folderRes.data.data.id, page, ITEMS_PER_PAGE);
      if (msgRes.data.success) {
        setMessages(msgRes.data.data.content);
        setTotalPages(msgRes.data.data.totalPages);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    fetchMessages();
  };

  const handleSelect = async (msg: EmailMessage) => {
    if (!msg.isRead) {
      await markAsRead(msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    }
    setPreviewMessage(msg);
  };

  const handleSwipeDelete = async (id: string) => {
    await deleteMessages([id]);
    setSwipedLeftIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    fetchMessages();
  };

  const handleSwipeArchive = async (id: string) => {
    await markAsRead(id);
    setSwipedLeftIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    fetchMessages();
  };

  const handleTouchStart = (id: string) => (e: React.TouchEvent) => {
    if (!isMobile) return;
    swipedRef.current = false;
    setTouchStartX(e.touches[0].clientX);
    setSwipingId(id);
    setSwipeOffset(swipedLeftIds.has(id) ? 120 : 0);
  };

  const handleTouchMove = (id: string) => (e: React.TouchEvent) => {
    if (!isMobile || swipingId !== id) return;
    swipedRef.current = true;
    const diff = touchStartX - e.touches[0].clientX;
    const baseOffset = swipedLeftIds.has(id) ? 120 : 0;
    setSwipeOffset(Math.max(-30, Math.min(baseOffset + diff, 200)));
  };

  const handleTouchEnd = (id: string) => () => {
    if (!isMobile || swipingId !== id) return;
    const wasRevealed = swipedLeftIds.has(id);
    const netSwipe = swipeOffset - (wasRevealed ? 120 : 0);
    if (wasRevealed) {
      if (netSwipe < -30) {
        setSwipedLeftIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      }
    } else {
      if (swipeOffset > 100) {
        setSwipedLeftIds(prev => new Set(prev).add(id));
      } else if (swipeOffset < -30) {
        markAsRead(id);
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      }
    }
    setSwipingId(null);
    setSwipeOffset(0);
  };

  const filtered = searchQuery
    ? messages.filter((m) =>
        (m.subject ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.senderName ?? m.senderAddress ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
        {previewMessage && (
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setPreviewMessage(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-gray" />
          <input
            type="text"
            placeholder="Search inbox..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={fetchMessages}><RefreshCw className="h-4 w-4" /></Button>
        {selectedIds.size > 0 && (
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500">
            <Trash2 className="h-4 w-4 mr-1" /> Delete ({selectedIds.size})
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1 text-sm text-earth-gray">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>{page + 1} / {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Message list */}
        <div className={`overflow-y-auto ${previewMessage ? "hidden md:block md:w-1/2 lg:w-2/5" : "w-full"}`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-soil-clay" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-earth-gray">
              <Inbox className="h-12 w-12 mb-3 text-soil-sand" />
              <p className="text-lg font-medium">No messages</p>
              <p className="text-sm">Your inbox is empty</p>
            </div>
          ) : (
            filtered.map((msg) => (
              <div key={msg.id} className="relative overflow-hidden">
                {isMobile && swipedLeftIds.has(msg.id) && (
                  <div className="absolute inset-y-0 right-0 flex items-stretch">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSwipeDelete(msg.id); }}
                      className="px-5 bg-red-500 text-white text-xs font-medium flex items-center gap-1 hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSwipeArchive(msg.id); }}
                      className="px-5 bg-blue-500 text-white text-xs font-medium flex items-center gap-1 hover:bg-blue-600 transition-colors"
                    >
                      <Archive className="h-4 w-4" /> Archive
                    </button>
                  </div>
                )}
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !msg.isRead ? "bg-blue-50/50 font-medium" : ""
                  } ${previewMessage?.id === msg.id ? "bg-soil-sand/30" : ""}`}
                  style={{
                    transform: swipingId === msg.id
                      ? `translateX(${-swipeOffset}px)`
                      : swipedLeftIds.has(msg.id)
                        ? "translateX(-120px)"
                        : "",
                    transition: swipingId === msg.id ? "none" : "transform 0.2s ease",
                  }}
                  onClick={() => { if (swipedRef.current) { swipedRef.current = false; return; } handleSelect(msg); }}
                  onTouchStart={handleTouchStart(msg.id)}
                  onTouchMove={handleTouchMove(msg.id)}
                  onTouchEnd={handleTouchEnd(msg.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(msg.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(msg.id); }}
                    className="rounded border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStar(msg.id); }}
                    className="flex-shrink-0"
                  >
                    <Star className={`h-4 w-4 ${msg.isStarred ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                  </button>
                  <span className="w-36 text-sm truncate flex-shrink-0">{msg.senderName || msg.senderAddress}</span>
                  <span className="flex-1 text-sm truncate">
                    {msg.subject || "(No subject)"}
                    {msg.previewText && <span className="text-earth-gray ml-2 font-normal">– {msg.previewText}</span>}
                  </span>
                  {msg.hasAttachments && <Paperclip className="h-3.5 w-3.5 text-earth-gray flex-shrink-0" />}
                  <span className="text-xs text-earth-gray flex-shrink-0 w-16 text-right">
                    {msg.createdAt ? formatTimezone(msg.createdAt) : ""}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preview pane */}
        {previewMessage && (
          <div className="flex flex-col w-full md:w-1/2 lg:w-3/5 overflow-y-auto border-l border-border bg-white">
            {/* Mobile back button */}
            <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
              <Button variant="ghost" size="sm" onClick={() => setPreviewMessage(null)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </div>

            {/* Sender & subject header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-soil-dark mb-3">
                {previewMessage.subject || "(No subject)"}
              </h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-soil-dark text-soil-sand flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {(previewMessage.senderName || previewMessage.senderAddress || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-soil-dark text-sm">
                    {previewMessage.senderName || previewMessage.senderAddress}
                  </p>
                  <p className="text-xs text-earth-gray">{previewMessage.senderAddress}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-earth-gray flex-shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{previewMessage.createdAt ? formatTimezone(previewMessage.createdAt) : ""}</span>
                </div>
              </div>
            </div>

            {/* Message body */}
            <div className="flex-1 px-6 py-5 text-sm text-soil-dark leading-relaxed">
              {previewMessage.bodyHtml ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewMessage.bodyHtml }} />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-soil-dark leading-relaxed">
                  {previewMessage.bodyText || "(No content)"}
                </pre>
              )}
            </div>

            {/* Attachments */}
            {previewMessage.attachments && previewMessage.attachments.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-earth-gray uppercase tracking-wider mb-3">
                  Attachments ({previewMessage.attachments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {previewMessage.attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-md border border-gray-200 text-sm">
                      <Paperclip className="h-3.5 w-3.5 text-earth-gray" />
                      <span className="text-soil-dark truncate max-w-[200px]">{att.filename}</span>
                      <span className="text-xs text-earth-gray">
                        {att.sizeBytes ? `${(att.sizeBytes / 1024).toFixed(0)} KB` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimezone(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}
