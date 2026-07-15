"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Comment, PaginatedResponse, ApiResponse } from "@/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchBar } from "@/components/admin/SearchBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trash2, MessageSquare, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const filters = ["ALL", "PENDING", "APPROVED"] as const;

export default function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<Comment>>>("/admin/comments");
      return res.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/admin/comments/${id}/approve`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-comments"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/comments/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-comments"] }),
  });

  const filtered = useMemo(() => {
    const items = data?.content || [];
    return items.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (c.body || "").toLowerCase().includes(q) ||
        (c.authorName || "").toLowerCase().includes(q);
      const matchesFilter = filter === "ALL" ||
        (filter === "PENDING" && !c.isApproved) ||
        (filter === "APPROVED" && c.isApproved);
      return matchesSearch && matchesFilter;
    });
  }, [data, search, filter]);

  const filterLabels: Record<string, string> = {
    ALL: t("All", "الكل"),
    PENDING: t("Pending", "معلق"),
    APPROVED: t("Approved", "معتمد"),
  };

  return (
    <div>
      <AdminPageHeader
        title={t("Comments", "التعليقات")}
        description={t("Moderate user comments across the site", "إدارة تعليقات المستخدمين على الموقع")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Comments", "التعليقات") },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-comments"] })}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t("Refresh", "تحديث")}
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder={t("Search by author or content...", "بحث بالمؤلف أو المحتوى...")} />
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t("Comments", "التعليقات")} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">{t("Author", "المؤلف")}</th>
                    <th className="pb-3 font-medium">{t("Comment", "التعليق")}</th>
                    <th className="pb-3 font-medium">{t("Status", "الحالة")}</th>
                    <th className="pb-3 font-medium">{t("Date", "التاريخ")}</th>
                    <th className="pb-3 font-medium">{t("Actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((comment: Comment) => (
                    <tr key={comment.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{comment.authorName}</td>
                      <td className="py-3 text-muted-foreground max-w-xs">
                        <p className="truncate" title={comment.body}>{comment.body}</p>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={comment.isApproved ? "default" : "secondary"}
                          className={comment.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                        >
                          {comment.isApproved ? t("Approved", "معتمد") : t("Pending", "معلق")}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {!comment.isApproved && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                              onClick={() => approveMutation.mutate(comment.id)}
                              disabled={approveMutation.isPending}
                              title={t("Approve", "موافقة")}
                            >
                              <CheckCircle size={16} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => rejectMutation.mutate(comment.id)}
                            disabled={rejectMutation.isPending}
                            title={comment.isApproved ? t("Delete", "حذف") : t("Reject", "رفض")}
                          >
                            {comment.isApproved ? <Trash2 size={16} /> : <XCircle size={16} />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        {search ? t("No comments matching your search", "لا توجد تعليقات تطابق بحثك") : t("No comments found", "لا توجد تعليقات")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
