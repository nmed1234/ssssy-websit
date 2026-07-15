"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { NewsletterSubscriber, PaginatedResponse, ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

export default function AdminNewsletterPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<NewsletterSubscriber>>>("/newsletter/subscribers");
      return res.data.data;
    },
  });

  return (
    <div>
      <AdminPageHeader
        title={t("Newsletter", "النشرة البريدية")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Newsletter", "النشرة البريدية") },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("Subscribers", "المشتركون")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">{t("Email", "البريد الإلكتروني")}</th>
                    <th className="pb-3 font-medium">{t("Name", "الاسم")}</th>
                    <th className="pb-3 font-medium">{t("Status", "الحالة")}</th>
                    <th className="pb-3 font-medium">{t("Subscribed", "تاريخ الاشتراك")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content?.map((sub: NewsletterSubscriber) => (
                    <tr key={sub.id} className="border-b last:border-0">
                      <td className="py-3">{sub.email}</td>
                      <td className="py-3 text-muted-foreground">{sub.name || "-"}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${sub.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {sub.isActive ? t("Active", "نشط") : t("Unsubscribed", "إلغاء الاشتراك")}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                  {(!data?.content || data.content.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">{t("No subscribers found", "لا يوجد مشتركون")}</td>
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
