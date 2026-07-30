"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";
import type { ApiResponse, ContentTypeDefinition, DynamicContentEntry, PaginatedResponse } from "@/types";
import { useLanguage } from "@/lib/language-context";
import {
  ArrowLeft, Plus, Trash2, Edit2, Loader2, Eye, Filter,
  CheckCircle, Clock, XCircle, Archive,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT:          "bg-gray-100 text-gray-600",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED:       "bg-blue-100 text-blue-700",
  PUBLISHED:      "bg-green-100 text-green-700",
  ARCHIVED:       "bg-red-100 text-red-600",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  DRAFT:          <Clock className="h-3 w-3" />,
  PENDING_REVIEW: <Eye className="h-3 w-3" />,
  APPROVED:       <CheckCircle className="h-3 w-3" />,
  PUBLISHED:      <CheckCircle className="h-3 w-3" />,
  ARCHIVED:       <Archive className="h-3 w-3" />,
};

export default function ContentTypeEntriesPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const typeId = params.id as string;

  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(0);

  const { data: typeDef } = useQuery({
    queryKey: ["content-type", typeId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContentTypeDefinition>>(`/v2/content-types/${typeId}`);
      return res.data.data;
    },
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ["dynamic-entries", typeId, statusFilter, page],
    queryFn: async () => {
      if (!typeDef) return null;
      const params = new URLSearchParams({ page: String(page), size: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await api.get<ApiResponse<PaginatedResponse<DynamicContentEntry>>>(
        `/v2/admin/dt/${typeDef.name}?${params}`
      );
      return res.data.data;
    },
    enabled: !!typeDef,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/v2/admin/dt/entry/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dynamic-entries"] }),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/v2/admin/dt/entry/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dynamic-entries"] }),
  });

  const list = entries?.content ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/content-types/${typeId}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {typeDef?.labelEn ?? "..."} — {t("Entries", "الإدخالات")}
          </h1>
          <p className="text-sm text-gray-500 font-mono">/dt/{typeDef?.name}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t("New Entry", "إدخال جديد")}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">{t("Filter:", "تصفية:")}</span>
        {["", "DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s || t("All", "الكل")}
          </button>
        ))}
      </div>

      {/* Entries list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>{t("No entries found.", "لا توجد إدخالات.")}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t("Slug", "الرابط")}</th>
                {typeDef?.fields.filter(f => f.isListed).slice(0, 3).map(f => (
                  <th key={f.fieldName} className="px-4 py-3 text-left font-medium text-gray-600">{f.fieldLabelEn}</th>
                ))}
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t("Status", "الحالة")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t("Author", "المؤلف")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t("Date", "التاريخ")}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">{t("Actions", "إجراءات")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((entry) => {
                let fieldValues: Record<string, unknown> = {};
                try { fieldValues = JSON.parse(entry.fieldData); } catch {}
                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-xs truncate">{entry.slug}</td>
                    {typeDef?.fields.filter(f => f.isListed).slice(0, 3).map(f => (
                      <td key={f.fieldName} className="px-4 py-3 text-gray-700 max-w-xs truncate">
                        {String(fieldValues[f.fieldName] ?? "—").substring(0, 80)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_ICONS[entry.status]}
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{entry.authorUsername ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {entry.status === "PENDING_REVIEW" && (
                          <button
                            onClick={() => publishMutation.mutate({ id: entry.id, status: "PUBLISHED" })}
                            className="text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            {t("Publish", "نشر")}
                          </button>
                        )}
                        {entry.status === "PUBLISHED" && (
                          <button
                            onClick={() => publishMutation.mutate({ id: entry.id, status: "ARCHIVED" })}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                          >
                            {t("Archive", "أرشفة")}
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/admin/content-types/${typeId}/entries/${entry.id}`)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t("Delete this entry?", "حذف هذا الإدخال؟")))
                              deleteMutation.mutate(entry.id);
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {(entries?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {t("Page", "صفحة")} {(entries?.number ?? 0) + 1} / {entries?.totalPages}
              </span>
              <div className="flex gap-2">
                <button disabled={entries?.first} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1 border rounded disabled:opacity-40">
                  {t("Prev", "السابق")}
                </button>
                <button disabled={entries?.last} onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1 border rounded disabled:opacity-40">
                  {t("Next", "التالي")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Entry Modal */}
      {showCreate && typeDef && (
        <CreateEntryModal
          typeDef={typeDef}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ["dynamic-entries"] });
          }}
        />
      )}
    </div>
  );
}

// ─── Create Entry Modal ───────────────────────────────────────────────────────

function CreateEntryModal({
  typeDef, onClose, onCreated,
}: {
  typeDef: ContentTypeDefinition;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useLanguage();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("DRAFT");
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: () => api.post(`/v2/admin/dt/${typeDef.name}`, {
      fieldData: JSON.stringify(fieldValues),
      status,
    }),
    onSuccess: onCreated,
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || t("Failed to create entry", "فشل في إنشاء الإدخال"));
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {t("New", "جديد")} {typeDef.labelEn}
            </h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {typeDef.fields.map((field) => (
              <div key={field.fieldName}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.fieldLabelEn}
                  {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.fieldType === "richtext" || field.fieldType === "textarea" ? (
                  <textarea
                    rows={3}
                    value={fieldValues[field.fieldName] ?? ""}
                    onChange={(e) => setFieldValues(p => ({ ...p, [field.fieldName]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-y"
                    placeholder={field.placeholderEn}
                  />
                ) : field.fieldType === "select" ? (
                  <select
                    value={fieldValues[field.fieldName] ?? ""}
                    onChange={(e) => setFieldValues(p => ({ ...p, [field.fieldName]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">{t("Select...", "اختر...")}</option>
                    {field.optionsJson ? JSON.parse(field.optionsJson).map((opt: { value: string; label: string }) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )) : null}
                  </select>
                ) : field.fieldType === "checkbox" ? (
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fieldValues[field.fieldName] === "true"}
                      onChange={(e) => setFieldValues(p => ({ ...p, [field.fieldName]: e.target.checked ? "true" : "false" }))}
                      className="rounded text-purple-600"
                    />
                    {field.fieldLabelEn}
                  </label>
                ) : (
                  <input
                    type={["number","date","datetime","email","url"].includes(field.fieldType) ? field.fieldType === "datetime" ? "datetime-local" : field.fieldType : "text"}
                    value={fieldValues[field.fieldName] ?? ""}
                    onChange={(e) => setFieldValues(p => ({ ...p, [field.fieldName]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder={field.placeholderEn}
                  />
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
              {t("Cancel", "إلغاء")}
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="flex-1 bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="animate-spin h-4 w-4" />}
              {t("Create", "إنشاء")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
