"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PROMO_KEY = "pixza_promo_dismissed_v1";
const PROMO_DELAY_MS = 8000; // show after 8s

export function PromoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(PROMO_KEY)) return;
    const t = setTimeout(() => setVisible(true), PROMO_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(PROMO_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[500] max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="relative bg-[#161b22] border border-violet-500/30 rounded-2xl p-5 shadow-2xl shadow-black/50">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
            🎉 Limited Offer
          </span>
        </div>

        {/* Content */}
        <h3 className="text-base font-black text-white tracking-tight mb-1">
          Get 3,000 credits for ₹999
        </h3>
        <p className="text-xs text-white/50 leading-relaxed mb-4">
          Upgrade to Pro and unlock FLUX Dev, Imagen 4, Seedance video, and no watermarks.
        </p>

        {/* Features */}
        <div className="flex flex-col gap-1.5 mb-4">
          {["3,000 credits/month", "FLUX Dev + Imagen 4", "Seedance video", "No watermarks"].map(f => (
            <div key={f} className="flex items-center gap-2 text-xs text-white/60">
              <Zap className="w-3 h-3 text-violet-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <Link
            href="/settings#billing"
            onClick={dismiss}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-violet-500 text-white text-xs font-black hover:bg-violet-400 transition-all"
          >
            Upgrade Now <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={dismiss}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/30 text-xs font-bold hover:text-white/60 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
