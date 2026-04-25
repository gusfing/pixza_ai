"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkflowStore } from "@/store/workflowStore";
import { useWPAuth } from "@/lib/wp-auth-context";
import { wpUpdateUserMeta } from "@/lib/wordpress";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Pixza Studio",
    subtitle: "The AI creative studio for everyone",
    content: "welcome",
  },
  {
    id: "mode",
    title: "How do you want to create?",
    subtitle: "You can always switch later",
    content: "mode",
  },
  {
    id: "providers",
    title: "Connect your AI providers",
    subtitle: "Bring your own API keys — we never store them on our servers",
    content: "providers",
  },
  {
    id: "done",
    title: "You're all set!",
    subtitle: "Let's make something amazing",
    content: "done",
  },
];

const MODES = [
  { id: "simple", icon: "✦", label: "Simple Mode", desc: "One prompt, one output. Perfect for getting started fast.", href: "/create" },
  { id: "studio", icon: "⬡", label: "Node Studio", desc: "Build complex multi-step AI pipelines visually.", href: "/studio" },
  { id: "both", icon: "◈", label: "Both", desc: "I'll use both depending on what I need.", href: "/create" },
];

const PROVIDERS = [
  { id: "gemini", name: "Google Gemini", desc: "Imagen 3 & 4, Veo 2 & 3 video", placeholder: "AIza...", color: "#4285f4", required: false, free: true },
  { id: "fal", name: "fal.ai", desc: "FLUX, Kling, Wan, MiniMax and 100+ models", placeholder: "fal_...", color: "#a855f7", required: false, free: false },
  { id: "replicate", name: "Replicate", desc: "1000s of open-source models", placeholder: "r8_...", color: "#ef4444", required: false, free: false },
  { id: "wavespeed", name: "WaveSpeed", desc: "Ultra-fast FLUX inference", placeholder: "ws_...", color: "#f97316", required: false, free: false },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { token } = useWPAuth();
  const updateProviderApiKey = useWorkflowStore(s => s.updateProviderApiKey);
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const current = STEPS[step];
  const progress = ((step) / (STEPS.length - 1)) * 100;

  const handleNext = async () => {
    // On providers step: save keys to workflow store
    if (current.content === "providers") {
      Object.entries(keys).forEach(([provider, key]) => {
        if (key.trim()) updateProviderApiKey(provider as any, key.trim());
      });
    }

    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Mark onboarding done in WordPress
      if (token) {
        try {
          await wpUpdateUserMeta(token, { onboarding_done: true } as any);
        } catch { /* non-fatal */ }
      }
      const dest = selectedMode === "studio" ? "/studio" : "/create";
      router.push(dest);
    }
  };

  const canNext = current.content === "mode" ? !!selectedMode : true;

  return (
    <div style={{ minHeight: "100vh", background: "#040406", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px 40px" }}>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.06)" }}>
        <div style={{ height: "100%", background: "#92dce5", width: `${progress}%`, transition: "width 0.4s ease" }} />
      </div>

      {/* Logo */}
      <div style={{ position: "fixed", top: 20, left: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, #92dce5, #d64933)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/pixza-logo.png" alt="" style={{ width: 14, height: 14 }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Pixza Studio</span>
      </div>

      {/* Step indicator */}
      <div style={{ position: "fixed", top: 24, right: 24, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
        {step + 1} / {STEPS.length}
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 560, animation: "fadeIn 0.3s ease" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 10px" }}>{current.title}</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0 }}>{current.subtitle}</p>
        </div>

        {/* Welcome */}
        {current.content === "welcome" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "✦", label: "50+ AI models", desc: "Gemini, FLUX, Kling, Veo and more" },
              { icon: "⬡", label: "Visual node editor", desc: "Build complex pipelines without code" },
              { icon: "◈", label: "Simple create mode", desc: "One prompt, instant results" },
              { icon: "◉", label: "Community templates", desc: "Start from proven workflows" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(146,220,229,0.1)", border: "1px solid rgba(146,220,229,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#92dce5", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mode selection */}
        {current.content === "mode" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "18px 20px", borderRadius: 14, border: "none", cursor: "pointer", textAlign: "left",
                  background: selectedMode === m.id ? "rgba(146,220,229,0.08)" : "rgba(255,255,255,0.03)",
                  outline: selectedMode === m.id ? "2px solid rgba(146,220,229,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 11, background: selectedMode === m.id ? "rgba(146,220,229,0.15)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: selectedMode === m.id ? "#92dce5" : "rgba(255,255,255,0.4)", flexShrink: 0, transition: "all 0.15s" }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: selectedMode === m.id ? "#fff" : "rgba(255,255,255,0.8)", marginBottom: 3 }}>{m.label}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{m.desc}</div>
                </div>
                {selectedMode === m.id && (
                  <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "#92dce5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#080808" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Providers */}
        {current.content === "providers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PROVIDERS.map(p => (
              <div key={p.id} style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${p.color}18`, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: p.color }}>{p.name[0]}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{p.desc}</div>
                    </div>
                  </div>
                  {p.free && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 600 }}>FREE TIER</span>}
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showKey[p.id] ? "text" : "password"}
                    value={keys[p.id] || ""}
                    onChange={e => setKeys(k => ({ ...k, [p.id]: e.target.value }))}
                    placeholder={p.placeholder}
                    style={{ width: "100%", padding: "8px 36px 8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
                  />
                  <button onClick={() => setShowKey(s => ({ ...s, [p.id]: !s[p.id] }))} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 11 }}>
                    {showKey[p.id] ? "hide" : "show"}
                  </button>
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", margin: "4px 0 0" }}>
              Keys are stored locally in your browser only. You can add them later in Settings.
            </p>
          </div>
        )}

        {/* Done */}
        {current.content === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 32px" }}>
              Your workspace is ready. Start with a simple prompt or explore the node canvas — the choice is yours.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/create" style={{ padding: "10px 22px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none" }}>Simple Mode</a>
              <a href="/studio" style={{ padding: "10px 22px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none" }}>Node Studio</a>
              <a href="/examples" style={{ padding: "10px 22px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none" }}>Browse Examples</a>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32 }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.push("/landing")}
            style={{ padding: "10px 20px", borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            {step === 0 ? "← Back" : "← Previous"}
          </button>

          <button
            onClick={handleNext}
            disabled={!canNext}
            style={{
              padding: "10px 28px", borderRadius: 10, border: "none",
              background: canNext ? "#92dce5" : "rgba(255,255,255,0.08)",
              color: canNext ? "#080808" : "rgba(255,255,255,0.2)",
              fontSize: 14, fontWeight: 600, cursor: canNext ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            {step === STEPS.length - 1 ? "Go to Studio →" : current.content === "providers" ? "Skip for now →" : "Continue →"}
          </button>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
