"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Event, EventRegistration, EventReminderRule, ApiResponse, PaginatedResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";
import {
  Save, Globe, ArrowLeft, Trash2, Copy, Users, Bell, BarChart2,
  Settings, MapPin, Wifi, Calendar, CheckCircle, Clock, XCircle,
  Download, Plus, Send, Eye, Star, AlertTriangle, Edit, RefreshCw,
  UserCheck, ChevronDown, Mail, Smartphone,
} from "lucide-react";

// ── Shared helpers ────────────────────────────────────────────────────────────

const AR_MAP: Record<string, string> = {
  ا:"a",أ:"a",إ:"i",آ:"aa",ب:"b",ت:"t",ث:"th",ج:"j",ح:"h",خ:"kh",
  د:"d",ذ:"dh",ر:"r",ز:"z",س:"s",ش:"sh",ص:"s",ض:"d",ط:"t",ظ:"z",
  ع:"a",غ:"gh",ف:"f",ق:"q",ك:"k",ل:"l",م:"m",ن:"n",ه:"h",و:"w",
  ي:"y",ى:"a",ة:"a",ء:"",ئ:"y",ؤ:"w",
};
function toSlug(text: string): string {
  let s = text;
  for (const [ar, en] of Object.entries(AR_MAP)) s = s.split(ar).join(en);
  return s.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const FIELD_CLS = "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1.5">
        {label}{required && <span className="text-red-500 ms-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED:  "bg-red-100 text-red-600 border-red-200",
  WAITLISTED: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CHECKED_IN: "bg-blue-100 text-blue-700 border-blue-200",
};

// ── DetailsTab ────────────────────────────────────────────────────────────────

function DetailsTab({ event, onSave, isSaving }: {
  event: Event;
  onSave: (payload: Record<string, unknown>) => void;
  isSaving: boolean;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    titleAr:              event.titleAr || "",
    titleEn:              event.titleEn || "",
    slug:                 event.slug || "",
    description:          event.description || "",
    eventDate:            event.eventDate ? event.eventDate.slice(0, 16) : "",
    endDate:              event.endDate ? event.endDate.slice(0, 16) : "",
    location:             event.location || "",
    locationUrl:          event.locationUrl || "",
    address:              event.address || "",
    latitude:             event.latitude?.toString() || "",
    longitude:            event.longitude?.toString() || "",
    isOnline:             event.isOnline ?? false,
    onlineUrl:            event.onlineUrl || "",
    eventType:            event.eventType || "CONFERENCE",
    organizer:            event.organizer || "",
    contactEmail:         event.contactEmail || "",
    featuredImage:        event.featuredImage || "",
    maxParticipants:      event.maxParticipants?.toString() || "",
    registrationDeadline: event.registrationDeadline ? event.registrationDeadline.slice(0, 16) : "",
    status:               event.status || "DRAFT",
  });

  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");
  const [slugTouched, setSlugTouched] = useState(true);

  const set = useCallback((key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        if (key === "titleEn" && !slugTouched) next.slug = toSlug(value as string);
        return next;
      });
    }, [slugTouched]);

  const handleSave = () => {
    onSave({
      ...form,
      eventDate:            form.eventDate || null,
      endDate:              form.endDate || null,
      registrationDeadline: form.registrationDeadline || null,
      maxParticipants:      form.maxParticipants ? Number(form.maxParticipants) : null,
      latitude:             form.latitude ? Number(form.latitude) : null,
      longitude:            form.longitude ? Number(form.longitude) : null,
      isPublished:          form.status === "PUBLISHED",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">

        {/* Bilingual Titles */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">{t("Event Title","عنوان الفعالية")}</CardTitle>
              <div className="flex rounded-md border overflow-hidden text-xs">
                {(["en","ar"] as const).map((l) => (
                  <button key={l} onClick={() => setActiveTab(l)}
                    className={`px-3 py-1 font-medium transition-colors ${activeTab === l ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeTab === "en" ? (
              <Field label={t("English Title","العنوان الإنجليزي")} required>
                <Input value={form.titleEn} onChange={set("titleEn")} />
              </Field>
            ) : (
              <Field label={t("Arabic Title","العنوان العربي")} required>
                <Input value={form.titleAr} onChange={set("titleAr")} dir="rtl" />
              </Field>
            )}
            <Field label={t("URL Slug","الرابط المختصر")} hint={t("Must be unique across all events.","يجب أن يكون فريدًا.")}>
              <Input value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug")(e); }} className="font-mono text-xs" />
            </Field>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("Description","الوصف")}</CardTitle></CardHeader>
          <CardContent>
            <textarea value={form.description} onChange={set("description")}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm min-h-[140px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder={t("Detailed description…","وصف مفصل…")} />
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">{t("Date & Time","التاريخ والوقت")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label={t("Start Date & Time","تاريخ ووقت البدء")} required>
              <Input type="datetime-local" value={form.eventDate} onChange={set("eventDate")} />
            </Field>
            <Field label={t("End Date & Time","تاريخ ووقت الانتهاء")}>
              <Input type="datetime-local" value={form.endDate} onChange={set("endDate")} />
            </Field>
            <Field label={t("Registration Deadline","الموعد النهائي للتسجيل")}>
              <Input type="datetime-local" value={form.registrationDeadline} onChange={set("registrationDeadline")} />
            </Field>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {form.isOnline ? <Wifi className="w-4 h-4 text-teal-600" /> : <MapPin className="w-4 h-4 text-muted-foreground" />}
                <CardTitle className="text-sm font-semibold">{t("Location","الموقع")}</CardTitle>
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <span className="text-muted-foreground">{t("Online","إلكترونية")}</span>
                <div onClick={() => setForm(p => ({ ...p, isOnline: !p.isOnline }))}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${form.isOnline ? "bg-teal-500" : "bg-muted border"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isOnline ? "start-4" : "start-0.5"}`} />
                </div>
              </label>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.isOnline ? (
              <Field label={t("Online URL","رابط الفعالية الإلكترونية")}>
                <Input value={form.onlineUrl} onChange={set("onlineUrl")} placeholder="https://zoom.us/j/..." />
              </Field>
            ) : (
              <div className="space-y-3">
                <Field label={t("Venue","المكان")}>
                  <Input value={form.location} onChange={set("location")} />
                </Field>
                <Field label={t("Address","العنوان")}>
                  <Input value={form.address} onChange={set("address")} />
                </Field>
                <Field label={t("Maps URL","رابط الخرائط")}>
                  <Input value={form.locationUrl} onChange={set("locationUrl")} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("Latitude","خط العرض")}>
                    <Input type="number" step="any" value={form.latitude} onChange={set("latitude")} />
                  </Field>
                  <Field label={t("Longitude","خط الطول")}>
                    <Input type="number" step="any" value={form.longitude} onChange={set("longitude")} />
                  </Field>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        {/* Publish */}
        <Card className="border-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("Status & Publish","الحالة والنشر")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label={t("Status","الحالة")}>
              <select value={form.status} onChange={set("status")} className={FIELD_CLS}>
                <option value="DRAFT">{t("Draft","مسودة")}</option>
                <option value="PUBLISHED">{t("Published","منشور")}</option>
                <option value="ARCHIVED">{t("Archived","مؤرشف")}</option>
                <option value="CANCELLED">{t("Cancelled","ملغي")}</option>
              </select>
            </Field>
            <Button className="w-full" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="w-3.5 h-3.5 me-1.5" />{isSaving ? t("Saving…","جاري الحفظ…") : t("Save Changes","حفظ التغييرات")}
            </Button>
            <Button className="w-full" variant="outline" size="sm" asChild>
              <a href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="w-3.5 h-3.5 me-1.5" />{t("Preview Public Page","معاينة الصفحة العامة")}
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Event details */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("Event Details","تفاصيل الفعالية")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label={t("Event Type","نوع الفعالية")}>
              <select value={form.eventType} onChange={set("eventType")} className={FIELD_CLS}>
                {[["CONFERENCE",t("Conference","مؤتمر")],["WORKSHOP",t("Workshop","ورشة عمل")],["WEBINAR",t("Webinar","ندوة إلكترونية")],["MEETING",t("Meeting","اجتماع")],["SEMINAR",t("Seminar","ندوة")],["OTHER",t("Other","أخرى")]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label={t("Organizer","المنظم")}>
              <Input value={form.organizer} onChange={set("organizer")} />
            </Field>
            <Field label={t("Contact Email","بريد التواصل")}>
              <Input type="email" value={form.contactEmail} onChange={set("contactEmail")} />
            </Field>
            <Field label={t("Max Participants","الحد الأقصى")}>
              <Input type="number" value={form.maxParticipants} onChange={set("maxParticipants")} />
            </Field>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("Featured Image","الصورة المميزة")}</CardTitle></CardHeader>
          <CardContent>
            <Input value={form.featuredImage} onChange={set("featuredImage")} className="text-xs" placeholder="URL…" />
            {form.featuredImage && (
              <div className="mt-2 rounded-lg overflow-hidden border aspect-video">
                <img src={form.featuredImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-muted/30 border">
          <p><span className="font-medium">{t("Created by","أنشأه")}: </span>{event.createdByName}</p>
          <p><span className="font-medium">{t("Created","تاريخ الإنشاء")}: </span>{new Date(event.createdAt).toLocaleDateString()}</p>
          <p><span className="font-medium">{t("Updated","آخر تحديث")}: </span>{new Date(event.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

// ── RegistrationsTab ──────────────────────────────────────────────────────────

function RegistrationsTab({ eventId, event }: { eventId: string; event: Event }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["event-registrations", eventId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<EventRegistration>>>(`/admin/events/${eventId}/registrations`, { params: { size: 200 } });
      return res.data.data;
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (regId: string) => { await api.put(`/admin/events/${eventId}/registrations/${regId}/checkin`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-registrations", eventId] }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ regId, status }: { regId: string; status: string }) => {
      await api.put(`/admin/events/${eventId}/registrations/${regId}/status`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-registrations", eventId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (regId: string) => { await api.delete(`/admin/events/${eventId}/registrations/${regId}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-registrations", eventId] }),
  });

  const regs = data?.content || [];
  const filtered = regs.filter(r => {
    const q = search.toLowerCase();
    const m = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    const s = statusFilter === "ALL" || r.status === statusFilter;
    return m && s;
  });

  const confirmed   = regs.filter(r => r.status === "CONFIRMED").length;
  const checkedIn   = regs.filter(r => r.checkedIn).length;
  const waitlisted  = regs.filter(r => r.status === "WAITLISTED").length;
  const cap         = event.maxParticipants;
  const fillPct     = cap ? Math.min(100, (confirmed / cap) * 100) : null;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: t("Total","إجمالي"), value: regs.length, color: "bg-blue-50 border-blue-100 text-blue-700" },
          { label: t("Confirmed","مؤكد"), value: confirmed, color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
          { label: t("Checked-in","حضر"), value: checkedIn, color: "bg-indigo-50 border-indigo-100 text-indigo-700" },
          { label: t("Waitlisted","قائمة الانتظار"), value: waitlisted, color: "bg-yellow-50 border-yellow-100 text-yellow-700" },
        ].map(s => (
          <div key={s.label} className={`flex-1 min-w-[100px] border rounded-lg p-3 ${s.color}`}>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
        {cap && (
          <div className="flex-1 min-w-[120px] border rounded-lg p-3 bg-gray-50 border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">{t("Capacity","الطاقة الاستيعابية")}</span>
              <span className="text-xs font-bold">{confirmed}/{cap}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${fillPct}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">{fillPct?.toFixed(0)}% {t("full","ممتلئة")}</div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Search name or email…","بحث بالاسم أو البريد…")}
          className="flex-1 min-w-[200px] h-9"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-2 text-sm">
          {["ALL","CONFIRMED","WAITLISTED","CANCELLED","CHECKED_IN"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button size="sm" variant="outline" asChild className="h-9">
          <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/admin/events/${eventId}/registrations/export`} download>
            <Download className="w-3.5 h-3.5 me-1" />{t("CSV","CSV")}
          </a>
        </Button>
        <Button size="sm" variant="outline" className="h-9" onClick={() => setShowMsgModal(true)}>
          <Mail className="w-3.5 h-3.5 me-1" />{t("Message All","رسالة للجميع")}
        </Button>
        <Button size="sm" className="h-9" onClick={() => setShowAddModal(true)}>
          <Plus className="w-3.5 h-3.5 me-1" />{t("Add Registrant","إضافة مسجل")}
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="border-b">
                  {[t("Name","الاسم"),t("Email","البريد"),t("Organization","المنظمة"),t("Status","الحالة"),t("Check-in","تسجيل الحضور"),t("Date","التاريخ"),t("Actions","إجراءات")].map(h => (
                    <th key={h} className="py-2.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="py-3"><div className="h-8 bg-muted/50 rounded animate-pulse" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>{t("No registrations yet","لا توجد تسجيلات بعد")}</p>
                  </td></tr>
                ) : filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-muted/20 group transition-colors">
                    <td className="py-3 font-medium">{reg.name}</td>
                    <td className="py-3 text-muted-foreground">{reg.email}</td>
                    <td className="py-3 text-muted-foreground">{reg.organization || "—"}</td>
                    <td className="py-3">
                      <select
                        value={reg.status || "CONFIRMED"}
                        onChange={(e) => statusMutation.mutate({ regId: reg.id, status: e.target.value })}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border cursor-pointer ${STATUS_STYLES[reg.status || "CONFIRMED"] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                      >
                        {["CONFIRMED","WAITLISTED","CANCELLED","CHECKED_IN"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => checkInMutation.mutate(reg.id)}
                        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${reg.checkedIn ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" : "bg-muted text-muted-foreground border-border hover:bg-muted/80"}`}
                      >
                        <UserCheck className="w-3 h-3" />
                        {reg.checkedIn ? t("Checked-in","حضر") : t("Check in","تسجيل الحضور")}
                      </button>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive opacity-0 group-hover:opacity-100"
                        onClick={() => { if (confirm(t("Remove this registrant?","إزالة هذا المسجل؟"))) deleteMutation.mutate(reg.id); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showAddModal && <AddRegistrantModal eventId={eventId} onClose={() => setShowAddModal(false)} />}
      {showMsgModal && <BulkMessageModal eventId={eventId} onClose={() => setShowMsgModal(false)} />}
    </div>
  );
}

// ── NotificationsTab ──────────────────────────────────────────────────────────

function NotificationsTab({ eventId }: { eventId: string }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<EventReminderRule | null>(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["event-reminders", eventId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<EventReminderRule[]>>(`/admin/events/${eventId}/reminders`);
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ruleId: string) => { await api.delete(`/admin/events/${eventId}/reminders/${ruleId}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-reminders", eventId] }),
  });

  const fireMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const res = await api.post<ApiResponse<Record<string, unknown>>>(`/admin/events/${eventId}/reminders/${ruleId}/fire`);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["event-reminders", eventId] });
      alert(t(`Sent to ${data.sent} recipients`, `أُرسل إلى ${data.sent} مستلم`));
    },
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{t("Reminder Rules","قواعد التذكير")}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{t("Configure automated emails and in-app notifications for registrants","تكوين الرسائل الإلكترونية والإشعارات التلقائية للمسجلين")}</p>
        </div>
        <Button size="sm" onClick={() => { setEditingRule(null); setShowForm(true); }}>
          <Plus className="w-3.5 h-3.5 me-1.5" />{t("Add Reminder","إضافة تذكير")}
        </Button>
      </div>

      {/* Flow diagram */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {[
              { icon: Clock, text: t("Scheduler runs every 60s","يعمل كل ٦٠ ثانية") },
              { icon: Bell, text: t("Checks fire_at ≤ now","يفحص وقت الإرسال") },
              { icon: Users, text: t("Loads confirmed registrants","يحمّل المسجلين المؤكدين") },
              { icon: Mail, text: t("Sends email + in-app","يرسل بريد + إشعار") },
              { icon: CheckCircle, text: t("Marks rule fired","يسجل الإرسال") },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-border">→</span>}
                <Icon className="w-3 h-3" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules list */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />)}</div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t("No reminder rules configured","لا توجد قواعد تذكير مكوّنة")}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowForm(true)}>
              <Plus className="w-3.5 h-3.5 me-1" />{t("Add your first reminder","إضافة أول تذكير")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className={`border-s-4 ${rule.isFired ? "border-s-emerald-400" : "border-s-blue-400"}`}>
              <CardContent className="py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${rule.isFired ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
                        {rule.isFired ? t("FIRED","أُرسل") : t("PENDING","منتظر")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {rule.ruleType === "BEFORE_EVENT" ? t(`${rule.offsetHours}h before event`,`${rule.offsetHours} ساعة قبل الفعالية`) :
                         rule.ruleType === "AFTER_EVENT"  ? t(`${rule.offsetHours}h after event`, `${rule.offsetHours} ساعة بعد الفعالية`) :
                         t("Custom date","تاريخ مخصص")}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {rule.sendEmail && <><Mail className="w-3 h-3" /><span>{t("Email","بريد")}</span></>}
                        {rule.sendInApp && <><Smartphone className="w-3 h-3 ms-1" /><span>{t("In-app","داخل التطبيق")}</span></>}
                      </div>
                    </div>
                    <p className="text-sm font-medium line-clamp-1">{rule.subjectTemplate}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("Fire at","الإرسال في")}: {new Date(rule.fireAt).toLocaleString()}
                      {rule.firedAt && <span className="ms-2">{t("• Sent","• أُرسل")}: {new Date(rule.firedAt).toLocaleString()} ({rule.recipientsCount} {t("recipients","مستلم")})</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!rule.isFired && (
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs"
                        onClick={() => fireMutation.mutate(rule.id)} disabled={fireMutation.isPending}>
                        <Send className="w-3 h-3 me-1" />{t("Send Now","إرسال الآن")}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingRule(rule); setShowForm(true); }}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => { if (confirm(t("Delete this reminder rule?","حذف قاعدة التذكير؟"))) deleteMutation.mutate(rule.id); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <ReminderRuleModal
          eventId={eventId}
          rule={editingRule}
          onClose={() => { setShowForm(false); setEditingRule(null); }}
        />
      )}
    </div>
  );
}

// ── AnalyticsTab ──────────────────────────────────────────────────────────────

function AnalyticsTab({ event }: { event: Event }) {
  const { t } = useLanguage();

  const { data: regs } = useQuery({
    queryKey: ["event-registrations-full", event.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<EventRegistration>>>(`/admin/events/${event.id}/registrations`, { params: { size: 500 } });
      return res.data.data?.content || [];
    },
  });

  const totalRegs   = regs?.length || 0;
  const confirmed   = regs?.filter(r => r.status === "CONFIRMED").length || 0;
  const waitlisted  = regs?.filter(r => r.status === "WAITLISTED").length || 0;
  const cancelled   = regs?.filter(r => r.status === "CANCELLED").length || 0;
  const checkedIn   = regs?.filter(r => r.checkedIn).length || 0;
  const checkinRate = confirmed > 0 ? ((checkedIn / confirmed) * 100).toFixed(0) : "0";
  const cap         = event.maxParticipants;
  const fillRate    = cap && cap > 0 ? ((confirmed / cap) * 100).toFixed(0) : null;

  // Organisation breakdown
  const orgMap: Record<string, number> = {};
  regs?.forEach(r => { if (r.organization) { orgMap[r.organization] = (orgMap[r.organization] || 0) + 1; } });
  const orgList = Object.entries(orgMap).sort((a,b) => b[1]-a[1]).slice(0, 8);

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t("Total Registrations","إجمالي التسجيلات"), value: totalRegs, color: "bg-blue-50 border-blue-100 text-blue-700" },
          { label: t("Confirmed","مؤكد"), value: confirmed, color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
          { label: t("Check-in Rate","نسبة الحضور"), value: `${checkinRate}%`, color: "bg-indigo-50 border-indigo-100 text-indigo-700" },
          { label: t("Capacity Fill","الطاقة المستخدمة"), value: fillRate ? `${fillRate}%` : "∞", color: "bg-purple-50 border-purple-100 text-purple-700" },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("Status Distribution","توزيع الحالات")}</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: t("Confirmed","مؤكد"), count: confirmed, color: "bg-emerald-500" },
              { label: t("Checked-in","حضر"), count: checkedIn, color: "bg-blue-500" },
              { label: t("Waitlisted","قائمة انتظار"), count: waitlisted, color: "bg-yellow-500" },
              { label: t("Cancelled","ملغي"), count: cancelled, color: "bg-red-400" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium">{s.count}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: totalRegs > 0 ? `${(s.count/totalRegs)*100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Organisation breakdown */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("Top Organizations","أبرز المنظمات")}</CardTitle></CardHeader>
          <CardContent>
            {orgList.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("No organisation data","لا بيانات للمنظمات")}</p>
            ) : (
              <div className="space-y-2">
                {orgList.map(([org, count]) => (
                  <div key={org} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground truncate flex-1">{org}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / totalRegs) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium w-5 text-end">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Capacity gauge */}
      {cap && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("Capacity Gauge","مقياس الطاقة الاستيعابية")}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${Number(fillRate) >= 90 ? "bg-red-500" : Number(fillRate) >= 70 ? "bg-yellow-500" : "bg-emerald-500"}`}
                  style={{ width: `${fillRate}%` }} />
              </div>
              <span className="text-sm font-bold whitespace-nowrap">{confirmed} / {cap} ({fillRate}%)</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {cap - confirmed > 0 ? t(`${cap - confirmed} spots remaining`, `${cap - confirmed} مكان متبقٍ`) : t("Event is fully booked","الفعالية مكتملة")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── PublicControlsTab ─────────────────────────────────────────────────────────

function PublicControlsTab({ event, onSave, isSaving }: {
  event: Event; onSave: (p: Record<string, unknown>) => void; isSaving: boolean;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    isFeatured:      event.isFeatured ?? false,
    displayOrder:    event.displayOrder?.toString() || "0",
    ogImage:         event.ogImage || "",
    metaTitle:       event.metaTitle || "",
    metaDescription: event.metaDescription || "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" />
            <CardTitle className="text-sm font-semibold">{t("Featured & Ordering","المميز والترتيب")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium">{t("Featured Event","فعالية مميزة")}</p>
              <p className="text-xs text-muted-foreground">{t("Show in hero/highlight sections","عرض في أقسام الهيرو والإبراز")}</p>
            </div>
            <div onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}
              className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${form.isFeatured ? "bg-amber-400" : "bg-muted border"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isFeatured ? "start-5" : "start-1"}`} />
            </div>
          </label>
          <Field label={t("Display Order","ترتيب العرض")} hint={t("Lower numbers appear first","الأرقام الأصغر تظهر أولاً")}>
            <Input type="number" value={form.displayOrder} onChange={set("displayOrder")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">{t("SEO & Social","SEO والمشاركة الاجتماعية")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label={t("Meta Title","عنوان SEO")} hint={t("50–60 characters ideal","٥٠-٦٠ حرف مثالي")}>
            <Input value={form.metaTitle} onChange={set("metaTitle")} placeholder={event.titleEn || event.titleAr || ""} />
          </Field>
          <Field label={t("Meta Description","وصف SEO")} hint={t("150–160 characters ideal","١٥٠-١٦٠ حرف مثالي")}>
            <textarea value={form.metaDescription} onChange={set("metaDescription")}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder={event.description?.slice(0, 160) || ""} />
          </Field>
          <Field label={t("OG Image URL","صورة المشاركة الاجتماعية")}>
            <Input value={form.ogImage} onChange={set("ogImage")} placeholder="https://…" />
          </Field>
          {form.ogImage && (
            <div className="rounded-lg overflow-hidden border aspect-video mt-1">
              <img src={form.ogImage} alt="OG preview" className="w-full h-full object-cover" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="md:col-span-2 flex justify-end">
        <Button onClick={() => onSave({ ...form, isFeatured: form.isFeatured, displayOrder: Number(form.displayOrder) })} disabled={isSaving}>
          <Save className="w-3.5 h-3.5 me-1.5" />{isSaving ? t("Saving…","جاري الحفظ…") : t("Save Public Controls","حفظ إعدادات الصفحة العامة")}
        </Button>
      </div>
    </div>
  );
}

// ── Modal Helpers ─────────────────────────────────────────────────────────────

function AddRegistrantModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "", notes: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async () => { await api.post(`/admin/events/${eventId}/registrations`, form); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["event-registrations", eventId] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg">{t("Add Registrant","إضافة مسجل")}</h3>
        {["name","email","phone","organization"].map(k => (
          <Field key={k} label={t(k.charAt(0).toUpperCase()+k.slice(1), k)} required={k === "name" || k === "email"}>
            <Input type={k === "email" ? "email" : "text"} value={(form as Record<string, string>)[k]} onChange={set(k)} />
          </Field>
        ))}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>{t("Cancel","إلغاء")}</Button>
          <Button onClick={() => mutation.mutate()} disabled={!form.name || !form.email || mutation.isPending}>
            {t("Add","إضافة")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BulkMessageModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ subject: "", htmlBody: "", targetStatus: "ALL" });
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<{ sent: number; failed: number }>>(`/admin/events/${eventId}/notify`, form);
      return res.data.data;
    },
    onSuccess: (data) => setResult(data),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg">{t("Message Registrants","رسالة للمسجلين")}</h3>
        {result ? (
          <div className="text-center py-4 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-semibold">{t("Message Sent!","تم الإرسال!")}</p>
            <p className="text-sm text-muted-foreground">{t(`Sent: ${result.sent} | Failed: ${result.failed}`, `أُرسل: ${result.sent} | فشل: ${result.failed}`)}</p>
            <Button onClick={onClose}>{t("Close","إغلاق")}</Button>
          </div>
        ) : (
          <>
            <Field label={t("Send to","إرسال إلى")}>
              <select value={form.targetStatus} onChange={set("targetStatus")} className={FIELD_CLS}>
                {[["ALL",t("All Registrants","جميع المسجلين")],["CONFIRMED",t("Confirmed Only","المؤكدون فقط")],["WAITLISTED",t("Waitlisted Only","قائمة الانتظار فقط")]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label={t("Subject","الموضوع")} required>
              <Input value={form.subject} onChange={set("subject")} />
            </Field>
            <Field label={t("Message Body","نص الرسالة")} required>
              <textarea value={form.htmlBody} onChange={set("htmlBody")} rows={5}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </Field>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={onClose}>{t("Cancel","إلغاء")}</Button>
              <Button onClick={() => mutation.mutate()} disabled={!form.subject || !form.htmlBody || mutation.isPending}>
                <Send className="w-3.5 h-3.5 me-1.5" />{t("Send","إرسال")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReminderRuleModal({ eventId, rule, onClose }: { eventId: string; rule: EventReminderRule | null; onClose: () => void }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    ruleType:        rule?.ruleType || "BEFORE_EVENT",
    offsetHours:     rule?.offsetHours?.toString() || "24",
    subjectTemplate: rule?.subjectTemplate || "Reminder: {{eventTitle}}",
    bodyTemplate:    rule?.bodyTemplate || "Dear {{name}},\n\nThis is a reminder for {{eventTitle}} on {{eventDate}} at {{location}}.\n\nLink: {{link}}",
    sendEmail:       rule?.sendEmail ?? true,
    sendInApp:       rule?.sendInApp ?? true,
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(p => ({ ...p, [k]: value }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, offsetHours: Number(form.offsetHours) };
      if (rule) { await api.put(`/admin/events/${eventId}/reminders/${rule.id}`, payload); }
      else { await api.post(`/admin/events/${eventId}/reminders`, payload); }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["event-reminders", eventId] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg">{rule ? t("Edit Reminder","تعديل التذكير") : t("New Reminder Rule","قاعدة تذكير جديدة")}</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("Trigger Type","نوع المشغّل")}>
            <select value={form.ruleType} onChange={set("ruleType")} className={FIELD_CLS}>
              <option value="BEFORE_EVENT">{t("Before Event","قبل الفعالية")}</option>
              <option value="AFTER_EVENT">{t("After Event","بعد الفعالية")}</option>
            </select>
          </Field>
          <Field label={t("Hours Offset","الإزاحة بالساعات")}>
            <Input type="number" min="1" value={form.offsetHours} onChange={set("offsetHours")} />
          </Field>
        </div>
        <Field label={t("Email Subject","موضوع البريد")} hint="{{eventTitle}} {{name}} {{eventDate}} {{location}} {{link}}">
          <Input value={form.subjectTemplate} onChange={set("subjectTemplate")} />
        </Field>
        <Field label={t("Message Body","نص الرسالة")}>
          <textarea value={form.bodyTemplate} onChange={set("bodyTemplate")} rows={5}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
        </Field>
        <div className="flex gap-6">
          {([["sendEmail",t("Send Email","بريد إلكتروني")],["sendInApp",t("In-app Notification","إشعار داخلي")]] as [keyof typeof form, string][]).map(([k,l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form[k] as boolean} onChange={set(k)} className="rounded" />
              {l}
            </label>
          ))}
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>{t("Cancel","إلغاء")}</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            <Save className="w-3.5 h-3.5 me-1.5" />{t("Save Rule","حفظ القاعدة")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const initialTab = searchParams.get("tab") || "details";
  const [activeTab, setActiveTab] = useState(initialTab);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["admin-event", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Event>>(`/admin/events/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.put<ApiResponse<Event>>(`/admin/events/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events-stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => { await api.delete(`/admin/events/${id}`); },
    onSuccess: () => router.push("/admin/events"),
  });

  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<Event>>(`/admin/events/${id}/duplicate`);
      return res.data.data;
    },
    onSuccess: (newEvent) => router.push(`/admin/events/${newEvent.id}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-16 bg-muted/50 rounded-xl animate-pulse" />
        <div className="h-10 bg-muted/50 rounded-lg animate-pulse w-64" />
        <div className="h-96 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{t("Event not found or could not be loaded.", "الفعالية غير موجودة أو تعذّر تحميلها.")}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>{t("Go Back","العودة")}</Button>
        </CardContent>
      </Card>
    );
  }

  const STATUS_DOT: Record<string, string> = {
    PUBLISHED: "bg-emerald-500", DRAFT: "bg-yellow-500", ARCHIVED: "bg-gray-400", CANCELLED: "bg-red-500",
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={event.titleEn || event.titleAr || ""}
        description={
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[event.status || "DRAFT"] || "bg-gray-400"}`} />
            <span className="text-sm text-muted-foreground">{event.status || "DRAFT"}</span>
            {event.eventDate && (
              <><span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(event.eventDate).toLocaleDateString()}</span></>
            )}
            {(event.registrationCount ?? 0) > 0 && (
              <><span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1"><Users className="w-3.5 h-3.5" />{event.registrationCount} {t("registrants","مسجل")}</span></>
            )}
            {event.isFeatured && <span className="text-amber-500 text-xs">⭐ {t("Featured","مميز")}</span>}
          </div> as unknown as string
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: t("Events","الفعاليات"), href: "/admin/events" },
          { label: event.titleEn || event.titleAr || id },
        ]}
        actions={
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => duplicateMutation.mutate()} disabled={duplicateMutation.isPending} title={t("Duplicate","نسخ")}>
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
              onClick={() => { if (confirm(t("Delete this event?","حذف هذه الفعالية؟"))) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending} title={t("Delete","حذف")}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <a href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="w-3.5 h-3.5" />{t("View","عرض")}
              </a>
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none h-auto pb-0 bg-transparent gap-1">
          {[
            { value: "details",      label: t("Details","التفاصيل"),           icon: Edit },
            { value: "registrations",label: t("Registrations","التسجيلات"),    icon: Users },
            { value: "notifications",label: t("Notifications","الإشعارات"),    icon: Bell },
            { value: "analytics",    label: t("Analytics","التحليلات"),        icon: BarChart2 },
            { value: "public",       label: t("Public Controls","الصفحة العامة"),icon: Globe },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}
              className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5 px-3 text-sm font-medium">
              <Icon className="w-3.5 h-3.5" />{label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="pt-5">
          <TabsContent value="details" className="mt-0">
            <DetailsTab event={event} onSave={(p) => updateMutation.mutate(p)} isSaving={updateMutation.isPending} />
          </TabsContent>
          <TabsContent value="registrations" className="mt-0">
            <RegistrationsTab eventId={id} event={event} />
          </TabsContent>
          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab eventId={id} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0">
            <AnalyticsTab event={event} />
          </TabsContent>
          <TabsContent value="public" className="mt-0">
            <PublicControlsTab event={event} onSave={(p) => updateMutation.mutate(p)} isSaving={updateMutation.isPending} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
