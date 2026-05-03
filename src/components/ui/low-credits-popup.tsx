"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, AlertTriangle, ArrowRight } from "lucide-react";
import { useWPAuth } from "@/lib/wp-auth-context";

const LOW_CREDITS_THRESHOLD = 0.20; // show when < 20% remaining
const DISMISSED_KEY = "pixza_low_credits_dismissed";

export function LowCreditsPopup() {
  const { user } = useWPAuth();
  const [visible, setVisible] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!user) return;

    const credits = user.meta?.credits ?? 0;
    const limit   = user.meta?.credits_limit ?? 100;
    const plan    = user.meta?.plan ?? "free";

    // Don't show for agency (they know what they're doing)
    if (plan === "agency") return;

    const ratio = limit > 0 ? credits / limit : 0;
    setPct(Math.round(ratio * 100));

    if (ratio < LOW_CREDITS_THRESHOLD) {
      // Only show once per session
      const key = `${DISMISSED_KEY}_${user.id}`;
      if (!sessionStorage.getItem(key)) {
        setVisible(true);
      }
    }
  }, [user]);

  const dismiss = () => {
    if (user) sessionStorage.setItem(`${DISMISSED_KEY}_${user.id}`, "1");
    setVisible(false);
  };

  if (!visible || !user) return null;

  const plan = user.meta?.plan ?? "free";
  const credits = user.meta?.credits ?? 0;
  const isAlmostOut = credits <= 5;

  return (
    <div className="fixed bottom-6 right-6 z-[500] max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className={`relative border rounded-2xl p-5 shadow-2xl shadow-black/50 ${
        isAlmostOut
          ? "bg-red-950/80 border-red-500/40"
          : "bg-[#161b22] border-amber-500/30"
      }`}>
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Icon + title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isAlmostOut ? "bg-red-500/20" : "bg-amber-500/20"
          }`}>
            <AlertTriangle className={`w-4 h-4 ${isAlmostOut ? "text-red-400" : "text-amber-400"}`} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">
              {isAlmostOut ? "Almost out of credits!" : "Running low on credits"}
            </h3>
            <p className={`text-xs mt-0.5 ${isAlmostOut ? "text-red-300/70" : "text-amber-300/70"}`}>
              {credits} credits remaining ({pct}%)
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all ${isAlmostOut ? "bg-red-400" : "bg-amber-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Message */}
        <p className="text-xs text-white/50 leading-relaxed mb-4">
          {plan === "free"
            ? "Upgrade to Pro for 3,000 credits/month — 30× more than your current plan."
            : "Upgrade to Agency for 8,000 credits/month and unlock Veo 3 video."}
        </p>

        {/* CTA */}
        <div className="flex gap-2">
          <Link
            href="/settings#billing"
            onClick={dismiss}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-black transition-all ${
              isAlmostOut
                ? "bg-red-500 hover:bg-red-400"
                : "bg-amber-500 hover:bg-amber-400"
            }`}
          >
            {plan === "free" ? "Upgrade to Pro" : "Upgrade to Agency"}
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={dismiss}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/30 text-xs font-bold hover:text-white/60 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
