"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { LayoutDashboard, FileText, MessageSquare, Users, Settings } from "lucide-react";

const bottomItems = [
  { href: "/admin",          en: "Dashboard", ar: "الرئيسية",    icon: LayoutDashboard },
  { href: "/admin/content",  en: "Content",   ar: "المحتوى",     icon: FileText },
  { href: "/admin/comments", en: "Comments",  ar: "التعليقات",   icon: MessageSquare },
  { href: "/admin/users",    en: "Users",     ar: "المستخدمون",  icon: Users },
  { href: "/admin/settings", en: "Settings",  ar: "الإعدادات",   icon: Settings },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-14">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{t(item.en, item.ar)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
