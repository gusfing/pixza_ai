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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0d1117] text-white font-sans selection:bg-white selection:text-black antialiased overflow-hidden">
      {/* Grain Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[300] opacity-[0.03]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* Left Pane - Branding & Graphic */}
      <div className="hidden lg:flex flex-col w-[45%] relative p-16 border-r border-white/5 overflow-hidden">
        {/* Cinematic Background Visual */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0d1117]/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2564" 
            alt="Abstract Architecture" 
            className="w-full h-full object-cover grayscale opacity-40 scale-105 animate-pulse-slow"
          />
        </div>

        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-10">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white"></div>
          <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[80%] h-[80%] border border-white rounded-full opacity-20"></div>
          </div>
        </div>

        {/* Top Branding */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <img src="/pixza-logo.png" alt="" className="w-5 h-5 invert" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter leading-none">Pixza</span>
            <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Studio Engine</span>
          </div>
        </div>

        {/* Center Logo / Focus */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-20">
          <div className="w-full max-w-sm space-y-6">
            <h2 className="text-4xl font-black tracking-tighter leading-tight">
              Design the <br/> future of neural <br/> generation.
            </h2>
            <div className="h-px w-12 bg-white/20" />
            <p className="text-white/40 text-sm font-medium leading-relaxed">
              Experience the world's first minimalist canvas for multi-modal generative pipelines.
            </p>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="relative z-20 flex items-center justify-between text-[10px] text-white/20 tracking-wider font-bold uppercase">
          <span>© Pixza Studio 2026</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Pane - Form Area */}
      <div className="flex-1 flex flex-col relative bg-[#0d1117] overflow-y-auto custom-scrollbar">
        {/* Top Right Navigation */}
        <div className="absolute top-12 right-12 z-20">
          <Link 
            href={topRightLink.href}
            className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-[0.2em] font-black flex items-center gap-3"
          >
            <span className="w-8 h-px bg-white/10" />
            {topRightLink.label}
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-24 py-32 relative max-w-3xl mx-auto w-full">
          <header className="mb-20">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 block mb-6">
              Authentication Portal
            </span>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white leading-[0.8]">
              {heading}.
            </h1>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

