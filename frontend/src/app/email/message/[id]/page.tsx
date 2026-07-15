"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMessage, toggleStar, toggleFlag, deleteMessages, replyToMessage } from "@/lib/email";
import type { EmailMessage } from "@/types/email";
import { ArrowLeft, Star, Flag, Trash2, Reply, ReplyAll, Forward, Paperclip, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      getMessage(params.id as string)
        .then((res) => { if (res.data.success) setMessage(res.data.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!message) return;
    await deleteMessages([message.id]);
    router.push("/email/inbox");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-soil-clay" /></div>;
  }

  if (!message) {
    return <div className="p-8 text-center text-earth-gray">Message not found</div>;
  }

  const toRecip = message.recipients?.filter((r) => r.recipientType === "TO") || [];
  const ccRecip = message.recipients?.filter((r) => r.recipientType === "CC") || [];

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded"><ArrowLeft className="h-5 w-5 text-earth-gray" /></button>
          <button onClick={() => toggleStar(message.id)} className="p-1 hover:bg-gray-100 rounded">
            <Star className={`h-4 w-4 ${message.isStarred ? "text-yellow-400 fill-yellow-400" : "text-earth-gray"}`} />
          </button>
          <button onClick={() => toggleFlag(message.id)} className="p-1 hover:bg-gray-100 rounded">
            <Flag className={`h-4 w-4 ${message.isFlagged ? "text-red-500 fill-red-500" : "text-earth-gray"}`} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/email/compose?reply=${message.id}`)}>
            <Reply className="h-4 w-4 mr-1" /> Reply
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Message header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-soil-dark mb-4">{message.subject || "(No subject)"}</h1>
        <div className="space-y-1 text-sm">
          <div className="flex">
            <span className="text-earth-gray w-16">From:</span>
            <span className="text-soil-dark">{message.senderName || message.senderAddress}</span>
            {message.senderName && <span className="text-earth-gray ml-1">&lt;{message.senderAddress}&gt;</span>}
          </div>
          <div className="flex">
            <span className="text-earth-gray w-16">To:</span>
            <span className="text-soil-dark">{toRecip.map((r) => r.name || r.address).join(", ")}</span>
          </div>
          {ccRecip.length > 0 && (
            <div className="flex">
              <span className="text-earth-gray w-16">CC:</span>
              <span className="text-soil-dark">{ccRecip.map((r) => r.name || r.address).join(", ")}</span>
            </div>
          )}
          <div className="flex">
            <span className="text-earth-gray w-16">Date:</span>
            <span className="text-soil-dark">{message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}</span>
          </div>
        </div>
      </div>

      {/* Message body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {message.bodyHtml ? (
          <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />
        ) : (
          <pre className="text-sm text-soil-dark whitespace-pre-wrap font-sans">{message.bodyText}</pre>
        )}
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-3">
          <p className="text-xs text-earth-gray font-medium mb-2 uppercase tracking-wider">Attachments ({message.attachments.length})</p>
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                <Paperclip className="h-3.5 w-3.5 text-earth-gray" />
                <span className="text-sm text-soil-dark truncate max-w-[200px]">{att.filename}</span>
                <span className="text-xs text-earth-gray">({(att.sizeBytes / 1024).toFixed(0)} KB)</span>
                <Download className="h-3.5 w-3.5 text-soil-clay cursor-pointer hover:text-soil-dark" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
