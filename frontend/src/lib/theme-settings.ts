import api from "./api";
import type { ApiResponse, ThemeSetting } from "@/types";

export async function getPublicThemeSettings() {
  return api.get<ApiResponse<ThemeSetting[]>>("/public/theme-settings");
}

export async function getAdminThemeSettings() {
  return api.get<ApiResponse<ThemeSetting[]>>("/admin/theme-settings");
}

export async function updateThemeSettingByKey(key: string, value: string | { settingValue: string }) {
  const body = typeof value === "string" ? { settingValue: value } : value;
  return api.put<ApiResponse<ThemeSetting>>(`/admin/theme-settings/by-key/${key}`, body);
}
