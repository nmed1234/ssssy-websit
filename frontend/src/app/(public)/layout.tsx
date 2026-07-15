import SiteSettingsProviderWrapper from "@/components/providers/SiteSettingsProviderWrapper";
import PublicLayoutContent from "@/components/layout/PublicLayoutContent";
import React from "react"; // Explicitly import React if not already there

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProviderWrapper>
      <PublicLayoutContent>
        {children}
      </PublicLayoutContent>
    </SiteSettingsProviderWrapper>
  );
}
