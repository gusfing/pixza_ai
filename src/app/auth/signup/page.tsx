"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWPAuth } from "@/lib/wp-auth-context";
import { wpRegister } from "@/lib/wordpress";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useWPAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [coupon, setCoupon] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase() + Math.floor(Math.random() * 999);
      const registered = await wpRegister({ username, email, password, name });
      await login(registered.username, password);
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      heading="Join" 
      topRightLink={{ label: "Already have an account?", href: "/auth/signin" }}
    >
      {/* Google sign up */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/api/auth/google-wp-sync" })}
        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-bold text-white mb-6"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign up with Google
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput 
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          required
          autoComplete="name"
        />
        <AuthInput 
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          required
          autoComplete="email"
        />
        <AuthInput 
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 characters"
          required
          autoComplete="new-password"
        />
        <AuthInput 
          label="Promo Code (optional)"
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="LAUNCH50"
        />

        <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium leading-relaxed mt-2">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-white/60 hover:text-white underline underline-offset-4">Terms</Link> &{" "}
          <Link href="/privacy" className="text-white/60 hover:text-white underline underline-offset-4">Privacy Policy</Link>.
        </p>

        {error && (
          <p className="text-xs text-red-500 font-medium tracking-wide">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}
