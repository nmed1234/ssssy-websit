import api from "./api";
import type { ApiResponse, ContentItem } from "@/types";

export async function getPublishedContent(params?: { contentType?: string; categorySlug?: string; page?: number; size?: number }) {
  const query = new URLSearchParams();
  if (params?.contentType) query.set("contentType", params.contentType);
  if (params?.categorySlug) query.set("categorySlug", params.categorySlug);
  if (params?.page) query.set("page", String(params.page));
  if (params?.size) query.set("size", String(params.size));
  return api.get<ApiResponse<{ content: ContentItem[]; totalElements: number; totalPages: number; number: number }>>(`/public/content?${query.toString()}`);
}

export async function getFeaturedContent(limit = 6) {
  return api.get<ApiResponse<ContentItem[]>>(`/public/content/featured?limit=${limit}`);
}

export async function getPublishedContentBySlug(slug: string) {
  return api.get<ApiResponse<ContentItem>>(`/public/content/${slug}`);
}

export async function getContentByType(contentType: string, page = 0, size = 12) {
  return api.get<ApiResponse<{ content: ContentItem[]; totalElements: number; totalPages: number; number: number }>>(`/public/content/types/${contentType}?page=${page}&size=${size}`);
}

export async function searchContent(q: string, contentType?: string, page = 0, size = 20) {
  const query = new URLSearchParams({ q, page: String(page), size: String(size) });
  if (contentType) query.set("contentType", contentType);
  return api.get<ApiResponse<{ content: ContentItem[]; totalElements: number; totalPages: number; number: number }>>(`/public/search?${query.toString()}`);
}
