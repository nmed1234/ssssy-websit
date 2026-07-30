"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";
import type { ApiResponse, ContentTypeDefinition, ContentTypeField } from "@/types";
import { useLanguage } from "@/lib/language-context";
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, GripVertical, ChevronDown, ChevronUp,
  Settings, FileText,
} from "lucide-react";

const FIELD_TYPES = [
  { value: "text",        label: "Text" },
  { value: "richtext",    label: "Rich Text" },
  { value: "textarea",    label: "Textarea" },
  { value: "email",       label: "Email" },
  { value: "url",         label: "URL" },
  { value: "number",      label: "Number" },
  { value: "date",        label: "Date" },
  { value: "datetime",    label: "Date & Time" },
  { value: "select",      label: "Dropdown" },
  { value: "multiselect", label: "Multi-Select" },
  { value: "radio",       label: "Radio Buttons" },
  { value: "checkbox",    label: "Checkbox" },
  { value: "file",        label: "File Upload" },
  { value: "media",       label: "Media (from library)" },
];

export default function ContentTypeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const typeId = params.id as string;

  const { data: typeDef, isLoading } = useQuery({
    queryKey: ["content-type", typeId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContentTypeDefinition>>(`/v2/content-types/${typeId}`);
      return res.data.data;
    },
  });

  const [fields, setFields] = useState<ContentTypeField[]>([]);
  const [settings, setSettings] = useState<Partial<ContentTypeDefinition>>({});
  const [dirty, setDirty] = useState(false);
  const [expandedField, setExpandedField] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"fields" | "settings">("fields");

  useEffect(() => {
    if (typeDef) {
      setFields(typeDef.fields ?? []);
      setSettings({
        labelEn: typeDef.labelEn,
        labelAr: typeDef.labelAr,
        description: typeDef.description,
        icon: typeDef.icon,
        allowComments: typeDef.allowComments,
        allowMemberSubmit: typeDef.allowMemberSubmit,
        requiresApproval: typeDef.requiresApproval,
        isActive: typeDef.isActive,
        sortOrder: typeDef.sortOrder,
      });
    }
  }, [typeDef]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put(`/v2/content-types/${typeId}`, {
        ...settings,
        fields,
      }),
    onSuccess: () => {
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["content-type", typeId] });
      queryClient.invalidateQueries({ queryKey: ["content-types"] });
    },
  });

  const addField = () => {
    const newField: ContentTypeField = {
      fieldName: `field_${Date.now()}`,
      fieldType: "text",
      fieldLabelEn: "New Field",
      isRequired: false,
      isSearchable: false,
      isListed: true,
      sortOrder: fields.length,
    };
    setFields([...fields, newField]);
    setExpandedField(fields.length);
    setDirty(true);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    setDirty(true);
  };

  const updateField = (index: number, updates: Partial<ContentTypeField>) => {
    setFields(fields.map((f, i) => i === index ? { ...f, ...updates } : f));
    setDirty(true);
  };

  const moveField = (index: number, dir: -1 | 1) => {
    const arr = [...fields];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setFields(arr);
    setDirty(true);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/content-types" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{typeDef?.labelEn}</h1>
          <p className="text-sm text-gray-500 font-mono">/dt/{typeDef?.name}</p>
        </div>
        <Link
          href={`/admin/content-types/${typeId}/entries`}
          className="flex items-center gap-2 border border-purple-300 text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <FileText className="h-4 w-4" />
          {t("View Entries", "عرض الإدخالات")} ({typeDef?.entryCount ?? 0})
        </Link>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={!dirty || saveMutation.isPending}
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
          {dirty ? t("Save Changes", "حفظ التغييرات") : t("Saved", "تم الحفظ")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { key: "fields" as const, label: t("Field Definitions", "تعريف الحقول"), icon: Plus },
          { key: "settings" as const, label: t("Type Settings", "إعدادات النوع"), icon: Settings },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Fields tab */}
      {activeTab === "fields" && (
        <div className="space-y-3">
          {fields.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              <Plus className="mx-auto h-8 w-8 mb-2" />
              <p>{t("No fields defined. Add your first field.", "لا توجد حقول محددة. أضف حقلك الأول.")}</p>
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
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-purple-300 text-purple-700 hover:border-purple-400 hover:bg-purple-50 rounded-xl py-3 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("Add Field", "إضافة حقل")}
          </button>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === "settings" && typeDef && (
        <TypeSettingsPanel
          settings={settings}
          onChange={(updates) => { setSettings((p) => ({ ...p, ...updates })); setDirty(true); }}
        />
      )}
    </div>
  );
}

// ─── Field Editor ─────────────────────────────────────────────────────────────

function FieldEditor({
  field, index, total, expanded, onToggle, onChange, onRemove, onMove,
}: {
  field: ContentTypeField;
  index: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (u: Partial<ContentTypeField>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const { t } = useLanguage();
  const needsOptions = ["select", "multiselect", "radio"].includes(field.fieldType);

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={onToggle}>
        <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm text-gray-900">{field.fieldLabelEn || t("Unnamed Field", "حقل بلا اسم")}</span>
          <span className="ml-2 text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{field.fieldType}</span>
          <span className="ml-1 text-xs text-gray-400 font-mono">({field.fieldName})</span>
          {field.isRequired && <span className="ml-1 text-xs text-red-500">*</span>}
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
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Field Name (internal key)", "اسم الحقل (المفتاح)")}</label>
              <input
                value={field.fieldName}
                onChange={(e) => onChange({ fieldName: e.target.value.replace(/\s+/g, "_").toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Field Type", "نوع الحقل")}</label>
              <select
                value={field.fieldType}
                onChange={(e) => onChange({ fieldType: e.target.value })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
              >
                {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Label (EN)", "التسمية (إنجليزي)")}</label>
              <input
                value={field.fieldLabelEn}
                onChange={(e) => onChange({ fieldLabelEn: e.target.value })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Label (AR)", "التسمية (عربي)")}</label>
              <input
                value={field.fieldLabelAr || ""}
                onChange={(e) => onChange({ fieldLabelAr: e.target.value })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                dir="rtl"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input type="checkbox" checked={field.isRequired ?? false} onChange={(e) => onChange({ isRequired: e.target.checked })} className="rounded text-purple-600" />
              {t("Required", "مطلوب")}
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input type="checkbox" checked={field.isSearchable ?? false} onChange={(e) => onChange({ isSearchable: e.target.checked })} className="rounded text-purple-600" />
              {t("Searchable", "قابل للبحث")}
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input type="checkbox" checked={field.isListed ?? true} onChange={(e) => onChange({ isListed: e.target.checked })} className="rounded text-purple-600" />
              {t("Show in list view", "إظهار في القائمة")}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Placeholder (EN)", "نص المساعدة (إنجليزي)")}</label>
              <input
                value={field.placeholderEn || ""}
                onChange={(e) => onChange({ placeholderEn: e.target.value })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("Placeholder (AR)", "نص المساعدة (عربي)")}</label>
              <input
                value={field.placeholderAr || ""}
                onChange={(e) => onChange({ placeholderAr: e.target.value })}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                dir="rtl"
              />
            </div>
          </div>

          {needsOptions && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('Options (JSON: [{value,label}])', 'الخيارات (JSON: [{value,label}])')}
              </label>
              <textarea
                value={field.optionsJson || ""}
                onChange={(e) => onChange({ optionsJson: e.target.value })}
                rows={3}
                placeholder='[{"value":"opt1","label":"Option 1"},{"value":"opt2","label":"Option 2"}]'
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono resize-y"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Type Settings Panel ─────────────────────────────────────────────────────

function TypeSettingsPanel({
  settings,
  onChange,
}: {
  settings: Partial<ContentTypeDefinition>;
  onChange: (u: Partial<ContentTypeDefinition>) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("Label (EN)", "التسمية (إنجليزي)")}</label>
          <input
            value={settings.labelEn || ""}
            onChange={(e) => onChange({ labelEn: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("Label (AR)", "التسمية (عربي)")}</label>
          <input
            value={settings.labelAr || ""}
            onChange={(e) => onChange({ labelAr: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            dir="rtl"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("Description", "الوصف")}</label>
        <textarea
          value={settings.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
        />
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={settings.allowMemberSubmit ?? false} onChange={(e) => onChange({ allowMemberSubmit: e.target.checked })} className="rounded text-purple-600" />
          {t("Allow members to submit entries", "السماح للأعضاء بإرسال إدخالات")}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={settings.requiresApproval ?? true} onChange={(e) => onChange({ requiresApproval: e.target.checked })} className="rounded text-purple-600" />
          {t("Require editor approval", "يتطلب موافقة المحرر")}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={settings.allowComments ?? false} onChange={(e) => onChange({ allowComments: e.target.checked })} className="rounded text-purple-600" />
          {t("Allow comments", "السماح بالتعليقات")}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={settings.isActive ?? true} onChange={(e) => onChange({ isActive: e.target.checked })} className="rounded text-purple-600" />
          {t("Active (visible to public)", "نشط (مرئي للعام)")}
        </label>
      </div>
    </div>
  );
}
