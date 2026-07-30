"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, X, Upload,
  Building2, GraduationCap, Search, ChevronLeft, ChevronRight
} from "lucide-react";
import Image from "next/image";

interface MemberProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  nameAr?: string;
  nameEn?: string;
  titleAr?: string;
  email?: string;
  phone?: string;
  photo?: string;
  photoUrl?: string;
  institution?: string;
  department?: string;
  position?: string;
  specialization?: string;
  specializationDetail?: string;
  researchInterests?: string;
  education?: string;
  careerSummary?: string;
  memberships?: string;
  languages?: string;
  nationality?: string;
  birthYear?: number;
  birthCity?: string;
  maritalStatus?: string;
  membershipType?: string;
  membershipNumber?: string;
  publicationsCount?: number;
  joinedAt?: string;
  orcidId?: string;
  googleScholarUrl?: string;
  linkedinUrl?: string;
  slug?: string;
  isPublic?: boolean;
}

const EMPTY_FORM: Partial<MemberProfile> = {
  nameAr: "", nameEn: "", titleAr: "",
  membershipType: "FOUNDER",
  specialization: "", specializationDetail: "",
  education: "", researchInterests: "", careerSummary: "",
  memberships: "", languages: "", nationality: "",
  birthYear: undefined, birthCity: "", maritalStatus: "",
  institution: "", department: "", position: "",
  orcidId: "", googleScholarUrl: "", linkedinUrl: "",
  slug: "", photoUrl: "", publicationsCount: undefined,
  isPublic: true,
};

function getDisplayName(p: MemberProfile) {
  return p.nameAr || p.nameEn || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "—";
}
function getPhoto(p: MemberProfile) {
  return p.photoUrl || p.photo || null;
}
function getInitial(p: MemberProfile) {
  return getDisplayName(p)[0]?.toUpperCase() || "?";
}

const GRADIENTS = [
  "from-[#5c3d1e] to-[#3b7a57]", "from-[#2563eb] to-[#7c3aed]",
  "from-[#d97706] to-[#dc2626]", "from-[#059669] to-[#0284c7]",
  "from-[#7c3aed] to-[#db2777]", "from-[#0f766e] to-[#1d4ed8]",
  "from-[#b45309] to-[#7c3aed]", "from-[#166534] to-[#1e40af]",
];

// ── Form Modal ────────────────────────────────────────────────────────────────
function MemberFormModal({
  profile, onClose, onSaved,
}: { profile?: MemberProfile | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useLanguage();
  const isEdit = !!profile;
  const [form, setForm] = useState<Partial<MemberProfile>>(profile ? { ...profile } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "academic" | "career" | "membership">("personal");

  const set = (key: keyof MemberProfile, val: string | number | boolean | undefined) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.nameAr && !form.nameEn) { setError("الاسم مطلوب"); return; }
    setSaving(true); setError(null);
    try {
      if (isEdit && profile?.id) {
        await api.put(`/admin/members/${profile.id}`, form);
      } else {
        // For new members we need a userId — admin creates user first (simplified: alert)
        setError("لإضافة عضو جديد، أنشئ حساب المستخدم أولاً ثم عدّل ملفه.");
        setSaving(false); return;
      }
      onSaved();
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
    } finally { setSaving(false); }
  };

  const tabs = [
    { id: "personal" as const, label: "الشخصية" },
    { id: "academic" as const, label: "الأكاديمية" },
    { id: "career" as const, label: "المسيرة" },
    { id: "membership" as const, label: "العضوية" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900" dir="rtl">
            {isEdit ? `تعديل: ${getDisplayName(profile!)}` : "إضافة عضو جديد"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Photo preview */}
        <div className="px-6 pt-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5c3d1e] to-[#3b7a57] flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white shadow">
            {form.photoUrl ? (
              <Image src={form.photoUrl} alt="" width={64} height={64} className="w-full h-full object-cover" unoptimized />
            ) : (
              <span className="text-white text-xl font-black">{form.nameAr?.[0] || "?"}</span>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1" dir="rtl">رابط الصورة (URL)</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={form.photoUrl || ""}
                onChange={(e) => set("photoUrl", e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5c3d1e]/30"
                dir="ltr"
              />
              <Button type="button" variant="outline" size="sm" className="gap-1 text-xs shrink-0">
                <Upload className="h-3.5 w-3.5" /> رفع
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl" dir="rtl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${activeTab === tab.id ? "bg-white text-[#5c3d1e] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div className="px-6 py-4 space-y-3 max-h-[420px] overflow-y-auto" dir="rtl">
          {activeTab === "personal" && (
            <>
              <Field label="الاسم بالعربية *" value={form.nameAr || ""} onChange={(v) => set("nameAr", v)} />
              <Field label="الاسم بالإنجليزية" value={form.nameEn || ""} onChange={(v) => set("nameEn", v)} dir="ltr" />
              <Field label="اللقب (دكتور / أستاذ...)" value={form.titleAr || ""} onChange={(v) => set("titleAr", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="سنة الميلاد" type="number" value={form.birthYear?.toString() || ""} onChange={(v) => set("birthYear", parseInt(v) || undefined)} />
                <Field label="مدينة الميلاد" value={form.birthCity || ""} onChange={(v) => set("birthCity", v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="الجنسية" value={form.nationality || ""} onChange={(v) => set("nationality", v)} />
                <Field label="الحالة الاجتماعية" value={form.maritalStatus || ""} onChange={(v) => set("maritalStatus", v)} />
              </div>
              <Field label="البريد الإلكتروني" type="email" value={form.email || ""} onChange={(v) => set("email", v)} dir="ltr" />
              <Field label="الهاتف" value={form.phone || ""} onChange={(v) => set("phone", v)} dir="ltr" />
              <Field label="Slug (للرابط)" value={form.slug || ""} onChange={(v) => set("slug", v)} dir="ltr" placeholder="e.g. mohammed-said-al-shater" />
            </>
          )}

          {activeTab === "academic" && (
            <>
              <Field label="المؤسسة" value={form.institution || ""} onChange={(v) => set("institution", v)} />
              <Field label="القسم" value={form.department || ""} onChange={(v) => set("department", v)} />
              <Field label="المنصب الحالي" value={form.position || ""} onChange={(v) => set("position", v)} />
              <Field label="التخصص العام" value={form.specialization || ""} onChange={(v) => set("specialization", v)} />
              <Field label="التخصص الدقيق" value={form.specializationDetail || ""} onChange={(v) => set("specializationDetail", v)} />
              <TextArea label="المؤهلات الأكاديمية" value={form.education || ""} onChange={(v) => set("education", v)} rows={5} />
              <TextArea label="مجالات البحث والاهتمامات" value={form.researchInterests || ""} onChange={(v) => set("researchInterests", v)} />
            </>
          )}

          {activeTab === "career" && (
            <>
              <TextArea label="ملخص المسيرة المهنية" value={form.careerSummary || ""} onChange={(v) => set("careerSummary", v)} rows={7} />
              <TextArea label="العضويات واللجان" value={form.memberships || ""} onChange={(v) => set("memberships", v)} rows={4} />
              <Field label="اللغات المتقنة" value={form.languages || ""} onChange={(v) => set("languages", v)} placeholder="العربية، الإنجليزية، الفرنسية" />
            </>
          )}

          {activeTab === "membership" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">نوع العضوية</label>
                <select
                  value={form.membershipType || "FOUNDER"}
                  onChange={(e) => set("membershipType", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3d1e]/30"
                >
                  {["FOUNDER", "Regular", "Honorary", "Board", "Student", "Life"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <Field label="رقم العضوية" value={form.membershipNumber || ""} onChange={(v) => set("membershipNumber", v)} dir="ltr" placeholder="SSSS-001" />
              <Field label="تاريخ الانضمام" type="date" value={form.joinedAt?.split("T")[0] || ""} onChange={(v) => set("joinedAt", v)} dir="ltr" />
              <Field label="عدد الأبحاث" type="number" value={form.publicationsCount?.toString() || ""} onChange={(v) => set("publicationsCount", parseInt(v) || undefined)} />
              <Field label="ORCID ID" value={form.orcidId || ""} onChange={(v) => set("orcidId", v)} dir="ltr" placeholder="0000-0000-0000-0000" />
              <Field label="Google Scholar URL" value={form.googleScholarUrl || ""} onChange={(v) => set("googleScholarUrl", v)} dir="ltr" type="url" />
              <Field label="LinkedIn URL" value={form.linkedinUrl || ""} onChange={(v) => set("linkedinUrl", v)} dir="ltr" type="url" />
              <div className="flex items-center gap-3 pt-1">
                <input type="checkbox" id="isPublic" checked={!!form.isPublic} onChange={(e) => set("isPublic", e.target.checked)} className="w-4 h-4 accent-[#5c3d1e]" />
                <label htmlFor="isPublic" className="text-sm text-gray-700">ظاهر للعموم</label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {error && <p className="px-6 text-sm text-red-600 text-center" dir="rtl">{error}</p>}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#5c3d1e] hover:bg-[#3d2810] text-white rounded-xl gap-2">
            {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", dir, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; dir?: "ltr" | "rtl"; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} dir={dir}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5c3d1e]/30 focus:bg-white"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 4 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5c3d1e]/30 focus:bg-white resize-none"
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminMemberProfilesPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [editProfile, setEditProfile] = useState<MemberProfile | null | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<MemberProfile | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-member-profiles", page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any>>(`/admin/members?page=${page}&size=20`);
      return res.data.data;
    },
  });

  const profiles: MemberProfile[] = data?.content || (Array.isArray(data) ? data : []);
  const totalPages: number = data?.totalPages || 1;

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/members/${id}/toggle-visibility`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-member-profiles"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/members/${id}`),
    onSuccess: () => { setConfirmDelete(null); queryClient.invalidateQueries({ queryKey: ["admin-member-profiles"] }); },
  });

  const filtered = search
    ? profiles.filter((p) =>
        getDisplayName(p).includes(search) ||
        (p.specialization || "").includes(search) ||
        (p.institution || "").includes(search)
      )
    : profiles;

  return (
    <div>
      <AdminPageHeader
        title={t("Member Profiles", "ملفات الأعضاء")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Member Profiles", "ملفات الأعضاء") },
        ]}
      />

      <div className="space-y-6">
        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text" placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)}
              dir="rtl"
              className="pr-9 pl-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3d1e]/30 w-64"
            />
          </div>
          <Button
            className="bg-[#5c3d1e] hover:bg-[#3d2810] text-white rounded-xl gap-2"
            onClick={() => setEditProfile(null)}
          >
            <Plus className="h-4 w-4" />
            {t("Add Member", "إضافة عضو")}
          </Button>
        </div>

        {/* ── Cards grid ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-gray-500" dir="rtl">لا توجد ملفات أعضاء</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((profile, idx) => {
              const photo = getPhoto(profile);
              const name = getDisplayName(profile);
              const initial = getInitial(profile);
              const gradient = GRADIENTS[idx % GRADIENTS.length];
              return (
                <div key={profile.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Color bar */}
                  <div className={`h-1 bg-gradient-to-r ${gradient}`} />
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white shadow-sm`}>
                        {photo ? (
                          <Image src={photo} alt={name} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                        ) : (
                          <span className="text-white text-lg font-black">{initial}</span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug truncate" dir="rtl">{name}</h3>
                        {profile.position && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate" dir="rtl">{profile.position}</p>
                        )}
                        {profile.institution && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-400 truncate">{profile.institution}</span>
                          </div>
                        )}
                      </div>
                      {/* Public toggle */}
                      <button
                        onClick={() => toggleMutation.mutate(profile.id)}
                        className={`p-1.5 rounded-lg transition-colors ${profile.isPublic ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        title={profile.isPublic ? "مرئي للعموم" : "مخفي"}
                      >
                        {profile.isPublic ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4" dir="rtl">
                      {profile.specializationDetail || profile.specialization ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#5c3d1e]/10 text-[#5c3d1e] rounded-full text-xs font-medium">
                          <GraduationCap className="h-2.5 w-2.5" />
                          {profile.specializationDetail || profile.specialization}
                        </span>
                      ) : null}
                      {profile.membershipType && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                          {profile.membershipType === "FOUNDER" ? "مؤسس" : profile.membershipType}
                        </span>
                      )}
                      {profile.membershipNumber && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {profile.membershipNumber}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Button
                        variant="outline" size="sm"
                        className="flex-1 gap-1.5 text-xs rounded-xl border-gray-200 hover:border-[#5c3d1e]/40 hover:text-[#5c3d1e]"
                        onClick={() => setEditProfile(profile)}
                      >
                        <Pencil className="h-3.5 w-3.5" /> تعديل
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="gap-1.5 text-xs rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400"
                        onClick={() => setConfirmDelete(profile)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-xl">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">صفحة {page + 1} من {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="rounded-xl">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ── Edit/Add Modal ───────────────────────────────────────────────── */}
      {editProfile !== undefined && (
        <MemberFormModal
          profile={editProfile}
          onClose={() => setEditProfile(undefined)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["admin-member-profiles"] })}
        />
      )}

      {/* ── Delete confirm ───────────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2" dir="rtl">تأكيد الحذف</h3>
            <p className="text-sm text-gray-600 mb-5" dir="rtl">
              هل أنت متأكد من حذف ملف <strong>{getDisplayName(confirmDelete)}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setConfirmDelete(null)} className="rounded-xl">إلغاء</Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "جارٍ الحذف..." : "حذف"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
