"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { CircularAuthButton } from "@/components/auth/CircularAuthButton";
import { Check } from "lucide-react";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError("");
    try {
      // WordPress handles password reset via its built-in system
      const res = await fetch(`${WP_URL}/?rest_route=${encodeURIComponent("/pixza/v1/forgot-password")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Whether or not the email exists, we show success (security best practice)
      setSent(true);
    } catch {
      // Still show success to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-6">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Check className="w-7 h-7 text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white mb-2">Check your inbox</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            If an account exists for <span className="text-white/70">{email}</span>, you'll receive a reset link shortly.
          </p>
        </div>
        <Link href="/auth/signin" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
          ← Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col relative pb-5">
      <AuthInput
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        autoComplete="email"
      />

      {error && (
        <p className="mt-6 text-xs text-red-500 font-medium">{error}</p>
      )}

      <div className="mt-4">
        <Link href="/auth/signin" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
          ← Back to Sign In
        </Link>
      </div>

      <div className="mt-16 md:absolute md:-bottom-24 md:right-0">
        <CircularAuthButton type="submit" label="Send Link" loading={loading} />
      </div>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      heading="Reset"
      topRightLink={{ label: "Sign in", href: "/auth/signin" }}
    >
      <Suspense fallback={<div className="h-48" />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
