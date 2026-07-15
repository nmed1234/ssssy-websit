"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getScheduledSends, deleteScheduledSend } from "@/lib/email";
import { Calendar, Clock, Trash2, Loader2, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 20;

export default function ScheduledPage() {
  const router = useRouter();
  const [sends, setSends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchScheduled = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getScheduledSends(page, ITEMS_PER_PAGE);
      if (res.data.success) {
        setSends(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchScheduled(); }, [fetchScheduled]);

  const handleCancel = async (id: string) => {
    await deleteScheduledSend(id);
    setSends((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Calendar className="h-5 w-5" /> Scheduled Sends</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : sends.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Calendar className="h-12 w-12 mb-2 opacity-20" />
          <p>No scheduled messages</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push("/email/compose")}>Compose a message</Button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {sends.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 border-b hover:bg-accent/50">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{s.subject || "(no subject)"}</p>
                  <p className="text-xs text-muted-foreground">Scheduled for {new Date(s.scheduledAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${s.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : s.status === "SENT" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{s.status}</span>
                {s.status === "PENDING" && <Trash2 className="h-4 w-4 text-destructive cursor-pointer" onClick={() => handleCancel(s.id)} />}
              </div>
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
