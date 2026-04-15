"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ── Animated gradient orb ── */
function Orb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        borderRadius: "50%",
        filter: "blur(100px)",
        position: "absolute",
        pointerEvents: "none",
        mixBlendMode: "screen",
        ...style,
      }}
    />
  );
}

/* ── Noise overlay ── */
function Noise() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
        mixBlendMode: "overlay",
      }}
    />
  );
}

/* ── Nav ── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      style={{
        position: "fixed", top: 20, left: 20, right: 20, zIndex: 100,
        padding: "0 20px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "background 0.3s, border 0.3s",
        background: scrolled || menuOpen ? "rgba(4,4,6,0.95)" : "rgba(0,0,0,0.7)",
        backdropFilter: "blur(5px)",
        borderRadius: 20,
        border: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.03)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #92dce5, #d64933)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/pixza-logo.png" alt="" style={{ width: 16, height: 16 }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>Pixza Studio</span>
      </div>

      {/* Desktop links */}
      <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Link href="/create" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
        >Create</Link>
        {["Features", "Templates", "Docs"].map(l => (
          <a key={l} href={l === "Features" ? "#features" : l === "Templates" ? "#examples" : "#"} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          >{l}</a>
        ))}
      </div>

      {/* Desktop CTA */}
      <div className="nav-cta" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/onboarding" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Sign in</Link>
        <Link href="/onboarding" style={{ fontSize: 13, fontWeight: 500, color: "#080808", background: "#fff", borderRadius: 8, padding: "7px 16px", textDecoration: "none" }}>
          Get started →
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}>
        {menuOpen
          ? <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          : <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        }
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "absolute", top: 60, left: 0, right: 0, background: "rgba(4,4,6,0.98)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[{ label: "Create", href: "/create" }, { label: "Features", href: "#features" }, { label: "Templates", href: "#examples" }, { label: "Examples", href: "/examples" }].map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ padding: "12px 0", fontSize: 16, color: "rgba(255,255,255,0.7)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{l.label}</a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Link href="/onboarding" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: "12px 0", textAlign: "center", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none" }}>Sign in</Link>
            <Link href="/onboarding" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: "12px 0", textAlign: "center", borderRadius: 10, background: "#fff", color: "#080808", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Get started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  return (
    <section
      ref={ref}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "clamp(80px, 12vw, 120px) 20px clamp(40px, 6vw, 80px)",
        textAlign: "center",
      }}
    >
      {/* Background Hero Image Layer */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: 'url("/landing/hero-abstract.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.15,
        filter: "blur(40px)",
        transform: "scale(1.1)",
        zIndex: -1,
      }} />

      {/* Background orbs */}
      <Orb style={{ width: 700, height: 700, top: "10%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(146,220,229,0.18) 0%, transparent 70%)" }} />
      <Orb style={{ width: 500, height: 500, top: "30%", left: "15%", background: "radial-gradient(circle, rgba(214,73,51,0.12) 0%, transparent 70%)" }} />
      <Orb style={{ width: 400, height: 400, top: "20%", right: "10%", background: "radial-gradient(circle, rgba(146,220,229,0.08) 0%, transparent 70%)" }} />

      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "5px 14px", borderRadius: 99,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        marginBottom: 32,
        fontSize: 12, color: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(10px)",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#92dce5", display: "inline-block" }} />
        Now in beta — AI-powered image workflows
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: "clamp(46px, 8vw, 102px)",
        fontWeight: 800,
        lineHeight: 0.95,
        letterSpacing: "-0.05em",
        color: "#fff",
        maxWidth: 1000,
        margin: "0 0 28px",
        textShadow: "0 0 40px rgba(255,255,255,0.1)",
      }}>
        Creative agents that{" "}
        <span style={{
          background: "linear-gradient(135deg, #92dce5 0%, #eee5e9 40%, #d64933 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          display: "inline-block",
        }}>
          make you prolific
        </span>
      </h1>

      {/* Subhead */}
      <p style={{
        fontSize: "clamp(16px, 2vw, 20px)",
        color: "rgba(255,255,255,0.45)",
        maxWidth: 560,
        lineHeight: 1.6,
        margin: "0 0 48px",
        fontWeight: 400,
      }}>
        A node-based workflow editor for generative AI. Build pipelines that transform and generate images, video, audio and 3D — visually.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/studio" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 28px", borderRadius: 12,
          background: "#fff", color: "#080808",
          fontSize: 15, fontWeight: 600, textDecoration: "none",
          transition: "opacity 0.15s, transform 0.15s",
          boxShadow: "0 4px 24px rgba(255,255,255,0.15)",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
        >
          Start creating free
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <a href="#features" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 28px", borderRadius: 12,
          background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(255,255,255,0.1)",
          fontSize: 15, fontWeight: 500, textDecoration: "none",
          transition: "background 0.15s, color 0.15s",
          backdropFilter: "blur(10px)",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
        >
          See how it works
        </a>
      </div>

      {/* Hero image / canvas preview */}
      <div className="hero-canvas-preview" style={{
        marginTop: 80,
        width: "100%",
        maxWidth: 1100,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(14,14,16,0.8)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
        aspectRatio: "16/9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        {/* Fake canvas nodes */}
        <CanvasPreview />
      </div>
    </section>
  );
}

/* ── Fake canvas preview ── */
function CanvasPreview() {
  const nodes = [
    { x: 80, y: 120, label: "Image Input", color: "#92dce5", w: 140 },
    { x: 80, y: 260, label: "Prompt", color: "#d64933", w: 140 },
    { x: 300, y: 180, label: "Generate Image", color: "#92dce5", w: 160 },
    { x: 540, y: 120, label: "Annotate", color: "#eee5e9", w: 140 },
    { x: 540, y: 260, label: "Output", color: "#92dce5", w: 140 },
    { x: 760, y: 180, label: "Output Gallery", color: "#d64933", w: 160 },
  ];

  const edges = [
    { x1: 220, y1: 140, x2: 300, y2: 200 },
    { x1: 220, y1: 280, x2: 300, y2: 220 },
    { x1: 460, y1: 200, x2: 540, y2: 140 },
    { x1: 460, y1: 200, x2: 540, y2: 280 },
    { x1: 680, y1: 140, x2: 760, y2: 200 },
    { x1: 680, y1: 280, x2: 760, y2: 200 },
  ];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Grid dots */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.5)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Edges */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {edges.map((e, i) => (
          <path
            key={i}
            d={`M ${e.x1} ${e.y1} C ${(e.x1 + e.x2) / 2} ${e.y1}, ${(e.x1 + e.x2) / 2} ${e.y2}, ${e.x2} ${e.y2}`}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((n, i) => (
        <div key={i} style={{
          position: "absolute",
          left: n.x, top: n.y,
          width: n.w, height: 52,
          background: "rgba(22,22,24,0.9)",
          border: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: 10,
          display: "flex", alignItems: "center",
          padding: "0 12px",
          gap: 8,
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>{n.label}</span>
          {/* handles */}
          <div style={{ position: "absolute", left: -5, top: "50%", transform: "translateY(-50%)", width: 10, height: 10, borderRadius: "50%", background: n.color, border: "2px solid #0e0e10" }} />
          <div style={{ position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)", width: 10, height: 10, borderRadius: "50%", background: n.color, border: "2px solid #0e0e10" }} />
        </div>
      ))}

      {/* Gradient fade bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, rgba(14,14,16,0.95), transparent)", pointerEvents: "none" }} />
    </div>
  );
}

/* ── Features ── */
const FEATURES = [
  {
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
    title: "AI-Powered Generation",
    desc: "Connect to Gemini, Replicate, fal.ai, and more. Generate images, video, audio and 3D from a single canvas.",
    accent: "#92dce5",
  },
  {
    icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z",
    title: "Visual Node Editor",
    desc: "Drag, drop, and connect nodes on an infinite canvas. Build complex pipelines without writing a single line of code.",
    accent: "#d64933",
  },
  {
    icon: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
    title: "Batch Processing",
    desc: "Run entire workflows or individual nodes. Process multiple images in parallel with smart dependency resolution.",
    accent: "#eee5e9",
  },
  {
    icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909",
    title: "Multi-Modal Output",
    desc: "Images, video, audio, 3D models — all in one workflow. Mix and match modalities to create rich creative pipelines.",
    accent: "#92dce5",
  },
  {
    icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379",
    title: "AI Chat Assistant",
    desc: "Describe what you want and let the AI build the workflow for you. Edit nodes with natural language commands.",
    accent: "#d64933",
  },
  {
    icon: "M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05",
    title: "Template Library",
    desc: "Start from curated templates for product shots, style transfer, background swap, and more. Community workflows included.",
    accent: "#eee5e9",
  },
];

function Features() {
  return (
    <section id="features" style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }} className="section-pad">
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#92dce5", marginBottom: 16 }}>
          Features
        </p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px" }}>
          Everything you need to create
        </h2>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto" }}>
          A complete creative toolkit built for the generative AI era.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 1 }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc, accent }: typeof FEATURES[0]) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "36px 32px",
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        transition: "background 0.2s, border-color 0.2s",
        borderColor: hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        cursor: "default",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${accent}18`,
        border: `1px solid ${accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{title}</h3>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </div>
  );
}

/* ── Social proof ── */
function SocialProof() {
  const stats = [
    { value: "50+", label: "AI Models" },
    { value: "6", label: "Node Types" },
    { value: "∞", label: "Canvas Size" },
    { value: "Free", label: "Open Source" },
  ];

  return (
    <section style={{
      padding: "clamp(40px, 6vw, 80px) 20px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }} className="stats-grid">
        {stats.map(s => (
          <div key={s.label}>
            <div style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── How it works ── */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Choose your mode", desc: "Pick from Text→Image, Image→Video, Image→3D and more. Or go advanced with the node canvas.", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" },
    { n: "02", title: "Pick a model", desc: "Choose from 50+ models across Gemini, fal.ai, Replicate, WaveSpeed and more — all in one place.", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
    { n: "03", title: "Describe & generate", desc: "Type your prompt, upload a reference image if needed, and hit generate. Results in seconds.", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" },
    { n: "04", title: "Build workflows", desc: "Chain nodes together for complex pipelines. Save, share, and remix community workflows.", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },
  ];

  return (
    <section id="how" style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }} className="section-pad">
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#92dce5", marginBottom: 16 }}>How it works</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px" }}>
          From idea to output in 4 steps
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ position: "relative", padding: "32px 28px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#92dce5", letterSpacing: "0.1em", marginBottom: 16, opacity: 0.7 }}>{s.n}</div>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(146,220,229,0.08)", border: "1px solid rgba(146,220,229,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#92dce5" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em" }}>{s.title}</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            {i < steps.length - 1 && (
              <div style={{ position: "absolute", top: "50%", right: -13, width: 26, height: 1, background: "rgba(255,255,255,0.08)", display: "none" }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Examples gallery ── */
const EXAMPLES = [
  { label: "Product Shot", mode: "Text → Image", model: "FLUX Pro", color: "#92dce5", emoji: "📦", bg: "linear-gradient(135deg, #0a1628 0%, #0d2040 100%)", img: "/landing/example-product.png" },
  { label: "Style Transfer", mode: "Image → Image", model: "FLUX Dev", color: "#d64933", emoji: "🎨", bg: "linear-gradient(135deg, #1a0a08 0%, #2d1208 100%)", img: "/landing/example-style.png" },
  { label: "Animate Product", mode: "Image → Video", model: "Kling 1.6", color: "#a855f7", emoji: "▶", bg: "linear-gradient(135deg, #0f0a1a 0%, #1a0d2e 100%)", img: "/landing/example-cinematic.png" },
  { label: "Cinematic Scene", mode: "Text → Video", model: "Veo 2", color: "#92dce5", emoji: "🎬", bg: "linear-gradient(135deg, #081428 0%, #0a1e3a 100%)", img: "/landing/example-cinematic.png" },
  { label: "3D Object", mode: "Image → 3D", model: "Trellis", color: "#eee5e9", emoji: "◉", bg: "linear-gradient(135deg, #141414 0%, #1e1e1e 100%)", img: "/landing/example-3d.png" },
  { label: "Portrait Edit", mode: "Image → Image", model: "IP Adapter", color: "#d64933", emoji: "👤", bg: "linear-gradient(135deg, #1a0808 0%, #2a0e0e 100%)", img: "/landing/example-portrait.png" },
  { label: "Concept Art", mode: "Text → Image", model: "Gemini Imagen", color: "#92dce5", emoji: "✦", bg: "linear-gradient(135deg, #080a14 0%, #0c1020 100%)", img: "/landing/example-concept.png" },
  { label: "Product Video", mode: "Text → Video", model: "Kling 1.6", color: "#a855f7", emoji: "🛍", bg: "linear-gradient(135deg, #0f0a1a 0%, #180f28 100%)", img: "/landing/example-product.png" },
];

function Examples() {
  return (
    <section id="examples" style={{ padding: "clamp(60px, 8vw, 120px) 0", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", textAlign: "center", marginBottom: 64 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#92dce5", marginBottom: 16 }}>Examples</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px" }}>
          What you can create
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>
          Real outputs from real workflows. Click any to try it yourself.
        </p>
      </div>

      {/* Masonry-style grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="examples-grid">
        {EXAMPLES.map((ex, i) => (
          <ExampleCard key={i} {...ex} tall={i === 0 || i === 4} />
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <Link href="/examples" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 24px", borderRadius: 10,
          background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, fontWeight: 500,
          textDecoration: "none", transition: "all 0.15s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
        >
          Browse all examples →
        </Link>
      </div>
    </section>
  );
}

function ExampleCard({ label, mode, model, color, emoji, bg, img, tall }: typeof EXAMPLES[0] & { tall?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridRow: tall ? "span 2" : "span 1",
        borderRadius: 20, overflow: "hidden", cursor: "pointer",
        background: bg, 
        border: "1px solid rgba(255,255,255,0.08)",
        minHeight: tall ? 380 : 180,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        position: "relative",
        transition: "transform 0.4s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.4s",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered ? "0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1) inset" : "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Background Image */}
      {!imgError && img && (
        <img 
          src={img} 
          alt={label}
          onError={() => setImgError(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: hovered ? 0.8 : 0.6,
            transition: "opacity 0.4s, transform 0.6s",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        />
      )}

      {/* Emoji Fallback / Overlay */}
      <div style={{ 
        position: "absolute", 
        top: "50%", 
        left: "50%", 
        transform: "translate(-50%,-60%)", 
        fontSize: tall ? 64 : 42, 
        opacity: (img && !imgError) ? 0.15 : 0.3, 
        pointerEvents: "none",
        transition: "opacity 0.4s",
      }}>{emoji}</div>

      {/* Gradient Overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)",
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ 
            fontSize: 10, 
            fontWeight: 800, 
            padding: "3px 9px", 
            borderRadius: 6, 
            background: `${color}25`, 
            color, 
            border: `1px solid ${color}40`, 
            textTransform: "uppercase", 
            letterSpacing: "0.08em",
            backdropFilter: "blur(4px)",
          }}>{mode}</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{label}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, fontWeight: 500 }}>{model}</div>
      </div>
    </div>
  );
}

/* ── Providers ── */
function Providers() {
  const providers = [
    { name: "Google Gemini", desc: "Imagen 3 & 4, Veo 2 & 3", color: "#4285f4", icon: "G" },
    { name: "fal.ai", desc: "FLUX, Kling, Wan, MiniMax", color: "#a855f7", icon: "f" },
    { name: "Replicate", desc: "1000s of open-source models", color: "#ef4444", icon: "R" },
    { name: "WaveSpeed", desc: "Ultra-fast FLUX inference", color: "#f97316", icon: "W" },
    { name: "Cloudflare", desc: "Workers AI, FLUX, SDXL, and more", color: "#f38020", icon: "C" },
    { name: "Kie.ai", desc: "Specialized creative models", color: "#10b981", icon: "K" },
    { name: "OpenAI", desc: "GPT-4 for prompt building", color: "#fff", icon: "O" },
  ];

  return (
    <section style={{ padding: "clamp(60px, 8vw, 100px) 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#92dce5", marginBottom: 16 }}>Providers</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 12px" }}>
            All your models, one place
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 400, margin: "0 auto" }}>
            Bring your own API keys. We never store them.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {providers.map((p, i) => (
            <div key={i} style={{
              padding: "24px 20px", borderRadius: 14,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              display: "flex", flexDirection: "column", gap: 12,
              transition: "background 0.15s, border-color 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${p.color}18`, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: p.color }}>{p.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Community ── */
function Community() {
  const posts = [
    { author: "sarah_creates", handle: "@sarah_creates", text: "Built a full product photography pipeline in 20 minutes. Background swap + style transfer chained together 🔥", likes: 142, avatar: "S", color: "#92dce5" },
    { author: "devmike", handle: "@devmike", text: "The node editor is insane. I automated my entire social media content workflow. Text → Image → Video in one click.", likes: 89, avatar: "D", color: "#d64933" },
    { author: "aiartist_jo", handle: "@aiartist_jo", text: "Finally a tool that lets me use FLUX, Kling AND Gemini in the same workflow. This is the future.", likes: 203, avatar: "J", color: "#a855f7" },
    { author: "productlead", handle: "@productlead", text: "Our team uses Pixza Studio for all our product shots now. Saves us 3 days of photography per launch.", likes: 67, avatar: "P", color: "#f97316" },
    { author: "motion_rex", handle: "@motion_rex", text: "Image to 3D to video pipeline is mind-blowing. Created a full product reveal animation in an afternoon.", likes: 178, avatar: "M", color: "#10b981" },
    { author: "ux_nina", handle: "@ux_nina", text: "The simple Create mode is perfect for non-technical teammates. They love it. No more waiting on me for AI images.", likes: 94, avatar: "N", color: "#eee5e9" },
  ];

  return (
    <section style={{ padding: "clamp(60px, 8vw, 100px) 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#92dce5", marginBottom: 16 }}>Community</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 12px" }}>
            Loved by creators
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 400, margin: "0 auto" }}>
            Join thousands of creators building with Pixza Studio.
          </p>
        </div>
        <div style={{ columns: 3, columnGap: 16 }} className="community-grid">
          {posts.map((p, i) => (
            <div key={i} style={{
              breakInside: "avoid", marginBottom: 16,
              padding: "20px", borderRadius: 14,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${p.color}20`, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: p.color, flexShrink: 0 }}>{p.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{p.author}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{p.handle}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: "0 0 12px" }}>{p.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                {p.likes}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA section ── */
function CTASection() {
  return (
    <section style={{ 
      padding: "clamp(60px, 8vw, 100px) 20px", 
      textAlign: "center", 
      position: "relative", 
      overflow: "hidden",
      backgroundColor: "#ffffff",
      color: "#ffffff",
      borderRadius: 20,
      margin: "0px 20px 80px",
    }}>
      <Orb style={{ width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(146,220,229,0.1) 0%, transparent 70%)" }} />

      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#030303", marginBottom: 20 }}>
        Get started today
      </p>
      <h2 style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#000000", margin: "0 0 20px", lineHeight: 1.05 }}>
        Build your first workflow<br />in minutes
      </h2>
      <p style={{ fontSize: 17, color: "#000000", maxWidth: 440, margin: "0 auto 48px", lineHeight: 1.6, opacity: 0.7 }}>
        No setup required. Open the studio and start connecting nodes immediately.
      </p>

      <Link href="/studio" style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "15px 32px", borderRadius: 14,
        background: "#000000", color: "#ffffff",
        fontSize: 16, fontWeight: 600, textDecoration: "none",
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        transition: "opacity 0.15s, transform 0.15s",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
      >
        Open Pixza Studio
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="landing-footer" style={{
      padding: "40px 32px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, #92dce5, #d64933)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/pixza-logo.png" alt="" style={{ width: 12, height: 12 }} />
        </div>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>© 2025 Pixza Studio by Lekh Labs</span>
      </div>
      <div className="landing-footer-links" style={{ display: "flex", gap: 24 }}>
        {[
          { label: "Examples", href: "/examples" },
          { label: "Onboarding", href: "/onboarding" },
          { label: "Profile", href: "/profile" },
          { label: "Discord", href: "#" },
          { label: "GitHub", href: "#" },
        ].map(l => (
          <Link key={l.label} href={l.href} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >{l.label}</Link>
        ))}
      </div>
    </footer>
  );
}

/* ── Page ── */
export default function LandingPage() {
  return (
    <div style={{
      background: "radial-gradient(circle at 50% 0%, #0c121e 0%, #040406 100%)",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative",
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5px, 15px) scale(1.05); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-cta { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
          .examples-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .community-grid { columns: 1 !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .examples-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
      <div className="animate-float" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <Orb style={{ width: 1000, height: 1000, top: "-20%", left: "-10%", background: "radial-gradient(circle, rgba(146,220,229,0.06) 0%, transparent 70%)" }} />
        <Orb style={{ width: 800, height: 800, bottom: "-10%", right: "-10%", background: "radial-gradient(circle, rgba(214,73,51,0.04) 0%, transparent 70%)" }} />
      </div>
      <Noise />
      <Nav />
      <Hero />
      <div style={{ position: "relative", zIndex: 2 }}>
        <SocialProof />
        <HowItWorks />
        <Features />
        <Examples />
        <Providers />
        <Community />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
