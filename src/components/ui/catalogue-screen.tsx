"use client";

import { useState, useRef } from "react";
import {
  Sparkles, Upload, Download, Check, ImageIcon, Palette,
  Lightbulb, ScanSearch, AlertTriangle, MessageSquare,
  Copy, Layers, Eye, RotateCcw, X, Star
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

/* ── Shot definitions ───────────────────────────────────────── */
const CATALOGUE_SHOTS = [
  { id: "hero",      label: "Hero Shot",       aspect: "1:1",  prompt: "Professional hero product shot, centered on pure white background, dramatic studio lighting, sharp focus, commercial photography style, 8K" },
  { id: "lifestyle", label: "Lifestyle",        aspect: "4:3",  prompt: "Lifestyle product photography, natural environment, warm ambient light, shallow depth of field, aspirational mood, editorial style" },
  { id: "flat-lay",  label: "Flat Lay",         aspect: "1:1",  prompt: "Flat lay product photography, overhead shot, clean minimal background, styled composition, professional commercial photography" },
  { id: "angle",     label: "45° Angle",        aspect: "1:1",  prompt: "Product shot from 45-degree angle, clean background, professional studio lighting, showing product details and texture" },
  { id: "closeup",   label: "Detail Close-up",  aspect: "1:1",  prompt: "Extreme close-up macro product photography, showing material texture and fine details, studio lighting, sharp focus" },
  { id: "dark",      label: "Dark & Moody",     aspect: "1:1",  prompt: "Dark moody product photography, dramatic shadows, luxury feel, black background, cinematic lighting, high-end commercial" },
  { id: "outdoor",   label: "Outdoor Scene",    aspect: "16:9", prompt: "Product in natural outdoor setting, golden hour lighting, lifestyle photography, environmental context, editorial quality" },
  { id: "minimal",   label: "Minimal Clean",    aspect: "1:1",  prompt: "Minimalist product photography, pure white or light grey background, soft shadows, clean composition, Scandinavian aesthetic" },
];

/* ── Brand Kit presets ──────────────────────────────────────── */
const BRAND_PRESETS = [
  { id: "luxury",    label: "Luxury",     tone: "sophisticated and exclusive", lightingStyle: "dramatic chiaroscuro lighting", sceneStyle: "dark marble, gold accents, luxury setting", visualStyle: "high-end luxury product photography, dark moody" },
  { id: "minimal",   label: "Minimal",    tone: "clean and modern",            lightingStyle: "soft diffused studio lighting",  sceneStyle: "pure white, minimal props, clean lines",   visualStyle: "minimalist Scandinavian product photography" },
  { id: "lifestyle", label: "Lifestyle",  tone: "warm and aspirational",       lightingStyle: "golden hour natural lighting",   sceneStyle: "natural textures, plants, warm tones",     visualStyle: "lifestyle editorial product photography" },
  { id: "bold",      label: "Bold",       tone: "energetic and confident",     lightingStyle: "vibrant colorful lighting",      sceneStyle: "colorful bold backgrounds, graphic shapes", visualStyle: "bold colorful commercial product photography" },
  { id: "tech",      label: "Tech",       tone: "precise and innovative",      lightingStyle: "cool blue-white studio lighting", sceneStyle: "dark background, neon accents, tech aesthetic", visualStyle: "tech product photography, dark background, glowing" },
];

interface BrandKit {
  tone: string;
  lightingStyle: string;
  sceneStyle: string;
  visualStyle: string;
}

interface CatalogueResult {
  id: string;
  label: string;
  url: string;
  captions?: string[];
  captionsLoading?: boolean;
}

/* ── Product AI tool call ───────────────────────────────────── */
async function callProductAI(tool: string, imageBase64: string, extra?: Record<string, unknown>) {
  const res = await fetch("/api/product-ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool, imageBase64, ...extra }),
  });
  return res.json();
}

/* ── Main Component ─────────────────────────────────────────── */
export function CatalogueScreen() {
  const [tab, setTab] = useState<"catalogue" | "tools">("catalogue");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedShots, setSelectedShots] = useState<string[]>(["hero", "lifestyle", "flat-lay", "dark"]);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<CatalogueResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentShot, setCurrentShot] = useState("");
  const [error, setError] = useState("");
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [customTone, setCustomTone] = useState("");
  const [customStyle, setCustomStyle] = useState("");

  // AI Tools state
  const [toolImage, setToolImage] = useState<string | null>(null);
  const [toolResult, setToolResult] = useState<any>(null);
  const [toolLoading, setToolLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [toolPrompt, setToolPrompt] = useState("");
  const [copiedCaption, setCopiedCaption] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const toolFileRef = useRef<HTMLInputElement>(null);

  const toggleShot = (id: string) => {
    setSelectedShots(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const applyPreset = (preset: typeof BRAND_PRESETS[0]) => {
    setBrandKit({ tone: preset.tone, lightingStyle: preset.lightingStyle, sceneStyle: preset.sceneStyle, visualStyle: preset.visualStyle });
    setCustomTone(preset.tone);
    setCustomStyle(preset.visualStyle);
  };

  const generate = async () => {
    if (!productImage || selectedShots.length === 0) return;
    setGenerating(true); setError(""); setResults([]); setProgress(0);

    const shots = CATALOGUE_SHOTS.filter(s => selectedShots.includes(s.id));
    const generated: CatalogueResult[] = [];
    const kit = brandKit || (customStyle ? { tone: customTone, lightingStyle: "", sceneStyle: "", visualStyle: customStyle } : null);

    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      setCurrentShot(shot.label);
      try {
        // Build prompt with brand kit overlay
        const fullPrompt = kit?.visualStyle
          ? `${shot.prompt}, ${kit.visualStyle}`
          : shot.prompt;

        const body = {
          prompt: fullPrompt,
          selectedModel: { provider: "fal", modelId: "fal-ai/flux-pro", displayName: "FLUX Pro" },
          aspectRatio: shot.aspect,
          images: [productImage],
          dynamicInputs: { image_url: productImage },
        };
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success && data.image) {
          generated.push({ id: shot.id, label: shot.label, url: data.image });
        }
      } catch { /* skip failed shots */ }
      setProgress(Math.round(((i + 1) / shots.length) * 100));
      setResults([...generated]);
    }

    setGenerating(false);
    setCurrentShot("");
  };

  const generateCaptions = async (resultId: string, imageUrl: string) => {
    setResults(prev => prev.map(r => r.id === resultId ? { ...r, captionsLoading: true } : r));
    try {
      const data = await callProductAI("caption", imageUrl, { brandKit });
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, captions: data.result || [], captionsLoading: false } : r));
    } catch {
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, captionsLoading: false } : r));
    }
  };

  const runTool = async (tool: string) => {
    if (!toolImage) return;
    setToolLoading(true); setActiveTool(tool); setToolResult(null);
    try {
      const data = await callProductAI(tool, toolImage, { prompt: toolPrompt, brandKit, style: customStyle });
      setToolResult(data.result);
    } catch (e) {
      setToolResult({ error: e instanceof Error ? e.message : "Tool failed" });
    }
    setToolLoading(false);
  };

  const copyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaption(text);
    setTimeout(() => setCopiedCaption(null), 2000);
  };

  const handleImageFile = (file: File, setter: (v: string) => void) => {
    const r = new FileReader();
    r.onload = ev => setter(ev.target?.result as string);
    r.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-1">Product Catalogue</h2>
            <p className="text-white/30 text-sm">Upload your product — AI generates a full professional catalogue with captions.</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full">Pro</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
          {[
            { id: "catalogue", label: "Catalogue Generator", icon: Layers },
            { id: "tools",     label: "Product AI Tools",    icon: Sparkles },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                tab === t.id ? "bg-white text-black" : "text-white/30 hover:text-white")}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CATALOGUE TAB ─────────────────────────────────────── */}
      {tab === "catalogue" && (
        <div className="px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left panel */}
            <div className="space-y-5">
              {/* Upload */}
              <div
                onClick={() => !productImage && fileRef.current?.click()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleImageFile(f, setProductImage); }}
                onDragOver={e => e.preventDefault()}
                className={cn("aspect-square rounded-2xl border overflow-hidden transition-all",
                  productImage ? "border-white/10" : "border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer hover:border-white/10")}
              >
                {productImage ? (
                  <div className="relative h-full">
                    <img src={productImage} alt="Product" className="w-full h-full object-contain" />
                    <button onClick={e => { e.stopPropagation(); setProductImage(null); setResults([]); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white/20" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/40">Upload product image</p>
                      <p className="text-xs text-white/20 mt-1">PNG, JPG — transparent bg works best</p>
                    </div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f, setProductImage); }} />
              </div>

              {/* Brand Kit */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <button onClick={() => setShowBrandKit(!showBrandKit)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-black text-white/60 hover:text-white transition-colors">
                  <span className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Brand Kit
                    {brandKit && <span className="w-2 h-2 rounded-full bg-violet-400" />}
                  </span>
                  <span className="text-white/20 text-xs">{showBrandKit ? "▲" : "▼"}</span>
                </button>
                {showBrandKit && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-black pt-3">Quick Presets</p>
                    <div className="flex flex-wrap gap-2">
                      {BRAND_PRESETS.map(p => (
                        <button key={p.id} onClick={() => applyPreset(p)}
                          className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                            brandKit?.visualStyle === p.visualStyle
                              ? "bg-white text-black border-white"
                              : "border-white/10 text-white/40 hover:text-white hover:border-white/20")}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <input value={customTone} onChange={e => setCustomTone(e.target.value)}
                        placeholder="Brand tone (e.g. playful, premium...)"
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/20" />
                      <input value={customStyle} onChange={e => setCustomStyle(e.target.value)}
                        placeholder="Visual style (e.g. dark moody luxury...)"
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/20" />
                      {(customTone || customStyle) && (
                        <button onClick={() => setBrandKit({ tone: customTone, lightingStyle: "", sceneStyle: "", visualStyle: customStyle })}
                          className="w-full py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-black hover:bg-violet-500/30 transition-all">
                          Apply Custom Brand Kit
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Shot selection */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                  Select shots ({selectedShots.length}/{CATALOGUE_SHOTS.length})
                </p>
                <div className="space-y-1.5">
                  {CATALOGUE_SHOTS.map(shot => (
                    <button key={shot.id} onClick={() => toggleShot(shot.id)}
                      className={cn("w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all text-left",
                        selectedShots.includes(shot.id)
                          ? "bg-white/10 border-white/20 text-white font-bold"
                          : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/10")}>
                      <span className="flex items-center gap-2">
                        {shot.label}
                        <span className="text-[9px] text-white/20 font-normal">{shot.aspect}</span>
                      </span>
                      {selectedShots.includes(shot.id) && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate */}
              <button onClick={generate}
                disabled={!productImage || selectedShots.length === 0 || generating}
                className={cn("w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  productImage && selectedShots.length > 0 && !generating
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/5 text-white/20 cursor-not-allowed")}>
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    {currentShot || `Generating ${progress}%`}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate {selectedShots.length} Shot{selectedShots.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>

              {generating && (
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              )}
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            {/* Results grid */}
            <div className="lg:col-span-2">
              {results.length === 0 && !generating ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center border border-white/5 rounded-2xl bg-white/[0.02]">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-white/10" />
                  </div>
                  <p className="text-white/30 text-sm font-medium">Your catalogue will appear here</p>
                  <p className="text-white/15 text-xs mt-1">Upload a product and select shots to begin</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {results.map(r => (
                    <div key={r.id} className="group rounded-2xl overflow-hidden bg-black border border-white/5">
                      <div className="relative">
                        <img src={r.url} alt={r.label} className="w-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-xs font-bold text-white">{r.label}</p>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={r.url} download={`pixza-${r.id}.png`}
                            className="w-8 h-8 rounded-xl bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      {/* Caption section */}
                      <div className="p-3 border-t border-white/5">
                        {r.captions ? (
                          <div className="space-y-1.5">
                            {r.captions.map((cap, i) => (
                              <div key={i} className="flex items-start gap-2 group/cap">
                                <p className="text-[11px] text-white/50 flex-1 leading-relaxed">{cap}</p>
                                <button onClick={() => copyCaption(cap)}
                                  className="shrink-0 w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/cap:opacity-100">
                                  {copiedCaption === cap ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <button onClick={() => generateCaptions(r.id, r.url)}
                            disabled={r.captionsLoading}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/30 text-[11px] font-bold hover:text-white hover:border-white/10 transition-all">
                            {r.captionsLoading ? (
                              <><div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" /> Generating...</>
                            ) : (
                              <><MessageSquare className="w-3 h-3" /> Generate Captions</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {generating && Array.from({ length: selectedShots.length - results.length }).map((_, i) => (
                    <div key={`skel-${i}`} className="aspect-square rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                  ))}
                </div>
              )}

              {results.length > 1 && !generating && (
                <button
                  onClick={() => results.forEach(r => { const a = document.createElement("a"); a.href = r.url; a.download = `pixza-${r.id}.png`; a.click(); })}
                  className="mt-4 w-full py-3 rounded-2xl border border-white/10 text-white/40 text-sm font-bold hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download All {results.length} Images
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLS TAB ─────────────────────────────────────────── */}
      {tab === "tools" && (
        <div className="px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Image upload + tool picker */}
            <div className="space-y-5">
              {/* Upload */}
              <div
                onClick={() => !toolImage && toolFileRef.current?.click()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleImageFile(f, setToolImage); }}
                onDragOver={e => e.preventDefault()}
                className={cn("aspect-square rounded-2xl border overflow-hidden transition-all",
                  toolImage ? "border-white/10" : "border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer hover:border-white/10")}>
                {toolImage ? (
                  <div className="relative h-full">
                    <img src={toolImage} alt="Tool input" className="w-full h-full object-contain" />
                    <button onClick={e => { e.stopPropagation(); setToolImage(null); setToolResult(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white/20" />
                    </div>
                    <p className="text-sm font-bold text-white/40">Upload product image</p>
                  </div>
                )}
                <input ref={toolFileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f, setToolImage); }} />
              </div>

              {/* Optional prompt for style tools */}
              <input value={toolPrompt} onChange={e => setToolPrompt(e.target.value)}
                placeholder="Optional: describe desired style or scene..."
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20" />

              {/* Tool grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "describe",   label: "Describe Product",  icon: Eye,           desc: "AI product description for listings" },
                  { id: "caption",    label: "Generate Captions",  icon: MessageSquare, desc: "3 marketing captions" },
                  { id: "classify",   label: "Classify Product",   icon: ScanSearch,    desc: "Detect product category" },
                  { id: "defect",     label: "Quality Check",      icon: AlertTriangle, desc: "Detect defects & issues" },
                  { id: "lighting",   label: "Enhance Lighting",   icon: Lightbulb,     desc: "Improve studio lighting" },
                  { id: "shadow",     label: "Add Shadow",         icon: Layers,        desc: "Realistic drop shadow" },
                  { id: "style-match",label: "Style Match",        icon: Palette,       desc: "Apply brand visual style" },
                  { id: "scene-gen",  label: "Scene Background",   icon: ImageIcon,     desc: "Generate matching scene" },
                ].map(tool => (
                  <button key={tool.id} onClick={() => runTool(tool.id)}
                    disabled={!toolImage || toolLoading}
                    className={cn("flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all",
                      activeTool === tool.id && toolLoading
                        ? "bg-white/10 border-white/20 text-white"
                        : toolImage
                          ? "bg-white/5 border-white/5 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/10"
                          : "bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed")}>
                    <div className="flex items-center gap-2">
                      {activeTool === tool.id && toolLoading
                        ? <div className="w-3.5 h-3.5 border border-white/20 border-t-white rounded-full animate-spin" />
                        : <tool.icon className="w-3.5 h-3.5" />}
                      <span className="text-xs font-black">{tool.label}</span>
                    </div>
                    <span className="text-[10px] text-white/30">{tool.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Results */}
            <div>
              {!toolResult ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center border border-white/5 rounded-2xl bg-white/[0.02]">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white/10" />
                  </div>
                  <p className="text-white/30 text-sm font-medium">Tool results appear here</p>
                  <p className="text-white/15 text-xs mt-1">Upload an image and pick a tool</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-white/40">Result</p>
                    <button onClick={() => { setToolResult(null); setActiveTool(null); }}
                      className="text-white/20 hover:text-white transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Image result */}
                  {typeof toolResult === "string" && toolResult.startsWith("data:") && (
                    <div className="rounded-xl overflow-hidden">
                      <img src={toolResult} alt="Result" className="w-full" />
                      <a href={toolResult} download="pixza-tool-result.png"
                        className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-bold hover:text-white hover:border-white/20 transition-all">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  )}

                  {/* Text result */}
                  {typeof toolResult === "string" && !toolResult.startsWith("data:") && (
                    <div className="space-y-2">
                      <p className="text-sm text-white/70 leading-relaxed">{toolResult}</p>
                      <button onClick={() => copyCaption(toolResult)}
                        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors">
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                  )}

                  {/* Array of captions */}
                  {Array.isArray(toolResult) && toolResult.every((x: any) => typeof x === "string") && (
                    <div className="space-y-3">
                      {toolResult.map((cap: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] font-black text-white/20 mt-0.5">{i + 1}</span>
                          <p className="flex-1 text-sm text-white/70 leading-relaxed">{cap}</p>
                          <button onClick={() => copyCaption(cap)}
                            className="shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                            {copiedCaption === cap ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Classification labels */}
                  {Array.isArray(toolResult) && toolResult.every((x: any) => x?.label) && (
                    <div className="space-y-2">
                      {toolResult.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-white/70">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full bg-white/60 rounded-full" style={{ width: `${Math.round((item.score || 0) * 100)}%` }} />
                            </div>
                            <span className="text-xs text-white/30 w-10 text-right">{Math.round((item.score || 0) * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Defect report */}
                  {toolResult && typeof toolResult === "object" && !Array.isArray(toolResult) && toolResult.score !== undefined && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black",
                          toolResult.score >= 8 ? "bg-green-500/20 text-green-400" :
                          toolResult.score >= 5 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400")}>
                          {toolResult.score}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Quality Score</p>
                          <p className="text-xs text-white/30">out of 10</p>
                        </div>
                      </div>
                      {toolResult.recommendations?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Recommendations</p>
                          <ul className="space-y-1.5">
                            {toolResult.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                                <Star className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {toolResult.raw && (
                        <details className="text-xs text-white/20">
                          <summary className="cursor-pointer hover:text-white/40">Raw analysis</summary>
                          <p className="mt-2 leading-relaxed">{toolResult.raw}</p>
                        </details>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {toolResult?.error && (
                    <p className="text-sm text-red-400">{toolResult.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
