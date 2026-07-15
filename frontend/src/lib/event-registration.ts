import api from "./api";
import type { ApiResponse, EventRegistrationResponse } from "@/types";
import type { EventRegistrationRequest } from "@/types";

export async function registerForEvent(slug: string, data: EventRegistrationRequest) {
  return api.post<ApiResponse<EventRegistrationResponse>>(`/public/events/${slug}/register`, data);
}

export async function getEventRegistrations(eventId: string) {
  return api.get<ApiResponse<EventRegistrationResponse[]>>(`/admin/events/${eventId}/registrations`);
}