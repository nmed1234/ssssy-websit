"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface Props {
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export function BannerSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const messageEn = (config.messageEn ?? data.messageEn ?? "") as string;
  const messageAr = (config.messageAr ?? data.messageAr ?? "") as string;
  const message = isAr ? messageAr : messageEn;

  const ctaLabelEn = (config.ctaLabelEn ?? data.ctaLabelEn ?? "") as string;
  const ctaLabelAr = (config.ctaLabelAr ?? data.ctaLabelAr ?? "") as string;
  const ctaLabel = isAr ? ctaLabelAr : ctaLabelEn;

  const ctaUrl = (config.ctaUrl ?? data.ctaUrl ?? "") as string;
  const dismissible = (config.dismissible ?? data.dismissible ?? true) as boolean;
  const variant = (config.variant ?? data.variant ?? "info") as string;

  const variantStyles: Record<string, string> = {
    info: "bg-blue-600 text-white",
    warning: "bg-amber-500 text-white",
    success: "bg-green-700 text-white",
    error: "bg-red-600 text-white",
    dark: "bg-gray-900 text-white",
  };

  const bg = variantStyles[variant] ?? variantStyles.info;

  if (!message) return null;

  return (
    <div className={`w-full px-4 py-3 ${bg}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-sm font-medium flex-1 text-center">{message}</p>
        <div className="flex items-center gap-3 flex-shrink-0">
          {ctaLabel && ctaUrl && (
            <Link
              href={ctaUrl}
              className="text-xs font-semibold underline underline-offset-2 hover:no-underline opacity-90 hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              {ctaLabel}
            </Link>
          )}
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
