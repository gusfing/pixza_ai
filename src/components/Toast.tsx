"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";

interface ToastState {
  message: string | null;
  type: "info" | "success" | "warning" | "error";
  persistent: boolean;
  details: string | null;
  show: (message: string, type?: "info" | "success" | "warning" | "error", persistent?: boolean, details?: string | null) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  type: "info",
  persistent: false,
  details: null,
  show: (message, type = "info", persistent = false, details = null) => set({ message, type, persistent, details }),
  hide: () => set({ message: null, persistent: false, details: null }),
}));

const typeStyles = {
  info:    { bar: "#92dce5", bg: "var(--surface-1)", text: "var(--text-1)" },
  success: { bar: "#4ade80", bg: "var(--surface-1)", text: "var(--text-1)" },
  warning: { bar: "#fbbf24", bg: "var(--surface-1)", text: "var(--text-1)" },
  error:   { bar: "var(--action)", bg: "var(--surface-1)", text: "var(--text-1)" },
};

const typeIcons = {
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function Toast() {
  const { message, type, persistent, details, hide } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Reset expanded state when toast changes
    setIsExpanded(false);
    setCopied(false);
  }, [message]);

  const handleCopy = async () => {
    const textToCopy = details ? `${message}\n\n${details}` : message;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (message && !persistent) {
      const timer = setTimeout(() => {
        hide();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, persistent, hide]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[200] max-w-sm anim-slide-up">
      <div
        className="flex flex-col rounded-xl overflow-hidden"
        style={{
          background: typeStyles[type].bg,
          border: "1px solid var(--border-md)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          borderLeft: `3px solid ${typeStyles[type].bar}`,
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <span style={{ color: typeStyles[type].bar }}>{typeIcons[type]}</span>
          <span className="text-sm flex-1" style={{ color: "var(--text-1)" }}>{message}</span>
          <button onClick={handleCopy} className="btn-icon" style={{ width: 26, height: 26 }} title="Copy">
            {copied
              ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            }
          </button>
          <button onClick={hide} className="btn-icon" style={{ width: 26, height: 26 }} title="Dismiss">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {details && (
          <>
            <button onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-1.5 text-xs text-left transition-colors"
              style={{ color: "var(--text-3)", borderTop: "1px solid var(--border)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-2)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}
            >
              {isExpanded ? "Hide details" : "Show details"}
            </button>
            {isExpanded && (
              <div className="px-4 pb-3">
                <pre className="rounded-lg p-2 max-h-40 overflow-auto text-xs font-mono whitespace-pre-wrap break-words"
                  style={{ background: "rgba(0,0,0,0.4)", color: "var(--text-2)" }}>
                  {details}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
