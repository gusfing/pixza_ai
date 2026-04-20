"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useWPAuth } from "@/lib/wp-auth-context";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { CircularAuthButton } from "@/components/auth/CircularAuthButton";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useWPAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(username, password);
      const next = searchParams.get("next") || "/create";
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      heading="Login" 
      topRightLink={{ label: "Create an account", href: "/auth/signup" }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col relative pb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          <AuthInput 
            label="Email or Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="mark.johnson@gmail.com"
            required
            autoComplete="username"
          />
          <AuthInput 
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div 
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                rememberMe ? "border-white bg-white text-black" : "border-white/20 group-hover:border-white/50"
              }`}
            >
              {rememberMe && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold group-hover:text-white transition-colors">
              Remember me
            </span>
          </label>

          <Link 
            href="/auth/forgot-password" 
            className="text-[10px] text-white/40 uppercase tracking-widest font-semibold hover:text-white transition-colors"
          >
            Forgot?
          </Link>
        </div>

        {error && (
          <p className="mt-8 text-xs text-red-500 font-medium tracking-wide">
            {error}
          </p>
        )}

        {/* Circular Sign In Button - Bottom Right */}
        <div className="mt-16 md:absolute md:-bottom-24 md:right-0">
          <CircularAuthButton 
            type="submit" 
            label="Sign In" 
            loading={loading}
          />
        </div>
      </form>
    </AuthLayout>
  );
}
