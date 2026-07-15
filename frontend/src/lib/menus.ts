import api from "./api";
import type { ApiResponse, Menu, MenuItem } from "@/types";

export async function getPublicMenus() {
  return api.get<ApiResponse<Menu[]>>("/public/menus");
}

export async function getMenus() {
  return api.get<ApiResponse<Menu[]>>("/admin/menus");
}

export async function createMenu(data: {
  name: string;
  location?: string;
  isActive?: boolean;
  menuTemplate?: string;
  dropdownStyle?: string;
}) {
  return api.post<ApiResponse<Menu>>("/admin/menus", data);
}

export async function updateMenu(id: string, data: {
  name: string;
  location?: string;
  isActive?: boolean;
  menuTemplate?: string;
  dropdownStyle?: string;
}) {
  return api.put<ApiResponse<Menu>>(`/admin/menus/${id}`, data);
}

/** Update only the style config fields of a menu (template, animation, colours). */
export async function updateMenuStyle(id: string, data: {
  menuTemplate?: string;
  dropdownStyle?: string;
  isDefaultStyle?: boolean;
  styleConfig?: string;
}) {
  return api.put<ApiResponse<Menu>>(`/admin/menus/${id}`, data);
}

/** Set this menu as the site-wide style default. Clears the flag on all others. */
export async function setMenuAsDefault(id: string) {
  return api.post<ApiResponse<Menu>>(`/admin/menus/${id}/set-default`, {});
}

export async function deleteMenu(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/menus/${id}`);
}

export async function getMenuItems(menuId: string) {
  return api.get<ApiResponse<MenuItem[]>>(`/admin/menus/${menuId}/items`);
}

export async function createMenuItem(menuId: string, data: Partial<MenuItem>) {
  return api.post<ApiResponse<MenuItem>>(`/admin/menus/${menuId}/items`, data);
}

export async function updateMenuItem(id: string, data: Partial<MenuItem> & { clearParent?: boolean }) {
  return api.put<ApiResponse<MenuItem>>(`/admin/menus/items/${id}`, data);
}

export async function deleteMenuItem(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/menus/items/${id}`);
}

export async function reorderMenuItems(menuId: string, itemIds: string[]) {
  return api.put<ApiResponse<{ message: string }>>(`/admin/menus/${menuId}/items/reorder`, itemIds);
}

export interface MoveMenuItemPayload {
  itemId: string;
  parentId: string | null;
  sortOrder: number;
}

export async function moveMenuItem(menuId: string, payload: MoveMenuItemPayload) {
  return api.patch<ApiResponse<{ message: string }>>(`/admin/menus/${menuId}/items`, payload);
}
