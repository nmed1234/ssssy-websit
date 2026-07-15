"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAllSystemConfigs, SystemConfig } from "./site-settings";

// Re-exported for consumers that only need the language type
export type { SystemConfig };

interface SiteSettingsContextType {
  settings: Map<string, string>;
  loading: boolean;
  error: string | null;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Fetch ALL public site settings
        const fetchedConfigs = await getAllSystemConfigs();
        const newSettings = new Map<string, string>();
        fetchedConfigs.forEach(config => {
          newSettings.set(config.configKey, config.configValue);
        });
        setSettings(newSettings);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch site settings:", err);
        // Don't set error, just keep empty map so UI doesn't break
        setSettings(new Map());
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
};

/**
 * Returns the language-aware site name.
 * Reads site.name_en / site.name_ar from system_config (managed in admin Settings).
 * Falls back to the legacy site.name key and then to a built-in default.
 *
 * @param language  current UI language string, e.g. "ar" or "en"
 */
export function useSiteName(language: string): string {
  const { settings } = useSiteSettings();
  if (language === "ar") {
    return (
      settings.get("site.name_ar") ||
      settings.get("site.name") ||
      "جمعية علوم التربة السورية (SSSS)"
    );
  }
  return (
    settings.get("site.name_en") ||
    settings.get("site.name") ||
    "Soil Science Society of Syria (SSSS)"
  );
}

/**
 * Returns the language-aware footer copyright text.
 * Reads footer.copyright_en / footer.copyright_ar from system_config (managed in admin Settings).
 * Falls back to the legacy footer.copyright key and then to a built-in default.
 *
 * @param language  current UI language string, e.g. "ar" or "en"
 */
export function useCopyright(language: string): string {
  const { settings } = useSiteSettings();
  if (language === "ar") {
    return (
      settings.get("footer.copyright_ar") ||
      settings.get("footer.copyright") ||
      "جمعية علوم التربة السورية (SSSS). جميع الحقوق محفوظة."
    );
  }
  return (
    settings.get("footer.copyright_en") ||
    settings.get("footer.copyright") ||
    "Soil Science Society of Syria (SSSS). All rights reserved."
  );
}
