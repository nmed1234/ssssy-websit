"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useSiteName } from "@/lib/SiteSettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LangSwitch } from "@/components/ui/LangSwitch";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { t, direction, language } = useLanguage();
  const siteName = useSiteName(language);
  const siteNameEn = "Soil Science Society of Syria (SSSS)";
  const siteNameAr = "جمعية علوم التربة السورية (SSSS)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ username, password });
      router.push("/admin");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("Login failed. Please check your credentials.", "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir={direction}>
      {/* ── Left panel — brand ───────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1B0000 0%, #3E2723 40%, #4E342E 70%, #6D4C41 100%)",
        }}
      >
        {/* Radial dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #D7CCC8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Diagonal gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          {/* Logo */}
          <div className="mb-8 drop-shadow-2xl">
            <img
              src="/logo.svg"
              alt={siteName}
              width={160}
              height={160}
              className="w-40 h-40 object-contain filter drop-shadow-lg"
            />
          </div>

          {/* Organization name */}
          <h1
            className="text-3xl font-bold text-white mb-2 leading-tight"
            style={{ fontFamily: "var(--font-almarai)", textShadow: "0 2px 8px rgba(0,0,0,0.5)", letterSpacing: "0.02em" }}
          >
            {siteNameEn}
          </h1>
          <p
            className="text-xl text-[#D7CCC8] mb-6"
            dir="rtl"
            lang="ar"
            style={{ fontFamily: "var(--font-arabic)", letterSpacing: "0.04em" }}
          >
            {siteNameAr}
          </p>

          {/* Divider */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D7CCC8]/60 to-transparent mb-6" />

          {/* Tagline */}
          <p className="text-[#BCAAA4] text-sm leading-relaxed max-w-sm">
            {t(
              "Advancing soil science research, education, and sustainable land management in Syria since 2008.",
              "تطوير أبحاث علوم التربة والتعليم وإدارة الأراضي المستدامة في سوريا منذ عام 2008."
            )}
          </p>

          {/* Stats row */}
          <div className="mt-10 flex gap-10 text-center">
            {[
              { value: "15+", labelEn: "Years",        labelAr: "سنة" },
              { value: "500+", labelEn: "Members",     labelAr: "عضو" },
              { value: "200+", labelEn: "Publications", labelAr: "منشور" },
            ].map((stat) => (
              <div key={stat.labelEn}>
                <p className="text-2xl font-bold text-[#D7CCC8]">{stat.value}</p>
                <p className="text-xs text-[#A1887F] uppercase tracking-wider mt-0.5">
                  {t(stat.labelEn, stat.labelAr)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-[#795548] text-xs">
            © {new Date().getFullYear()} {siteName}.{" "}
            {t("All rights reserved.", "جميع الحقوق محفوظة.")}
          </p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-white relative">
        {/* Subtle warm texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#FBE9E7]/30 pointer-events-none" />

        <div className="relative w-full max-w-sm">
          {/* Language switch — top right of form panel */}
          <div className="absolute -top-10 end-0">
            <LangSwitch className="border-gray-200 text-gray-600" />
          </div>

          {/* Mobile-only logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src="/logo.svg" alt="Logo" className="w-16 h-16 object-contain mb-2" />
            <p className="text-sm font-semibold text-soil-dark">{siteName}</p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-6">
              <img src="/logo.svg" alt="Logo" className="hidden lg:block w-10 h-10 object-contain" />
              <span className="hidden lg:block text-sm font-semibold text-soil-dark">
                {t("SSSS Admin", "إدارة الجمعية")}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-soil-dark mb-1">
              {t("Welcome back", "مرحباً بعودتك")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("Sign in to manage your website", "سجّل دخولك لإدارة الموقع")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-xl text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-soil-dark">
                {t("Username", "اسم المستخدم")}
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("Enter your username", "أدخل اسم المستخدم")}
                className="h-11 border-gray-200 focus:border-soil-clay focus:ring-soil-clay/20 rounded-xl bg-gray-50/50"
                required
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-soil-dark">
                {t("Password", "كلمة المرور")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("Enter your password", "أدخل كلمة المرور")}
                  className="h-11 pr-10 border-gray-200 focus:border-soil-clay focus:ring-soil-clay/20 rounded-xl bg-gray-50/50"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? t("Hide password", "إخفاء كلمة المرور") : t("Show password", "إظهار كلمة المرور")}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 bg-soil-clay hover:bg-soil-dark text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("Signing in…", "جارٍ تسجيل الدخول…")}
                </span>
              ) : (
                t("Sign In", "تسجيل الدخول")
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("Don't have an account?", "ليس لديك حساب؟")}{" "}
            <Link
              href="/auth/register"
              className="text-soil-clay hover:text-soil-dark font-medium underline-offset-4 hover:underline transition-colors"
            >
              {t("Register", "إنشاء حساب")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
