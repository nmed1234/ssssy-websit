"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMessages, getFolderByType, markAsRead } from "@/lib/email";
import type { EmailMessage } from "@/types/email";
import { Search, Loader2, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const folderRes = await getFolderByType("INBOX");
      if (!folderRes.data.success) return;
      const msgRes = await getMessages(folderRes.data.data.id, 0, 50);
      if (msgRes.data.success) {
        const all = msgRes.data.data.content;
        const ql = q.toLowerCase();
        setResults(all.filter((m) =>
          (m.subject ?? "").toLowerCase().includes(ql) ||
          (m.senderName ?? "").toLowerCase().includes(ql) ||
          (m.senderAddress ?? "").toLowerCase().includes(ql) ||
          (m.bodyText ?? "").toLowerCase().includes(ql)
        ));
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) doSearch(q);
  }, [searchParams, doSearch]);

  const handleSearch = () => {
    router.push(`/email/search?q=${encodeURIComponent(query)}`);
    doSearch(query);
  };

  const handleOpen = (msg: EmailMessage) => {
    if (!msg.isRead) markAsRead(msg.id);
    router.push(`/email/message/${msg.id}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Search Email</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Search by subject, sender, or content..." className="pl-9" />
            {query && <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => setQuery("")} />}
          </div>
          <Button onClick={handleSearch} disabled={!query.trim() || loading}><Search className="h-4 w-4 mr-1" /> Search</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !searched ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground"><p>Enter a search term to find emails</p></div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground"><Mail className="h-12 w-12 mb-2 opacity-20" /><p>No results found for &quot;{query}&quot;</p></div>
        ) : (
          <div>
            <p className="px-4 py-2 text-sm text-muted-foreground border-b">{results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;</p>
            {results.map((msg) => (
              <div key={msg.id} className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer hover:bg-accent/50 ${!msg.isRead ? "font-semibold bg-accent/20" : ""}`} onClick={() => handleOpen(msg)}>
                <span className="w-40 truncate text-sm">{msg.senderName || msg.senderAddress}</span>
                <span className="flex-1 truncate text-sm">{msg.subject || "(no subject)"}</span>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(msg.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
