"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { User } from "@/types";
import { api } from "@/lib/api-client";

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (e: string, p: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}
export const AuthContext = createContext<AuthCtx>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isAdmin: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("ibpl_token");
    const u = localStorage.getItem("ibpl_user");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("ibpl_token", res.token);
    localStorage.setItem("ibpl_user", JSON.stringify(res.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ibpl_token");
    localStorage.removeItem("ibpl_user");
  };

  return { user, token, login, logout, isAdmin: user?.role === "ADMIN" };
}
