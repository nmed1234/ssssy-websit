"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { BoardMember, ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

export default function AdminBoardMembersPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-board-members"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BoardMember[]>>("/admin/board-members");
      return res.data.data;
    },
  });

  return (
    <div>
      <AdminPageHeader
        title={t("Board Members", "أعضاء مجلس الإدارة")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Board Members", "أعضاء مجلس الإدارة") },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("All Board Members", "جميع أعضاء مجلس الإدارة")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">{t("Name", "الاسم")}</th>
                    <th className="pb-3 font-medium">{t("Position (EN)", "المنصب (إنجليزي)")}</th>
                    <th className="pb-3 font-medium">{t("Term", "الفترة")}</th>
                    <th className="pb-3 font-medium">{t("Status", "الحالة")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((member: BoardMember) => (
                    <tr key={member.id} className="border-b last:border-0">
                      <td className="py-3">{member.userName || "N/A"}</td>
                      <td className="py-3 text-muted-foreground">{member.positionEn || member.positionAr}</td>
                      <td className="py-3 text-muted-foreground">
                        {member.termStart ? `${member.termStart} - ${member.termEnd || t("Present", "الحاضر")}` : "N/A"}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {member.isActive ? t("Active", "نشط") : t("Inactive", "غير نشط")}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">{t("No board members found", "لا يوجد أعضاء مجلس إدارة")}</td>
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
