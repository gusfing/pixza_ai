"use client";


import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon, Video, Music, Box, Sparkles, Settings, Compass,
  Download, X, RefreshCw, Upload, ChevronDown, Check,
  Wand2, Zap, Crown, ArrowRight, ShoppingBag,
  Palette, Lightbulb, ScanSearch, AlertTriangle, MessageSquare,
  Star, Copy, ChevronRight, Layers, Eye, RotateCcw, GitBranch, Images
} from "lucide-react";import { useWorkflowStore } from "@/store/workflowStore";
import { ImageTools } from "@/components/ui/image-tools";
import { CFreeTools } from "@/components/ui/cf-free-tools";
import { CatalogueScreen } from "@/components/ui/catalogue-screen";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────── */
type Tab = "Image" | "Video" | "Audio" | "3D";
type NavScreen = "create" | "explore" | "tools" | "settings" | "catalogue";
interface Model {
  provider: string;
  modelId: string;
  label: string;
  tabs: Tab[];
  badge?: string;
  tier: "free" | "pro" | "agency"; // access tier
  creditCost: number; // credits per generation
}

/* ── Plan Config ─────────────────────────────────────────────── */
const PLAN_LIMITS = {
  free:   { credits: 100,   label: "Free",   color: "text-white/40" },
  pro:    { credits: 3000,  label: "Pro",    color: "text-violet-400" },
  agency: { credits: 8000,  label: "Agency", color: "text-amber-400" },
};

/* ── Model Registry ─────────────────────────────────────────── */
const MODELS: Model[] = [
  // ── FREE TIER — Cloudflare AI (zero cost) ──────────────────
  { provider: "cloudflare", modelId: "@cf/black-forest-labs/flux-1-schnell",              label: "FLUX Schnell",         tabs: ["Image"], badge: "Free",    tier: "free",   creditCost: 1 },
  { provider: "cloudflare", modelId: "@cf/black-forest-labs/flux-2-klein-4b",             label: "FLUX.2 Klein 4B",      tabs: ["Image"], badge: "Fast",    tier: "free",   creditCost: 1 },
  { provider: "cloudflare", modelId: "@cf/black-forest-labs/flux-2-klein-9b",             label: "FLUX.2 Klein 9B",      tabs: ["Image"], badge: "New",     tier: "free",   creditCost: 1 },
  { provider: "cloudflare", modelId: "@cf/black-forest-labs/flux-2-dev",                  label: "FLUX.2 Dev",           tabs: ["Image"],                   tier: "free",   creditCost: 1 },
  { provider: "cloudflare", modelId: "@cf/stabilityai/stable-diffusion-xl-base-1.0",     label: "SDXL",                 tabs: ["Image"], badge: "Free",    tier: "free",   creditCost: 1 },
  { provider: "cloudflare", modelId: "@cf/bytedance/stable-diffusion-xl-lightning",      label: "SDXL Lightning",       tabs: ["Image"], badge: "Free",    tier: "free",   creditCost: 1 },
  { provider: "cloudflare", modelId: "@cf/lykon/dreamshaper-8-lcm",                      label: "DreamShaper",          tabs: ["Image"], badge: "Free",    tier: "free",   creditCost: 1 },

  // ── FREE TIER — Gemini Flash (free quota) ──────────────────
  { provider: "gemini",     modelId: "nano-banana",                                       label: "Gemini Flash Image",   tabs: ["Image"], badge: "Free",    tier: "free",   creditCost: 1 },

  // ── PRO TIER — Image ───────────────────────────────────────
  // WaveSpeed FLUX — ~₹1.7/image, very fast
  { provider: "wavespeed",  modelId: "wavespeed-ai/flux-dev-ultra-fast",                  label: "FLUX Dev Ultra Fast",  tabs: ["Image"], badge: "Fast",    tier: "pro",    creditCost: 2 },
  { provider: "wavespeed",  modelId: "wavespeed-ai/flux-dev/fp8",                         label: "FLUX Dev",             tabs: ["Image"],                   tier: "pro",    creditCost: 2 },
  // Gemini Imagen — ~₹3.3–3.4/image
  { provider: "gemini",     modelId: "nano-banana-pro",                                   label: "Imagen 3",             tabs: ["Image"], badge: "Google",  tier: "pro",    creditCost: 4 },
  { provider: "gemini",     modelId: "nano-banana-2",                                     label: "Imagen 4",             tabs: ["Image"], badge: "Best",    tier: "pro",    creditCost: 5 },

  // ── PRO TIER — Video (cheap) ───────────────────────────────
  // Wan 2.6 — ~₹6/10s video (cheapest quality video)
  { provider: "wavespeed",  modelId: "wavespeed-ai/wan-2.1-t2v-480p",                     label: "Wan 2.1 (Fast)",       tabs: ["Video"], badge: "Fast",    tier: "pro",    creditCost: 8 },
  // Seedance 1.5 — ~₹22/5s video
  { provider: "wavespeed",  modelId: "wavespeed-ai/seedance-1.5-lite-t2v-480p",           label: "Seedance 1.5 Lite",    tabs: ["Video"],                   tier: "pro",    creditCost: 15 },
  { provider: "wavespeed",  modelId: "wavespeed-ai/seedance-1.5-pro-t2v-720p",            label: "Seedance 1.5 Pro",     tabs: ["Video"], badge: "Popular", tier: "pro",    creditCost: 20 },

  // ── AGENCY TIER — Video (premium) ─────────────────────────
  // Seedance 2.0 — ~₹22/5s 720p
  { provider: "wavespeed",  modelId: "wavespeed-ai/seedance-2.0-t2v-720p",                label: "Seedance 2.0",         tabs: ["Video"], badge: "New",     tier: "agency", creditCost: 25 },
  // Veo 3 Fast via KIE — ₹34/8s (vs ₹504 on fal) — 15x cheaper
  { provider: "kie",        modelId: "veo3-fast/text-to-video",                            label: "Veo 3 Fast",           tabs: ["Video"], badge: "Best",    tier: "agency", creditCost: 40 },
  // Veo 2 — ~₹85–170/video
  { provider: "gemini",     modelId: "veo-2.0-generate-001",                              label: "Veo 2",                tabs: ["Video"], badge: "Google",  tier: "agency", creditCost: 60 },
  // Veo 3 — ~₹340/video
  { provider: "gemini",     modelId: "veo-3.0-generate-preview",                          label: "Veo 3",                tabs: ["Video"], badge: "Best",    tier: "agency", creditCost: 150 },
];

const EXAMPLE_CARDS = [
  { title: "Product Shot",    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",  tab: "Image" as Tab },
  { title: "Cinematic Scene", img: "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?w=400&q=80",  tab: "Image" as Tab },
  { title: "AI Portrait",     img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&q=80",  tab: "Image" as Tab },
  { title: "Abstract Art",    img: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80",     tab: "Image" as Tab },
  { title: "Architecture",    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",  tab: "Image" as Tab },
];

const TAB_CONFIG: Record<Tab, { icon: any; color: string; placeholder: string }> = {
  Image: { icon: ImageIcon, color: "text-cyan-400",    placeholder: "A cinematic portrait in golden hour light…" },
  Video: { icon: Video,     color: "text-violet-400",  placeholder: "Slow motion ocean waves crashing on rocks…" },
  Audio: { icon: Music,     color: "text-amber-400",   placeholder: "Upbeat electronic pop song with catchy melody…" },
  "3D":  { icon: Box,       color: "text-emerald-400", placeholder: "A detailed 3D model of a futuristic helmet…" },
};

/* ── Model Picker ───────────────────────────────────────────── */
function ModelPicker({ models, value, onChange, userPlan = "free" }: {
  models: Model[]; value: string; onChange: (v: string) => void; userPlan?: string;
}) {
  const [open, setOpen] = useState(false);
  const sel = models.find(m => m.modelId === value) || models[0];

  const canUse = (m: Model) => {
    if (m.tier === "free") return true;
    if (m.tier === "pro") return userPlan === "pro" || userPlan === "agency";
    if (m.tier === "agency") return userPlan === "agency";
    return false;
  };

  const tierColor = (tier: string) => {
    if (tier === "free") return "text-green-400 bg-green-500/10";
    if (tier === "pro") return "text-violet-400 bg-violet-500/10";
    return "text-amber-400 bg-amber-500/10";
  };

  const dotColor = sel?.tier === "free" ? "bg-green-400" : sel?.tier === "pro" ? "bg-violet-400" : "bg-amber-400";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-white"
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
        {sel?.label}
        {sel?.badge && <span className="text-[8px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{sel.badge}</span>}
        <ChevronDown className={cn("w-3 h-3 text-white/30 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1 z-[200] bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] max-h-72 overflow-y-auto"
            onMouseLeave={() => setOpen(false)}
          >
            {models.map(m => {
              const locked = !canUse(m);
              return (
                <button
                  key={m.modelId}
                  onClick={() => { if (!locked) { onChange(m.modelId); setOpen(false); } }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 text-xs transition-all",
                    locked ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5",
                    value === m.modelId ? "text-white font-bold" : "text-white/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {locked && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                    <span>{m.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded", tierColor(m.tier))}>
                      {m.tier === "free" ? "Free" : m.tier === "pro" ? "Pro" : "Agency"}
                    </span>
                    <span className="text-[8px] text-white/20">{m.creditCost}cr</span>
                    {value === m.modelId && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── History Panel ──────────────────────────────────────────── */
function HistoryPanel({ onReuse }: { onReuse: (images: string[], prompt: string) => void }) {
  const [history, setHistory] = useState<import("@/lib/generation-history").HistoryItem[]>([]);

  useEffect(() => {
    import("@/lib/generation-history").then(({ loadHistory }) => {
      setHistory(loadHistory());
    });
  }, []);

  if (history.length === 0) return null;

  return (
    <BlurFade delay={0.5} inView>
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Your History</p>
          <button
            onClick={() => {
              import("@/lib/generation-history").then(({ clearHistory }) => {
                clearHistory();
                setHistory([]);
              });
            }}
            className="text-[10px] text-white/15 hover:text-white/40 transition-colors"
          >
            Clear all
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {history.slice(0, 10).map((item) => {
            const img = item.images[0];
            const isTruncated = img?.includes("TRUNCATED");
            return (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => !isTruncated && onReuse(item.images, item.prompt)}>
                <div className="w-full h-[160px] overflow-hidden rounded-2xl bg-white/5">
                  {img && !isTruncated ? (
                    <img src={img} alt={item.prompt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white/10" />
                    </div>
                  )}
                </div>
                {/* Hover overlay */}
                {!isTruncated && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">View</span>
                  </div>
                )}
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    import("@/lib/generation-history").then(({ deleteFromHistory }) => {
                      deleteFromHistory(item.id);
                      setHistory(h => h.filter(x => x.id !== item.id));
                    });
                  }}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[10px] text-white/30 mt-1 px-0.5 truncate">{item.prompt || item.tab}</p>
              </div>
            );
          })}
        </div>
      </div>
    </BlurFade>
  );
}

/* ── Persist create screen state across refreshes ──────────── */
const CREATE_STATE_KEY = "pixza_create_state";

function loadCreateState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CREATE_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveCreateState(state: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(CREATE_STATE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

/* ── Main Create Screen ─────────────────────────────────────── */
function CreateScreen() {
  const saved = loadCreateState();

  const [tab, setTab]             = useState<Tab>(saved?.tab ?? "Image");
  const [modelId, setModelId]     = useState<string>(saved?.modelId ?? MODELS.filter(m => m.tabs.includes("Image"))[0].modelId);
  const [refImage, setRefImage]   = useState<string | null>(saved?.refImage ?? null);
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState<string[]>(saved?.results ?? []);
  const [error, setError]         = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>(saved?.lastPrompt ?? "");
  const [userPlan, setUserPlan]   = useState("free");
  const [credits, setCredits]     = useState<number | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>(saved?.aspectRatio ?? "1:1");
  const [numImages, setNumImages] = useState<number>(saved?.numImages ?? 1);

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    saveCreateState({ tab, modelId, refImage, results, lastPrompt, aspectRatio, numImages });
  }, [tab, modelId, refImage, results, lastPrompt, aspectRatio, numImages]);

  const refreshCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits ?? null);
        setUserPlan(data.plan ?? "free");
      }
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("pixza_token");
    if (token) {
      import("@/lib/wordpress").then(({ wpGetMe }) => {
        wpGetMe(token).then(u => {
          setUserPlan(u.meta?.plan ?? "free");
          setCredits(u.meta?.credits ?? null);
        }).catch(() => {});
      });
    }
  }, []);

  const tabModels = MODELS.filter(m => m.tabs.includes(tab));
  const selModel = tabModels.find(m => m.modelId === modelId) || tabModels[0];

  useEffect(() => {
    const first = tabModels[0];
    if (first && !tabModels.find(m => m.modelId === modelId)) setModelId(first.modelId);
    setResults([]); setError(null);
  }, [tab]);

  const generate = useCallback(async (prompt: string) => {
    if (!prompt.trim() || loading) return;
    setLoading(true); setError(null); setResults([]);
    setLastPrompt(prompt.trim());
    try {
      const body: Record<string, unknown> = {
        prompt: prompt.trim(),
        selectedModel: { provider: selModel.provider, modelId: selModel.modelId, displayName: selModel.label },
        aspectRatio,
      };
      if (refImage) { body.images = [refImage]; body.dynamicInputs = { image_url: refImage }; }
      if (tab === "Video") body.mediaType = "video";
      if (tab === "3D") body.mediaType = "3d";
      if (tab === "Audio") body.mediaType = "audio";

      // Generate multiple images in parallel (only for image tab)
      const count = tab === "Image" ? numImages : 1;
      const promises = Array.from({ length: count }, () =>
        fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
          .then(r => r.json())
      );

      const dataArr = await Promise.all(promises);
      const outputs: string[] = [];
      for (const data of dataArr) {
        if (!data.success) throw new Error(data.error || "Generation failed");
        let out: string | null = null;
        if (data.video) out = `data:video/mp4;base64,${data.video}`;
        else if (data.videoUrl) out = data.videoUrl;
        else if (data.model3dUrl) out = data.model3dUrl;
        else if (data.audio) out = `data:audio/mp3;base64,${data.audio}`;
        else if (data.image) out = data.image;
        if (out) outputs.push(out);
      }
      if (outputs.length === 0) throw new Error("No output received");
      setResults(outputs);
      // Refresh credit balance from server after successful generation
      refreshCredits();
      // Save to persistent history (survives browser close)
      import("@/lib/generation-history").then(({ saveToHistory, saveGenerationToDb }) => {
        saveToHistory({
          prompt: prompt.trim(),
          model: selModel.modelId,
          provider: selModel.provider,
          tab,
          aspectRatio,
          images: outputs,
        });
        // Also save metadata to DB (fire-and-forget)
        saveGenerationToDb({
          prompt: prompt.trim(),
          mode: tab.toLowerCase(),
          model: selModel.modelId,
          provider: selModel.provider,
          outputUrl: outputs[0]?.startsWith("http") ? outputs[0] : undefined,
        });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [selModel, refImage, tab, loading, aspectRatio, numImages, refreshCredits]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  const TabIcon = TAB_CONFIG[tab].icon;
  const outputType = tab === "Video" ? "video" : tab === "Audio" ? "audio" : "image";
  const result = results[0] ?? null; // backward compat for single result display

  // Compute aspect ratio CSS for result container
  const aspectMap: Record<string, string> = { "1:1": "aspect-square", "4:3": "aspect-[4/3]", "3:4": "aspect-[3/4]", "16:9": "aspect-video", "9:16": "aspect-[9/16]" };
  const resultAspect = aspectMap[aspectRatio] ?? "aspect-square";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-5 pt-8 pb-16">

        {/* Greeting — compact */}
        {results.length === 0 && !loading && (
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-7">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">
                Good {greeting}.
              </h1>
              <p className="text-white/30 text-sm mb-4">Ready to create something?</p>
              <Link href="/studio"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/40 text-xs font-bold hover:text-white hover:border-white/20 hover:bg-white/10 transition-all">
                <GitBranch className="w-3.5 h-3.5" />
                Switch to Node Studio
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </BlurFade>
        )}

        {/* Tab selector */}
        <BlurFade delay={0.15} inView>
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {(["Image", "Video", "Audio", "3D"] as Tab[]).map(t => {
              const Ic = TAB_CONFIG[t].icon;
              return (
                <button key={t} onClick={() => setTab(t)}
                  className={cn("flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all",
                    tab === t ? "bg-white text-black" : "text-white/40 hover:text-white hover:bg-white/5")}>
                  <Ic className="w-3.5 h-3.5" />{t}
                </button>
              );
            })}
          </div>
        </BlurFade>

        {/* AI Input — options embedded inside the box */}
        <BlurFade delay={0.2} inView>
          <div className="mb-5 relative z-[200]">
            <AIInputWithSearch
              placeholder={TAB_CONFIG[tab].placeholder}
              models={tabModels}
              selectedModelId={selModel.modelId}
              onModelChange={setModelId}
              userPlan={userPlan}
              showOptions={tab === "Image"}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              numImages={numImages}
              onNumImagesChange={setNumImages}
              refImage={refImage}
              onRefImageRemove={() => setRefImage(null)}
              credits={credits}
              onSubmit={(val) => {
                if (credits !== null && selModel && credits < selModel.creditCost * numImages) {
                  setError(`Not enough credits. Need ${selModel.creditCost * numImages}, have ${credits}.`);
                  return;
                }
                generate(val);
              }}
              onFileSelect={(file) => {
                const r = new FileReader();
                r.onload = (e) => setRefImage(e.target?.result as string);
                r.readAsDataURL(file);
              }}
            />
          </div>
        </BlurFade>

        {/* Result area */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={cn("rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-4",
                results.length === 0 ? (tab === "Image" ? resultAspect : "aspect-video") : "py-16")}>
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                <div className="absolute inset-0 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <TabIcon className={cn("absolute inset-0 m-auto w-5 h-5", TAB_CONFIG[tab].color)} />
              </div>
              <p className="text-sm font-bold text-white/60">Generating your {tab.toLowerCase()}…</p>
            </motion.div>
          )}

          {!loading && results.length > 0 && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }} className="flex flex-col gap-3">

              {results.length === 1 ? (
                <div className="group relative rounded-3xl overflow-hidden bg-black border border-white/8">
                  {outputType === "video" ? (
                    <video src={results[0]} controls autoPlay loop className="w-full" />
                  ) : outputType === "audio" ? (
                    <div className="p-10 flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                        <Music className="w-7 h-7 text-amber-400" />
                      </div>
                      <audio src={results[0]} controls className="w-full" />
                    </div>
                  ) : (
                    <div className="relative">
                      <img src={results[0]} alt="Generated"
                        className="w-full h-auto block" />
                      {selModel?.tier === "free" && (
                        <div className="absolute bottom-3 right-3 pointer-events-none flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10">
                          <img src="/pixza-logo.png" alt="" className="w-5 h-5 opacity-70" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Pixza Free</span>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Hover actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={results[0]} download={`pixza-${tab.toLowerCase()}`}
                      className="w-9 h-9 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {results.map((r, i) => (
                    <div key={i} className="group relative rounded-2xl overflow-hidden bg-black border border-white/5">
                      <img src={r} alt={`Generated ${i + 1}`} className="w-full h-auto block" />
                      {selModel?.tier === "free" && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-white/10">
                          <img src="/pixza-logo.png" alt="" className="w-4 h-4 opacity-70" />
                          <span className="text-[9px] font-black text-white/40">Free</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={r} download={`pixza-${i + 1}.png`}
                          className="w-7 h-7 rounded-lg bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action bar */}
              <div className="flex gap-2">
                <button onClick={() => { setResults([]); setLastPrompt(""); sessionStorage.removeItem(CREATE_STATE_KEY); }}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm font-bold hover:text-white hover:border-white/20 transition-all">
                  New
                </button>
                <button onClick={() => generate(lastPrompt)} disabled={!lastPrompt}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm font-bold hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-30">
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
                {results.length === 1 ? (
                  <a href={results[0]} download={`pixza-${tab.toLowerCase()}`}
                    className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Save
                  </a>
                ) : (
                  <button
                    onClick={() => results.forEach((r, i) => { const a = document.createElement("a"); a.href = r; a.download = `pixza-${i + 1}.png`; a.click(); })}
                    className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Save All
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {!loading && error && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
              {error.includes("credits") ? (
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("pixza_token");
                    if (!token) { window.location.href = "/auth/signin"; return; }
                    try {
                      const { openRazorpayCheckout } = await import("@/lib/razorpay");
                      await openRazorpayCheckout({ plan: "pro", onSuccess: () => {}, onError: () => {}, onDismiss: () => {} });
                    } catch { window.location.href = "/settings"; }
                  }}
                  className="mt-3 flex items-center gap-2 text-[11px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest">
                  <Crown className="w-3 h-3" /> Upgrade to Pro
                </button>
              ) : (
                <button onClick={() => generate(lastPrompt)}
                  className="mt-2 text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example cards — shown when idle */}
        {!loading && results.length === 0 && !error && (
          <BlurFade delay={0.35} inView>
            <div className="mt-6 relative z-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Created with Pixza</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {EXAMPLE_CARDS.map((card, i) => (
                  <motion.div key={card.title}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.35 }}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer">
                    <div className="w-full h-[160px] overflow-hidden rounded-2xl">
                      <img src={card.img} alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="absolute top-2 left-2 flex items-center gap-1 overflow-hidden rounded-full bg-black/70 backdrop-blur-sm px-2 py-1 w-7 h-7 group-hover:w-14 transition-all duration-300">
                      <Sparkles className="w-3 h-3 text-white shrink-0" />
                      <span className="text-white text-[10px] font-bold whitespace-nowrap overflow-hidden">Use</span>
                    </div>
                    <p className="text-center text-[11px] font-medium text-white/50 mt-1.5 pb-0.5">{card.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </BlurFade>
        )}

        {/* Your history — shown when idle */}
        {!loading && results.length === 0 && !error && <HistoryPanel onReuse={(imgs, prompt) => { setResults(imgs); setLastPrompt(prompt); }} />}
      </div>
    </div>
  );
}

/* ── Explore Screen ─────────────────────────────────────────── */
const TEMPLATES = [
  { id: "product",   tab: "Image" as Tab, title: "Floating Product Shot",  model: "FLUX.2 Pro",    provider: "fal",    modelId: "fal-ai/flux-2-pro",                          prompt: "Isolate the product from its background. Place it floating on a soft neutral surface with a subtle shadow. Studio lighting, sharp focus." },
  { id: "portrait",  tab: "Image" as Tab, title: "Cinematic Portrait",     model: "FLUX Realism",  provider: "fal",    modelId: "fal-ai/flux-realism",                        prompt: "Cinematic portrait photography, shallow depth of field, golden hour lighting, film grain, 35mm lens, professional color grading" },
  { id: "concept",   tab: "Image" as Tab, title: "Epic Concept Art",       model: "GPT Image 2",   provider: "fal",    modelId: "fal-ai/gpt-image-2",                         prompt: "Epic fantasy concept art, dramatic lighting, detailed environment, professional illustration, cinematic composition, 8K resolution" },
  { id: "video1",    tab: "Video" as Tab, title: "Product Reveal",         model: "Kling 3.0 Pro", provider: "fal",    modelId: "fal-ai/kling-video/v3/pro/text-to-video",    prompt: "Elegant product reveal, slow 360 rotation, studio lighting, dark background, luxury feel, smooth camera movement" },
  { id: "video2",    tab: "Video" as Tab, title: "Nature Timelapse",       model: "Veo 3",         provider: "gemini", modelId: "veo-3.0-generate-preview",                   prompt: "Timelapse of clouds moving over mountain peaks at sunset, cinematic, 4K" },
  { id: "audio1",    tab: "Audio" as Tab, title: "Cinematic Score",        model: "MiniMax Music",  provider: "fal",   modelId: "fal-ai/minimax-music/v2",                    prompt: "Epic cinematic orchestral score, emotional, 120 BPM, strings and brass" },
];

function ExploreScreen({ onUse }: { onUse: (t: typeof TEMPLATES[0]) => void }) {
  const [filter, setFilter] = useState<Tab | "All">("All");
  const filtered = filter === "All" ? TEMPLATES : TEMPLATES.filter(t => t.tab === filter);
  return (
    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-24 max-w-4xl mx-auto w-full">
      <BlurFade delay={0.1} inView>
        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">Templates</h2>
        <p className="text-white/30 text-sm mb-6">Click any template to load it into the generator.</p>
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["All", "Image", "Video", "Audio", "3D"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f as any)}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                filter === f ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white")}>
              {f}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(t => (
            <button key={t.id} onClick={() => onUse(t)}
              className="group p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">{t.title}</span>
                <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                  t.tab === "Image" ? "bg-cyan-500/10 text-cyan-400" :
                  t.tab === "Video" ? "bg-violet-500/10 text-violet-400" :
                  t.tab === "Audio" ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/30"
                )}>{t.tab}</span>
              </div>
              <p className="text-[10px] text-white/30 font-medium mb-2">{t.model}</p>
              <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{t.prompt}</p>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-white/20 group-hover:text-white/60 transition-colors">
                <Sparkles className="w-3 h-3" /> Use template
              </div>
            </button>
          ))}
        </div>
      </BlurFade>
    </div>
  );
}

/* ── Settings Screen ────────────────────────────────────────── */
function SettingsScreen() {
  const [tab, setTab] = useState<"plan" | "usage">("plan");

  // Live data from WP
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditLimit, setCreditLimit] = useState<number | null>(null);
  const [plan, setPlan] = useState("free");
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Load user + credits on mount
  useEffect(() => {
    const token = localStorage.getItem("pixza_token");
    if (!token) return;
    fetch("/api/credits").then(r => r.json()).then(d => {
      setCredits(d.credits ?? null);
      setCreditLimit(d.limit ?? null);
      setPlan(d.plan ?? "free");
    }).catch(() => {});
    import("@/lib/wordpress").then(({ wpGetMe, wpGetSubscription }) => {
      wpGetMe(token).then(setUser).catch(() => {});
      wpGetSubscription(token).then(setSubscription).catch(() => {});
    });
  }, []);

  // Load usage when tab switches
  useEffect(() => {
    if (tab !== "usage") return;
    const token = localStorage.getItem("pixza_token");
    if (!token) return;
    setUsageLoading(true);
    import("@/lib/wordpress").then(() => {
      fetch("/api/wp-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/pixza/v1/usage?per_page=30", method: "GET", token }),
      }).then(r => r.json()).then(d => {
        setUsage(d.items ?? []);
        setUsageLoading(false);
      }).catch(() => setUsageLoading(false));
    });
  }, [tab]);

  const handleUpgrade = async (targetPlan: "pro" | "agency") => {
    const token = localStorage.getItem("pixza_token");
    if (!token) { window.location.href = "/auth/signin"; return; }
    setUpgrading(targetPlan);
    try {
      const { openRazorpayCheckout } = await import("@/lib/razorpay");
      await openRazorpayCheckout({
        plan: targetPlan,
        onSuccess: (data) => {
          setMsg({ type: "ok", text: `🎉 Upgraded to ${data.plan}! ${data.credits} credits added.` });
          setUpgrading(null);
          setPlan(data.plan);
          setCredits(data.credits);
          setCreditLimit(data.credits);
          // Refresh from server
          fetch("/api/credits").then(r => r.json()).then(d => {
            setCredits(d.credits ?? null);
            setCreditLimit(d.limit ?? null);
            setPlan(d.plan ?? "free");
          }).catch(() => {});
        },
        onError: (err) => {
          setMsg({ type: "err", text: err });
          setUpgrading(null);
        },
        onDismiss: () => setUpgrading(null),
      });
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Checkout failed" });
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel your subscription? You keep access until the end of the billing period.")) return;
    const token = localStorage.getItem("pixza_token");
    if (!token) return;
    setCancelLoading(true);
    try {
      const { wpCancelSubscription } = await import("@/lib/wordpress");
      await wpCancelSubscription(token);
      setSubscription((s: any) => ({ ...s, status: "cancelled" }));
      setMsg({ type: "ok", text: "Subscription cancelled. Access continues until period end." });
    } catch (e) {
      setMsg({ type: "err", text: "Failed to cancel. Contact support." });
    }
    setCancelLoading(false);
  };

  const creditPct = credits !== null && creditLimit ? Math.round((credits / creditLimit) * 100) : null;
  const planColor = plan === "agency" ? "text-amber-400" : plan === "pro" ? "text-violet-400" : "text-white/40";
  const planBg    = plan === "agency" ? "bg-amber-500/10 border-amber-500/20" : plan === "pro" ? "bg-violet-500/10 border-violet-500/20" : "bg-white/5 border-white/10";

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-24 max-w-2xl mx-auto w-full">
      <BlurFade delay={0.1} inView>
        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">Settings</h2>
        <p className="text-white/30 text-sm mb-6">Manage your plan and credits.</p>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-8 w-fit">
          {([
            { id: "plan",  label: "Plan & Credits" },
            { id: "usage", label: "Usage History"  },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                tab === t.id ? "bg-white text-black" : "text-white/30 hover:text-white")}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && (
          <div className={cn("mb-4 p-3 rounded-xl text-xs font-bold", msg.type === "ok" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}>
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-2 opacity-50 hover:opacity-100">✕</button>
          </div>
        )}

        {/* ── PLAN & CREDITS TAB ── */}
        {tab === "plan" && (
          <div className="space-y-5">
            {/* Current plan card */}
            <div className={cn("p-5 rounded-2xl border", planBg)}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Current Plan</p>
                  <p className={cn("text-2xl font-black tracking-tighter capitalize", planColor)}>
                    {plan}
                    {subscription?.status === "cancelled" && <span className="text-xs text-white/30 ml-2 font-normal">(cancels at period end)</span>}
                  </p>
                </div>
                {user && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white font-black text-sm">
                    {(user.name || user.username || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Credit bar */}
              {credits !== null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40 font-bold">Credits remaining</span>
                    <span className="text-xs font-black text-white tabular-nums">
                      {credits.toLocaleString()} / {(creditLimit ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700",
                        (creditPct ?? 100) > 50 ? "bg-white" : (creditPct ?? 100) > 20 ? "bg-amber-400" : "bg-red-400")}
                      style={{ width: `${creditPct ?? 0}%` }}
                    />
                  </div>
                  {(creditPct ?? 100) < 20 && (
                    <p className="text-[10px] text-amber-400 mt-1.5 font-bold">Running low — upgrade to get more credits</p>
                  )}
                </div>
              )}

              {subscription?.next_payment && (
                <p className="text-[10px] text-white/20 mt-3">
                  Next renewal: {new Date(subscription.next_payment).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Upgrade cards */}
            {plan === "free" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pro */}
                <div className="p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">Pro</span>
                    <span className="text-lg font-black text-white">$19<span className="text-xs text-white/30">/mo</span></span>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {["3,000 credits/month", "FLUX + Imagen 3 & 4", "Seedance video", "No watermarks", "Priority generation"].map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                        <Check className="w-3 h-3 text-violet-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleUpgrade("pro")} disabled={upgrading === "pro"}
                    className="w-full py-2.5 rounded-xl bg-violet-500 text-white text-xs font-black hover:bg-violet-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {upgrading === "pro" ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</> : <><Crown className="w-3.5 h-3.5" /> Upgrade — ₹999/mo</>}
                  </button>
                </div>

                {/* Agency */}
                <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Agency</span>
                    <span className="text-lg font-black text-white">$79<span className="text-xs text-white/30">/mo</span></span>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {["8,000 credits/month", "Everything in Pro", "Veo 2 & 3 video", "Team seats (coming soon)", "Priority support"].map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                        <Check className="w-3 h-3 text-amber-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleUpgrade("agency")} disabled={upgrading === "agency"}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-xs font-black hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {upgrading === "agency" ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</> : <><Zap className="w-3.5 h-3.5" /> Upgrade — ₹2,999/mo</>}
                  </button>
                </div>
              </div>
            )}

            {/* Manage subscription (paid plans) */}
            {plan !== "free" && subscription?.status === "active" && (
              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Manage Subscription</p>
                  <p className="text-xs text-white/30 mt-0.5">Cancel anytime — access continues until period end</p>
                </div>
                <button onClick={handleCancel} disabled={cancelLoading}
                  className="px-4 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all disabled:opacity-50">
                  {cancelLoading ? "Cancelling…" : "Cancel Plan"}
                </button>
              </div>
            )}

            {/* Credit cost reference */}
            <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Credit Costs</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Image (free model)", cost: 1 },
                  { label: "Image (pro model)",  cost: 3 },
                  { label: "Video",              cost: 10 },
                  { label: "Audio",              cost: 3  },
                  { label: "3D",                 cost: 5  },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-xs text-white/40">{item.label}</span>
                    <span className="text-xs font-black text-white">{item.cost} cr</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USAGE HISTORY TAB ── */}
        {tab === "usage" && (
          <div>
            {usageLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
              </div>
            ) : usage.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-white/30 text-sm">No usage yet — generate something first!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 px-3 pb-2 border-b border-white/5">
                  {["Action", "Model", "Credits", "Date"].map(h => (
                    <span key={h} className="text-[10px] font-black uppercase tracking-widest text-white/20">{h}</span>
                  ))}
                </div>
                {usage.map((row: any) => (
                  <div key={row.id} className="grid grid-cols-4 gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                    <span className="text-xs text-white/60 capitalize truncate">{row.action}</span>
                    <span className="text-xs text-white/30 truncate">{row.model || "—"}</span>
                    <span className="text-xs font-black text-white">−{row.credits}</span>
                    <span className="text-xs text-white/20">{new Date(row.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </BlurFade>
    </div>
  );
}

/* ── Tools Screen ───────────────────────────────────────────── */
function ToolsScreen() {
  const [activeSection, setActiveSection] = useState<"local" | "cloud">("local");

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-24 max-w-3xl mx-auto w-full">
      <BlurFade delay={0.1} inView>
        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">Free AI Tools</h2>
        <p className="text-white/30 text-sm mb-6">Zero credits, zero cost — powered by local AI and Cloudflare.</p>

        {/* Section tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveSection("local")}
            className={cn("px-5 py-2 rounded-xl text-sm font-bold transition-all",
              activeSection === "local" ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white")}
          >
            🖥️ Local (Browser)
          </button>
          <button
            onClick={() => setActiveSection("cloud")}
            className={cn("px-5 py-2 rounded-xl text-sm font-bold transition-all",
              activeSection === "cloud" ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white")}
          >
            ☁️ Cloud (Cloudflare)
          </button>
        </div>

        {activeSection === "local" && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
              Runs entirely in your browser — no uploads, no server
            </p>
            <ImageTools />
          </div>
        )}

        {activeSection === "cloud" && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
              Powered by Cloudflare Workers AI — free tier, no credits needed
            </p>
            <CFreeTools />
          </div>
        )}
      </BlurFade>
    </div>
  );
}

/* ── Product Catalogue Screen — imported from @/components/ui/catalogue-screen ── */

/* ── Root Page ──────────────────────────────────────────────── */
export default function CreatePage() {
  // Persist active screen across refreshes
  const [screen, setScreen] = useState<NavScreen>(() => {
    if (typeof window === "undefined") return "create";
    return (sessionStorage.getItem("pixza_nav_screen") as NavScreen) || "create";
  });
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);

  // Save screen to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("pixza_nav_screen", screen);
  }, [screen]);

  useEffect(() => {
    const token = localStorage.getItem("pixza_token");
    if (token) {
      // Fetch live credits from server (not stale meta)
      fetch("/api/credits").then(r => r.json()).then(d => {
        setCredits(d.credits ?? null);
      }).catch(() => {});
      import("@/lib/wordpress").then(({ wpGetMe }) => {
        wpGetMe(token).then(u => { setUser(u); }).catch(() => {});
      });
    }
    // If returning from Stripe checkout, switch to settings and refresh
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("upgraded") === "1") {
        setScreen("settings");
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  const plan = user?.meta?.plan ?? "free";
  const isPro = plan !== "free";

  const handleUpgrade = async () => {
    const token = localStorage.getItem("pixza_token");
    if (!token) { window.location.href = "/auth/signin"; return; }
    try {
      const { openRazorpayCheckout } = await import("@/lib/razorpay");
      await openRazorpayCheckout({
        plan: "pro",
        onSuccess: () => {
          fetch("/api/credits").then(r => r.json()).then(d => {
            setCredits(d.credits ?? null);
          }).catch(() => {});
        },
        onError: () => {},
        onDismiss: () => {},
      });
    } catch { /* silent */ }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex font-sans antialiased">
      {/* Dot pattern background */}
      <DotPattern className={cn("[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]")} />

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col items-center py-6 w-20 shrink-0 bg-[#0d1117] border-r border-white/5 z-50 relative">
        <Link href="/landing" className="mb-10 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
            <img src="/pixza-logo.png" alt="" className="w-10 h-10 object-cover" />
          </div>
        </Link>

        {([
          { id: "create",    icon: Sparkles,    label: "Create"    },
          { id: "catalogue", icon: ShoppingBag, label: "Catalogue" },
          { id: "explore",   icon: Compass,     label: "Templates" },
          { id: "tools",     icon: Wand2,       label: "Tools"     },
          { id: "settings",  icon: Settings,    label: "Settings"  },
        ] as { id: NavScreen; icon: any; label: string }[]).map(item => {
          const active = screen === item.id;
          return (
            <button key={item.id} onClick={() => setScreen(item.id)} title={item.label}
              className={cn("w-12 h-12 rounded-2xl mb-2 flex items-center justify-center transition-all group relative",
                active ? "bg-white text-black" : "text-white/20 hover:text-white hover:bg-white/5")}>
              <item.icon className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {item.label}
              </span>
            </button>
          );
        })}

        <div className="mt-auto flex flex-col items-center gap-3">
          {/* Gallery link */}
          <Link href="/gallery" title="My Gallery"
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative text-white/20 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/15">
            <Images className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              My Gallery
            </span>
          </Link>
          {/* Node Studio link */}
          <Link href="/studio" title="Node Studio"
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative text-white/20 hover:text-white hover:bg-white/5 border border-dashed border-white/10 hover:border-white/20 mb-1">
            <GitBranch className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              Node Studio
            </span>
          </Link>
          {credits !== null && (
            <button onClick={handleUpgrade} title={isPro ? `${credits} credits` : "Upgrade"}
              className={cn("w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all group relative border",
                isPro ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : "bg-white/5 border-white/5 text-white/30 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400")}>
              <Zap className="w-4 h-4" />
              <span className="text-[8px] font-black mt-0.5">{credits > 999 ? `${Math.floor(credits / 1000)}k` : credits}</span>
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-white text-black text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {isPro ? `${credits} credits` : "Upgrade →"}
              </span>
            </button>
          )}
          <Link href={user ? "/settings" : "/auth/signin"} title={user ? user.name || "Account" : "Sign In"}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all overflow-hidden">
            {user ? (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-xs font-black">
                {(user.name || user.username || "U")[0].toUpperCase()}
              </div>
            ) : <Crown className="w-4 h-4" />}
          </Link>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-5 h-14 border-b border-white/5 shrink-0">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="/pixza-logo.png" alt="" className="w-7 h-7 object-cover" />
            </div>
            <span className="font-black tracking-tighter">Pixza</span>
          </Link>
          <div className="flex gap-1">
            {([
              { id: "create",    icon: Sparkles    },
              { id: "catalogue", icon: ShoppingBag },
              { id: "explore",   icon: Compass     },
              { id: "tools",     icon: Wand2       },
              { id: "settings",  icon: Settings    },
            ] as { id: NavScreen; icon: any }[]).map(item => (
              <button key={item.id} onClick={() => setScreen(item.id)}
                className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                  screen === item.id ? "bg-white text-black" : "text-white/30 hover:text-white")}>
                <item.icon className="w-4 h-4" />
              </button>
            ))}
            <Link href="/studio"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-white/30 hover:text-white border border-dashed border-white/10 hover:border-white/20">
              <GitBranch className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={screen} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden">
            {screen === "create"    && <CreateScreen />}
            {screen === "catalogue" && <CatalogueScreen />}
            {screen === "explore"   && <ExploreScreen onUse={(t) => { setScreen("create"); }} />}
            {screen === "tools"     && <ToolsScreen />}
            {screen === "settings"  && <SettingsScreen />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.025]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
    </div>
  );
}
