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
      className="btn-icon"
      style={{ width: 30, height: 30, opacity: disabled ? 0.4 : 1 }}
      title="Back"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );
}
