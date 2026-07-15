import api from "./api";
import type { ApiResponse, Notification } from "@/types";

export async function getNotifications(page = 0, size = 20) {
  return api.get<ApiResponse<{ content: Notification[]; totalElements: number; totalPages: number; number: number }>>(`/notifications?page=${page}&size=${size}`);
}

export async function getUnreadCount() {
  return api.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
}

export async function markAsRead(id: string) {
  return api.put<ApiResponse<null>>(`/notifications/${id}/read`);
}

export async function markAllAsRead() {
  return api.put<ApiResponse<null>>("/notifications/read-all");
}
