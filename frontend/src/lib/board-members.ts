import api from "./api";
import type { ApiResponse, BoardMember } from "@/types";

/** Fetch all active board members (public endpoint, no auth needed). */
export async function getPublicBoardMembers() {
  return api.get<ApiResponse<BoardMember[]>>("/public/board-members");
}
