"use client";

import { useState } from "react";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/ui/tilt-card";
import { submitContactForm, type ContactFormData } from "@/lib/contact";
import { Mail, Phone, MapPin, Clock, Map, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useContentStrings } from "@/lib/content-strings-context";


interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactFormSection() {
  const { t } = useContentStrings();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.name.trim())
      errors.name = t("contact.form.namePlaceholder", "Name is required");
    if (!formData.email.trim()) {
      errors.email = t("contact.form.emailPlaceholder", "Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.subject.trim())
      errors.subject = t("contact.form.subjectPlaceholder", "Subject is required");
    if (!formData.message.trim()) {
      errors.message = t("contact.form.messagePlaceholder", "Message is required");
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
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
      const res = await submitContactForm(formData);
      if (res.data.success) {
        setSubmitSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setFormErrors({});
      } else {
        setSubmitError(res.data.message || "Failed to send message.");
      }
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <h2 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-6`}>
              {t("contact.form.title", "Send Us a Message")}
            </h2>

            {submitSuccess ? (
              <div className="bg-forest/5 border border-forest/20 rounded-lg p-8 text-center">
                <CheckCircle className="h-16 w-16 text-forest mx-auto mb-4" />
                <h3 className="fluid-xl font-semibold text-soil-dark mb-2">
                  {t("contact.success.title", "Message Sent!")}
                </h3>
                <p className="text-earth-gray mb-6">
                  {t("contact.success.text", "Thank you for reaching out. We will get back to you as soon as possible.")}
                </p>
                <Button variant="default" onClick={() => setSubmitSuccess(false)}>
                  {t("contact.success.another", "Send Another Message")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md fluid-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-soil-dark mb-1.5">
                      {t("contact.form.namePlaceholder", "Name")} *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent ${
                        formErrors.name ? "border-red-400" : "border-soil-sand"
                      }`}
                      placeholder={t("contact.form.namePlaceholder", "Your name")}
                      value={formData.name}
                      onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    />
                    {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soil-dark mb-1.5">
                      {t("contact.form.emailPlaceholder", "Email")} *
                    </label>
                    <input
                      type="email"
                      className={`w-full px-4 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent ${
                        formErrors.email ? "border-red-400" : "border-soil-sand"
                      }`}
                      placeholder={t("contact.form.emailPlaceholder", "your@email.com")}
                      value={formData.email}
                      onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                    />
                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-soil-dark mb-1.5">
                    {t("contact.form.subjectPlaceholder", "Subject")} *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent ${
                      formErrors.subject ? "border-red-400" : "border-soil-sand"
                    }`}
                    placeholder={t("contact.form.subjectPlaceholder", "How can we help you?")}
                    value={formData.subject}
                    onChange={(e) => setFormData((f) => ({ ...f, subject: e.target.value }))}
                  />
                  {formErrors.subject && <p className="text-xs text-red-500 mt-1">{formErrors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-soil-dark mb-1.5">
                    {t("contact.form.messagePlaceholder", "Message")} *
                  </label>
                  <textarea
                    rows={6}
                    className={`w-full px-4 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent resize-none ${
                      formErrors.message ? "border-red-400" : "border-soil-sand"
                    }`}
                    placeholder={t("contact.form.messagePlaceholder", "Write your message here...")}
                    value={formData.message}
                    onChange={(e) => setFormData((f) => ({ ...f, message: e.target.value }))}
                  />
                  {formErrors.message && <p className="text-xs text-red-500 mt-1">{formErrors.message}</p>}
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={submitting}
                >
                  {submitting ? (
                    t("contact.form.submitting", "Sending...")
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t("contact.form.submit", "Send Message")}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-2`}>
              {t("contact.info.title", "Contact Information")}
            </h2>
            <p className="text-earth-gray fluid-sm mb-4">
              {t("contact.info.description", "Get in touch with us through any of the channels below.")}
            </p>

            {/* Contact Info Cards */}
            {[
              { icon: MapPin, labelKey: "contact.info.addressLabel", valueKey: "contact.address" },
              { icon: Phone, labelKey: "contact.info.phoneLabel", valueKey: "contact.phone" },
              { icon: Mail, labelKey: "contact.info.emailLabel", valueKey: "contact.email" },
              { icon: Clock, labelKey: "contact.info.workingHoursLabel", valueKey: "contact.workingHours" },
            ].map((item, index) => (
              <TiltCard key={index} className="border border-soil-sand/50 bg-white rounded-lg overflow-hidden">
                <div className="p-4 flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-soil-clay/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-soil-clay" />
                  </div>
                  <div>
                    <h4 className="font-medium text-soil-dark fluid-sm">{t(item.labelKey, item.labelKey)}</h4>
                    <p className="text-earth-gray fluid-sm mt-0.5">{t(item.valueKey, item.valueKey)}</p>
                  </div>
                </div>
              </TiltCard>
            ))}

            {/* Map Placeholder */}
            <div className="bg-earth-gray/5 rounded-lg border border-soil-sand/50 overflow-hidden">
              <div className="aspect-[16/9] bg-soil-sand/30 flex items-center justify-center">
                <div className="text-center text-earth-gray">
                  <Map className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t("contact.map.placeholder", "Google Maps Placeholder")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
