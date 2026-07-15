import api from "./api";

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

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

export async function refreshToken(token: string): Promise<AuthResponse> {
  const response = await api.post("/auth/refresh", { refreshToken: token });
  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export function storeAuth(auth: AuthResponse): void {
  localStorage.setItem("accessToken", auth.accessToken);
  localStorage.setItem("refreshToken", auth.refreshToken);
  localStorage.setItem("user", JSON.stringify(auth));
  setCookie("accessToken", auth.accessToken);
  setCookie("refreshToken", auth.refreshToken);
}

export function clearAuth(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  removeCookie("accessToken");
  removeCookie("refreshToken");
}

export function getStoredUser(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
}
