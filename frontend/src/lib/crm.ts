import api from "./api";
import type { ApiResponse, CrmContact, CrmContactRequest, PaginatedResponse } from "@/types";

export async function searchContacts(
  query?: string,
  contactType?: string,
  relationshipLevel?: string,
  page = 0,
  size = 20
) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (contactType) params.set("contactType", contactType);
  if (relationshipLevel) params.set("relationshipLevel", relationshipLevel);
  params.set("page", String(page));
  params.set("size", String(size));
  return api.get<ApiResponse<PaginatedResponse<CrmContact>>>(`/crm/contacts?${params}`);
}

export async function getContact(id: string) {
  return api.get<ApiResponse<CrmContact>>(`/crm/contacts/${id}`);
}

export async function createContact(request: CrmContactRequest) {
  return api.post<ApiResponse<CrmContact>>("/crm/contacts", request);
}

export async function updateContact(id: string, request: CrmContactRequest) {
  return api.put<ApiResponse<CrmContact>>(`/crm/contacts/${id}`, request);
}

export async function deleteContact(id: string) {
  return api.delete<ApiResponse<null>>(`/crm/contacts/${id}`);
}

export async function getActiveContactCount() {
  return api.get<ApiResponse<number>>("/crm/contacts/count/active");
}

export async function getAllActiveContacts() {
  return api.get<ApiResponse<PaginatedResponse<CrmContact>>>("/crm/contacts/all/active");
}
