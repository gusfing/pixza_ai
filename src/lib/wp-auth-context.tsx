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

export function WPAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<WPUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("pixza_token");
      if (savedToken) {
        try {
          // Verify token
          const isValid = await wpValidateToken(savedToken);
          if (isValid) {
            const userData = await wpGetMe(savedToken);
            setToken(savedToken);
            setUser(userData);
          } else {
            localStorage.removeItem("pixza_token");
          }
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem("pixza_token");
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
      
      // Fetch full user data after login
      const fullUser = await wpGetMe(token);
      setToken(token);
      setUser(fullUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("pixza_token");
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
