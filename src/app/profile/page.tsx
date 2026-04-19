"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, 
  Sparkles, 
  Workflow, 
  Settings as SettingsIcon, 
  Plus,
  Box,
  CreditCard,
  Zap,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard", icon: <LayoutGrid className="w-5 h-5" /> },
  { id: "generations", label: "My Assets", icon: <Sparkles className="w-5 h-5" /> },
  { id: "workflows", label: "Flows", icon: <Workflow className="w-5 h-5" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="w-5 h-5" /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon className="w-5 h-5" /> },
];

/* ── Shared Sub-components ────────────────────────────────── */

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-4xl font-black tracking-tighter text-white leading-none mb-2">{title}</h2>
        {subtitle && <p className="text-white/30 text-xs font-medium uppercase tracking-[0.2em]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, trend, icon }: { label: string; value: string; trend?: string; icon: React.ReactNode }) {
  return (
    <div className="p-8 rounded-[32px] glass-panel relative overflow-hidden group">
      <div className="absolute top-6 right-6 text-white/10 group-hover:text-white/20 transition-colors">
        {icon}
      </div>
      <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">
        {label}
      </span>
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
        {trend && (
          <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  return (
    <aside className="hidden lg:flex flex-col w-72 h-[calc(100vh-64px)] p-8 gap-1 sticky top-16 border-r border-white/5">
      <div className="p-6 mb-8 rounded-[32px] glass-panel border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#0A0A0A] font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            L
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black tracking-tight">Lekh Labs</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Pro Member</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
            <span>Quota</span>
            <span>82%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div className="h-full bg-white rounded-full w-[82%] shadow-[0_0_10px_white]" />
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={cn(
              "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold",
              active === item.id 
                ? "bg-white text-[#0A0A0A] shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)]" 
                : "text-white/30 hover:text-white hover:bg-white/5"
            )}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
            {active === item.id && <ChevronRight className="ml-auto w-4 h-4" />}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <Link href="/studio" className="btn-minimal btn-minimal-primary w-full py-4 rounded-3xl text-sm flex items-center gap-3">
          <Plus className="w-5 h-5" />
          Create New
        </Link>
      </div>
    </aside>
  );
}

/* ── Tab Views ────────────────────────────────────────────── */

function DashboardOverview() {
  const recentWork = [
    { id: 1, title: "Abstract Neural Flow", type: "Video", date: "2h ago", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600" },
    { id: 2, title: "Cyber Architecture", type: "Image", date: "5h ago", img: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=600" },
    { id: 3, title: "Glass Distortion 04", type: "Image", date: "1d ago", img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=600" },
  ];

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Neural Credits" value="12,480" trend="+2.4k" icon={<Zap className="w-8 h-8" />} />
        <StatCard label="Total Generations" value="1,842" trend="+142" icon={<Sparkles className="w-8 h-8" />} />
        <StatCard label="Active Flows" value="14" icon={<Workflow className="w-8 h-8" />} />
      </div>

      <div>
        <SectionHeader 
          title="Recent Activity" 
          subtitle="Your latest neural snapshots" 
          action={<Link href="/profile?tab=generations" className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">View Full Vault <ArrowUpRight className="w-3 h-3" /></Link>}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentWork.map((item) => (
            <div key={item.id} className="obsidian-card group aspect-[4/5] relative flex flex-col justify-end p-8 cursor-pointer border border-white/5">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 opacity-50 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
              </div>
              
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white/60">
                    {item.type}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tighter group-hover:translate-x-1 transition-transform">{item.title}</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [active, setActive] = useState("overview");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-white selection:text-[#0A0A0A] font-sans antialiased">
      {/* Premium Navigation */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-[100]">
        <Link href="/landing" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <img src="/pixza-logo.png" alt="" className="w-4 h-4 invert" />
          </div>
          <span className="text-lg font-black tracking-tighter">Pixza Studio</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/40">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            System Status: Optimal
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lekh" alt="User" />
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto flex">
        <Sidebar active={active} setActive={setActive} />
        
        <main className="flex-1 p-8 md:p-16 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {active === "overview" && <DashboardOverview />}
              {active !== "overview" && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 glass-panel rounded-[40px] flex items-center justify-center mb-8 animate-pulse">
                    <Sparkles className="w-10 h-10 text-white/20" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-white mb-4">Neural Refactoring.</h2>
                  <p className="text-white/30 text-sm font-medium uppercase tracking-[0.2em] max-w-sm leading-relaxed">
                    The {active} engine is currently being optimized for elite tier performance.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Nav Overlay */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="glass-panel rounded-full p-2 flex items-center gap-1 shadow-2xl">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={cn(
                "p-3 rounded-full transition-all",
                active === item.id ? "bg-white text-[#0A0A0A]" : "text-white/40 hover:text-white"
              )}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
