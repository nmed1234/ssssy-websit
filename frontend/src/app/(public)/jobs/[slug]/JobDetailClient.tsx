"use client";

import { useState } from "react";
import Link from "next/link";
import type { JobVacancy } from "@/types";
import { Briefcase, MapPin, Calendar, ArrowLeft, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import JobApplyModal from "@/components/jobs/JobApplyModal";
import { useLanguage } from "@/lib/language-context";

// ── Hero background layers (reused pattern) ──────────────────────────────

function HeroParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className="absolute rounded-full bg-white opacity-[0.12]"
          style={{ width: 3+(i%5)*2, height: 3+(i%5)*2, top:`${8+(i*41)%80}%`, left:`${3+(i*57)%94}%`,
            animation:`heroFloat ${3+i%4}s ease-in-out ${(i*0.4)%3}s infinite alternate` }} />
      ))}
      <style>{`@keyframes heroFloat{from{transform:translateY(0) scale(1)}to{transform:translateY(-10px) scale(1.15)}}`}</style>
    </div>
  );
}

// ── Sidebar detail row ────────────────────────────────────────────────────

function DetailRow({ icon, label, value, isAr, danger }: {
  icon: React.ReactNode; label: string; value?: string | null; isAr: boolean; danger?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 px-5 py-4 border-b last:border-0" style={{ borderColor:"var(--style-color-border,#f0f0f0)" }}>
      <span className="mt-0.5 shrink-0" style={{ color:"var(--style-color-primary,#7a5c3c)" }}>{icon}</span>
      <div className={isAr ? "text-right w-full" : "w-full"}>
        <p className="font-semibold text-xs mb-0.5" style={{ color:"var(--style-color-heading,#1a1a1a)" }}>{label}</p>
        <p className={`text-xs ${danger ? "text-red-500 font-semibold" : ""}`} style={danger ? {} : { color:"var(--style-color-muted,#666)" }}>{value}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

interface Props { initialJob: JobVacancy | null }

export default function JobDetailClient({ initialJob }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const locale = isAr ? "ar-SA" : "en-US";
  const [showApply, setShowApply] = useState(false);

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  if (!initialJob) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-24 text-center">
        <AlertCircle className="h-14 w-14 mx-auto mb-4 opacity-25" style={{ color:"var(--style-color-muted,#999)" }} />
        <p className="text-lg mb-6" style={{ color:"var(--style-color-muted,#888)" }}>
          {isAr ? "الوظيفة غير موجودة." : "Job vacancy not found."}
        </p>
        <Link href="/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ background:"var(--style-color-primary,#7a5c3c)", color:"#fff" }}>
          <BackArrow className="h-4 w-4" />
          {isAr ? "العودة إلى الوظائف" : "Back to Jobs"}
        </Link>
      </div>
    );
  }

  const job = initialJob;
  const isExpired = job.deadline && new Date(job.deadline) < new Date();
  const title = isAr ? (job.titleAr || job.titleEn || "") : (job.titleEn || job.titleAr || "");
  const deadlineStr = job.deadline
    ? new Date(job.deadline).toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })
    : null;

  const JOB_TYPE_AR: Record<string, string> = {
    "Full-time": "دوام كامل", "Part-time": "دوام جزئي",
    "Contract": "عقد", "Internship": "تدريب", "Remote": "عن بُعد",
  };
  const jobTypeLabel = job.jobType
    ? (isAr ? (JOB_TYPE_AR[job.jobType] || job.jobType) : job.jobType)
    : null;

  return (
    <div dir={isAr ? "rtl" : "ltr"}>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "300px" }}>
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, var(--style-color-primary,#5c3d1e) 0%, color-mix(in srgb,var(--style-color-primary,#5c3d1e) 80%,#000) 55%, color-mix(in srgb,var(--style-color-primary,#5c3d1e) 60%,#1a1a1a) 100%)`,
        }} />
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(255,255,255,0.06) 0%,transparent 65%)" }} aria-hidden="true" />
        <HeroParticles />
        {/* Diagonal stripe */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]" aria-hidden="true">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><defs>
            <pattern id="jobs-stripe" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="28" stroke="white" strokeWidth="2"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#jobs-stripe)"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 pt-10 pb-24 md:pb-28 relative z-10">
          {/* Back link */}
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium mb-8 opacity-80 hover:opacity-100 transition-opacity"
            style={{ color:"rgba(255,255,255,0.85)" }}>
            <BackArrow className="h-4 w-4" />
            {isAr ? "العودة إلى الوظائف" : "Back to Jobs"}
          </Link>

          {/* Chips */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {jobTypeLabel && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase backdrop-blur-sm"
                style={{ background:"rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.85)", border:"1px solid rgba(255,255,255,0.2)" }}>
                <Briefcase className="h-3 w-3" />
                {jobTypeLabel}
              </span>
            )}
            {isExpired && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background:"rgba(239,68,68,0.2)", color:"#fca5a5", border:"1px solid rgba(239,68,68,0.35)" }}>
                {isAr ? "منتهية الصلاحية" : "Expired"}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className={`${almarai.className} text-3xl md:text-5xl font-extrabold text-white leading-tight max-w-3xl mb-5`}>
            {title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color:"rgba(255,255,255,0.65)" }}>
            {job.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>}
            {job.department && <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{job.department}</span>}
            {deadlineStr && (
              <span className={`flex items-center gap-1.5 ${isExpired ? "text-red-300" : ""}`}>
                <Clock className="h-4 w-4" />
                {isAr ? `الموعد النهائي: ${deadlineStr}` : `Deadline: ${deadlineStr}`}
              </span>
            )}
          </div>

          {/* Apply CTA in hero */}
          {!isExpired && (
            <button
              onClick={() => setShowApply(true)}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background:"rgba(255,255,255,0.92)", color:"var(--style-color-primary,#5c3d1e)" }}
            >
              {isAr ? "تقدّم الآن" : "Apply Now"}
              {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          )}

          <div className="mt-8 h-px w-16 rounded-full" style={{ background:"rgba(255,255,255,0.3)" }} />
        </div>

        {/* Wave edge */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
            className="w-full" style={{ height:"clamp(32px,4vw,64px)", display:"block" }}>
            <path d="M0,32 C240,64 480,0 720,32 C960,64 1200,16 1440,32 L1440,64 L0,64 Z"
              fill="var(--style-color-bg,#ffffff)"/>
          </svg>
        </div>
      </section>

      {/* ── Body ────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20" style={{ background:"var(--style-color-bg,#fff)" }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              {job.description && (
                <div>
                  <h2 className={`${almarai.className} text-xl font-bold mb-4`} style={{ color:"var(--style-color-heading,#1a1a1a)" }}>
                    {isAr ? "وصف الوظيفة" : "Job Description"}
                  </h2>
                  <div className="rounded-2xl p-6 leading-relaxed text-base whitespace-pre-line"
                    style={{ background:"var(--style-color-surface,#f9fafb)", color:"var(--style-color-text,#444)", border:"1px solid var(--style-color-border,#e5e7eb)" }}>
                    {job.description}
                  </div>
                </div>
              )}
              {job.requirements && (
                <div>
                  <h2 className={`${almarai.className} text-xl font-bold mb-4`} style={{ color:"var(--style-color-heading,#1a1a1a)" }}>
                    {isAr ? "المتطلبات" : "Requirements"}
                  </h2>
                  <div className="rounded-2xl p-6 leading-relaxed text-base whitespace-pre-line"
                    style={{ background:"var(--style-color-surface,#f9fafb)", color:"var(--style-color-text,#444)", border:"1px solid var(--style-color-border,#e5e7eb)" }}>
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Apply CTA below description */}
              {!isExpired && (
                <button
                  onClick={() => setShowApply(true)}
                  className="w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background:"var(--style-color-primary,#7a5c3c)", color:"#fff" }}
                >
                  {isAr ? "تقدّم لهذه الوظيفة" : "Apply for This Position"}
                </button>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              {/* Details card */}
              <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid var(--style-color-border,#e5e7eb)", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="px-5 py-4" style={{ background:"var(--style-color-primary,#7a5c3c)" }}>
                  <h3 className={`${almarai.className} font-bold text-base text-white`}>
                    {isAr ? "تفاصيل الوظيفة" : "Position Details"}
                  </h3>
                </div>
                <div style={{ background:"var(--style-color-card-bg,#fff)" }}>
                  <DetailRow icon={<Briefcase className="h-4 w-4" />} label={isAr ? "نوع الوظيفة" : "Job Type"} value={jobTypeLabel} isAr={isAr} />
                  <DetailRow icon={<MapPin className="h-4 w-4" />} label={isAr ? "الموقع" : "Location"} value={job.location || (isAr ? "غير محدد" : "Remote / Unspecified")} isAr={isAr} />
                  <DetailRow icon={<Briefcase className="h-4 w-4" />} label={isAr ? "القسم" : "Department"} value={job.department} isAr={isAr} />
                  <DetailRow icon={<Calendar className="h-4 w-4" />} label={isAr ? "آخر موعد للتقديم" : "Application Deadline"}
                    value={deadlineStr ? (isExpired ? `${deadlineStr} ${isAr ? "(منتهية)" : "(Expired)"}` : deadlineStr) : null}
                    isAr={isAr} danger={!!isExpired} />
                </div>
              </div>

              {/* Back link */}
              <Link href="/jobs"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                style={{ border:"1px solid color-mix(in srgb,var(--style-color-primary,#7a5c3c) 22%,transparent)", color:"var(--style-color-primary,#7a5c3c)", background:"color-mix(in srgb,var(--style-color-primary,#7a5c3c) 6%,transparent)" }}>
                <BackArrow className="h-4 w-4" />
                {isAr ? "كل الوظائف" : "All Jobs"}
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {showApply && (
        <JobApplyModal
          jobVacancyId={job.id}
          jobTitle={isAr ? (job.titleAr || job.titleEn || "") : (job.titleEn || job.titleAr || "")}
          onClose={() => setShowApply(false)}
        />
      )}
    </div>
  );
}
