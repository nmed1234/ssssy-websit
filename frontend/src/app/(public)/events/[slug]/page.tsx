import { serverGetEventBySlug, serverGetPublishedEvents } from "@/lib/server-api";
import type { Event } from "@/types";
import EventDetailClient from "./EventDetailClient";

export const revalidate = 300;

export async function generateStaticParams() {
  const result = await serverGetPublishedEvents<Event>(0, 20, 3600);
  if (!result?.content) return [];
  return result.content.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const event = await serverGetEventBySlug<Event>(params.slug, 300);
  if (!event) return { title: "Event | SSSS" };
  return {
    title: `${event.titleEn || event.titleAr} | SSSS`,
    description: event.description || "Event details on the Soil Science Society of Syria website.",
    openGraph: {
      title: event.titleEn || event.titleAr || "",
      description: event.description || "",
    },
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await serverGetEventBySlug<Event>(params.slug, 300);
  return <EventDetailClient initialEvent={event} />;
}
