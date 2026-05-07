"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AlertCircle } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign-in link is no longer valid. It may have been used already or it may have expired.",
  OAuthSignin: "Could not sign in with that provider. Please try again.",
  OAuthCallback: "Could not complete sign in. Please try again.",
  Default: "An unexpected error occurred. Please try again.",
};

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-400 mb-1">Authentication Error</p>
          <p className="text-xs text-red-400/70 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Link href="/auth/signin" className="w-full py-3 rounded-2xl bg-white text-black text-sm font-black text-center hover:bg-white/90 transition-all">
          Try Again
        </Link>
        <Link href="/" className="text-center text-xs text-white/30 hover:text-white transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <AuthLayout heading="Error" topRightLink={{ label: "Sign in", href: "/auth/signin" }}>
      <Suspense fallback={<div className="h-32" />}>
        <ErrorContent />
      </Suspense>
    </AuthLayout>
  );
}
