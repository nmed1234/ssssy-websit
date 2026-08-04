"use client";

/**
 * ContactFormSection — SSSA-inspired layout with curved top panel + floating hands image.
 *
 * Config keys: titleEn / titleAr, submitLabelEn / submitLabelAr
 *
 * All text comes from the DB (site_sections.config).
 * Returns null when no title is available.
 */

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
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
    /* ── Outer wrapper: light warm-grey background matching SSSA aesthetic ── */
    <section className="relative overflow-hidden bg-[#f5f3ef]">

      {/* ── Curved top edge — white arc bleeding from previous section ── */}
      <div
        className="absolute top-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none"
        style={{ height: "90px" }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path d="M0,0 Q720,90 1440,0 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>

      {/* ── Main content row ── */}
      <div className="relative container mx-auto px-4 pt-4 pb-20 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">

          {/* ── LEFT: floating hands-holding-soil image ── */}
          <motion.div
            className="relative flex items-end justify-center lg:justify-start order-2 lg:order-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="relative z-10 w-[340px] md:w-[420px] lg:w-[500px] xl:w-[560px] -mb-8 lg:-mb-20 select-none">
              <Image
                src="/soil-graphic.webp"
                alt={language === "ar" ? "رسم توضيحي للتربة" : "Soil illustration"}
                width={560}
                height={520}
                className="object-contain drop-shadow-2xl"
                priority={false}
              />
            </div>
          </motion.div>

          {/* ── RIGHT: heading + form ── */}
          <motion.div
            className="order-1 lg:order-2 pt-20 md:pt-24 lg:pt-28 pb-6 lg:pb-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <TextReveal
              as="h2"
              className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-soil-dark mb-8 ${
                language === "ar" ? "text-right" : "text-left"
              }`}
            >
              {heading}
            </TextReveal>

            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12"
              >
                <CheckCircle className="h-16 w-16 text-forest mb-4" />
                <p className="fluid-xl font-semibold text-soil-dark mb-2">
                  {language === "ar" ? "تم إرسال الرسالة!" : "Message Sent!"}
                </p>
                <p className="text-earth-gray mb-6">
                  {language === "ar"
                    ? "شكراً لتواصلك. سنرد عليك قريباً."
                    : "Thank you for reaching out. We will get back to you shortly."}
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="border-soil-sand text-soil-clay"
                >
                  {language === "ar" ? "إرسال رسالة أخرى" : "Send Another"}
                </Button>
              </motion.div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md fluid-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  minRows={4}
                  placeholder={language === "ar" ? "رسالتك" : "Your Message"}
                />

                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-soil-clay hover:bg-soil-dark text-white px-10 py-3 rounded-full font-semibold"
                  >
                    {submitting
                      ? language === "ar"
                        ? "جاري الإرسال…"
                        : "Sending…"
                      : submitLabel}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Curved bottom edge — smooth transition to next section ── */}
      <div
        className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none"
        style={{ height: "60px" }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path d="M0,60 Q720,0 1440,60 L1440,60 L0,60 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
