import { serverGetPublishedVacancies } from "@/lib/server-api";
import type { JobVacancy } from "@/types";
import JobsPageClient from "./JobsPageClient";

export const revalidate = 60;

export const metadata = {
  title: "Job Vacancies | SSSS",
  description: "Explore career opportunities at the Soil Science Society of Syria and partner organizations.",
};

export default async function JobsPage() {
  const initial = await serverGetPublishedVacancies<JobVacancy>(0, 20, 60);
  return (
    <JobsPageClient
      initialVacancies={initial?.content ?? []}
      initialTotalPages={initial?.totalPages ?? 0}
    />
  );
}
