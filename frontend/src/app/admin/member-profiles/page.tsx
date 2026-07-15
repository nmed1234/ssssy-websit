"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { MemberProfile, ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

export default function AdminMemberProfilesPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-member-profiles"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any>>("/admin/members");
      return res.data.data.content || res.data.data;
    },
  });

  return (
    <div>
      <AdminPageHeader
        title={t("Member Profiles", "ملفات الأعضاء")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Member Profiles", "ملفات الأعضاء") },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("All Members", "جميع الأعضاء")}</CardTitle>
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
                    <th className="pb-3 font-medium">{t("Type", "النوع")}</th>
                    <th className="pb-3 font-medium">{t("Number", "الرقم")}</th>
                    <th className="pb-3 font-medium">{t("Specialization", "التخصص")}</th>
                    <th className="pb-3 font-medium">{t("Public", "عام")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((profile: MemberProfile) => (
                    <tr key={profile.id} className="border-b last:border-0">
                      <td className="py-3">{profile.userName || "N/A"}</td>
                      <td className="py-3">{profile.membershipType}</td>
                      <td className="py-3 text-muted-foreground">{profile.membershipNumber || "-"}</td>
                      <td className="py-3 text-muted-foreground">{profile.specialization || "-"}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${profile.isPublic ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {profile.isPublic ? t("Yes", "نعم") : t("No", "لا")}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">{t("No profiles found", "لا توجد ملفات")}</td>
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
