"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, RefreshCw, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  apiEndpoint: string;
  buildBody: (imageBase64: string, options: Record<string, string>) => Record<string, unknown>;
  resultKey?: string; // key in response that holds the result image
  extraControls?: React.ReactNode;
  options?: Record<string, string>;
  acceptVideo?: boolean;
  showPrompt?: boolean;
  promptPlaceholder?: string;
  dualResult?: boolean; // show cutout + background side by side
}

export function ToolLayout({
  title,
  description,
  badge,
  badgeColor = "text-violet-400 bg-violet-500/10 border-violet-500/20",
  apiEndpoint,
  buildBody,
  resultKey = "result",
  extraControls,
  options = {},
  showPrompt = false,
  promptPlaceholder = "Describe the background or style…",
  dualResult = false,
}: ToolLayoutProps) {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [resultB, setResultB] = useState<string | null>(null); // for dual results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10MB"); return; }
    setImageName(file.name);
    setResult(null); setResultB(null); setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const run = async () => {
    if (!image) return;
    setLoading(true); setError(null); setResult(null); setResultB(null);
    try {
      const body = buildBody(image, { ...options, prompt });
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Processing failed");
      if (dualResult) {
        setResult(data.cutout ?? null);
        setResultB(data.background ?? null);
      } else {
        setResult(data[resultKey] ?? null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const download = (src: string, suffix = "") => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `pixza-${title.toLowerCase().replace(/\s+/g, "-")}${suffix}.png`;
    a.click();
  };

  const reset = () => {
    setImage(null); setResult(null); setResultB(null); setError(null); setPrompt("");
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans antialiased">
      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0d1117]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <Link href="/tools" className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black tracking-tight">{title}</h1>
            {badge && (
              <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", badgeColor)}>
                {badge}
              </span>
            )}
          </div>
        </div>
        <Link href="/create" className="text-xs font-black px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 transition-all">
          Full Studio →
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-3">{title}</h2>
          <p className="text-base text-white/40 max-w-lg mx-auto">{description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Upload */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Upload Image</p>

            {!image ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all min-h-[320px]",
                  dragging ? "border-violet-500/60 bg-violet-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                )}
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white/30" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white/60">Drop image here or click to upload</p>
                  <p className="text-xs text-white/20 mt-1">PNG, JPG, WEBP · Max 10MB</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-[#161b22] border border-white/8">
                <img src={image} alt="Input" className="w-full h-auto max-h-[400px] object-contain" />
                <button onClick={reset}
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/70 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                  <p className="text-[10px] text-white/50 truncate max-w-[200px]">{imageName}</p>
                </div>
              </div>
            )}

            {/* Prompt input */}
            {showPrompt && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">
                  Describe the result
                </label>
                <input
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder={promptPlaceholder}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
            )}

            {extraControls}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={run}
              disabled={!image || loading}
              className="w-full py-3.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              ) : (
                <>Run {title}</>
              )}
            </button>
          </div>

          {/* Right — Result */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Result</p>

            {!result && !loading ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] min-h-[320px]">
                <ImageIcon className="w-10 h-10 text-white/10" />
                <p className="text-sm text-white/20">Result will appear here</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] min-h-[320px]">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
                <p className="text-sm text-white/40">Processing your image…</p>
              </div>
            ) : dualResult ? (
              <div className="flex flex-col gap-3">
                {result && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-[#161b22]">
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23888'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23888'/%3E%3C/svg%3E\")" }} />
                    <img src={result} alt="Cutout" className="w-full h-auto max-h-[200px] object-contain relative z-10" />
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-lg">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Cutout</p>
                    </div>
                    <button onClick={() => download(result, "-cutout")}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/70 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {resultB && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-[#161b22]">
                    <img src={resultB} alt="Background" className="w-full h-auto max-h-[200px] object-contain" />
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-lg">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Background</p>
                    </div>
                    <button onClick={() => download(resultB, "-background")}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/70 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-[#161b22]">
                {/* Checkerboard for transparency */}
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23888'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23888'/%3E%3C/svg%3E\")" }} />
                <img src={result!} alt="Result" className="w-full h-auto max-h-[400px] object-contain relative z-10" />
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button onClick={() => { setResult(null); run(); }}
                    className="w-8 h-8 rounded-lg bg-black/70 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => download(result!)}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black hover:bg-white/90 transition-all">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {(result || resultB) && (
              <button
                onClick={() => download(result || resultB!)}
                className="w-full py-3 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Result
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
