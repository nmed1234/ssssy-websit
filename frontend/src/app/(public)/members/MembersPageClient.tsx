"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Search, Users, X, Filter, ArrowLeft, Mail, Building2, GraduationCap, ChevronRight } from "lucide-react";
import { almarai } from "@/lib/fonts";
import api from "@/lib/api";
import { PageHero } from "@/components/ui/page-hero";

interface Member {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  nameAr?: string;
  nameEn?: string;
  titleAr?: string;
  institution?: string;
  department?: string;
  position?: string;
  specialization?: string;
  specializationDetail?: string;
  photoUrl?: string;
  photo?: string;
  membershipType?: string;
  slug?: string;
  email?: string;
  publicationsCount?: number;
}

interface Props {
  initialMembers: Member[];
  initialTotalPages: number;
}

const FALLBACK_MEMBERSHIP_TYPES = ["", "FOUNDER", "Regular", "Student", "Honorary", "Life", "Board"];
const FALLBACK_SPECIALIZATIONS = ["", "علوم التربة", "Soil Science", "Agronomy", "Environmental Science", "Land Management"];

function getMemberName(m: Member): string {
  return m.nameAr || m.nameEn || `${m.firstName || ""} ${m.lastName || ""}`.trim() || "—";
}

function getMemberInitial(m: Member): string {
  const name = getMemberName(m);
  return name[0]?.toUpperCase() || "?";
}

function getPhotoSrc(m: Member): string | null {
  return m.photoUrl || m.photo || null;
}

// Gradient per member index for avatar fallback
const GRADIENTS = [
  "from-[#5c3d1e] to-[#3b7a57]",
  "from-[#2563eb] to-[#7c3aed]",
  "from-[#d97706] to-[#dc2626]",
  "from-[#059669] to-[#0284c7]",
  "from-[#7c3aed] to-[#db2777]",
  "from-[#0f766e] to-[#1d4ed8]",
  "from-[#b45309] to-[#7c3aed]",
  "from-[#166534] to-[#1e40af]",
];

function getMembershipLabel(type?: string): { label: string; cls: string } {
  switch (type) {
    case "FOUNDER":  return { label: "عضو مؤسس", cls: "bg-amber-100 text-amber-800 border-amber-300" };
    case "MEMBER":   return { label: "عضو", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    case "Regular":  return { label: "عضو عادي", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    case "Honorary": return { label: "عضو فخري", cls: "bg-purple-100 text-purple-800 border-purple-300" };
    case "Board":    return { label: "مجلس إدارة", cls: "bg-blue-100 text-blue-800 border-blue-300" };
    case "Student":  return { label: "طالب", cls: "bg-sky-100 text-sky-800 border-sky-300" };
    default:         return { label: type || "عضو", cls: "bg-gray-100 text-gray-700 border-gray-300" };
  }
}

function MemberCard({ member, index, onClick }: { member: Member; index: number; onClick: () => void }) {
  const photo = getPhotoSrc(member);
  const name = getMemberName(member);
  const initial = getMemberInitial(member);
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const badge = getMembershipLabel(member.membershipType);
  const linkHref = member.slug ? `/members/${member.slug}` : null;

  const inner = (
    <div
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-gray-200 transition-all duration-500 ease-out cursor-pointer overflow-hidden flex flex-col"
      style={{ willChange: "transform, box-shadow" }}
      onClick={!linkHref ? onClick : undefined}
    >
      {/* Top color bar — widens on hover */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient} group-hover:h-2 transition-all duration-500`} />

      {/* Subtle gradient overlay that fades in on hover */}
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none rounded-2xl`} />

      {/* Card body */}
      <div className="flex flex-col items-center px-5 pt-8 pb-6 flex-1 relative z-10">

        {/* Avatar with zoom + shimmer ring on hover */}
        <div className="relative mb-4">
          {/* Pulsing glow ring */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-30 blur-md scale-110 transition-all duration-500`} />

          {/* Avatar circle */}
          <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md ring-4 ring-white overflow-hidden group-hover:ring-[5px] group-hover:shadow-xl transition-all duration-500`}>
            {photo ? (
              <Image
                src={photo}
                alt={name}
                width={96}
                height={96}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                unoptimized
              />
            ) : (
              <span className="text-white text-3xl font-black select-none transition-transform duration-500 group-hover:scale-110 inline-block">{initial}</span>
            )}
          </div>
        </div>

        {/* Name — slight lift on hover */}
        <h3
          className={`${almarai.className} text-center text-base font-bold text-gray-900 leading-snug mb-1 transition-colors duration-300 group-hover:text-[#5c3d1e]`}
          dir="rtl"
        >
          {name}
        </h3>

        {/* Position */}
        {member.position && (
          <p className="text-xs text-gray-500 text-center mb-1 line-clamp-2 transition-colors duration-300 group-hover:text-gray-700" dir="rtl">
            {member.position}
          </p>
        )}

        {/* Specialization detail */}
        {(member.specializationDetail || member.specialization) && (
          <p className="text-xs font-medium text-[#5c3d1e] text-center mb-3 transition-opacity duration-300 group-hover:opacity-90">
            {member.specializationDetail || member.specialization}
          </p>
        )}

        {/* Institution */}
        {member.institution && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-4 text-center transition-colors duration-300 group-hover:text-gray-600">
            <Building2 className="h-3 w-3 shrink-0 text-gray-400 group-hover:text-[#5c3d1e] transition-colors duration-300" />
            <span className="line-clamp-1">{member.institution}</span>
          </div>
        )}

        {/* Membership badge — scales up on hover */}
        <span className={`mt-auto inline-block px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {/* Hover footer — slides up from bottom */}
      <div className="relative z-10 border-t border-gray-100 group-hover:border-gray-200 px-5 py-3 flex items-center justify-center gap-1.5 text-xs font-medium text-[#5c3d1e] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-400 bg-gradient-to-r from-gray-50 via-white to-gray-50">
        <span>عرض الملف الكامل</span>
        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </div>
    </div>
  );

  if (linkHref) {
    return <Link href={linkHref} className="block">{inner}</Link>;
  }
  return inner;
}

// Quick preview modal (for members without a slug)
function MemberModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const photo = getPhotoSrc(member);
  const name = getMemberName(member);
  const initial = getMemberInitial(member);
  const idx = 0;
  const gradient = GRADIENTS[idx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`bg-gradient-to-br ${gradient} px-6 pt-8 pb-12 relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden mb-3">
              {photo ? (
                <Image src={photo} alt={name} width={80} height={80} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="text-white text-2xl font-black">{initial}</span>
              )}
            </div>
            <h2 className={`${almarai.className} text-xl font-bold text-white`} dir="rtl">{name}</h2>
            {member.position && <p className="text-white/70 text-sm mt-1">{member.position}</p>}
          </div>
        </div>
        {/* Body */}
        <div className="px-6 py-5 -mt-6 space-y-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2.5 text-sm">
            {member.institution && (
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-[#5c3d1e] mt-0.5 shrink-0" />
                <span className="text-gray-700">{member.institution}</span>
              </div>
            )}
            {(member.specializationDetail || member.specialization) && (
              <div className="flex items-start gap-2">
                <GraduationCap className="h-4 w-4 text-[#5c3d1e] mt-0.5 shrink-0" />
                <span className="text-gray-700">{member.specializationDetail || member.specialization}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-[#5c3d1e] mt-0.5 shrink-0" />
                <a href={`mailto:${member.email}`} className="text-[#5c3d1e] hover:underline break-all">{member.email}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembersPageClient({ initialMembers, initialTotalPages }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endpointMissing, setEndpointMissing] = useState(false);
  const [membershipTypes, setMembershipTypes] = useState<string[]>(FALLBACK_MEMBERSHIP_TYPES);
  const [specializations, setSpecializations] = useState<string[]>(FALLBACK_SPECIALIZATIONS);
  const [keyword, setKeyword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [institution, setInstitution] = useState("");
  const [membershipType, setMembershipType] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalElements, setTotalElements] = useState(initialMembers.length);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const pageSize = 12;

  useEffect(() => {
    api.get<{ success: boolean; data: string[] }>("/public/users/members/membership-types")
      .then((res) => { if (res.data.success && res.data.data.length > 0) setMembershipTypes(["", ...res.data.data]); })
      .catch(() => {});
    api.get<{ success: boolean; data: string[] }>("/public/users/members/specializations")
      .then((res) => { if (res.data.success && res.data.data.length > 0) setSpecializations(["", ...res.data.data]); })
      .catch(() => {});
  }, []);

  const fetchMembers = useCallback(async (pageOverride?: number) => {
    setLoading(true); setError(null); setEndpointMissing(false);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (specialization) params.set("specialization", specialization);
      if (institution) params.set("institution", institution);
      if (membershipType) params.set("membershipType", membershipType);
      params.set("page", String(pageOverride ?? page));
      params.set("size", String(pageSize));
      const response = await api.get(`/public/users/members?${params.toString()}`);
      const body = response.data;
      if (body.success) {
        const raw = body.data;
        if (Array.isArray(raw)) { setMembers(raw); setTotalPages(1); setTotalElements(raw.length); }
        else if (raw.content) { setMembers(raw.content); setTotalPages(raw.totalPages || 1); setTotalElements(raw.totalElements || raw.content.length); }
        else { setMembers([]); setTotalPages(0); setTotalElements(0); }
      } else {
        setError(body.message || "Failed to load members.");
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      if (e.response?.status === 404) { setEndpointMissing(true); setMembers([]); }
      else setError(e.response?.data?.message || "تعذّر تحميل قائمة الأعضاء. يرجى المحاولة مرة أخرى.");
    } finally { setLoading(false); }
  }, [keyword, specialization, institution, membershipType, page]);

  useEffect(() => {
    if (page > 0) fetchMembers(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(0); fetchMembers(0); };
  const handleReset = () => { setKeyword(""); setSpecialization(""); setInstitution(""); setMembershipType(""); setPage(0); };

  return (
    <div>
      <PageHero slug="members" defaultTitle="أعضاء الجمعية" defaultSubtitleAr="الأعضاء" />

      <section className="py-12 md:py-16" style={{ background: "var(--style-color-bg, #ffffff)" }}>
        <div className="container mx-auto px-4">

          {endpointMissing ? (
            <div className="text-center py-16 max-w-lg mx-auto">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className={`${almarai.className} text-2xl font-bold text-gray-900 mb-3`}>دليل الأعضاء</h3>
              <p className="text-gray-500 mb-6">دليل الأعضاء قيد الإعداد. يرجى تسجيل الدخول للاطلاع على الملفات الكاملة.</p>
              <Link href="/auth/login"><Button className="bg-[#5c3d1e] hover:bg-[#3d2810] text-white">تسجيل الدخول</Button></Link>
            </div>
          ) : (
            <>
              {/* ── Search & Filters ─────────────────────────────────────── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <form onSubmit={handleSearch}>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ابحث بالاسم..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        dir="rtl"
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c3d1e]/30 focus:border-[#5c3d1e]"
                      />
                    </div>
                    <Button type="submit" className="bg-[#5c3d1e] hover:bg-[#3d2810] text-white rounded-xl">
                      <Search className="h-4 w-4 ml-2" />بحث
                    </Button>
                    <Button
                      type="button" variant="outline"
                      onClick={() => setFiltersOpen(!filtersOpen)}
                      className="border-gray-200 text-gray-700 rounded-xl hover:border-[#5c3d1e]/40"
                    >
                      <Filter className="h-4 w-4 ml-2" />فلترة
                    </Button>
                  </div>
                  {filtersOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" dir="rtl">التخصص</label>
                        <select dir="rtl" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5c3d1e]/30">
                          {specializations.map((s) => <option key={s} value={s}>{s || "كل التخصصات"}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" dir="rtl">المؤسسة</label>
                        <input dir="rtl" type="text" placeholder="مثال: جامعة دمشق" value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5c3d1e]/30" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" dir="rtl">نوع العضوية</label>
                        <select dir="rtl" value={membershipType} onChange={(e) => setMembershipType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5c3d1e]/30">
                          {membershipTypes.map((t) => <option key={t} value={t}>{t || "كل الأنواع"}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-3 flex justify-end">
                        <Button type="button" variant="ghost" onClick={handleReset} className="text-gray-500 hover:text-gray-900 text-sm">
                          إعادة تعيين
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* ── Grid ─────────────────────────────────────────────────── */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                      <div className="h-1.5 bg-gray-200 w-full" />
                      <div className="flex flex-col items-center px-5 pt-8 pb-6 gap-3">
                        <div className="w-24 h-24 rounded-full bg-gray-200" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <p className="text-gray-500">{error}</p>
                  <Button onClick={() => fetchMembers()} className="mt-4 bg-[#5c3d1e] hover:bg-[#3d2810] text-white">إعادة المحاولة</Button>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">لا يوجد أعضاء</p>
                  <p className="text-gray-400 text-sm">حاول تغيير معايير البحث.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-6 text-right" dir="rtl">
                    عرض {members.length} من أصل {totalElements} عضو
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {members.map((member, i) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        index={i}
                        onClick={() => setSelectedMember(member)}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12" dir="rtl">
                      <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-xl border-gray-200">
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Button key={i} variant={i === page ? "default" : "outline"} size="sm" onClick={() => setPage(i)}
                          className={`rounded-xl ${i === page ? "bg-[#5c3d1e] hover:bg-[#3d2810] text-white border-[#5c3d1e]" : "border-gray-200 text-gray-700"}`}>
                          {i + 1}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="rounded-xl border-gray-200">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      {selectedMember && <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
}
