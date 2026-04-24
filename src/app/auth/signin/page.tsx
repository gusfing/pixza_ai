"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useWPAuth } from "@/lib/wp-auth-context";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { CircularAuthButton } from "@/components/auth/CircularAuthButton";
import { signIn } from "next-auth/react";

function GoogleButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-bold text-white disabled:opacity-50"
    >
      {/* Google SVG */}
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">or</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useWPAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const next = searchParams.get("next") || "/create";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(username, password, rememberMe);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: next });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col relative pb-5">
      {/* Google button */}
      <GoogleButton loading={googleLoading} onClick={handleGoogle} />

      <Divider />

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

        <Link href="/auth/forgot-password" className="text-[10px] text-white/40 uppercase tracking-widest font-semibold hover:text-white transition-colors">
          Forgot?
        </Link>
      </div>

      {error && (
        <p className="mt-8 text-xs text-red-500 font-medium tracking-wide">{error}</p>
      )}

      <div className="mt-16 md:absolute md:-bottom-24 md:right-0">
        <CircularAuthButton type="submit" label="Sign In" loading={loading} />
      </div>
    </form>
  );
}

export default function SignInPage() {
  return (
    <AuthLayout heading="Login" topRightLink={{ label: "Create an account", href: "/auth/signup" }}>
      <Suspense fallback={<div className="h-48" />}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}