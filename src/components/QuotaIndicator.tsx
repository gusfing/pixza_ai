"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

interface QuotaData {
  success: boolean;
  plan: string;
  limit: number;
  remaining: number;
  reset: number;
}

export function QuotaIndicator() {
  const [data, setData] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuota = async () => {
    try {
      const res = await fetch("/api/user/quota");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
    // Refresh periodically if we wanted to
    const interval = setInterval(fetchQuota, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 text-xs text-neutral-500">
        <span className="w-3 h-3 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin"></span>
        <span className="hidden sm:inline">Loading quota...</span>
      </div>
    );
  }

  const { plan, remaining, limit } = data;
  const isFree = plan === "FREE";
  
  // limit returned as 999 is unbounded or missing Upstash token
  if (limit === 999) return null;

  const used = Math.max(0, limit - remaining);
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  const isLow = percentage >= 80;
  const isExhausted = remaining <= 0;

  return (
    <div className="flex items-center gap-3 ml-2 mr-2">
      <div className="flex flex-col items-end hidden sm:flex">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={10} className={isExhausted ? "text-red-400 fill-red-400" : "text-yellow-400 fill-yellow-400"} />
          <span className="text-[10px] font-medium text-neutral-300 tracking-wide uppercase">
            {remaining} / {limit} Generations
          </span>
        </div>
        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden relative border border-gray-300">
          <div 
            className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500 ${isExhausted ? 'bg-red-500' : isLow ? 'bg-orange-400' : 'bg-green-400'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {isFree && (
        <Link 
          href="/settings#subscription" 
          className="text-[11px] font-bold px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Upgrade to PRO
        </Link>
      )}
    </div>
  );
}

