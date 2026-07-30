import { serverGetPublishedEvents } from "@/lib/server-api";
import type { Event } from "@/types";
import EventsPageClient from "./EventsPageClient";

export const revalidate = 60;

export const metadata = {
  title: "Events | SSSS",
  description: "Discover conferences, workshops, seminars, and training programs organized by the Soil Science Society of Syria.",
};

export default async function EventsPage() {
  const initial = await serverGetPublishedEvents<Event>(0, 12, 60);
  return (
    <EventsPageClient
      initialEvents={initial?.content ?? []}
      initialTotalPages={initial?.totalPages ?? 0}
    />
  );
}
