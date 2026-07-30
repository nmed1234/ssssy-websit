"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiResponse, ContentTypeDefinition, DynamicContentEntry } from "@/types";
import { useLanguage } from "@/lib/language-context";
import { Loader2, Calendar, User } from "lucide-react";

/**
 * Phase 3 — Universal public renderer for dynamic content entries.
 * Resolves the content type schema, then renders each field appropriately.
 *
 * URL: /content/{typeName}/{slug}
 */
export default function DynamicContentPublicPage() {
  const params = useParams();
  const { t } = useLanguage();
  const typeName = params.typeName as string;
  const slug = params.slug as string;

  const { data: typeDef } = useQuery({
    queryKey: ["public-type-schema", typeName],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContentTypeDefinition>>(`/public/content-types/${typeName}`);
      return res.data.data;
    },
  });

  const { data: entry, isLoading, error } = useQuery({
    queryKey: ["public-entry", typeName, slug],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DynamicContentEntry>>(`/v2/dt/${typeName}/${slug}`);
      return res.data.data;
    },
    enabled: !!typeName && !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin h-10 w-10 text-green-600" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">
        <p className="text-xl">{t("Content not found.", "المحتوى غير موجود.")}</p>
      </div>
    );
  }

  let fieldValues: Record<string, unknown> = {};
  try { fieldValues = JSON.parse(entry.fieldData); } catch {}

  const title = String(fieldValues.title ?? fieldValues.title_en ?? fieldValues.name ?? entry.slug);

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Type label */}
      {typeDef && (
        <p className="text-sm text-green-700 font-medium mb-3 uppercase tracking-wide">
          {typeDef.labelEn}
        </p>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
        {entry.authorDisplayName && (
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {entry.authorDisplayName}
          </span>
        )}
        {entry.publishedAt && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(entry.publishedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Featured image */}
      {entry.featuredImageUrl && (
        <img
          src={entry.featuredImageUrl}
          alt={title}
          className="w-full rounded-xl mb-8 max-h-96 object-cover"
        />
      )}

      {/* Dynamic fields */}
      <div className="space-y-6">
        {(typeDef?.fields ?? []).map((field) => {
          const value = fieldValues[field.fieldName];
          if (value == null || value === "" || field.fieldName === "title" || field.fieldName === "title_en") return null;

          const label = t(field.fieldLabelEn, field.fieldLabelAr || field.fieldLabelEn);

          return (
            <div key={field.fieldName}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</h3>
              <FieldValueRenderer fieldType={field.fieldType} value={String(value)} />
            </div>
          );
        })}

        {/* If no schema, render all fields generically */}
        {!typeDef && Object.entries(fieldValues).map(([key, value]) => {
          if (key === "title" || key === "title_en" || !value) return null;
          return (
            <div key={key}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {key.replace(/_/g, " ")}
              </h3>
              <p className="text-gray-700">{String(value)}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

// ─── Field value renderer ─────────────────────────────────────────────────────

function FieldValueRenderer({ fieldType, value }: { fieldType: string; value: string }) {
  if (!value) return <p className="text-gray-400 italic">—</p>;

  switch (fieldType) {
    case "richtext":
      return (
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      );
    case "url":
      return (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="text-green-700 hover:underline break-all">{value}</a>
      );
    case "email":
      return <a href={`mailto:${value}`} className="text-green-700 hover:underline">{value}</a>;
    case "date":
    case "datetime":
      return <p className="text-gray-700">{new Date(value).toLocaleString()}</p>;
    case "checkbox":
      return <p className="text-gray-700">{value === "true" ? "✓ Yes" : "✗ No"}</p>;
    case "media":
      return <img src={value} alt="" className="max-w-sm rounded-lg" />;
    default:
      return <p className="text-gray-700 whitespace-pre-wrap">{value}</p>;
  }
}
