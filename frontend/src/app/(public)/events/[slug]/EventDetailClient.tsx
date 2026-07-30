"use client";

import { useState } from "react";
import Link from "next/link";
import type { Event, EventRegistrationRequest } from "@/types";
import { registerForEvent } from "@/lib/event-registration";
import { useLanguage } from "@/lib/language-context";
import { almarai } from "@/lib/fonts";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  Users,
  Wifi,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CalendarDays,
  Hourglass,
} from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Conference: { bg: "#fef3c7", text: "#92400e",  border: "#f59e0b" },
  Workshop:   { bg: "#d1fae5", text: "#065f46",  border: "#10b981" },
  Seminar:    { bg: "#dbeafe", text: "#1e40af",  border: "#3b82f6" },
  Training:   { bg: "#ede9fe", text: "#5b21b6",  border: "#8b5cf6" },
};
const TYPE_AR: Record<string, string> = {
  Conference: "مؤتمر",
  Workshop:   "ورشة عمل",
  Seminar:    "ندوة",
  Training:   "تدريب",
};

function fmtDate(iso: string, locale: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString(locale, opts);
}

// ── component ──────────────────────────────────────────────────────────────

interface Props { initialEvent: Event | null }

export default function EventDetailClient({ initialEvent }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const locale = isAr ? "ar-SA" : "en-US";

  const [regOpen, setRegOpen]   = useState(false);
  const [regForm, setRegForm]   = useState<EventRegistrationRequest>({});
  const [regState, setRegState] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!initialEvent) {
    return (
      <div className="container mx-auto px-4 py-24 text-center" dir={isAr ? "rtl" : "ltr"}>
        <CalendarDays className="h-16 w-16 mx-auto mb-4 opacity-25" style={{ color: "var(--style-color-muted, #999)" }} />
        <p className="text-lg mb-6" style={{ color: "var(--style-color-muted, #888)" }}>
          {isAr ? "الفعالية غير موجودة." : "Event not found."}
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ background: "var(--style-color-primary, #7a5c3c)", color: "#fff" }}
        >
          {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {isAr ? "العودة إلى الفعاليات" : "Back to Events"}
        </Link>
      </div>
    );
  }

  const ev = initialEvent;
  const tc = ev.eventType ? (TYPE_COLORS[ev.eventType] ?? null) : null;
  const typeLabel = ev.eventType
    ? (isAr ? (TYPE_AR[ev.eventType] ?? ev.eventType) : ev.eventType)
    : null;

  const title = isAr ? (ev.titleAr || ev.titleEn || "") : (ev.titleEn || ev.titleAr || "");

  const startDate = ev.eventDate ? new Date(ev.eventDate) : null;
  const endDate   = ev.endDate   ? new Date(ev.endDate)   : null;
  const regDeadline = ev.registrationDeadline ? new Date(ev.registrationDeadline) : null;
  const isPast = startDate ? startDate < new Date() : false;

  const dateRange = startDate
    ? endDate
      ? `${fmtDate(ev.eventDate, locale, { month: "long", day: "numeric", year: "numeric" })} — ${fmtDate(ev.endDate!, locale, { month: "long", day: "numeric", year: "numeric" })}`
      : fmtDate(ev.eventDate, locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "";

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegState("loading");
    try {
      const res = await registerForEvent(ev.slug, regForm);
      if (res.data?.success) {
        setRegState("success");
      } else {
        setRegState("error");
      }
    } catch {
      setRegState("error");
    }
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"}>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: "360px" }}>
        {/* Layered background */}
        <div
          className="absolute inset-0"
          style={{
            background: ev.featuredImage
              ? `linear-gradient(135deg, rgba(42,28,20,0.92) 0%, rgba(90,55,35,0.88) 60%, rgba(42,28,20,0.75) 100%)`
              : `linear-gradient(135deg, var(--style-color-primary, #7a5c3c) 0%, color-mix(in srgb, var(--style-color-primary, #7a5c3c) 70%, #000) 100%)`,
          }}
        />
        {ev.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ev.featuredImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
        )}

        {/* Noise texture */}
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

        {/* Decorative SVG wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16 md:h-20">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--style-color-bg, #ffffff)" />
          </svg>
        </div>

        {/* Floating particle dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${4 + (i % 5) * 3}px`,
                height: `${4 + (i % 5) * 3}px`,
                background: "#fff",
                top: `${10 + (i * 37) % 75}%`,
                left: `${5 + (i * 53) % 90}%`,
                animation: `float-${i % 3} ${4 + i % 4}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative container mx-auto px-4 pt-10 pb-24 md:pb-28">
          {/* Back link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-opacity opacity-80 hover:opacity-100"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isAr ? "العودة إلى الفعاليات" : "Back to Events"}
          </Link>

          {/* Date chip */}
          {startDate && (
            <p
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <Calendar className="h-4 w-4" />
              {fmtDate(ev.eventDate, locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}

          {/* Title */}
          <h1
            className={`${almarai.className} text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl text-white mb-5`}
          >
            {title}
          </h1>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-3">
            {typeLabel && (
              <span
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm"
                style={tc
                  ? { background: tc.bg, color: tc.text }
                  : { background: "rgba(255,255,255,0.2)", color: "#fff" }
                }
              >
                {typeLabel}
              </span>
            )}
            {ev.isOnline && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}>
                <Wifi className="h-3.5 w-3.5" />
                {isAr ? "عبر الإنترنت" : "Online"}
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
                {isAr ? "منتهية" : "Past Event"}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BODY
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: "var(--style-color-bg, #fff)" }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Main content (2 cols) ───────────────────────────── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Description */}
              {ev.description && (
                <div>
                  <h2
                    className={`${almarai.className} text-xl font-bold mb-4`}
                    style={{ color: "var(--style-color-heading, #1a1a1a)" }}
                  >
                    {isAr ? "عن الفعالية" : "About This Event"}
                  </h2>
                  <div
                    className="rounded-2xl p-6 leading-relaxed text-base whitespace-pre-line"
                    style={{
                      background: "var(--style-color-surface, #f9fafb)",
                      color: "var(--style-color-text, #444)",
                      border: "1px solid var(--style-color-border, #e5e7eb)",
                    }}
                  >
                    {ev.description}
                  </div>
                </div>
              )}

              {/* Online event banner */}
              {ev.isOnline && ev.onlineUrl && (
                <div
                  className="rounded-2xl p-5 flex items-start gap-4"
                  style={{ background: "#dbeafe", border: "1px solid #93c5fd" }}
                >
                  <Wifi className="h-6 w-6 mt-0.5 shrink-0" style={{ color: "#1e40af" }} />
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: "#1e40af" }}>
                      {isAr ? "فعالية عبر الإنترنت" : "Online Event"}
                    </p>
                    <a
                      href={ev.onlineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium underline"
                      style={{ color: "#1e40af" }}
                    >
                      {isAr ? "انضم إلى الفعالية" : "Join the Event"}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Registration CTA */}
              {!isPast && (
                <div>
                  {regState === "success" ? (
                    <div
                      className="rounded-2xl p-6 flex items-start gap-4"
                      style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}
                    >
                      <CheckCircle2 className="h-6 w-6 mt-0.5 shrink-0" style={{ color: "#065f46" }} />
                      <div>
                        <p className="font-bold mb-1" style={{ color: "#065f46" }}>
                          {isAr ? "تم التسجيل بنجاح!" : "Registration Successful!"}
                        </p>
                        <p className="text-sm" style={{ color: "#065f46" }}>
                          {isAr ? "سنرسل إليك تأكيداً على بريدك الإلكتروني." : "We'll send a confirmation to your email shortly."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {!regOpen ? (
                        <button
                          onClick={() => setRegOpen(true)}
                          className="w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]"
                          style={{ background: "var(--style-color-primary, #7a5c3c)", color: "#fff" }}
                        >
                          {isAr ? "سجّل للمشاركة" : "Register for This Event"}
                        </button>
                      ) : (
                        <RegistrationForm
                          form={regForm}
                          onChange={setRegForm}
                          onSubmit={handleRegister}
                          onCancel={() => { setRegOpen(false); setRegState("idle"); }}
                          loading={regState === "loading"}
                          error={regState === "error"}
                          isAr={isAr}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Sidebar ────────────────────────────────────────── */}
            <aside className="space-y-5">

              {/* Event details card */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid var(--style-color-border, #e5e7eb)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                {/* Card header */}
                <div
                  className="px-5 py-4"
                  style={{ background: "var(--style-color-primary, #7a5c3c)" }}
                >
                  <h3 className={`${almarai.className} font-bold text-base text-white`}>
                    {isAr ? "تفاصيل الفعالية" : "Event Details"}
                  </h3>
                </div>

                <div className="divide-y divide-gray-100" style={{ background: "var(--style-color-card-bg, #fff)" }}>

                  {/* Date */}
                  {startDate && (
                    <DetailRow icon={<CalendarDays className="h-4 w-4" />} isAr={isAr}>
                      <p className="font-semibold text-xs mb-0.5" style={{ color: "var(--style-color-heading, #1a1a1a)" }}>
                        {isAr ? "التاريخ" : "Date"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--style-color-muted, #666)" }}>
                        {dateRange}
                      </p>
                    </DetailRow>
                  )}

                  {/* Location */}
                  {ev.location && (
                    <DetailRow icon={<MapPin className="h-4 w-4" />} isAr={isAr}>
                      <p className="font-semibold text-xs mb-0.5" style={{ color: "var(--style-color-heading, #1a1a1a)" }}>
                        {isAr ? "المكان" : "Location"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--style-color-muted, #666)" }}>{ev.location}</p>
                      {ev.address && <p className="text-xs mt-0.5" style={{ color: "var(--style-color-muted, #888)" }}>{ev.address}</p>}
                      {ev.locationUrl && (
                        <a
                          href={ev.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-xs font-medium underline"
                          style={{ color: "var(--style-color-primary, #7a5c3c)" }}
                        >
                          {isAr ? "عرض الخريطة" : "View on map"}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </DetailRow>
                  )}

                  {/* Organizer */}
                  {ev.organizer && (
                    <DetailRow icon={<Building2 className="h-4 w-4" />} isAr={isAr}>
                      <p className="font-semibold text-xs mb-0.5" style={{ color: "var(--style-color-heading, #1a1a1a)" }}>
                        {isAr ? "المنظِّم" : "Organizer"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--style-color-muted, #666)" }}>{ev.organizer}</p>
                    </DetailRow>
                  )}

                  {/* Max participants */}
                  {ev.maxParticipants && (
                    <DetailRow icon={<Users className="h-4 w-4" />} isAr={isAr}>
                      <p className="font-semibold text-xs mb-0.5" style={{ color: "var(--style-color-heading, #1a1a1a)" }}>
                        {isAr ? "الحد الأقصى للمشاركين" : "Max Participants"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--style-color-muted, #666)" }}>{ev.maxParticipants}</p>
                    </DetailRow>
                  )}

                  {/* Registration deadline */}
                  {regDeadline && (
                    <DetailRow icon={<Hourglass className="h-4 w-4" />} isAr={isAr}>
                      <p className="font-semibold text-xs mb-0.5" style={{ color: "var(--style-color-heading, #1a1a1a)" }}>
                        {isAr ? "آخر موعد للتسجيل" : "Registration Deadline"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--style-color-muted, #666)" }}>
                        {fmtDate(ev.registrationDeadline!, locale, { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </DetailRow>
                  )}

                  {/* Contact email */}
                  {ev.contactEmail && (
                    <DetailRow icon={<Mail className="h-4 w-4" />} isAr={isAr}>
                      <p className="font-semibold text-xs mb-0.5" style={{ color: "var(--style-color-heading, #1a1a1a)" }}>
                        {isAr ? "البريد الإلكتروني للتواصل" : "Contact Email"}
                      </p>
                      <a
                        href={`mailto:${ev.contactEmail}`}
                        className="text-xs underline"
                        style={{ color: "var(--style-color-primary, #7a5c3c)" }}
                      >
                        {ev.contactEmail}
                      </a>
                    </DetailRow>
                  )}
                </div>
              </div>

              {/* Mini calendar block */}
              {startDate && (
                <div
                  className="rounded-2xl p-5 text-center"
                  style={{
                    background: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 6%, var(--style-color-surface, #f9fafb))",
                    border: "1px solid color-mix(in srgb, var(--style-color-primary, #7a5c3c) 15%, transparent)",
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 60%, transparent)" }}
                  >
                    {startDate.toLocaleDateString(locale, { month: "long", year: "numeric" })}
                  </p>
                  <p
                    className="text-5xl font-black leading-none"
                    style={{ color: "var(--style-color-primary, #7a5c3c)" }}
                  >
                    {startDate.toLocaleDateString(locale, { day: "numeric" })}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 60%, transparent)" }}
                  >
                    {startDate.toLocaleDateString(locale, { weekday: "long" })}
                  </p>
                </div>
              )}

              {/* Back to events pill */}
              <Link
                href="/events"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                style={{
                  border: "1px solid color-mix(in srgb, var(--style-color-primary, #7a5c3c) 22%, transparent)",
                  color: "var(--style-color-primary, #7a5c3c)",
                  background: "color-mix(in srgb, var(--style-color-primary, #7a5c3c) 6%, transparent)",
                }}
              >
                {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                {isAr ? "كل الفعاليات" : "All Events"}
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Sidebar detail row ──────────────────────────────────────────────────────

function DetailRow({ icon, children, isAr }: { icon: React.ReactNode; children: React.ReactNode; isAr: boolean }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <span
        className="mt-0.5 shrink-0"
        style={{ color: "var(--style-color-primary, #7a5c3c)" }}
      >
        {icon}
      </span>
      <div className={isAr ? "text-right w-full" : "w-full"}>
        {children}
      </div>
    </div>
  );
}

// ── Registration form ───────────────────────────────────────────────────────

interface RegFormProps {
  form: EventRegistrationRequest;
  onChange: (v: EventRegistrationRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: boolean;
  isAr: boolean;
}

function RegistrationForm({ form, onChange, onSubmit, onCancel, loading, error, isAr }: RegFormProps) {
  const field = (key: keyof EventRegistrationRequest) => (val: string) =>
    onChange({ ...form, [key]: val });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: "var(--style-color-surface, #f9fafb)",
        border: "1px solid var(--style-color-border, #e5e7eb)",
      }}
    >
      <h3
        className={`${almarai.className} font-bold text-lg mb-2`}
        style={{ color: "var(--style-color-heading, #1a1a1a)" }}
      >
        {isAr ? "التسجيل في الفعالية" : "Register for Event"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField icon={<User className="h-4 w-4" />} label={isAr ? "الاسم الكامل" : "Full Name"} required isAr={isAr}>
          <input
            type="text"
            required
            value={form.name ?? ""}
            onChange={(e) => field("name")(e.target.value)}
            placeholder={isAr ? "أدخل اسمك" : "Enter your name"}
            className="w-full text-sm px-3 py-2.5 rounded-xl outline-none transition-all"
            style={{
              background: "var(--style-color-card-bg, #fff)",
              border: "1.5px solid var(--style-color-border, #e5e7eb)",
              color: "var(--style-color-text, #333)",
            }}
          />
        </FormField>

        <FormField icon={<Mail className="h-4 w-4" />} label={isAr ? "البريد الإلكتروني" : "Email"} required isAr={isAr}>
          <input
            type="email"
            required
            value={form.email ?? ""}
            onChange={(e) => field("email")(e.target.value)}
            placeholder={isAr ? "example@email.com" : "example@email.com"}
            className="w-full text-sm px-3 py-2.5 rounded-xl outline-none transition-all"
            style={{
              background: "var(--style-color-card-bg, #fff)",
              border: "1.5px solid var(--style-color-border, #e5e7eb)",
              color: "var(--style-color-text, #333)",
            }}
          />
        </FormField>

        <FormField icon={<Phone className="h-4 w-4" />} label={isAr ? "رقم الهاتف" : "Phone"} isAr={isAr}>
          <input
            type="tel"
            value={form.phone ?? ""}
            onChange={(e) => field("phone")(e.target.value)}
            placeholder={isAr ? "+963 xxx xxx xxx" : "+1 234 567 8900"}
            className="w-full text-sm px-3 py-2.5 rounded-xl outline-none transition-all"
            style={{
              background: "var(--style-color-card-bg, #fff)",
              border: "1.5px solid var(--style-color-border, #e5e7eb)",
              color: "var(--style-color-text, #333)",
            }}
          />
        </FormField>

        <FormField icon={<Building2 className="h-4 w-4" />} label={isAr ? "المؤسسة / الجامعة" : "Organization"} isAr={isAr}>
          <input
            type="text"
            value={form.organization ?? ""}
            onChange={(e) => field("organization")(e.target.value)}
            placeholder={isAr ? "اسم مؤسستك" : "Your organization"}
            className="w-full text-sm px-3 py-2.5 rounded-xl outline-none transition-all"
            style={{
              background: "var(--style-color-card-bg, #fff)",
              border: "1.5px solid var(--style-color-border, #e5e7eb)",
              color: "var(--style-color-text, #333)",
            }}
          />
        </FormField>
      </div>

      <FormField icon={<Globe className="h-4 w-4" />} label={isAr ? "ملاحظات إضافية" : "Notes"} isAr={isAr}>
        <textarea
          rows={3}
          value={form.notes ?? ""}
          onChange={(e) => field("notes")(e.target.value)}
          placeholder={isAr ? "أي معلومات إضافية..." : "Any additional information..."}
          className="w-full text-sm px-3 py-2.5 rounded-xl outline-none transition-all resize-none"
          style={{
            background: "var(--style-color-card-bg, #fff)",
            border: "1.5px solid var(--style-color-border, #e5e7eb)",
            color: "var(--style-color-text, #333)",
          }}
        />
      </FormField>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "#fee2e2", color: "#991b1b" }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-xs font-medium">
            {isAr ? "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى." : "Registration failed. Please try again."}
          </p>
        </div>
      )}

      <div className={`flex gap-3 pt-1 ${isAr ? "flex-row-reverse" : ""}`}>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "var(--style-color-primary, #7a5c3c)", color: "#fff" }}
        >
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {loading
            ? (isAr ? "جارٍ التسجيل..." : "Registering...")
            : (isAr ? "تأكيد التسجيل" : "Confirm Registration")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80"
          style={{
            background: "var(--style-color-card-bg, #fff)",
            color: "var(--style-color-muted, #888)",
            border: "1.5px solid var(--style-color-border, #e5e7eb)",
          }}
        >
          {isAr ? "إلغاء" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

function FormField({
  icon, label, required, isAr, children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  isAr: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${isAr ? "flex-row-reverse" : ""}`} style={{ color: "var(--style-color-text, #555)" }}>
        <span style={{ color: "var(--style-color-primary, #7a5c3c)" }}>{icon}</span>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
