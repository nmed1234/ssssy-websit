"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import { ContentStringsProvider } from "@/lib/content-strings-context";
import { StyleThemeProvider } from "@/lib/style-theme-context";
import { SiteSettingsProvider } from "@/lib/SiteSettingsContext";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

// Dev-only React Query DevTools — zero cost in production bundles.
// In production this resolves to a no-op component so the bundle is untouched.
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (m) => m.ReactQueryDevtools,
          ),
        { ssr: false },
      )
    : () => null as React.ReactNode;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,        // 30 s — data is "fresh" for 30s after fetch
            gcTime: 300_000,          // 5 min — keep unused data in memory for 5 min
            retry: 1,                 // one retry on failure (not three)
            refetchOnWindowFocus: false, // don't re-fetch when tab regains focus
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
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
