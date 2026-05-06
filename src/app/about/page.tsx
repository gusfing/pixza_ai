"use client";

import Link from "next/link";
import { ArrowRight, Zap, Heart, Globe, Shield, Users, Sparkles, Target, Code2, ImageIcon, Video, Layers } from "lucide-react";

const TEAM = [
  {
    name: "Pixza Studio",
    role: "AI Creative Platform",
    bio: "Built by creators, for creators. We believe powerful AI tools should be accessible to everyone — not just those with deep pockets.",
    avatar: "/pixza-logo.png",
    isLogo: true,
  },
];

const VALUES = [
  {
    icon: Zap,
    title: "Speed First",
    desc: "Every tool is optimized for the fastest possible output. No waiting, no queues on free tier.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Heart,
    title: "Accessible to All",
    desc: "Free tier with real models. Not crippled demos — actual FLUX, Gemini Flash, and Cloudflare AI.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: Globe,
    title: "Built for India",
    desc: "Pricing in INR. Models that work for Indian creators, designers, and businesses.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Shield,
    title: "No Lock-in",
    desc: "Subscription-based. No per-image fees that spiral out of control. Predictable costs.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Code2,
    title: "Open Architecture",
    desc: "Built on open models — FLUX, Stable Diffusion, Wan, Seedance. Not proprietary black boxes.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Target,
    title: "Creator-Focused",
    desc: "Every feature is designed around real creative workflows — not enterprise dashboards.",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
  },
];

const STATS = [
  { value: "50+",   label: "AI Models" },
  { value: "₹0",    label: "To Start" },
  { value: "4",     label: "Media Types" },
  { value: "100%",  label: "Subscription" },
];

const TIMELINE = [
  { year: "2024", title: "The Idea", desc: "Frustrated by expensive, fragmented AI tools, we started building a unified studio." },
  { year: "Early 2025", title: "First Build", desc: "Launched the node canvas and basic image generation with Cloudflare free models." },
  { year: "Mid 2025", title: "Video + Tools", desc: "Added Veo 3, Seedance, and free tools — background remover, magic eraser, upscaler." },
  { year: "Late 2025", title: "Going Live", desc: "Razorpay payments, WordPress CMS, full production deployment on Vercel + Coolify." },
  { year: "2026", title: "Now", desc: "50+ models, 24 pages, free tools, and a growing community of Indian creators." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans antialiased">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050508]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden">
              <img src="/pixza-logo.png" alt="" className="w-8 h-8 object-cover" />
            </div>
            <span className="font-black tracking-tighter text-white text-lg">Pixza Studio</span>
          </Link>
          <Link href="/auth/signup"
            className="px-5 py-2 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[400px] rounded-full blur-[140px] opacity-15"
            style={{ background: "radial-gradient(ellipse, #7c3aed 0%, #ec4899 50%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-black uppercase tracking-[0.2em] mb-8">
            <Sparkles className="w-3 h-3" />
            Our Story
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
            We're building the AI studio<br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              India deserves.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Pixza Studio is a unified AI creative platform for image, video, audio, and 3D generation.
            Built for creators who want professional results without enterprise pricing.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-1">{s.value}</div>
              <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-5">
              Democratize AI creativity.
            </h2>
            <p className="text-white/50 leading-relaxed mb-4">
              The best AI models — FLUX, Imagen 4, Veo 3, Seedance — were locked behind expensive APIs
              or required technical expertise to use. We changed that.
            </p>
            <p className="text-white/50 leading-relaxed mb-4">
              Pixza Studio gives every creator — from a solo designer in Bangalore to an e-commerce
              brand in Mumbai — access to the same tools that Fortune 500 companies use.
            </p>
            <p className="text-white/50 leading-relaxed">
              Starting at ₹0/month. No credit card required. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: ImageIcon, label: "Image Generation", count: "8+ models" },
              { icon: Video,     label: "Video Generation", count: "6+ models" },
              { icon: Layers,    label: "Node Studio",      count: "Visual pipelines" },
              { icon: Zap,       label: "Free Tools",       count: "6 tools" },
            ].map(item => (
              <div key={item.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <item.icon className="w-5 h-5 text-violet-400 mb-3" />
                <p className="text-sm font-black text-white mb-0.5">{item.label}</p>
                <p className="text-xs text-white/30">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3">What we believe</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Our values.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map(v => (
              <div key={v.title} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                <div className={`w-10 h-10 rounded-xl ${v.bg} flex items-center justify-center mb-4`}>
                  <v.icon className={`w-5 h-5 ${v.color}`} />
                </div>
                <h3 className="text-sm font-black text-white mb-2">{v.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3">How we got here</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Our journey.</h2>
        </div>
        <div className="relative">
          {/* Line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/8" />

          <div className="space-y-8">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-6 relative">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                </div>
                <div className="pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">{item.year}</span>
                  <h3 className="text-base font-black text-white mt-0.5 mb-1">{item.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Brand */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3">The team</p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-12">Small team. Big vision.</h2>

        <div className="max-w-sm mx-auto p-8 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-5">
            <img src="/pixza-logo.png" alt="Pixza Studio" className="w-20 h-20 object-cover" />
          </div>
          <h3 className="text-lg font-black text-white mb-1">Pixza Studio</h3>
          <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-4">AI Creative Platform</p>
          <p className="text-sm text-white/40 leading-relaxed">
            Built by creators who were tired of paying $50/month for tools that still watermark your work.
            We're a small, focused team shipping fast.
          </p>
        </div>

        <p className="text-sm text-white/30 mt-8">
          Want to join us?{" "}
          <Link href="/contact" className="text-violet-400 hover:text-violet-300 transition-colors font-bold">
            Get in touch →
          </Link>
        </p>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center border-t border-white/5">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
            Ready to create?
          </h2>
          <p className="text-white/40 mb-8 text-sm">Free plan available. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup"
              className="px-8 py-3.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all flex items-center justify-center gap-2">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/tools"
              className="px-8 py-3.5 rounded-xl border border-white/10 text-white/60 text-sm font-black hover:text-white hover:border-white/20 transition-all">
              Try Free Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden">
              <img src="/pixza-logo.png" alt="" className="w-6 h-6 object-cover" />
            </div>
            <span className="text-sm font-black text-white/50">Pixza Studio</span>
          </div>
          <p className="text-xs text-white/20">© 2026 Pixza Studio. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-white/25">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
