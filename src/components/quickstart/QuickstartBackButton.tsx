"use client";

interface QuickstartBackButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function QuickstartBackButton({ onClick, disabled = false }: QuickstartBackButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Back"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        color: disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.5)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.5)"; }}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back
    </button>
  );
}
