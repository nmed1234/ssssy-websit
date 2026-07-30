import { serverGetVacancyBySlug, serverGetPublishedVacancies } from "@/lib/server-api";
import type { JobVacancy } from "@/types";
import JobDetailClient from "./JobDetailClient";

export const revalidate = 300;

export async function generateStaticParams() {
  const result = await serverGetPublishedVacancies<JobVacancy>(0, 20, 3600);
  if (!result?.content) return [];
  return result.content.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const job = await serverGetVacancyBySlug<JobVacancy>(params.slug, 300);
  if (!job) return { title: "Job Vacancy | SSSS" };
  return {
    title: `${job.titleEn || job.titleAr} | SSSS`,
    description: job.description || "Job vacancy at the Soil Science Society of Syria.",
    openGraph: {
      title: job.titleEn || job.titleAr || "",
      description: job.description || "",
    },
  };
}

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const job = await serverGetVacancyBySlug<JobVacancy>(params.slug, 300);
  return <JobDetailClient initialJob={job} />;
}
