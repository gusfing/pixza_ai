"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, X, Loader2, Check, Scissors, Wand2, ZoomIn, Eraser, ImageIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type BatchOp = "background-remover" | "upscaler" | "object-remover";

interface BatchFile {
  id: string;
  file: File;
  preview: string;
  base64: string;
  status: "pending" | "processing" | "done" | "error";
  result?: string;
  error?: string;
}

const OPS: { id: BatchOp; label: string; desc: string; icon: any; endpoint: string }[] = [
  {
    id: "background-remover",
    label: "Remove Background",
    desc: "Remove backgrounds from all images",
    icon: Scissors,
    endpoint: "/api/tools/background-remover",
  },
  {
    id: "upscaler",
    label: "Upscale & Enhance",
    desc: "Sharpen and enhance all images",
    icon: ZoomIn,
    endpoint: "/api/tools/upscaler",
  },
  {
    id: "object-remover",
    label: "Object Remover",
    desc: "Clean up distractions from all images",
    icon: Eraser,
    endpoint: "/api/tools/object-remover",
  },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BatchPage() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [op, setOp] = useState<BatchOp>("background-remover");
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [opOpen, setOpOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selOp = OPS.find(o => o.id === op)!;
  const done = files.filter(f => f.status === "done").length;
  const errors = files.filter(f => f.status === "error").length;
  const total = files.length;

  const addFiles = useCallback(async (newFiles: File[]) => {
    const imageFiles = newFiles.filter(f => f.type.startsWith("image/")).slice(0, 50);
    const items: BatchFile[] = await Promise.all(
      imageFiles.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: base64,
          base64,
          status: "pending" as const,
        };
      })
    );
    setFiles(prev => [...prev, ...items].slice(0, 50));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const removeFile = (id: string) => setFiles(f => f.filter(x => x.id !== id));

  const runBatch = async () => {
    if (!files.length || running) return;
    setRunning(true);

    // Reset all to pending
    setFiles(f => f.map(x => ({ ...x, status: "pending", result: undefined, error: undefined })));

    const endpoint = selOp.endpoint;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setFiles(f => f.map(x => x.id === file.id ? { ...x, status: "processing" } : x));

      try {
        const body: Record<string, unknown> = { imageBase64: file.base64 };
        if (prompt) body.prompt = prompt;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (!res.ok || data.error) throw new Error(data.error || "Failed");

        const result = data.result ?? data.cutout ?? null;
        setFiles(f => f.map(x => x.id === file.id ? { ...x, status: "done", result } : x));
      } catch (err) {
        setFiles(f => f.map(x => x.id === file.id ? {
          ...x, status: "error",
          error: err instanceof Error ? err.message : "Failed"
        } : x));
      }
    }

    setRunning(false);
  };

  const downloadAll = () => {
    files.filter(f => f.status === "done" && f.result).forEach((f, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = f.result!;
        a.download = `pixza-batch-${i + 1}.png`;
        a.click();
      }, i * 200);
    });
  };

  const OpIcon = selOp.icon;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans antialiased">
      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0d1117]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <Link href="/tools" className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <h1 className="text-sm font-black tracking-tight">Batch Editor</h1>
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border text-green-400 bg-green-500/10 border-green-500/20">
            Free
          </span>
        </div>
        <div className="flex items-center gap-3">
          {done > 0 && (
            <button onClick={downloadAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-black hover:bg-white/90 transition-all">
              <Download className="w-3.5 h-3.5" /> Download All ({done})
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-2">Batch Processing</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-3">
            Edit hundreds of images<br />in one click.
          </h2>
          <p className="text-base text-white/40 max-w-lg">
            Upload up to 50 images and apply the same AI operation to all of them at once.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Controls */}
          <div className="flex flex-col gap-5">
            {/* Operation picker */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">
                Operation
              </label>
              <div className="relative">
                <button
                  onClick={() => setOpOpen(!opOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-all text-sm font-bold text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <OpIcon className="w-4 h-4 text-white/50" />
                    {selOp.label}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-white/30 transition-transform", opOpen && "rotate-180")} />
                </button>
                {opOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#161b22] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    {OPS.map(o => {
                      const OIcon = o.icon;
                      return (
                        <button key={o.id} onClick={() => { setOp(o.id); setOpOpen(false); }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all hover:bg-white/5",
                            op === o.id ? "text-white font-bold" : "text-white/50"
                          )}>
                          <OIcon className="w-4 h-4 shrink-0" />
                          <div className="text-left">
                            <div className="font-bold">{o.label}</div>
                            <div className="text-[11px] text-white/30">{o.desc}</div>
                          </div>
                          {op === o.id && <Check className="w-3.5 h-3.5 ml-auto text-white" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Prompt (for object remover) */}
            {op === "object-remover" && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">
                  Fill prompt (optional)
                </label>
                <input
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. 'clean white background'…"
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
            )}

            {/* Progress */}
            {total > 0 && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Progress</p>
                  <p className="text-xs font-black text-white">{done}/{total}</p>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-500"
                    style={{ width: total > 0 ? `${(done / total) * 100}%` : "0%" }}
                  />
                </div>
                {errors > 0 && (
                  <p className="text-[10px] text-red-400 mt-2">{errors} failed</p>
                )}
              </div>
            )}

            {/* Run button */}
            <button
              onClick={runBatch}
              disabled={!files.length || running}
              className="w-full py-3.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {running ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing {files.filter(f => f.status === "processing").length > 0 ? `image ${files.findIndex(f => f.status === "processing") + 1}/${total}` : "…"}</>
              ) : (
                <><OpIcon className="w-4 h-4" /> Run on {total || "0"} images</>
              )}
            </button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Uploaded", value: total, color: "text-white" },
                { label: "Done", value: done, color: "text-green-400" },
                { label: "Errors", value: errors, color: errors > 0 ? "text-red-400" : "text-white/20" },
              ].map(s => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className={cn("text-xl font-black", s.color)}>{s.value}</div>
                  <div className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — File grid */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-8",
                dragging ? "border-violet-500/60 bg-violet-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
              )}
            >
              <Upload className="w-6 h-6 text-white/30" />
              <div className="text-center">
                <p className="text-sm font-bold text-white/60">Drop images here or click to upload</p>
                <p className="text-xs text-white/20 mt-0.5">Up to 50 images · PNG, JPG, WEBP</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => addFiles(Array.from(e.target.files ?? []))} />
            </div>

            {/* Image grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {files.map(f => (
                  <div key={f.id} className="relative group rounded-xl overflow-hidden bg-[#161b22] border border-white/5 aspect-square">
                    {/* Show result if done, else show original */}
                    <img
                      src={f.status === "done" && f.result ? f.result : f.preview}
                      alt={f.file.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Status overlay */}
                    {f.status === "processing" && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                    {f.status === "done" && (
                      <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {f.status === "error" && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <p className="text-[9px] text-red-400 font-bold text-center px-1">{f.error}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {f.status === "done" && f.result && (
                        <button
                          onClick={() => { const a = document.createElement("a"); a.href = f.result!; a.download = `pixza-${f.file.name}`; a.click(); }}
                          className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-black hover:bg-white/90 transition-all"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      )}
                      {!running && (
                        <button onClick={() => removeFile(f.id)}
                          className="w-6 h-6 rounded-md bg-black/70 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {files.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <ImageIcon className="w-10 h-10 text-white/10" />
                <p className="text-sm text-white/20">No images uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
