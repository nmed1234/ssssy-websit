"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiResponse, ContentTypeDefinition } from "@/types";
import { useLanguage } from "@/lib/language-context";
import { ArrowLeft, Send, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";

/**
 * Phase 4 — Member content submission page.
 *
 * Step 1: User picks a content type (only those with allowMemberSubmit=true).
 * Step 2: User fills in the dynamic form for that type.
 * Step 3: Submission fires POST /api/v2/member/dt/{typeName} → status = PENDING_REVIEW.
 */
export default function SubmitContentPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ContentTypeDefinition | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: types = [], isLoading } = useQuery({
    queryKey: ["submittable-content-types"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContentTypeDefinition[]>>("/public/content-types");
      return res.data.data.filter(t => t.allowMemberSubmit);
    },
  });

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-green-600 text-6xl mb-6">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {t("Submitted Successfully!", "تم الإرسال بنجاح!")}
        </h1>
        <p className="text-gray-500 mb-6">
          {t(
            "Your content has been submitted and is pending review by our editors.",
            "تم إرسال محتواك وهو بانتظار مراجعة المحررين."
          )}
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/dashboard/my-submissions"
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {t("View My Submissions", "عرض إرساليتي")}
          </Link>
          <button
            onClick={() => { setSubmitted(false); setSelectedType(null); }}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            {t("Submit Another", "إرسال آخر")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        {selectedType ? (
          <button onClick={() => setSelectedType(null)} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link href="/dashboard/my-submissions" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {selectedType
              ? t("Submit", "إرسال") + " " + selectedType.labelEn
              : t("Submit Content", "إرسال محتوى")}
          </h1>
          {selectedType && (
            <p className="text-sm text-gray-500">
              {t("Fill in the form below and click Submit for Review.", "أكمل النموذج أدناه وانقر إرسال للمراجعة.")}
            </p>
          )}
        </div>
      </div>

      {!selectedType ? (
        /* Step 1: Type selection */
        isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-green-600" /></div>
        ) : types.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>{t("No content types are currently open for submission.", "لا توجد أنواع محتوى مفتوحة للإرسال حالياً.")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              {t("Select the type of content you want to submit:", "اختر نوع المحتوى الذي تريد إرساله:")}
            </p>
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Send className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{type.labelEn}</h3>
                  {type.labelAr && <p className="text-sm text-gray-500" dir="rtl">{type.labelAr}</p>}
                  {type.description && <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </button>
            ))}
          </div>
        )
      ) : (
        /* Step 2: Fill in the dynamic form */
        <SubmitForm
          typeDef={selectedType}
          onSuccess={() => setSubmitted(true)}
        />
      )}
    </div>
  );
}

// ─── Dynamic submission form ───────────────────────────────────────────────────

function SubmitForm({
  typeDef,
  onSuccess,
}: {
  typeDef: ContentTypeDefinition;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitMutation = useMutation({
    mutationFn: () => api.post(`/v2/member/dt/${typeDef.name}`, {
      fieldData: JSON.stringify(fieldValues),
    }),
    onSuccess,
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrors({ _form: msg || t("Submission failed", "فشل الإرسال") });
    },
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    for (const field of typeDef.fields) {
      if (field.isRequired && !fieldValues[field.fieldName]?.trim()) {
        errs[field.fieldName] = t(
          `${field.fieldLabelEn} is required`,
          `${field.fieldLabelAr || field.fieldLabelEn} مطلوب`
        );
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submitMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {typeDef.fields.map((field) => (
        <div key={field.fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t(field.fieldLabelEn, field.fieldLabelAr || field.fieldLabelEn)}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.helpTextEn && (
            <p className="text-xs text-gray-400 mb-1">{t(field.helpTextEn, field.helpTextAr || field.helpTextEn)}</p>
          )}

          {(field.fieldType === "richtext" || field.fieldType === "textarea") ? (
            <textarea
              rows={5}
              value={fieldValues[field.fieldName] ?? ""}
              onChange={(e) => {
                setFieldValues(p => ({ ...p, [field.fieldName]: e.target.value }));
                if (errors[field.fieldName]) setErrors(p => { const n = {...p}; delete n[field.fieldName]; return n; });
              }}
              placeholder={t(field.placeholderEn ?? "", field.placeholderAr ?? field.placeholderEn ?? "")}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y ${errors[field.fieldName] ? "border-red-400" : "border-gray-300"}`}
            />
          ) : field.fieldType === "select" ? (
            <select
              value={fieldValues[field.fieldName] ?? ""}
              onChange={(e) => setFieldValues(p => ({ ...p, [field.fieldName]: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[field.fieldName] ? "border-red-400" : "border-gray-300"}`}
            >
              <option value="">{t("Select...", "اختر...")}</option>
              {field.optionsJson ? (JSON.parse(field.optionsJson) as Array<{value: string; label: string; labelAr?: string}>).map((opt) => (
                <option key={opt.value} value={opt.value}>{t(opt.label, opt.labelAr || opt.label)}</option>
              )) : null}
            </select>
          ) : field.fieldType === "checkbox" ? (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={fieldValues[field.fieldName] === "true"}
                onChange={(e) => setFieldValues(p => ({ ...p, [field.fieldName]: e.target.checked ? "true" : "false" }))}
                className="rounded text-green-600"
              />
              {t(field.fieldLabelEn, field.fieldLabelAr || field.fieldLabelEn)}
            </label>
          ) : (
            <input
              type={field.fieldType === "datetime" ? "datetime-local" : ["number","date","email","url"].includes(field.fieldType) ? field.fieldType : "text"}
              value={fieldValues[field.fieldName] ?? ""}
              onChange={(e) => {
                setFieldValues(p => ({ ...p, [field.fieldName]: e.target.value }));
                if (errors[field.fieldName]) setErrors(p => { const n = {...p}; delete n[field.fieldName]; return n; });
              }}
              placeholder={t(field.placeholderEn ?? "", field.placeholderAr ?? field.placeholderEn ?? "")}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[field.fieldName] ? "border-red-400" : "border-gray-300"}`}
            />
          )}

          {errors[field.fieldName] && (
            <p className="text-xs text-red-600 mt-1">{errors[field.fieldName]}</p>
          )}
        </div>
      ))}

      {errors._form && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {errors._form}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitMutation.isPending && <Loader2 className="animate-spin h-4 w-4" />}
          <Send className="h-4 w-4" />
          {t("Submit for Review", "إرسال للمراجعة")}
        </button>
      </div>
    </form>
  );
}
