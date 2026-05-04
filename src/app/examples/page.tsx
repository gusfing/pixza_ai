"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Text→Image", "Image→Image", "Image→Video", "Text→Video", "Image→3D"];

const EXAMPLES = [
  { title: "Cinematic Product Shot", mode: "Text→Image", model: "FLUX Pro", provider: "fal", author: "sarah_creates", likes: 142, emoji: "📦", bg: "from-[#0a1628] to-[#0d2040]", accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", prompt: "A luxury perfume bottle on a marble surface, cinematic lighting, 8K" },
  { title: "Watercolor Portrait", mode: "Image→Image", model: "FLUX Dev", provider: "fal", author: "aiartist_jo", likes: 89, emoji: "🎨", bg: "from-[#1a0a08] to-[#2d1208]", accent: "text-red-400 bg-red-500/10 border-red-500/20", prompt: "Transform into a soft watercolor painting with warm tones" },
  { title: "Product Animation", mode: "Image→Video", model: "Kling 1.6", provider: "fal", author: "motion_rex", likes: 203, emoji: "▶", bg: "from-[#0f0a1a] to-[#1a0d2e]", accent: "text-purple-400 bg-purple-500/10 border-purple-500/20", prompt: "Slow 360 rotation, studio lighting, product reveal" },
  { title: "City Timelapse", mode: "Text→Video", model: "Veo 2", provider: "gemini", author: "devmike", likes: 67, emoji: "🌆", bg: "from-[#081428] to-[#0a1e3a]", accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", prompt: "Timelapse of a futuristic city at night, neon lights, rain" },
  { title: "Sneaker 3D Model", mode: "Image→3D", model: "Trellis", provider: "fal", author: "productlead", likes: 178, emoji: "👟", bg: "from-[#141414] to-[#1e1e1e]", accent: "text-white/60 bg-white/5 border-white/10", prompt: "High-quality 3D model from product photo" },
  { title: "Fantasy Landscape", mode: "Text→Image", model: "Gemini Imagen 4", provider: "gemini", author: "ux_nina", likes: 94, emoji: "🏔", bg: "from-[#080a14] to-[#0c1020]", accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", prompt: "Epic fantasy mountain landscape, golden hour, dramatic clouds" },
  { title: "Style Transfer", mode: "Image→Image", model: "IP Adapter", provider: "fal", author: "sarah_creates", likes: 156, emoji: "🖼", bg: "from-[#0a1a0a] to-[#0d2a0d]", accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", prompt: "Apply Van Gogh Starry Night style to portrait" },
  { title: "Brand Video", mode: "Text→Video", model: "Kling 1.6", provider: "fal", author: "motion_rex", likes: 112, emoji: "🎬", bg: "from-[#1a0f0a] to-[#2a1a0d]", accent: "text-orange-400 bg-orange-500/10 border-orange-500/20", prompt: "Minimalist brand reveal, logo animation, clean white background" },
  { title: "Architecture Viz", mode: "Text→Image", model: "FLUX Realism", provider: "fal", author: "devmike", likes: 88, emoji: "🏛", bg: "from-[#0a0a14] to-[#14142a]", accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", prompt: "Modern glass building exterior, sunset, architectural photography" },
  { title: "Character 3D", mode: "Image→3D", model: "Zero123", provider: "fal", author: "aiartist_jo", likes: 234, emoji: "🧊", bg: "from-[#0a1414] to-[#0d2020]", accent: "text-white/60 bg-white/5 border-white/10", prompt: "Full 3D character model from concept art" },
  { title: "Food Photography", mode: "Text→Image", model: "FLUX Schnell", provider: "fal", author: "ux_nina", likes: 71, emoji: "🍜", bg: "from-[#1a0a0a] to-[#2a1010]", accent: "text-red-400 bg-red-500/10 border-red-500/20", prompt: "Ramen bowl, steam rising, dark moody restaurant lighting" },
  { title: "Nature Animation", mode: "Image→Video", model: "Wan I2V", provider: "fal", author: "productlead", likes: 145, emoji: "🌿", bg: "from-[#0a1a0a] to-[#0d2a0d]", accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", prompt: "Gentle wind through forest leaves, golden hour" },
];

function ExCard({ ex, onClick }: { ex: typeof EXAMPLES[0]; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-2xl overflow-hidden cursor-pointer border border-white/7",
        "bg-gradient-to-br aspect-[4/3] flex flex-col justify-end p-4",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.6)]",
        ex.bg
      )}
    >
      {/* Emoji bg */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-5xl opacity-20 pointer-events-none select-none">
        {ex.emoji}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
        <span className="px-4 py-2 rounded-xl bg-white text-black text-sm font-black">Try this →</span>
      </div>

      {/* Info */}
      <div className="relative z-10">
        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border inline-block mb-1.5", ex.accent)}>
          {ex.mode}
        </span>
        <div className="text-sm font-bold text-white">{ex.title}</div>
        <div className="text-[11px] text-white/35 mt-0.5">{ex.model} · @{ex.author}</div>
      </div>
    </div>
  );
}

function Modal({ ex, onClose }: { ex: typeof EXAMPLES[0]; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[#161b22] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Preview */}
        <div className={cn("aspect-video flex items-center justify-center text-7xl opacity-40 bg-gradient-to-br", ex.bg)}>
          {ex.emoji}
        </div>

        <div className="p-7">
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border inline-block mb-2", ex.accent)}>
                {ex.mode}
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">{ex.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/7 mb-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1.5">Prompt</p>
            <p className="text-sm text-white/70 leading-relaxed">{ex.prompt}</p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: "Model", value: ex.model },
              { label: "Provider", value: ex.provider },
              { label: "By", value: `@${ex.author}` },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/7">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{item.label}</p>
                <p className="text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <Link
            href="/create"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all"
          >
            Try this in Create mode →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ExamplesPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<typeof EXAMPLES[0] | null>(null);

  const filtered = filter === "All" ? EXAMPLES : EXAMPLES.filter(e => e.mode === filter);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans antialiased">
      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0d1117]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/pixza-logo.png" alt="" className="w-6 h-6 rounded-lg object-contain" />
            <span className="text-sm font-bold text-white">Pixza Studio</span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-white/40">Examples</span>
        </div>
        <Link
          href="/create"
          className="text-sm font-black px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 transition-all"
        >
          Start creating →
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-3">Community Examples</h1>
          <p className="text-base text-white/40">Real outputs from the Pixza Studio community. Click any to see the prompt and try it yourself.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-9">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold transition-all",
                filter === f
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((ex, i) => (
            <ExCard key={i} ex={ex} onClick={() => setSelected(ex)} />
          ))}
        </div>
      </div>

      {selected && <Modal ex={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
