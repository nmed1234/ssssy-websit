"use client";

/**
 * Phase 3 — Public list page for any dynamic content type.
 * URL: /content/{typeName}
 *
 * Fetches the type definition and lists published entries.
 * Links each entry to /content/{typeName}/{slug}.
 */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiResponse, ContentTypeDefinition, DynamicContentEntry, PaginatedResponse } from "@/types";
import { useLanguage } from "@/lib/language-context";
import { Loader2, Calendar, User, ArrowRight, ArrowLeft, Search } from "lucide-react";

export default function DynamicContentListPage() {
  const params = useParams();
  const router = useRouter();
  const { t, direction } = useLanguage();
  const typeName = params.typeName as string;
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  // Fetch type schema (for label and fields)
  const { data: typeDef } = useQuery({
    queryKey: ["public-type-schema", typeName],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContentTypeDefinition>>(`/public/content-types/${typeName}`);
      return res.data.data;
    },
    enabled: !!typeName,
    staleTime: 5 * 60_000,
  });

  // Fetch published entries
  const { data: entriesPage, isLoading, error } = useQuery({
    queryKey: ["public-entries", typeName, page, searchQuery],
    queryFn: async () => {
      const params_ = new URLSearchParams({ page: String(page), size: "12" });
      if (searchQuery.trim()) {
        const res = await api.get<ApiResponse<PaginatedResponse<DynamicContentEntry>>>(
          `/v2/dt/${typeName}/search?q=${encodeURIComponent(searchQuery)}&${params_}`
        );
        return res.data.data;
      }
      const res = await api.get<ApiResponse<PaginatedResponse<DynamicContentEntry>>>(
        `/v2/dt/${typeName}?${params_}`
      );
      return res.data.data;
    },
    enabled: !!typeName,
    staleTime: 60_000,
  });

  const entries = entriesPage?.content ?? [];
  const totalPages = entriesPage?.totalPages ?? 0;
  const totalElements = entriesPage?.totalElements ?? 0;

  const typeLabel = typeDef ? t(typeDef.labelEn, typeDef.labelAr ?? typeDef.labelEn) : typeName;

  // Extract a display title from entry field_data
  function entryTitle(entry: DynamicContentEntry): string {
    try {
      const data = JSON.parse(entry.fieldData);
      return String(data.title ?? data.title_en ?? data.name ?? entry.slug);
    } catch {
      return entry.slug;
    }
  }

  // Extract a listed field value
  function entryExcerpt(entry: DynamicContentEntry): string | null {
    if (!typeDef?.fields) return null;
    try {
      const data = JSON.parse(entry.fieldData);
      const listedField = typeDef.fields.find(
        (f) => f.isListed && !["title", "title_en", "name"].includes(f.fieldName)
          && ["text", "textarea", "richtext"].includes(f.fieldType)
      );
      if (listedField && data[listedField.fieldName]) {
        const raw = String(data[listedField.fieldName]).replace(/<[^>]+>/g, "");
        return raw.length > 140 ? raw.substring(0, 140) + "…" : raw;
      }
    } catch { /* ignore */ }
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{typeLabel}</h1>
        {typeDef?.description && (
          <p className="mt-2 text-gray-500">{typeDef.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          {t(`${totalElements} items`, `${totalElements} عنصر`)}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder={t("Search…", "بحث…")}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-green-600" />
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-center py-16 text-gray-400">
          <p>{t("Failed to load content.", "فشل تحميل المحتوى.")}</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && entries.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>{t("No published content yet.", "لا يوجد محتوى منشور حتى الآن.")}</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => {
            const title = entryTitle(entry);
            const excerpt = entryExcerpt(entry);
            return (
              <article
                key={entry.id}
                onClick={() => router.push(`/content/${typeName}/${entry.slug}`)}
                className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-400 hover:shadow-md transition-all"
              >
                {/* Featured image */}
                {entry.featuredImageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={entry.featuredImageUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                    {title}
                  </h2>
                  {excerpt && (
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-3">{excerpt}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                    {entry.authorDisplayName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.authorDisplayName}
                      </span>
                    )}
                    {entry.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-green-700 font-medium">
                    {t("Read more", "اقرأ المزيد")}
                    <ArrowIcon className="h-3 w-3" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            {t("Previous", "السابق")}
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {t(`${page + 1} / ${totalPages}`, `${page + 1} / ${totalPages}`)}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            {t("Next", "التالي")}
          </button>
        </div>
      )}
    </div>
  );
}
