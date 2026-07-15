import api from "./api";
import type { ApiResponse } from "@/types";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactForm(data: ContactFormData) {
  return api.post<ApiResponse<{ id: string; createdAt: string }>>("/public/contact", data);
}
