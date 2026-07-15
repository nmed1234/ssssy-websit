import api from "./api";
import type { ApiResponse } from "@/types";

export interface ComponentPreset {
  id: string;
  componentType: string;
  nameAr?: string;
  nameEn?: string;
  configJson?: string;
  dataJson?: string;
  stylingJson?: string;
  isSystem?: boolean;
  createdById?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComponentPresetRequest {
  componentType: string;
  nameAr?: string;
  nameEn?: string;
  configJson?: string;
  dataJson?: string;
  stylingJson?: string;
  isSystem?: boolean;
}

export async function getAllComponentPresets(type?: string, systemOnly?: boolean) {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  if (systemOnly) params.systemOnly = "true";
  return api.get<ApiResponse<ComponentPreset[]>>("/admin/component-presets", { params });
}

export async function getSystemPresets() {
  return api.get<ApiResponse<ComponentPreset[]>>("/admin/component-presets/system");
}

export async function getCustomPresets() {
  return api.get<ApiResponse<ComponentPreset[]>>("/admin/component-presets/custom");
}

export async function getComponentPresetById(id: string) {
  return api.get<ApiResponse<ComponentPreset>>(`/admin/component-presets/${id}`);
}

export async function createComponentPreset(data: ComponentPresetRequest) {
  return api.post<ApiResponse<ComponentPreset>>("/admin/component-presets", data);
}

export async function updateComponentPreset(id: string, data: ComponentPresetRequest) {
  return api.put<ApiResponse<ComponentPreset>>(`/admin/component-presets/${id}`, data);
}

export async function deleteComponentPreset(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/component-presets/${id}`);
}
