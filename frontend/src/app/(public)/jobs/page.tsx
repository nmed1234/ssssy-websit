"use client";

import { useCallback, useEffect, useState } from "react";
import { almarai } from "@/lib/fonts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPublishedVacancies, submitApplication } from "@/lib/jobs";
import type { JobVacancy } from "@/types";
import { Briefcase, MapPin, Clock, X, CheckCircle, AlertCircle } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";


interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  coverLetter: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  coverLetter?: string;
}

export default function JobsPage() {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    coverLetter: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchVacancies = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getPublishedVacancies(page, 20);
      if (res.data.success) {
        setVacancies(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  const openApplyForm = (id: string) => {
    setApplyingTo(id);
    setFormData({ firstName: "", lastName: "", email: "", phone: "", coverLetter: "" });
    setFormErrors({});
    setSubmitSuccess(false);
    setSubmitError("");
  };

  const closeApplyForm = () => {
    setApplyingTo(null);
  };

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !applyingTo) return;
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    try {
      const res = await submitApplication(applyingTo, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        coverLetter: formData.coverLetter || undefined,
      });
      if (res.data.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(res.data.message || "Failed to submit application.");
      }
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deadlineInfo = (deadline: string | undefined): { label: string; expired: boolean } => {
    if (!deadline) return { label: "No deadline", expired: false };
    const now = new Date();
    const deadlineDate = new Date(deadline);
    if (deadlineDate < now) return { label: "Expired", expired: true };
    const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { label: `${diff} day${diff === 1 ? "" : "s"} left`, expired: false };
  };

  return (
    <div>
      <PageHero
        slug="jobs"
        defaultTitle="Job Vacancies"
        defaultSubtitleAr="الوظائف الشاغرة"
        defaultDescription="Explore career opportunities at SSSS and partner organizations."
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path d="M0,150 C200,50 400,250 600,150 C800,50 1000,200 1000,150 L1000,300 L0,300 Z" fill="#D7CCC8" />
            <path d="M0,200 C300,100 500,300 800,200 C900,150 1000,250 1000,200 L1000,300 L0,300 Z" fill="#8D6E63" opacity="0.5" />
          </svg>
        </div>
      </PageHero>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          {loading && <ListSkeleton />}
          {error && <ErrorState />}
          {!loading && !error && vacancies.length === 0 && <EmptyState />}
          {!loading && !error && vacancies.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 @container">
                {vacancies.map((job) => {
                  const deadline = deadlineInfo(job.deadline);
                  return (
                    <Card key={job.id} className="border-soil-sand/50 hover:shadow-md transition-shadow">
                      <CardContent className="@sm:p-4 @md:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-soil-dark fluid-lg">
                              {job.titleEn || job.titleAr}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2 fluid-sm text-earth-gray">
                              {job.department && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  {job.department}
                                </span>
                              )}
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {job.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {job.jobType && (
                              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-soil-clay/10 text-soil-clay border border-soil-clay/20">
                                {job.jobType}
                              </span>
                            )}
                            <span
                              className={`text-xs font-medium ${
                                deadline.expired ? "text-red-500" : "text-forest"
                              }`}
                            >
                              {deadline.label}
                            </span>
                          </div>
                        </div>
                        {job.description && (
                          <p className="fluid-sm text-earth-gray mt-3 line-clamp-2">{job.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-4">
                          <a
                            href={`/jobs/${job.slug}`}
                            className="fluid-sm font-medium text-soil-clay hover:text-soil-dark transition-colors"
                          >
                            View Details &rarr;
                          </a>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={deadline.expired}
                            onClick={() => openApplyForm(job.id)}
                          >
                            Apply Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="fluid-sm text-earth-gray px-3">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {applyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-soil-sand/30">
              <h3 className="text-lg font-semibold text-soil-dark">Apply for Position</h3>
              <button onClick={closeApplyForm} className="p-1 text-earth-gray hover:text-soil-dark transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            {submitSuccess ? (
              <div className="p-6 text-center">
                <CheckCircle className="h-16 w-16 text-forest mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-soil-dark mb-2">Application Submitted!</h4>
                <p className="text-earth-gray fluid-sm">Thank you for your application. We will review it and get back to you.</p>
                <Button variant="default" className="mt-6" onClick={closeApplyForm}>
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {submitError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md fluid-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {submitError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-soil-dark mb-1">First Name *</label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent ${
                        formErrors.firstName ? "border-red-400" : "border-soil-sand"
                      }`}
                      value={formData.firstName}
                      onChange={(e) => setFormData((f) => ({ ...f, firstName: e.target.value }))}
                    />
                    {formErrors.firstName && <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soil-dark mb-1">Last Name *</label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent ${
                        formErrors.lastName ? "border-red-400" : "border-soil-sand"
                      }`}
                      value={formData.lastName}
                      onChange={(e) => setFormData((f) => ({ ...f, lastName: e.target.value }))}
                    />
                    {formErrors.lastName && <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-soil-dark mb-1">Email *</label>
                    <input
                      type="email"
                      className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent ${
                        formErrors.email ? "border-red-400" : "border-soil-sand"
                      }`}
                      value={formData.email}
                      onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                    />
                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soil-dark mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 rounded-md border border-soil-sand text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent"
                      value={formData.phone}
                      onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-soil-dark mb-1">Cover Letter</label>
                  <textarea
                    rows={5}
                    className="w-full px-3 py-2 rounded-md border border-soil-sand text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent resize-none"
                    value={formData.coverLetter}
                    onChange={(e) => setFormData((f) => ({ ...f, coverLetter: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={closeApplyForm}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="secondary" className="flex-1" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 @container">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse border-soil-sand/50">
          <CardContent className="p-6 space-y-4">
            <div className="h-5 bg-soil-sand/50 rounded w-3/4" />
            <div className="h-3 bg-soil-sand/50 rounded w-1/2" />
            <div className="h-3 bg-soil-sand/50 rounded w-1/3" />
            <div className="h-3 bg-soil-sand/50 rounded w-full" />
            <div className="h-8 bg-soil-sand/50 rounded w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="text-center py-16">
      <p className="text-earth-gray fluid-lg">Failed to load job vacancies. Please try again later.</p>
      <Button variant="default" className="mt-4" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <Briefcase className="h-16 w-16 text-soil-sand mx-auto mb-4" />
      <p className="text-earth-gray fluid-lg">No job vacancies available.</p>
      <p className="text-earth-gray fluid-sm mt-1">Check back later for new opportunities.</p>
    </div>
  );
}
