"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";
import type { ContentItem, PaginatedResponse, ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BulkActions } from "@/components/admin/BulkActions";
import { AdvancedFilters } from "@/components/admin/AdvancedFilters";
import { exportCSV } from "@/lib/export";
import { useLanguage } from "@/lib/language-context";
import {
  FileText, Eye, Globe, Archive, Clock, CheckCircle, XCircle,
  TrendingUp, ExternalLink, Newspaper, AlignLeft,
} from "lucide-react";

// ─── Status colour + bilingual label map ─────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PUBLISHED:          { bg: "bg-emerald-100", text: "text-emerald-700" },
  DRAFT:              { bg: "bg-yellow-100",  text: "text-yellow-700"  },
  REVIEW:             { bg: "bg-blue-100",    text: "text-blue-700"    },
  IN_REVIEW:          { bg: "bg-blue-100",    text: "text-blue-700"    },
  SUBMITTED:          { bg: "bg-indigo-100",  text: "text-indigo-700"  },
  APPROVED:           { bg: "bg-teal-100",    text: "text-teal-700"    },
  REJECTED:           { bg: "bg-red-100",     text: "text-red-700"     },
  REVISION_REQUESTED: { bg: "bg-orange-100",  text: "text-orange-700"  },
  SCHEDULED:          { bg: "bg-purple-100",  text: "text-purple-700"  },
  ARCHIVED:           { bg: "bg-gray-100",    text: "text-gray-500"    },
};

const STATUS_LABELS_EN: Record<string, string> = {
  ALL:                "All",
  PUBLISHED:          "Published",
  DRAFT:              "Draft",
  REVIEW:             "In Review",
  IN_REVIEW:          "In Review",
  SUBMITTED:          "Submitted",
  APPROVED:           "Approved",
  REJECTED:           "Rejected",
  REVISION_REQUESTED: "Revision Req.",
  SCHEDULED:          "Scheduled",
  ARCHIVED:           "Archived",
};

const STATUS_LABELS_AR: Record<string, string> = {
  ALL:                "الكل",
  PUBLISHED:          "منشور",
  DRAFT:              "مسودة",
  REVIEW:             "قيد المراجعة",
  IN_REVIEW:          "قيد المراجعة",
  SUBMITTED:          "مُرسل للمراجعة",
  APPROVED:           "معتمد",
  REJECTED:           "مرفوض",
  REVISION_REQUESTED: "طُلب تعديل",
  SCHEDULED:          "مجدول",
  ARCHIVED:           "مؤرشف",
};

const TYPE_LABELS: Record<string, { en: string; ar: string; icon: React.ReactNode }> = {
  NEWS:        { en: "News",        ar: "أخبار",     icon: <Newspaper   className="h-3 w-3" /> },
  ARTICLE:     { en: "Article",     ar: "مقال",      icon: <FileText    className="h-3 w-3" /> },
  PUBLICATION: { en: "Publication", ar: "منشور",     icon: <AlignLeft   className="h-3 w-3" /> },
  PAGE:        { en: "Page",        ar: "صفحة",      icon: <Globe       className="h-3 w-3" /> },
};

function StatusBadge({ status, lang }: { status: string; lang: "en" | "ar" }) {
  const style = STATUS_STYLES[status] || { bg: "bg-gray-100", text: "text-gray-600" };
  const label = lang === "ar"
    ? (STATUS_LABELS_AR[status] ?? status)
    : (STATUS_LABELS_EN[status] ?? status);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {label}
    </span>
  );
}

function TypeBadge({ type, lang }: { type: string; lang: "en" | "ar" }) {
  const def = TYPE_LABELS[type];
  if (!def) return <span className="bg-muted px-2 py-0.5 rounded text-xs">{type}</span>;
  return (
    <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
      {def.icon}
      {lang === "ar" ? def.ar : def.en}
    </span>
  );
}

// ─── Public preview URL for a content item ────────────────────────────────────
function previewUrl(item: ContentItem) {
  const type = (item.contentType || "").toLowerCase();
  if (type === "news") return `/news/${item.slug}`;
  if (type === "article" || type === "publication") return `/content/${type}/${item.slug}`;
  return `/news/${item.slug}`;
}

export default function ContentListPage() {
  const { t, direction } = useLanguage();
  const lang = direction === "rtl" ? "ar" : "en";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter]     = useState<string>("ALL");

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`/content/${id}`)));
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["content"] }); },
  });

  const columns = [
    { key: "titleAr" as keyof ContentItem, label: t("Title (AR)", "العنوان (عربي)") },
    { key: "titleEn" as keyof ContentItem, label: t("Title (EN)", "العنوان (إنجليزي)") },
    { key: "contentType" as keyof ContentItem, label: t("Type", "النوع") },
    { key: "status" as keyof ContentItem, label: t("Status", "الحالة") },
    { key: "authorName" as keyof ContentItem, label: t("Author", "المؤلف") },
    { key: "updatedAt" as keyof ContentItem, label: t("Updated", "تاريخ التحديث") },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<ContentItem>>>("/content", { params: { size: 100 } });
      return res.data.data;
    },
  });

  const allItems = useMemo(() => data?.content || [], [data]);

  // ── Statistics derived from all fetched items ─────────────────────────────
  const stats = useMemo(() => ({
    total:     allItems.length,
    published: allItems.filter(i => i.status === "PUBLISHED").length,
    draft:     allItems.filter(i => i.status === "DRAFT").length,
    review:    allItems.filter(i => ["REVIEW", "IN_REVIEW", "SUBMITTED"].includes(i.status || "")).length,
    archived:  allItems.filter(i => i.status === "ARCHIVED").length,
  }), [allItems]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (item.titleAr  || "").toLowerCase().includes(q) ||
        (item.titleEn  || "").toLowerCase().includes(q) ||
        (item.authorName || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesType   = typeFilter   === "ALL" || item.contentType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allItems, search, statusFilter, typeFilter]);

  // ── Stat card component (inline) ──────────────────────────────────────────
  const StatCard = ({
    label, labelAr, value, icon, colour, filterVal,
  }: {
    label: string; labelAr: string; value: number;
    icon: React.ReactNode; colour: string; filterVal: string;
  }) => (
    <button
      onClick={() => setStatusFilter(filterVal)}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
        statusFilter === filterVal ? "ring-2 ring-soil-clay border-soil-clay/40" : "bg-card border-border"
      }`}
    >
      <div className={`rounded-lg p-2 ${colour}`}>{icon}</div>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{t(label, labelAr)}</p>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("Content", "المحتوى")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Content", "المحتوى") },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => exportCSV(filtered, columns, "content.csv")}>
              {t("Export CSV", "تصدير CSV")}
            </Button>
            <Button asChild>
              <Link href="/admin/content/new">{t("New Content", "محتوى جديد")}</Link>
            </Button>
          </>
        }
      />

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total"     labelAr="المجموع"      value={stats.total}     icon={<FileText    className="h-4 w-4 text-gray-600"    />} colour="bg-gray-100"    filterVal="ALL"      />
        <StatCard label="Published" labelAr="منشور"        value={stats.published} icon={<Globe       className="h-4 w-4 text-emerald-600" />} colour="bg-emerald-50" filterVal="PUBLISHED" />
        <StatCard label="Draft"     labelAr="مسودة"        value={stats.draft}     icon={<Clock       className="h-4 w-4 text-yellow-600"  />} colour="bg-yellow-50"  filterVal="DRAFT"     />
        <StatCard label="In Review" labelAr="قيد المراجعة" value={stats.review}    icon={<CheckCircle className="h-4 w-4 text-blue-600"    />} colour="bg-blue-50"    filterVal="IN_REVIEW" />
        <StatCard label="Archived"  labelAr="مؤرشف"        value={stats.archived}  icon={<Archive     className="h-4 w-4 text-gray-500"    />} colour="bg-gray-50"    filterVal="ARCHIVED"  />
      </div>

      {/* ── Filters row ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <AdvancedFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={["ALL", "PUBLISHED", "DRAFT", "REVIEW", "IN_REVIEW", "SUBMITTED", "APPROVED", "REJECTED", "REVISION_REQUESTED", "SCHEDULED", "ARCHIVED"]}
            statusLabels={lang === "ar" ? STATUS_LABELS_AR : STATUS_LABELS_EN}
            searchPlaceholder={t("Search by title or author...", "بحث بالعنوان أو المؤلف...")}
          />
        </div>
        {/* Type filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["ALL", "NEWS", "ARTICLE", "PUBLICATION", "PAGE"] as const).map((tp) => (
            <button
              key={tp}
              onClick={() => setTypeFilter(tp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                typeFilter === tp
                  ? "bg-soil-clay text-white border-soil-clay"
                  : "bg-card text-muted-foreground border-border hover:border-soil-clay/50"
              }`}
            >
              {tp === "ALL"
                ? t("All Types", "كل الأنواع")
                : lang === "ar"
                  ? TYPE_LABELS[tp]?.ar ?? tp
                  : TYPE_LABELS[tp]?.en ?? tp}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <BulkActions items={filtered} idKey="id" onDelete={(ids) => deleteMutation.mutate(ids)}>
        {({ SelectAllCheckbox, RowCheckbox }) => (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("All Content Items", "جميع عناصر المحتوى")}
                <span className="ml-2 text-muted-foreground font-normal text-sm">({filtered.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3 py-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 w-10 text-left"><SelectAllCheckbox /></th>
                        <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide text-left w-8" />
                        <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide text-left">
                          {t("Title", "العنوان")}
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide text-left">
                          {t("Type", "النوع")}
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide text-left">
                          {t("Status", "الحالة")}
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide text-left hidden md:table-cell">
                          {t("Author", "المؤلف")}
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide text-left hidden sm:table-cell">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {t("Views", "المشاهدات")}</span>
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide text-left hidden lg:table-cell">
                          {t("Updated", "تاريخ التحديث")}
                        </th>
                        <th className="pb-3 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => {
                        const title = lang === "ar"
                          ? (item.titleAr || item.titleEn || "—")
                          : (item.titleEn || item.titleAr || "—");
                        return (
                          <tr key={item.id} className="border-b last:border-0 group hover:bg-muted/30 transition-colors">
                            <td className="py-3"><RowCheckbox id={item.id} /></td>
                            {/* Thumbnail */}
                            <td className="py-3 pr-2">
                              {item.featuredImage ? (
                                <img
                                  src={item.featuredImage}
                                  alt=""
                                  className="h-8 w-8 rounded object-cover border border-border"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded bg-soil-sand/40 flex items-center justify-center border border-border">
                                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                              )}
                            </td>
                            {/* Title */}
                            <td className="py-3 max-w-xs">
                              <Link
                                href={`/admin/content/${item.id}`}
                                className="font-medium text-foreground hover:text-soil-clay transition-colors line-clamp-1"
                              >
                                {title}
                              </Link>
                              {item.titleAr && item.titleEn && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {lang === "ar" ? item.titleEn : item.titleAr}
                                </p>
                              )}
                            </td>
                            {/* Type */}
                            <td className="py-3">
                              <TypeBadge type={item.contentType || ""} lang={lang} />
                            </td>
                            {/* Status */}
                            <td className="py-3">
                              <StatusBadge status={item.status || "DRAFT"} lang={lang} />
                            </td>
                            {/* Author */}
                            <td className="py-3 text-muted-foreground hidden md:table-cell">
                              {item.authorName || "—"}
                            </td>
                            {/* Views */}
                            <td className="py-3 text-muted-foreground hidden sm:table-cell">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {item.viewCount ?? 0}
                              </span>
                            </td>
                            {/* Updated */}
                            <td className="py-3 text-muted-foreground hidden lg:table-cell text-xs">
                              {item.updatedAt
                                ? new Date(item.updatedAt).toLocaleDateString(lang === "ar" ? "ar-SY" : "en-US")
                                : "—"}
                            </td>
                            {/* Preview link — visible on hover */}
                            <td className="py-3">
                              <a
                                href={previewUrl(item)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t("Preview on site", "معاينة في الموقع")}
                                className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center w-7 h-7 rounded hover:bg-muted text-muted-foreground"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-muted-foreground">
                            <XCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                            <p>
                              {search
                                ? t("No content matching your search", "لا يوجد محتوى يطابق بحثك")
                                : t("No content yet", "لا يوجد محتوى بعد")}
                            </p>
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
    </div>
  );
}
