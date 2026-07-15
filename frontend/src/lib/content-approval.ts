import api from "./api";
import type { ApiResponse } from "@/types";

export interface ContentApprovalLog {
  id: string;
  contentType: string;
  contentId: string;
  oldStatus?: string;
  newStatus: string;
  comments?: string;
  actionById?: string;
  actionByName?: string;
  createdAt: string;
}

export async function getApprovalLog(contentType: string, contentId: string) {
  return api.get<ApiResponse<ContentApprovalLog[]>>(
    `/admin/approval-log/${contentType}/${contentId}`
  );
}

export async function getAllApprovalLogs(page = 0, size = 20) {
  return api.get<ApiResponse<ContentApprovalLog[]>>("/admin/approval-log", {
    params: { page, size },
  });
}

export async function recordApprovalAction(
  contentType: string,
  contentId: string,
  newStatus: string,
  options?: { oldStatus?: string; comments?: string }
) {
  return api.post<ApiResponse<ContentApprovalLog>>(
    `/admin/approval-log/${contentType}/${contentId}`,
    null,
    {
      params: {
        newStatus,
        oldStatus: options?.oldStatus,
        comments: options?.comments,
      },
    }
  );
}
