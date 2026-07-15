"use client";

/**
 * ContactFormSection — inline contact form.
 *
 * Config keys: titleEn / titleAr, submitLabelEn / submitLabelAr
 *
 * All text comes from the DB (site_sections.config).
 * Returns null when no title is available.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { StyleCard, StyleCardContent } from "@/components/ui/style-card";
import { StyleInput } from "@/components/ui/style-input";
import { StyleTextarea } from "@/components/ui/style-textarea";
import { TextReveal } from "@/components/ui/text-reveal";
import { submitContactForm } from "@/lib/contact";
import { useLanguage } from "@/lib/language-context";

interface ContactFormSectionProps {
  config?: Record<string, unknown>;
}

export function ContactFormSection({ config = {} }: ContactFormSectionProps) {
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading =
    language === "ar"
      ? (config.titleAr as string) || (config.title as string) || ""
      : (config.titleEn as string) || (config.title as string) || "";

  if (!heading) return null;

  const submitLabel =
    language === "ar"
      ? (config.submitLabelAr as string) || (config.submitLabel as string) || ""
      : (config.submitLabelEn as string) || (config.submitLabel as string) || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitContactForm({ name, email, subject, message });
      if (res.data.success) {
        setSuccess(true);
        setName(""); setEmail(""); setSubject(""); setMessage("");
      } else {
        setError(res.data.message || "Failed to send message.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <TextReveal
          as="h2"
          className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-soil-dark text-center mb-12`}
        >
          {heading}
        </TextReveal>
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <CheckCircle className="h-16 w-16 text-forest mx-auto mb-4" />
            <p className="fluid-xl font-semibold text-soil-dark mb-2">
              {language === "ar" ? "تم إرسال الرسالة!" : "Message Sent!"}
            </p>
            <p className="text-earth-gray mb-6">
              {language === "ar"
                ? "شكراً لتواصلك. سنرد عليك قريباً."
                : "Thank you for reaching out. We will get back to you shortly."}
            </p>
            <Button onClick={() => setSuccess(false)} variant="outline" className="border-soil-sand text-soil-clay">
              {language === "ar" ? "إرسال رسالة أخرى" : "Send Another"}
            </Button>
          </motion.div>
        ) : (
          <StyleCard>
            <StyleCardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md fluid-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StyleInput
                    type="text"
                    required
                    label={language === "ar" ? "اسمك" : "Your Name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === "ar" ? "اسمك" : "Your Name"}
                  />
                  <StyleInput
                    type="email"
                    required
                    label={language === "ar" ? "البريد الإلكتروني" : "Email Address"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === "ar" ? "بريدك الإلكتروني" : "Your Email"}
                  />
                </div>
                <StyleInput
                  type="text"
                  required
                  label={language === "ar" ? "الموضوع" : "Subject"}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={language === "ar" ? "الموضوع" : "Subject"}
                />
                <StyleTextarea
                  required
                  label={language === "ar" ? "رسالتك" : "Your Message"}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  minRows={5}
                  placeholder={language === "ar" ? "رسالتك" : "Your Message"}
                />
                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-soil-clay hover:bg-soil-dark text-white px-10 py-3"
                  >
                    {submitting ? (language === "ar" ? "جاري الإرسال…" : "Sending…") : submitLabel}
                  </Button>
                </div>
              </form>
            </StyleCardContent>
          </StyleCard>
        )}
      </div>
    </section>
  );
}
