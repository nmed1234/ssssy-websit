import api from "./api";
import type { ApiResponse, Page, PageSection, ComponentTemplate } from "@/types";

export async function getAdminPages(workflowStatus?: string) {
  const params = workflowStatus && workflowStatus !== "ALL"
    ? `?workflowStatus=${encodeURIComponent(workflowStatus)}`
    : "";
  return api.get<ApiResponse<Page[]>>(`/admin/pages/list${params}`);
}

export async function getPage(id: string) {
  return api.get<ApiResponse<Page>>(`/admin/pages/${id}`);
}

export async function createPage(data: Partial<Page>) {
  return api.post<ApiResponse<Page>>("/admin/pages", data);
}

export async function updatePage(id: string, data: Partial<Page>) {
  return api.put<ApiResponse<Page>>(`/admin/pages/${id}`, data);
}

export async function deletePage(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/pages/${id}`);
}

export async function getPageSections(pageId: string) {
  return api.get<ApiResponse<PageSection[]>>(`/admin/pages/${pageId}/sections`);
}

export async function addSection(pageId: string, data: Partial<PageSection>) {
  return api.post<ApiResponse<PageSection>>(`/admin/pages/${pageId}/sections`, data);
}

export async function updateSection(id: string, data: Partial<PageSection>) {
  return api.put<ApiResponse<PageSection>>(`/admin/pages/sections/${id}`, data);
}

export async function deleteSection(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/pages/sections/${id}`);
}

export async function reorderSections(pageId: string, sectionIds: string[]) {
  return api.put<ApiResponse<{ message: string }>>(`/admin/pages/${pageId}/sections/reorder`, sectionIds);
}

export async function getComponentTemplates() {
  return api.get<ApiResponse<ComponentTemplate[]>>("/public/component-templates");
}
