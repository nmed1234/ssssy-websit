"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import {
  getSubmittedItems, getPendingReviews, getApprovedItems,
  getWorkflowLogs, approveContent, rejectContent, requestRevision,
  publishContent, scheduleContent, backToDraft
} from "@/lib/workflow";
import type { ContentItem, WorkflowLog } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

type Tab = "submitted" | "pending" | "approved";

type ActionType = "approve" | "reject" | "revision" | "publish" | "schedule" | "back-to-draft";

export default function WorkflowPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("submitted");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const [actionItem, setActionItem] = useState<ContentItem | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [comments, setComments] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [tab]);

  async function fetchItems() {
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case "submitted":
          res = await getSubmittedItems();
          break;
        case "pending":
          res = await getPendingReviews();
          break;
        case "approved":
          res = await getApprovedItems();
          break;
      }
      setItems(res!.data.data);
    } catch { }
    setLoading(false);
  }

  async function showLogs(item: ContentItem) {
    setSelectedItem(item);
    setLogsOpen(true);
    try {
      const { data } = await getWorkflowLogs(item.id);
      setLogs(data.data);
    } catch { }
  }

  function openAction(item: ContentItem, action: ActionType) {
    setActionItem(item);
    setActionType(action);
    setComments("");
    setScheduledAt("");
    if (action === "schedule") {
      setShowSchedulePicker(true);
    }
  }

  function closeAction() {
    setActionItem(null);
    setActionType(null);
    setComments("");
    setScheduledAt("");
    setShowSchedulePicker(false);
  }

  async function confirmAction() {
    if (!actionItem || !actionType) return;
    try {
      switch (actionType) {
        case "approve":
          await approveContent(actionItem.id, comments || undefined);
          break;
        case "reject":
          await rejectContent(actionItem.id, comments || undefined);
          break;
        case "revision":
          await requestRevision(actionItem.id, comments || undefined);
          break;
        case "publish":
          await publishContent(actionItem.id, comments || undefined);
          break;
        case "schedule":
          if (!scheduledAt) return;
          await scheduleContent(actionItem.id, new Date(scheduledAt).toISOString(), comments || undefined);
          break;
        case "back-to-draft":
          await backToDraft(actionItem.id, comments || undefined);
          break;
      }
      closeAction();
      fetchItems();
    } catch { }
  }

  function getActionLabel(action: ActionType): string {
    switch (action) {
      case "approve": return "Approve";
      case "reject": return "Reject";
      case "revision": return "Request Revision";
      case "publish": return "Publish";
      case "schedule": return "Schedule";
      case "back-to-draft": return "Back to Draft";
    }
  }

  const role = user?.role || "";
  const isPublisher = ["PUBLISHER", "ADMIN", "SUPER_ADMIN"].includes(role);
  const isReviewer = ["REVIEWER", "PUBLISHER", "ADMIN", "SUPER_ADMIN"].includes(role);

  return (
    <div>
      <AdminPageHeader
        title={t("Workflow", "سير العمل")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: t("Workflow", "سير العمل") }]}
      />

      <div className="flex gap-2 mb-6">
        {(["submitted", "pending", "approved"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === tabKey ? "bg-soil-dark text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tabKey === "submitted" ? t("Submitted", "مقدم") : tabKey === "pending" ? t("Pending Review", "بانتظار المراجعة") : t("Approved", "معتمد")}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">{t("Loading…", "جارٍ التحميل…")}</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            {t("No items in this view", "لا توجد عناصر في هذا العرض")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-gray-500">{item.contentType}</span>
                  </div>
                  <h3 className="font-medium">{item.titleEn || item.titleAr}</h3>
                  <p className="text-sm text-gray-500">
                    By {item.authorName} &middot; v{item.version}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {tab === "approved" && isPublisher && (
                    <>
                      <button
                        onClick={() => openAction(item, "publish")}
                        className="text-sm bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800"
                      >
                        {t("Publish", "نشر")}
                      </button>
                      <button
                        onClick={() => openAction(item, "schedule")}
                        className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                      >
                        {t("Schedule", "جدولة")}
                      </button>
                    </>
                  )}
                  {tab === "pending" && isReviewer && (
                    <>
                      <button
                        onClick={() => openAction(item, "approve")}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        {t("Approve", "موافقة")}
                      </button>
                      <button
                        onClick={() => openAction(item, "reject")}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        {t("Reject", "رفض")}
                      </button>
                      <button
                        onClick={() => openAction(item, "revision")}
                        className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                      >
                        {t("Revise", "مراجعة")}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => showLogs(item)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {t("History", "السجل")}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {actionItem && actionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="font-bold text-lg mb-2">{getActionLabel(actionType)}</h2>
            <p className="text-sm text-gray-500 mb-4">{actionItem.titleEn || actionItem.titleAr}</p>

            {showSchedulePicker && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Scheduled Date & Time", "تاريخ ووقت الجدولة")}</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Comments (optional)", "تعليقات (اختياري)")}</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                placeholder={t("Add a comment…", "أضف تعليقاً…")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeAction}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t("Cancel", "إلغاء")}
              </button>
              <button
                onClick={confirmAction}
                disabled={showSchedulePicker && !scheduledAt}
                className="px-4 py-2 text-sm text-white bg-soil-dark rounded-lg hover:bg-soil-darker disabled:opacity-50"
              >
                {t("Confirm", "تأكيد")}
              </button>
            </div>
          </div>
        </div>
      )}

      {logsOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{t("Workflow History", "سجل سير العمل")}</h2>
              <button onClick={() => { setLogsOpen(false); setSelectedItem(null); }} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{selectedItem.titleEn || selectedItem.titleAr}</p>
            {logs.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("No history available", "لا يوجد سجل متاح")}</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border-l-2 border-gray-200 pl-4 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase text-gray-500">{log.action}</span>
                      <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">
                      <StatusBadge status={log.fromStatus || "?"} /> &rarr; <StatusBadge status={log.toStatus} />
                    </p>
                    <p className="text-xs text-gray-500">by {log.actorName}</p>
                    {log.comments && <p className="text-sm mt-1 text-gray-600 italic">&ldquo;{log.comments}&rdquo;</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
