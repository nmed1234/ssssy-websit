"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getAdminPages, deletePage } from "@/lib/pages";
import type { Page } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BulkActions } from "@/components/admin/BulkActions";
import { AdvancedFilters } from "@/components/admin/AdvancedFilters";
import { Button } from "@/components/ui/button";
import { CreatePageWizard } from "@/components/admin/pages/CreatePageWizard";
import { PageDuplicateDialog } from "@/components/admin/pages/PageDuplicateDialog";
import { WorkflowStatusBadge } from "@/components/admin/WorkflowStatusBadge";
import { useLanguage } from "@/lib/language-context";

const WORKFLOW_STATUS_OPTIONS = ["ALL", "DRAFT", "REVIEW", "APPROVED", "PUBLISHED"];

export default function AdminPagesPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [duplicatePage, setDuplicatePage] = useState<Page | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-pages", statusFilter],
    queryFn: async () => {
      const res = await getAdminPages(statusFilter !== "ALL" ? statusFilter : undefined);
      return res.data.data;
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deletePage(id)));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-pages"] }),
  });

  const filtered = useMemo(() => {
    const items: Page[] = data || [];
    return items.filter((page) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (page.titleEn || "").toLowerCase().includes(q) ||
        (page.titleAr || "").toLowerCase().includes(q) ||
        (page.slug || "").toLowerCase().includes(q);

      let matchStatus = true;
      if (statusFilter !== "ALL") {
        const effectiveStatus =
          page.workflowStatus ?? (page.isPublished ? "PUBLISHED" : "DRAFT");
        matchStatus = effectiveStatus === statusFilter;
      }

      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const translationWarningIds = useMemo(() => {
    const items: Page[] = data || [];
    const groups = new Map<string, Page[]>();
    for (const page of items) {
      if (!page.translationGroupId) continue;
      const group = groups.get(page.translationGroupId) ?? [];
      group.push(page);
      groups.set(page.translationGroupId, group);
    }
    const warningIds = new Set<string>();
    for (const group of Array.from(groups.values())) {
      if (group.length < 2) continue;
      const isPublished = (p: Page) =>
        p.workflowStatus === "PUBLISHED" || (p.workflowStatus == null && p.isPublished);
      const hasPublished = group.some((p: Page) => isPublished(p));
      const hasUnpublished = group.some((p: Page) => !isPublished(p));
      if (hasPublished && hasUnpublished) {
        for (const p of group) {
          if (!isPublished(p)) warningIds.add(p.id);
        }
      }
    }
    return warningIds;
  }, [data]);

  function handleWizardClose() {
    setIsWizardOpen(false);
    queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
  }

  return (
    <div>
      <AdminPageHeader
        title={t("Pages", "الصفحات")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Pages", "الصفحات") },
        ]}
        actions={
          <Button
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 bg-soil-dark text-white rounded-lg text-sm hover:bg-soil-darker"
          >
            {t("New Page", "صفحة جديدة")}
          </Button>
        }
      />

      <CreatePageWizard isOpen={isWizardOpen} onClose={handleWizardClose} />

      <PageDuplicateDialog
        page={duplicatePage}
        onClose={() => setDuplicatePage(null)}
      />

      <AdvancedFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={WORKFLOW_STATUS_OPTIONS}
        searchPlaceholder={t("Search by title or slug…", "بحث بالعنوان أو الرابط…")}
      />

      <BulkActions
        items={filtered}
        idKey="id"
        onDelete={(ids) => bulkDeleteMutation.mutate(ids)}
      >
        {({ SelectAllCheckbox, RowCheckbox }) => (
          <Card>
            <CardHeader>
              <CardTitle>{t("All Pages", "جميع الصفحات")} ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 w-10">
                          <SelectAllCheckbox />
                        </th>
                        <th className="pb-3 font-medium">{t("Title (EN)", "العنوان (إنجليزي)")}</th>
                        <th className="pb-3 font-medium">{t("Slug", "الرابط المختصر")}</th>
                        <th className="pb-3 font-medium">{t("Layout", "التخطيط")}</th>
                        <th className="pb-3 font-medium">{t("Status", "الحالة")}</th>
                        <th className="pb-3 font-medium">{t("Actions", "الإجراءات")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((page: Page) => (
                        <tr key={page.id} className="border-b last:border-0">
                          <td className="py-3">
                            <RowCheckbox id={page.id} />
                          </td>
                          <td className="py-3">{page.titleEn || page.titleAr}</td>
                          <td className="py-3 text-muted-foreground">/{page.slug}</td>
                          <td className="py-3">{page.layoutType || t("FLEXIBLE", "مرن")}</td>
                          <td className="py-3">
                            <WorkflowStatusBadge
                              status={
                                page.workflowStatus ??
                                (page.isPublished ? "PUBLISHED" : "DRAFT")
                              }
                              lastTransitionBy={page.lastTransitionBy}
                              lastTransitionAt={page.lastTransitionAt}
                            />
                            {translationWarningIds.has(page.id) && (
                              <span className="mt-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-amber-50 border border-amber-200 text-amber-700">
                                ⚠ {t("Translation not published", "الترجمة غير منشورة")}
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/admin/pages/${page.id}`}
                                className="text-blue-600 hover:underline text-xs"
                              >
                                {t("Edit with Builder", "تعديل بالمحرر")}
                              </Link>
                              <button
                                type="button"
                                onClick={() => setDuplicatePage(page)}
                                className="text-muted-foreground hover:text-foreground text-xs hover:underline"
                              >
                                {t("Duplicate", "نسخ")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-muted-foreground"
                          >
                            {search ? t("No pages matching your search", "لا توجد صفحات تطابق بحثك") : t("No pages found", "لا توجد صفحات")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </BulkActions>
    </div>
  );
}
