import { serverGetPublications } from "@/lib/server-api";
import type { Publication } from "@/types";
import PublicationsPageClient from "./PublicationsPageClient";

export const revalidate = 120;

export const metadata = {
  title: "Publications | SSSS",
  description: "Browse research publications, journal articles and scientific reports from the Soil Science Society of Syria.",
};

export default async function PublicationsPage() {
  const initial = await serverGetPublications<Publication>(200, 120);
  return (
    <PublicationsPageClient initialPublications={initial?.content ?? []} />
  );
}
