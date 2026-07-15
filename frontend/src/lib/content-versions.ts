import api from "./api";
import type { ApiResponse } from "@/types";

export interface ContentVersionHistory {
  id: string;
  contentType: string;
  contentId: string;
  versionNumber: number;
  dataSnapshot: string;
  changeDescription?: string;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
}

export async function getVersionHistory(contentType: string, contentId: string) {
  return api.get<ApiResponse<ContentVersionHistory[]>>(
    `/admin/version-history/${contentType}/${contentId}`
  );
}

export async function getVersionByNumber(contentType: string, contentId: string, versionNumber: number) {
  return api.get<ApiResponse<ContentVersionHistory>>(
    `/admin/version-history/${contentType}/${contentId}/${versionNumber}`
  );
}

export async function rollbackContentItem(contentId: string, versionNumber: number) {
  return api.post<ApiResponse<{ message: string; newVersion: number }>>(
    `/admin/version-history/content-item/${contentId}/rollback/${versionNumber}`
  );
}
