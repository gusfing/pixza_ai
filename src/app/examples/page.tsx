"use client";

import { useState } from "react";
import Link from "next/link";

const FILTERS = ["All", "Text→Image", "Image→Image", "Image→Video", "Text→Video", "Image→3D"];

const EXAMPLES = [
  { title: "Cinematic Product Shot", mode: "Text→Image", model: "FLUX Pro", provider: "fal", author: "sarah_creates", likes: 142, emoji: "📦", bg: "linear-gradient(135deg, #0a1628, #0d2040)", color: "#92dce5", prompt: "A luxury perfume bottle on a marble surface, cinematic lighting, 8K" },
  { title: "Watercolor Portrait", mode: "Image→Image", model: "FLUX Dev", provider: "fal", author: "aiartist_jo", likes: 89, emoji: "🎨", bg: "linear-gradient(135deg, #1a0a08, #2d1208)", color: "#d64933", prompt: "Transform into a soft watercolor painting with warm tones" },
  { title: "Product Animation", mode: "Image→Video", model: "Kling 1.6", provider: "fal", author: "motion_rex", likes: 203, emoji: "▶", bg: "linear-gradient(135deg, #0f0a1a, #1a0d2e)", color: "#a855f7", prompt: "Slow 360 rotation, studio lighting, product reveal" },
  { title: "City Timelapse", mode: "Text→Video", model: "Veo 2", provider: "gemini", author: "devmike", likes: 67, emoji: "🌆", bg: "linear-gradient(135deg, #081428, #0a1e3a)", color: "#92dce5", prompt: "Timelapse of a futuristic city at night, neon lights, rain" },
  { title: "Sneaker 3D Model", mode: "Image→3D", model: "Trellis", provider: "fal", author: "productlead", likes: 178, emoji: "👟", bg: "linear-gradient(135deg, #141414, #1e1e1e)", color: "#eee5e9", prompt: "High-quality 3D model from product photo" },
  { title: "Fantasy Landscape", mode: "Text→Image", model: "Gemini Imagen 4", provider: "gemini", author: "ux_nina", likes: 94, emoji: "🏔", bg: "linear-gradient(135deg, #080a14, #0c1020)", color: "#92dce5", prompt: "Epic fantasy mountain landscape, golden hour, dramatic clouds" },
  { title: "Style Transfer", mode: "Image→Image", model: "IP Adapter", provider: "fal", author: "sarah_creates", likes: 156, emoji: "🖼", bg: "linear-gradient(135deg, #0a1a0a, #0d2a0d)", color: "#10b981", prompt: "Apply Van Gogh Starry Night style to portrait" },
  { title: "Brand Video", mode: "Text→Video", model: "Kling 1.6", provider: "fal", author: "motion_rex", likes: 112, emoji: "🎬", bg: "linear-gradient(135deg, #1a0f0a, #2a1a0d)", color: "#f97316", prompt: "Minimalist brand reveal, logo animation, clean white background" },
  { title: "Architecture Viz", mode: "Text→Image", model: "FLUX Realism", provider: "fal", author: "devmike", likes: 88, emoji: "🏛", bg: "linear-gradient(135deg, #0a0a14, #14142a)", color: "#92dce5", prompt: "Modern glass building exterior, sunset, architectural photography" },
  { title: "Character 3D", mode: "Image→3D", model: "Zero123", provider: "fal", author: "aiartist_jo", likes: 234, emoji: "🧊", bg: "linear-gradient(135deg, #0a1414, #0d2020)", color: "#eee5e9", prompt: "Full 3D character model from concept art" },
  { title: "Food Photography", mode: "Text→Image", model: "FLUX Schnell", provider: "fal", author: "ux_nina", likes: 71, emoji: "🍜", bg: "linear-gradient(135deg, #1a0a0a, #2a1010)", color: "#d64933", prompt: "Ramen bowl, steam rising, dark moody restaurant lighting" },
  { title: "Nature Animation", mode: "Image→Video", model: "Wan I2V", provider: "fal", author: "productlead", likes: 145, emoji: "🌿", bg: "linear-gradient(135deg, #0a1a0a, #0d2a0d)", color: "#10b981", prompt: "Gentle wind through forest leaves, golden hour" },
];

function ExCard({ ex, onClick }: { ex: typeof EXAMPLES[0]; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, overflow: "hidden", cursor: "pointer",
        background: ex.bg, border: "1px solid rgba(255,255,255,0.07)",
        aspectRatio: "4/3", display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: 16, position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? "0 24px 60px rgba(0,0,0,0.6)" : "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", fontSize: 52, opacity: 0.2, pointerEvents: "none" }}>{ex.emoji}</div>
      {hov && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
          <div style={{ padding: "8px 18px", borderRadius: 8, background: "#fff", color: "#080808", fontSize: 13, fontWeight: 600 }}>Try this →</div>
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: `${ex.color}20`, color: ex.color, border: `1px solid ${ex.color}30`, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-block", marginBottom: 6 }}>{ex.mode}</span>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{ex.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{ex.model} · @{ex.author}</div>
      </div>
    </div>
  );
}

function Modal({ ex, onClose }: { ex: typeof EXAMPLES[0]; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0e0e10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: "100%", maxWidth: 560, overflow: "hidden" }}>
        <div style={{ background: ex.bg, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, opacity: 0.4 }}>{ex.emoji}</div>
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: `${ex.color}20`, color: ex.color, border: `1px solid ${ex.color}30`, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-block", marginBottom: 8 }}>{ex.mode}</span>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>{ex.title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>Prompt</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.6 }}>{ex.prompt}</p>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <div style={{ flex: 1, padding: "10px 14px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Model</p>
              <p style={{ fontSize: 13, color: "#fff", margin: 0, fontWeight: 500 }}>{ex.model}</p>
            </div>
            <div style={{ flex: 1, padding: "10px 14px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Provider</p>
              <p style={{ fontSize: 13, color: "#fff", margin: 0, fontWeight: 500 }}>{ex.provider}</p>
            </div>
            <div style={{ flex: 1, padding: "10px 14px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.07em" }}>By</p>
              <p style={{ fontSize: 13, color: "#fff", margin: 0, fontWeight: 500 }}>@{ex.author}</p>
            </div>
          </div>
          <Link href="/create" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 10, background: "#92dce5", color: "#080808", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
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
    <div style={{ background: "#040406", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @media (max-width: 640px) {
          .examples-filter { gap: 6px !important; }
          .examples-filter button { padding: 5px 12px !important; font-size: 12px !important; }
        }
      `}</style>
      {/* Header */}
      <header style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 50, background: "rgba(4,4,6,0.9)", backdropFilter: "blur(20px)", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/landing" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, #92dce5, #d64933)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/pixza-logo.png" alt="" style={{ width: 14, height: 14 }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Pixza Studio</span>
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>/</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Examples</span>
        </div>
        <Link href="/create" style={{ fontSize: 13, fontWeight: 500, padding: "6px 16px", borderRadius: 8, background: "#92dce5", color: "#080808", textDecoration: "none" }}>
          Start creating →
        </Link>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(24px, 4vw, 48px) 16px" }}>
        {/* Title */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 12px" }}>Community Examples</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", margin: 0 }}>Real outputs from the Pixza Studio community. Click any to see the prompt and try it yourself.</p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36, overflowX: "auto" }} className="examples-filter">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 16px", borderRadius: 99, border: "none", cursor: "pointer",
              background: filter === f ? "#92dce5" : "rgba(255,255,255,0.05)",
              color: filter === f ? "#080808" : "rgba(255,255,255,0.5)",
              fontSize: 13, fontWeight: filter === f ? 600 : 400,
              transition: "all 0.15s",
            }}>{f}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {filtered.map((ex, i) => (
            <ExCard key={i} ex={ex} onClick={() => setSelected(ex)} />
          ))}
        </div>
      </div>

      {selected && <Modal ex={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
