"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  LayoutDashboard, Users, Shield, FileText, Image,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu, GitPullRequest,
  Layout, Navigation, MessageSquare, Mail, Users2,
  UserCircle, Briefcase, Contact, Languages, LayoutTemplate, Palette,
  CheckSquare, Server, Layers, History, ToggleLeft, ToggleRight, BookOpen
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const navItems = [
  { href: "/admin",                  en: "Dashboard",        ar: "لوحة التحكم",    icon: LayoutDashboard },
  { href: "/admin/content",          en: "Content",          ar: "المحتوى",         icon: FileText },
  { href: "/admin/content-approval", en: "Approval Queue",   ar: "طابور الموافقة", icon: CheckSquare },
  { href: "/admin/workflow",         en: "Workflow Logs",    ar: "سجلات العمل",    icon: GitPullRequest },
  { href: "/admin/pages",            en: "Pages",            ar: "الصفحات",         icon: Layout },
  { href: "/admin/menus",            en: "Menus",            ar: "القوائم",         icon: Navigation },
  { href: "/admin/site-sections",    en: "Site Sections",    ar: "أقسام الموقع",   icon: LayoutTemplate },
  { href: "/admin/themes",           en: "Themes & Design",  ar: "الثيمات والتصميم", icon: Palette },
  { href: "/admin/style-themes",     en: "Style Themes",     ar: "أنماط التصميم",     icon: Layers },
  { href: "/admin/staging",          en: "Staging & Sync",   ar: "التدريج والمزامنة", icon: Server },
  { href: "/admin/content-strings",  en: "Content Strings",  ar: "نصوص المحتوى",  icon: Languages },
  { href: "/admin/comments",         en: "Comments",         ar: "التعليقات",       icon: MessageSquare },
  { href: "/admin/newsletter",       en: "Newsletter",       ar: "النشرة البريدية", icon: Mail },
  { href: "/admin/categories",       en: "Categories",       ar: "التصنيفات",       icon: FileText },
  { href: "/admin/tags",             en: "Tags",             ar: "الوسوم",           icon: FileText },
  { href: "/admin/media",            en: "Media",            ar: "الوسائط",         icon: Image },
  { href: "/admin/crm",              en: "CRM Contacts",     ar: "جهات الاتصال",  icon: Contact },
  { href: "/admin/board-members",    en: "Board",            ar: "مجلس الإدارة",  icon: Briefcase },
  { href: "/admin/publications",     en: "Publications",     ar: "المنشورات",       icon: BookOpen },
  { href: "/admin/member-profiles",  en: "Members",          ar: "الأعضاء",         icon: UserCircle },
  { href: "/admin/users",            en: "Users",            ar: "المستخدمون",     icon: Users },
  { href: "/admin/roles",            en: "Roles",            ar: "الأدوار",         icon: Shield },
  { href: "/admin/settings",         en: "Settings",         ar: "الإعدادات",       icon: Settings },
];

export function AdminSidebar({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { t, direction } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [stagingMode, setStagingMode] = useState(false);
  const [stagingLoading, setStagingLoading] = useState(false);

  // In RTL the collapse icon direction is mirrored
  const CollapseIcon = direction === "rtl"
    ? (collapsed ? ChevronLeft : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  async function toggleStagingMode() {
    setStagingLoading(true);
    try {
      if (stagingMode) {
        await api.post("/admin/staging/disable");
      } else {
        await api.post("/admin/staging/enable");
      }
      setStagingMode(!stagingMode);
    } catch { /* no-op */ }
    setStagingLoading(false);
  }

  return (
    <aside className={cn(
      "bg-soil-dark text-white flex flex-col transition-all duration-300 h-full min-h-screen",
      collapsed ? "w-16" : mobile ? "w-full" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-white/10",
        collapsed ? "justify-center p-4" : "justify-between p-4"
      )}>
        {(!collapsed || mobile) && (
          <span className="font-heading font-bold text-lg">
            {t("SSSS Admin", "إدارة الجمعية")}
          </span>
        )}
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu size={18} /> : <CollapseIcon size={18} />}
          </Button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/10",
                isActive
                  ? direction === "rtl"
                    ? "bg-white/15 border-l-2 border-forest-light"
                    : "bg-white/15 border-r-2 border-forest-light"
                  : "",
                "justify-start"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {(!collapsed || mobile) && <span>{t(item.en, item.ar)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        {(!collapsed || mobile) && (
          <button
            onClick={toggleStagingMode}
            disabled={stagingLoading}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors",
              stagingMode
                ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                : "text-white/60 hover:bg-white/10"
            )}
          >
            {stagingMode
              ? <ToggleRight size={16} className="text-amber-400" />
              : <ToggleLeft size={16} />}
            {stagingMode
              ? t("Staging ON", "التدريج مفعّل")
              : t("Staging OFF", "التدريج معطّل")}
          </button>
        )}
        {(!collapsed || mobile) && user && (
          <p className="text-sm text-soil-sand truncate">{user.username}</p>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10"
          onClick={logout}
        >
          <LogOut size={18} className={cn(collapsed && !mobile ? "" : direction === "rtl" ? "ml-2" : "mr-2")} />
          {(!collapsed || mobile) && <span>{t("Logout", "تسجيل الخروج")}</span>}
        </Button>
      </div>
    </aside>
  );
}
