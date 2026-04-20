"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWPAuth } from "@/lib/wp-auth-context";
import { wpRegister } from "@/lib/wordpress";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { CircularAuthButton } from "@/components/auth/CircularAuthButton";

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
      <form onSubmit={handleSubmit} className="flex flex-col relative pb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
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
            label="Promo Code"
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="OPTIONAL"
          />
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium leading-relaxed max-w-sm">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-white/60 hover:text-white underline underline-offset-4">Terms</Link> &{" "}
            <Link href="/privacy" className="text-white/60 hover:text-white underline underline-offset-4">Privacy Policy</Link>.
          </p>
        </div>

        {error && (
          <p className="mt-8 text-xs text-red-500 font-medium tracking-wide">
            {error}
          </p>
        )}

        {/* Circular Sign Up Button - Bottom Right */}
        <div className="mt-16 md:absolute md:-bottom-24 md:right-0">
          <CircularAuthButton 
            type="submit" 
            label="Sign Up" 
            loading={loading}
          />
        </div>
      </form>
    </AuthLayout>
  );
}
