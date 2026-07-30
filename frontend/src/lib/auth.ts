import api from "./api";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  tokenType: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstNameAr?: string;
  lastNameAr?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  phone?: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post("/auth/login", data);
  return response.data.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post("/auth/register", data);
  return response.data.data;
}

export async function refreshToken(): Promise<AuthResponse> {
  // The httpOnly refreshToken cookie is sent automatically via withCredentials.
  // No need to pass it in the body.
  const response = await api.post("/auth/refresh", {});
  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

/**
 * Persist the non-sensitive user profile (userId, username, role) to
 * localStorage so the UI can display user info without a round-trip.
 * Token storage is handled exclusively by httpOnly cookies set by the backend.
 */
export function storeAuth(auth: AuthResponse): void {
  localStorage.setItem("user", JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem("user");
}

export function getStoredUser(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

/**
 * A user is considered authenticated client-side if the user profile object
 * is present in localStorage. The actual auth gate is the httpOnly accessToken
 * cookie validated by the backend on every request.
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("user");
}
