import api from "./api";
import type { ApiResponse, SiteSection, SiteSectionVersion } from "@/types";

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

// ── Draft/Publish workflow (V62) ──────────────────────────────────────────────

export async function publishSiteSection(id: string) {
  return api.post<ApiResponse<SiteSection>>(`/admin/site-sections/${id}/publish`);
}

export async function unpublishSiteSection(id: string) {
  return api.post<ApiResponse<SiteSection>>(`/admin/site-sections/${id}/unpublish`);
}

export async function getSiteSectionVersions(id: string) {
  return api.get<ApiResponse<SiteSectionVersion[]>>(`/admin/site-sections/${id}/versions`);
}

export async function rollbackSiteSection(id: string, versionNumber: number) {
  return api.post<ApiResponse<SiteSection>>(
    `/admin/site-sections/${id}/rollback/${versionNumber}`
  );
}
