"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Scissors, Wand2, ZoomIn, Eraser, Layers, Sparkles, ImageIcon, Video, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
  {
    href: "/tools/magic-eraser",
    icon: Eraser,
    title: "Magic Eraser",
    desc: "Paint over anything to remove it. AI fills the area seamlessly.",
    badge: "Free",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
    accent: "from-rose-500/10 to-transparent",
    popular: false,
  },
  {
    href: "/tools/background-remover",
    icon: Scissors,
    title: "Background Remover",
    desc: "Instantly remove backgrounds from any image with AI precision.",
    badge: "Free",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
    accent: "from-emerald-500/10 to-transparent",
    popular: true,
  },
  {
    href: "/tools/ai-background",
    icon: Wand2,
    title: "AI Background Generator",
    desc: "Replace your background with any AI-generated scene from a text prompt.",
    badge: "Free",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
    accent: "from-violet-500/10 to-transparent",
  },
  {
    href: "/tools/object-remover",
    icon: Eraser,
    title: "Object Remover",
    desc: "Remove unwanted objects, people, or distractions from photos with AI inpainting.",
    badge: "Free",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
    accent: "from-cyan-500/10 to-transparent",
  },
  {
    href: "/tools/image-upscaler",
    icon: ZoomIn,
    title: "Image Upscaler",
    desc: "Enhance and sharpen images with AI. Improve resolution without losing quality.",
    badge: "Free",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
    accent: "from-amber-500/10 to-transparent",
  },
  {
    href: "/create",
    icon: ImageIcon,
    title: "AI Image Generator",
    desc: "Generate photorealistic images from text with Imagen 4, FLUX, and more.",
    badge: "Pro",
    badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    accent: "from-violet-500/10 to-transparent",
  },
  {
    href: "/create",
    icon: Video,
    title: "AI Video Generator",
    desc: "Create cinematic videos from text or images with Veo 3, Seedance, and Wan.",
    badge: "Pro",
    badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    accent: "from-purple-500/10 to-transparent",
  },
  {
    href: "/batch",
    icon: Layers,
    title: "Batch Editor",
    desc: "Apply the same AI edits to hundreds of images at once. Save hours of work.",
    badge: "Free",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
    accent: "from-blue-500/10 to-transparent",
  },
  {
    href: "/studio",
    icon: Sparkles,
    title: "Node Studio",
    desc: "Chain AI models together in a visual pipeline. No code required.",
    badge: "Pro",
    badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    accent: "from-pink-500/10 to-transparent",
  },
];

const STATS = [
  { value: "100%", label: "Free tools" },
  { value: "<1s", label: "Processing time" },
  { value: "8+", label: "AI tools" },
  { value: "No", label: "Sign-in required" },
];

export default function ToolsPage() {
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
          <span className="text-sm text-white/40">Tools</span>
        </div>
        <Link href="/auth/signup" className="text-xs font-black px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 transition-all">
          Get Started Free
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Hero */}
        <div className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3">AI Tools</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-none">
            Every tool you need.<br />All powered by AI.
          </h1>
          <p className="text-base text-white/40 max-w-lg mx-auto">
            Free AI tools for background removal, image enhancement, object removal, and more. No design skills needed.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {STATS.map(s => (
            <div key={s.label} className="text-center p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl font-black text-white tracking-tighter">{s.value}</div>
              <div className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href + tool.title}
                href={tool.href}
                className="group relative flex flex-col p-5 rounded-2xl border border-white/7 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Accent gradient */}
                <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity", tool.accent)} />

                {tool.popular && (
                  <span className="absolute -top-2.5 left-4 text-[9px] font-black uppercase tracking-widest bg-white text-black px-2.5 py-1 rounded-full">
                    Most Popular
                  </span>
                )}

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white/60" />
                    </div>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", tool.badgeColor)}>
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white mb-1.5">{tool.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed mb-4">{tool.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-bold text-white/30 group-hover:text-white/60 transition-colors">
                    Try it <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-10 rounded-3xl border border-white/5 bg-white/[0.02]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">Need more power?</p>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-white mb-3">
            Unlock the full studio.
          </h2>
          <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
            Pro and Agency plans unlock Imagen 4, Veo 3, Seedance video, and 3,000–8,000 credits/month.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup" className="px-8 py-3.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all">
              Start Free
            </Link>
            <Link href="/landing#pricing" className="px-8 py-3.5 rounded-xl border border-white/10 text-white/60 text-sm font-black hover:text-white hover:border-white/20 transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
