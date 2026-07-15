"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendEmail, saveDraft, updateDraft, getMessage } from "@/lib/email";
import { ArrowLeft, Send, Save, X, Plus, Paperclip, Loader2, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface Recipient {
  type: "TO" | "CC" | "BCC";
  address: string;
}

export default function ComposePageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-soil-clay" /></div>}>
      <ComposePage />
    </Suspense>
  );
}

function ComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");
  const replyTo = searchParams.get("reply");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!draftId);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (draftId) {
      getMessage(draftId).then((res) => {
        if (res.data.success) {
          const msg = res.data.data;
          const toRecip = msg.recipients?.filter((r) => r.recipientType === "TO").map((r) => r.address).join(", ") || "";
          const ccRecip = msg.recipients?.filter((r) => r.recipientType === "CC").map((r) => r.address).join(", ") || "";
          const bccRecip = msg.recipients?.filter((r) => r.recipientType === "BCC").map((r) => r.address).join(", ") || "";
          setTo(toRecip);
          setCc(ccRecip);
          setBcc(bccRecip);
          setSubject(msg.subject || "");
          setBody(msg.bodyHtml || msg.bodyText || "");
          if (ccRecip) setShowCc(true);
          if (bccRecip) setShowBcc(true);
        }
      }).finally(() => setLoading(false));
    } else if (replyTo) {
      getMessage(replyTo).then((res) => {
        if (res.data.success) {
          const msg = res.data.data;
          setTo(msg.senderAddress);
          setSubject(`Re: ${msg.subject || ""}`);
          setBody(`\n\n\n-------- Original Message --------\nFrom: ${msg.senderName || msg.senderAddress}\nSubject: ${msg.subject}\nDate: ${msg.createdAt}\n\n${msg.bodyText || ""}`);
        }
      });
    }
  }, [draftId, replyTo]);

  const parseRecipients = (str: string): string[] => {
    return str.split(",").map((s) => s.trim()).filter(Boolean);
  };

  const handleSend = async () => {
    if (!to.trim()) return;
    setSending(true);
    try {
      const res = await sendEmail({
        subject: subject || "(No subject)",
        bodyHtml: body,
        bodyText: body,
        toRecipients: parseRecipients(to),
        ccRecipients: showCc ? parseRecipients(cc) : undefined,
        bccRecipients: showBcc ? parseRecipients(bcc) : undefined,
      });
      if (res.data.success) router.push("/email/sent");
    } catch {} finally { setSending(false); }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      if (draftId) {
        await updateDraft(draftId, {
          subject,
          bodyHtml: body,
          bodyText: body,
          toRecipients: parseRecipients(to),
          ccRecipients: showCc ? parseRecipients(cc) : undefined,
        });
      } else {
        await saveDraft({
          subject,
          bodyHtml: body,
          bodyText: body,
          toRecipients: parseRecipients(to),
          ccRecipients: showCc ? parseRecipients(cc) : undefined,
        });
      }
      router.push("/email/drafts");
    } catch {} finally { setSaving(false); }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments((prev) => [...prev, ...files]);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-soil-clay" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded"><ArrowLeft className="h-5 w-5 text-earth-gray" /></button>
          <h1 className="text-lg font-medium text-soil-dark">{draftId ? "Edit Draft" : replyTo ? "Reply" : "New Message"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button size="sm" onClick={handleSend} disabled={sending || !to.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
            Send
          </Button>
        </div>
      </div>

      {/* Compose form */}
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-gray-200">
          <div className="flex items-center px-4 py-2">
            <span className="text-sm text-earth-gray w-12">To:</span>
            <input type="text" value={to} onChange={(e) => setTo(e.target.value)}
              placeholder="recipients@example.com (comma-separated)"
              className="flex-1 px-2 py-1 text-sm focus:outline-none" />
            <button onClick={() => setShowCc(!showCc)} className="text-xs text-soil-clay hover:underline">CC</button>
            <button onClick={() => setShowBcc(!showBcc)} className="text-xs text-soil-clay hover:underline ml-2">BCC</button>
          </div>
          {showCc && (
            <div className="flex items-center px-4 py-2 border-t border-gray-100">
              <span className="text-sm text-earth-gray w-12">CC:</span>
              <input type="text" value={cc} onChange={(e) => setCc(e.target.value)}
                placeholder="cc@example.com"
                className="flex-1 px-2 py-1 text-sm focus:outline-none" />
            </div>
          )}
          {showBcc && (
            <div className="flex items-center px-4 py-2 border-t border-gray-100">
              <span className="text-sm text-earth-gray w-12">BCC:</span>
              <input type="text" value={bcc} onChange={(e) => setBcc(e.target.value)}
                placeholder="bcc@example.com"
                className="flex-1 px-2 py-1 text-sm focus:outline-none" />
            </div>
          )}
          <div className="flex items-center px-4 py-2 border-t border-gray-100">
            <span className="text-sm text-earth-gray w-12">Subject:</span>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="flex-1 px-2 py-1 text-sm focus:outline-none" />
          </div>
        </div>

        {/* Body editor */}
        <RichTextEditor value={body} onChange={setBody} placeholder="Write your message here..." minHeight="400px" />
      </div>

      {/* Footer / Attachments */}
      <div
        ref={dropzoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative px-4 py-2 border-t border-gray-200 bg-gray-50"
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-soil-dark/10 border-2 border-dashed border-soil-clay rounded">
            <div className="flex flex-col items-center gap-1 text-soil-clay">
              <Upload className="h-6 w-6" />
              <span className="text-sm font-medium">Drop files here</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-gray-200 rounded text-earth-gray"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {attachments.length === 0 && (
            <span className="text-xs text-earth-gray">Attach files or drag and drop here</span>
          )}

          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-earth-gray"
            >
              <FileText className="h-3 w-3" />
              <span className="max-w-[160px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="ml-1 p-0.5 hover:bg-gray-200 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
