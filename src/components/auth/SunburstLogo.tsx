import React from "react";

export function SunburstLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Horizontal rays */}
      <line x1="20" y1="50" x2="40" y2="50" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="50" x2="80" y2="50" stroke="white" strokeWidth="3" strokeLinecap="round" />
      
      {/* Vertical rays */}
      <line x1="50" y1="20" x2="50" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="60" x2="50" y2="80" stroke="white" strokeWidth="3" strokeLinecap="round" />
      
      {/* Diagonal rays */}
      <line x1="28.8" y1="28.8" x2="42.9" y2="42.9" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="57.1" y1="57.1" x2="71.2" y2="71.2" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="71.2" y1="28.8" x2="57.1" y2="42.9" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="42.9" y1="57.1" x2="28.8" y2="71.2" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
