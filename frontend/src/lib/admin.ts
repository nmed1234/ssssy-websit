import api from "./api";
import type { ApiResponse, DashboardStats } from "@/types";

export async function getDashboardStats() {
  return api.get<ApiResponse<DashboardStats>>("/admin/dashboard/stats");
}
