import { Almarai } from "next/font/google";

/**
 * Single shared Almarai font instance for the whole app.
 * Import `almarai` from here — never call `Almarai()` again in other files.
 *
 * Usage:
 *   import { almarai } from "@/lib/fonts";
 *   <div className={almarai.className}>…</div>
 */
export const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
  // Preloading is now safe: the Google Fonts origins are listed in the CSP
  // connect-src and font-src directives in next.config.mjs.
  preload: true,
  fallback: ["Segoe UI", "Tahoma", "Arial", "sans-serif"],
});
