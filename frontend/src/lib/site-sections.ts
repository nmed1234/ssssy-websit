import api from "./api";
import type { ApiResponse, SiteSection } from "@/types";

export async function getPublicSiteSections(location?: string) {
  const params = location ? { location } : {};
  return api.get<ApiResponse<SiteSection[]>>("/public/site-sections", { params });
}

export async function getPublicSiteSectionsByLocation(location: string) {
  return getPublicSiteSections(location);
}

export async function getPublicSiteSection(slug: string) {
  return api.get<ApiResponse<SiteSection>>(`/public/site-sections/${slug}`);
}

export async function getAdminSiteSections() {
  return api.get<ApiResponse<SiteSection[]>>("/admin/site-sections");
}

export async function getAdminSiteSection(id: string) {
  return api.get<ApiResponse<SiteSection>>(`/admin/site-sections/${id}`);
}

export async function createSiteSection(data: Partial<SiteSection>) {
  return api.post<ApiResponse<SiteSection>>("/admin/site-sections", data);
}

export async function updateSiteSection(id: string, data: Partial<SiteSection>) {
  return api.put<ApiResponse<SiteSection>>(`/admin/site-sections/${id}`, data);
}

export async function deleteSiteSection(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/site-sections/${id}`);
}
