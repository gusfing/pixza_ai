"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Eraser, ArrowUpCircle, Palette, Upload, Download, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnnx } from "@/hooks/use-onnx";

type Tool = "remover" | "upscaler" | "colorizer";

const TOOLS: { id: Tool; label: string; icon: any; description: string; badge: string }[] = [
  { id: "remover",   label: "Remove BG",  icon: Eraser,         description: "Erase backgrounds instantly — runs in your browser, zero cost.", badge: "Free · Local" },
  { id: "upscaler",  label: "Upscale 4×", icon: ArrowUpCircle,  description: "Enhance resolution 4× with AI super-resolution.", badge: "Free · Local" },
  { id: "colorizer", label: "Colorize",   icon: Palette,        description: "Bring black & white photos to life with AI color.", badge: "Free · Local" },
];

const SESSION_KEY_INPUT  = "pixza_tools_input";
const SESSION_KEY_OUTPUT = "pixza_tools_output";
const SESSION_KEY_TOOL   = "pixza_tools_activetool";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target!.result as string);
    r.readAsDataURL(blob);
  });
}

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export function ImageTools({ className }: { className?: string }) {
  // Restore from sessionStorage on mount
  const [activeTool, setActiveTool] = useState<Tool>(() => {
    if (typeof window === "undefined") return "remover";
    return (sessionStorage.getItem(SESSION_KEY_TOOL) as Tool) || "remover";
  });
  const [inputImage, setInputImage] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(SESSION_KEY_INPUT) || null;
  });
  const [outputImage, setOutputImage] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(SESSION_KEY_OUTPUT) || null;
  });
  const [processingError, setProcessingError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { status, progress, statusText, removeBackground, upscaleImage, colorizeImage } = useOnnx();
  const isProcessing = status === "downloading" || status === "loading" || status === "running";

  // Persist to sessionStorage whenever state changes
  useEffect(() => {
    if (inputImage) sessionStorage.setItem(SESSION_KEY_INPUT, inputImage);
    else sessionStorage.removeItem(SESSION_KEY_INPUT);
  }, [inputImage]);

  useEffect(() => {
    if (outputImage) sessionStorage.setItem(SESSION_KEY_OUTPUT, outputImage);
    else sessionStorage.removeItem(SESSION_KEY_OUTPUT);
  }, [outputImage]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY_TOOL, activeTool);
  }, [activeTool]);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setInputImage(e.target!.result as string);
      setOutputImage(null);
      setProcessingError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const process = async () => {
    if (!inputImage) return;
    setOutputImage(null);
    setProcessingError(null);
    try {
      const imgEl = await loadImageEl(inputImage);
      let blob: Blob;
      if (activeTool === "remover")        blob = await removeBackground(imgEl);
      else if (activeTool === "upscaler")  blob = await upscaleImage(imgEl);
      else                                  blob = await colorizeImage(imgEl);
      setOutputImage(await blobToDataUrl(blob));
    } catch (e) {
      setProcessingError(e instanceof Error ? e.message : "Processing failed. Try again.");
    }
  };

  const reset = () => {
    setInputImage(null);
    setOutputImage(null);
    setProcessingError(null);
    sessionStorage.removeItem(SESSION_KEY_INPUT);
    sessionStorage.removeItem(SESSION_KEY_OUTPUT);
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Tool Selector */}
      <div className="flex gap-3 flex-wrap">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTool(t.id); setOutputImage(null); }}
            className={cn(
              "flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-bold transition-all",
              activeTool === t.id
                ? "bg-white text-black border-white"
                : "bg-white/5 text-white/50 border-white/5 hover:text-white hover:bg-white/10"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
              activeTool === t.id ? "bg-black/10 text-black/60" : "bg-white/5 text-white/20"
            )}>
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-white/30 text-xs font-medium">
        {TOOLS.find(t => t.id === activeTool)?.description}
      </p>

      {/* Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !inputImage && fileRef.current?.click()}
          className={cn(
            "relative aspect-square rounded-3xl border border-white/5 overflow-hidden transition-all",
            !inputImage && "bg-white/5 hover:bg-white/10 cursor-pointer hover:border-white/10"
          )}
        >
          {inputImage ? (
            <>
              <img src={inputImage} alt="Input" className="w-full h-full object-contain" />
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-widest text-white/30 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                Input
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                <Upload className="w-6 h-6 text-white/20" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/40">Drop image here</p>
                <p className="text-xs text-white/20 mt-1">or click to browse</p>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {/* Output */}
        <div className="relative aspect-square rounded-3xl border border-white/5 bg-white/5 overflow-hidden">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
              <div className="text-center">
                <p className="text-xs font-bold text-white/60">{statusText}</p>
                {progress > 0 && progress < 100 && (
                  <div className="mt-3 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white/60 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                )}
                {progress > 0 && (
                  <p className="text-[10px] text-white/30 mt-1">{Math.round(progress)}%</p>
                )}
              </div>
            </div>
          ) : processingError ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              <p className="text-xs text-red-400 font-medium">{processingError}</p>
              <button onClick={process} className="text-xs text-white/40 hover:text-white underline transition-colors">
                Try again
              </button>
            </div>
          ) : outputImage ? (
            <>
              <img src={outputImage} alt="Output" className="w-full h-full object-contain" style={{ background: activeTool === "remover" ? "repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 16px 16px" : undefined }} />
              <div className="absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-widest text-white/30 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                Output
              </div>
              <a
                href={outputImage}
                download={`pixza-${activeTool}.webp`}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
              >
                <Download className="w-4 h-4" />
              </a>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-white/20 font-medium">Result appears here</p>
            </div>
          )}
        </div>
      </div>

      {/* Process Button */}
      {inputImage && !isProcessing && (
        <button
          onClick={process}
          className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all"
        >
          {TOOLS.find(t => t.id === activeTool)?.label}
        </button>
      )}
    </div>
  );
}
