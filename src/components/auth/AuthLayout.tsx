import React from "react";
import { SunburstLogo } from "./SunburstLogo";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  heading: string;
  topRightLink: {
    label: string;
    href: string;
  };
}

export function AuthLayout({ children, heading, topRightLink }: AuthLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
      {/* Left Pane - Branding & Graphic */}
      <div className="hidden md:flex flex-col w-1/2 relative p-12 border-r border-white/5 overflow-hidden">
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white"></div>
          <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[80%] h-[80%] border border-white rounded-full opacity-20"></div>
          </div>
        </div>

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight">Pixza Studio</span>
          <span className="text-[10px] text-white/30 align-top mt-1">®</span>
        </div>

        {/* Center Logo */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <SunburstLogo className="w-64 h-64 opacity-90 animate-pulse" />
        </div>

        {/* Bottom Rights */}
        <div className="relative z-10 text-[10px] text-white/20 tracking-wider">
          © Pixza Studio 2024. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Form Area */}
      <div className="flex-1 flex flex-col relative bg-[#040406]">
        {/* Top Right Navigation */}
        <div className="absolute top-8 right-8 z-20">
          <Link 
            href={topRightLink.href}
            className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest font-semibold"
          >
            {topRightLink.label}
          </Link>
        </div>

        {/* Mobile Branding (only visible on small screens) */}
        <div className="md:hidden p-8 flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
                <SunburstLogo className="w-full h-full" />
            </div>
          <span className="text-sm font-bold tracking-tight">Pixza Studio</span>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-24 py-20 relative max-w-3xl mx-auto w-full">
          <h1 className="text-6xl md:text-8xl font-medium tracking-tighter mb-16 text-white overflow-visible">
            {heading}
          </h1>

          {children}
        </div>
      </div>
    </div>
  );
}
