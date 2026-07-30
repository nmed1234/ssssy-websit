"use client";

import Link from "next/link";
import Image from "next/image";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Mail, Phone, Building2, GraduationCap, Briefcase,
  BookOpen, Globe, Award, AlertCircle, User, MapPin, Calendar,
  FlaskConical, Users, Languages
} from "lucide-react";

interface MemberData {
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
}

interface Props {
  initialMember: unknown;
}

function getDisplayName(m: MemberData): string {
  return m.nameAr || m.nameEn || `${m.firstName || ""} ${m.lastName || ""}`.trim() || "—";
}

function getPhoto(m: MemberData): string | null {
  return m.photoUrl || m.photo || null;
}

function getInitial(m: MemberData): string {
  return getDisplayName(m)[0]?.toUpperCase() || "?";
}

function formatLines(text?: string) {
  if (!text) return null;
  return text.split("\n").filter(Boolean).map((line, i) => (
    <p key={i} className="text-gray-600 leading-relaxed text-sm">{line}</p>
  ));
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#5c3d1e]/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[#5c3d1e]" />
      </div>
      <h2 className={`${almarai.className} text-lg font-bold text-gray-900`} dir="rtl">{title}</h2>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right" dir="rtl">{value}</span>
    </div>
  );
}

export default function MemberDetailClient({ initialMember }: Props) {
  if (!initialMember) {
    return (
      <div>
        <section className="bg-gradient-to-br from-[#3d2810] to-[#5c3d1e] text-white">
          <div className="container mx-auto px-4 py-20">
            <Link href="/members" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> العودة إلى الأعضاء
            </Link>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center max-w-lg">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h2 className={`${almarai.className} text-2xl font-bold text-gray-900 mb-3`}>لم يتم العثور على العضو</h2>
            <p className="text-gray-500 mb-6">العضو الذي تبحث عنه غير موجود أو ملفه غير متاح للعموم.</p>
            <Link href="/members"><Button className="bg-[#5c3d1e] hover:bg-[#3d2810] text-white">تصفح جميع الأعضاء</Button></Link>
          </div>
        </section>
      </div>
    );
  }

  const m = initialMember as MemberData;
  const fullName = getDisplayName(m);
  const photo = getPhoto(m);
  const initial = getInitial(m);

  return (
    <div className="bg-white">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "320px" }}>
        {/* Blurred background */}
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover -z-10 scale-110 blur-md" />
        )}
        <div className="absolute inset-0" style={{
          background: photo
            ? "linear-gradient(135deg,rgba(30,15,5,0.94) 0%,rgba(92,61,30,0.88) 60%,rgba(30,15,5,0.80) 100%)"
            : "linear-gradient(135deg,#3d2810 0%,#5c3d1e 55%,#3d5c2a 100%)",
        }} />
        {/* Pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg className="w-full h-full"><defs>
            <pattern id="stripe" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="24" stroke="white" strokeWidth="1.5"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#stripe)"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 pt-10 pb-24 relative z-10">
          <Link href="/members" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> العودة إلى الأعضاء
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            {/* Avatar */}
            <div className="shrink-0">
              {photo ? (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-xl border-2 border-white/25">
                  <Image src={photo} alt={fullName} width={144} height={144} className="w-full h-full object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/15 border-2 border-white/20 flex items-center justify-center shadow-xl">
                  <span className="text-white text-5xl font-black">{initial}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-right" dir="rtl">
              {m.membershipType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3"
                  style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  {m.membershipType === "FOUNDER" ? "عضو مؤسس" : m.membershipType}
                </span>
              )}
              <h1 className={`${almarai.className} text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight`}>
                {fullName}
              </h1>
              {m.position && <p className="mt-2 text-base text-white/70">{m.position}</p>}
              {m.institution && (
                <p className="mt-1 text-sm text-white/50 flex items-center gap-1.5 justify-center md:justify-start">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />{m.institution}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
            className="w-full" style={{ height: "clamp(32px,4vw,64px)", display: "block" }}>
            <path d="M0,32 C240,64 480,0 720,32 C960,64 1200,16 1440,32 L1440,64 L0,64 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Main column ──────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8" dir="rtl">

              {/* Career summary */}
              {m.careerSummary && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <SectionTitle icon={Briefcase} title="المسيرة المهنية" />
                  <div className="space-y-2">{formatLines(m.careerSummary)}</div>
                </div>
              )}

              {/* Education */}
              {m.education && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <SectionTitle icon={GraduationCap} title="المؤهلات الأكاديمية" />
                  <div className="space-y-2">{formatLines(m.education)}</div>
                </div>
              )}

              {/* Research interests */}
              {m.researchInterests && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <SectionTitle icon={FlaskConical} title="مجالات البحث والاهتمامات" />
                  <div className="space-y-2">{formatLines(m.researchInterests)}</div>
                </div>
              )}

              {/* Memberships & committees */}
              {m.memberships && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <SectionTitle icon={Users} title="العضويات واللجان" />
                  <div className="space-y-2">{formatLines(m.memberships)}</div>
                </div>
              )}

              {/* Languages */}
              {m.languages && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <SectionTitle icon={Languages} title="المهارات اللغوية" />
                  <div className="flex flex-wrap gap-2 mt-1">
                    {m.languages.split("،").map((lang, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 font-medium">
                        {lang.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Contact */}
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <h3 className={`${almarai.className} font-bold text-gray-900 flex items-center gap-2`} dir="rtl">
                    <Mail className="h-4 w-4 text-[#5c3d1e]" /> معلومات التواصل
                  </h3>
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="flex items-start gap-2 text-sm text-[#5c3d1e] hover:underline break-all">
                      <Mail className="h-4 w-4 mt-0.5 shrink-0" />{m.email}
                    </a>
                  )}
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 shrink-0 text-[#5c3d1e]" />{m.phone}
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Personal info */}
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <h3 className={`${almarai.className} font-bold text-gray-900 mb-3 flex items-center gap-2`} dir="rtl">
                    <User className="h-4 w-4 text-[#5c3d1e]" /> المعلومات الشخصية
                  </h3>
                  <InfoRow label="الجنسية" value={m.nationality} />
                  {m.birthYear && <InfoRow label="سنة الميلاد" value={`${m.birthYear}${m.birthCity ? ` — ${m.birthCity}` : ""}`} />}
                  <InfoRow label="الحالة الاجتماعية" value={m.maritalStatus} />
                </CardContent>
              </Card>

              {/* Professional info */}
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <h3 className={`${almarai.className} font-bold text-gray-900 mb-3 flex items-center gap-2`} dir="rtl">
                    <Building2 className="h-4 w-4 text-[#5c3d1e]" /> المعلومات المهنية
                  </h3>
                  <InfoRow label="المؤسسة" value={m.institution} />
                  <InfoRow label="القسم" value={m.department} />
                  <InfoRow label="المنصب" value={m.position} />
                  <InfoRow label="التخصص العام" value={m.specialization} />
                  <InfoRow label="التخصص الدقيق" value={m.specializationDetail} />
                  {m.publicationsCount != null && m.publicationsCount > 0 && (
                    <InfoRow label="عدد الأبحاث" value={`${m.publicationsCount} بحث`} />
                  )}
                </CardContent>
              </Card>

              {/* Membership */}
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <h3 className={`${almarai.className} font-bold text-gray-900 mb-3 flex items-center gap-2`} dir="rtl">
                    <Award className="h-4 w-4 text-[#5c3d1e]" /> العضوية
                  </h3>
                  <InfoRow label="النوع" value={m.membershipType === "FOUNDER" ? "عضو مؤسس" : m.membershipType} />
                  <InfoRow label="رقم العضوية" value={m.membershipNumber} />
                  {m.joinedAt && <InfoRow label="تاريخ الانضمام" value={new Date(m.joinedAt).getFullYear().toString()} />}
                </CardContent>
              </Card>

              {/* Academic links */}
              {(m.orcidId || m.googleScholarUrl || m.linkedinUrl) && (
                <Card className="rounded-2xl border-gray-100 shadow-sm">
                  <CardContent className="p-5 space-y-3">
                    <h3 className={`${almarai.className} font-bold text-gray-900 flex items-center gap-2`} dir="rtl">
                      <Globe className="h-4 w-4 text-[#5c3d1e]" /> روابط أكاديمية
                    </h3>
                    {m.orcidId && (
                      <a href={`https://orcid.org/${m.orcidId}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#5c3d1e] hover:underline">
                        <Globe className="h-3.5 w-3.5" /> ORCID
                      </a>
                    )}
                    {m.googleScholarUrl && (
                      <a href={m.googleScholarUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#5c3d1e] hover:underline">
                        <BookOpen className="h-3.5 w-3.5" /> Google Scholar
                      </a>
                    )}
                    {m.linkedinUrl && (
                      <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#5c3d1e] hover:underline">
                        <Globe className="h-3.5 w-3.5" /> LinkedIn
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Location */}
              {(m.birthCity || m.nationality) && (
                <Card className="rounded-2xl border-gray-100 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className={`${almarai.className} font-bold text-gray-900 mb-3 flex items-center gap-2`} dir="rtl">
                      <MapPin className="h-4 w-4 text-[#5c3d1e]" /> الموقع الجغرافي
                    </h3>
                    {m.birthCity && <InfoRow label="مدينة الميلاد" value={m.birthCity} />}
                    <InfoRow label="الجنسية" value={m.nationality} />
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
