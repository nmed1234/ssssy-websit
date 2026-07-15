import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { almarai } from "@/lib/fonts";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "SSSS - Soil Science Society of Syria",
    template: "%s | SSSS",
  },
  description: "Official website of the Soil Science Society of Syria (SSSS) — advancing soil science research, education, and sustainable land management in Syria.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_SY",
    url: siteUrl,
    siteName: "SSSS",
    title: "SSSS - Soil Science Society of Syria",
    description: "Official website of the Soil Science Society of Syria (SSSS) — advancing soil science research, education, and sustainable land management in Syria.",
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: "SSSS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSSS - Soil Science Society of Syria",
    description: "Official website of the Soil Science Society of Syria (SSSS)",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={almarai.variable}>
      <body className="min-h-screen bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-card focus:text-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
