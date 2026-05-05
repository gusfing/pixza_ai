"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check, Star, Sparkles, ImageIcon, Video, Layers, Zap } from "lucide-react";

const FEATURES = [
  { icon: ImageIcon, label: "AI Images",   desc: "FLUX.2, Imagen 4, Gemini Flash" },
  { icon: Video,     label: "AI Video",    desc: "Veo 3, Seedance, Wan 2.1" },
  { icon: Layers,    label: "Node Studio", desc: "Visual pipeline builder" },
  { icon: Zap,       label: "Free Tools",  desc: "BG remover, magic eraser, upscaler" },
];

const TESTIMONIALS = [
  { name: "Arjun S.",  role: "Product Designer",   text: "Finally an AI studio that doesn't cost a fortune. The free tier alone is incredible." },
  { name: "Priya M.",  role: "Content Creator",    text: "The node canvas is mind-blowing. Built a full product photography pipeline in minutes." },
  { name: "Rahul K.",  role: "E-commerce Founder", text: "Replaced 3 different tools with Pixza. Background removal, video, images — all in one." },
];

export default function WaitlistPage() {
  const [email, setEmail]   = useState("");
  const [name, setName]     = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [count, setCount]   = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/waitlist").then(r => r.json()).then(d => setCount(d.count ?? null)).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (data.success) { setStatus("success"); setMessage(data.message || "You're on the list!"); }
      else { setStatus("error"); setMessage(data.error || "Something went wrong"); }
    } catch {
      setStatus("error"); setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-[#050508] text-white font-sans antialiased overflow-x-hidden">

      {/* ── STICKY HEADER ─────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden">
              <img src="/pixza-logo.png" alt="" className="w-8 h-8 object-cover" />
            </div>
            <span className="font-black tracking-tighter text-white text-lg">Pixza Studio</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Coming soon
          </div>
        </div>
      </header>

      {/* ── HERO — FULL SCREEN VIDEO ───────────────────────────── */}
      <section className="relative w-full h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden">

        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          {/* Primary: your Cloudinary video — make sure it's set to Public in Cloudinary dashboard */}
          <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
          {/* Fallback: free cinematic stock video */}
          <source src="https://cdn.coverr.co/videos/coverr-typing-on-a-laptop-1584/1080p.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay — gradient from bottom */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-[#050508]" />

        {/* Vignette edges */}
        <div className="absolute inset-0 z-10"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />

        {/* Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-[11px] font-black uppercase tracking-[0.2em] mb-8">
            <Sparkles className="w-3 h-3 text-violet-400" />
            Early Access — Limited Spots
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
            <span className="text-white">Create Without</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #fb923c 100%)" }}
            >
              Limits.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-10 leading-relaxed">
            The AI creative studio India deserves. Images, videos, 3D — powered by the world's best models.
            Starting at <span className="text-white font-bold">₹0/month</span>.
          </p>

          {/* Social proof */}
          {count !== null && count > 0 && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black/50 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-black text-white">
                    {["A","R","P","S","K"][i]}
                  </div>
                ))}
              </div>
              <span className="text-sm text-white/50">
                <span className="text-white font-bold">{count.toLocaleString()}+</span> people already waiting
              </span>
            </div>
          )}

          {/* Signup form */}
          {status === "success" ? (
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500/15 border border-green-500/30 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-white">You're on the list! 🎉</p>
                <p className="text-xs text-white/40">{message}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1 px-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-400/60 transition-all"
              />
              <input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-400/60 transition-all"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email}
                className="px-7 py-4 rounded-xl font-black text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}
              >
                {status === "loading"
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Join Waitlist</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>
          )}
          {status === "error" && <p className="text-xs text-red-400 mt-3">{message}</p>}
          <p className="text-[11px] text-white/25 mt-4">No spam · Unsubscribe anytime · Early access = 50% off forever</p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/30" />
          <div className="w-1 h-1 rounded-full bg-white/30" />
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "50+",  label: "AI Models" },
            { value: "₹0",   label: "Starter Plan" },
            { value: "4",    label: "Media Types" },
            { value: "Free", label: "Core Tools" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-1">{s.value}</div>
              <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3">What's inside</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
            Everything you need.<br />
            <span className="text-white/30">Nothing you don't.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all duration-300 cursor-default">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-5 group-hover:bg-violet-500/20 transition-colors">
                <f.icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-sm font-black text-white mb-1.5">{f.label}</h3>
              <p className="text-xs text-white/35 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">Simple. Transparent.</h2>
          <p className="text-white/40 text-sm">Early access = <span className="text-white font-bold">50% off</span> all paid plans, forever.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Free", price: "₹0", credits: "100 credits/mo",
              features: ["Cloudflare free models", "Gemini Flash Image", "All free tools", "No credit card"],
              popular: false,
            },
            {
              name: "Pro", price: "₹499", was: "₹999", credits: "3,000 credits/mo",
              features: ["FLUX Dev + Imagen 4", "Seedance video", "No watermarks", "Commercial license"],
              popular: true,
            },
            {
              name: "Agency", price: "₹1,499", was: "₹2,999", credits: "8,000 credits/mo",
              features: ["Everything in Pro", "Veo 3 Fast video", "Priority support", "Team seats (soon)"],
              popular: false,
            },
          ].map(plan => (
            <div key={plan.name} className={`relative p-6 rounded-2xl border transition-all ${plan.popular ? "bg-white text-black border-white shadow-2xl shadow-white/10 scale-[1.02]" : "bg-white/[0.02] border-white/8 text-white"}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  Most Popular
                </span>
              )}
              <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${plan.popular ? "text-black/40" : "text-white/30"}`}>{plan.name}</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                <span className={`text-sm ${plan.popular ? "text-black/40" : "text-white/30"}`}>/mo</span>
              </div>
              {"was" in plan && (
                <p className={`text-xs line-through mb-1 ${plan.popular ? "text-black/25" : "text-white/20"}`}>Was {plan.was}</p>
              )}
              <p className={`text-xs font-bold mb-5 ${plan.popular ? "text-black/50" : "text-white/40"}`}>{plan.credits}</p>
              <ul className="space-y-2.5">
                {plan.features.map(f => (
                  <li key={f} className={`flex items-center gap-2 text-xs ${plan.popular ? "text-black/70" : "text-white/40"}`}>
                    <Check className={`w-3.5 h-3.5 shrink-0 ${plan.popular ? "text-black" : "text-violet-400"}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3">Early feedback</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter">People love it already.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-white/55 leading-relaxed mb-5 italic">"{t.text}"</p>
              <div>
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-white/25">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] rounded-full blur-[120px] opacity-20"
            style={{ background: "radial-gradient(ellipse, #7c3aed 0%, #ec4899 50%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-6">
            <img src="/pixza-logo.png" alt="" className="w-14 h-14 object-cover" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
            Don't miss launch day.
          </h2>
          <p className="text-white/40 mb-10 text-sm">Join the waitlist. Get early access + 50% off forever.</p>

          {status !== "success" ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-4 rounded-xl bg-white/8 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-violet-400/50 transition-all"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-4 rounded-xl bg-white text-black font-black text-sm hover:bg-white/90 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {status === "loading" ? "…" : "Join Now"}
              </button>
            </form>
          ) : (
            <div className="inline-flex items-center gap-2 text-green-400 font-bold">
              <Check className="w-5 h-5" /> You're on the list!
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
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
