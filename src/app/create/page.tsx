"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon, Video, Music, Box, Sparkles, Settings, Compass,
  Download, X, RefreshCw, Upload, ChevronDown, Check,
  Wand2, LayoutGrid, Plus, Zap, Crown, ArrowRight, Maximize2
} from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";
import { ImageTools } from "@/components/ui/image-tools";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────── */
type Tab = "Image" | "Video" | "Audio" | "3D";
type NavScreen = "create" | "explore" | "tools" | "settings";

interface Model { provider: string; modelId: string; label: string; tabs: Tab[]; badge?: string; }

/* ── Model Registry ─────────────────────────────────────────── */
const MODELS: Model[] = [
  // ── Image ──────────────────────────────────────────────────
  { provider: "fal",       modelId: "fal-ai/gpt-image-2",                                label: "GPT Image 2",        tabs: ["Image"], badge: "New" },
  { provider: "fal",       modelId: "fal-ai/gpt-image-2/edit",                           label: "GPT Image 2 Edit",   tabs: ["Image"], badge: "OpenAI" },
  { provider: "fal",       modelId: "fal-ai/gpt-image-1.5",                              label: "GPT Image 1.5",      tabs: ["Image"] },
  { provider: "fal",       modelId: "fal-ai/gpt-image-1/text-to-image",                  label: "GPT Image 1",        tabs: ["Image"] },
  { provider: "fal",       modelId: "fal-ai/gpt-image-1-mini",                           label: "GPT Image Mini",     tabs: ["Image"] },
  { provider: "gemini",    modelId: "nano-banana-2",                                      label: "Imagen 4",           tabs: ["Image"] },
  { provider: "gemini",    modelId: "nano-banana-pro",                                    label: "Imagen 3",           tabs: ["Image"], badge: "Quality" },
  { provider: "fal",       modelId: "fal-ai/flux-2-pro",                                  label: "FLUX.2 Pro",         tabs: ["Image"], badge: "Best" },
  { provider: "fal",       modelId: "fal-ai/flux-pro",                                    label: "FLUX.1 Pro",         tabs: ["Image"] },
  { provider: "fal",       modelId: "fal-ai/flux/schnell",                                label: "FLUX Schnell",       tabs: ["Image"], badge: "Fast" },
  { provider: "fal",       modelId: "fal-ai/flux-realism",                                label: "FLUX Realism",       tabs: ["Image"] },
  { provider: "fal",       modelId: "fal-ai/seedream-v4-5",                               label: "Seedream V4.5",      tabs: ["Image"] },
  { provider: "fal",       modelId: "fal-ai/ideogram/v3",                                 label: "Ideogram V3",        tabs: ["Image"] },
  { provider: "fal",       modelId: "fal-ai/recraft-v3",                                  label: "Recraft V3",         tabs: ["Image"] },
  { provider: "wavespeed", modelId: "wavespeed-ai/flux-dev-ultra-fast",                   label: "FLUX Ultra Fast",    tabs: ["Image"], badge: "Fastest" },
  { provider: "fal",       modelId: "fal-ai/flux/dev/image-to-image",                     label: "FLUX I2I",           tabs: ["Image"] },
  { provider: "fal",       modelId: "fal-ai/gpt-image-1/edit-image",                      label: "GPT Image 1 Edit",   tabs: ["Image"] },
  { provider: "fal",       modelId: "fal-ai/aura-flow",                                   label: "AuraFlow",           tabs: ["Image"] },

  // ── Video ──────────────────────────────────────────────────
  { provider: "fal",       modelId: "fal-ai/sora-2/text-to-video/pro",                    label: "Sora 2 Pro",         tabs: ["Video"], badge: "OpenAI" },
  { provider: "fal",       modelId: "fal-ai/sora-2/image-to-video/pro",                   label: "Sora 2 I2V",         tabs: ["Video"] },
  { provider: "gemini",    modelId: "veo-3.0-generate-preview",                           label: "Veo 3",              tabs: ["Video"], badge: "Best" },
  { provider: "gemini",    modelId: "veo-2.0-generate-001",                               label: "Veo 2",              tabs: ["Video"] },
  { provider: "fal",       modelId: "fal-ai/kling-video/v3/pro/text-to-video",            label: "Kling 3.0 Pro",      tabs: ["Video"], badge: "New" },
  { provider: "fal",       modelId: "fal-ai/kling-video/v2.6/pro/text-to-video",          label: "Kling 2.6 Pro",      tabs: ["Video"] },
  { provider: "fal",       modelId: "fal-ai/kling-video/v1.6/pro/text-to-video",          label: "Kling 1.6 Pro",      tabs: ["Video"], badge: "Popular" },
  { provider: "fal",       modelId: "fal-ai/kling-video/v3/pro/image-to-video",           label: "Kling 3.0 I2V",      tabs: ["Video"] },
  { provider: "fal",       modelId: "fal-ai/kling-video/v2.6/pro/image-to-video",         label: "Kling 2.6 I2V",      tabs: ["Video"] },
  { provider: "fal",       modelId: "fal-ai/ltx-2/image-to-video/fast",                   label: "LTX Video 2.0",      tabs: ["Video"], badge: "4K" },
  { provider: "fal",       modelId: "fal-ai/wan-t2v",                                     label: "Wan T2V",            tabs: ["Video"], badge: "Fast" },
  { provider: "fal",       modelId: "fal-ai/wan-i2v",                                     label: "Wan I2V",            tabs: ["Video"] },
  { provider: "fal",       modelId: "fal-ai/minimax-video",                               label: "MiniMax Video",      tabs: ["Video"] },
  { provider: "fal",       modelId: "fal-ai/seedance-v1-pro",                             label: "Seedance V1 Pro",    tabs: ["Video"] },
  { provider: "fal",       modelId: "fal-ai/luma-dream-machine",                          label: "Luma Dream Machine", tabs: ["Video"] },

  // ── Audio ──────────────────────────────────────────────────
  { provider: "fal",       modelId: "fal-ai/minimax-music/v2",                            label: "MiniMax Music 2.0",  tabs: ["Audio"], badge: "Best" },
  { provider: "fal",       modelId: "fal-ai/minimax-music",                               label: "MiniMax Music",      tabs: ["Audio"] },
  { provider: "fal",       modelId: "sonauto/v2/text-to-music",                           label: "Sonauto V2",         tabs: ["Audio"], badge: "Songs" },
  { provider: "fal",       modelId: "fal-ai/stable-audio",                                label: "Stable Audio",       tabs: ["Audio"] },
  { provider: "fal",       modelId: "fal-ai/ace-step",                                    label: "ACE-Step",           tabs: ["Audio"], badge: "New" },
  { provider: "fal",       modelId: "fal-ai/mmaudio-v2",                                  label: "MMAudio V2",         tabs: ["Audio"] },

  // ── 3D ────────────────────────────────────────────────────
  { provider: "fal",       modelId: "fal-ai/trellis",                                     label: "Trellis",            tabs: ["3D"], badge: "Best" },
  { provider: "fal",       modelId: "fal-ai/hunyuan3d-v2",                                label: "Hunyuan3D V2",       tabs: ["3D"], badge: "New" },
  { provider: "fal",       modelId: "fal-ai/stable-zero123",                              label: "Zero123",            tabs: ["3D"] },
  { provider: "replicate", modelId: "stability-ai/triposr",                               label: "TripoSR",            tabs: ["3D"], badge: "Fast" },
];

const QUICK_PROMPTS: Record<Tab, string[]> = {
  Image: [
    "A cinematic portrait of a woman in golden hour light, photorealistic",
    "Futuristic city skyline at night, neon reflections on wet streets",
    "Product shot of a luxury watch on marble surface, studio lighting",
    "Abstract fluid art in deep blue and gold, 8K ultra-detailed",
    "Isometric illustration of a cozy coffee shop, flat design",
    "Hyperrealistic close-up of a blooming rose with morning dew",
  ],
  Video: [
    "Slow motion ocean waves crashing on rocks",
    "Timelapse of clouds over mountain peaks",
    "Product reveal with dramatic lighting",
    "Abstract particles flowing in space",
  ],
  Audio: [
    "Upbeat electronic pop song with catchy melody and energetic beat",
    "Cinematic orchestral score, epic and emotional, 120 BPM",
    "Lo-fi hip hop beat with vinyl crackle, relaxing study music",
    "Dark ambient soundscape with deep bass and atmospheric pads",
    "Acoustic guitar ballad, warm and melancholic",
    "Trap beat with 808 bass, hi-hats, and punchy snares",
  ],
  "3D": [
    "A detailed 3D model of a sports car",
    "Futuristic helmet with visor",
    "Ornate wooden chair with carved details",
    "Abstract geometric sculpture",
  ],
};

const TAB_CONFIG: Record<Tab, { icon: any; color: string; desc: string }> = {
  Image: { icon: ImageIcon, color: "text-cyan-400",   desc: "Generate stunning images" },
  Video: { icon: Video,     color: "text-violet-400", desc: "Create AI videos" },
  Audio: { icon: Music,     color: "text-amber-400",  desc: "Compose AI audio" },
  "3D":  { icon: Box,       color: "text-emerald-400",desc: "Build 3D models" },
};

/* ── Model Picker ───────────────────────────────────────────── */
function ModelPicker({ models, value, onChange }: { models: Model[]; value: string; onChange: (v: string) => void }) {
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
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold text-white"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
        {sel?.label}
        {sel?.badge && <span className="text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-1.5 py-0.5 rounded-md">{sel.badge}</span>}
        <ChevronDown className={cn("w-3.5 h-3.5 text-white/30 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[200px]"
          >
            {models.map(m => (
              <button
                key={m.modelId}
                onClick={() => { onChange(m.modelId); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm transition-all hover:bg-white/5",
                  value === m.modelId ? "text-white font-bold" : "text-white/50"
                )}
              >
                <span>{m.label}</span>
                <div className="flex items-center gap-2">
                  {m.badge && <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{m.badge}</span>}
                  {value === m.modelId && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Create Screen ─────────────────────────────────────── */
function CreateScreen() {
  const [tab, setTab] = useState<Tab>("Image");
  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState(MODELS.filter(m => m.tabs.includes("Image"))[0].modelId);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tabModels = MODELS.filter(m => m.tabs.includes(tab));
  const selModel = tabModels.find(m => m.modelId === modelId) || tabModels[0];

  // Reset model when tab changes
  useEffect(() => {
    const first = tabModels[0];
    if (first && !tabModels.find(m => m.modelId === modelId)) setModelId(first.modelId);
    setResult(null); setError(null);
  }, [tab]);

  const generate = useCallback(async (p?: string) => {
    const finalPrompt = p ?? prompt;
    if (!finalPrompt.trim() || loading) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const body: Record<string, unknown> = {
        prompt: finalPrompt.trim(),
        selectedModel: { provider: selModel.provider, modelId: selModel.modelId, displayName: selModel.label },
        aspectRatio: "1:1",
      };
      if (refImage) { body.images = [refImage]; body.dynamicInputs = { image_url: refImage }; }
      if (tab === "Video") body.mediaType = "video";
      if (tab === "3D") body.mediaType = "3d";
      if (tab === "Audio") body.mediaType = "audio";

      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");

      let out: string | null = null;
      if (data.video) out = `data:video/mp4;base64,${data.video}`;
      else if (data.videoUrl) out = data.videoUrl;
      else if (data.model3dUrl) out = data.model3dUrl;
      else if (data.audio) out = `data:audio/mp3;base64,${data.audio}`;
      else if (data.image) out = data.image;
      else throw new Error("No output received");
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [prompt, selModel, refImage, tab, loading]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
  };

  const handleFile = (file: File) => {
    const r = new FileReader();
    r.onload = (ev) => setRefImage(ev.target?.result as string);
    r.readAsDataURL(file);
  };

  const outputType = tab === "Video" ? "video" : tab === "Audio" ? "audio" : "image";
  const TabIcon = TAB_CONFIG[tab].icon;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 px-6 pt-5 pb-0 flex-shrink-0">
        {(["Image", "Video", "Audio", "3D"] as Tab[]).map(t => {
          const Ic = TAB_CONFIG[t].icon;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                active ? "bg-white text-black" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <Ic className="w-4 h-4" />
              {t}
            </button>
          );
        })}
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-0">

        {/* Left: Prompt + Controls */}
        <div className="flex flex-col w-full lg:w-[420px] flex-shrink-0 border-r border-white/5 overflow-y-auto">

          {/* Prompt Box */}
          <div className="p-6 space-y-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Describe your ${tab.toLowerCase()}…`}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/30 resize-none transition-all leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-white/15 font-medium">⌘↵</div>
            </div>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS[tab].map((qp, i) => (
                <button
                  key={i}
                  onClick={() => { setPrompt(qp); textareaRef.current?.focus(); }}
                  className="text-[11px] text-white/30 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg transition-all text-left line-clamp-1 max-w-[180px]"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Model + Options */}
          <div className="px-6 pb-4 space-y-4 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Model</span>
              <ModelPicker models={tabModels} value={selModel.modelId} onChange={setModelId} />
            </div>

            {/* Reference image */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Reference</span>
              {refImage ? (
                <div className="flex items-center gap-2">
                  <img src={refImage} className="w-8 h-8 rounded-lg object-cover border border-white/10" alt="ref" />
                  <button onClick={() => setRefImage(null)} className="text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          </div>

          {/* Generate Button */}
          <div className="px-6 pb-6">
            <button
              onClick={() => generate()}
              disabled={!prompt.trim() || loading}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                prompt.trim() && !loading
                  ? "bg-white text-black hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate {tab}
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
              <button onClick={() => generate()} className="mt-2 text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}
        </div>

        {/* Right: Output Canvas */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-hidden bg-[#080808]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 text-center"
              >
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  <div className="absolute inset-3 rounded-full border border-white/10 animate-pulse" />
                  <TabIcon className={cn("absolute inset-0 m-auto w-8 h-8", TAB_CONFIG[tab].color)} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Generating your {tab.toLowerCase()}…</p>
                  <p className="text-xs text-white/30 mt-1">This may take a moment</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl flex flex-col gap-4"
              >
                <div className="relative rounded-3xl overflow-hidden bg-black border border-white/5 group">
                  {outputType === "video" ? (
                    <video src={result} controls autoPlay loop className="w-full max-h-[60vh] object-contain" />
                  ) : outputType === "audio" ? (
                    <div className="p-12 flex flex-col items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                        <Music className="w-10 h-10 text-amber-400" />
                      </div>
                      <audio src={result} controls className="w-full" />
                    </div>
                  ) : (
                    <img src={result} alt="Generated" className="w-full max-h-[60vh] object-contain" />
                  )}

                  {/* Hover actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={result}
                      download={`pixza-${tab.toLowerCase()}`}
                      className="w-9 h-9 rounded-xl bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setResult(null); setPrompt(""); }}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-sm font-bold hover:text-white hover:border-white/20 transition-all"
                  >
                    New
                  </button>
                  <button
                    onClick={() => generate()}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-sm font-bold hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </button>
                  <a
                    href={result}
                    download={`pixza-${tab.toLowerCase()}`}
                    className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-black text-center hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Save
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 text-center max-w-xs"
              >
                <div className={cn("w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center", TAB_CONFIG[tab].color)}>
                  <TabIcon className="w-10 h-10 opacity-30" />
                </div>
                <div>
                  <p className="text-white/40 text-sm font-medium">Write a prompt and hit Generate</p>
                  <p className="text-white/20 text-xs mt-1">or pick a quick prompt on the left</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Explore Screen ─────────────────────────────────────────── */
const TEMPLATES = [
  { id: "product",   tab: "Image" as Tab, title: "Floating Product Shot",  model: "FLUX Pro",      provider: "fal",    modelId: "fal-ai/flux-pro",                            prompt: "Isolate the product from its background. Place it floating on a soft neutral surface with a subtle shadow. Studio lighting, sharp focus, preserve all branding and textures." },
  { id: "portrait",  tab: "Image" as Tab, title: "Cinematic Portrait",     model: "FLUX Realism",  provider: "fal",    modelId: "fal-ai/flux-realism",                        prompt: "Cinematic portrait photography, shallow depth of field, golden hour lighting, film grain, 35mm lens, professional color grading, bokeh background" },
  { id: "concept",   tab: "Image" as Tab, title: "Epic Concept Art",       model: "Imagen 4",      provider: "gemini", modelId: "nano-banana-2",                              prompt: "Epic fantasy concept art, dramatic lighting, detailed environment, professional illustration, cinematic composition, 8K resolution" },
  { id: "landscape", tab: "Image" as Tab, title: "Dramatic Landscape",     model: "Imagen 3",      provider: "gemini", modelId: "nano-banana-pro",                            prompt: "Dramatic mountain landscape at golden hour, volumetric light rays, ultra-detailed, photorealistic, 8K" },
  { id: "video1",    tab: "Video" as Tab, title: "Product Reveal",         model: "Kling 1.6 Pro", provider: "fal",    modelId: "fal-ai/kling-video/v1.6/pro/text-to-video",  prompt: "Elegant product reveal, slow 360 rotation, studio lighting, dark background, luxury feel, smooth camera movement" },
  { id: "video2",    tab: "Video" as Tab, title: "Nature Timelapse",       model: "Veo 2",         provider: "gemini", modelId: "veo-2.0-generate-001",                       prompt: "Timelapse of clouds moving over mountain peaks at sunset, cinematic, 4K" },
];

function ExploreScreen({ onUse }: { onUse: (t: typeof TEMPLATES[0]) => void }) {
  const [filter, setFilter] = useState<Tab | "All">("All");
  const filtered = filter === "All" ? TEMPLATES : TEMPLATES.filter(t => t.tab === filter);

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">Templates</h2>
        <p className="text-white/30 text-sm mb-6">Click any template to load it into the generator.</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["All", "Image", "Video", "Audio", "3D"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                filter === f ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => onUse(t)}
              className="group p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-white text-base">{t.title}</span>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                  t.tab === "Image" ? "bg-cyan-500/10 text-cyan-400" :
                  t.tab === "Video" ? "bg-violet-500/10 text-violet-400" :
                  "bg-white/5 text-white/30"
                )}>{t.tab}</span>
              </div>
              <p className="text-xs text-white/30 font-medium mb-3">{t.model}</p>
              <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{t.prompt}</p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-white/20 group-hover:text-white/60 transition-colors">
                <Sparkles className="w-3 h-3" /> Use this template
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Settings Screen ────────────────────────────────────────── */
function SettingsScreen() {
  const providerSettings = useWorkflowStore(s => s.providerSettings);
  const updateProviderApiKey = useWorkflowStore(s => s.updateProviderApiKey);
  const [show, setShow] = useState<Record<string, boolean>>({});

  const PROVIDERS = [
    { id: "gemini",    name: "Google Gemini", placeholder: "AIza..." },
    { id: "fal",       name: "fal.ai",        placeholder: "fal_..." },
    { id: "replicate", name: "Replicate",     placeholder: "r8_..."  },
    { id: "wavespeed", name: "WaveSpeed",     placeholder: "ws_..."  },
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">API Keys</h2>
        <p className="text-white/30 text-sm mb-8">Add your own keys to use premium models. Keys are stored locally.</p>

        <div className="space-y-3">
          {PROVIDERS.map(p => {
            const key = providerSettings.providers[p.id as keyof typeof providerSettings.providers]?.apiKey || "";
            return (
              <div key={p.id} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white text-sm">{p.name}</span>
                  {key && <span className="text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">Connected</span>}
                </div>
                <div className="relative">
                  <input
                    type={show[p.id] ? "text" : "password"}
                    value={key}
                    onChange={e => updateProviderApiKey(p.id, e.target.value)}
                    placeholder={p.placeholder}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-white/20 transition-all pr-16"
                  />
                  <button
                    onClick={() => setShow(s => ({ ...s, [p.id]: !s[p.id] }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                  >
                    {show[p.id] ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-white text-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-lg tracking-tighter">Upgrade to Pro</p>
              <p className="text-sm text-black/50 mt-1">Unlock all models, 2000 credits/month</p>
            </div>
            <button
              onClick={async () => {
                const token = localStorage.getItem("pixza_token");
                if (!token) { window.location.href = "/auth/signin"; return; }
                try {
                  const { wpCreateCheckout } = await import("@/lib/wordpress");
                  const { checkout_url } = await wpCreateCheckout(token, "pro");
                  window.location.href = checkout_url;
                } catch {
                  window.location.href = "/settings";
                }
              }}
              className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black/80 transition-all"
            >
              <Crown className="w-4 h-4" /> Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tools Screen ───────────────────────────────────────────── */
function ToolsScreen() {
  return (
    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">Image Tools</h2>
        <p className="text-white/30 text-sm mb-8">Local AI — runs in your browser, zero API cost.</p>
        <ImageTools />
      </div>
    </div>
  );
}

/* ── Root Page ──────────────────────────────────────────────── */
export default function CreatePage() {
  const [screen, setScreen] = useState<NavScreen>("create");
  const [pendingTemplate, setPendingTemplate] = useState<typeof TEMPLATES[0] | null>(null);

  // Import WPAuth for credits + user display
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    // Lazy import to avoid SSR issues
    import("@/lib/wp-auth-context").then(({ useWPAuth: _ }) => {});
    // Read user from localStorage token
    const token = localStorage.getItem("pixza_token");
    if (token) {
      import("@/lib/wordpress").then(({ wpGetMe }) => {
        wpGetMe(token).then(u => {
          setUser(u);
          setCredits(u.meta?.credits ?? null);
        }).catch(() => {});
      });
    }
  }, []);

  const handleUseTemplate = (t: typeof TEMPLATES[0]) => {
    setPendingTemplate(t);
    setScreen("create");
  };

  const handleUpgrade = async () => {
    const token = localStorage.getItem("pixza_token");
    if (!token) { window.location.href = "/auth/signin"; return; }
    try {
      const { wpCreateCheckout } = await import("@/lib/wordpress");
      const { checkout_url } = await wpCreateCheckout(token, "pro");
      window.location.href = checkout_url;
    } catch {
      window.location.href = "/settings";
    }
  };

  const plan = user?.meta?.plan ?? "free";
  const isPro = plan !== "free";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans antialiased">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col items-center py-6 w-20 flex-shrink-0 bg-[#0A0A0A] border-r border-white/5 z-50">
        <Link href="/landing" className="mb-10 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
            <img src="/pixza-logo.png" alt="" className="w-5 h-5 invert" />
          </div>
        </Link>

        {([
          { id: "create",   icon: Sparkles,  label: "Create"    },
          { id: "explore",  icon: Compass,   label: "Templates" },
          { id: "tools",    icon: Wand2,     label: "Tools"     },
          { id: "settings", icon: Settings,  label: "Settings"  },
        ] as { id: NavScreen; icon: any; label: string }[]).map(item => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              title={item.label}
              className={cn(
                "w-12 h-12 rounded-2xl mb-2 flex items-center justify-center transition-all group relative",
                active ? "bg-white text-black" : "text-white/20 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {item.label}
              </span>
            </button>
          );
        })}

        <div className="mt-auto flex flex-col items-center gap-3">
          {/* Credits pill */}
          {credits !== null && (
            <button
              onClick={handleUpgrade}
              title={isPro ? `${credits} credits left` : "Upgrade for more credits"}
              className={cn(
                "w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all group relative border",
                isPro ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : "bg-white/5 border-white/5 text-white/30 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400"
              )}
            >
              <Zap className="w-4 h-4" />
              <span className="text-[8px] font-black mt-0.5">{credits > 999 ? `${Math.floor(credits/1000)}k` : credits}</span>
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-white text-black text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {isPro ? `${credits} credits` : "Upgrade →"}
              </span>
            </button>
          )}

          {/* User avatar */}
          <Link
            href={user ? "/settings" : "/auth/signin"}
            title={user ? user.name || user.username : "Sign In"}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all overflow-hidden"
          >
            {user ? (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-xs font-black">
                {(user.name || user.username || "U")[0].toUpperCase()}
              </div>
            ) : (
              <Crown className="w-4 h-4" />
            )}
          </Link>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-5 h-14 border-b border-white/5 flex-shrink-0">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <img src="/pixza-logo.png" alt="" className="w-4 h-4 invert" />
            </div>
            <span className="font-black tracking-tighter">Pixza</span>
          </Link>
          <div className="flex gap-1">
            {([
              { id: "create",   icon: Sparkles },
              { id: "explore",  icon: Compass  },
              { id: "tools",    icon: Wand2    },
              { id: "settings", icon: Settings },
            ] as { id: NavScreen; icon: any }[]).map(item => (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                  screen === item.id ? "bg-white text-black" : "text-white/30 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </header>

        {/* Screen content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {screen === "create"   && <CreateScreen key={pendingTemplate?.id ?? "create"} />}
            {screen === "explore"  && <ExploreScreen onUse={handleUseTemplate} />}
            {screen === "tools"    && <ToolsScreen />}
            {screen === "settings" && <SettingsScreen />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Grain */}
      <div
        className="fixed inset-0 pointer-events-none z-[999] opacity-[0.025]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />
    </div>
  );
}
