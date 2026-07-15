"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthResponse, getStoredUser, clearAuth, storeAuth, login as apiLogin, register as apiRegister, logout as apiLogout } from "./auth";
import type { LoginRequest, RegisterRequest } from "./auth";

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const auth = await apiLogin(data);
    storeAuth(auth);
    setUser(auth);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const auth = await apiRegister(data);
    storeAuth(auth);
    setUser(auth);
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    clearAuth();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
