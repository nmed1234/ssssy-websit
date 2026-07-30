"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function CtaNewsletterSection({ config = {} }: Props) {
  const { language } = useLanguage();
  const isAr       = language === "ar";
  const title      = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle   = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const placeholder= isAr ? ((config.placeholderAr ?? config.placeholder ?? "بريدك الإلكتروني") as string) : ((config.placeholderEn ?? config.placeholder ?? "Your email address") as string);
  const btnLabel   = isAr ? ((config.btnLabelAr ?? config.btnLabel ?? "اشتراك") as string) : ((config.btnLabelEn ?? config.btnLabel ?? "Subscribe") as string);
  const privacyNote= isAr ? ((config.privacyNoteAr ?? config.privacyNote ?? "") as string) : ((config.privacyNoteEn ?? config.privacyNote ?? "") as string);
  const dark       = config.dark !== "false";

  const [email, setEmail]     = useState("");
  const [submitted, setSubmit]= useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmit(true);
  };

  return (
    <section
      className="py-20 md:py-28"
      style={{ background: dark ? "var(--style-color-primary, #1b5e20)" : "var(--style-color-surface)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 max-w-2xl text-center">
        {title && (
          <h2 className={`text-2xl md:text-4xl font-bold mb-4 leading-tight ${dark ? "text-white" : ""}`}
            style={dark ? {} : { color: "var(--style-color-text, #1a3a2a)" }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p className={`mb-8 ${dark ? "text-white/70" : "text-gray-500"}`}>{subtitle}</p>
        )}
        {submitted ? (
          <div className={`rounded-xl p-6 font-medium ${dark ? "bg-white/20 text-white" : "bg-green-50 text-green-700 border border-green-200"}`}>
            {isAr ? "شكراً! تم الاشتراك بنجاح." : "You're subscribed!"}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className={`flex-1 px-5 py-3 rounded-xl text-sm outline-none focus:ring-2 ${dark ? "bg-white/20 text-white placeholder-white/50 border border-white/30 focus:ring-white/50" : "border border-gray-300 focus:ring-soil-dark"}`}
            />
            <button
              type="submit"
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 ${dark ? "bg-white text-gray-900" : "text-white"}`}
              style={dark ? {} : { background: "var(--style-color-primary, #2d6a4f)" }}
            >
              {btnLabel}
            </button>
          </form>
        )}
        {privacyNote && (
          <p className={`text-xs mt-4 ${dark ? "text-white/50" : "text-gray-400"}`}>{privacyNote}</p>
        )}
      </div>
    </section>
  );
}
