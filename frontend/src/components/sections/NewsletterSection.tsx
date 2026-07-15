"use client";

/**
 * NewsletterSection — email subscription form.
 *
 * Config keys: titleEn / titleAr, subtitleEn / subtitleAr,
 *              buttonLabelEn / buttonLabelAr, placeholderTextEn / placeholderTextAr
 *
 * All text comes from the DB (site_sections.config).
 * Returns null when no title is available.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { StyleInput } from "@/components/ui/style-input";
import { useLanguage } from "@/lib/language-context";
import api from "@/lib/api";

interface NewsletterSectionProps {
  config?: Record<string, unknown>;
}

export function NewsletterSection({ config = {} }: NewsletterSectionProps) {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const heading =
    language === "ar"
      ? (config.titleAr as string) || (config.title as string) || ""
      : (config.titleEn as string) || (config.title as string) || "";

  if (!heading) return null;

  const subtitle =
    language === "ar"
      ? (config.subtitleAr as string) || (config.subtitle as string) || ""
      : (config.subtitleEn as string) || (config.subtitle as string) || "";

  const buttonLabel =
    language === "ar"
      ? (config.buttonLabelAr as string) || (config.buttonLabel as string) || ""
      : (config.buttonLabelEn as string) || (config.buttonLabel as string) || "";

  const placeholder =
    language === "ar"
      ? (config.placeholderTextAr as string) || (config.placeholderText as string) || ""
      : (config.placeholderTextEn as string) || (config.placeholderText as string) || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubscribeError(null);
    try {
      const res = await api.post<{ success: boolean; message: string }>(
        "/public/newsletter/subscribe",
        { email: email.trim() }
      );
      if (res.data.success) {
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 6000);
      } else {
        setSubscribeError(res.data.message || "Subscription failed. Please try again.");
      }
    } catch (err: any) {
      setSubscribeError(
        err.response?.data?.message || "Failed to subscribe. Please try again."
      );
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <section
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ background: "var(--style-color-surface)" }}
    >
      <div className="absolute inset-0 bg-noise opacity-30" />
      <div className="container mx-auto px-4 max-w-2xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2
            className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-soil-dark mb-4`}
          >
            {heading}
          </h2>
          {subtitle && <p className="text-earth-gray mb-8">{subtitle}</p>}
        </motion.div>
        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex-1">
            <StyleInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              label={language === "ar" ? "بريدك الإلكتروني" : "Your email address"}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={subscribing || subscribed}
            className="bg-soil-clay hover:bg-soil-dark text-white px-6 w-full sm:w-auto"
          >
            {subscribing
              ? language === "ar"
                ? "جاري الاشتراك…"
                : "Subscribing…"
              : subscribed
              ? "✓"
              : buttonLabel}
          </Button>
        </motion.form>
        <AnimatePresence>
          {subscribed && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-emerald-600 fluid-sm mt-3"
            >
              {language === "ar"
                ? "تم الاشتراك! تحقق من بريدك للتأكيد."
                : "You've been subscribed! Check your inbox for confirmation."}
            </motion.p>
          )}
          {subscribeError && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 fluid-sm mt-3"
            >
              {subscribeError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
