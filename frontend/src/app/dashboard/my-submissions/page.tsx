"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";
import type { ApiResponse, ContentTypeDefinition, DynamicContentEntry, PaginatedResponse } from "@/types";
import { useLanguage } from "@/lib/language-context";
import {
  FileText, Plus, Clock, Eye, CheckCircle, Archive, ArrowRight, Loader2,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string }> = {
  DRAFT:          { label: "Draft",           labelAr: "مسودة",          color: "bg-gray-100 text-gray-600" },
  PENDING_REVIEW: { label: "Pending Review",  labelAr: "بانتظار المراجعة", color: "bg-yellow-100 text-yellow-700" },
  APPROVED:       { label: "Approved",        labelAr: "معتمد",           color: "bg-blue-100 text-blue-700" },
  PUBLISHED:      { label: "Published",       labelAr: "منشور",           color: "bg-green-100 text-green-700" },
  ARCHIVED:       { label: "Archived",        labelAr: "مؤرشف",          color: "bg-red-100 text-red-600" },
};

export default function MySubmissionsPage() {
  const { t } = useLanguage();
  const [typeFilter, setTypeFilter] = useState("");

  const { data: types = [] } = useQuery({
    queryKey: ["public-content-types"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContentTypeDefinition[]>>("/public/content-types");
      return res.data.data.filter(t => t.allowMemberSubmit);
    },
  });

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["my-submissions", typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ size: "50" });
      if (typeFilter) params.set("typeName", typeFilter);
      const res = await api.get<ApiResponse<PaginatedResponse<DynamicContentEntry>>>(
        `/v2/member/dt?${params}`
      );
      return res.data.data;
    },
  });

  const list = submissions?.content ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("My Submissions", "إرساليتي")}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("Track the status of your submitted content.", "تتبع حالة المحتوى الذي أرسلته.")}
          </p>
        </div>
        {types.length > 0 && (
          <Link
            href="/dashboard/submit"
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("Submit Content", "إرسال محتوى")}
          </Link>
        )}
      </div>

      {/* Type filter */}
      {types.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter("")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              typeFilter === "" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("All Types", "كل الأنواع")}
          </button>
          {types.map(type => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.name)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                typeFilter === type.name ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Stats cards */}
      {list.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = list.filter(s => s.status === status).length;
            if (count === 0) return null;
            return (
              <div key={status} className={`rounded-xl p-4 ${config.color}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs font-medium mt-1">{t(config.label, config.labelAr)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submissions list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-green-600" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">{t("No submissions yet", "لا توجد إرساليات بعد")}</p>
          {types.length > 0 && (
            <Link
              href="/dashboard/submit"
              className="mt-4 inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-medium"
            >
              <Plus className="h-4 w-4" />
              {t("Submit your first content", "أرسل محتواك الأول")}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((entry) => {
            let fieldValues: Record<string, unknown> = {};
            try { fieldValues = JSON.parse(entry.fieldData); } catch {}
            const title = String(
              fieldValues.title ?? fieldValues.title_en ?? fieldValues.name ?? entry.slug
            );
            const status = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.DRAFT;
            return (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {entry.status === "PENDING_REVIEW" && <Clock className="h-3 w-3" />}
                      {entry.status === "PUBLISHED" && <CheckCircle className="h-3 w-3" />}
                      {entry.status === "ARCHIVED" && <Archive className="h-3 w-3" />}
                      {t(status.label, status.labelAr)}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                      {entry.contentTypeLabelEn ?? entry.contentTypeName}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">{title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{entry.slug}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">
                    {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "—"}
                  </p>
                  {entry.status === "PUBLISHED" && (
                    <Link
                      href={`/content/${entry.contentTypeName}/${entry.slug}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-medium"
                    >
                      <Eye className="h-3 w-3" />
                      {t("View Live", "عرض المنشور")}
                    </Link>
                  )}
                  {entry.status === "PENDING_REVIEW" && (
                    <p className="text-xs text-yellow-600 mt-1">
                      {t("Under review", "قيد المراجعة")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
