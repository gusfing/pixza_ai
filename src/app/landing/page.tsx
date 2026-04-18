"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, Layers, Zap } from "lucide-react";

/* ── Minimal Navigation ── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 w-[95%] max-w-5xl rounded-full px-6 py-3 flex items-center justify-between ${
      scrolled ? "glass-panel py-2" : "bg-transparent"
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
          <img src="/pixza-logo.png" alt="Pixza" className="w-5 h-5 invert" />
        </div>
        <span className="text-white font-bold tracking-tight text-lg">Pixza</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {["Features", "Showcase", "Docs"].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="text-white/50 hover:text-white text-sm font-medium transition-colors">
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link href="/auth/login" className="text-white/50 hover:text-white text-sm font-medium transition-colors">
          Sign In
        </Link>
        <Link href="/studio" className="btn-minimal btn-minimal-primary text-sm px-5 py-2">
          Launch Studio
        </Link>
      </div>
    </nav>
  );
}

/* ── Hero Section ── */
function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Cinematic Background Visual */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0A0A0A]/60 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2564" 
          alt="Abstract" 
          className="w-full h-full object-cover scale-105"
        />
      </div>

      <div className="relative z-20 text-center max-w-4xl flex flex-col items-center animate-obsidian">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
          Create without <br/> limits.
        </h1>
        <p className="text-white/50 text-lg md:text-xl max-w-xl mb-10 font-medium">
          The next-generation neural engine for image, video, and 3D workflows. All in one minimalist canvas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/studio" className="btn-minimal btn-minimal-primary text-lg px-8 py-4 group">
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="btn-minimal btn-minimal-secondary text-lg px-8 py-4">
            View Showcase
          </button>
        </div>
      </div>

      {/* Hero Visual Float */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/30 text-xs font-bold tracking-widest uppercase">
        <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
        Neural Pulse: Active
      </div>
    </section>
  );
}

/* ── Minimalist Feature Grid ── */
function Features() {
  const features = [
    { title: "Automate", desc: "Chain complex models into seamless pipelines.", icon: <Zap className="w-6 h-6" />, img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000" },
    { title: "Chain", desc: "Connect generative agents visually.", icon: <Layers className="w-6 h-6" />, img: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=1000" },
    { title: "Generate", desc: "High-fidelity output at the speed of thought.", icon: <Play className="w-6 h-6" />, img: "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?auto=format&fit=crop&q=80&w=1000" },
  ];

  return (
    <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="obsidian-card group relative h-[500px] flex flex-col justify-end p-10 cursor-pointer">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80" />
              <img src={f.img} alt={f.title} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0" />
            </div>
            
            <div className="relative z-20">
              <div className="w-12 h-12 glass-panel rounded-full flex items-center justify-center mb-6 text-white group-hover:bg-white group-hover:text-black transition-colors duration-500">
                {f.icon}
              </div>
              <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{f.title}</h3>
              <p className="text-white/50 text-sm font-medium leading-relaxed max-w-[200px] group-hover:text-white transition-colors">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Minimal Footer ── */
function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-white/5 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-3">
          <img src="/pixza-logo.png" alt="Pixza" className="w-6 h-6 invert" />
          <span className="text-white font-bold tracking-tight">Pixza Studio</span>
        </div>
        
        <div className="flex gap-10 text-white/30 text-sm font-medium">
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Discord</a>
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
        </div>
        
        <p className="text-white/20 text-xs font-medium">
          &copy; 2026 Pixza Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main className="bg-[#0A0A0A] selection:bg-white selection:text-black">
      <Nav />
      <Hero />
      <Features />
      
      {/* Minimalist CTA Section */}
      <section className="py-40 px-6 text-center">
        <div className="max-w-2xl mx-auto glass-panel p-20 rounded-[40px] animate-obsidian">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">
            Ready to evolve?
          </h2>
          <p className="text-white/50 mb-10 font-medium leading-relaxed">
            Join the elite tier of creators building the future of generative media.
          </p>
          <Link href="/studio" className="btn-minimal btn-minimal-primary px-12 py-5 text-xl">
            Enter the Studio
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
