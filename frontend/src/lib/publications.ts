import api from "./api";
import type { ApiResponse, PaginatedResponse, Publication } from "@/types";

export interface PublicationParams {
  search?: string;
  year?: number;
  category?: string;
  page?: number;
  size?: number;
}

export function getPublicPublications(params: PublicationParams = {}) {
  return api.get<ApiResponse<PaginatedResponse<Publication>>>("/public/publications", { params });
}

export function getPublicationBySlug(slug: string) {
  return api.get<ApiResponse<Publication>>(`/public/publications/${slug}`);
}

export function getAdminPublications(page = 0, size = 50) {
  return api.get<ApiResponse<PaginatedResponse<Publication>>>("/admin/publications", { params: { page, size } });
}

export function createPublication(data: Partial<Publication>) {
  return api.post<ApiResponse<Publication>>("/admin/publications", data);
}

export function updatePublication(id: string, data: Partial<Publication>) {
  return api.put<ApiResponse<Publication>>(`/admin/publications/${id}`, data);
}

export function deletePublication(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/publications/${id}`);
}
