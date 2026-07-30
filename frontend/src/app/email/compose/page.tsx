"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { sendEmail, saveDraft, updateDraft, getMessage, autocompleteContacts } from "@/lib/email";
import type { EmailContact } from "@/types/email";
import {
  ArrowLeft, Send, X, Paperclip, Loader2, Upload,
  FileText, ChevronDown, Calendar, Bold, Italic,
  Underline, Link2, List, AlignLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/editor/RichTextEditor";

/* ── Recipient tag-chip input ──────────────────────────────────── */
function RecipientInput({
  label, values, onChange,
}: {
  label: string; values: string[]; onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<EmailContact[]>([]);
  const [showSug, setShowSug] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapRef = useRef<HTMLDivElement>(null);

  const addAddress = (addr: string) => {
    const clean = addr.trim().replace(/,+$/, "");
    if (clean && !values.includes(clean)) onChange([...values, clean]);
    setInput(""); setSuggestions([]); setShowSug(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) { e.preventDefault(); addAddress(input); }
    else if (e.key === "Backspace" && !input && values.length > 0) onChange(values.slice(0, -1));
    else if (e.key === "Escape") setShowSug(false);
    else if (e.key === "Tab" && input.trim()) { e.preventDefault(); addAddress(input); }
  };

  const handleInput = (v: string) => {
    setInput(v);
    clearTimeout(debounceRef.current);
    if (v.length >= 2) {
      debounceRef.current = setTimeout(() => {
        autocompleteContacts(v).then((r) => {
          if (r.data.success) { setSuggestions(r.data.data ?? []); setShowSug(true); }
        }).catch(() => {});
      }, 250);
    } else { setSuggestions([]); setShowSug(false); }
  };

  return (
    <div className="flex items-start gap-2 px-4 py-2.5 border-b border-border relative" ref={wrapRef}>
      <span className="text-xs font-semibold text-muted-foreground w-8 pt-1.5 shrink-0 uppercase tracking-wider">{label}</span>
      <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 items-center">
        {values.map((addr) => (
          <motion.span
            key={addr}
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-soil-clay/10 text-soil-clay rounded-full text-xs font-medium border border-soil-clay/20"
          >
            {addr}
            <button type="button" onClick={() => onChange(values.filter((a) => a !== addr))} className="hover:text-red-500 transition-colors ml-0.5">
              <X className="h-3 w-3" />
            </button>
          </motion.span>
        ))}
        <input
          type="text" value={input}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) addAddress(input); setTimeout(() => setShowSug(false), 150); }}
          placeholder={values.length === 0 ? `Add ${label.toLowerCase()}…` : ""}
          className="flex-1 min-w-[120px] text-sm focus:outline-none bg-transparent py-0.5"
        />
      </div>
      <AnimatePresence>
        {showSug && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-12 z-30 bg-card border border-border rounded-xl shadow-lg min-w-[260px] py-1.5 max-h-56 overflow-y-auto"
          >
            {suggestions.map((c) => (
              <button
                key={c.id} type="button"
                onMouseDown={(e) => { e.preventDefault(); addAddress(c.email); }}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-soil-clay/20 text-soil-clay flex items-center justify-center text-xs font-semibold shrink-0">
                  {(c.displayName || c.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.displayName || `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Priority badge ────────────────────────────────────────────── */
const PRIORITY_OPTS = [
  { value: "NORMAL", label: "Normal priority",  dot: "bg-gray-400" },
  { value: "HIGH",   label: "High priority",    dot: "bg-red-500" },
  { value: "LOW",    label: "Low priority",     dot: "bg-blue-400" },
] as const;

/* ══════════════════════════════════════════════════════════════════ */
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
  const draftId   = searchParams.get("draft");
  const replyTo   = searchParams.get("reply");
  const forwardId = searchParams.get("forward");
  const initTo    = searchParams.get("to");

  const [toList,   setToList]   = useState<string[]>(initTo ? [initTo] : []);
  const [ccList,   setCcList]   = useState<string[]>([]);
  const [bccList,  setBccList]  = useState<string[]>([]);
  const [subject,  setSubject]  = useState("");
  const [body,     setBody]     = useState("");
  const [showCc,   setShowCc]   = useState(false);
  const [showBcc,  setShowBcc]  = useState(false);
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "LOW">("NORMAL");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt]         = useState("");
  const [sending,  setSending]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(!!(draftId || replyTo || forwardId));
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging,  setIsDragging]  = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [sendSuccess,  setSendSuccess]  = useState(false);

  const dropRef    = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);

  /* ── Load context message ─────────────────────────────────── */
  useEffect(() => {
    const id = draftId || replyTo || forwardId;
    if (!id) return;
    getMessage(id).then((res) => {
      if (!res.data.success) return;
      const msg = res.data.data;
      if (draftId) {
        setToList(msg.recipients?.filter((r) => r.recipientType === "TO").map((r) => r.address) ?? []);
        setCcList(msg.recipients?.filter((r) => r.recipientType === "CC").map((r) => r.address) ?? []);
        setBccList(msg.recipients?.filter((r) => r.recipientType === "BCC").map((r) => r.address) ?? []);
        setSubject(msg.subject || "");
        setBody(msg.bodyHtml || msg.bodyText || "");
        if (msg.recipients?.some((r) => r.recipientType === "CC")) setShowCc(true);
        if (msg.recipients?.some((r) => r.recipientType === "BCC")) setShowBcc(true);
      } else if (replyTo) {
        setToList([msg.senderAddress]);
        setSubject(msg.subject?.startsWith("Re:") ? msg.subject : `Re: ${msg.subject || ""}`);
        setBody(`\n\n\n— ${msg.senderName || msg.senderAddress} wrote on ${msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""} —\n${msg.bodyText || ""}`);
      } else if (forwardId) {
        setSubject(msg.subject?.startsWith("Fwd:") ? msg.subject : `Fwd: ${msg.subject || ""}`);
        setBody(`\n\n\n— Forwarded from ${msg.senderName || msg.senderAddress} on ${msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""} —\n${msg.bodyText || ""}`);
      }
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Send ─────────────────────────────────────────────────── */
  const handleSend = async () => {
    if (!toList.length) return;
    setSending(true);
    try {
      await sendEmail({
        subject: subject || "(No subject)",
        bodyHtml: body, bodyText: body,
        toRecipients: toList,
        ccRecipients:  showCc  && ccList.length  ? ccList  : undefined,
        bccRecipients: showBcc && bccList.length ? bccList : undefined,
        priority,
      });
      setSendSuccess(true);
      setTimeout(() => router.push("/email/sent"), 900);
    } catch { setSending(false); }
  };

  /* ── Save draft ───────────────────────────────────────────── */
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = { subject, bodyHtml: body, bodyText: body, toRecipients: toList, ccRecipients: showCc && ccList.length ? ccList : undefined };
      if (draftId) await updateDraft(draftId, payload);
      else await saveDraft(payload);
      router.push("/email/drafts");
    } catch { } finally { setSaving(false); }
  };

  /* ── Drag & drop ──────────────────────────────────────────── */
  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }, []);
  const handleDrop      = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); setAttachments((p) => [...p, ...Array.from(e.dataTransfer.files)]); }, []);
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) setAttachments((p) => [...p, ...Array.from(e.target.files!)]); }, []);

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-soil-clay" /></div>;

  const titleLabel = draftId ? "Edit Draft" : replyTo ? "Reply" : forwardId ? "Forward" : "New Message";
  const priorityMeta = PRIORITY_OPTS.find((p) => p.value === priority)!;

  /* ── Success overlay ──────────────────────────────────────── */
  if (sendSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <Send className="h-7 w-7 text-emerald-600" />
        </motion.div>
        <p className="text-lg font-semibold text-foreground">Message sent!</p>
        <p className="text-sm text-muted-foreground">Redirecting to sent folder…</p>
      </div>
    );
  }

  return (
    <div
      ref={dropRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      className="flex flex-col h-full bg-card relative"
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-soil-dark/10 border-2 border-dashed border-soil-clay rounded-xl"
          >
            <div className="flex flex-col items-center gap-2 text-soil-clay">
              <Upload className="h-8 w-8" />
              <span className="text-base font-semibold">Drop files to attach</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">{titleLabel}</h1>
            {replyTo && <p className="text-xs text-muted-foreground">In reply to a message</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Priority selector */}
          <div className="relative">
            <button
              onClick={() => setShowPriority(!showPriority)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${priorityMeta.dot}`} />
              <span className="hidden sm:inline">{priorityMeta.label}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showPriority && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg min-w-[180px] py-1.5"
                >
                  {PRIORITY_OPTS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setPriority(opt.value); setShowPriority(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors ${priority === opt.value ? "text-soil-clay" : ""}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Save draft */}
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={saving} className="text-xs">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
            {saving ? "Saving…" : "Save draft"}
          </Button>

          {/* Send */}
          <Button
            size="sm" onClick={handleSend}
            disabled={sending || !toList.length}
            className="bg-soil-clay hover:bg-soil-dark text-white text-xs"
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>

      {/* ── Compose fields ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <RecipientInput label="To" values={toList} onChange={setToList} />

        {/* CC / BCC toggles */}
        {!showCc && !showBcc && (
          <div className="flex gap-3 px-4 py-1.5 border-b border-border bg-muted/10">
            <button onClick={() => setShowCc(true)} className="text-xs text-soil-clay hover:text-soil-dark transition-colors font-medium">+ CC</button>
            <button onClick={() => setShowBcc(true)} className="text-xs text-soil-clay hover:text-soil-dark transition-colors font-medium">+ BCC</button>
          </div>
        )}
        {showCc  && <RecipientInput label="CC"  values={ccList}  onChange={setCcList}  />}
        {showBcc && <RecipientInput label="BCC" values={bccList} onChange={setBccList} />}

        {/* Subject */}
        <div className="flex items-center px-4 py-3 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground w-8 shrink-0 uppercase tracking-wider">Subj</span>
          <input
            ref={subjectRef} type="text" value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="flex-1 ml-2 text-sm font-medium focus:outline-none bg-transparent placeholder:text-muted-foreground/50"
          />
          {subject.length > 0 && (
            <span className="text-xs text-muted-foreground ml-2 shrink-0">{subject.length}</span>
          )}
        </div>

        {/* Schedule send */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/10">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer group">
            <div
              onClick={() => setScheduleEnabled((e) => !e)}
              className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 ${scheduleEnabled ? "bg-soil-clay" : "bg-border"}`}
            >
              <div className={`w-3 h-3 m-0.5 bg-white rounded-full shadow transition-transform ${scheduleEnabled ? "translate-x-4" : ""}`} />
            </div>
            <Calendar className="h-3.5 w-3.5" />
            Schedule send
          </label>
          <AnimatePresence>
            {scheduleEnabled && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}>
                <input
                  type="datetime-local" value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="text-xs border border-border rounded-lg px-2.5 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-soil-clay"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-[300px]">
          <RichTextEditor value={body} onChange={setBody} placeholder="Write your message…" minHeight="300px" />
        </div>
      </div>

      {/* ── Footer / attachments ────────────────────────────────── */}
      <div className="px-4 py-2.5 border-t border-border bg-card shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileSelect} />

          {attachments.length === 0 ? (
            <span className="text-xs text-muted-foreground">Attach files or drag & drop</span>
          ) : (
            <span className="text-xs text-soil-clay font-medium">{attachments.length} file{attachments.length !== 1 ? "s" : ""} attached</span>
          )}

          {attachments.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center gap-1 px-2.5 py-1 bg-muted rounded-lg border border-border text-xs">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="max-w-[140px] truncate">{file.name}</span>
              <span className="text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
              <button type="button" onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))} className="ml-1 hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
