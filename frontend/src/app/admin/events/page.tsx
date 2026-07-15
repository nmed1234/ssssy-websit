"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Event, ApiResponse, PaginatedResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BulkActions } from "@/components/admin/BulkActions";
import { AdvancedFilters } from "@/components/admin/AdvancedFilters";
import { useLanguage } from "@/lib/language-context";

export default function AdminEventsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<Event>>>("/admin/events", { params: { size: 100 } });
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      const res = await api.post<ApiResponse<Event>>("/admin/events", form);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setShowCreateForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      await api.put(`/admin/events/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setEditingEvent(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/events/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-events"] }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.delete(`/admin/events/${id}`)));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-events"] }),
  });

  const filtered = useMemo(() => {
    const items: Event[] = data?.content || [];
    return items.filter((ev) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (ev.titleAr || "").toLowerCase().includes(q) ||
        (ev.titleEn || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || ev.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const getStatusBadge = (status?: string) => {
    const cls = status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                status === "DRAFT" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-700";
    return <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{status || "DRAFT"}</span>;
  };

  return (
    <div>
      <AdminPageHeader
        title={t("Events", "الفعاليات")}
        description={t("Manage events and registrations", "إدارة الفعاليات والتسجيلات")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Events", "الفعاليات") },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>{t("Refresh", "تحديث")}</Button>
            <Button onClick={() => setShowCreateForm(true)}>{t("Create Event", "إنشاء فعالية")}</Button>
          </div>
        }
      />

      {error && (
        <Card className="border-red-200 bg-red-50/50 mb-6">
          <CardContent className="pt-6">
            <p className="text-red-700">{t("Failed to load events.", "فشل تحميل الفعاليات.")}</p>
          </CardContent>
        </Card>
      )}

      <AdvancedFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"]}
        searchPlaceholder={t("Search by title…", "بحث بالعنوان…")}
      />

      <BulkActions
        items={filtered}
        idKey="id"
        onDelete={(ids) => bulkDeleteMutation.mutate(ids)}
      >
        {({ SelectAllCheckbox, RowCheckbox }) => (
          <Card>
            <CardHeader>
              <CardTitle>{t("All Events", "جميع الفعاليات")} ({filtered.length})</CardTitle>
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
                        <th className="pb-3 w-10"><SelectAllCheckbox /></th>
                        <th className="pb-3 font-medium">{t("Title", "العنوان")}</th>
                        <th className="pb-3 font-medium">{t("Type", "النوع")}</th>
                        <th className="pb-3 font-medium">{t("Date", "التاريخ")}</th>
                        <th className="pb-3 font-medium">{t("Status", "الحالة")}</th>
                        <th className="pb-3 font-medium">{t("Actions", "الإجراءات")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((event: Event) => (
                        <tr key={event.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3"><RowCheckbox id={event.id} /></td>
                          <td className="py-3">
                            <Link href={`/admin/events/${event.id}`} className="text-forest hover:underline">
                              {event.titleAr || event.titleEn}
                            </Link>
                          </td>
                          <td className="py-3">
                            <span className="bg-muted px-2 py-0.5 rounded text-xs">{event.eventType || "N/A"}</span>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "-"}
                          </td>
                          <td className="py-3">{getStatusBadge(event.status)}</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingEvent(event.id)}>{t("Edit", "تعديل")}</Button>
                              <Button size="sm" variant="destructive" onClick={() => { if (confirm(t("Delete this event?", "حذف هذه الفعالية؟"))) deleteMutation.mutate(event.id); }} disabled={deleteMutation.isPending}>{t("Delete", "حذف")}</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            {search ? t("No events matching your search", "لا توجد فعاليات تطابق بحثك") : t("No events found", "لا توجد فعاليات")}
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

      {showCreateForm && (
        <EventFormModal onSave={(form) => createMutation.mutate(form)} onClose={() => setShowCreateForm(false)} />
      )}

      {editingEvent && (
        <EditEventModal
          event={data?.content?.find((e) => e.id === editingEvent)!}
          onSave={(form) => updateMutation.mutate({ id: editingEvent, data: form })}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
}

function EventFormModal({ onSave, onClose }: { onSave: (form: Record<string, unknown>) => void; onClose: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    titleAr: "", titleEn: "", slug: "", description: "", content: "",
    eventDate: "", endDate: "", location: "", locationUrl: "",
    eventType: "CONFERENCE", organizer: "", isPublished: false,
    address: "", isOnline: false, onlineUrl: "", maxParticipants: "",
    registrationDeadline: "", contactEmail: "", status: "DRAFT",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t("Create Event", "إنشاء فعالية")}</h2>
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
            <label className="block text-sm font-medium mb-1">{t("Type", "النوع")}</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.eventType} onChange={set("eventType")}>
              <option value="CONFERENCE">{t("Conference", "مؤتمر")}</option>
              <option value="WORKSHOP">{t("Workshop", "ورشة عمل")}</option>
              <option value="WEBINAR">{t("Webinar", "ندوة إلكترونية")}</option>
              <option value="MEETING">{t("Meeting", "اجتماع")}</option>
              <option value="SEMINAR">{t("Seminar", "ندوة")}</option>
              <option value="OTHER">{t("Other", "أخرى")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Event Date *", "تاريخ الفعالية *")}</label>
            <Input type="datetime-local" value={form.eventDate} onChange={set("eventDate")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("End Date", "تاريخ الانتهاء")}</label>
            <Input type="datetime-local" value={form.endDate} onChange={set("endDate")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Status", "الحالة")}</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={set("status")}>
              <option value="DRAFT">{t("Draft", "مسودة")}</option>
              <option value="PUBLISHED">{t("Published", "منشور")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Location", "الموقع")}</label>
            <Input value={form.location} onChange={set("location")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Location URL", "رابط الموقع")}</label>
            <Input value={form.locationUrl} onChange={set("locationUrl")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Organizer", "المنظم")}</label>
            <Input value={form.organizer} onChange={set("organizer")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Contact Email", "البريد الإلكتروني للتواصل")}</label>
            <Input type="email" value={form.contactEmail} onChange={set("contactEmail")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Max Participants", "الحد الأقصى للمشاركين")}</label>
            <Input type="number" value={form.maxParticipants} onChange={set("maxParticipants")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Registration Deadline", "الموعد النهائي للتسجيل")}</label>
            <Input type="datetime-local" value={form.registrationDeadline} onChange={set("registrationDeadline")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("Description", "الوصف")}</label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={form.description} onChange={set("description")} />
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

function EditEventModal({ event, onSave, onClose }: { event: Event; onSave: (form: Record<string, unknown>) => void; onClose: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    titleAr: event.titleAr || "",
    titleEn: event.titleEn || "",
    description: event.description || "",
    location: event.location || "",
    eventType: event.eventType || "CONFERENCE",
    organizer: event.organizer || "",
    status: event.status || "DRAFT",
    isPublished: event.isPublished,
    maxParticipants: event.maxParticipants ?? "",
    contactEmail: event.contactEmail || "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t("Edit Event", "تعديل الفعالية")}</h2>
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
            <label className="block text-sm font-medium mb-1">{t("Type", "النوع")}</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.eventType} onChange={set("eventType")}>
              <option value="CONFERENCE">{t("Conference", "مؤتمر")}</option>
              <option value="WORKSHOP">{t("Workshop", "ورشة عمل")}</option>
              <option value="WEBINAR">{t("Webinar", "ندوة إلكترونية")}</option>
              <option value="MEETING">{t("Meeting", "اجتماع")}</option>
              <option value="SEMINAR">{t("Seminar", "ندوة")}</option>
              <option value="OTHER">{t("Other", "أخرى")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Status", "الحالة")}</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={set("status")}>
              <option value="DRAFT">{t("Draft", "مسودة")}</option>
              <option value="PUBLISHED">{t("Published", "منشور")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Location", "الموقع")}</label>
            <Input value={form.location} onChange={set("location")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Organizer", "المنظم")}</label>
            <Input value={form.organizer} onChange={set("organizer")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Max Participants", "الحد الأقصى للمشاركين")}</label>
            <Input type="number" value={form.maxParticipants} onChange={set("maxParticipants")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Contact Email", "البريد الإلكتروني للتواصل")}</label>
            <Input type="email" value={form.contactEmail} onChange={set("contactEmail")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("Description", "الوصف")}</label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={form.description} onChange={set("description")} />
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
