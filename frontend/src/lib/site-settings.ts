import api from "@/lib/api";

export interface SystemConfig {
  id: string;
  configKey: string;
  configValue: string;
  configGroup: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllSystemConfigs(): Promise<SystemConfig[]> {
  const response = await api.get<{ data: SystemConfig[] }>(`/public/settings`);
  return response.data.data;
}

export async function getSystemConfigsByGroup(group: string): Promise<SystemConfig[]> {
  const response = await api.get<{ data: SystemConfig[] }>(`/public/settings/group/${group}`);
  return response.data.data;
}

export async function getSystemConfigByKey(key: string): Promise<SystemConfig> {
  const response = await api.get<SystemConfig>(`/public/settings/${key}`);
  return response.data;
}
