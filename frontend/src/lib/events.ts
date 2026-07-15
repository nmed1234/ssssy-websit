import api from "./api";
import type { ApiResponse, Event } from "@/types";

export async function getPublishedEvents(page = 0, size = 12) {
  return api.get<ApiResponse<{ content: Event[]; totalElements: number; totalPages: number; number: number }>>(`/public/events?page=${page}&size=${size}`);
}

export async function getUpcomingEvents() {
  return api.get<ApiResponse<Event[]>>("/public/events/upcoming");
}

export async function getEventsByMonth(year: number, month: number) {
  return api.get<ApiResponse<Event[]>>(`/public/events/calendar?year=${year}&month=${month}`);
}

export async function getEventBySlug(slug: string) {
  return api.get<ApiResponse<Event>>(`/public/events/${slug}`);
}
