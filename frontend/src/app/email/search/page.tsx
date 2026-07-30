"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMessages, getFolderByType, toggleStar, deleteMessages, markAsRead } from "@/lib/email";
import type { EmailMessage } from "@/types/email";
import {
  Search, Loader2, Mail, X, Star, Trash2, Paperclip,
  Clock, Reply, Forward, ArrowLeft, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";

type FilterChip = "all" | "unread" | "starred" | "attachments";

function fmtTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604_800_000) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");
  const [preview, setPreview] = useState<EmailMessage | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the search input on load
  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = useCallback(async (q: string, filter: FilterChip = "all") => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setPreview(null);
    try {
      // Search across all system folders
      const folders = ["INBOX", "SENT", "ARCHIVE"];
      const allMessages: EmailMessage[] = [];

      await Promise.all(
        folders.map(async (ft) => {
          try {
            const folderRes = await getFolderByType(ft);
            if (!folderRes.data.success) return;
            const msgRes = await getMessages(folderRes.data.data.id, 0, 100);
            if (msgRes.data.success) allMessages.push(...msgRes.data.data.content);
          } catch {}
        })
      );

      const ql = q.toLowerCase();
      let filtered = allMessages.filter(
        (m) =>
          (m.subject ?? "").toLowerCase().includes(ql) ||
          (m.senderName ?? "").toLowerCase().includes(ql) ||
          (m.senderAddress ?? "").toLowerCase().includes(ql) ||
          (m.previewText ?? "").toLowerCase().includes(ql) ||
          (m.bodyText ?? "").toLowerCase().includes(ql)
      );

      if (filter === "unread") filtered = filtered.filter((m) => !m.isRead);
      if (filter === "starred") filtered = filtered.filter((m) => m.isStarred);
      if (filter === "attachments") filtered = filtered.filter((m) => m.hasAttachments);

      // Deduplicate by id
      const seen = new Set<string>();
      const unique = filtered.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
      setResults(unique);
    } catch {} finally { setLoading(false); }
  }, []);

  // Re-run when URL ?q= changes
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) { setQuery(q); doSearch(q, activeFilter); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/email/search?q=${encodeURIComponent(query)}`);
    doSearch(query, activeFilter);
  };

  const handleFilterChange = (f: FilterChip) => {
    setActiveFilter(f);
    if (searched && query.trim()) doSearch(query, f);
  };

  const handleSelect = async (msg: EmailMessage) => {
    if (!msg.isRead) {
      await markAsRead(msg.id).catch(() => {});
      setResults((p) => p.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
    }
    setPreview(msg);
  };

  const handleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleStar(id).catch(() => {});
    setResults((p) => p.map((m) => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
    if (preview?.id === id) setPreview((p) => p ? { ...p, isStarred: !p.isStarred } : p);
  };

  const handleDelete = async () => {
    if (!preview) return;
    await deleteMessages([preview.id]).catch(() => {});
    setResults((p) => p.filter((m) => m.id !== preview.id));
    setPreview(null);
  };

  const chips: { key: FilterChip; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "starred", label: "Starred" },
    { key: "attachments", label: "Has Attachments" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-border bg-card space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-gray" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by subject, sender, or content…"
              className="w-full pl-9 pr-9 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-earth-gray hover:text-soil-dark" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={!query.trim() || loading} className="bg-soil-clay hover:bg-soil-dark text-white px-4">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-earth-gray flex-shrink-0" />
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => handleFilterChange(chip.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === chip.key
                  ? "bg-soil-clay text-white"
                  : "bg-muted text-earth-gray hover:bg-soil-sand/50"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results + preview pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Results list */}
        <div className={`overflow-y-auto ${preview ? "hidden md:block md:w-2/5" : "w-full"}`}>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-soil-clay" />
            </div>
          ) : !searched ? (
            <div className="flex flex-col items-center justify-center h-40 py-16 text-earth-gray">
              <Search className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-base font-medium text-soil-dark">Search your email</p>
              <p className="text-sm text-earth-gray mt-1">Enter a keyword and press Enter</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 py-16 text-earth-gray">
              <Mail className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-base font-medium text-soil-dark">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-earth-gray mt-1">Try different keywords or remove filters</p>
            </div>
          ) : (
            <>
              <p className="px-4 py-2 text-xs text-earth-gray border-b border-border">
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>
              {results.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={`group flex items-center gap-3 px-4 py-2.5 border-b border-border cursor-pointer transition-colors ${
                    !msg.isRead ? "bg-soil-clay/5 border-l-2 border-soil-clay font-semibold" : "hover:bg-muted/40"
                  } ${preview?.id === msg.id ? "bg-soil-sand/20 dark:bg-soil-clay/10" : ""}`}
                >
                  <button onClick={(e) => handleStar(msg.id, e)} className="shrink-0">
                    <Star className={`h-4 w-4 ${msg.isStarred ? "text-amber-400 fill-amber-400" : "text-muted-foreground group-hover:text-amber-300"}`} />
                  </button>
                  <span className="w-32 text-sm truncate flex-shrink-0 text-foreground">
                    {msg.senderName || msg.senderAddress || "Unknown"}
                  </span>
                  <span className="flex-1 text-sm truncate">
                    {msg.subject || "(No subject)"}
                    {msg.previewText && <span className="text-muted-foreground font-normal ml-2">— {msg.previewText}</span>}
                  </span>
                  {msg.hasAttachments && <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                  <span className="text-xs text-muted-foreground flex-shrink-0 w-16 text-right">
                    {msg.createdAt ? fmtTime(msg.createdAt) : ""}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Preview pane */}
        {preview && (
          <div className="flex flex-col w-full md:w-3/5 overflow-y-auto border-l border-border bg-card">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/20 shrink-0">
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setPreview(null)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push(`/email/compose?reply=${preview.id}`)}>
                <Reply className="h-3.5 w-3.5 mr-1" /> Reply
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push(`/email/compose?forward=${preview.id}`)}>
                <Forward className="h-3.5 w-3.5 mr-1" /> Forward
              </Button>
              <button onClick={(e) => handleStar(preview.id, e)} className="p-1.5 rounded hover:bg-muted transition-colors">
                <Star className={`h-4 w-4 ${preview.isStarred ? "text-amber-400 fill-amber-400" : "text-earth-gray"}`} />
              </button>
              <button onClick={handleDelete} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-earth-gray hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xl font-semibold text-soil-dark mb-3">{preview.subject || "(No subject)"}</h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-soil-dark text-soil-sand flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {(preview.senderName || preview.senderAddress || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-soil-dark text-sm">{preview.senderName || preview.senderAddress}</p>
                  <p className="text-xs text-earth-gray">{preview.senderAddress}</p>
                  {preview.recipients?.filter((r) => r.recipientType === "TO").length > 0 && (
                    <p className="text-xs text-earth-gray mt-0.5">
                      To: {preview.recipients.filter((r) => r.recipientType === "TO").map((r) => r.name || r.address).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-earth-gray flex-shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  {preview.createdAt ? new Date(preview.createdAt).toLocaleString() : ""}
                </div>
              </div>
            </div>

            <div className="flex-1 px-6 py-5 text-sm leading-relaxed">
              {preview.bodyHtml ? (
                <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: preview.bodyHtml }} />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-soil-dark">{preview.bodyText || "(No content)"}</pre>
              )}
            </div>

            {(preview.attachments?.length ?? 0) > 0 && (
              <div className="px-6 py-4 border-t border-border bg-muted/20 shrink-0">
                <p className="text-xs font-semibold text-earth-gray uppercase tracking-wider mb-3">Attachments ({preview.attachments.length})</p>
                <div className="flex flex-wrap gap-2">
                  {preview.attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 px-3 py-2 bg-card rounded-md border border-border text-sm">
                      <Paperclip className="h-3.5 w-3.5 text-earth-gray" />
                      <span className="text-soil-dark truncate max-w-[200px]">{att.filename}</span>
                      {att.sizeBytes > 0 && <span className="text-xs text-earth-gray">({(att.sizeBytes / 1024).toFixed(0)} KB)</span>}
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-soil-clay" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
