"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  LOGOUT: "bg-gray-100 text-gray-700",
  APPROVE: "bg-emerald-100 text-emerald-700",
  REJECT: "bg-orange-100 text-orange-700",
  PUBLISH: "bg-teal-100 text-teal-700",
  SUBMIT: "bg-indigo-100 text-indigo-700",
};

export default function AuditLogsPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params: Record<string, unknown> = { page, size: 50 };
  if (actionFilter) params.action = actionFilter;
  if (dateFrom) params.from = dateFrom;
  if (dateTo) params.to = dateTo;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["audit-logs", page, actionFilter, dateFrom, dateTo],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>("/audit-logs", { params });
      return res.data.data;
    },
  });

  const getActionBadge = (action: string) => {
    const cls = ACTION_COLORS[action.toUpperCase()] || "bg-gray-100 text-gray-700";
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{action}</span>;
  };

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={t("Audit Logs", "سجلات المراجعة")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: t("Audit Logs", "سجلات المراجعة") }]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>Refresh</Button>
          </div>
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Action Type</label>
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-40"
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
              >
                <option value="">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="APPROVE">APPROVE</option>
                <option value="REJECT">REJECT</option>
                <option value="PUBLISH">PUBLISH</option>
                <option value="SUBMIT">SUBMIT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">From Date</label>
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} className="w-44" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Date</label>
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} className="w-44" />
            </div>
            {(actionFilter || dateFrom || dateTo) && (
              <Button variant="ghost" onClick={() => { setActionFilter(""); setDateFrom(""); setDateTo(""); setPage(0); }}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50/50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-red-700">Failed to load audit logs.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Audit Logs ({data?.totalElements ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Actor</th>
                    <th className="pb-3 font-medium">Action</th>
                    <th className="pb-3 font-medium">Entity Type</th>
                    <th className="pb-3 font-medium">Entity ID</th>
                    <th className="pb-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content?.map((log: AuditLog) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 text-muted-foreground text-xs whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                      <td className="py-3 font-medium">{log.actor}</td>
                      <td className="py-3">{getActionBadge(log.action)}</td>
                      <td className="py-3 text-muted-foreground">{log.entityType}</td>
                      <td className="py-3">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.entityId?.substring(0, 8)}...</code>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs max-w-[200px] truncate">{log.details || "-"}</td>
                    </tr>
                  ))}
                  {(!data?.content || data.content.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">No audit logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Page {data.number + 1} of {data.totalPages} ({data.totalElements} total)
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={data.first} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={data.last} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
