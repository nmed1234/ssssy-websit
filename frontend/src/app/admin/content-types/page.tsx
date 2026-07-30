"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";
import type { ApiResponse, ContentTypeDefinition } from "@/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";
import {
  FileText, Plus, Trash2, Edit2, Layers, ToggleLeft, ToggleRight,
  Loader2, Users, Settings,
} from "lucide-react";

export default function AdminContentTypesPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: types = [], isLoading } = useQuery({
    queryKey: ["content-types"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContentTypeDefinition[]>>("/v2/content-types");
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/v2/content-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content-types"] }),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || t("Delete failed", "فشل الحذف"));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/v2/content-types/${id}`, { isActive: !isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content-types"] }),
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("Content Types", "أنواع المحتوى")}
        description={t(
          "Define custom content types with dynamic fields — like Drupal Content Types",
          "تعريف أنواع محتوى مخصصة بحقول ديناميكية — مثل Drupal Content Types"
        )}
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("New Content Type", "نوع محتوى جديد")}
          </button>
        }
      />

      {showCreate && (
        <CreateTypeModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ["content-types"] });
          }}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
        </div>
      ) : types.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Layers className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-lg font-medium">{t("No content types yet", "لا توجد أنواع محتوى بعد")}</p>
          <p className="text-sm mt-1">{t(
            "Create your first content type to enable dynamic entries.",
            "أنشئ نوع محتوى أول لتفعيل الإدخالات الديناميكية."
          )}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => (
            <TypeCard
              key={type.id}
              type={type}
              onToggle={() => toggleMutation.mutate({ id: type.id, isActive: type.isActive ?? true })}
              onDelete={() => {
                if (confirm(t(
                  `Delete "${type.labelEn}"? This cannot be undone.`,
                  `حذف "${type.labelEn}"؟ لا يمكن التراجع.`
                ))) deleteMutation.mutate(type.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Type Card ───────────────────────────────────────────────────────────────

function TypeCard({
  type, onToggle, onDelete,
}: {
  type: ContentTypeDefinition;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{type.labelEn}</h3>
            {type.labelAr && (
              <p className="text-xs text-gray-500 font-arabic truncate" dir="rtl">{type.labelAr}</p>
            )}
          </div>
        </div>
        <span className={`ml-2 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
          ${type.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {type.isActive ? t("Active", "نشط") : t("Inactive", "غير نشط")}
        </span>
      </div>

      <p className="text-xs text-gray-400 font-mono mb-2">/{type.name}</p>

      {type.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{type.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Settings className="h-3 w-3" />
          {type.fields?.length ?? 0} {t("fields", "حقول")}
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {type.entryCount ?? 0} {t("entries", "إدخالات")}
        </span>
        {type.allowMemberSubmit && (
          <span className="flex items-center gap-1 text-purple-600">
            <Users className="h-3 w-3" />
            {t("Members can submit", "الأعضاء يمكنهم الإرسال")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <Link
          href={`/admin/content-types/${type.id}`}
          className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium"
        >
          <Edit2 className="h-3.5 w-3.5" />
          {t("Edit Fields", "تعديل الحقول")}
        </Link>
        <Link
          href={`/admin/content-types/${type.id}/entries`}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
        >
          <FileText className="h-3.5 w-3.5" />
          {t("Entries", "الإدخالات")}
        </Link>
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium ml-auto"
        >
          {type.isActive
            ? <ToggleRight className="h-3.5 w-3.5 text-green-600" />
            : <ToggleLeft className="h-3.5 w-3.5" />}
          {type.isActive ? t("Deactivate", "تعطيل") : t("Activate", "تفعيل")}
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Create Type Modal ────────────────────────────────────────────────────────

function CreateTypeModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useLanguage();
  const [labelEn, setLabelEn] = useState("");
  const [labelAr, setLabelAr] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allowMemberSubmit, setAllowMemberSubmit] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: () => api.post("/v2/content-types", {
      name, labelEn, labelAr, description,
      allowMemberSubmit, requiresApproval,
      allowComments: false, isActive: true,
      fields: [],
    }),
    onSuccess: onCreated,
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || t("Failed to create type", "فشل في إنشاء النوع"));
    },
  });

  const handleLabelChange = (v: string) => {
    setLabelEn(v);
    if (!name) {
      setName(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            {t("Create New Content Type", "إنشاء نوع محتوى جديد")}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Label (English)", "التسمية (إنجليزي)")} *
            </label>
            <input
              value={labelEn}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Research Paper"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Label (Arabic)", "التسمية (عربي)")}
            </label>
            <input
              value={labelAr}
              onChange={(e) => setLabelAr(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="ورقة بحثية"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Machine Name (URL slug)", "الاسم البرمجي (URL)")} *
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
              <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-300">/dt/</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                placeholder="research-paper"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Description", "الوصف")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={allowMemberSubmit}
                onChange={(e) => setAllowMemberSubmit(e.target.checked)}
                className="rounded text-purple-600"
              />
              {t("Allow members to submit entries", "السماح للأعضاء بإرسال إدخالات")}
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="rounded text-purple-600"
              />
              {t("Require editor approval before publishing", "يتطلب موافقة المحرر قبل النشر")}
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              {t("Cancel", "إلغاء")}
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!labelEn || !name || createMutation.isPending}
              className="flex-1 bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
