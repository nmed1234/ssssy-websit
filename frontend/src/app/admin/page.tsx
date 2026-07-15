"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getDashboardStats } from "@/lib/admin";
import type { DashboardStats } from "@/types";
import { staggerContainer, listItem } from "@/lib/animation-variants";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Users, FileText, Clock, Edit3, FolderOpen, Tags, HardDrive, Activity } from "lucide-react";

function StatSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-muted rounded animate-shimmer mb-2" />
        <div className="h-8 w-16 bg-muted rounded animate-shimmer" />
      </CardHeader>
    </Card>
  );
}

const statCards = [
  { key: "totalMembers",       en: "Total Members",       ar: "إجمالي الأعضاء",    icon: Users,      color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/30" },
  { key: "publishedArticles",  en: "Published Articles",  ar: "المقالات المنشورة", icon: FileText,   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  { key: "pendingReviews",     en: "Pending Reviews",     ar: "بانتظار المراجعة", icon: Clock,      color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-900/30" },
  { key: "draftArticles",      en: "Draft Articles",      ar: "المسودات",           icon: Edit3,      color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  { key: "totalContent",       en: "Total Content",       ar: "إجمالي المحتوى",   icon: FileText,   color: "text-rose-600 dark:text-rose-400",     bg: "bg-rose-100 dark:bg-rose-900/30" },
  { key: "totalCategories",    en: "Categories",           ar: "التصنيفات",          icon: FolderOpen, color: "text-cyan-600 dark:text-cyan-400",     bg: "bg-cyan-100 dark:bg-cyan-900/30" },
  { key: "totalTags",          en: "Tags",                 ar: "الوسوم",              icon: Tags,       color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
  { key: "storageUsedBytes",   en: "Storage Used",         ar: "المساحة المستخدمة", icon: HardDrive,  color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30", isBytes: true },
];

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AdminPageHeader
        title={t("Dashboard", "لوحة التحكم")}
        description={t(`Welcome back, ${user?.username}`, `مرحباً بعودتك، ${user?.username}`)}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة") },
        ]}
      />

      {/* Primary stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats ? (
          statCards.slice(0, 4).map((stat) => {
            const value = stat.isBytes ? formatBytes((stats as any)[stat.key]) : (stats as any)[stat.key];
            const Icon = stat.icon;
            return (
              <motion.div key={stat.key} variants={listItem}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardDescription>{t(stat.en, stat.ar)}</CardDescription>
                      <CardTitle className="text-2xl mt-1">{value}</CardTitle>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </Card>
              </motion.div>
            );
          })
        ) : (
          <><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
        )}
      </motion.div>

      {/* Secondary stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats ? (
          statCards.slice(4).map((stat) => {
            const value = stat.isBytes ? formatBytes((stats as any)[stat.key]) : (stats as any)[stat.key];
            const Icon = stat.icon;
            return (
              <motion.div key={stat.key} variants={listItem}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardDescription>{t(stat.en, stat.ar)}</CardDescription>
                      <CardTitle className="text-2xl mt-1">{typeof value === "number" ? value.toLocaleString() : value}</CardTitle>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </Card>
              </motion.div>
            );
          })
        ) : (
          <><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t("Activity Overview", "نظرة عامة على النشاط")}
            </CardTitle>
            <CardDescription>
              {t("Recent platform activity and metrics", "النشاط الأخير والمقاييس")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("Storage Usage", "استخدام المساحة")}</span>
                  <span className="text-sm font-medium">{formatBytes(stats.storageUsedBytes)}</span>
                </div>
                <Progress
                  value={Math.min((stats.storageUsedBytes / 1073741824) * 100, 100)}
                  variant={stats.storageUsedBytes > 500 * 1024 * 1024 ? "warning" : "default"}
                />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-2xl font-bold">{stats.totalContent}</p>
                    <p className="text-xs text-muted-foreground">{t("Total Content Items", "إجمالي عناصر المحتوى")}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-2xl font-bold">{stats.totalMembers}</p>
                    <p className="text-xs text-muted-foreground">{t("Registered Members", "الأعضاء المسجلون")}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {t("Quick Actions", "إجراءات سريعة")}
            </CardTitle>
            <CardDescription>
              {t("Common tasks and shortcuts", "المهام الشائعة والاختصارات")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin/content/new" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors">
                <div className="p-2 rounded-full bg-primary/10"><FileText className="h-4 w-4 text-primary" /></div>
                <span className="text-sm font-medium">{t("New Article", "مقال جديد")}</span>
              </a>
              <a href="/admin/users" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors">
                <div className="p-2 rounded-full bg-primary/10"><Users className="h-4 w-4 text-primary" /></div>
                <span className="text-sm font-medium">{t("Manage Users", "إدارة المستخدمين")}</span>
              </a>
              <a href="/admin/media" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors">
                <div className="p-2 rounded-full bg-primary/10"><HardDrive className="h-4 w-4 text-primary" /></div>
                <span className="text-sm font-medium">{t("Media Library", "مكتبة الوسائط")}</span>
              </a>
              <a href="/admin/settings" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors">
                <div className="p-2 rounded-full bg-primary/10"><Activity className="h-4 w-4 text-primary" /></div>
                <span className="text-sm font-medium">{t("Settings", "الإعدادات")}</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
