"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { JobVacancy, ApiResponse, PaginatedResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

export default function AdminJobsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<JobVacancy>>>("/admin/jobs", { params: { size: 100 } });
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      const res = await api.post<ApiResponse<JobVacancy>>("/admin/jobs", form);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      setShowCreateForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      await api.put(`/admin/jobs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      setEditingJob(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/jobs/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }),
  });

  const getStatusBadge = (isPublished: boolean) => (
    <span className={`px-2 py-1 rounded-full text-xs ${isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
      {isPublished ? t("Published", "منشور") : t("Draft", "مسودة")}
    </span>
  );

  return (
    <div>
      <AdminPageHeader
        title={t("Job Vacancies", "الوظائف الشاغرة")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Job Vacancies", "الوظائف الشاغرة") },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>{t("Refresh", "تحديث")}</Button>
            <Button onClick={() => setShowCreateForm(true)}>{t("Create Job", "إنشاء وظيفة")}</Button>
          </div>
        }
      />

      {error && (
        <Card className="border-red-200 bg-red-50/50 mb-6">
          <CardContent className="pt-6">
            <p className="text-red-700">{t("Failed to load jobs.", "فشل تحميل الوظائف.")}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("All Job Vacancies", "جميع الوظائف الشاغرة")} ({data?.totalElements ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">{t("Title", "العنوان")}</th>
                    <th className="pb-3 font-medium">{t("Department", "القسم")}</th>
                    <th className="pb-3 font-medium">{t("Deadline", "الموعد النهائي")}</th>
                    <th className="pb-3 font-medium">{t("Status", "الحالة")}</th>
                    <th className="pb-3 font-medium">{t("Applications", "الطلبات")}</th>
                    <th className="pb-3 font-medium">{t("Actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content?.map((job: JobVacancy) => (
                    <tr key={job.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3">
                        <Link href={`/admin/jobs/${job.id}`} className="text-forest hover:underline">
                          {job.titleAr || job.titleEn}
                        </Link>
                      </td>
                      <td className="py-3 text-muted-foreground">{job.department || "N/A"}</td>
                      <td className="py-3 text-muted-foreground">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3">{getStatusBadge(job.isPublished)}</td>
                      <td className="py-3 text-muted-foreground">-</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingJob(job.id)}>{t("Edit", "تعديل")}</Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm(t("Delete this job?", "حذف هذه الوظيفة؟"))) deleteMutation.mutate(job.id); }} disabled={deleteMutation.isPending}>{t("Delete", "حذف")}</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data?.content || data.content.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">{t("No job vacancies found", "لا توجد وظائف شاغرة")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateForm && (
        <JobFormModal onSave={(form) => createMutation.mutate(form)} onClose={() => setShowCreateForm(false)} />
      )}

      {editingJob && (
        <EditJobModal
          job={data?.content?.find((j) => j.id === editingJob)!}
          onSave={(form) => updateMutation.mutate({ id: editingJob, data: form })}
          onClose={() => setEditingJob(null)}
        />
      )}
    </div>
  );
}

function JobFormModal({ onSave, onClose }: { onSave: (form: Record<string, unknown>) => void; onClose: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    titleAr: "", titleEn: "", slug: "", description: "", requirements: "",
    location: "", jobType: "FULL_TIME", department: "", deadline: "",
    isPublished: false,
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t("Create Job Vacancy", "إنشاء وظيفة شاغرة")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("Title (Ar)", "العنوان (عربي)")}</label>
            <Input value={form.titleAr} onChange={set("titleAr")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Title (En)", "العنوان (إنجليزي)")}</label>
            <Input value={form.titleEn} onChange={set("titleEn")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Slug", "الرابط المختصر")}</label>
            <Input value={form.slug} onChange={set("slug")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Job Type", "نوع الوظيفة")}</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.jobType} onChange={set("jobType")}>
              <option value="FULL_TIME">{t("Full-time", "دوام كامل")}</option>
              <option value="PART_TIME">{t("Part-time", "دوام جزئي")}</option>
              <option value="CONTRACT">{t("Contract", "عقد")}</option>
              <option value="TEMPORARY">{t("Temporary", "مؤقت")}</option>
              <option value="INTERNSHIP">{t("Internship", "تدريب")}</option>
              <option value="VOLUNTEER">{t("Volunteer", "تطوع")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Department", "القسم")}</label>
            <Input value={form.department} onChange={set("department")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Location", "الموقع")}</label>
            <Input value={form.location} onChange={set("location")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Deadline", "الموعد النهائي")}</label>
            <Input type="datetime-local" value={form.deadline} onChange={set("deadline")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("Description", "الوصف")}</label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={form.description} onChange={set("description")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("Requirements", "المتطلبات")}</label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={form.requirements} onChange={set("requirements")} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>{t("Cancel", "إلغاء")}</Button>
          <Button onClick={() => onSave(form)} disabled={!form.titleEn && !form.titleAr}>{t("Create", "إنشاء")}</Button>
        </div>
      </div>
    </div>
  );
}

function EditJobModal({ job, onSave, onClose }: { job: JobVacancy; onSave: (form: Record<string, unknown>) => void; onClose: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    titleAr: job.titleAr || "",
    titleEn: job.titleEn || "",
    description: job.description || "",
    requirements: job.requirements || "",
    location: job.location || "",
    jobType: job.jobType || "FULL_TIME",
    department: job.department || "",
    deadline: job.deadline || "",
    isPublished: job.isPublished,
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t("Edit Job", "تعديل الوظيفة")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("Title (Ar)", "العنوان (عربي)")}</label>
            <Input value={form.titleAr} onChange={set("titleAr")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Title (En)", "العنوان (إنجليزي)")}</label>
            <Input value={form.titleEn} onChange={set("titleEn")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Job Type", "نوع الوظيفة")}</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.jobType} onChange={set("jobType")}>
              <option value="FULL_TIME">{t("Full-time", "دوام كامل")}</option>
              <option value="PART_TIME">{t("Part-time", "دوام جزئي")}</option>
              <option value="CONTRACT">{t("Contract", "عقد")}</option>
              <option value="TEMPORARY">{t("Temporary", "مؤقت")}</option>
              <option value="INTERNSHIP">{t("Internship", "تدريب")}</option>
              <option value="VOLUNTEER">{t("Volunteer", "تطوع")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Department", "القسم")}</label>
            <Input value={form.department} onChange={set("department")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Location", "الموقع")}</label>
            <Input value={form.location} onChange={set("location")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Deadline", "الموعد النهائي")}</label>
            <Input type="datetime-local" value={form.deadline} onChange={set("deadline")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("Description", "الوصف")}</label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={form.description} onChange={set("description")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("Requirements", "المتطلبات")}</label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={form.requirements} onChange={set("requirements")} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>{t("Cancel", "إلغاء")}</Button>
          <Button onClick={() => onSave(form)}>{t("Save", "حفظ")}</Button>
        </div>
      </div>
    </div>
  );
}
