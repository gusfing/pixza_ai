"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Zap, ShieldCheck, Target, Cpu, Check, Box, Sparkles } from "lucide-react";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { PortfolioGallery } from "@/components/ui/portfolio-gallery";
import { Header } from "@/components/ui/header-3";
import ScrollMorphHero from "@/components/ui/scroll-morph-hero";

/* ── Gallery / Showcase Section ── */
/* ── Gallery / Showcase Section ── */
function Gallery() {
  const images = [
    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Abstract generative art" },
    { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Modern architecture" },
    { src: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=800&fit=crop&auto=format&q=80", alt: "Abstract geometric pattern" },
    { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Mountain landscape" },
    { src: "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Digital bloom" },
    { src: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Ocean waves" },
    { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=720&fit=crop&auto=format&q=80", alt: "Forest and sunlight" },
  ];

  return (
    <section id="showcase">
      {/* Section header — sits above the parallax */}
      <div className="py-24 px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter italic">Showcase</h2>
        <p className="text-white/40 text-lg font-medium max-w-2xl mx-auto">
          Witness the convergence of human creativity and neural processing.
        </p>
      </div>

      <ZoomParallax images={images} />
    </section>
  );
}

/* ── Blog Preview Section ── */
function BlogPreview() {
  const [posts, setPosts] = useState<Array<{ id: number; slug: string; title: string; excerpt: string; date: string; thumbnail: string; categories: string[] }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog?per_page=3&page=1")
      .then(r => r.json())
      .then(d => setPosts(d.items?.slice(0, 3) ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  // Fallback posts shown while loading or if WP has no posts yet
  const fallback = [
    { id: 1, slug: "#", title: "The Future of Generative Art", excerpt: "Exploring how AI is redefining the boundaries of human creativity.", date: "April 15, 2026", thumbnail: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=1000", categories: [] },
    { id: 2, slug: "#", title: "Chaining Models for Success", excerpt: "A guide to building complex multi-stage generation pipelines.", date: "April 12, 2026", thumbnail: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1000", categories: [] },
    { id: 3, slug: "#", title: "Obsidian Design Principles", excerpt: "Behind the minimalist aesthetic of our high-performance studio.", date: "April 08, 2026", thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=1000", categories: [] },
  ];

  const display = posts.length > 0 ? posts : fallback;

  return (
    <section id="blog" className="py-32 px-6 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Journal</h2>
            <p className="text-white/40 text-lg font-medium">
              Insights, tutorials, and deep dives into the world of AI-driven design.
            </p>
          </div>
          <Link href="/blog" className="btn-minimal btn-minimal-secondary px-8 py-3 mb-2">
            View All Posts
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[16/10] rounded-[30px] bg-white/5 mb-8" />
                  <div className="h-3 bg-white/5 rounded w-1/3 mb-4" />
                  <div className="h-6 bg-white/5 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                </div>
              ))
            : display.map((post) => (
                <Link key={post.id} href={post.slug === "#" ? "/blog" : `/blog/${post.slug}`} className="group cursor-pointer no-underline">
                  <div className="aspect-[16/10] overflow-hidden rounded-[30px] mb-8 glass-panel border-white/5">
                    {post.thumbnail
                      ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                      : <div className="w-full h-full flex items-center justify-center text-white/10 text-5xl">✦</div>
                    }
                  </div>
                  <span className="text-white/20 text-xs font-bold uppercase tracking-widest mb-3 block">
                    {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white/80 transition-colors">{post.title}</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">{post.excerpt}</p>
                </Link>
              ))
          }
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function Testimonials() {
  const testimonials = [
    { name: "Alex Rivera", role: "Creative Director", text: "Pixza has completely transformed our workflow. The speed and quality are unprecedented." },
    { name: "Sarah Chen", role: "Independent Artist", text: "The obsidian aesthetic isn't just a look, it's a feeling of pure performance and focus." },
    { name: "Marcus Thorne", role: "Product Designer", text: "Finally, an AI tool that respects the designer's intent while providing infinite inspiration." },
  ];

  return (
    <section id="testimonials" className="py-32 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <div key={i} className="glass-panel p-12 rounded-[40px] flex flex-col justify-between h-[350px]">
            <p className="text-white/60 text-xl font-medium leading-relaxed italic">"{t.text}"</p>
            <div>
              <h4 className="text-white font-bold text-lg">{t.name}</h4>
              <p className="text-white/30 text-sm font-medium">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Pricing ── */
function Pricing() {
  const plans = [
    { name: "Starter", price: "$0", features: ["100 Generations/mo", "Standard Models", "Community Discord", "Web Export"] },
    { name: "Pro", price: "$29", features: ["Unlimited Generations", "Custom Finetunes", "Priority Support", "High-Res Export", "Commercial License"], popular: true },
    { name: "Enterprise", price: "Custom", features: ["API Access", "SSO/SAML", "Private Models", "Dedicated Manager", "Custom SLA"] },
  ];

  return (
    <section id="pricing" className="py-32 px-6 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Tiered Access</h2>
          <p className="text-white/40 text-lg font-medium max-w-xl mx-auto">Choose the path that fits your creative scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, i) => (
            <div key={i} className={`glass-panel p-12 rounded-[40px] relative flex flex-col ${plan.popular ? "border-white/20 bg-white/5 py-16" : "border-white/5"}`}>
              {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">Most Popular</span>}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-white/20 font-bold text-sm">/mo</span>}
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-white/40 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`btn-minimal w-full py-4 text-base ${plan.popular ? "btn-minimal-primary" : "btn-minimal-secondary"}`}>
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Competitive Edge Section ── */
function CompetitiveEdge() {
  const edges = [
    { title: "Precision Studio", desc: "Unlike 'aesthetic-only' tools, we prioritize product fidelity and brand accuracy.", icon: <Target className="w-6 h-6" /> },
    { title: "Neural Pipelines", desc: "Complex model chaining that enterprise tools offer, but with an intuitive interface.", icon: <Cpu className="w-6 h-6" /> },
    { title: "Performance First", desc: "Built for speed and batch processing without the enterprise-level overhead.", icon: <Zap className="w-6 h-6" /> },
    { title: "Brand Sovereignty", desc: "Full commercial rights and logo preservation on all generations.", icon: <ShieldCheck className="w-6 h-6" /> },
  ];

  return (
    <section id="compare" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter italic">The Pixza Edge</h2>
            <p className="text-white/40 text-lg font-medium leading-relaxed mb-10">
              In a market filled with rigid templates and overly technical enterprise software, Pixza stands as the bridge: **High-end output with total creative control.**
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {edges.map((edge, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center text-white">
                    {edge.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white">{edge.title}</h4>
                  <p className="text-white/30 text-sm font-medium leading-relaxed">{edge.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="glass-panel p-1 rounded-[40px] overflow-hidden">
              <div className="bg-[#0A0A0A] p-10 rounded-[38px] border border-white/5">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="py-6 text-white/20 text-xs font-black uppercase tracking-widest">Feature</th>
                      <th className="py-6 text-white/20 text-xs font-black uppercase tracking-widest">Market Leaders</th>
                      <th className="py-6 text-white text-xs font-black uppercase tracking-widest italic">Pixza Studio</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    <tr className="border-b border-white/5">
                      <td className="py-6 text-white/60">Creative Engine</td>
                      <td className="py-6 text-white/20">Image Only</td>
                      <td className="py-6 text-white flex items-center gap-2">Multi-Modal <Check className="w-4 h-4 text-white" /></td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-6 text-white/60">Workflow</td>
                      <td className="py-6 text-white/20">Templates</td>
                      <td className="py-6 text-white flex items-center gap-2">Node-Based <Check className="w-4 h-4 text-white" /></td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-6 text-white/60">Accuracy</td>
                      <td className="py-6 text-white/20">Variable</td>
                      <td className="py-6 text-white flex items-center gap-2">Neural Fidelity <Check className="w-4 h-4 text-white" /></td>
                    </tr>
                    <tr>
                      <td className="py-6 text-white/60">Target</td>
                      <td className="py-6 text-white/20">Broad/General</td>
                      <td className="py-6 text-white flex items-center gap-2">Elite Creators <Check className="w-4 h-4 text-white" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ── */
function FAQ() {
  const faqs = [
    { q: "How does the neural engine work?", a: "Pixza uses a proprietary blend of diffusion models and visual transformers, optimized for high-fidelity creative output." },
    { q: "Can I use generated media commercially?", a: "Yes, all generations on our Pro and Enterprise plans include a full commercial license." },
    { q: "What models are supported?", a: "We currently support Stable Diffusion XL, Flux.1, and several custom-trained cinematic models." },
    { q: "Do you offer API access?", a: "API access is exclusively available for our Enterprise partners. Contact us for integration details." },
  ];

  return (
    <section id="faq" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-black text-white mb-16 tracking-tighter text-center italic">Questions?</h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-panel p-8 rounded-[30px] border-white/5">
              <h4 className="text-lg font-bold text-white mb-3">{faq.q}</h4>
              <p className="text-white/40 text-sm font-medium leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Minimal Footer ── */
/* ── Expanded Footer ── */
function Footer() {
  const sections = [
    {
      title: "Product",
      links: [
        { label: "Workflow Studio", href: "/studio" },
        { label: "Simple Mode", href: "/create" },
        { label: "Neural Vault", href: "#" },
        { label: "Pricing", href: "#pricing" },
        { label: "Showcase", href: "#showcase" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Contact Us", href: "/contact" },
        { label: "Documentation", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "Journal", href: "#blog" },
        { label: "Status", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "#" },
        { label: "License", href: "#" },
      ],
    },
  ];

  return (
    <footer className="py-32 px-6 border-t border-white/5 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24 bg-white text-black p-[50px_30px] rounded-[20px]">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center">
                <img src="/pixza-logo.png" alt="Pixza" className="w-6 h-6" />
              </div>
              <span className="text-[#080808] text-2xl font-black tracking-tighter">Pixza Studio</span>
            </div>
            <p className="text-[#080808] text-sm font-medium leading-relaxed max-w-xs mb-10">
              The high-performance neural engine for elite tier media synthesis. Precision-built for the next generation of creators.
            </p>
            <div className="flex items-center gap-3 text-black text-[10px] font-black uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
              </span>
              All Systems Operational
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-black font-bold text-sm mb-8 uppercase tracking-widest">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-black/60 hover:text-black text-sm font-medium transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white/20 text-xs font-medium">
            &copy; 2026 Pixza Studio. All rights reserved. Built by elite tier creators.
          </p>
          <div className="flex gap-8 text-white/30 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Twitter / X</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Minimalist Feature Grid ── */
function Features() {
  const features = [
    { title: "Multi-Modal", desc: "Synthesis across Image, Video, Audio, and 3D reconstruction.", icon: <Box className="w-6 h-6" />, img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000" },
    { title: "Workflow Canvas", desc: "Visual node-based chaining for complex creative pipelines.", icon: <Layers className="w-6 h-6" />, img: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=1000" },
    { title: "Vaults", desc: "Access community-driven neural presets and elite workflows.", icon: <Sparkles className="w-6 h-6" />, img: "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?auto=format&fit=crop&q=80&w=1000" },
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

export default function LandingPage() {
  useEffect(() => {
    let animId: number;
    let lenis: any;

    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        // Don't smooth-scroll inside elements that handle their own scroll
        prevent: (node: Element) => node.id === "scroll-morph-hero",
      });
      function raf(time: number) {
        lenis.raf(time);
        animId = requestAnimationFrame(raf);
      }
      animId = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(animId);
      lenis?.destroy?.();
    };
  }, []);

  return (
    <main className="bg-[#0A0A0A] selection:bg-white selection:text-black">
      <Header />
      <section
        id="scroll-morph-hero"
        className="h-screen w-full relative overflow-hidden"
      >
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
        <ScrollMorphHero />
      </section>
      <Features />
      <Gallery />
      <PortfolioGallery />
      <CompetitiveEdge />
      <BlogPreview />
      <Testimonials />
      <Pricing />
      <FAQ />
      
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
