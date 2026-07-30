"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Event, ApiResponse } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";
import {
  Save, Globe, MapPin, Wifi, Calendar, Users,
  ArrowLeft, Info, Tag, Image as ImageIcon, RefreshCw,
  FileText, Clock, Mail, Building, Star, AlertCircle,
} from "lucide-react";

// ── Slug helper ────────────────────────────────────────────────────────────────

const AR_MAP: Record<string, string> = {
  ا:"a",أ:"a",إ:"i",آ:"aa",ب:"b",ت:"t",ث:"th",ج:"j",ح:"h",خ:"kh",
  د:"d",ذ:"dh",ر:"r",ز:"z",س:"s",ش:"sh",ص:"s",ض:"d",ط:"t",ظ:"z",
  ع:"a",غ:"gh",ف:"f",ق:"q",ك:"k",ل:"l",م:"m",ن:"n",ه:"h",و:"w",
  ي:"y",ى:"a",ة:"a",ء:"",ئ:"y",ؤ:"w",
};
function toSlug(text: string): string {
  let s = text;
  for (const [ar, en] of Object.entries(AR_MAP)) s = s.split(ar).join(en);
  return s.toLowerCase().replace(/[\s_]+/g,"-").replace(/[^a-z0-9-]/g,"").replace(/-+/g,"-").replace(/^-|-$/g,"");
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1.5">
        {label}{required && <span className="text-destructive ms-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, label, color = "text-primary", bgColor = "bg-primary/10" }: {
  icon: React.ElementType; label: string; color?: string; bgColor?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className={`w-8 h-8 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="font-semibold text-sm text-foreground">{label}</span>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, colorOn = "bg-teal-500" }: {
  checked: boolean; onChange: () => void; colorOn?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      type="button"
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${checked ? colorOn : "bg-muted-foreground/20"}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

// ── FIELD_CLS ─────────────────────────────────────────────────────────────────

const FIELD_CLS = "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

// ── Event type options ────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { value:"CONFERENCE", labelEn:"Conference",   labelAr:"مؤتمر",           color:"text-blue-700",   dot:"bg-blue-500",   ring:"ring-blue-200 border-blue-300 bg-blue-50"   },
  { value:"WORKSHOP",   labelEn:"Workshop",     labelAr:"ورشة عمل",         color:"text-purple-700", dot:"bg-purple-500", ring:"ring-purple-200 border-purple-300 bg-purple-50" },
  { value:"WEBINAR",    labelEn:"Webinar",       labelAr:"ندوة إلكترونية",  color:"text-teal-700",   dot:"bg-teal-500",   ring:"ring-teal-200 border-teal-300 bg-teal-50"   },
  { value:"MEETING",    labelEn:"Meeting",       labelAr:"اجتماع",           color:"text-orange-700", dot:"bg-orange-500", ring:"ring-orange-200 border-orange-300 bg-orange-50" },
  { value:"SEMINAR",    labelEn:"Seminar",       labelAr:"ندوة",             color:"text-pink-700",   dot:"bg-pink-500",   ring:"ring-pink-200 border-pink-300 bg-pink-50"   },
  { value:"OTHER",      labelEn:"Other",         labelAr:"أخرى",             color:"text-gray-600",   dot:"bg-gray-400",   ring:"ring-gray-200 border-gray-300 bg-gray-50"   },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NewEventPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    titleAr: "",
    titleEn: "",
    slug: "",
    description: "",
    eventDate: "",
    endDate: "",
    location: "",
    locationUrl: "",
    address: "",
    latitude: "",
    longitude: "",
    isOnline: false,
    onlineUrl: "",
    eventType: "CONFERENCE",
    organizer: "",
    featuredImage: "",
    maxParticipants: "",
    registrationDeadline: "",
    contactEmail: "",
    status: "DRAFT",
    isFeatured: false,
    displayOrder: "0",
  });

  const [langTab, setLangTab] = useState<"en"|"ar">("en");
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = useCallback((key: string) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
      const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm(prev => {
        const next = { ...prev, [key]: value };
        if (key === "titleEn" && !slugTouched) next.slug = toSlug(value as string);
        return next;
      });
      if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }, [slugTouched, errors]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.titleAr && !form.titleEn) e.title = t("At least one title is required","يجب إدخال عنوان واحد على الأقل");
    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) e.slug = t("Slug can only contain lowercase letters, numbers and hyphens","الرابط يحتوي على حروف صغيرة وأرقام وشرطات فقط");
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = t("Invalid email address","عنوان بريد غير صحيح");
    return e;
  };

  const createMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const payload = {
        ...form,
        eventDate:            form.eventDate || null,
        endDate:              form.endDate || null,
        registrationDeadline: form.registrationDeadline || null,
        maxParticipants:      form.maxParticipants ? Number(form.maxParticipants) : null,
        latitude:             form.latitude ? Number(form.latitude) : null,
        longitude:            form.longitude ? Number(form.longitude) : null,
        displayOrder:         Number(form.displayOrder) || 0,
        isPublished:          publish,
        status:               publish ? "PUBLISHED" : "DRAFT",
      };
      const res = await api.post<ApiResponse<Event>>("/admin/events", payload);
      return res.data.data;
    },
    onSuccess: ev => router.push(`/admin/events/${ev.id}`),
  });

  const handleSave = (publish: boolean) => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    createMutation.mutate(publish);
  };

  const canSave    = !!(form.titleAr || form.titleEn);
  const canPublish = canSave && !!form.eventDate;
  const selectedType = EVENT_TYPES.find(tp => tp.value === form.eventType);

  // Event duration display
  const eventDuration = form.eventDate && form.endDate
    ? (() => {
        const ms = new Date(form.endDate).getTime() - new Date(form.eventDate).getTime();
        const hrs = ms / 3600000;
        return hrs >= 24 ? `${(hrs/24).toFixed(0)} ${t("days","أيام")}` : `${hrs.toFixed(1)} ${t("hours","ساعات")}`;
      })()
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <AdminPageHeader
        title={t("New Event","فعالية جديدة")}
        description={t(
          "Create a new event with full details, scheduling and registration settings",
          "إنشاء فعالية جديدة مع كامل التفاصيل والجدول وإعدادات التسجيل"
        )}
        breadcrumbs={[
          { label:"Home", href:"/" },
          { label:"Admin", href:"/admin" },
          { label:t("Events","الفعاليات"), href:"/admin/events" },
          { label:t("New","جديد") },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground h-9">
              <ArrowLeft className="w-3.5 h-3.5 me-1.5" />{t("Back","رجوع")}
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5"
              onClick={() => handleSave(false)}
              disabled={!canSave || createMutation.isPending}>
              {createMutation.isPending
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <Save className="w-3.5 h-3.5" />}
              {t("Save Draft","حفظ مسودة")}
            </Button>
            <Button size="sm" className="h-9 gap-1.5"
              onClick={() => handleSave(true)}
              disabled={!canPublish || createMutation.isPending}>
              <Globe className="w-3.5 h-3.5" />{t("Publish","نشر")}
            </Button>
          </div>
        }
      />

      {/* Error banner */}
      {(createMutation.isError || Object.keys(errors).length > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-destructive/30 bg-destructive/5">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-destructive text-sm font-semibold">
              {createMutation.isError
                ? t("Failed to create event","فشل إنشاء الفعالية")
                : t("Please fix the errors below","يرجى إصلاح الأخطاء أدناه")}
            </p>
            <p className="text-destructive/80 text-xs mt-0.5">
              {t("Check required fields and try again.","تحقق من الحقول المطلوبة وأعد المحاولة.")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══════ LEFT COLUMN ══════ */}
        <div className="lg:col-span-2 space-y-5">

          {/* ─ Bilingual Titles ─ */}
          <Card>
            <CardContent className="pt-6 pb-5">
              <SectionLabel icon={FileText} label={t("Event Title","عنوان الفعالية")} />
              {/* Language toggle */}
              <div className="flex rounded-lg border overflow-hidden w-fit mb-5 text-xs font-semibold">
                {(["en","ar"] as const).map(l => (
                  <button key={l} onClick={() => setLangTab(l)}
                    className={`px-4 py-1.5 transition-colors ${langTab === l ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
                    {l === "en" ? "🇬🇧 English" : "🇸🇦 Arabic"}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {langTab === "en" ? (
                  <Field label={t("English Title","العنوان الإنجليزي")} required
                    error={errors.title && !form.titleAr && !form.titleEn ? errors.title : undefined}>
                    <Input value={form.titleEn} onChange={set("titleEn")}
                      placeholder="Annual Soil Science Conference 2025"
                      className="text-base font-medium h-11 rounded-xl" />
                  </Field>
                ) : (
                  <Field label={t("Arabic Title","العنوان العربي")} required
                    error={errors.title && !form.titleAr && !form.titleEn ? errors.title : undefined}>
                    <Input value={form.titleAr} onChange={set("titleAr")}
                      placeholder="مؤتمر علوم التربة السنوي ٢٠٢٥"
                      dir="rtl" className="text-base font-medium h-11 rounded-xl" />
                  </Field>
                )}
                <Field label={t("URL Slug","الرابط المختصر")}
                  hint={t("Auto-generated from English title. Used in the public URL: /events/{slug}","يُولَّد تلقائيًا من العنوان الإنجليزي. يستخدم في الرابط العام: /events/{slug}")}
                  error={errors.slug}>
                  <div className="relative">
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono select-none pointer-events-none">/events/</span>
                    <Input
                      value={form.slug}
                      onChange={e => { setSlugTouched(true); set("slug")(e); }}
                      placeholder="annual-soil-science-conference-2025"
                      className={`font-mono text-xs ps-[72px] rounded-xl ${errors.slug ? "border-destructive" : ""}`}
                    />
                  </div>
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* ─ Description ─ */}
          <Card>
            <CardContent className="pt-6 pb-5">
              <SectionLabel icon={FileText} label={t("Description","الوصف")} />
              <textarea
                value={form.description} onChange={set("description")}
                className="flex w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm min-h-[200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder={t(
                  "Detailed event description — agenda, topics, speakers and any relevant information…",
                  "وصف مفصل للفعالية — جدول الأعمال، الموضوعات، المتحدثون وأي معلومات أخرى ذات صلة…"
                )}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground/60">
                  {t("Supports plain text","يدعم النص العادي")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {form.description.length} {t("chars","حرف")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ─ Date & Time ─ */}
          <Card>
            <CardContent className="pt-6 pb-5">
              <SectionLabel icon={Calendar} label={t("Date & Time","التاريخ والوقت")} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t("Start Date & Time","تاريخ ووقت البدء")} required
                  hint={t("Required to enable publishing","مطلوب لتفعيل النشر")}>
                  <Input type="datetime-local" value={form.eventDate} onChange={set("eventDate")} className="h-10 rounded-xl" />
                </Field>
                <Field label={t("End Date & Time","تاريخ ووقت الانتهاء")}>
                  <Input type="datetime-local" value={form.endDate} onChange={set("endDate")}
                    className="h-10 rounded-xl" min={form.eventDate || undefined} />
                </Field>
                <Field label={t("Registration Deadline","الموعد النهائي للتسجيل")}
                  hint={t("Leave blank for open registration","اتركه فارغًا للتسجيل المفتوح")}>
                  <Input type="datetime-local" value={form.registrationDeadline}
                    onChange={set("registrationDeadline")} className="h-10 rounded-xl"
                    max={form.eventDate || undefined} />
                </Field>
              </div>

              {/* Duration indicator */}
              {eventDuration && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-700 font-medium">
                    {t(`Duration: ${eventDuration}`,`المدة: ${eventDuration}`)}
                  </p>
                </div>
              )}
              {form.eventDate && !form.endDate && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    {t("Consider adding an end time for better calendar display","يُنصح بإضافة وقت الانتهاء لعرض أفضل في التقويم")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─ Location ─ */}
          <Card>
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    {form.isOnline
                      ? <Wifi className="w-4 h-4 text-teal-600" />
                      : <MapPin className="w-4 h-4 text-primary" />}
                  </div>
                  <span className="font-semibold text-sm text-foreground">{t("Location","الموقع")}</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-medium text-muted-foreground">{t("Online Event","فعالية إلكترونية")}</span>
                  <Toggle checked={form.isOnline} onChange={() => setForm(p => ({ ...p, isOnline: !p.isOnline }))} />
                </label>
              </div>

              {form.isOnline ? (
                <Field label={t("Meeting / Stream URL","رابط الاجتماع أو البث")}
                  hint={t("Zoom, Google Meet, Teams, YouTube Live, etc.","Zoom، Google Meet، Teams، YouTube Live، إلخ.")}>
                  <Input value={form.onlineUrl} onChange={set("onlineUrl")}
                    placeholder="https://zoom.us/j/… or https://meet.google.com/…"
                    className="h-10 rounded-xl" />
                </Field>
              ) : (
                <div className="space-y-3">
                  <Field label={t("Venue Name","اسم المكان")}>
                    <Input value={form.location} onChange={set("location")}
                      placeholder={t("Damascus International Fair","معرض دمشق الدولي")}
                      className="h-10 rounded-xl" />
                  </Field>
                  <Field label={t("Full Address","العنوان الكامل")}>
                    <Input value={form.address} onChange={set("address")}
                      placeholder={t("Street, City, Country","الشارع، المدينة، البلد")}
                      className="h-10 rounded-xl" />
                  </Field>
                  <Field label={t("Google Maps URL","رابط خرائط جوجل")}>
                    <Input value={form.locationUrl} onChange={set("locationUrl")}
                      placeholder="https://maps.google.com/…"
                      className="h-10 rounded-xl" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("Latitude","خط العرض")}>
                      <Input type="number" step="any" value={form.latitude} onChange={set("latitude")}
                        placeholder="33.5138" className="h-10 rounded-xl font-mono text-sm" />
                    </Field>
                    <Field label={t("Longitude","خط الطول")}>
                      <Input type="number" step="any" value={form.longitude} onChange={set("longitude")}
                        placeholder="36.2765" className="h-10 rounded-xl font-mono text-sm" />
                    </Field>
                  </div>
                  {(form.latitude || form.longitude) && (
                    <div className="mt-1">
                      <a
                        href={`https://maps.google.com/?q=${form.latitude},${form.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {t("Preview on Google Maps","معاينة على خرائط جوجل")}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ══════ RIGHT COLUMN — sidebar ══════ */}
        <div className="space-y-4">

          {/* ─ Publish card ─ */}
          <Card className="border-2 border-primary/20 bg-primary/[0.02]">
            <CardContent className="pt-5 pb-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">{t("Publish Settings","إعدادات النشر")}</span>
              </div>

              <Field label={t("Initial Status","الحالة الأولية")}>
                <select value={form.status} onChange={set("status")} className={FIELD_CLS}>
                  <option value="DRAFT">{t("Draft","مسودة")} — {t("not visible","غير مرئي")}</option>
                  <option value="PUBLISHED">{t("Published","منشور")} — {t("publicly visible","مرئي للعموم")}</option>
                </select>
              </Field>

              {!form.eventDate && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">{t("A start date is required to publish","تاريخ البدء مطلوب للنشر")}</p>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <Button className="w-full gap-1.5" size="sm"
                  onClick={() => handleSave(true)} disabled={!canPublish || createMutation.isPending}>
                  {createMutation.isPending
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : <Globe className="w-3.5 h-3.5" />}
                  {t("Publish Now","نشر الآن")}
                </Button>
                <Button className="w-full gap-1.5" variant="outline" size="sm"
                  onClick={() => handleSave(false)} disabled={!canSave || createMutation.isPending}>
                  <Save className="w-3.5 h-3.5" />{t("Save Draft","حفظ مسودة")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ─ Event Type ─ */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <SectionLabel icon={Tag} label={t("Event Type","نوع الفعالية")} />
              <div className="grid grid-cols-2 gap-2">
                {EVENT_TYPES.map(type => {
                  const isActive = form.eventType === type.value;
                  return (
                    <button key={type.value} type="button"
                      onClick={() => setForm(p => ({ ...p, eventType: type.value }))}
                      className={`relative p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? `border ring-1 ${type.ring}`
                          : "border-border hover:border-muted-foreground/30 hover:bg-muted/40"
                      }`}>
                      <span className={`block w-2 h-2 rounded-full mb-2 ${type.dot}`} />
                      <span className={`block text-xs font-semibold ${isActive ? type.color : "text-foreground"}`}>
                        {t(type.labelEn, type.labelAr)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedType && (
                <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/40 border text-xs text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${selectedType.dot}`} />
                  {t("Selected:","المختار:")}
                  <span className={`font-semibold ${selectedType.color}`}>{t(selectedType.labelEn, selectedType.labelAr)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─ Organizer & Contact ─ */}
          <Card>
            <CardContent className="pt-5 pb-5 space-y-3">
              <SectionLabel icon={Building} label={t("Organizer & Contact","المنظم والتواصل")} />
              <Field label={t("Organizer Name","اسم المنظم")}>
                <Input value={form.organizer} onChange={set("organizer")}
                  placeholder="SSSY" className="h-10 rounded-xl" />
              </Field>
              <Field label={t("Contact Email","بريد التواصل")} error={errors.contactEmail}>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <Input type="email" value={form.contactEmail} onChange={set("contactEmail")}
                    placeholder="events@ssssy.org"
                    className={`ps-9 h-10 rounded-xl ${errors.contactEmail ? "border-destructive" : ""}`} />
                </div>
              </Field>
            </CardContent>
          </Card>

          {/* ─ Registration ─ */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <SectionLabel icon={Users} label={t("Registration","التسجيل")} />
              <Field label={t("Max Participants","الحد الأقصى للمشاركين")}
                hint={t("Leave blank for unlimited","اتركه فارغًا لعدد غير محدود")}>
                <div className="relative">
                  <Users className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <Input type="number" min="1" value={form.maxParticipants}
                    onChange={set("maxParticipants")}
                    placeholder={t("Unlimited","غير محدود")}
                    className="ps-9 h-10 rounded-xl" />
                </div>
              </Field>
            </CardContent>
          </Card>

          {/* ─ Featured & Display ─ */}
          <Card>
            <CardContent className="pt-5 pb-5 space-y-3">
              <SectionLabel icon={Star} label={t("Featured & Display","المميز والعرض")}
                color="text-amber-500" bgColor="bg-amber-50" />
              <label className="flex items-center justify-between cursor-pointer select-none p-3 rounded-xl border hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{t("Featured Event","فعالية مميزة")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("Show in hero and highlight sections","عرض في أقسام الهيرو والإبراز")}</p>
                </div>
                <Toggle checked={form.isFeatured}
                  onChange={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}
                  colorOn="bg-amber-400" />
              </label>
              <Field label={t("Display Order","ترتيب العرض")}
                hint={t("Lower numbers appear first (0 = default)","الأرقام الأصغر تظهر أولاً (٠ = افتراضي)")}>
                <Input type="number" value={form.displayOrder} onChange={set("displayOrder")}
                  placeholder="0" className="h-10 rounded-xl" />
              </Field>
            </CardContent>
          </Card>

          {/* ─ Featured Image ─ */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <SectionLabel icon={ImageIcon} label={t("Featured Image","الصورة المميزة")} />
              <Input value={form.featuredImage} onChange={set("featuredImage")}
                placeholder="https://… or /uploads/image.jpg"
                className="text-xs h-9 rounded-xl font-mono" />
              {form.featuredImage ? (
                <div className="mt-3 rounded-xl overflow-hidden border aspect-video bg-muted/20 relative">
                  <img src={form.featuredImage} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setForm(p => ({ ...p, featuredImage: "" }))}
                    className="absolute top-2 end-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80 transition-colors">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed aspect-video bg-muted/10 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-7 h-7 text-muted-foreground/25 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">{t("Enter URL above to preview","أدخل رابطاً للمعاينة")}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─ Info tip ─ */}
          <div className="flex gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              {t(
                "After creating, manage registrations, set automated reminder rules and view analytics from the event detail page.",
                "بعد الإنشاء، أدِر التسجيلات وعيّن قواعد التذكير التلقائية وشاهد التحليلات من صفحة تفاصيل الفعالية."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
