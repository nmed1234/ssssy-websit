"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getVacancyBySlug } from "@/lib/jobs";
import type { JobVacancy } from "@/types";
import { Briefcase, MapPin, Calendar, Clock, DollarSign, ArrowLeft } from "lucide-react";
import JobApplyModal from "@/components/jobs/JobApplyModal";

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<JobVacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    if (params.slug) {
      getVacancyBySlug(params.slug as string)
        .then((res) => {
          if (res.data.success) setJob(res.data.data);
          else setError(true);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-soil-sand/50 rounded w-1/3" />
          <div className="h-4 bg-soil-sand/50 rounded w-1/4" />
          <div className="h-64 bg-soil-sand/50 rounded" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-earth-gray text-lg">Job vacancy not found.</p>
        <Link href="/jobs" className="text-soil-clay hover:underline mt-4 inline-block">Back to Jobs</Link>
      </div>
    );
  }

  const isExpired = job.deadline && new Date(job.deadline) < new Date();

  return (
    <div>
      <section className="relative bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-soil-sand hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Link>
          <h1 className="fluid-4xl md:fluid-5xl font-bold font-heading">{job.titleEn || job.titleAr}</h1>
          <p className="mt-4 fluid-lg text-soil-sand">{job.jobType}</p>
          {!isExpired && (
            <Button
              size="lg"
              className="mt-6 bg-white text-soil-dark hover:bg-soil-sand"
              onClick={() => setShowApply(true)}
            >
              Apply Now
            </Button>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 @container">
            <div className="md:col-span-2">
              <div className="prose max-w-none">
                <h2 className="fluid-xl font-semibold text-soil-dark mb-4">Job Description</h2>
                <p className="text-earth-gray leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              {job.requirements && (
                <div className="mt-8">
                  <h2 className="fluid-xl font-semibold text-soil-dark mb-4">Requirements</h2>
                  <p className="text-earth-gray leading-relaxed whitespace-pre-line">{job.requirements}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Card className="border-soil-sand/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-soil-dark">Position Details</h3>
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-soil-clay mt-0.5" />
                    <div>
                      <p className="fluid-sm font-medium text-soil-dark">Job Type</p>
                      <p className="fluid-sm text-earth-gray">{job.jobType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-soil-clay mt-0.5" />
                    <div>
                      <p className="fluid-sm font-medium text-soil-dark">Location</p>
                      <p className="fluid-sm text-earth-gray">{job.location || "Remote / Unspecified"}</p>
                    </div>
                  </div>
                  {job.deadline && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-soil-clay mt-0.5" />
                      <div>
                        <p className="fluid-sm font-medium text-soil-dark">Application Deadline</p>
                        <p className={`fluid-sm ${isExpired ? "text-red-500" : "text-earth-gray"}`}>
                          {new Date(job.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          {isExpired && " (Expired)"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {!isExpired && (
                <Button
                  className="w-full bg-soil-clay hover:bg-soil-dark text-white"
                  size="lg"
                  onClick={() => setShowApply(true)}
                >
                  Apply for this Position
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {showApply && (
        <JobApplyModal
          jobVacancyId={job.id}
          jobTitle={job.titleEn || job.titleAr || "Job Position"}
          onClose={() => setShowApply(false)}
        />
      )}
    </div>
  );
}
