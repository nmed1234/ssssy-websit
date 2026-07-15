"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  thumbnailUrl?: string;
  usageCount: number;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-white overflow-hidden animate-pulse">
      <div className="w-full h-36 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

function TemplateThumbnail({ url }: { url?: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="w-full h-36 object-cover bg-muted"
        loading="lazy"
      />
    );
  }
  return (
    <div className="w-full h-36 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
      <svg
        className="w-10 h-10 text-muted-foreground/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} />
        <path d="M3 9h18M9 21V9" strokeWidth={1.5} />
      </svg>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: PageTemplate;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  deleting: boolean;
}

function TemplateCard({ template, isAdmin, onDelete, deleting }: TemplateCardProps) {
  const { t } = useLanguage();
  function handleDelete() {
    if (
      confirm(
        `Are you sure you want to delete the template "${template.name}"? This cannot be undone.`
      )
    ) {
      onDelete(template.id);
    }
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <TemplateThumbnail url={template.thumbnailUrl} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-gray-900 leading-snug">{template.name}</p>
          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-soil-dark/10 text-soil-dark">
            {template.category}
          </span>
        </div>
        {template.description && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t("Used", "استُخدم")}{" "}
            <span className="font-medium text-gray-700">{template.usageCount}</span>{" "}
            {template.usageCount === 1 ? t("time", "مرة") : t("times", "مرات")}
          </span>
          <span>{formatDate(template.createdAt)}</span>
        </div>
        {isAdmin && (
          <div className="mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {deleting ? t("Deleting…", "جارٍ الحذف…") : t("Delete Template", "حذف القالب")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTemplatesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === "ADMIN";

  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data?: PageTemplate[] } | PageTemplate[]>(
        "/admin/page-templates"
      );
      // Handle both flat array and wrapped { data: [...] } responses
      const raw = res.data;
      const list: PageTemplate[] = Array.isArray(raw)
        ? (raw as PageTemplate[])
        : ((raw as { data?: PageTemplate[] }).data ?? []);
      setTemplates(list);
    } catch {
      setError("Failed to load templates. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/admin/page-templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete template. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title={t("Page Templates", "قوالب الصفحات")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Page Templates", "قوالب الصفحات") },
        ]}
      />

      {/* Error state */}
      {error && !loading && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span>{error}</span>
            <button
              onClick={fetchTemplates}
              className="ml-3 font-medium underline hover:no-underline"
            >
              {t("Retry", "إعادة المحاولة")}
            </button>
          </div>
        </div>
      )}

      {/* Loading state — skeleton grid */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="w-14 h-14 text-muted-foreground/30 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} />
              <path d="M3 9h18M9 21V9" strokeWidth={1.5} />
            </svg>
            <p className="text-lg font-medium text-gray-700">{t("No templates saved yet", "لا توجد قوالب محفوظة بعد")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Open a page in the Page Builder and use", "افتح صفحة في منشئ الصفحات واستخدم")}{" "}
              <span className="font-medium">📋 {t("Save as Template", "حفظ كقالب")}</span>{" "}
              {t("to create your first template.", "لإنشاء أول قالب لك.")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Template grid */}
      {!loading && !error && templates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {templates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              deleting={deletingId === tpl.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
