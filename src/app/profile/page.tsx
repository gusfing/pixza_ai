"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  LayoutGrid, 
  Sparkles, 
  Workflow, 
  Settings as SettingsIcon, 
  Plus,
  Box
} from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: <LayoutGrid className="w-5 h-5" /> },
  { id: "generations", label: "Generations", icon: <Sparkles className="w-5 h-5" /> },
  { id: "workflows", label: "Workflows", icon: <Workflow className="w-5 h-5" /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon className="w-5 h-5" /> },
];

/* ── Minimal Dashboard Layout ── */
function DashboardSidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-64px)] p-6 gap-2 sticky top-16">
      <div className="flex items-center gap-3 p-4 mb-4 rounded-3xl glass-panel">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-bold">L</div>
        <div className="flex flex-col">
          <span className="text-white text-sm font-bold">Lekh Labs</span>
          <span className="text-white/30 text-xs">Free Member</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
              active === item.id 
                ? "bg-white text-black" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            {item.icon}
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link href="/studio" className="btn-minimal btn-minimal-primary w-full py-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>
    </aside>
  );
}

function Overview() {
  const stats = [
    { label: "Generations", value: "247" },
    { label: "Workflows", value: "8" },
    { label: "Models Used", value: "14" },
  ];

  const recentItems = [
    { id: 1, title: "Abstract Flow", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=500" },
    { id: 2, title: "Neural Mesh", img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=500" },
    { id: 3, title: "Glass Architecture", img: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=500" },
  ];

  return (
    <div className="animate-obsidian space-y-12">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="p-8 rounded-[32px] glass-panel flex flex-col items-center text-center">
            <span className="text-4xl font-black text-white mb-2 tracking-tighter">{s.value}</span>
            <span className="text-white/30 text-xs font-bold uppercase tracking-widest">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Recent Work */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Recent Projects</h2>
          <button className="text-white/40 hover:text-white text-sm transition-colors">View all</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentItems.map((item) => (
            <div key={item.id} className="obsidian-card group h-80 relative flex flex-col justify-end p-8 cursor-pointer">
              <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
              <div className="relative z-10">
                <span className="text-lg font-bold text-white">{item.title}</span>
                <p className="text-white/40 text-xs font-medium">Modified 2h ago</p>
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
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-white selection:text-black">
      {/* Dashboard Nav */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-[100]">
        <Link href="/landing" className="flex items-center gap-3">
          <img src="/pixza-logo.png" alt="Pixza" className="w-5 h-5 invert" />
          <span className="font-bold tracking-tight">Pixza Studio</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Box className="w-4 h-4 text-white/50" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex">
        <DashboardSidebar active={active} setActive={setActive} />
        
        <main className="flex-1 p-6 md:p-12">
          {active === "overview" && <Overview />}
          {active !== "overview" && (
            <div className="h-96 flex flex-col items-center justify-center text-center opacity-20 animate-obsidian">
              <Sparkles className="w-12 h-12 mb-4" />
              <p className="text-xl font-bold">Refining this section...</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] glass-panel rounded-full p-2 flex justify-between z-[100]">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`p-3 rounded-full transition-colors ${
              active === item.id ? "bg-white text-black" : "text-white/40"
            }`}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
