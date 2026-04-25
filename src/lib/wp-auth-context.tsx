"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { wpLogin, wpGetMe, wpValidateToken, WPUser } from "./wordpress";

interface AuthContextType {
  user: WPUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sync token to cookie so middleware can read it
function setTokenCookie(token: string, rememberMe = false) {
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days
  document.cookie = `pixza_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearTokenCookie() {
  document.cookie = "pixza_token=; path=/; max-age=0; SameSite=Lax";
}

export function WPAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<WPUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("pixza_token");
      if (savedToken) {
        try {
          const isValid = await wpValidateToken(savedToken);
          if (isValid) {
            const userData = await wpGetMe(savedToken);
            setToken(savedToken);
            setUser(userData);
            setTokenCookie(savedToken);
          } else {
            localStorage.removeItem("pixza_token");
            clearTokenCookie();
          }
        } catch (error) {
          localStorage.removeItem("pixza_token");
          clearTokenCookie();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (username: string, password: string, rememberMe = false) => {
    setLoading(true);
    try {
      const { token, user } = await wpLogin(username, password);
      localStorage.setItem("pixza_token", token);
      setTokenCookie(token, rememberMe);

      const fullUser = await wpGetMe(token);
      setToken(token);
      setUser(fullUser);
    } catch (err) {
      // If WordPress is unreachable, provide a clear error
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.includes("502") || msg.includes("fetch") || msg.includes("Failed to reach")) {
        throw new Error("Cannot connect to authentication server. Please try again later.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("pixza_token");
    clearTokenCookie();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const t = token ?? localStorage.getItem("pixza_token");
    if (!t) return;
    try {
      const userData = await wpGetMe(t);
      setUser(userData);
    } catch {
      // token expired
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useWPAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useWPAuth must be used within a WPAuthProvider");
  }
  return context;
}
