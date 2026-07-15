"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/language-context";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminBottomNav } from "@/components/layout/AdminBottomNav";
import { NotificationBell } from "@/components/NotificationBell";
import { LangSwitch } from "@/components/ui/LangSwitch";
import { Avatar } from "@/components/ui/avatar";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Sun, Moon, Menu } from "lucide-react";

function AuthSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="flex justify-center">
          <div className="h-10 w-10 rounded-full bg-muted animate-shimmer" />
        </div>
        <div className="space-y-3 p-6 rounded-lg border bg-card">
          <div className="h-5 w-3/4 bg-muted rounded animate-shimmer mx-auto" />
          <div className="h-4 w-1/2 bg-muted rounded animate-shimmer mx-auto" />
          <div className="h-4 w-full bg-muted rounded animate-shimmer" />
          <div className="h-4 w-5/6 bg-muted rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { direction } = useLanguage();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) return <AuthSkeleton />;
  if (!user) return null;

  return (
    <div className="flex min-h-screen" dir={direction}>
      {/* Sidebar — flips to the correct side automatically via dir */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className={`h-14 border-b bg-card flex items-center px-4 gap-3 sticky top-0 z-40 transition-all duration-300 ${
            scrolled ? "bg-card/90 backdrop-blur-md" : "bg-card"
          }`}
        >
          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side={direction === "rtl" ? "right" : "left"} className="p-0 w-72">
              <AdminSidebar mobile />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          {/* Language switch */}
          <LangSwitch className="border-border text-foreground" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle dark mode"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.div>
          </button>

          <NotificationBell />
          <Avatar fallback={user?.username?.[0]?.toUpperCase() || "A"} size="sm" className="cursor-pointer" />
        </header>

        <main id="main-content" className="flex-1 p-4 md:p-8 bg-background overflow-auto pb-16 md:pb-8">
          <motion.div
            key={router ? "page" : "initial"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <AdminBottomNav />
    </div>
  );
}
