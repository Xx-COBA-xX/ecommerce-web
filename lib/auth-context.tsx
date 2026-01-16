"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiClient } from "./api-client";
import { tokenStorage, userStorage } from "./auth-utils";
import type {
  User,
  LoginCredentials,
  AuthContextType,
  LoginResponse,
} from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and token from storage on mount
  useEffect(() => {
    const storedToken = tokenStorage.get();
    const storedUser = userStorage.get();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log("🔐 Attempting login with:", { email: credentials.email });
      console.log(
        "📡 API URL:",
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      );

      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials
      );

      console.log("✅ Login response:", response.data);
      const { access_token, user: userData } = response.data;

      // Store token and user
      tokenStorage.set(access_token);
      userStorage.set(userData);

      setToken(access_token);
      setUser(userData);

      console.log("✅ Login successful, user:", userData);
    } catch (error: any) {
      console.error("❌ Login error:", error);
      console.error("❌ Error response:", error.response?.data);
      throw new Error(error.response?.data?.message || "فشل تسجيل الدخول");
    }
  };

  const logout = () => {
    tokenStorage.remove();
    userStorage.remove();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
