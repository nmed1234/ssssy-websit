import api from "./api";
import type { ApiResponse } from "@/types";

export interface ContentStringResponse {
  id: string;
  stringKey: string;
  valueEn: string;
  valueAr: string;
  stringGroup: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentStringMap = Record<string, string>;

// ─── Public Endpoints ───────────────────────────────────────────────

export async function getPublicContentStrings(lang: string = "en") {
  return api.get<ApiResponse<ContentStringMap>>("/public/content-strings", {
    params: { lang },
  });
}

export async function getPublicContentString(key: string) {
  return api.get<ApiResponse<ContentStringResponse>>(
    `/public/content-strings/${key}`
  );
}

// ─── Admin Endpoints ────────────────────────────────────────────────

export async function getAllContentStrings() {
  return api.get<ApiResponse<ContentStringResponse[]>>(
    "/admin/content-strings"
  );
}

export async function getContentString(id: string) {
  return api.get<ApiResponse<ContentStringResponse>>(
    `/admin/content-strings/${id}`
  );
}

export async function getContentStringGroups() {
  return api.get<ApiResponse<string[]>>("/admin/content-strings/groups");
}

export async function createContentString(
  data: Partial<ContentStringResponse> & {
    stringKey: string;
    valueEn: string;
    valueAr: string;
  }
) {
  return api.post<ApiResponse<ContentStringResponse>>(
    "/admin/content-strings",
    data
  );
}

export async function updateContentString(
  id: string,
  data: Partial<ContentStringResponse>
) {
  return api.put<ApiResponse<ContentStringResponse>>(
    `/admin/content-strings/${id}`,
    data
  );
}

export async function deleteContentString(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(
    `/admin/content-strings/${id}`
  );
}
