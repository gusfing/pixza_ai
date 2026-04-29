"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-white tracking-tighter mb-2">Something went wrong</h1>
      <p className="text-white/40 text-sm mb-8 max-w-sm">
        {error.message || "An unexpected error occurred. Our team has been notified."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all"
        >
          Try again
        </button>
        <Link
          href="/create"
          className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-bold hover:text-white hover:border-white/20 transition-all"
        >
          Go home
        </Link>
      </div>
      {error.digest && (
        <p className="text-white/15 text-[10px] mt-6 font-mono">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
