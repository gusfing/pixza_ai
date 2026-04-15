"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWorkflowStore } from "@/store/workflowStore";

type Tab = "Image" | "Video" | "Audio" | "3D";
type Screen = "home" | "generate" | "templates" | "gallery" | "settings";

interface Model { provider: string; modelId: string; label: string; tabs: Tab[]; }

const MODELS: Model[] = [
  { provider: "gemini", modelId: "nano-banana-pro", label: "Gemini Imagen 3", tabs: ["Image"] },
  { provider: "gemini", modelId: "nano-banana-2", label: "Gemini Imagen 4", tabs: ["Image"] },
  { provider: "fal", modelId: "fal-ai/flux-pro", label: "FLUX.1 Pro", tabs: ["Image"] },
  { provider: "fal", modelId: "fal-ai/flux/schnell", label: "FLUX.1 Schnell", tabs: ["Image"] },
  { provider: "fal", modelId: "fal-ai/flux-realism", label: "FLUX Realism", tabs: ["Image"] },
  { provider: "wavespeed", modelId: "wavespeed-ai/flux-dev-ultra-fast", label: "FLUX Ultra Fast", tabs: ["Image"] },
  { provider: "fal", modelId: "fal-ai/flux/dev/image-to-image", label: "FLUX Dev I2I", tabs: ["Image"] },
  { provider: "gemini", modelId: "veo-2.0-generate-001", label: "Veo 2", tabs: ["Video"] },
  { provider: "gemini", modelId: "veo-3.0-generate-preview", label: "Veo 3", tabs: ["Video"] },
  { provider: "fal", modelId: "fal-ai/kling-video/v1.6/pro/text-to-video", label: "Kling 1.6 Pro", tabs: ["Video"] },
  { provider: "fal", modelId: "fal-ai/wan-t2v", label: "Wan T2V", tabs: ["Video"] },
  { provider: "fal", modelId: "fal-ai/minimax-video", label: "MiniMax Video", tabs: ["Video"] },
  { provider: "fal", modelId: "fal-ai/kling-video/v1.6/pro/image-to-video", label: "Kling I2V", tabs: ["Video"] },
  { provider: "fal", modelId: "fal-ai/stable-audio", label: "Stable Audio", tabs: ["Audio"] },
  { provider: "fal", modelId: "fal-ai/trellis", label: "Trellis", tabs: ["3D"] },
  { provider: "fal", modelId: "fal-ai/stable-zero123", label: "Zero123", tabs: ["3D"] },
  { provider: "replicate", modelId: "stability-ai/triposr", label: "TripoSR", tabs: ["3D"] },
  { provider: "cloudflare", modelId: "@cf/black-forest-labs/flux-1-schnell", label: "FLUX.1 Schnell (CF)", tabs: ["Image"] },
  { provider: "cloudflare", modelId: "@cf/stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL Base (CF)", tabs: ["Image"] },
  { provider: "cloudflare", modelId: "@cf/bytedance/stable-diffusion-xl-lightning", label: "SDXL Lightning (CF)", tabs: ["Image"] },
  { provider: "cloudflare", modelId: "@cf/lykon/dreamshaper-8-lcm", label: "DreamShaper 8 (CF)", tabs: ["Image"] },
  { provider: "cloudflare", modelId: "@cf/runwayml/stable-diffusion-v1-5-img2img", label: "SD 1.5 Img2Img (CF)", tabs: ["Image"] },
];

const TEMPLATES = [
  { id: "product-float", tab: "Image" as Tab, title: "Floating Product Shot", model: "FLUX.1 Pro", provider: "fal", modelId: "fal-ai/flux-pro", emoji: "📦", color: "#d64933", prompt: "Isolate the product from its original background. Place it on a soft neutral background. Make it float slightly with a soft shadow underneath for elevation. Use balanced studio lighting and sharp focus to highlight details, preserving original logos, branding, colors, textures, and stitching." },
  { id: "cinematic-portrait", tab: "Image" as Tab, title: "Cinematic Portrait", model: "FLUX Realism", provider: "fal", modelId: "fal-ai/flux-realism", emoji: "🎬", color: "#92dce5", prompt: "Cinematic portrait photography, shallow depth of field, golden hour lighting, film grain, 35mm lens, professional color grading, bokeh background" },
  { id: "style-transfer", tab: "Image" as Tab, title: "Artistic Style Transfer", model: "FLUX Dev I2I", provider: "fal", modelId: "fal-ai/flux/dev/image-to-image", emoji: "🎨", color: "#f97316", prompt: "Transform into a painterly impressionist style, vibrant colors, visible brushstrokes, artistic interpretation while preserving the subject" },
  { id: "concept-art", tab: "Image" as Tab, title: "Epic Concept Art", model: "Gemini Imagen 4", provider: "gemini", modelId: "nano-banana-2", emoji: "✦", color: "#92dce5", prompt: "Epic fantasy concept art, dramatic lighting, detailed environment, professional illustration, cinematic composition, 8K resolution" },
  { id: "product-video", tab: "Video" as Tab, title: "Product Reveal", model: "Kling 1.6 Pro", provider: "fal", modelId: "fal-ai/kling-video/v1.6/pro/text-to-video", emoji: "🛍", color: "#a855f7", prompt: "Elegant product reveal, slow 360 rotation, studio lighting, dark background, luxury feel, smooth camera movement" },
  { id: "city-timelapse", tab: "Video" as Tab, title: "City Timelapse", model: "Veo 2", provider: "gemini", modelId: "veo-2.0-generate-001", emoji: "🌆", color: "#4285f4", prompt: "Timelapse of a futuristic city at night, neon lights reflecting on wet streets, cars as light trails, dramatic sky" },
  { id: "3d-product", tab: "3D" as Tab, title: "3D Product Model", model: "Trellis", provider: "fal", modelId: "fal-ai/trellis", emoji: "◉", color: "#eee5e9", prompt: "High quality 3D model from product photo, clean geometry, accurate textures" },
  { id: "ambient-music", tab: "Audio" as Tab, title: "Ambient Soundtrack", model: "Stable Audio", provider: "fal", modelId: "fal-ai/stable-audio", emoji: "🎵", color: "#10b981", prompt: "Cinematic ambient music, ethereal pads, subtle percussion, emotional and atmospheric" },
];

const GALLERY_ITEMS = [
  { emoji: "📦", title: "Product Shot", mode: "Image", color: "#d64933", bg: "linear-gradient(135deg,#1a0a08,#2d1208)" },
  { emoji: "🎬", title: "Portrait", mode: "Image", color: "#92dce5", bg: "linear-gradient(135deg,#081428,#0a1e3a)" },
  { emoji: "🌆", title: "City Video", mode: "Video", color: "#4285f4", bg: "linear-gradient(135deg,#080a14,#0c1020)" },
  { emoji: "🎨", title: "Style Art", mode: "Image", color: "#f97316", bg: "linear-gradient(135deg,#1a0f0a,#2a1a0d)" },
  { emoji: "◉", title: "3D Model", mode: "3D", color: "#eee5e9", bg: "linear-gradient(135deg,#141414,#1e1e1e)" },
  { emoji: "🎵", title: "Soundtrack", mode: "Audio", color: "#10b981", bg: "linear-gradient(135deg,#0a1a0a,#0d2a0d)" },
];

const PCOLORS: Record<string, string> = { gemini: "#4285f4", fal: "#a855f7", replicate: "#ef4444", wavespeed: "#f97316", cloudflare: "#f38020" };
const TABS: Tab[] = ["Image", "Video", "Audio", "3D"];
const TAB_ICONS: Record<Tab, string> = { Image: "🖼", Video: "▶", Audio: "🎵", "3D": "◉" };

const C = {
  bg: "#0a0a0c",
  surface: "#141416",
  surface2: "#1c1c1f",
  border: "rgba(255,255,255,0.08)",
  text: "#fff",
  text2: "rgba(255,255,255,0.5)",
  text3: "rgba(255,255,255,0.25)",
  accent: "#92dce5",
  action: "#d64933",
};

/* ── Shared components ─────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.text3, margin: "0 0 8px" }}>{children}</p>;
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "4px 0" }} />;
}

function ModelDropdown({ models, value, onChange, getKey }: {
  models: Model[]; value: string; onChange: (v: string) => void; getKey: (p: string) => string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sel = models.find(m => m.modelId === value) || models[0];

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 16px", borderRadius: 14, border: `1px solid ${C.border}`,
        background: C.surface2, color: C.text, fontSize: 15, fontWeight: 500, cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: PCOLORS[sel?.provider] || "#7c7c7c", flexShrink: 0 }} />
          <span>{sel?.label || "Select model"}</span>
        </div>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.text3} strokeWidth={2.5} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 200, background: "#1a1a1e", border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}>
          {Array.from(new Set(models.map(m => m.provider))).map((prov, pi) => (
            <div key={prov}>
              {pi > 0 && <Divider />}
              <div style={{ padding: "10px 16px 5px", display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: PCOLORS[prov] || "#7c7c7c" }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.text3 }}>{prov}</span>
                {!getKey(prov) && prov !== "gemini" && <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 7px", borderRadius: 5, background: "rgba(214,73,51,0.15)", color: C.action }}>no key</span>}
              </div>
              {models.filter(m => m.provider === prov).map(m => {
                const active = value === m.modelId;
                return (
                  <button key={m.modelId} onClick={() => { onChange(m.modelId); setOpen(false); }} style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px 12px 30px", border: "none",
                    background: active ? "rgba(146,220,229,0.08)" : "transparent",
                    color: active ? C.text : C.text2, fontSize: 14, cursor: "pointer", textAlign: "left",
                  }}>
                    {m.label}
                    {active && <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RefSlot({ label, icon, image, onUpload, onClear }: {
  label: string; icon: string; image?: string; onUpload: (d: string) => void; onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div onClick={() => !image && ref.current?.click()} style={{
      flex: 1, aspectRatio: "1", borderRadius: 14, overflow: "hidden",
      cursor: image ? "default" : "pointer",
      background: image ? "transparent" : C.surface2,
      border: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 5, position: "relative", minWidth: 0,
    }}>
      {image ? (
        <>
          <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button onClick={e => { e.stopPropagation(); onClear(); }} style={{
            position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%",
            background: "rgba(0,0,0,0.85)", border: "none", color: "#fff", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </>
      ) : (
        <>
          <span style={{ fontSize: 22, opacity: 0.4 }}>{icon}</span>
          <span style={{ fontSize: 11, color: C.text3 }}>{label}</span>
        </>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
        const f = e.target.files?.[0]; if (!f) return;
        const r = new FileReader(); r.onload = ev => onUpload(ev.target?.result as string); r.readAsDataURL(f);
      }} />
    </div>
  );
}

/* ── Screens ───────────────────────────────────────────────── */

function HomeScreen({ onStart, onTemplate }: { onStart: (tab: Tab) => void; onTemplate: () => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.03em" }}>Create</h1>
          <p style={{ fontSize: 13, color: C.text3, margin: "4px 0 0" }}>What will you make today?</p>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #92dce5, #d64933)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#0a0a0c" }}>P</div>
      </div>

      {/* Quick create */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => onStart(t)} style={{
            padding: "20px 16px", borderRadius: 18, border: `1px solid ${C.border}`,
            background: C.surface, cursor: "pointer", textAlign: "left",
            display: "flex", flexDirection: "column", gap: 8,
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 28 }}>{TAB_ICONS[t]}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{t}</div>
              <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>
                {t === "Image" ? "Generate images" : t === "Video" ? "Create videos" : t === "Audio" ? "Make music" : "Build 3D models"}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Templates CTA */}
      <button onClick={onTemplate} style={{
        width: "100%", padding: "16px 20px", borderRadius: 18, border: `1px solid ${C.border}`,
        background: `linear-gradient(135deg, rgba(146,220,229,0.08), rgba(214,73,51,0.08))`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 28,
      }}>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Browse Templates</div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{TEMPLATES.length} ready-to-use prompts</div>
        </div>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>

      {/* Recent */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: 0 }}>Recent</p>
          <span style={{ fontSize: 12, color: C.accent }}>See all</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {GALLERY_ITEMS.map((g, i) => (
            <div key={i} style={{ borderRadius: 14, overflow: "hidden", background: g.bg, border: `1px solid ${C.border}`, aspectRatio: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 10, position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", fontSize: 28, opacity: 0.25 }}>{g.emoji}</div>
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{g.title}</div>
                <div style={{ fontSize: 10, color: C.text3 }}>{g.mode}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenerateScreen({ tab, setTab, onBack, getKey }: {
  tab: Tab; setTab: (t: Tab) => void; onBack: () => void; getKey: (p: string) => string | null;
}) {
  const [prompt, setPrompt] = useState("");
  const [aiPrompt, setAiPrompt] = useState(true);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [modelId, setModelId] = useState(MODELS.filter(m => m.tabs.includes(tab))[0]?.modelId || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const providerSettings = useWorkflowStore(s => s.providerSettings);

  const tabModels = MODELS.filter(m => m.tabs.includes(tab));
  const selModel = tabModels.find(m => m.modelId === modelId) || tabModels[0];
  const outputType = tab === "Video" ? "video" : tab === "3D" ? "3d" : tab === "Audio" ? "audio" : "image";

  useEffect(() => {
    const first = tabModels[0];
    if (first && !tabModels.find(m => m.modelId === modelId)) setModelId(first.modelId);
    setResult(null); setError(null); setShowResult(false);
  }, [tab]);

  const canGenerate = !loading && prompt.trim().length > 0;

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true); setError(null); setResult(null); setShowResult(false);
    try {
      const provider = selModel?.provider || "gemini";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const body: Record<string, unknown> = {
        prompt: prompt.trim(),
        selectedModel: { provider, modelId: selModel?.modelId, displayName: selModel?.label },
        aspectRatio: "1:1",
      };
      if (refImage) { body.images = [refImage]; body.dynamicInputs = { image_url: refImage }; }
      if (tab === "Video") body.mediaType = "video";
      if (tab === "3D") body.mediaType = "3d";
      if (tab === "Audio") body.mediaType = "audio";

      const res = await fetch("/api/generate", { method: "POST", headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");
      let out = null;
      if (data.video) out = `data:video/mp4;base64,${data.video}`;
      else if (data.videoUrl) out = data.videoUrl;
      else if (data.model3dUrl) out = data.model3dUrl;
      else if (data.audio) out = `data:audio/mp3;base64,${data.audio}`;
      else if (data.image) out = data.image;
      else throw new Error("No output received");
      setResult(out); setShowResult(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Result overlay */}
      {showResult && result && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, background: C.bg, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 0" }}>
            <button onClick={() => setShowResult(false)} style={{ background: "none", border: "none", color: C.text2, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back
            </button>
            <a href={result} download="output.png" style={{ padding: "8px 16px", borderRadius: 10, background: C.accent, color: "#0a0a0c", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Save</a>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            {outputType === "video"
              ? <video src={result} controls autoPlay loop style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 16 }} />
              : <img src={result} alt="output" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 16, objectFit: "contain" }} />
            }
          </div>
          <div style={{ padding: "0 16px 32px", display: "flex", gap: 10 }}>
            <button onClick={() => { setShowResult(false); setResult(null); }} style={{ flex: 1, padding: "14px 0", borderRadius: 14, border: `1px solid ${C.border}`, background: C.surface2, color: C.text2, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>New</button>
            <button onClick={generate} style={{ flex: 1, padding: "14px 0", borderRadius: 14, border: "none", background: C.accent, color: "#0a0a0c", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Regenerate</button>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3, padding: "12px 16px 0", background: C.bg, flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
            background: tab === t ? "#fff" : "transparent",
            color: tab === t ? "#0a0a0c" : C.text2,
            transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {/* Scrollable form */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 16px" }}>

        {/* Model */}
        <div style={{ marginBottom: 20 }}>
          <Label>Model</Label>
          <ModelDropdown models={tabModels} value={modelId} onChange={setModelId} getKey={getKey} />
        </div>

        {/* References */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Label>References</Label>
            <span style={{ fontSize: 12, color: C.text3 }}>{(refImage ? 1 : 0) + (styleImage ? 1 : 0)}/4</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <RefSlot label="Style" icon="★" image={styleImage || undefined} onUpload={setStyleImage} onClear={() => setStyleImage(null)} />
            <RefSlot label="Character" icon="👤" image={undefined} onUpload={() => {}} onClear={() => {}} />
            <RefSlot label="Image" icon="🖼" image={refImage || undefined} onUpload={setRefImage} onClear={() => setRefImage(null)} />
            <div style={{ flex: 1, aspectRatio: "1", borderRadius: 14, border: `1px dashed rgba(255,255,255,0.12)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", minWidth: 0 }}>
              <span style={{ fontSize: 22, color: C.text3 }}>+</span>
              <span style={{ fontSize: 11, color: C.text3 }}>Add</span>
            </div>
          </div>
        </div>

        {/* Prompt */}
        <div style={{ marginBottom: 16 }}>
          <Label>Prompt</Label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={tab === "Image" ? "Describe the image..." : tab === "Video" ? "Describe the video scene..." : tab === "Audio" ? "Describe the sound..." : "Describe the 3D object..."}
            rows={5}
            style={{
              width: "100%", resize: "none", background: C.surface2,
              border: `1px solid ${C.border}`, borderRadius: 16,
              padding: "14px 16px", color: C.text, fontSize: 15, lineHeight: 1.65,
              outline: "none", fontFamily: "inherit", boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "rgba(146,220,229,0.5)")}
            onBlur={e => (e.target.style.borderColor = C.border)}
          />
          {/* AI prompt toggle row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div onClick={() => setAiPrompt(!aiPrompt)} style={{
                width: 42, height: 24, borderRadius: 12, cursor: "pointer", position: "relative",
                background: aiPrompt ? C.accent : "rgba(255,255,255,0.15)", transition: "background 0.2s",
              }}>
                <div style={{ position: "absolute", top: 3, left: aiPrompt ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
              </div>
              <span style={{ fontSize: 13, color: C.text2 }}>AI prompt</span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {["✦", "⟳", "⊞"].map((icon, i) => (
                <button key={i} style={{ background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: 16, padding: 0 }}>{icon}</button>
              ))}
              <button onClick={() => setPrompt("")} style={{ background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: 16, padding: 0 }}>✕</button>
            </div>
          </div>
        </div>

        {/* API key warning */}
        {selModel && selModel.provider !== "gemini" && !getKey(selModel.provider) && (
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(214,73,51,0.08)", border: "1px solid rgba(214,73,51,0.2)", fontSize: 13, color: C.action, marginBottom: 16 }}>
            No {selModel.provider} API key. <Link href="/studio" style={{ color: C.action, textDecoration: "underline" }}>Add in Settings</Link>
          </div>
        )}

        {error && (
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(214,73,51,0.08)", border: "1px solid rgba(214,73,51,0.2)", fontSize: 13, color: C.action, marginBottom: 16, lineHeight: 1.5 }}>{error}</div>
        )}
      </div>

      {/* Fixed bottom actions */}
      <div style={{ padding: "12px 16px", background: C.bg, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={generate} disabled={!canGenerate} style={{
          width: "100%", padding: "16px 0", borderRadius: 16, border: "none",
          background: loading ? "rgba(146,220,229,0.3)" : canGenerate ? C.accent : C.surface2,
          color: canGenerate ? "#0a0a0c" : C.text3,
          fontSize: 16, fontWeight: 700, cursor: canGenerate ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.15s",
          boxShadow: canGenerate && !loading ? "0 4px 24px rgba(146,220,229,0.3)" : "none",
        }}>
          {loading ? (
            <>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(10,10,12,0.3)", borderTopColor: "#0a0a0c", animation: "spin 0.8s linear infinite" }} />
              Generating...
            </>
          ) : `Generate ${tab}`}
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

function TemplatesScreen({ onSelect }: { onSelect: (t: typeof TEMPLATES[0]) => void }) {
  const [activeTab, setActiveTab] = useState<Tab | "All">("All");
  const tabs: (Tab | "All")[] = ["All", "Image", "Video", "Audio", "3D"];
  const filtered = activeTab === "All" ? TEMPLATES : TEMPLATES.filter(t => t.tab === activeTab);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "20px 16px 0", flexShrink: 0 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 16px", letterSpacing: "-0.02em" }}>Templates</h2>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "7px 16px", borderRadius: 99, border: "none", cursor: "pointer", whiteSpace: "nowrap",
              background: activeTab === t ? C.accent : C.surface2,
              color: activeTab === t ? "#0a0a0c" : C.text2,
              fontSize: 13, fontWeight: activeTab === t ? 700 : 400,
              transition: "all 0.15s", flexShrink: 0,
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 100px" }}>
        {filtered.map(t => (
          <button key={t.id} onClick={() => onSelect(t)} style={{
            width: "100%", display: "flex", alignItems: "flex-start", gap: 14,
            padding: "16px", borderRadius: 18, border: `1px solid ${C.border}`,
            background: C.surface, cursor: "pointer", textAlign: "left", marginBottom: 10,
            transition: "all 0.15s",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${t.color}18`, border: `1px solid ${t.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{t.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{t.title}</span>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: `${t.color}18`, color: t.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.tab}</span>
              </div>
              <div style={{ fontSize: 12, color: C.text3, marginBottom: 6 }}>{t.model}</div>
              <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.prompt}</div>
            </div>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.text3} strokeWidth={2} style={{ flexShrink: 0, marginTop: 4 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function GalleryScreen() {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 20px", letterSpacing: "-0.02em" }}>Gallery</h2>
      <div style={{ columns: 2, columnGap: 10 }}>
        {[...GALLERY_ITEMS, ...GALLERY_ITEMS].map((g, i) => (
          <div key={i} style={{ breakInside: "avoid", marginBottom: 10, borderRadius: 16, overflow: "hidden", background: g.bg, border: `1px solid ${C.border}`, aspectRatio: i % 3 === 0 ? "3/4" : "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 12, position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", fontSize: 36, opacity: 0.2 }}>{g.emoji}</div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{g.title}</div>
              <div style={{ fontSize: 10, color: C.text3 }}>{g.mode}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsScreen({ getKey }: { getKey: (p: string) => string | null }) {
  const PROVIDERS = [
    { id: "gemini", name: "Google Gemini", color: "#4285f4", placeholder: "AIza...", free: true },
    { id: "fal", name: "fal.ai", color: "#a855f7", placeholder: "fal_..." },
    { id: "replicate", name: "Replicate", color: "#ef4444", placeholder: "r8_..." },
    { id: "wavespeed", name: "WaveSpeed", color: "#f97316", placeholder: "ws_..." },
  ];
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Settings</h2>
      <p style={{ fontSize: 13, color: C.text3, margin: "0 0 24px" }}>Keys stored locally in your browser only.</p>

      <Label>API Keys</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {PROVIDERS.map(p => (
          <div key={p.id} style={{ padding: "16px", borderRadius: 16, background: C.surface, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${p.color}18`, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: p.color }}>{p.name[0]}</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</span>
              </div>
              {p.free && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 99, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 700 }}>FREE</span>}
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={show[p.id] ? "text" : "password"}
                value={keys[p.id] || ""}
                onChange={e => setKeys(k => ({ ...k, [p.id]: e.target.value }))}
                placeholder={p.placeholder}
                style={{ width: "100%", padding: "11px 44px 11px 14px", borderRadius: 12, background: C.surface2, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
              />
              <button onClick={() => setShow(s => ({ ...s, [p.id]: !s[p.id] }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: 12 }}>
                {show[p.id] ? "hide" : "show"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, rgba(146,220,229,0.06), rgba(214,73,51,0.06))", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>Upgrade to Pro</div>
        <div style={{ fontSize: 13, color: C.text2, marginBottom: 14 }}>Unlimited generations, priority queue, advanced models.</div>
        <button style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #f97316, #d64933)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          👑 Upgrade — $9/mo
        </button>
      </div>
    </div>
  );
}

/* ── Morphic bottom nav ────────────────────────────────────── */
function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const items: { id: Screen; icon: string; label: string }[] = [
    { id: "home",      icon: "⊞", label: "Home"      },
    { id: "generate",  icon: "✦", label: "Create"    },
    { id: "templates", icon: "◈", label: "Templates" },
    { id: "gallery",   icon: "🖼", label: "Gallery"   },
    { id: "settings",  icon: "⚙", label: "Settings"  },
  ];

  const activeIdx = items.findIndex(i => i.id === screen);

  return (
    <div style={{
      position: "relative", zIndex: 50, flexShrink: 0,
      background: "rgba(10,10,12,0.98)", backdropFilter: "blur(24px)",
      borderTop: `1px solid ${C.border}`,
      paddingBottom: "env(safe-area-inset-bottom, 8px)",
      paddingTop: 8, paddingLeft: 12, paddingRight: 12,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Morphic pill container */}
      <div style={{
        display: "flex", alignItems: "center",
        background: C.surface2,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        width: "100%",
        maxWidth: 400,
      }}>
        {items.map((item, idx) => {
          const active = screen === item.id;
          const prevActive = idx > 0 && items[idx - 1].id === screen;
          const nextActive = idx < items.length - 1 && items[idx + 1].id === screen;
          const isFirst = idx === 0;
          const isLast = idx === items.length - 1;

          // Neighbor rounding logic — same as morphic pattern
          const roundLeft  = active || prevActive || isFirst;
          const roundRight = active || nextActive || isLast;

          const borderRadius = active
            ? 12
            : `${roundLeft ? 12 : 0}px ${roundRight ? 12 : 0}px ${roundRight ? 12 : 0}px ${roundLeft ? 12 : 0}px`;

          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              style={{
                flex: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 3,
                padding: active ? "10px 6px" : "10px 4px",
                border: "none", cursor: "pointer",
                background: active ? C.accent : "transparent",
                borderRadius,
                margin: active ? "4px 2px" : "0",
                transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                minWidth: 0,
              }}
            >
              <span style={{
                fontSize: active ? 16 : 18,
                color: active ? "#0a0a0c" : C.text3,
                transition: "all 0.2s",
                lineHeight: 1,
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: 9,
                fontWeight: active ? 700 : 400,
                color: active ? "#0a0a0c" : C.text3,
                transition: "all 0.2s",
                letterSpacing: active ? "0.03em" : 0,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Desktop layout ────────────────────────────────────────── */
function DesktopLayout({ getKey }: { getKey: (p: string) => string | null }) {
  const [tab, setTab] = useState<Tab>("Image");
  const [view, setView] = useState<"generate" | "templates">("generate");
  const [prompt, setPrompt] = useState("");
  const [aiPrompt, setAiPrompt] = useState(true);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [modelId, setModelId] = useState("fal-ai/flux-pro");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("New generation");

  const tabModels = MODELS.filter(m => m.tabs.includes(tab));
  const selModel = tabModels.find(m => m.modelId === modelId) || tabModels[0];
  const outputType = tab === "Video" ? "video" : tab === "3D" ? "3d" : tab === "Audio" ? "audio" : "image";

  useEffect(() => {
    const first = tabModels[0];
    if (first && !tabModels.find(m => m.modelId === modelId)) setModelId(first.modelId);
    setResult(null); setError(null);
  }, [tab]);

  const canGenerate = !loading && prompt.trim().length > 0;

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const provider = selModel?.provider || "gemini";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const body: Record<string, unknown> = {
        prompt: prompt.trim(),
        selectedModel: { provider, modelId: selModel?.modelId, displayName: selModel?.label },
        aspectRatio: "1:1",
      };
      if (refImage) { body.images = [refImage]; body.dynamicInputs = { image_url: refImage }; }
      if (tab === "Video") body.mediaType = "video";
      if (tab === "3D") body.mediaType = "3d";
      if (tab === "Audio") body.mediaType = "audio";
      const res = await fetch("/api/generate", { method: "POST", headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");
      if (data.video) setResult(`data:video/mp4;base64,${data.video}`);
      else if (data.videoUrl) setResult(data.videoUrl);
      else if (data.model3dUrl) setResult(data.model3dUrl);
      else if (data.audio) setResult(`data:audio/mp3;base64,${data.audio}`);
      else if (data.image) setResult(data.image);
      else throw new Error("No output received");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: `1px solid ${C.border}`, background: "rgba(10,10,12,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/landing" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/pixza-logo.png" alt="Pixza" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "contain" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>Pixza Studio</span>
          </Link>
          <span style={{ color: C.text3, fontSize: 16, margin: "0 4px" }}>/</span>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ background: "none", border: "none", color: C.text2, fontSize: 13, outline: "none", fontFamily: "inherit", width: 200 }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView(view === "templates" ? "generate" : "templates")} style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: view === "templates" ? "rgba(146,220,229,0.1)" : "transparent", color: view === "templates" ? C.accent : C.text2, fontSize: 12, cursor: "pointer" }}>Templates</button>
          <Link href="/studio" style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.text2, fontSize: 12, textDecoration: "none" }}>Node Studio →</Link>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Left panel */}
        <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${C.border}`, background: "#0e0e11", overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, padding: "12px 12px 0", position: "sticky", top: 0, background: "#0e0e11", zIndex: 10 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === t ? "#fff" : "transparent", color: tab === t ? "#0a0a0c" : C.text2, transition: "all 0.15s" }}>{t}</button>
            ))}
          </div>

          {view === "templates" ? (
            <div style={{ padding: "16px 12px" }}>
              <Label>Templates</Label>
              {TEMPLATES.filter(t => t.tab === tab).map(t => (
                <button key={t.id} onClick={() => { setPrompt(t.prompt); setModelId(t.modelId); setTitle(t.title); setView("generate"); }} style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: "12px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", textAlign: "left", marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `${t.color}18`, border: `1px solid ${t.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{t.emoji}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>{t.model}</div>
                    <div style={{ fontSize: 11, color: C.text2, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.prompt}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div><Label>Model</Label><ModelDropdown models={tabModels} value={modelId} onChange={setModelId} getKey={getKey} /></div>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}><Label>References</Label><span style={{ fontSize: 11, color: C.text3 }}>{(refImage ? 1 : 0) + (styleImage ? 1 : 0)}/4</span></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <RefSlot label="Style" icon="★" image={styleImage || undefined} onUpload={setStyleImage} onClear={() => setStyleImage(null)} />
                  <RefSlot label="Character" icon="👤" image={undefined} onUpload={() => {}} onClear={() => {}} />
                  <RefSlot label="@img1" icon="🖼" image={refImage || undefined} onUpload={setRefImage} onClear={() => setRefImage(null)} />
                  <div style={{ width: 72, height: 72, borderRadius: 10, border: `1px dashed rgba(255,255,255,0.12)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", flexShrink: 0 }}>
                    <span style={{ fontSize: 20, color: C.text3 }}>+</span>
                    <span style={{ fontSize: 10, color: C.text3 }}>Add</span>
                  </div>
                </div>
              </div>
              <div>
                <Label>Prompt</Label>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }} placeholder={tab === "Image" ? "Describe the image..." : tab === "Video" ? "Describe the video scene..." : tab === "Audio" ? "Describe the sound..." : "Describe the 3D object..."} rows={6} style={{ width: "100%", resize: "none", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", color: C.text, fontSize: 13, lineHeight: 1.65, outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.15s" }} onFocus={e => (e.target.style.borderColor = "rgba(146,220,229,0.4)")} onBlur={e => (e.target.style.borderColor = C.border)} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div onClick={() => setAiPrompt(!aiPrompt)} style={{ width: 36, height: 20, borderRadius: 10, cursor: "pointer", position: "relative", background: aiPrompt ? C.accent : "rgba(255,255,255,0.15)", transition: "background 0.2s" }}>
                      <div style={{ position: "absolute", top: 2, left: aiPrompt ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                    </div>
                    <span style={{ fontSize: 12, color: C.text2 }}>AI prompt</span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {["✦", "⟳", "⊞"].map((icon, i) => <button key={i} style={{ background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: 14, padding: 0 }}>{icon}</button>)}
                    <button onClick={() => setPrompt("")} style={{ background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
                  </div>
                </div>
              </div>
              {selModel && selModel.provider !== "gemini" && !getKey(selModel.provider) && (
                <div style={{ padding: "10px 12px", borderRadius: 9, background: "rgba(214,73,51,0.08)", border: "1px solid rgba(214,73,51,0.2)", fontSize: 12, color: C.action }}>
                  No {selModel.provider} API key. <Link href="/studio" style={{ color: C.action, textDecoration: "underline" }}>Add in Settings</Link>
                </div>
              )}
              {error && <div style={{ padding: "10px 12px", borderRadius: 9, background: "rgba(214,73,51,0.08)", border: "1px solid rgba(214,73,51,0.2)", fontSize: 12, color: C.action, lineHeight: 1.5 }}>{error}</div>}
            </div>

            {/* Sticky bottom buttons */}
            <div style={{ padding: "12px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, background: "#0e0e11" }}>
              <button onClick={generate} disabled={!canGenerate} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: canGenerate ? C.accent : C.surface2, color: canGenerate ? "#0a0a0c" : C.text3, fontSize: 14, fontWeight: 700, cursor: canGenerate ? "pointer" : "not-allowed", transition: "all 0.15s", boxShadow: canGenerate ? "0 4px 20px rgba(146,220,229,0.25)" : "none" }}>
                {loading ? "Generating..." : `Generate ${tab}`}
              </button>
              <button style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #f97316, #d64933)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 16, paddingRight: 16 }}>
                <span>👑 Upgrade</span><span>✨</span>
              </button>
            </div>
            </>
          )}
        </div>

        {/* Right: output */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg, minWidth: 0 }}>
          {loading ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid rgba(146,220,229,0.2)", borderTopColor: C.accent, animation: "spin 0.8s linear infinite" }} />
              <p style={{ color: C.text3, fontSize: 13, margin: 0 }}>Generating...</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : !result ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: C.text3 }}>✦</div>
              <p style={{ color: C.text3, fontSize: 13, margin: 0 }}>Output appears here</p>
            </div>
          ) : outputType === "video" ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <video src={result} controls autoPlay loop style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} />
            </div>
          ) : (
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <img src={result} alt="output" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, objectFit: "contain" }} />
              <a href={result} download="output.png" style={{ position: "absolute", bottom: 28, right: 28, padding: "7px 14px", borderRadius: 8, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", color: "#fff", fontSize: 12, fontWeight: 500, textDecoration: "none", border: `1px solid rgba(255,255,255,0.15)` }}>Download</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────── */
export default function CreatePage() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tab, setTab] = useState<Tab>("Image");
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const providerSettings = useWorkflowStore(s => s.providerSettings);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getKey = useCallback((p: string) => {
    return providerSettings.providers[p as keyof typeof providerSettings.providers]?.apiKey || null;
  }, [providerSettings]);

  const handleStart = (t: Tab) => { setTab(t); setScreen("generate"); };
  const handleTemplate = (t: typeof TEMPLATES[0]) => { setTab(t.tab); setScreen("generate"); };

  // Avoid flash — render nothing until we know screen size
  if (isMobile === null) return <div style={{ minHeight: "100vh", background: C.bg }} suppressHydrationWarning />;

  // Desktop: original two-panel layout
  if (!isMobile) return <DesktopLayout getKey={getKey} />;

  // Mobile: app layout
  return (
    <div style={{
    width: "100%", maxWidth: 430, margin: "0 auto",
      minHeight: "100vh", height: "100dvh",
      background: C.bg, color: C.text,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Status bar spacer */}
      <div style={{ height: "env(safe-area-inset-top, 0px)", background: C.bg, flexShrink: 0 }} />

      {/* Top bar */}
      <header style={{
        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", flexShrink: 0,
      }}>
        <Link href="/landing" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #92dce5, #d64933)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/pixza-logo.png" alt="" style={{ width: 15, height: 15 }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>Pixza</span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/studio" style={{ padding: "6px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.text2, fontSize: 12, textDecoration: "none" }}>
            Studio ↗
          </Link>
        </div>
      </header>

      {/* Screen content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {screen === "home" && <HomeScreen onStart={handleStart} onTemplate={() => setScreen("templates")} />}
        {screen === "generate" && <GenerateScreen tab={tab} setTab={setTab} onBack={() => setScreen("home")} getKey={getKey} />}
        {screen === "templates" && <TemplatesScreen onSelect={t => { handleTemplate(t); }} />}
        {screen === "gallery" && <GalleryScreen />}
        {screen === "settings" && <SettingsScreen getKey={getKey} />}
      </div>

      {/* Bottom nav */}
      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  );
}
