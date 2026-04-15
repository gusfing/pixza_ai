import React from "react";

interface CircularAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loading?: boolean;
}

export function CircularAuthButton({ label, loading, ...props }: CircularAuthButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-24 h-24 rounded-full bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-center px-2 leading-tight"
    >
      {loading ? "..." : label}
    </button>
  );
}
