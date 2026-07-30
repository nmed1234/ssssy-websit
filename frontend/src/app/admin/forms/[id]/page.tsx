"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  ApiResponse, PaginatedResponse, FormDefinition, FormFieldDefinition,
  FormSubmission, FormFieldType,
} from "@/types";
import { useLanguage } from "@/lib/language-context";
import {
  Plus, Trash2, GripVertical, Save, Loader2, ChevronDown, ChevronUp,
  Eye, ClipboardList, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "text",        label: "Text Input"     },
  { value: "email",       label: "Email Input"    },
  { value: "textarea",    label: "Multi-line Text"},
  { value: "number",      label: "Number"         },
  { value: "date",        label: "Date"           },
  { value: "select",      label: "Dropdown"       },
  { value: "radio",       label: "Radio Buttons"  },
  { value: "checkbox",    label: "Checkbox"       },
  { value: "file",        label: "File Upload"    },
];

export default function FormEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const formId = params.id as string;
  const activeTab = searchParams.get("tab") || "builder";

  const { data: formDef, isLoading } = useQuery({
    queryKey: ["cms-form", formId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<FormDefinition>>(`/forms/${formId}`);
      return res.data.data;
    },
  });

  const [fields, setFields] = useState<FormFieldDefinition[]>([]);
  const [formSettings, setFormSettings] = useState<Partial<FormDefinition>>({});
  const [dirty, setDirty] = useState(false);
  const [expandedField, setExpandedField] = useState<number | null>(null);

  useEffect(() => {
    if (formDef) {
      try {
        setFields(JSON.parse(formDef.schemaJson || "[]"));
      } catch {
        setFields([]);
      }
      setFormSettings({
        title: formDef.title,
        titleAr: formDef.titleAr,
        description: formDef.description,
        submitLabelEn: formDef.submitLabelEn,
        submitLabelAr: formDef.submitLabelAr,
        successMessageEn: formDef.successMessageEn,
        successMessageAr: formDef.successMessageAr,
        notificationEmails: formDef.notificationEmails,
        requiresAuth: formDef.requiresAuth,
        isActive: formDef.isActive,
      });
    }
  }, [formDef]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put(`/forms/${formId}`, {
        ...formSettings,
        schemaJson: JSON.stringify(fields),
      }),
    onSuccess: () => {
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["cms-form", formId] });
      queryClient.invalidateQueries({ queryKey: ["cms-forms"] });
    },
  });

  const addField = () => {
    const newField: FormFieldDefinition = {
      name: `field_${Date.now()}`,
      type: "text",
      labelEn: "New Field",
      required: false,
    };
    setFields([...fields, newField]);
    setExpandedField(fields.length);
    setDirty(true);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    setDirty(true);
  };

  const updateField = (index: number, updates: Partial<FormFieldDefinition>) => {
    setFields(fields.map((f, i) => i === index ? { ...f, ...updates } : f));
    setDirty(true);
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newFields = [...fields];
    const target = index + direction;
    if (target < 0 || target >= newFields.length) return;
    [newFields[index], newFields[target]] = [newFields[target], newFields[index]];
    setFields(newFields);
    setDirty(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/forms" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{formDef?.title}</h1>
          <p className="text-sm text-gray-500 font-mono">/{formDef?.slug}</p>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={!dirty || saveMutation.isPending}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
          {dirty ? t("Save Changes", "حفظ التغييرات") : t("Saved", "تم الحفظ")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { key: "builder", label: t("Field Builder", "منشئ الحقول"), icon: Plus },
          { key: "settings", label: t("Settings", "الإعدادات"), icon: Eye },
          { key: "submissions", label: `${t("Submissions", "الإرساليات")} (${formDef?.submissionCount ?? 0})`, icon: ClipboardList },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => router.push(`/admin/forms/${formId}?tab=${key}`)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Field Builder */}
      {activeTab === "builder" && (
        <div className="space-y-3">
          {fields.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              <Plus className="mx-auto h-8 w-8 mb-2" />
              <p>{t("No fields yet. Add your first field.", "لا توجد حقول بعد. أضف حقلك الأول.")}</p>
            </div>
          )}

          {fields.map((field, index) => (
            <FieldEditor
              key={index}
              field={field}
              index={index}
              total={fields.length}
              expanded={expandedField === index}
              onToggle={() => setExpandedField(expandedField === index ? null : index)}
              onChange={(updates) => updateField(index, updates)}
              onRemove={() => removeField(index)}
              onMove={(dir) => moveField(index, dir)}
            />
          ))}

          <button
            onClick={addField}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50 rounded-xl py-3 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("Add Field", "إضافة حقل")}
          </button>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === "settings" && (
        <FormSettingsPanel
          settings={formSettings}
          onChange={(updates) => { setFormSettings((p) => ({ ...p, ...updates })); setDirty(true); }}
        />
      )}

      {/* Tab: Submissions */}
      {activeTab === "submissions" && <SubmissionsPanel formId={formId} />}
    </div>
  );
}

// ─── Field Editor card ────────────────────────────────────────────────────────

interface FieldEditorProps {
  field: FormFieldDefinition;
  index: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (updates: Partial<FormFieldDefinition>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}

function FieldEditor({ field, index, total, expanded, onToggle, onChange, onRemove, onMove }: FieldEditorProps) {
  const { t } = useLanguage();

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={onToggle}>
        <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm text-gray-900">{field.labelEn || t("Unnamed Field", "حقل بلا اسم")}</span>
          <span className="ml-2 text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{field.type}</span>
          {field.required && <span className="ml-1 text-xs text-red-500">*</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onMove(-1); }} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
            <ChevronUp className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMove(1); }} disabled={index === total - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
            <ChevronDown className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 text-red-400 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-3 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Field Name (internal)", "اسم الحقل (داخلي)")}</label>
              <input
                value={field.name}
                onChange={(e) => onChange({ name: e.target.value.replace(/\s+/g, "_").toLowerCase() })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Field Type", "نوع الحقل")}</label>
              <select
                value={field.type}
                onChange={(e) => onChange({ type: e.target.value as FormFieldType })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
              >
                {FIELD_TYPES.map(ft => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Label (EN)", "التسمية (إنجليزي)")}</label>
              <input
                value={field.labelEn}
                onChange={(e) => onChange({ labelEn: e.target.value })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Label (AR)", "التسمية (عربي)")}</label>
              <input
                value={field.labelAr || ""}
                onChange={(e) => onChange({ labelAr: e.target.value })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Placeholder", "نص توضيحي")}</label>
              <input
                value={field.placeholder || ""}
                onChange={(e) => onChange({ placeholder: e.target.value })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Help Text", "نص المساعدة")}</label>
              <input
                value={field.helpText || ""}
                onChange={(e) => onChange({ helpText: e.target.value })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) => onChange({ required: e.target.checked })}
                className="rounded text-green-600"
              />
              {t("Required", "مطلوب")}
            </label>
          </div>

          {/* Options editor for select/radio */}
          {(field.type === "select" || field.type === "radio" || field.type === "multiselect") && (
            <OptionsEditor
              options={field.options || []}
              onChange={(opts) => onChange({ options: opts })}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Options editor (for select/radio) ───────────────────────────────────────

function OptionsEditor({ options, onChange }: {
  options: { value: string; label: string; labelAr?: string }[];
  onChange: (opts: { value: string; label: string; labelAr?: string }[]) => void;
}) {
  const { t } = useLanguage();
  const add = () => onChange([...options, { value: "", label: "" }]);
  const remove = (i: number) => onChange(options.filter((_, idx) => idx !== i));
  const update = (i: number, key: string, val: string) =>
    onChange(options.map((o, idx) => idx === i ? { ...o, [key]: val } : o));

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-2">{t("Options", "الخيارات")}</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={opt.value}
              onChange={(e) => update(i, "value", e.target.value)}
              placeholder={t("Value", "القيمة")}
              className="w-24 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
            <input
              value={opt.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder={t("Label EN", "تسمية إنجليزي")}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
            <input
              value={opt.labelAr || ""}
              onChange={(e) => update(i, "labelAr", e.target.value)}
              placeholder={t("Label AR", "تسمية عربي")}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
              dir="rtl"
            />
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-1">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="mt-2 text-xs text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
      >
        <Plus className="h-3 w-3" />
        {t("Add Option", "إضافة خيار")}
      </button>
    </div>
  );
}

// ─── Form Settings Panel ──────────────────────────────────────────────────────

function FormSettingsPanel({ settings, onChange }: {
  settings: Partial<FormDefinition>;
  onChange: (updates: Partial<FormDefinition>) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 max-w-2xl">
      <h3 className="font-semibold text-gray-900">{t("Form Settings", "إعدادات النموذج")}</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: "submitLabelEn", label: t("Submit Button (EN)", "زر الإرسال (إنجليزي)") },
          { key: "submitLabelAr", label: t("Submit Button (AR)", "زر الإرسال (عربي)") },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              value={(settings as Record<string, unknown>)[key] as string || ""}
              onChange={(e) => onChange({ [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("Success Message (EN)", "رسالة النجاح (إنجليزي)")}</label>
        <textarea
          value={settings.successMessageEn || ""}
          onChange={(e) => onChange({ successMessageEn: e.target.value })}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("Notification Emails", "إشعارات البريد")}</label>
        <input
          value={settings.notificationEmails || ""}
          onChange={(e) => onChange({ notificationEmails: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          placeholder="admin@example.com, editor@example.com"
        />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={settings.isActive || false} onChange={(e) => onChange({ isActive: e.target.checked })} className="rounded text-green-600" />
          {t("Form Active", "النموذج نشط")}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={settings.requiresAuth || false} onChange={(e) => onChange({ requiresAuth: e.target.checked })} className="rounded text-green-600" />
          {t("Requires Login", "يتطلب تسجيل الدخول")}
        </label>
      </div>
    </div>
  );
}

// ─── Submissions Panel ────────────────────────────────────────────────────────

function SubmissionsPanel({ formId }: { formId: string }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["form-submissions", formId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<FormSubmission>>>(`/forms/${formId}/submissions?size=50`);
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ subId, status }: { subId: string; status: string }) =>
      api.patch(`/forms/submissions/${subId}?status=${status}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["form-submissions", formId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (subId: string) => api.delete(`/forms/submissions/${subId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["form-submissions", formId] }),
  });

  const subs = data?.content ?? [];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-green-600" /></div>;
  if (subs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <ClipboardList className="mx-auto h-10 w-10 text-gray-300 mb-2" />
        <p>{t("No submissions yet", "لا توجد إرساليات بعد")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subs.map((sub) => {
        let parsed: Record<string, unknown> = {};
        try { parsed = JSON.parse(sub.data); } catch { /* ignore */ }

        return (
          <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                {sub.submitterName && <p className="font-medium text-gray-900 text-sm">{sub.submitterName}</p>}
                {sub.submitterEmail && <p className="text-xs text-gray-500">{sub.submitterEmail}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{new Date(sub.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${sub.status === "REVIEWED" ? "bg-green-100 text-green-700"
                  : sub.status === "SPAM" ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-700"}`}>
                  {sub.status}
                </span>
                {sub.status === "PENDING" && (
                  <button
                    onClick={() => updateMutation.mutate({ subId: sub.id, status: "REVIEWED" })}
                    className="text-xs text-green-700 hover:text-green-800 font-medium"
                  >
                    {t("Mark Reviewed", "تعليم كمراجع")}
                  </button>
                )}
                <button
                  onClick={() => { if (confirm(t("Delete this submission?", "حذف هذه الإرسالية؟"))) deleteMutation.mutate(sub.id); }}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(parsed).map(([key, val]) => (
                <div key={key} className="text-xs">
                  <span className="text-gray-500">{key}: </span>
                  <span className="text-gray-800">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
