"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";
import type { ApiResponse, PaginatedResponse, FormDefinition } from "@/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";
import {
  FileText, Plus, Trash2, Eye, Edit2, CheckCircle, XCircle,
  ClipboardList, Loader2, ToggleLeft, ToggleRight,
} from "lucide-react";

export default function AdminFormsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["cms-forms"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<FormDefinition>>>("/forms?size=50");
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/forms/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms-forms"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/forms/${id}`, { isActive: !isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms-forms"] }),
  });

  const forms = data?.content ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("Forms", "النماذج")}
        description={t("Build and manage dynamic forms", "إنشاء وإدارة النماذج الديناميكية")}
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("New Form", "نموذج جديد")}
          </button>
        }
      />

      {showCreate && (
        <CreateFormModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ["cms-forms"] });
          }}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-green-600" />
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-lg font-medium">{t("No forms yet", "لا توجد نماذج بعد")}</p>
          <p className="text-sm">{t("Create your first form to get started.", "أنشئ نموذجك الأول للبدء.")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div key={form.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{form.title}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">/{form.slug}</p>
                </div>
                <span className={`ml-2 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${form.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {form.isActive ? t("Active", "نشط") : t("Inactive", "غير نشط")}
                </span>
              </div>

              {form.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{form.description}</p>
              )}

              <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                <ClipboardList className="h-3.5 w-3.5" />
                <span>{form.submissionCount ?? 0} {t("submissions", "إرساليات")}</span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Link
                  href={`/admin/forms/${form.id}`}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  {t("Edit", "تعديل")}
                </Link>
                <Link
                  href={`/admin/forms/${form.id}?tab=submissions`}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t("Submissions", "الإرساليات")}
                </Link>
                <button
                  onClick={() => toggleMutation.mutate({ id: form.id, isActive: form.isActive ?? true })}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium ml-auto"
                >
                  {form.isActive
                    ? <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                    : <ToggleLeft className="h-3.5 w-3.5" />}
                  {form.isActive ? t("Deactivate", "تعطيل") : t("Activate", "تفعيل")}
                </button>
                <button
                  onClick={() => { if (confirm(t("Delete this form?", "حذف هذا النموذج؟"))) deleteMutation.mutate(form.id); }}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create Form Modal ────────────────────────────────────────────────────────

function CreateFormModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [notificationEmails, setNotificationEmails] = useState("");
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: () => api.post("/forms", {
      title,
      slug,
      description,
      notificationEmails,
      requiresAuth,
      isActive: true,
      schemaJson: "[]",
      submitLabelEn: "Submit",
      submitLabelAr: "إرسال",
      successMessageEn: "Thank you! Your submission was received.",
      successMessageAr: "شكراً! تم استلام طلبك.",
    }),
    onSuccess: onCreated,
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || t("Failed to create form", "فشل في إنشاء النموذج"));
    },
  });

  const handleSlugFromTitle = (v: string) => {
    setTitle(v);
    if (!slug) {
      setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t("Create New Form", "إنشاء نموذج جديد")}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Title", "العنوان")} *</label>
              <input
                value={title}
                onChange={(e) => handleSlugFromTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder={t("e.g. Membership Application", "مثال: طلب عضوية")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Slug (URL)", "الرابط")} *</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-300">/forms/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  placeholder="membership-application"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Description", "الوصف")}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Notify Emails (comma-separated)", "إشعار بالبريد (مفصول بفواصل)")}
              </label>
              <input
                value={notificationEmails}
                onChange={(e) => setNotificationEmails(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="admin@example.com, editor@example.com"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={requiresAuth} onChange={(e) => setRequiresAuth(e.target.checked)} className="rounded text-green-600" />
              {t("Requires login to submit", "يتطلب تسجيل الدخول للإرسال")}
            </label>
          </div>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              {t("Cancel", "إلغاء")}
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!title || !slug || createMutation.isPending}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="animate-spin h-4 w-4" />}
              {t("Create Form", "إنشاء النموذج")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
