"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getThread, markAsRead } from "@/lib/email";
import type { EmailMessage } from "@/types/email";
import { ArrowLeft, Loader2, Mail, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getThread(id)
      .then((res) => { if (res.data.success) { setMessages(res.data.data); res.data.data.forEach((m) => { if (!m.isRead) markAsRead(m.id); }); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h2 className="text-lg font-semibold">Conversation</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground"><Mail className="h-12 w-12 mb-2 opacity-20" /><p>No messages in this thread</p></div>
      ) : (
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{msg.senderName || msg.senderAddress}</span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-sm font-medium mb-2">{msg.subject}</div>
              {msg.bodyHtml ? (
                <div className="text-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: msg.bodyHtml }} />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.bodyText || "(no content)"}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
