"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import { ContentStringsProvider } from "@/lib/content-strings-context";
import { StyleThemeProvider } from "@/lib/style-theme-context";
import { SiteSettingsProvider } from "@/lib/SiteSettingsContext";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StyleThemeProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ContentStringsProvider>
              <SiteSettingsProvider>
                <AuthProvider>
                  {children}
                  <Toaster position="top-right" />
                </AuthProvider>
              </SiteSettingsProvider>
            </ContentStringsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </StyleThemeProvider>
    </QueryClientProvider>
  );
}
