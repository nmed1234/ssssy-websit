"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AuditTimeline } from "@/components/admin/pages/AuditTimeline";
import { VersionDiffViewer } from "@/components/admin/pages/VersionDiffViewer";
import { useLanguage } from "@/lib/language-context";
import { History, GitCompare } from "lucide-react";

type Tab = "timeline" | "diff";

export default function PageHistoryPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("timeline");

  const tabs: { key: Tab; labelEn: string; labelAr: string; icon: React.ReactNode }[] = [
    { key: "timeline", labelEn: "Audit Timeline",    labelAr: "سجل التدقيق",     icon: <History  className="w-4 h-4" /> },
    { key: "diff",     labelEn: "Version Diff Viewer", labelAr: "مقارنة الإصدارات", icon: <GitCompare className="w-4 h-4" /> },
  ];

  return (
    <div>
      <AdminPageHeader
        title={t("Page History", "سجل الصفحة")}
        description={t("Audit trail and version diff for this page.", "سجل تدقيق ومقارنة الإصدارات لهذه الصفحة.")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Pages", "الصفحات"), href: "/admin/pages" },
          { label: t("Editor", "المحرر"), href: `/admin/pages/${id}` },
          { label: t("History", "السجل") },
        ]}
      />

      {/* Tab strip */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {t(tab.labelEn, tab.labelAr)}
          </button>
        ))}
      </div>

      {activeTab === "timeline" && <AuditTimeline pageId={id} />}
      {activeTab === "diff" && (
        <VersionDiffViewer contentType="page" contentId={id} />
      )}
    </div>
  );
}
