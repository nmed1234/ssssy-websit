"use client";

import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AuditTimeline } from "@/components/admin/pages/AuditTimeline";
import { useLanguage } from "@/lib/language-context";

/**
 * Page History route: /admin/pages/[id]/history
 *
 * Renders a vertical audit timeline for the given page.
 * Requirement 12.3: Displays each audit entry with action label,
 * user avatar + display name, and relative timestamp with full
 * datetime on hover.
 */
export default function PageHistoryPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <AdminPageHeader
        title={t("Page History", "سجل الصفحة")}
        description={t("Audit trail of all changes made to this page.", "سجل تدقيق لجميع التغييرات على هذه الصفحة.")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Pages", "الصفحات"), href: "/admin/pages" },
          { label: t("Editor", "المحرر"), href: `/admin/pages/${id}` },
          { label: t("History", "السجل") },
        ]}
      />

      <AuditTimeline pageId={id} />
    </div>
  );
}
