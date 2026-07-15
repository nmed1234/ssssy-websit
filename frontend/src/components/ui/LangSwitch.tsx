"use client";

import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

interface LangSwitchProps {
  /** Extra Tailwind classes on the outer wrapper */
  className?: string;
  /** Compact pill style (default) or text-only button */
  variant?: "pill" | "ghost";
}

/**
 * Reusable EN ↔ AR language toggle.
 * Reads / writes via the global LanguageContext (persisted to localStorage).
 * Flips document.dir automatically (handled in language-context).
 */
export function LangSwitch({ className, variant = "pill" }: LangSwitchProps) {
  const { language, setLanguage } = useLanguage();

  const toggle = () => setLanguage(language === "en" ? "ar" : "en");

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "text-sm font-medium transition-colors hover:opacity-80",
          className
        )}
        aria-label={language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
      >
        {language === "en" ? "العربية" : "English"}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-current/20 p-0.5 text-xs font-semibold select-none",
        className
      )}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
          language === "en"
            ? "bg-soil-clay text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={language === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("ar")}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
          language === "ar"
            ? "bg-soil-clay text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={language === "ar"}
      >
        AR
      </button>
    </div>
  );
}
