"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import api from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types";
import { useLanguage } from "@/lib/language-context";
import { Activity, RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CmsEventLog {
  id: string;
  eventId: string;
  eventType: string;
  actorId?: string;
  occurredAt: string;
  createdAt: string;
}

interface EventSummary {
  last24h: Record<string, number>;
}

// ─── Badge colours per event type ─────────────────────────────────────────────

const EVENT_COLORS: Record<string, string> = {
  CONTENT_PUBLISHED:           "bg-emerald-100 text-emerald-800",
  CONTENT_CREATED:             "bg-blue-100 text-blue-800",
  CONTENT_UPDATED:             "bg-sky-100 text-sky-800",
  CONTENT_WORKFLOW_TRANSITION: "bg-yellow-100 text-yellow-800",
  FORM_SUBMITTED:              "bg-purple-100 text-purple-800",
  USER_REGISTERED:             "bg-indigo-100 text-indigo-800",
  MEDIA_UPLOADED:              "bg-orange-100 text-orange-800",
  COMMENT_POSTED:              "bg-pink-100 text-pink-800",
  PLUGIN_INSTALLED:            "bg-gray-100 text-gray-800",
};

function EventBadge({ type }: { type: string }) {
  const cls = EVENT_COLORS[type] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {type.replace(/_/g, " ")}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventLogPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const [eventType, setEventType] = useState("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["event-log", page, eventType],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: "50" });
      if (eventType) params.set("eventType", eventType);
      const res = await api.get<ApiResponse<PaginatedResponse<CmsEventLog>>>(`/admin/event-log?${params}`);
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const { data: summaryData } = useQuery({
    queryKey: ["event-log-summary"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<EventSummary>>("/admin/event-log/summary");
      return res.data.data;
    },
    staleTime: 60_000,
  });

  const events = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const EVENT_TYPES = [
    "CONTENT_PUBLISHED", "CONTENT_CREATED", "CONTENT_UPDATED",
    "CONTENT_WORKFLOW_TRANSITION", "FORM_SUBMITTED", "USER_REGISTERED",
    "MEDIA_UPLOADED", "COMMENT_POSTED", "PLUGIN_INSTALLED",
  ];

  const summary24h = summaryData?.last24h ?? {};

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("CMS Event Log", "سجل أحداث النظام")}
        description={t(
          "Audit trail of all CMS events fired through the event bus",
          "سجل تدقيق لجميع أحداث النظام المُطلقة عبر ناقل الأحداث"
        )}
      />

      {/* 24-hour summary cards */}
      {Object.keys(summary24h).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(summary24h)
            .filter(([, count]) => count > 0)
            .map(([type, count]) => (
              <button
                key={type}
                onClick={() => { setEventType(type === eventType ? "" : type); setPage(0); }}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  eventType === type
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-300"
                }`}
              >
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{type.replace(/_/g, " ")}</p>
              </button>
            ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="h-4 w-4 text-gray-400 shrink-0" />
        <span className="text-sm text-gray-500">{t("Filter:", "تصفية:")}</span>
        <button
          onClick={() => { setEventType(""); setPage(0); }}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            eventType === "" ? "bg-green-700 text-white border-green-700" : "border-gray-300 text-gray-600 hover:border-green-400"
          }`}
        >
          {t("All", "الكل")}
        </button>
        {EVENT_TYPES.map((t_) => (
          <button
            key={t_}
            onClick={() => { setEventType(t_); setPage(0); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              eventType === t_ ? "bg-green-700 text-white border-green-700" : "border-gray-300 text-gray-600 hover:border-green-400"
            }`}
          >
            {t_.replace(/_/g, " ")}
          </button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="ml-auto gap-1.5"
          disabled={isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          {t("Refresh", "تحديث")}
        </Button>
      </div>

      {/* Event table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <Activity className="h-8 w-8 mx-auto mb-3 animate-pulse" />
            <p>{t("Loading events…", "جارٍ تحميل الأحداث…")}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Activity className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p>{t("No events found.", "لم يتم العثور على أحداث.")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">{t("Event Type", "نوع الحدث")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">{t("Event ID", "معرّف الحدث")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">{t("Actor", "المُنشئ")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">{t("Occurred At", "وقت الحدوث")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <EventBadge type={event.eventType} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400 truncate max-w-[180px]">
                      {event.eventId}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {event.actorId ? event.actorId.substring(0, 8) + "…" : <span className="text-gray-400 italic">system</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(event.occurredAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-xs text-gray-500">
              {t(`${totalElements} total events`, `${totalElements} حدث إجمالي`)}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {t(`Page ${page + 1} of ${totalPages}`, `صفحة ${page + 1} من ${totalPages}`)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
