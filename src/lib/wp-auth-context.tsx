"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { wpLogin, wpGetMe, wpValidateToken, WPUser } from "./wordpress";

interface AuthContextType {
  user: WPUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sync token to cookie so middleware can read it
function setTokenCookie(token: string) {
  document.cookie = `pixza_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
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
          console.error("Failed to load user:", error);
          localStorage.removeItem("pixza_token");
          clearTokenCookie();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const { token, user } = await wpLogin(username, password);
      localStorage.setItem("pixza_token", token);
      setTokenCookie(token);

      const fullUser = await wpGetMe(token);
      setToken(token);
      setUser(fullUser);
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
