"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface Job { titleEn?: string; titleAr?: string; location?: string; typeEn?: string; typeAr?: string; departmentEn?: string; departmentAr?: string; slug?: string; postedDate?: string; }
interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function JobsFeedSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr        = language === "ar";
  const title       = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle    = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const viewAllLabel= isAr ? ((config.viewAllLabelAr ?? "") as string) : ((config.viewAllLabelEn ?? "View all jobs") as string);
  const viewAllUrl  = (config.viewAllUrl as string) ?? "/jobs";
  const jobs        = (Array.isArray(data.jobs) ? data.jobs : []) as Job[];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            {title    && <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
            {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
          </div>
          {viewAllLabel && <Link href={viewAllUrl} className="text-sm font-medium hover:underline" style={{ color: "var(--style-color-primary, #2d6a4f)" }}>{viewAllLabel} →</Link>}
        </div>
        {jobs.length === 0 ? <p className="text-center text-gray-400 text-sm py-8">No jobs configured.</p> : (
          <div className="space-y-3">
            {jobs.map((job, i) => {
              const t   = isAr ? (job.titleAr ?? job.titleEn ?? "") : (job.titleEn ?? "");
              const typ = isAr ? (job.typeAr ?? job.typeEn ?? "") : (job.typeEn ?? "");
              const dep = isAr ? (job.departmentAr ?? job.departmentEn ?? "") : (job.departmentEn ?? "");
              const url = job.slug ? `/jobs/${job.slug}` : "#";
              return (
                <Link key={i} href={url}
                  className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4 hover:shadow-sm hover:border-gray-300 transition-all group">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-800 group-hover:text-soil-dark truncate">{t}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {dep && <span className="text-xs text-gray-500">{dep}</span>}
                      {job.location && <span className="text-xs text-gray-400">· {job.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {typ && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">{typ}</span>}
                    {job.postedDate && <span className="text-xs text-gray-400">{job.postedDate}</span>}
                    <svg className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
