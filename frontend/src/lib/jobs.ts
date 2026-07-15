import api from "./api";
import type { ApiResponse, JobVacancy, JobApplication } from "@/types";

export async function getPublishedVacancies(page = 0, size = 20) {
  return api.get<ApiResponse<{ content: JobVacancy[]; totalElements: number; totalPages: number; number: number }>>(`/public/jobs?page=${page}&size=${size}`);
}

export async function getVacancyBySlug(slug: string) {
  return api.get<ApiResponse<JobVacancy>>(`/public/jobs/${slug}`);
}

export async function submitApplication(jobVacancyId: string, data: { firstName: string; lastName: string; email: string; phone?: string; coverLetter?: string }) {
  return api.post<ApiResponse<JobApplication>>(`/public/jobs/${jobVacancyId}/apply`, data);
}
