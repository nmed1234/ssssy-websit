"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSubmittedItems, getPendingReviews, getApprovedItems,
  approveContent, rejectContent, publishContent, scheduleContent,
  getWorkflowLogs
} from "@/lib/workflow";
import type { ContentItem, WorkflowLog } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import {
  CheckCircle, XCircle, Clock, Send, BookOpen,
  MessageSquare, ChevronDown, ChevronRight, Calendar,
  History, Eye, RefreshCw
} from "lucide-react";

type Tab = "submitted" | "pending" | "approved";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-600",
  IN_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
  REVISION_REQUESTED: "bg-orange-100 text-orange-600",
  SCHEDULED: "bg-purple-100 text-purple-600",
};

export default function ContentApprovalPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("submitted");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "publish" | "schedule" | null>(null);
  const [comments, setComments] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ["workflow", tab],
    queryFn: async () => {
      let res;
      if (tab === "submitted") res = await getSubmittedItems();
      else if (tab === "pending") res = await getPendingReviews();
      else res = await getApprovedItems();
      return res.data.data;
    },
  });

  const handleAction = async () => {
    if (!selectedItem || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === "approve") await approveContent(selectedItem.id, comments);
      else if (actionType === "reject") await rejectContent(selectedItem.id, comments);
      else if (actionType === "publish") await publishContent(selectedItem.id, comments);
      else if (actionType === "schedule") await scheduleContent(selectedItem.id, scheduledAt, comments);

      setActionType(null);
      setSelectedItem(null);
      setComments("");
      setScheduledAt("");
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewLogs = async (item: ContentItem) => {
    if (expandedLogs === item.id) {
      setExpandedLogs(null);
      return;
    }
    setExpandedLogs(item.id);
    setLogsLoading(true);
    try {
      const res = await getWorkflowLogs(item.id);
      setLogs(res.data.data);
    } finally {
      setLogsLoading(false);
    }
  };

  const TABS = [
    { key: "submitted" as Tab, label: t("Submitted for Review", "مقدم للمراجعة"), icon: <Send className="w-4 h-4" />, count: tab === "submitted" ? items.length : undefined },
    { key: "pending" as Tab, label: t("In Review", "قيد المراجعة"), icon: <Eye className="w-4 h-4" />, count: tab === "pending" ? items.length : undefined },
    { key: "approved" as Tab, label: "Approved", icon: <CheckCircle className="w-4 h-4" />, count: tab === "approved" ? items.length : undefined },
  ];

  return (
    <div>
      <AdminPageHeader
        title={t("Content Approval Queue", "طابور الموافقة على المحتوى")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: t("Approval Queue", "طابور الموافقة") }]}
        actions={
          <button onClick={() => refetch()} className="p-2 rounded-lg border hover:bg-gray-100">
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
              tab === t.key
                ? "border-soil-dark bg-soil-dark text-white"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span className={tab === t.key ? "text-white" : "text-gray-500"}>{t.icon}</span>
            <div>
              <p className={`text-xs ${tab === t.key ? "text-white/70" : "text-gray-500"}`}>{t.label}</p>
              <p className={`text-xl font-bold ${tab === t.key ? "text-white" : "text-gray-900"}`}>
                {tab === t.key ? items.length : "—"}
              </p>
            </div>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {TABS.find((t) => t.key === tab)?.label}
            </CardTitle>
            <span className="text-sm text-muted-foreground">{items.length} items</span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-gray-500">All clear! No items in this queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="border rounded-xl overflow-hidden">
                  <div className="flex items-start gap-4 p-4">
                    {/* Type badge */}
                    <span className="flex-shrink-0 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-mono mt-0.5">
                      {item.contentType}
                    </span>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.titleEn || item.titleAr || "Untitled"}
                      </p>
                      {item.titleAr && item.titleEn && (
                        <p className="text-sm text-gray-500 truncate" dir="rtl">{item.titleAr}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        By {item.authorName} •{" "}
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ""}
                      </p>
                    </div>

                    {/* Status */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-600"}`}>
                      {item.status}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleViewLogs(item)}
                        className="p-1.5 border rounded hover:bg-gray-100"
                        title={t("View History", "عرض السجل")}
                      >
                        <History className="w-3.5 h-3.5 text-gray-500" />
                      </button>

                      {(tab === "submitted" || tab === "pending") && (
                        <>
                          <button
                            onClick={() => { setSelectedItem(item); setActionType("approve"); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => { setSelectedItem(item); setActionType("reject"); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      {tab === "approved" && (
                        <>
                          <button
                            onClick={() => { setSelectedItem(item); setActionType("publish"); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs hover:bg-emerald-600"
                          >
                            <BookOpen className="w-3.5 h-3.5" /> Publish
                          </button>
                          <button
                            onClick={() => { setSelectedItem(item); setActionType("schedule"); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Schedule
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Workflow logs expansion */}
                  {expandedLogs === item.id && (
                    <div className="border-t bg-gray-50 px-4 py-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Workflow History</p>
                      {logsLoading ? (
                        <p className="text-xs text-gray-400">Loading...</p>
                      ) : logs.length === 0 ? (
                        <p className="text-xs text-gray-400">No history yet</p>
                      ) : (
                        <div className="space-y-1.5">
                          {logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${STATUS_COLORS[log.toStatus] || "bg-gray-100 text-gray-500"}`}>
                                {log.action}
                              </span>
                              <div className="flex-1">
                                <span className="text-xs text-gray-700">{log.actorName}</span>
                                {log.comments && <span className="text-xs text-gray-500 ml-1">— {log.comments}</span>}
                                <span className="text-[10px] text-gray-400 ml-2">
                                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action modal */}
      {actionType && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-[480px] p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 capitalize">{actionType} Content</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedItem.titleEn || selectedItem.titleAr}
            </p>

            {actionType === "schedule" && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">Publish Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-dark/30"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Comments {actionType === "reject" && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder="Add a note or feedback..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-dark/30 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setActionType(null); setSelectedItem(null); setComments(""); setScheduledAt(""); }}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading || (actionType === "reject" && !comments.trim()) || (actionType === "schedule" && !scheduledAt)}
                className={`px-4 py-2 text-white rounded-lg text-sm disabled:opacity-50 ${
                  actionType === "approve" || actionType === "publish" ? "bg-green-500 hover:bg-green-600" :
                  actionType === "reject" ? "bg-red-500 hover:bg-red-600" :
                  "bg-purple-500 hover:bg-purple-600"
                }`}
              >
                {actionLoading ? "Processing..." : `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
