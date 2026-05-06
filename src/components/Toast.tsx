"use client";

import { useEffect, useState, useCallback } from "react";
import { create } from "zustand";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Copy, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────── */
type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  details?: string | null;
  persistent?: boolean;
  action?: { label: string; onClick: () => void };
}

interface ToastStore {
  toasts: ToastItem[];
  show: (message: string, type?: ToastType, options?: Partial<Omit<ToastItem, "id" | "message" | "type">>) => void;
  success: (message: string, options?: Partial<Omit<ToastItem, "id" | "message" | "type">>) => void;
  error:   (message: string, options?: Partial<Omit<ToastItem, "id" | "message" | "type">>) => void;
  warning: (message: string, options?: Partial<Omit<ToastItem, "id" | "message" | "type">>) => void;
  info:    (message: string, options?: Partial<Omit<ToastItem, "id" | "message" | "type">>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  // Legacy compat
  message: string | null;
  type: ToastType;
  persistent: boolean;
  details: string | null;
  hide: () => void;
}

export const useToast = create<ToastStore>((set, get) => ({
  toasts: [],
  message: null,
  type: "info",
  persistent: false,
  details: null,

  show: (message, type = "info", options = {}) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set(s => ({ toasts: [...s.toasts.slice(-4), { id, message, type, ...options }] }));
    // Legacy compat
    set({ message, type, persistent: options.persistent ?? false, details: options.details ?? null });
    return id;
  },

  success: (message, options) => get().show(message, "success", options),
  error:   (message, options) => get().show(message, "error",   { persistent: true, ...options }),
  warning: (message, options) => get().show(message, "warning", options),
  info:    (message, options) => get().show(message, "info",    options),

  dismiss: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  dismissAll: () => set({ toasts: [] }),

  // Legacy compat
  hide: () => set({ message: null, toasts: [] }),
}));

/* ── Config ─────────────────────────────────────────────────── */
const CONFIG: Record<ToastType, {
  icon: React.ReactNode;
  bar: string;
  bg: string;
  iconColor: string;
  autoClose: number | false;
}> = {
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    bar: "#22c55e",
    bg: "bg-[#0d1117]",
    iconColor: "text-green-400",
    autoClose: 4000,
  },
  error: {
    icon: <AlertCircle className="w-4 h-4" />,
    bar: "#ef4444",
    bg: "bg-[#0d1117]",
    iconColor: "text-red-400",
    autoClose: false, // errors stay until dismissed
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bar: "#f59e0b",
    bg: "bg-[#0d1117]",
    iconColor: "text-amber-400",
    autoClose: 6000,
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    bar: "#7c6af7",
    bg: "bg-[#0d1117]",
    iconColor: "text-violet-400",
    autoClose: 4000,
  },
};

/* ── Single Toast ───────────────────────────────────────────── */
function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exiting, setExiting] = useState(false);
  const cfg = CONFIG[toast.type];

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 250);
  }, [onDismiss]);

  // Auto-close
  useEffect(() => {
    if (toast.persistent || !cfg.autoClose) return;
    const t = setTimeout(dismiss, cfg.autoClose);
    return () => clearTimeout(t);
  }, [toast.persistent, cfg.autoClose, dismiss]);

  const copy = async () => {
    const text = toast.details ? `${toast.message}\n\n${toast.details}` : toast.message;
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "relative flex flex-col rounded-2xl border shadow-2xl shadow-black/60 overflow-hidden transition-all duration-250",
      cfg.bg, "border-white/8",
      exiting ? "opacity-0 translate-x-4 scale-95" : "opacity-100 translate-x-0 scale-100"
    )}>
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl" style={{ background: cfg.bar }} />

      {/* Main row */}
      <div className="flex items-start gap-3 pl-5 pr-3 py-3.5">
        <span className={cn("shrink-0 mt-0.5", cfg.iconColor)}>{cfg.icon}</span>
        <p className="flex-1 text-sm text-white/90 leading-snug">{toast.message}</p>

        <div className="flex items-center gap-1 shrink-0">
          {/* Action button */}
          {toast.action && (
            <button
              onClick={() => { toast.action!.onClick(); dismiss(); }}
              className="text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-colors"
              style={{ color: cfg.bar, background: `${cfg.bar}15` }}
            >
              {toast.action.label}
            </button>
          )}

          {/* Copy */}
          <button onClick={copy}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all"
            title="Copy">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Expand (if details) */}
          {toast.details && (
            <button onClick={() => setExpanded(!expanded)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all"
              title="Details">
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", expanded && "rotate-180")} />
            </button>
          )}

          {/* Dismiss */}
          <button onClick={dismiss}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all"
            title="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Details panel */}
      {toast.details && expanded && (
        <div className="px-5 pb-3.5 border-t border-white/5">
          <pre className="mt-2.5 p-3 rounded-xl bg-black/40 text-[11px] font-mono text-white/50 whitespace-pre-wrap break-words max-h-40 overflow-y-auto leading-relaxed">
            {toast.details}
          </pre>
        </div>
      )}

      {/* Progress bar for auto-close */}
      {!toast.persistent && cfg.autoClose && (
        <div className="h-[2px] bg-white/5">
          <div
            className="h-full rounded-full"
            style={{
              background: cfg.bar,
              animation: `toast-progress ${cfg.autoClose}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Toast Container ────────────────────────────────────────── */
export function Toast() {
  const { toasts, dismiss, message, type, persistent, details, hide } = useToast();

  // Legacy compat: if old-style message is set but no toasts, show it
  useEffect(() => {
    if (message && toasts.length === 0) {
      useToast.getState().show(message, type, { persistent, details });
    }
  }, [message]);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(16px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[500] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto" style={{ animation: "toast-in 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
            <ToastCard toast={toast} onDismiss={() => dismiss(toast.id)} />
          </div>
        ))}

        {/* Dismiss all (when 2+ toasts) */}
        {toasts.length >= 2 && (
          <div className="pointer-events-auto flex justify-end">
            <button
              onClick={() => useToast.getState().dismissAll()}
              className="text-[10px] font-black uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors px-2 py-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
}
