"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Event, EventStats, ApiResponse, PaginatedResponse } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BulkActions } from "@/components/admin/BulkActions";
import { useLanguage } from "@/lib/language-context";
import {
  Calendar, Users, TrendingUp, Clock, Plus, RefreshCw,
  Copy, Trash2, Eye, Edit, BarChart2, Filter, ChevronDown,
  Star, MapPin, Wifi, Tag, Search, ChevronUp, ArrowUpDown,
  Bell, Globe, XCircle, CheckCircle, Award, Zap,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const EVENT_TYPES: Record<string, { label: string; labelAr: string; bg: string; text: string; border: string; bar: string; dot: string }> = {
  CONFERENCE: { label:"Conference", labelAr:"مؤتمر",           bg:"bg-blue-50",   text:"text-blue-700",   border:"border-blue-200",   bar:"bg-blue-500",   dot:"bg-blue-500"   },
  WORKSHOP:   { label:"Workshop",   labelAr:"ورشة عمل",         bg:"bg-purple-50", text:"text-purple-700", border:"border-purple-200", bar:"bg-purple-500", dot:"bg-purple-500" },
  WEBINAR:    { label:"Webinar",    labelAr:"ندوة إلكترونية",   bg:"bg-teal-50",   text:"text-teal-700",   border:"border-teal-200",   bar:"bg-teal-500",   dot:"bg-teal-500"   },
  MEETING:    { label:"Meeting",    labelAr:"اجتماع",            bg:"bg-orange-50", text:"text-orange-700", border:"border-orange-200", bar:"bg-orange-500", dot:"bg-orange-500" },
  SEMINAR:    { label:"Seminar",    labelAr:"ندوة",              bg:"bg-pink-50",   text:"text-pink-700",   border:"border-pink-200",   bar:"bg-pink-500",   dot:"bg-pink-500"   },
  OTHER:      { label:"Other",      labelAr:"أخرى",              bg:"bg-gray-50",   text:"text-gray-600",   border:"border-gray-200",   bar:"bg-gray-400",   dot:"bg-gray-400"   },
};

const STATUS_MAP: Record<string, { icon: React.ElementType; bg: string; text: string; border: string; dot: string; label: string; labelAr: string }> = {
  PUBLISHED: { icon: Globe,    bg:"bg-emerald-50", text:"text-emerald-700", border:"border-emerald-200", dot:"bg-emerald-500", label:"Published",  labelAr:"منشور"  },
  DRAFT:     { icon: Clock,    bg:"bg-amber-50",   text:"text-amber-700",   border:"border-amber-200",   dot:"bg-amber-400",   label:"Draft",      labelAr:"مسودة"  },
  ARCHIVED:  { icon: XCircle,  bg:"bg-gray-100",   text:"text-gray-500",    border:"border-gray-200",    dot:"bg-gray-400",    label:"Archived",   labelAr:"مؤرشف"  },
  CANCELLED: { icon: XCircle,  bg:"bg-red-50",     text:"text-red-600",     border:"border-red-200",     dot:"bg-red-400",     label:"Cancelled",  labelAr:"ملغي"   },
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accent: string;
}) {
  return (
    <div className="relative flex-1 min-w-[148px] rounded-2xl border bg-card overflow-hidden group hover:shadow-sm transition-shadow">
      <div className={`absolute inset-y-0 start-0 w-1 rounded-s-2xl ${accent}`} />
      <div className="ps-5 pe-4 py-4">
        <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-2.5 ${accent} bg-opacity-10`}>
          <Icon className={`w-4.5 h-4.5 ${accent.replace("bg-","text-")}`} />
        </div>
        <div className="text-2xl font-bold tracking-tight tabular-nums text-foreground">{value}</div>
        <div className="text-[11px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-wider">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground/70 mt-0.5 leading-tight">{sub}</div>}
      </div>
    </div>
  );
}

// ── Sort button ───────────────────────────────────────────────────────────────

type SortKey = "date" | "title" | "registrations" | "status";

function SortBtn({ col, active, dir, onClick }: {
  col: SortKey; active: SortKey; dir: "asc"|"desc"; onClick: (c: SortKey) => void;
}) {
  const isActive = active === col;
  const Icon = isActive ? (dir === "asc" ? ChevronUp : ChevronDown) : ArrowUpDown;
  return (
    <button onClick={() => onClick(col)}
      className={`p-0.5 rounded transition-colors ${isActive ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"}`}>
      <Icon className="w-3 h-3" />
    </button>
  );
}

// ── Event Row ─────────────────────────────────────────────────────────────────

function EventRow({ event, RowCheckbox, onDelete, onDuplicate, isDuplicating, isDeleting }: {
  event: Event;
  RowCheckbox: React.ComponentType<{ id: string }>;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isDuplicating: boolean;
  isDeleting: boolean;
}) {
  const { t } = useLanguage();
  const typeKey   = event.eventType || "OTHER";
  const type      = EVENT_TYPES[typeKey] || EVENT_TYPES.OTHER;
  const statusKey = event.status || "DRAFT";
  const status    = STATUS_MAP[statusKey] || STATUS_MAP.DRAFT;
  const StatusIcon = status.icon;

  const fillPct   = event.maxParticipants
    ? Math.min(100, ((event.registrationCount ?? 0) / event.maxParticipants) * 100)
    : null;
  const isPast    = event.eventDate && new Date(event.eventDate) < new Date();
  const isUpcoming = event.eventDate && new Date(event.eventDate) > new Date() && statusKey === "PUBLISHED";

  const daysUntil = isUpcoming
    ? Math.ceil((new Date(event.eventDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <tr className="group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0">
      {/* Checkbox */}
      <td className="py-3.5 ps-5 pe-3 w-10">
        <RowCheckbox id={event.id} />
      </td>

      {/* Type color bar + Event name */}
      <td className="py-3.5 pe-4 max-w-xs">
        <div className="flex items-start gap-3">
          {/* Color bar */}
          <div className={`mt-0.5 w-0.5 h-10 rounded-full flex-shrink-0 ${type.bar}`} />
          <div className="min-w-0 flex-1">
            <Link href={`/admin/events/${event.id}`}
              className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 leading-snug">
              {event.titleEn || event.titleAr || "—"}
            </Link>
            {event.titleAr && event.titleEn && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 font-arabic leading-tight">{event.titleAr}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {event.isOnline ? (
                <span className="flex items-center gap-0.5 text-[11px] text-teal-600 font-medium">
                  <Wifi className="w-2.5 h-2.5" />{t("Online","إلكترونية")}
                </span>
              ) : event.location ? (
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <MapPin className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[140px]">{event.location}</span>
                </span>
              ) : null}
              {event.isFeatured && (
                <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-medium">
                  <Star className="w-2.5 h-2.5 fill-current" />{t("Featured","مميز")}
                </span>
              )}
              {isPast && statusKey === "PUBLISHED" && (
                <span className="text-[11px] text-muted-foreground/50 italic">{t("Past","انتهت")}</span>
              )}
              {daysUntil !== null && daysUntil <= 7 && (
                <span className="flex items-center gap-0.5 text-[11px] text-orange-600 font-medium">
                  <Zap className="w-2.5 h-2.5" />
                  {t(`In ${daysUntil}d`,`خلال ${daysUntil} يوم`)}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Type badge */}
      <td className="py-3.5 pe-4 hidden sm:table-cell">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${type.bg} ${type.text} ${type.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${type.dot}`} />
          {t(type.label, type.labelAr)}
        </span>
      </td>

      {/* Date */}
      <td className="py-3.5 pe-4 hidden md:table-cell">
        {event.eventDate ? (
          <div>
            <div className="text-sm font-semibold tabular-nums text-foreground">
              {new Date(event.eventDate).toLocaleDateString(undefined, { day:"numeric", month:"short", year:"numeric" })}
            </div>
            <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
              {new Date(event.eventDate).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
            </div>
          </div>
        ) : <span className="text-muted-foreground/40 text-sm">—</span>}
      </td>

      {/* Registrations */}
      <td className="py-3.5 pe-4 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-bold tabular-nums text-foreground">{event.registrationCount ?? 0}</span>
          {event.maxParticipants && (
            <span className="text-muted-foreground text-[11px]">/ {event.maxParticipants}</span>
          )}
        </div>
        {fillPct !== null && (
          <div className="w-16 h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${fillPct >= 90 ? "bg-red-500" : fillPct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        )}
      </td>

      {/* Status */}
      <td className="py-3.5 pe-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.bg} ${status.text} ${status.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {t(status.label, status.labelAr)}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3.5 pe-5">
        <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary" asChild title={t("Analytics","التحليلات")}>
            <Link href={`/admin/events/${event.id}?tab=analytics`}><BarChart2 className="w-3.5 h-3.5" /></Link>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary" asChild title={t("Notifications","الإشعارات")}>
            <Link href={`/admin/events/${event.id}?tab=notifications`}><Bell className="w-3.5 h-3.5" /></Link>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
            onClick={() => onDuplicate(event.id)} title={t("Duplicate","نسخ")} disabled={isDuplicating}>
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary" asChild title={t("View public","عرض العام")}>
            <a href={`/events/${event.slug}`} target="_blank" rel="noopener"><Eye className="w-3.5 h-3.5" /></a>
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px] gap-1 ms-1 font-semibold" asChild>
            <Link href={`/admin/events/${event.id}`}><Edit className="w-3 h-3" />{t("Edit","تعديل")}</Link>
          </Button>
          <Button size="sm" variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 ms-0.5"
            onClick={() => { if (confirm(t("Delete this event?","حذف هذه الفعالية؟"))) onDelete(event.id); }}
            disabled={isDeleting} title={t("Delete","حذف")}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminEventsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter]     = useState("ALL");
  const [showFilters, setShowFilters]   = useState(false);
  const [sortKey, setSortKey]           = useState<SortKey>("date");
  const [sortDir, setSortDir]           = useState<"asc"|"desc">("desc");

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<Event>>>("/admin/events", { params: { size: 200 } });
      return res.data.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-events-stats"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<EventStats>>("/admin/events/stats");
      return res.data.data;
    },
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/admin/events/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events-stats"] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`/admin/events/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events-stats"] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<ApiResponse<Event>>(`/admin/events/${id}/duplicate`);
      return res.data.data;
    },
    onSuccess: ev => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      router.push(`/admin/events/${ev.id}`);
    },
  });

  // ── Sort & filter ──────────────────────────────────────────────────────────

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    const items: Event[] = data?.content || [];
    let res = items.filter(ev => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || (ev.titleEn   || "").toLowerCase().includes(q)
        || (ev.titleAr   || "").toLowerCase().includes(q)
        || (ev.location  || "").toLowerCase().includes(q)
        || (ev.organizer || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || ev.status === statusFilter;
      const matchType   = typeFilter   === "ALL" || ev.eventType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
    res = [...res].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date":          cmp = (a.eventDate || "").localeCompare(b.eventDate || ""); break;
        case "title":         cmp = (a.titleEn || a.titleAr || "").localeCompare(b.titleEn || b.titleAr || ""); break;
        case "registrations": cmp = (a.registrationCount ?? 0) - (b.registrationCount ?? 0); break;
        case "status":        cmp = (a.status || "").localeCompare(b.status || ""); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return res;
  }, [data, search, statusFilter, typeFilter, sortKey, sortDir]);

  const hasActiveFilters = statusFilter !== "ALL" || typeFilter !== "ALL" || !!search;
  const activeFilterCount = [statusFilter !== "ALL", typeFilter !== "ALL"].filter(Boolean).length;

  // ── Derived quick stats ───────────────────────────────────────────────────

  const upcomingCount = useMemo(() =>
    (data?.content || []).filter(e => e.eventDate && new Date(e.eventDate) > new Date() && e.status === "PUBLISHED").length,
    [data]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <AdminPageHeader
        title={t("Events", "الفعاليات")}
        description={t(
          "Manage events, registrations, reminder rules and analytics",
          "إدارة الفعاليات والتسجيلات وقواعد التذكير والتحليلات"
        )}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: t("Events","الفعاليات") },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="h-9 gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              {t("Refresh","تحديث")}
            </Button>
            <Button size="sm" asChild className="h-9 gap-1.5">
              <Link href="/admin/events/new">
                <Plus className="w-3.5 h-3.5" />{t("New Event","فعالية جديدة")}
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats row */}
      <div className="flex gap-3 flex-wrap">
        <StatCard icon={Calendar}   label={t("Total Events","إجمالي الفعاليات")}  value={stats?.totalEvents ?? 0}           accent="bg-blue-500" />
        <StatCard icon={Globe}      label={t("Published","منشورة")}                value={stats?.publishedEvents ?? 0}       accent="bg-emerald-500" />
        <StatCard icon={Clock}      label={t("Drafts","مسودات")}                   value={stats?.draftEvents ?? 0}           accent="bg-amber-500" />
        <StatCard icon={TrendingUp} label={t("Upcoming","قادمة")}                  value={upcomingCount}                     accent="bg-purple-500" />
        <StatCard icon={Users}      label={t("Registrations","التسجيلات")}          value={stats?.totalRegistrations ?? 0}
          sub={stats ? t(`+${stats.totalRegistrationsThisMonth} this month`,`+${stats.totalRegistrationsThisMonth} هذا الشهر`) : undefined}
          accent="bg-orange-500" />
        {stats?.mostRegisteredEventTitle && (
          <StatCard icon={Award}    label={t("Most Popular","الأكثر شعبية")}        value={stats.mostRegisteredEventCount ?? 0}
            sub={stats.mostRegisteredEventTitle}
            accent="bg-teal-500" />
        )}
      </div>

      {/* Search & Filters card */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("Search by title, location, organizer…","بحث بالعنوان أو الموقع أو المنظم…")}
              className="ps-9 h-9 rounded-xl bg-muted/40 border-0 focus-visible:ring-1 focus-visible:bg-background"
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm" className="h-9 gap-1.5 rounded-xl"
            onClick={() => setShowFilters(v => !v)}>
            <Filter className="w-3.5 h-3.5" />
            {t("Filters","فلاتر")}
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 text-muted-foreground rounded-xl text-xs"
              onClick={() => { setStatusFilter("ALL"); setTypeFilter("ALL"); setSearch(""); }}>
              <XCircle className="w-3.5 h-3.5 me-1" />{t("Clear all","مسح الكل")}
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="px-4 pb-4 pt-1 border-t border-border/50 flex gap-8 flex-wrap">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 mt-3">{t("Status","الحالة")}</p>
              <div className="flex gap-1.5 flex-wrap">
                {(["ALL","PUBLISHED","DRAFT","ARCHIVED","CANCELLED"] as const).map(s => {
                  const isActive = statusFilter === s;
                  const cfg = s !== "ALL" ? STATUS_MAP[s] : null;
                  return (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}>
                      {cfg && isActive && <span className={`w-1.5 h-1.5 rounded-full bg-white/80`} />}
                      {cfg && !isActive && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                      {s === "ALL" ? t("All","الكل") : t(cfg?.label ?? s, cfg?.labelAr ?? s)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 mt-3">{t("Type","النوع")}</p>
              <div className="flex gap-1.5 flex-wrap">
                {(["ALL","CONFERENCE","WORKSHOP","WEBINAR","MEETING","SEMINAR","OTHER"] as const).map(s => {
                  const isActive = typeFilter === s;
                  const cfg = s !== "ALL" ? EVENT_TYPES[s] : null;
                  return (
                    <button key={s} onClick={() => setTypeFilter(s)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}>
                      {cfg && isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/80" />}
                      {cfg && !isActive && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                      {s === "ALL" ? t("All","الكل") : t(cfg?.label ?? s, cfg?.labelAr ?? s)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-200 bg-red-50">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{t("Failed to load events.","فشل تحميل الفعاليات.")}</p>
          <Button variant="outline" size="sm" className="ms-auto border-red-200 text-red-700 hover:bg-red-100" onClick={() => refetch()}>
            {t("Retry","إعادة المحاولة")}
          </Button>
        </div>
      )}

      {/* Table */}
      <BulkActions items={filtered} idKey="id" onDelete={ids => bulkDeleteMutation.mutate(ids)}>
        {({ SelectAllCheckbox, RowCheckbox }) => (
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            {/* Table header bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/20">
              <div className="flex items-center gap-2.5">
                <h3 className="font-semibold text-sm text-foreground">{t("All Events","جميع الفعاليات")}</h3>
                <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {filtered.length}
                </span>
                {data?.totalElements && data.totalElements > filtered.length && (
                  <span className="text-xs text-muted-foreground">
                    {t(`(filtered from ${data.totalElements})`,`(مُصفى من ${data.totalElements})`)}
                  </span>
                )}
              </div>
              {!isLoading && filtered.length > 0 && (
                <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {filtered.filter(e => e.status === "PUBLISHED").length} {t("published","منشورة")}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {filtered.filter(e => e.status === "DRAFT").length} {t("draft","مسودة")}
                  </span>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b bg-muted/10">
                    <th className="py-2.5 ps-5 pe-3 w-10"><SelectAllCheckbox /></th>
                    <th className="py-2.5 pe-4 text-start">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {t("Event","الفعالية")}
                        <SortBtn col="title" active={sortKey} dir={sortDir} onClick={handleSort} />
                      </div>
                    </th>
                    <th className="py-2.5 pe-4 text-start hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Tag className="w-3 h-3" />{t("Type","النوع")}
                      </div>
                    </th>
                    <th className="py-2.5 pe-4 text-start hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />{t("Date","التاريخ")}
                        <SortBtn col="date" active={sortKey} dir={sortDir} onClick={handleSort} />
                      </div>
                    </th>
                    <th className="py-2.5 pe-4 text-start hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Users className="w-3 h-3" />{t("Regs","التسجيلات")}
                        <SortBtn col="registrations" active={sortKey} dir={sortDir} onClick={handleSort} />
                      </div>
                    </th>
                    <th className="py-2.5 pe-4 text-start">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {t("Status","الحالة")}
                        <SortBtn col="status" active={sortKey} dir={sortDir} onClick={handleSort} />
                      </div>
                    </th>
                    <th className="py-2.5 pe-5 text-end text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("Actions","إجراءات")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 7 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="py-4 ps-5 pe-3"><div className="w-4 h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="py-4 pe-4">
                          <div className="flex gap-3">
                            <div className="w-0.5 h-10 bg-muted/60 rounded-full" />
                            <div className="space-y-1.5 flex-1">
                              <div className="h-4 bg-muted/60 rounded animate-pulse w-44" />
                              <div className="h-3 bg-muted/40 rounded animate-pulse w-28" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pe-4 hidden sm:table-cell"><div className="h-5 bg-muted/60 rounded-md animate-pulse w-22" /></td>
                        <td className="py-4 pe-4 hidden md:table-cell"><div className="h-4 bg-muted/60 rounded animate-pulse w-24" /></td>
                        <td className="py-4 pe-4 hidden lg:table-cell"><div className="h-4 bg-muted/60 rounded animate-pulse w-10" /></td>
                        <td className="py-4 pe-4"><div className="h-5 bg-muted/60 rounded-full animate-pulse w-22" /></td>
                        <td className="py-4 pe-5" />
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                          <div className="w-20 h-20 rounded-3xl bg-muted/40 flex items-center justify-center">
                            <Calendar className="w-9 h-9 text-muted-foreground/25" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-base">
                              {hasActiveFilters
                                ? t("No matching events","لا توجد فعاليات مطابقة")
                                : t("No events yet","لا توجد فعاليات بعد")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {hasActiveFilters
                                ? t("Try adjusting your search or filters","جرّب تعديل البحث أو الفلاتر")
                                : t("Create your first event to get started","أنشئ أول فعالية للبدء")}
                            </p>
                          </div>
                          {!hasActiveFilters ? (
                            <Button size="sm" asChild>
                              <Link href="/admin/events/new"><Plus className="w-3.5 h-3.5 me-1.5" />{t("Create Event","إنشاء فعالية")}</Link>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => { setStatusFilter("ALL"); setTypeFilter("ALL"); setSearch(""); }}>
                              <XCircle className="w-3.5 h-3.5 me-1.5" />{t("Clear filters","مسح الفلاتر")}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(event => (
                      <EventRow
                        key={event.id}
                        event={event}
                        RowCheckbox={RowCheckbox}
                        onDelete={id => deleteMutation.mutate(id)}
                        onDuplicate={id => duplicateMutation.mutate(id)}
                        isDuplicating={duplicateMutation.isPending}
                        isDeleting={deleteMutation.isPending}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {!isLoading && filtered.length > 0 && (
              <div className="px-5 py-2.5 border-t bg-muted/10 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t(`Showing ${filtered.length} event${filtered.length !== 1 ? "s" : ""}`,
                     `يعرض ${filtered.length} فعالية`)}
                </span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    {filtered.filter(e => e.status === "PUBLISHED").length} {t("published","منشورة")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {filtered.filter(e => e.status === "DRAFT").length} {t("draft","مسودة")}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </BulkActions>
    </div>
  );
}
