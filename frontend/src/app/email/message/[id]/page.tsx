"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getMessage, getThread, toggleStar, toggleFlag,
  deleteMessages, markAsRead
} from "@/lib/email";
import type { EmailMessage } from "@/types/email";
import {
  ArrowLeft, Star, Flag, Trash2, Reply, Forward,
  Paperclip, Loader2, Download, Printer, ChevronDown,
  ChevronUp, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

function MessageDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState<EmailMessage[]>([]);
  const [threadExpanded, setThreadExpanded] = useState(false);
  const [starState, setStarState] = useState(false);
  const [flagState, setFlagState] = useState(false);

  // Optional prev/next ids from URL for navigation
  const prevId = searchParams.get("prev");
  const nextId = searchParams.get("next");

  const loadMessage = useCallback(async (id: string) => {
    setLoading(true);
    setThread([]);
    setThreadExpanded(false);
    try {
      const res = await getMessage(id);
      if (res.data.success) {
        const msg = res.data.data;
        setMessage(msg);
        setStarState(msg.isStarred ?? false);
        setFlagState(msg.isFlagged ?? false);
        // Mark as read
        if (!msg.isRead) markAsRead(id).catch(() => {});
        // Load thread if applicable
        if (msg.threadId) {
          const tr = await getThread(msg.threadId).catch(() => null);
          if (tr?.data.success) {
            setThread(tr.data.data.filter((m) => m.id !== id));
          }
        }
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (params.id) loadMessage(params.id as string);
  }, [params.id, loadMessage]);

  // Keyboard shortcuts: R=reply, F=forward, D=delete, E=archive, P=print
  useEffect(() => {
    if (!message) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case "r": router.push(`/email/compose?reply=${message.id}`); break;
        case "f": router.push(`/email/compose?forward=${message.id}`); break;
        case "d": handleDelete(); break;
        case "p": window.print(); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const handleDelete = async () => {
    if (!message) return;
    await deleteMessages([message.id]).catch(() => {});
    router.back();
  };

  const handleToggleStar = async () => {
    if (!message) return;
    await toggleStar(message.id).catch(() => {});
    setStarState((s) => !s);
  };

  const handleToggleFlag = async () => {
    if (!message) return;
    await toggleFlag(message.id).catch(() => {});
    setFlagState((s) => !s);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-soil-clay" />
      </div>
    );
  }

  if (!message) {
    return <div className="p-8 text-center text-earth-gray">Message not found</div>;
  }

  const toRecip = message.recipients?.filter((r) => r.recipientType === "TO") || [];
  const ccRecip = message.recipients?.filter((r) => r.recipientType === "CC") || [];

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Back (Backspace)"
          >
            <ArrowLeft className="h-4 w-4 text-earth-gray" />
          </button>
          <button
            onClick={handleToggleStar}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Star"
          >
            <Star className={`h-4 w-4 transition-colors ${starState ? "text-amber-400 fill-amber-400" : "text-earth-gray"}`} />
          </button>
          <button
            onClick={handleToggleFlag}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Flag"
          >
            <Flag className={`h-4 w-4 transition-colors ${flagState ? "text-red-500 fill-red-500" : "text-earth-gray"}`} />
          </button>
          <button
            onClick={() => window.print()}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Print (P)"
          >
            <Printer className="h-4 w-4 text-earth-gray" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Prev/Next nav — only shown when provided via URL */}
          {prevId && (
            <Button variant="ghost" size="sm" onClick={() => router.push(`/email/message/${prevId}`)} title="Previous message">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {nextId && (
            <Button variant="ghost" size="sm" onClick={() => router.push(`/email/message/${nextId}`)} title="Next message">
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost" size="sm"
            onClick={() => router.push(`/email/compose?reply=${message.id}`)}
            title="Reply (R)"
          >
            <Reply className="h-4 w-4 mr-1" /> Reply
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={() => router.push(`/email/compose?forward=${message.id}`)}
            title="Forward (F)"
          >
            <Forward className="h-4 w-4 mr-1" /> Forward
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600"
            title="Delete (D)"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="px-6 py-1 bg-muted/30 border-b border-border">
        <p className="text-xs text-earth-gray">
          Shortcuts: <kbd className="px-1 py-0.5 bg-muted rounded text-xs">R</kbd> Reply &nbsp;
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">F</kbd> Forward &nbsp;
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">D</kbd> Delete &nbsp;
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">P</kbd> Print
        </p>
      </div>

      {/* Message header */}
      <div className="px-6 py-5 border-b border-border shrink-0">
        <h1 className="text-xl font-semibold text-soil-dark mb-4">{message.subject || "(No subject)"}</h1>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-soil-dark text-soil-sand flex items-center justify-center font-semibold text-base flex-shrink-0">
            {(message.senderName || message.senderAddress || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 space-y-0.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-soil-dark">{message.senderName || message.senderAddress}</span>
              {message.senderName && <span className="text-earth-gray text-xs">&lt;{message.senderAddress}&gt;</span>}
            </div>
            <div className="text-earth-gray text-xs">
              <span className="font-medium text-soil-dark/70">To: </span>
              {toRecip.map((r) => r.name || r.address).join(", ")}
            </div>
            {ccRecip.length > 0 && (
              <div className="text-earth-gray text-xs">
                <span className="font-medium text-soil-dark/70">CC: </span>
                {ccRecip.map((r) => r.name || r.address).join(", ")}
              </div>
            )}
            <div className="text-earth-gray text-xs">
              {message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Message body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 print:overflow-visible">
        {message.bodyHtml ? (
          <div className="prose max-w-none text-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />
        ) : (
          <pre className="text-sm text-soil-dark whitespace-pre-wrap font-sans leading-relaxed">{message.bodyText || "(No content)"}</pre>
        )}
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="border-t border-border px-6 py-4 shrink-0 bg-muted/20">
          <p className="text-xs text-earth-gray font-semibold uppercase tracking-wider mb-3">
            Attachments ({message.attachments.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 px-3 py-2 bg-card rounded-md border border-border">
                <Paperclip className="h-3.5 w-3.5 text-earth-gray flex-shrink-0" />
                <span className="text-sm text-soil-dark truncate max-w-[200px]">{att.filename}</span>
                {att.sizeBytes > 0 && <span className="text-xs text-earth-gray">({(att.sizeBytes / 1024).toFixed(0)} KB)</span>}
                <Download className="h-3.5 w-3.5 text-soil-clay cursor-pointer hover:text-soil-dark transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thread expander */}
      {thread.length > 0 && (
        <div className="border-t border-border shrink-0">
          <button
            onClick={() => setThreadExpanded((e) => !e)}
            className="flex items-center gap-2 w-full px-6 py-3 text-sm text-earth-gray hover:bg-muted/30 transition-colors"
          >
            {threadExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {threadExpanded ? "Collapse" : `Show ${thread.length} more message${thread.length !== 1 ? "s" : ""} in thread`}
          </button>

          {threadExpanded && (
            <div className="border-t border-border divide-y divide-border max-h-96 overflow-y-auto">
              {thread.map((msg) => (
                <div key={msg.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-soil-clay/20 text-soil-clay flex items-center justify-center text-xs font-semibold">
                        {(msg.senderName || msg.senderAddress || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-soil-dark">{msg.senderName || msg.senderAddress}</span>
                    </div>
                    <span className="text-xs text-earth-gray">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}</span>
                  </div>
                  <p className="text-sm text-soil-dark/80 line-clamp-3">
                    {msg.previewText || msg.bodyText?.slice(0, 200) || "(No content)"}
                  </p>
                  <button
                    onClick={() => router.push(`/email/message/${msg.id}`)}
                    className="text-xs text-soil-clay hover:underline mt-1"
                  >
                    View full message →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-soil-clay" />
      </div>
    }>
      <MessageDetailContent />
    </Suspense>
  );
}
