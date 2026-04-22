"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, ChevronLeft, ChevronRight, Settings, Image as ImageIcon, 
  Video, Music, Box, Sparkles, LayoutGrid, Compass, Crown, 
  ArrowRight, Download, RefreshCw, X, Globe, BrainCog, Code, Terminal,
  User, Check, Search, Palette, Maximize2, Share2, Zap, Wand2
} from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { ImageTools } from "@/components/ui/image-tools";
import { cn } from "@/lib/utils";

/* ── Types & Data ────────────────────────────────────────── */

type Tab = "Image" | "Video" | "Audio" | "3D";
type Screen = "home" | "generate" | "templates" | "gallery" | "settings" | "tools";

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
];

const TEMPLATES = [
  { id: "product-float", tab: "Image" as Tab, title: "Floating Product Shot", model: "FLUX.1 Pro", provider: "fal", modelId: "fal-ai/flux-pro", icon: <Box className="w-4 h-4" />, color: "white", prompt: "Isolate the product from its original background. Place it on a soft neutral background. Make it float slightly with a soft shadow underneath for elevation. Use balanced studio lighting and sharp focus to highlight details, preserving original logos, branding, colors, textures, and stitching." },
  { id: "cinematic-portrait", tab: "Image" as Tab, title: "Cinematic Portrait", model: "FLUX Realism", provider: "fal", modelId: "fal-ai/flux-realism", icon: <ImageIcon className="w-4 h-4" />, color: "white", prompt: "Cinematic portrait photography, shallow depth of field, golden hour lighting, film grain, 35mm lens, professional color grading, bokeh background" },
  { id: "concept-art", tab: "Image" as Tab, title: "Epic Concept Art", model: "Gemini Imagen 4", provider: "gemini", modelId: "nano-banana-2", icon: <Sparkles className="w-4 h-4" />, color: "white", prompt: "Epic fantasy concept art, dramatic lighting, detailed environment, professional illustration, cinematic composition, 8K resolution" },
  { id: "product-video", tab: "Video" as Tab, title: "Product Reveal", model: "Kling 1.6 Pro", provider: "fal", modelId: "fal-ai/kling-video/v1.6/pro/text-to-video", icon: <Video className="w-4 h-4" />, color: "white", prompt: "Elegant product reveal, slow 360 rotation, studio lighting, dark background, luxury feel, smooth camera movement" },
];

const GALLERY_ITEMS = [
  { icon: <ImageIcon />, title: "Product Shot", mode: "Image" },
  { icon: <ImageIcon />, title: "Portrait", mode: "Image" },
  { icon: <Video />, title: "City Video", mode: "Video" },
  { icon: <Sparkles />, title: "Style Art", mode: "Image" },
  { icon: <Box />, title: "3D Model", mode: "3D" },
  { icon: <Music />, title: "Soundtrack", mode: "Audio" },
];

const TABS: Tab[] = ["Image", "Video", "Audio", "3D"];
const TAB_ICONS: Record<Tab, any> = { 
  Image: <ImageIcon className="w-6 h-6" />, 
  Video: <Video className="w-6 h-6" />, 
  Audio: <Music className="w-6 h-6" />, 
  "3D": <Box className="w-6 h-6" /> 
};

/* ── Shared Components ────────────────────────────────────── */

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2", className)}>
      {children}
    </p>
  );
}

function ModelDropdown({ models, value, onChange }: {
  models: Model[]; value: string; onChange: (v: string) => void;
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
    <div ref={ref} className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
          <span className="text-sm font-bold text-white">{sel?.label || "Select model"}</span>
        </div>
        <Plus className={cn("w-4 h-4 text-white/20 transition-transform", open && "rotate-45")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 z-[100] glass-panel rounded-3xl overflow-hidden shadow-2xl p-2 border-white/5"
          >
            {Array.from(new Set(models.map(m => m.provider))).map((prov) => (
              <div key={prov} className="mb-2 last:mb-0">
                <div className="px-4 py-2 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{prov}</span>
                </div>
                {models.filter(m => m.provider === prov).map(m => {
                  const active = value === m.modelId;
                  return (
                    <button 
                      key={m.modelId} 
                      onClick={() => { onChange(m.modelId); setOpen(false); }} 
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all",
                        active ? "bg-white text-black font-black" : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {m.label}
                      {active && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RefSlot({ label, icon, image, onUpload, onClear }: {
  label: string; icon: React.ReactNode; image?: string; onUpload: (d: string) => void; onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div 
      onClick={() => !image && ref.current?.click()} 
      className={cn(
        "flex-1 aspect-square rounded-2xl border transition-all cursor-pointer overflow-hidden relative group",
        image ? "border-transparent" : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
      )}
    >
      {image ? (
        <>
          <img src={image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={e => { e.stopPropagation(); onClear(); }} 
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <div className="text-white/20 group-hover:text-white/40 transition-colors">{icon}</div>
          <span className="text-[10px] font-bold uppercase tracking-tight text-white/20 group-hover:text-white/40">{label}</span>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => {
        const f = e.target.files?.[0]; if (!f) return;
        const r = new FileReader(); r.onload = ev => onUpload(ev.target?.result as string); r.readAsDataURL(f);
      }} />
    </div>
  );
}

/* ── Screen Components ────────────────────────────────────── */

function HomeScreen({ onStart, onTemplate }: { onStart: (tab: Tab) => void; onTemplate: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto px-8 pt-12 pb-32 lg:px-20 lg:pt-20">
      <div className="max-w-7xl mx-auto space-y-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none">Studio.</h1>
          <p className="text-white/30 text-xs lg:text-sm font-black uppercase tracking-[0.3em] max-w-lg">
            A high-performance neural engine for elite tier media synthesis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TABS.map((t, idx) => (
            <motion.button 
              key={t} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onStart(t)} 
              className="group p-8 lg:p-12 rounded-[48px] border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left flex flex-col gap-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors">
                {TAB_ICONS[t]}
              </div>
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-white/10 transition-all shadow-inner">
                {TAB_ICONS[t]}
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-white tracking-tighter mb-2">{t}</div>
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                  {t === "Image" ? "Photorealistic Neural Capture" : t === "Video" ? "Cinematic Temporal Synthesis" : t === "Audio" ? "Spatial Acoustic Engineering" : "Volumetric 3D Reconstruction"}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onClick={onTemplate} 
            className="p-10 lg:p-16 rounded-[64px] border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between group relative overflow-hidden"
          >
            <div className="text-left relative z-10">
              <div className="text-3xl font-black text-white tracking-tighter mb-3">Explore Vaults</div>
              <div className="text-sm font-bold text-white/20 tracking-tight max-w-xs leading-relaxed">Leverage community-driven neural presets and workflows.</div>
            </div>
            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all transform group-hover:rotate-45 relative z-10">
              <ArrowRight className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="p-10 lg:p-16 rounded-[64px] border border-white/5 bg-gradient-to-br from-white/5 to-transparent flex flex-col justify-between relative overflow-hidden group"
          >
            <div>
              <div className="text-3xl font-black text-white tracking-tighter mb-3">Batch Engine</div>
              <div className="text-sm font-bold text-white/20 tracking-tight max-w-xs leading-relaxed">Automate high-volume synthesis with multi-node processing.</div>
            </div>
            <div className="mt-12 flex gap-3">
               <span className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/10 px-6 py-2.5 rounded-full border border-white/5 backdrop-blur-md">PRO ACCESS</span>
            </div>
            <Zap className="absolute top-10 right-10 w-12 h-12 text-white/5 group-hover:text-amber-400/20 transition-colors" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function GenerateScreen({ tab, setTab, onBack, getKey }: {
  tab: Tab; setTab: (t: Tab) => void; onBack: () => void; getKey: (p: string) => string | null;
}) {
  const [prompt, setPrompt] = useState("");
  const [refImage, setRefImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [modelId, setModelId] = useState(MODELS.filter(m => m.tabs.includes(tab))[0]?.modelId || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const tabModels = MODELS.filter(m => m.tabs.includes(tab));
  const selModel = tabModels.find(m => m.modelId === modelId) || tabModels[0];
  const outputType = tab === "Video" ? "video" : tab === "3D" ? "3d" : tab === "Audio" ? "audio" : "image";

  useEffect(() => {
    const first = tabModels[0];
    if (first && !tabModels.find(m => m.modelId === modelId)) setModelId(first.modelId);
    setResult(null); setError(null); setShowResult(false);
  }, [tab]);

  const generate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setLoading(true); setError(null); setResult(null); setShowResult(false);
    try {
      const provider = selModel?.provider || "gemini";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const body: Record<string, unknown> = {
        prompt: finalPrompt.trim(),
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
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] relative overflow-hidden lg:flex-row">
      {/* Properties Panel (Desktop) */}
      <div className="hidden lg:flex w-[400px] flex-col border-r border-white/5 bg-[#0D0D0D] p-10 overflow-y-auto">
        <div className="mb-10 flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black text-white tracking-tighter">Properties</h2>
        </div>

        <div className="space-y-12">
          <div>
            <Label>Engine Configuration</Label>
            <ModelDropdown models={tabModels} value={modelId} onChange={setModelId} />
          </div>

          <div>
            <Label>Creative Direction</Label>
            <div className="grid grid-cols-2 gap-4">
              <RefSlot label="Composition" icon={<LayoutGrid className="w-5 h-5" />} image={styleImage || undefined} onUpload={setStyleImage} onClear={() => setStyleImage(null)} />
              <RefSlot label="Subject" icon={<User className="w-5 h-5" />} image={undefined} onUpload={() => {}} onClear={() => {}} />
              <RefSlot label="Lighting" icon={<Sparkles className="w-5 h-5" />} image={refImage || undefined} onUpload={setRefImage} onClear={() => setRefImage(null)} />
              <div className="aspect-square rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-white/20 hover:text-white/40 hover:border-white/20 transition-all cursor-pointer">
                <Plus className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
            <Label className="mb-4 text-white/60">Active Tab</Label>
            <div className="flex gap-2">
              {TABS.map(t => (
                <button 
                  key={t} 
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    tab === t ? "bg-white text-black" : "text-white/20 hover:text-white/40"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative bg-[#0A0A0A]">
        {/* Mobile Tabs */}
        <div className="lg:hidden flex items-center justify-center gap-1 p-2 bg-white/5 rounded-full mx-6 mt-4">
          {TABS.map(t => (
            <button 
              key={t} 
              onClick={() => setTab(t)} 
              className={cn(
                "flex-1 py-2 px-4 rounded-full text-xs font-black transition-all",
                tab === t ? "bg-white text-black" : "text-white/40 hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 pb-40 lg:p-20 lg:pb-52 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center justify-center gap-8"
              >
                <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-full border-4 border-white/5 border-t-white animate-spin shadow-[0_0_80px_rgba(255,255,255,0.1)]" />
                <div className="text-center">
                  <p className="text-xs lg:text-sm font-black uppercase tracking-[0.3em] text-white">Synthesizing {tab}...</p>
                  <p className="text-[10px] font-bold text-white/20 mt-2 uppercase tracking-widest">Applying neural weights</p>
                </div>
              </motion.div>
            ) : showResult && result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full flex flex-col gap-8"
              >
                <div className="aspect-square lg:aspect-video glass-panel rounded-[48px] overflow-hidden shadow-2xl border-white/10 relative group">
                  {outputType === "video"
                    ? <video src={result} controls autoPlay loop className="w-full h-full object-contain" />
                    : <img src={result} alt="output" className="w-full h-full object-contain" />
                  }
                  <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <Maximize2 className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 items-center justify-center">
                  <button onClick={() => { setShowResult(false); setResult(null); }} className="btn-minimal btn-minimal-secondary px-10 py-4 text-sm tracking-widest uppercase font-black">Discard</button>
                  <a href={result} download="pixza_export" className="btn-minimal btn-minimal-primary px-12 py-4 text-sm tracking-widest uppercase font-black flex items-center gap-3">
                    <Download className="w-5 h-5" /> Export Artifact
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center max-w-md"
              >
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[40px] bg-white/5 border border-white/5 flex items-center justify-center text-white/10 mb-8">
                  {TAB_ICONS[tab]}
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Ready to Imagine</h3>
                <p className="text-sm font-bold text-white/20">Provide a descriptive prompt below to begin the generation process.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating V0-style Chat Box */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-[150]">
          <VercelV0Chat 
            isLoading={loading}
            onSend={(msg) => { setPrompt(msg); generate(msg); }}
            placeholder={`What can I help you ship in ${tab.toLowerCase()}?`}
          />
        </div>
      </div>
    </div>
  );
}

function TemplatesScreen({ onSelect }: { onSelect: (t: typeof TEMPLATES[0]) => void }) {
  const [activeTab, setActiveTab] = useState<Tab | "All">("All");
  const tabs: (Tab | "All")[] = ["All", "Image", "Video", "Audio", "3D"];
  const filtered = activeTab === "All" ? TEMPLATES : TEMPLATES.filter(t => t.tab === activeTab);

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-6 pt-8 pb-32 lg:px-20 lg:pt-20">
      <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter">Explore</h2>
      <div className="flex gap-3 overflow-x-auto pb-8 scrollbar-hide">
        {tabs.map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t)} 
            className={cn(
              "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
              activeTab === t ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto grid lg:grid-cols-2 gap-6 pr-2">
        {filtered.map(t => (
          <button 
            key={t.id} 
            onClick={() => onSelect(t)} 
            className="group p-8 lg:p-10 rounded-[48px] border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left flex items-start gap-8"
          >
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-3xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-white/10 transition-all">
              {t.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl lg:text-2xl font-black text-white">{t.title}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-3 py-1 rounded-full">{t.tab}</span>
              </div>
              <p className="text-xs font-bold text-white/40 mb-4">{t.model}</p>
              <p className="text-sm lg:text-base text-white/60 line-clamp-2 leading-relaxed">{t.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GalleryScreen() {
  return (
    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 lg:px-20 lg:pt-20">
      <h2 className="text-4xl lg:text-6xl font-black text-white mb-12 tracking-tighter">Vault</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...GALLERY_ITEMS, ...GALLERY_ITEMS, ...GALLERY_ITEMS].map((g, i) => (
          <div key={i} className={cn(
            "rounded-[40px] bg-white/5 border border-white/5 overflow-hidden flex flex-col justify-end p-8 relative group aspect-square",
            i % 5 === 0 && "lg:col-span-2 lg:row-span-2 aspect-auto"
          )}>
            <div className="absolute inset-0 flex items-center justify-center text-white/5 group-hover:scale-110 group-hover:text-white/10 transition-all transform scale-[2] opacity-10">
              {g.icon}
            </div>
            <div className="relative z-10">
              <div className="text-lg lg:text-xl font-black text-white mb-1">{g.title}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{g.mode}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsScreen() {
  const providerSettings = useWorkflowStore(s => s.providerSettings);
  const updateProviderApiKey = useWorkflowStore(s => s.updateProviderApiKey);

  const PROVIDERS = [
    { id: "gemini", name: "Google Gemini", color: "white", placeholder: "AIza...", icon: <Globe className="w-5 h-5" /> },
    { id: "fal", name: "fal.ai", color: "white", placeholder: "fal_...", icon: <Terminal className="w-5 h-5" /> },
    { id: "replicate", name: "Replicate", color: "white", placeholder: "r8_...", icon: <Code className="w-5 h-5" /> },
    { id: "wavespeed", name: "WaveSpeed", color: "white", placeholder: "ws_...", icon: <Terminal className="w-5 h-5" /> },
  ] as const;

  const [show, setShow] = useState<Record<string, boolean>>({});

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 lg:px-20 lg:pt-20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl lg:text-6xl font-black text-white mb-4 tracking-tighter text-center lg:text-left">Auth</h2>
        <p className="text-sm lg:text-base font-bold text-white/20 mb-16 uppercase tracking-widest text-center lg:text-left">Manage your creative engine access.</p>

        <div className="grid lg:grid-cols-2 gap-6 mb-16">
          {PROVIDERS.map(p => {
            const currentKey = providerSettings.providers[p.id as keyof typeof providerSettings.providers]?.apiKey || "";
            return (
              <div key={p.id} className="p-10 rounded-[48px] bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-white/10 transition-all">
                      {p.icon}
                    </div>
                    <span className="text-xl font-black text-white">{p.name}</span>
                  </div>
                  {currentKey && <Check className="text-green-500 w-5 h-5" />}
                </div>
                <div className="relative">
                  <input
                    type={show[p.id] ? "text" : "password"}
                    value={currentKey}
                    onChange={e => updateProviderApiKey(p.id, e.target.value)}
                    placeholder={p.placeholder}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none focus:border-white/20 transition-all pr-20"
                  />
                  <button 
                    onClick={() => setShow(s => ({ ...s, [p.id]: !s[p.id] }))} 
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                  >
                    {show[p.id] ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-12 lg:p-20 rounded-[64px] bg-white text-black flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="text-center lg:text-left">
            <div className="text-4xl lg:text-5xl font-black mb-4 tracking-tighter">Enterprise Access</div>
            <div className="text-lg font-bold opacity-40 leading-tight max-w-md">Unlimited computational priority and custom model weights.</div>
          </div>
          <button className="whitespace-nowrap px-12 py-6 rounded-3xl bg-black text-white text-sm font-black tracking-[0.2em] uppercase hover:scale-[0.98] transition-transform flex items-center gap-3">
            <Crown className="w-5 h-5" /> Start Trial
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Navigation Components ─────────────────────────────────── */

function ToolsScreen() {
  return (
    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 lg:px-20 lg:pt-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl lg:text-6xl font-black text-white mb-3 tracking-tighter">Tools.</h2>
        <p className="text-sm font-bold text-white/20 mb-12 uppercase tracking-widest">
          Local AI — runs in your browser, zero API cost.
        </p>
        <ImageTools />
      </div>
    </div>
  );
}

function SidebarNav({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const items: { id: Screen; icon: any; label: string }[] = [
    { id: "home",      icon: <LayoutGrid className="w-5 h-5" />, label: "Dashboard" },
    { id: "generate",  icon: <Plus className="w-5 h-5" />,       label: "Studio"    },
    { id: "templates", icon: <Compass className="w-5 h-5" />,    label: "Explore"   },
    { id: "tools",     icon: <Wand2 className="w-5 h-5" />,      label: "Tools"     },
    { id: "gallery",   icon: <ImageIcon className="w-5 h-5" />, label: "Vault"   },
    { id: "settings",  icon: <Settings className="w-5 h-5" />, label: "Engine"  },
  ];

  return (
    <div className="hidden lg:flex flex-col items-center py-8 w-24 flex-shrink-0 bg-[#0A0A0A] border-r border-white/5 z-50">
      <Link href="/landing" className="mb-12 group">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <img src="/pixza-logo.png" alt="" className="w-6 h-6 invert" />
        </div>
      </Link>
      <div className="flex-1 flex flex-col gap-4">
        {items.map((item) => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={cn(
                "w-14 h-14 rounded-2xl transition-all flex items-center justify-center group relative",
                active ? "bg-white text-black shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)]" : "text-white/20 hover:text-white hover:bg-white/5"
              )}
            >
              {item.icon}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl z-[100]">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
      <Link 
        href="/profile"
        className="mb-8 w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all cursor-pointer overflow-hidden group"
      >
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lekh" alt="User" className="w-full h-full grayscale group-hover:grayscale-0 transition-all" />
      </Link>
    </div>
  );
}

function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const items: { id: Screen; icon: any; label: string }[] = [
    { id: "home",      icon: <LayoutGrid className="w-5 h-5" />, label: "Home"    },
    { id: "generate",  icon: <Plus className="w-5 h-5" />,       label: "Create"  },
    { id: "templates", icon: <Compass className="w-5 h-5" />,    label: "Explore" },
    { id: "tools",     icon: <Wand2 className="w-5 h-5" />,      label: "Tools"   },
    { id: "settings",  icon: <Settings className="w-5 h-5" />,   label: "Auth"    },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] lg:hidden">
      <div className="glass-panel p-2 rounded-full flex items-center gap-1 shadow-2xl border-white/10">
        {items.map((item) => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all",
                active ? "bg-white text-black" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {item.icon}
            </button>
          );
        })}
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
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getKey = useCallback((p: string) => {
    return providerSettings.providers[p as keyof typeof providerSettings.providers]?.apiKey || null;
  }, [providerSettings]);

  const handleStart = (t: Tab) => { setTab(t); setScreen("generate"); };
  const handleTemplate = (t: typeof TEMPLATES[0]) => { setTab(t.tab); setScreen("generate"); };

  if (isMobile === null) return <div className="min-h-screen bg-[#0A0A0A]" />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-white selection:text-black flex font-sans antialiased">
      {/* Sidebar for Desktop */}
      <SidebarNav screen={screen} setScreen={setScreen} />

      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* Header (Mobile Only) */}
        <header className="lg:hidden px-6 h-16 flex items-center justify-between flex-shrink-0 bg-[#0A0A0A] z-50">
          <Link href="/landing" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <img src="/pixza-logo.png" alt="" className="w-4 h-4" />
            </div>
            <span className="text-xl font-black tracking-tighter">Pixza</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/studio" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              Studio
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0A]">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {screen === "home" && <HomeScreen onStart={handleStart} onTemplate={() => setScreen("templates")} />}
              {screen === "generate" && <GenerateScreen tab={tab} setTab={setTab} onBack={() => setScreen("home")} getKey={getKey} />}
              {screen === "templates" && <TemplatesScreen onSelect={handleTemplate} />}
              {screen === "gallery" && <GalleryScreen />}
              {screen === "tools" && <ToolsScreen />}
              {screen === "settings" && <SettingsScreen />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Nav (Mobile Only) */}
        <BottomNav screen={screen} setScreen={setScreen} />
      </div>

      {/* Grain Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[300] opacity-[0.03]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />
    </div>
  );
}
