import api from "./api";
import type { ApiResponse, SystemConfig } from "@/types";

export async function getSettings() {
  return api.get<ApiResponse<SystemConfig[]>>("/admin/settings");
}

export async function setSetting(data: { configKey: string; configValue: string; configGroup?: string; configType?: string; isEncrypted?: boolean; description?: string }) {
  return api.put<ApiResponse<SystemConfig>>("/admin/settings", data);
}

export async function deleteSetting(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/settings/${id}`);
}
