import React from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AuthInput({ label, ...props }: AuthInputProps) {
  return (
    <div className="flex flex-col gap-2 w-full mb-6">
      <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
        {label}
      </label>
      <input
        {...props}
        className="bg-transparent border-b border-white/20 text-white py-2 outline-none focus:border-white transition-colors placeholder:text-white/10 text-lg"
      />
    </div>
  );
}
