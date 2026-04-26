"use client";

import { Globe, Paperclip, Send, ChevronDown, Check, Crown, X, ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";

export interface ChatModel {
  modelId: string;
  label: string;
  tier: "free" | "pro" | "agency";
  badge?: string;
  creditCost: number;
}

interface AIInputWithSearchProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onSubmit?: (value: string, withSearch: boolean) => void;
  onFileSelect?: (file: File) => void;
  className?: string;
  // Model selection
  models?: ChatModel[];
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  userPlan?: string;
  // Generation options (image tab)
  showOptions?: boolean;
  aspectRatio?: string;
  onAspectRatioChange?: (r: string) => void;
  numImages?: number;
  onNumImagesChange?: (n: number) => void;
  refImage?: string | null;
  onRefImageRemove?: () => void;
  credits?: number | null;
}

const TIER_COLOR = {
  free:   "text-green-400 bg-green-500/10 border-green-500/20",
  pro:    "text-violet-400 bg-violet-500/10 border-violet-500/20",
  agency: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const DOT_COLOR = {
  free:   "bg-green-400",
  pro:    "bg-violet-400",
  agency: "bg-amber-400",
};

const ASPECT_RATIOS = ["1:1", "4:3", "3:4", "16:9", "9:16"];

// Visual aspect ratio icon — tiny rectangle that matches the ratio
function RatioIcon({ ratio }: { ratio: string }) {
  const map: Record<string, string> = {
    "1:1":  "w-3 h-3",
    "4:3":  "w-4 h-3",
    "3:4":  "w-3 h-4",
    "16:9": "w-4 h-2.5",
    "9:16": "w-2.5 h-4",
  };
  return (
    <span className={cn("rounded-[2px] border border-current inline-block shrink-0", map[ratio] ?? "w-3 h-3")} />
  );
}

export function AIInputWithSearch({
  id = "ai-input-with-search",
  placeholder = "Describe what you want to create…",
  minHeight = 48,
  maxHeight = 164,
  onSubmit,
  onFileSelect,
  className,
  models,
  selectedModelId,
  onModelChange,
  userPlan = "free",
  showOptions = false,
  aspectRatio = "1:1",
  onAspectRatioChange,
  numImages = 1,
  onNumImagesChange,
  refImage,
  onRefImageRemove,
  credits,
}: AIInputWithSearchProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight, maxHeight });
  const [showSearch, setShowSearch] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [ratioOpen, setRatioOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);
  const ratioRef = useRef<HTMLDivElement>(null);

  const selectedModel = models?.find(m => m.modelId === selectedModelId) ?? models?.[0];

  const canUse = (m: ChatModel) => {
    if (m.tier === "free") return true;
    if (m.tier === "pro") return userPlan === "pro" || userPlan === "agency";
    if (m.tier === "agency") return userPlan === "agency";
    return false;
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setModelOpen(false);
      if (ratioRef.current && !ratioRef.current.contains(e.target as Node)) setRatioOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit?.(value, showSearch);
      setValue("");
      adjustHeight(true);
    }
  };

  const creditCost = (selectedModel?.creditCost ?? 1) * numImages;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative max-w-2xl w-full mx-auto">
        <div className="relative flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-visible">

          {/* Uploaded image preview strip — shown above textarea */}
          {refImage && (
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
              <div className="relative group/img">
                <img src={refImage} alt="Reference" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                <button
                  type="button"
                  onClick={onRefImageRemove}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/img:opacity-100"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
              <span className="text-[10px] text-white/20 font-medium">Reference image</span>
            </div>
          )}

          {/* Textarea */}
          <div className="overflow-y-auto rounded-t-2xl" style={{ maxHeight: `${maxHeight}px` }}>
            <textarea
              id={id}
              ref={textareaRef}
              value={value}
              placeholder={placeholder}
              className="w-full px-5 py-4 bg-transparent border-none text-white placeholder:text-white/30 resize-none focus:outline-none leading-relaxed text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
              }}
              onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-white/5 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">

              {/* File attach */}
              <label className="cursor-pointer rounded-lg p-1.5 hover:bg-white/5 transition-colors" title="Attach image">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect?.(f); }}
                />
                <Paperclip className="w-4 h-4 text-white/30 hover:text-white transition-colors" />
              </label>

              {/* Search toggle */}
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={cn(
                  "rounded-full transition-all flex items-center gap-1.5 px-2 py-1 border h-7",
                  showSearch
                    ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-400"
                    : "bg-white/5 border-transparent text-white/30 hover:text-white"
                )}
              >
                <motion.div
                  animate={{ rotate: showSearch ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                >
                  <Globe className={cn("w-3.5 h-3.5", showSearch ? "text-cyan-400" : "text-inherit")} />
                </motion.div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap text-cyan-400 text-[10px] font-bold"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* ── Aspect ratio picker ── */}
              {showOptions && onAspectRatioChange && (
                <div ref={ratioRef} className="relative">
                  <button
                    type="button"
                    onClick={() => { setRatioOpen(!ratioOpen); setModelOpen(false); }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all h-7"
                    title="Aspect ratio"
                  >
                    <RatioIcon ratio={aspectRatio} />
                    <span className="text-[10px] font-bold text-white/60">{aspectRatio}</span>
                    <ChevronDown className={cn("w-2.5 h-2.5 text-white/30 transition-transform shrink-0", ratioOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {ratioOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute bottom-full left-0 mb-2 z-[300] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-1.5 flex flex-col gap-0.5 min-w-[100px]">
                          {ASPECT_RATIOS.map(r => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => { onAspectRatioChange(r); setRatioOpen(false); }}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-left",
                                aspectRatio === r
                                  ? "bg-white text-black font-bold"
                                  : "text-white/50 hover:bg-white/5 hover:text-white"
                              )}
                            >
                              <RatioIcon ratio={r} />
                              <span className="font-bold">{r}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Image count picker ── */}
              {showOptions && onNumImagesChange && (
                <div className="flex items-center gap-0.5 bg-white/5 rounded-full border border-white/10 px-1 h-7">
                  {[1, 2, 4].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onNumImagesChange(n)}
                      className={cn(
                        "w-6 h-5 rounded-full text-[10px] font-black transition-all",
                        numImages === n ? "bg-white text-black" : "text-white/30 hover:text-white"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {/* Model selector */}
              {models && models.length > 0 && (
                <div ref={modelRef} className="relative">
                  <button
                    type="button"
                    onClick={() => { setModelOpen(!modelOpen); setRatioOpen(false); }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all h-7"
                  >
                    {selectedModel && (
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", DOT_COLOR[selectedModel.tier])} />
                    )}
                    <span className="text-[10px] font-bold text-white/60 max-w-[110px] truncate">
                      {selectedModel?.label ?? "Model"}
                    </span>
                    <ChevronDown className={cn("w-2.5 h-2.5 text-white/30 transition-transform shrink-0", modelOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {modelOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute bottom-full left-0 mb-2 z-[300] bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] max-h-64 overflow-y-auto"
                      >
                        {models.map(m => {
                          const locked = !canUse(m);
                          const active = m.modelId === selectedModelId;
                          return (
                            <button
                              key={m.modelId}
                              type="button"
                              onClick={() => {
                                if (!locked) { onModelChange?.(m.modelId); setModelOpen(false); }
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-4 py-2.5 text-xs transition-all",
                                locked ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5",
                                active ? "text-white font-bold" : "text-white/50"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {locked
                                  ? <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                                  : <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", DOT_COLOR[m.tier])} />
                                }
                                <span>{m.label}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded border", TIER_COLOR[m.tier])}>
                                  {m.tier === "free" ? "Free" : m.tier === "pro" ? "Pro" : "Agency"}
                                </span>
                                <span className="text-[8px] text-white/20">{m.creditCost}cr</span>
                                {active && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Right side: credit cost + send */}
            <div className="flex items-center gap-2 shrink-0">
              {showOptions && selectedModel && (
                <span className="text-[10px] text-white/20 font-bold tabular-nums">
                  {creditCost}cr
                  {credits != null && <span className="text-white/10"> / {credits}</span>}
                </span>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "rounded-xl p-1.5 transition-all",
                  value.trim()
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
