"use client";

import { useState, useRef } from "react";
import { Upload, Sparkles, Tag, Shuffle, Download, Loader2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type FreeTool = "image-to-prompt" | "classify" | "img2img";

const TOOLS = [
  {
    id: "image-to-prompt" as FreeTool,
    icon: Sparkles,
    label: "Image → Prompt",
    desc: "Upload any image and get an AI-generated prompt to recreate it",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    needsPrompt: false,
  },
  {
    id: "classify" as FreeTool,
    icon: Tag,
    label: "Image Classifier",
    desc: "Identify objects, scenes, and categories in any image",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    needsPrompt: false,
  },
  {
    id: "img2img" as FreeTool,
    icon: Shuffle,
    label: "Style Transfer",
    desc: "Transform an image with a text prompt — change style, mood, or look",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    needsPrompt: true,
  },
];

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target!.result as string);
    r.readAsDataURL(blob);
  });
}

export function CFreeTools({ className }: { className?: string }) {
  const [activeTool, setActiveTool] = useState<FreeTool>("image-to-prompt");
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const tool = TOOLS.find(t => t.id === activeTool)!;

  const handleFile = (file: File) => {
    const r = new FileReader();
    r.onload = e => { setInputImage(e.target?.result as string); setResult(null); setError(""); };
    r.readAsDataURL(file);
  };

  const run = async () => {
    if (!inputImage) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/cf-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: activeTool, imageBase64: inputImage, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tool selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTool(t.id); setResult(null); setError(""); }}
            className={cn(
              "p-4 rounded-2xl border text-left transition-all",
              activeTool === t.id ? cn(t.bg, "border-opacity-100") : "bg-white/5 border-white/5 hover:bg-white/10"
            )}
          >
            <t.icon className={cn("w-5 h-5 mb-2", activeTool === t.id ? t.color : "text-white/30")} />
            <p className={cn("text-sm font-bold mb-1", activeTool === t.id ? "text-white" : "text-white/60")}>{t.label}</p>
            <p className="text-[11px] text-white/30 leading-relaxed">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image upload */}
        <div
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
          onDragOver={e => e.preventDefault()}
          onClick={() => !inputImage && fileRef.current?.click()}
          className={cn(
            "relative aspect-square rounded-2xl border border-white/5 overflow-hidden transition-all",
            !inputImage && "bg-white/5 hover:bg-white/10 cursor-pointer hover:border-white/10"
          )}
        >
          {inputImage ? (
            <>
              <img src={inputImage} alt="Input" className="w-full h-full object-contain" />
              <button
                onClick={e => { e.stopPropagation(); setInputImage(null); setResult(null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
              >
                ×
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <Upload className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-sm text-white/30 font-medium">Drop image here or click</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {/* Result */}
        <div className="aspect-square rounded-2xl border border-white/5 bg-white/5 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className={cn("w-8 h-8 animate-spin", tool.color)} />
              <p className="text-xs text-white/40 font-medium">Processing…</p>
            </div>
          ) : result ? (
            <div className="flex-1 overflow-auto p-4">
              {typeof result === "string" ? (
                // Image result (img2img)
                result.startsWith("data:") ? (
                  <div className="relative h-full">
                    <img src={result} alt="Result" className="w-full h-full object-contain" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <a href={result} download="pixza-result.png"
                        className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  // Text result (image-to-prompt)
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Generated Prompt</p>
                      <button onClick={() => copyText(result as string)}
                        className="flex items-center gap-1 text-[10px] font-bold text-white/30 hover:text-white transition-colors">
                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed flex-1 overflow-auto">{result as string}</p>
                  </div>
                )
              ) : (
                // Array result (classify)
                <div className="h-full flex flex-col">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Classifications</p>
                  <div className="space-y-2 flex-1 overflow-auto">
                    {(result as any[]).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-white/70 capitalize">{item.label?.replace(/_/g, " ")}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-violet-400" style={{ width: `${Math.round((item.score || 0) * 100)}%` }} />
                          </div>
                          <span className="text-[10px] text-white/30 w-8 text-right">{Math.round((item.score || 0) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-white/20 font-medium">Result appears here</p>
            </div>
          )}
        </div>
      </div>

      {/* Prompt input for img2img */}
      {tool.needsPrompt && (
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe the style you want (e.g. 'oil painting, impressionist style')"
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all"
        />
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

      {/* Run button */}
      {inputImage && (
        <button
          onClick={run}
          disabled={loading || (tool.needsPrompt && !prompt.trim())}
          className={cn(
            "w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            !loading && (inputImage && (!tool.needsPrompt || prompt.trim()))
              ? cn(tool.bg, tool.color, "hover:opacity-90")
              : "bg-white/5 text-white/20 cursor-not-allowed"
          )}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <tool.icon className="w-4 h-4" />}
          {loading ? "Processing…" : tool.label}
        </button>
      )}
    </div>
  );
}
