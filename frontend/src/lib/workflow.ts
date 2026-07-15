import api from "./api";
import type { ApiResponse, ContentItem, WorkflowLog } from "@/types";

export async function submitForReview(contentId: string, comments?: string) {
  return api.post<ApiResponse<ContentItem>>(`/workflow/${contentId}/submit`, { comments });
}

export async function assignReviewer(contentId: string, assigneeId: string, comments?: string) {
  return api.post<ApiResponse<ContentItem>>(`/workflow/${contentId}/assign`, { assigneeId, comments });
}

export async function approveContent(contentId: string, comments?: string) {
  return api.post<ApiResponse<ContentItem>>(`/workflow/${contentId}/approve`, { comments });
}

export async function rejectContent(contentId: string, comments?: string) {
  return api.post<ApiResponse<ContentItem>>(`/workflow/${contentId}/reject`, { comments });
}

export async function requestRevision(contentId: string, comments?: string) {
  return api.post<ApiResponse<ContentItem>>(`/workflow/${contentId}/request-revision`, { comments });
}

export async function publishContent(contentId: string, comments?: string) {
  return api.post<ApiResponse<ContentItem>>(`/workflow/${contentId}/publish`, { comments });
}

export async function scheduleContent(contentId: string, scheduledAt: string, comments?: string) {
  return api.post<ApiResponse<ContentItem>>(`/workflow/${contentId}/schedule?scheduledAt=${encodeURIComponent(scheduledAt)}`, { comments });
}

export async function unpublishContent(contentId: string, comments?: string) {
  return api.post<ApiResponse<ContentItem>>(`/workflow/${contentId}/unpublish`, { comments });
}

export async function backToDraft(contentId: string, comments?: string) {
  return api.post<ApiResponse<ContentItem>>(`/workflow/${contentId}/back-to-draft`, { comments });
}

export async function getWorkflowLogs(contentId: string) {
  return api.get<ApiResponse<WorkflowLog[]>>(`/workflow/${contentId}/logs`);
}

export async function getPendingReviews() {
  return api.get<ApiResponse<ContentItem[]>>("/workflow/pending-reviews");
}

export async function getSubmittedItems() {
  return api.get<ApiResponse<ContentItem[]>>("/workflow/submitted");
}

export async function getApprovedItems() {
  return api.get<ApiResponse<ContentItem[]>>("/workflow/approved");
}
