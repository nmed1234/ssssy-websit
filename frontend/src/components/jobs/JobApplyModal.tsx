"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitApplication } from "@/lib/jobs";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface JobApplyModalProps {
  jobVacancyId: string;
  jobTitle: string;
  onClose: () => void;
}

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

export default function JobApplyModal({ jobVacancyId, jobTitle, onClose }: JobApplyModalProps) {
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
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    try {
      const res = await submitApplication(jobVacancyId, {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-soil-sand/30">
          <div>
            <h3 className="text-lg font-semibold text-soil-dark">Apply for Position</h3>
            <p className="text-sm text-earth-gray mt-1">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="p-1 text-earth-gray hover:text-soil-dark transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        {submitSuccess ? (
          <div className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-forest mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-soil-dark mb-2">Application Submitted!</h4>
            <p className="text-earth-gray text-sm">Thank you for your application. We will review it and get back to you.</p>
            <Button variant="default" className="mt-6" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {submitError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md text-sm">
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
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
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
  );
}
