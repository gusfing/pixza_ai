"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, RefreshCw, Loader2, ImageIcon, Eraser, Undo2, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MagicEraserPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [fillPrompt, setFillPrompt] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [hasMask, setHasMask] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const historyRef = useRef<ImageData[]>([]);

  // Draw image onto canvas
  const drawImage = useCallback((src: string) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Fit to max 600px wide
      const maxW = 600;
      const scale = img.width > maxW ? maxW / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      canvas.width = w;
      canvas.height = h;
      maskCanvas.width = w;
      maskCanvas.height = h;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      // Clear mask
      const mCtx = maskCanvas.getContext("2d")!;
      mCtx.clearRect(0, 0, w, h);
      historyRef.current = [];
      setHasMask(false);
    };
    img.src = src;
  }, []);

  useEffect(() => {
    if (image) drawImage(image);
  }, [image, drawImage]);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10MB"); return; }
    setImageName(file.name);
    setResult(null); setError(null); setShowResult(false);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const saveHistory = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const mCtx = maskCanvas.getContext("2d")!;
    historyRef.current.push(mCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
    if (historyRef.current.length > 20) historyRef.current.shift();
  };

  const startPaint = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || !image) return;
    saveHistory();
    setIsPainting(true);
    const pos = getPos(e, maskCanvas);
    paint(pos.x, pos.y);
  };

  const paint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    // Draw red overlay on display canvas
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw white on mask canvas (white = erase area)
    const mCtx = maskCanvas.getContext("2d")!;
    mCtx.save();
    mCtx.globalCompositeOperation = "source-over";
    mCtx.fillStyle = "white";
    mCtx.beginPath();
    mCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    mCtx.fill();
    mCtx.restore();

    setHasMask(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPainting) return;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const pos = getPos(e, maskCanvas);
    paint(pos.x, pos.y);
  };

  const stopPaint = () => setIsPainting(false);

  const undo = () => {
    const maskCanvas = maskCanvasRef.current;
    const canvas = canvasRef.current;
    if (!maskCanvas || !canvas || historyRef.current.length === 0) return;

    const prev = historyRef.current.pop()!;
    const mCtx = maskCanvas.getContext("2d")!;
    mCtx.putImageData(prev, 0, 0);

    // Redraw display canvas
    const ctx = canvas.getContext("2d")!;
    if (imgRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    }
    // Re-apply current mask as red overlay
    const maskData = mCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < maskData.data.length; i += 4) {
      if (maskData.data[i] > 128) {
        const x = (i / 4) % maskCanvas.width;
        const y = Math.floor((i / 4) / maskCanvas.width);
        ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.restore();

    if (historyRef.current.length === 0) setHasMask(false);
  };

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    const canvas = canvasRef.current;
    if (!maskCanvas || !canvas || !imgRef.current) return;
    saveHistory();
    const mCtx = maskCanvas.getContext("2d")!;
    mCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    setHasMask(false);
  };

  const getMaskBase64 = (): string => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return "";
    // Create black background with white mask
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = maskCanvas.width;
    tempCanvas.height = maskCanvas.height;
    const tCtx = tempCanvas.getContext("2d")!;
    tCtx.fillStyle = "black";
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tCtx.drawImage(maskCanvas, 0, 0);
    return tempCanvas.toDataURL("image/png");
  };

  const getImageBase64 = (): string => {
    if (!imgRef.current || !canvasRef.current) return "";
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const ctx = tempCanvas.getContext("2d")!;
    ctx.drawImage(imgRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
    return tempCanvas.toDataURL("image/png");
  };

  const erase = async () => {
    if (!image || !hasMask) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/tools/magic-eraser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: getImageBase64(),
          maskBase64: getMaskBase64(),
          fillPrompt: fillPrompt || "seamless background fill, natural texture, clean",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Erasing failed");
      setResult(data.result);
      setShowResult(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `pixza-magic-eraser.png`;
    a.click();
  };

  const reset = () => {
    setImage(null); setResult(null); setError(null);
    setHasMask(false); setShowResult(false);
    historyRef.current = [];
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
            <h1 className="text-sm font-black tracking-tight">Magic Eraser</h1>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border text-green-400 bg-green-500/10 border-green-500/20">
              Free
            </span>
          </div>
        </div>
        <Link href="/create" className="text-xs font-black px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 transition-all">
          Full Studio →
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-3">Magic Eraser</h1>
          <p className="text-base text-white/40 max-w-lg mx-auto">
            Paint over anything you want removed. AI fills it in seamlessly — free, powered by Cloudflare.
          </p>
        </div>

        {!image ? (
          /* Upload zone */
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all min-h-[400px]",
              dragging ? "border-violet-500/60 bg-violet-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
            )}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-white/30" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white/60">Drop image here or click to upload</p>
              <p className="text-xs text-white/20 mt-1">PNG, JPG, WEBP · Max 10MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left — Canvas */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  {showResult ? "Result" : "Paint to erase"}
                </p>
                <div className="flex items-center gap-2">
                  {!showResult && (
                    <>
                      <button onClick={undo} disabled={historyRef.current.length === 0}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all disabled:opacity-30">
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={clearMask} disabled={!hasMask}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all disabled:opacity-30">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {showResult && (
                    <button onClick={() => setShowResult(false)}
                      className="text-[10px] font-bold text-white/40 hover:text-white transition-colors">
                      ← Edit again
                    </button>
                  )}
                  <button onClick={reset}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Canvas area */}
              <div className="relative rounded-2xl overflow-hidden bg-[#161b22] border border-white/8 cursor-crosshair select-none">
                {showResult && result ? (
                  <img src={result} alt="Result" className="w-full h-auto block" />
                ) : (
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto block"
                    onMouseDown={startPaint}
                    onMouseMove={onMouseMove}
                    onMouseUp={stopPaint}
                    onMouseLeave={stopPaint}
                    onTouchStart={startPaint}
                    onTouchMove={e => { e.preventDefault(); const mc = maskCanvasRef.current; if (!mc || !isPainting) return; const pos = getPos(e, mc); paint(pos.x, pos.y); }}
                    onTouchEnd={stopPaint}
                    style={{ touchAction: "none" }}
                  />
                )}
                {/* Hidden mask canvas */}
                <canvas ref={maskCanvasRef} className="hidden" />

                {/* Brush cursor hint */}
                {!showResult && image && (
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg pointer-events-none">
                    <p className="text-[10px] text-white/50">
                      {hasMask ? "Red = will be erased" : "Paint over what to remove"}
                    </p>
                  </div>
                )}
              </div>

              {/* Brush size */}
              {!showResult && (
                <div className="flex items-center gap-3">
                  <Eraser className="w-4 h-4 text-white/30 shrink-0" />
                  <input
                    type="range"
                    min={5}
                    max={80}
                    value={brushSize}
                    onChange={e => setBrushSize(Number(e.target.value))}
                    className="flex-1 accent-violet-500"
                  />
                  <span className="text-xs text-white/40 w-8 text-right">{brushSize}px</span>
                </div>
              )}
            </div>

            {/* Right — Controls */}
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Settings</p>

              {/* Fill prompt */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">
                  Fill with (optional)
                </label>
                <input
                  value={fillPrompt}
                  onChange={e => setFillPrompt(e.target.value)}
                  placeholder="e.g. 'grass', 'ocean', 'white wall'…"
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                />
                <p className="text-[10px] text-white/20 mt-1.5">Leave blank for seamless auto-fill</p>
              </div>

              {/* How to use */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">How to use</p>
                {[
                  { n: "1", text: "Upload your image" },
                  { n: "2", text: "Paint red over what you want removed" },
                  { n: "3", text: "Optionally describe what to fill it with" },
                  { n: "4", text: "Click Erase — AI fills it seamlessly" },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {s.n}
                    </span>
                    <p className="text-xs text-white/50">{s.text}</p>
                  </div>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto">
                {!showResult ? (
                  <button
                    onClick={erase}
                    disabled={!hasMask || loading}
                    className="w-full py-3.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Erasing…</>
                    ) : (
                      <><Eraser className="w-4 h-4" /> Erase Selection</>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={download}
                      className="w-full py-3.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download Result
                    </button>
                    <button
                      onClick={() => { setShowResult(false); clearMask(); }}
                      className="w-full py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-bold hover:text-white hover:border-white/20 transition-all"
                    >
                      Erase More
                    </button>
                  </>
                )}
              </div>

              {/* Powered by */}
              <p className="text-[10px] text-white/20 text-center">
                Powered by Cloudflare Workers AI · Free · No sign-in required
              </p>
            </div>
          </div>
        )}

        {/* SEO content */}
        <section className="mt-16 pt-10 border-t border-white/5">
          <div className="prose prose-invert prose-sm max-w-none text-white/40 leading-relaxed">
            <h2 className="text-white/60 text-lg font-bold mb-3">Free AI Magic Eraser — Paint to Remove Anything</h2>
            <p>Pixza Studio&apos;s Magic Eraser lets you paint over any part of an image and have AI fill it in seamlessly. Remove people, objects, text, or blemishes with a simple brush stroke — no Photoshop skills required.</p>
            <h3 className="text-white/50 text-base font-bold mt-4 mb-2">How it works</h3>
            <p>Upload your image, paint red over the area you want removed, and click Erase. The AI uses inpainting to fill the selected region with realistic content that blends naturally with the surrounding image.</p>
            <h3 className="text-white/50 text-base font-bold mt-4 mb-2">Common use cases</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Remove unwanted people or objects from photos</li>
              <li>Clean up blemishes and imperfections in portraits</li>
              <li>Erase text, watermarks, and logos</li>
              <li>Fix distracting elements in product photography</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
