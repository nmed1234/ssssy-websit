"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function WaitlistFormSection({ config = {} }: Props) {
  const { language } = useLanguage();
  const isAr       = language === "ar";
  const title      = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);
  const subtitle   = isAr ? ((config.subtitleAr ?? config.subtitle ?? "") as string) : ((config.subtitleEn ?? config.subtitle ?? "") as string);
  const placeholder= isAr ? ((config.placeholderAr ?? config.placeholder ?? "أدخل بريدك الإلكتروني") as string) : ((config.placeholderEn ?? config.placeholder ?? "Enter your email") as string);
  const btnLabel   = isAr ? ((config.btnLabelAr ?? config.btnLabel ?? "انضم") as string) : ((config.btnLabelEn ?? config.btnLabel ?? "Join Waitlist") as string);
  const successMsg = isAr ? ((config.successMsgAr ?? config.successMsg ?? "شكراً! سنتواصل معك قريباً.") as string) : ((config.successMsgEn ?? config.successMsg ?? "You're on the list!") as string);
  const note       = isAr ? ((config.noteAr ?? config.note ?? "") as string) : ((config.noteEn ?? config.note ?? "") as string);

  const [email, setEmail]     = useState("");
  const [submitted, setSubmit]= useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmit(true);
  };

  return (
    <section className="py-20 md:py-28" style={{ background: "var(--style-color-surface)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-xl text-center">
        {title    && <h2 className="text-2xl md:text-4xl font-extrabold text-soil-dark mb-4">{title}</h2>}
        {subtitle && <p className="text-gray-500 mb-8">{subtitle}</p>}
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-green-700 font-medium">{successMsg}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-soil-dark"
            />
            <button type="submit" className="bg-soil-dark text-white font-semibold px-6 py-3 rounded-xl hover:bg-soil-clay transition-colors text-sm flex-shrink-0">
              {btnLabel}
            </button>
          </form>
        )}
        {note && <p className="text-xs text-gray-400 mt-4">{note}</p>}
      </div>
    </section>
  );
}
