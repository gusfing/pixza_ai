"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "generations", label: "Generations", icon: "✦" },
  { id: "workflows", label: "Workflows", icon: "⬡" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const MOCK_GENERATIONS = [
  { id: 1, title: "Product Shot", mode: "Text→Image", model: "FLUX Pro", date: "2h ago", emoji: "📦", color: "#92dce5", bg: "linear-gradient(135deg, #0a1628, #0d2040)" },
  { id: 2, title: "Style Transfer", mode: "Image→Image", model: "FLUX Dev", date: "5h ago", emoji: "🎨", color: "#d64933", bg: "linear-gradient(135deg, #1a0a08, #2d1208)" },
  { id: 3, title: "Brand Video", mode: "Text→Video", model: "Kling 1.6", date: "1d ago", emoji: "🎬", color: "#a855f7", bg: "linear-gradient(135deg, #0f0a1a, #1a0d2e)" },
  { id: 4, title: "3D Model", mode: "Image→3D", model: "Trellis", date: "2d ago", emoji: "◉", color: "#eee5e9", bg: "linear-gradient(135deg, #141414, #1e1e1e)" },
  { id: 5, title: "Landscape", mode: "Text→Image", model: "Gemini Imagen 4", date: "3d ago", emoji: "🏔", color: "#92dce5", bg: "linear-gradient(135deg, #080a14, #0c1020)" },
  { id: 6, title: "Portrait Edit", mode: "Image→Image", model: "IP Adapter", date: "4d ago", emoji: "👤", color: "#10b981", bg: "linear-gradient(135deg, #0a1a0a, #0d2a0d)" },
];

const MOCK_WORKFLOWS = [
  { id: 1, name: "Product Photography Pipeline", nodes: 8, lastRun: "2h ago", status: "active" },
  { id: 2, name: "Social Media Content", nodes: 5, lastRun: "1d ago", status: "active" },
  { id: 3, name: "Style Transfer Batch", nodes: 4, lastRun: "3d ago", status: "draft" },
  { id: 4, name: "Video Generation", nodes: 6, lastRun: "1w ago", status: "draft" },
];

const STATS = [
  { label: "Generations", value: "247", change: "+12 this week" },
  { label: "Workflows", value: "8", change: "4 active" },
  { label: "Models used", value: "14", change: "across 4 providers" },
  { label: "Time saved", value: "~32h", change: "vs manual editing" },
];

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  return (
    <aside className="profile-sidebar" style={{ width: 220, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", padding: "24px 12px" }}>
      {/* Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px 20px", marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #92dce5, #d64933)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#080808", flexShrink: 0 }}>L</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Lekh Labs</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Free plan</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left",
              background: active === item.id ? "rgba(146,220,229,0.08)" : "transparent",
              color: active === item.id ? "#92dce5" : "rgba(255,255,255,0.45)",
              fontSize: 13, fontWeight: active === item.id ? 500 : 400,
              transition: "all 0.12s",
            }}
            onMouseEnter={e => { if (active !== item.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { if (active !== item.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        <Link href="/create" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 9, background: "rgba(146,220,229,0.08)", border: "1px solid rgba(146,220,229,0.15)", color: "#92dce5", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
          <span>✦</span> New generation
        </Link>
        <Link href="/studio" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>
          <span>⬡</span> Open Studio
        </Link>
      </div>
    </aside>
  );
}

function Overview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="stats-grid-4">
        {STATS.map(s => (
          <div key={s.label} style={{ padding: "20px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#92dce5", marginTop: 4 }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Recent generations */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Recent Generations</h2>
          <button style={{ fontSize: 12, color: "#92dce5", background: "none", border: "none", cursor: "pointer" }}>View all →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {MOCK_GENERATIONS.slice(0, 6).map(g => (
            <div key={g.id} style={{ borderRadius: 12, overflow: "hidden", background: g.bg, border: "1px solid rgba(255,255,255,0.07)", aspectRatio: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 12, position: "relative", cursor: "pointer" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", fontSize: 36, opacity: 0.2 }}>{g.emoji}</div>
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{g.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{g.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent workflows */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Workflows</h2>
          <Link href="/studio" style={{ fontSize: 12, color: "#92dce5", textDecoration: "none" }}>Open Studio →</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MOCK_WORKFLOWS.map(w => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(146,220,229,0.08)", border: "1px solid rgba(146,220,229,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#92dce5" }}>⬡</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{w.nodes} nodes · Last run {w.lastRun}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: w.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)", color: w.status === "active" ? "#10b981" : "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                  {w.status}
                </span>
                <button style={{ padding: "5px 12px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Open</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Generations() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Text→Image", "Image→Image", "Image→Video", "Text→Video", "Image→3D"];
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", borderRadius: 99, border: "none", cursor: "pointer", background: filter === f ? "#92dce5" : "rgba(255,255,255,0.05)", color: filter === f ? "#080808" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: filter === f ? 600 : 400, transition: "all 0.15s" }}>{f}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {MOCK_GENERATIONS.map(g => (
          <div key={g.id} style={{ borderRadius: 14, overflow: "hidden", background: g.bg, border: "1px solid rgba(255,255,255,0.07)", aspectRatio: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 14, position: "relative", cursor: "pointer" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", fontSize: 44, opacity: 0.2 }}>{g.emoji}</div>
            <div style={{ position: "relative" }}>
              <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 99, background: `${g.color}20`, color: g.color, border: `1px solid ${g.color}30`, display: "inline-block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>{g.mode}</span>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{g.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{g.model} · {g.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings() {
  const [name, setName] = useState("Lekh Labs");
  const [email, setEmail] = useState("hello@lekhlabs.com");

  const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 16px" }}>Profile</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Plan</h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>You're on the Free plan.</p>
        <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(146,220,229,0.05)", border: "1px solid rgba(146,220,229,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Free</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Unlimited local generations with your own API keys</div>
          </div>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "rgba(146,220,229,0.15)", color: "#92dce5", fontWeight: 600 }}>CURRENT</span>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Danger Zone</h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 12px" }}>Irreversible actions.</p>
        <button style={{ padding: "8px 18px", borderRadius: 9, background: "rgba(214,73,51,0.1)", border: "1px solid rgba(214,73,51,0.25)", color: "#d64933", fontSize: 13, cursor: "pointer" }}>
          Clear all local data
        </button>
      </div>

      <button style={{ alignSelf: "flex-start", padding: "9px 22px", borderRadius: 9, background: "#92dce5", border: "none", color: "#080808", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        Save changes
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const [active, setActive] = useState("overview");

  const content: Record<string, React.ReactNode> = {
    overview: <Overview />,
    generations: <Generations />,
    workflows: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MOCK_WORKFLOWS.map(w => (
          <div key={w.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(146,220,229,0.08)", border: "1px solid rgba(146,220,229,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#92dce5" }}>⬡</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{w.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{w.nodes} nodes · Last run {w.lastRun}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 99, background: w.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)", color: w.status === "active" ? "#10b981" : "rgba(255,255,255,0.3)", fontWeight: 600 }}>{w.status}</span>
              <Link href="/studio" style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, textDecoration: "none" }}>Open</Link>
            </div>
          </div>
        ))}
      </div>
    ),
    settings: <Settings />,
  };

  const titles: Record<string, string> = { overview: "Overview", generations: "My Generations", workflows: "My Workflows", settings: "Settings" };

  return (
    <div style={{ minHeight: "100vh", background: "#040406", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @media (max-width: 768px) {
          .profile-sidebar { display: none !important; }
          .profile-mobile-nav { display: flex !important; }
          .profile-main { padding: 20px 16px !important; }
          .stats-grid-4 { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
      {/* Top bar */}
      <header style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(4,4,6,0.9)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/landing" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #92dce5, #d64933)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/pixza-logo.png" alt="" style={{ width: 13, height: 13 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Pixza Studio</span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/create" style={{ fontSize: 12, padding: "5px 14px", borderRadius: 7, background: "rgba(146,220,229,0.08)", border: "1px solid rgba(146,220,229,0.2)", color: "#92dce5", textDecoration: "none" }}>Create</Link>
          <Link href="/studio" style={{ fontSize: 12, padding: "5px 14px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Studio</Link>
        </div>
      </header>

      <div className="profile-body" style={{ flex: 1, display: "flex", overflow: "hidden", flexDirection: "row" }}>
        {/* Mobile tab nav */}
        <div className="profile-mobile-nav" style={{ display: "none", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 16px", flexShrink: 0, background: "#040406" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)} style={{ padding: "12px 16px", border: "none", background: "transparent", color: active === item.id ? "#92dce5" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: active === item.id ? 600 : 400, cursor: "pointer", borderBottom: active === item.id ? "2px solid #92dce5" : "2px solid transparent", whiteSpace: "nowrap" }}>
              {item.label}
            </button>
          ))}
        </div>
        <Sidebar active={active} setActive={setActive} />
        <main className="profile-main" style={{ flex: 1, overflowY: "auto", padding: 32, minWidth: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 28px", letterSpacing: "-0.02em" }}>{titles[active]}</h1>
          {content[active]}
        </main>
      </div>
    </div>
  );
}
