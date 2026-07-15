"use client";

import { SiteSettingsProvider } from "@/lib/SiteSettingsContext";
import React from "react";

export default function SiteSettingsProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      {children}
    </SiteSettingsProvider>
  );
}
