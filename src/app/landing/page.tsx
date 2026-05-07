"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Zap, ShieldCheck, Target, Cpu, Check, Box, Sparkles, ImageIcon, Video, Music } from "lucide-react";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { Header } from "@/components/ui/header-3";
import ScrollMorphHero from "@/components/ui/scroll-morph-hero";

/* ── Features ─────────────────────────────────────────────── */
function Features() {
  const items = [
    {
      label: "Image",
      title: "Photorealistic Generation",
      desc: "Gemini Imagen 4, FLUX Pro, and 6 more models. From product shots to concept art.",
      icon: <ImageIcon className="w-5 h-5" />,
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    },
    {
      label: "Video",
      title: "Cinematic AI Video",
      desc: "Veo 3, Kling 1.6 Pro, MiniMax. Text-to-video and image-to-video in one click.",
      icon: <Video className="w-5 h-5" />,
      img: "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?auto=format&fit=crop&q=80&w=800",
    },
    {
      label: "Studio",
      title: "Visual Node Canvas",
      desc: "Chain models together in a drag-and-drop pipeline. No code required.",
      icon: <Layers className="w-5 h-5" />,
      img: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=800",
    },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">What you can build</p>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
            Every format.<br />One studio.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((f, i) => (
            <div key={i} className="group relative rounded-3xl overflow-hidden h-[480px] flex flex-col justify-end cursor-pointer border border-white/5">
              <div className="absolute inset-0">
                <img src={f.img} alt={f.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>
              <div className="relative z-10 p-8">
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-4">
                  {f.icon}{f.label}
                </span>
                <h3 className="text-2xl font-black text-white tracking-tighter mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats Bar ─────────────────────────────────────────────── */
function Stats() {
  const stats = [
    { value: "50+", label: "AI Models" },
    { value: "4", label: "Media Types" },
    { value: "10k+", label: "Creators" },
    { value: "99.9%", label: "Uptime" },
  ];
  return (
    <div className="border-y border-white/5 py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">{s.value}</div>
            <div className="text-white/30 text-xs font-bold uppercase tracking-widest mt-2">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Showcase ──────────────────────────────────────────────── */
function Showcase() {
  const images = [
    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Abstract generative art" },
    { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Modern architecture" },
    { src: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=800&fit=crop&auto=format&q=80", alt: "Abstract geometric" },
    { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Mountain landscape" },
    { src: "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Digital bloom" },
    { src: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Ocean waves" },
    { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Forest light" },
  ];
  return (
    <section id="showcase">
      <div className="py-20 px-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Generated with Pixza</p>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Showcase</h2>
      </div>
      <ZoomParallax images={images} />
    </section>
  );
}

/* ── Edge ──────────────────────────────────────────────────── */
function Edge() {
  const edges = [
    { title: "Precision Output", desc: "Product fidelity and brand accuracy — not just aesthetics.", icon: <Target className="w-5 h-5" /> },
    { title: "Neural Pipelines", desc: "Complex model chaining with an intuitive visual interface.", icon: <Cpu className="w-5 h-5" /> },
    { title: "Performance First", desc: "Built for speed and batch processing at any scale.", icon: <Zap className="w-5 h-5" /> },
    { title: "Commercial Rights", desc: "Full commercial license on all Pro and Agency generations.", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <section id="compare" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Why Pixza</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
              High-end output.<br />Total creative control.
            </h2>
            <p className="text-white/40 text-base leading-relaxed mb-12 max-w-md">
              In a market of rigid templates and enterprise complexity, Pixza is the bridge between power and simplicity.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {edges.map((e, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/60 mb-4">
                    {e.icon}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{e.title}</h4>
                  <p className="text-white/30 text-xs leading-relaxed">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 overflow-hidden bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-5 text-white/20 text-[10px] font-black uppercase tracking-widest">Feature</th>
                  <th className="text-left px-6 py-5 text-white/20 text-[10px] font-black uppercase tracking-widest">Others</th>
                  <th className="text-left px-6 py-5 text-white text-[10px] font-black uppercase tracking-widest">Pixza</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Media Types", "Image only", "Image, Video, Audio, 3D"],
                  ["Workflow", "Templates", "Visual node canvas"],
                  ["Models", "1–3 models", "50+ models"],
                  ["Rights", "Restricted", "Full commercial"],
                ].map(([feat, other, pixza], i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 text-white/50">{feat}</td>
                    <td className="px-6 py-4 text-white/20">{other}</td>
                    <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/60 shrink-0" />{pixza}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ───────────────────────────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      desc: "Get started with no commitment.",
      features: ["100 credits/month", "Cloudflare free models", "Gemini Flash Image", "Web export"],
    },
    {
      name: "Pro",
      price: "₹999",
      desc: "For creators and small teams.",
      features: ["3,000 credits/month", "FLUX + Imagen 3 & 4", "Seedance video", "No watermarks", "Commercial license"],
      popular: true,
    },
    {
      name: "Agency",
      price: "₹2,999",
      desc: "For studios and power users.",
      features: ["8,000 credits/month", "Veo 2 & 3 video", "Everything in Pro", "Priority support", "Team seats (soon)"],
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Pricing</p>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Simple, transparent.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <div key={i} className={`relative flex flex-col rounded-3xl p-8 border transition-all ${plan.popular ? "bg-white text-black border-white" : "bg-white/[0.02] border-white/5 text-white"}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h3 className={`text-sm font-black uppercase tracking-widest mb-3 ${plan.popular ? "text-black/50" : "text-white/40"}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                  {plan.price !== "Custom" && <span className={`text-sm font-medium ${plan.popular ? "text-black/40" : "text-white/30"}`}>/mo</span>}
                </div>
                <p className={`text-sm ${plan.popular ? "text-black/50" : "text-white/30"}`}>{plan.desc}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className={`flex items-center gap-3 text-sm ${plan.popular ? "text-black/70" : "text-white/40"}`}>
                    <Check className={`w-4 h-4 shrink-0 ${plan.popular ? "text-black" : "text-white/30"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className={`w-full py-3.5 rounded-2xl text-sm font-black text-center transition-all ${plan.popular ? "bg-black text-white hover:bg-black/80" : "bg-white/5 text-white hover:bg-white/10 border border-white/10"}`}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Blog ──────────────────────────────────────────────────── */
function Blog() {
  const [posts, setPosts] = useState<Array<{ id: number; slug: string; title: string; excerpt: string; date: string; thumbnail: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog?per_page=3&page=1")
      .then(r => r.json())
      .then(d => setPosts(d.items?.slice(0, 3) ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const fallback = [
    { id: 1, slug: "#", title: "The Future of Generative Art", excerpt: "How AI is redefining the boundaries of human creativity.", date: "April 15, 2026", thumbnail: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800" },
    { id: 2, slug: "#", title: "Chaining Models for Success", excerpt: "A guide to building complex multi-stage generation pipelines.", date: "April 12, 2026", thumbnail: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800" },
    { id: 3, slug: "#", title: "Obsidian Design Principles", excerpt: "Behind the minimalist aesthetic of our high-performance studio.", date: "April 08, 2026", thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800" },
  ];

  const display = posts.length > 0 ? posts : fallback;

  return (
    <section id="blog" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">Journal</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Latest thinking.</h2>
          </div>
          <Link href="/blog" className="text-sm font-bold text-white/40 hover:text-white transition-colors flex items-center gap-2">
            All posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white/5 h-72" />
              ))
            : display.map(post => (
                <Link key={post.id} href={post.slug === "#" ? "/blog" : `/blog/${post.slug}`} className="group block">
                  <div className="aspect-video rounded-2xl overflow-hidden mb-5 bg-white/5">
                    {post.thumbnail && (
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-2">
                    {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <h3 className="text-lg font-bold text-white group-hover:text-white/70 transition-colors mb-2 leading-snug">{post.title}</h3>
                  <p className="text-white/30 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                </Link>
              ))
          }
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ──────────────────────────────────────────── */
function Testimonials() {
  const items = [
    { name: "Alex Rivera", role: "Creative Director", text: "Pixza completely transformed our workflow. The speed and quality are unprecedented." },
    { name: "Sarah Chen", role: "Independent Artist", text: "The obsidian aesthetic isn't just a look — it's a feeling of pure performance and focus." },
    { name: "Marcus Thorne", role: "Product Designer", text: "Finally an AI tool that respects the designer's intent while providing infinite inspiration." },
  ];
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((t, i) => (
          <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
            <p className="text-white/60 text-base leading-relaxed mb-8 italic">"{t.text}"</p>
            <div>
              <p className="text-white font-bold text-sm">{t.name}</p>
              <p className="text-white/30 text-xs mt-0.5">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── FAQ ───────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "How does the credit system work?", a: "Each generation costs credits: 1 for free images, 2–5 for premium images, 8–25 for video. Free plan gets 100/month, Pro gets 3,000, Agency gets 8,000." },
    { q: "Can I use generated media commercially?", a: "Yes — all Pro and Agency plan generations include a full commercial license with no revenue limits." },
    { q: "Which AI models are available?", a: "Gemini Flash Image, Imagen 3 & 4, FLUX Dev (WaveSpeed), Seedance 1.5 & 2.0 video, Veo 2 & 3, and Cloudflare free models." },
    { q: "Do I need my own API keys?", a: "No — Pixza provides access to all models through your subscription. All API costs are covered by your plan credits." },
    { q: "Is there a free plan?", a: "Yes. The free plan includes 100 credits/month and access to Cloudflare + Gemini Flash free models with no credit card required." },
  ];
  return (
    <section id="faq" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">FAQ</p>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Common questions.</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-bold text-white">{faq.q}</span>
                <span className={`text-white/30 text-lg transition-transform ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { title: "Product", links: [{ l: "Studio", h: "/studio" }, { l: "Simple Mode", h: "/create" }, { l: "Tools", h: "/tools" }, { l: "Batch Editor", h: "/batch" }, { l: "Pricing", h: "#pricing" }, { l: "Examples", h: "/examples" }] },
    { title: "Company", links: [{ l: "Blog", h: "/blog" }, { l: "Contact", h: "/contact" }, { l: "About", h: "/about" }] },
    { title: "Legal", links: [{ l: "Privacy", h: "/privacy" }, { l: "Terms", h: "/terms" }] },
  ];
  return (
    <footer className="border-t border-white/5 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
              <img src="/pixza-logo.png" alt="Pixza Studio" className="w-4 h-4 invert" />
              </div>
              <span className="font-black tracking-tighter text-white text-lg">Pixza Studio</span>
            </Link>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs mb-6">
              The AI creative studio for image, video, audio, and 3D generation.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              All systems operational
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l.l}>
                    <Link href={l.h} className="text-white/40 hover:text-white text-sm transition-colors">{l.l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-xs">© 2026 Pixza Studio. All rights reserved.</p>
          <div className="flex gap-6 text-white/20 text-xs">
            <a href="https://twitter.com/pixzastudio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter / X</a>
            <a href="https://discord.gg/pixza" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a>
            <a href="https://github.com/pixzastudio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function LandingPage() {
  useEffect(() => {
    let animId: number;
    let lenis: any;
    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis();
      function raf(time: number) { lenis.raf(time); animId = requestAnimationFrame(raf); }
      animId = requestAnimationFrame(raf);
    });
    return () => { cancelAnimationFrame(animId); lenis?.destroy?.(); };
  }, []);

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Pixza Studio",
    "url": "https://pixzastudio.com",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web",
    "description": "AI creative studio for image, video, audio and 3D generation. Free tier with FLUX, Gemini Flash, and Cloudflare AI.",
    "offers": [
      { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "INR" },
      { "@type": "Offer", "name": "Pro", "price": "999", "priceCurrency": "INR" },
      { "@type": "Offer", "name": "Agency", "price": "2999", "priceCurrency": "INR" }
    ]
  };

  return (
    <main className="bg-[#0d1117] text-white selection:bg-white selection:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <Header />
      <div className="h-screen w-full">
        <ScrollMorphHero />
      </div>
      <Stats />
      <Features />
      <Showcase />
      <Edge />
      <Pricing />
      <Blog />
      <Testimonials />
      <FAQ />

      {/* CTA */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
            Start creating today.
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Free plan available. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-minimal btn-minimal-primary px-10 py-4 text-base font-black">
              Get Started Free
            </Link>
            <Link href="/studio" className="btn-minimal btn-minimal-secondary px-10 py-4 text-base font-black">
              Open Studio
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
