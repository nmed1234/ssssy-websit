"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";
import type { ContentItem, PaginatedResponse, ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BulkActions } from "@/components/admin/BulkActions";
import { AdvancedFilters } from "@/components/admin/AdvancedFilters";
import { exportCSV } from "@/lib/export";
import { useLanguage } from "@/lib/language-context";

const statuses = ["ALL", "PUBLISHED", "DRAFT", "REVIEW", "ARCHIVED"] as const;

export default function ContentListPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`/content/${id}`)));
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["content"] }); },
  });

  const columns = [
    { key: "titleAr" as keyof ContentItem, label: t("Title (AR)", "العنوان (عربي)") },
    { key: "titleEn" as keyof ContentItem, label: t("Title (EN)", "العنوان (إنجليزي)") },
    { key: "contentType" as keyof ContentItem, label: t("Type", "النوع") },
    { key: "status" as keyof ContentItem, label: t("Status", "الحالة") },
    { key: "authorName" as keyof ContentItem, label: t("Author", "المؤلف") },
    { key: "updatedAt" as keyof ContentItem, label: t("Updated", "تاريخ التحديث") },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<ContentItem>>>("/content", { params: { size: 50 } });
      return res.data.data;
    },
  });

  const filtered = useMemo(() => {
    const items = data?.content || [];
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (item.titleAr || "").toLowerCase().includes(q) ||
        (item.titleEn || "").toLowerCase().includes(q) ||
        (item.authorName || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  return (
    <div>
      <AdminPageHeader
        title={t("Content", "المحتوى")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Content", "المحتوى") },
        ]}
        actions={
          <>
            <Button onClick={() => exportCSV(filtered, columns, "content.csv")}>{t("Export CSV", "تصدير CSV")}</Button>
            <Button asChild><Link href="/admin/content/new">{t("New Content", "محتوى جديد")}</Link></Button>
          </>
        }
      />
      <AdvancedFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={["ALL", "PUBLISHED", "DRAFT", "REVIEW", "ARCHIVED"]}
        searchPlaceholder={t("Search by title or author...", "بحث بالعنوان أو المؤلف...")}
      />
      <BulkActions items={filtered} idKey="id" onDelete={(ids) => deleteMutation.mutate(ids)}>
        {({ SelectAllCheckbox, RowCheckbox }) => (
          <Card>
            <CardHeader>
              <CardTitle>{t("All Content Items", "جميع عناصر المحتوى")} ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 w-10"><SelectAllCheckbox /></th>
                        <th className="pb-3 font-medium">{t("Title", "العنوان")}</th>
                        <th className="pb-3 font-medium">{t("Type", "النوع")}</th>
                        <th className="pb-3 font-medium">{t("Status", "الحالة")}</th>
                        <th className="pb-3 font-medium">{t("Author", "المؤلف")}</th>
                        <th className="pb-3 font-medium">{t("Updated", "تاريخ التحديث")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-3"><RowCheckbox id={item.id} /></td>
                          <td className="py-3">
                            <Link href={`/admin/content/${item.id}`} className="text-primary hover:underline">
                              {item.titleAr || item.titleEn}
                            </Link>
                          </td>
                          <td className="py-3">
                            <span className="bg-muted px-2 py-0.5 rounded text-xs">{item.contentType}</span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                              item.status === "DRAFT" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>{item.status}</span>
                          </td>
                          <td className="py-3 text-muted-foreground">{item.authorName}</td>
                          <td className="py-3 text-muted-foreground">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">
                          {search ? t("No content matching your search", "لا يوجد محتوى يطابق بحثك") : t("No content yet", "لا يوجد محتوى بعد")}
                        </td></tr>
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
