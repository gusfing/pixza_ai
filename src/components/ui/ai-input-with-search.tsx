"use client";

import { Globe, Paperclip, Send, ChevronDown, Check, Crown } from "lucide-react";
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
}: AIInputWithSearchProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight, maxHeight });
  const [showSearch, setShowSearch] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);

  const selectedModel = models?.find(m => m.modelId === selectedModelId) ?? models?.[0];

  const canUse = (m: ChatModel) => {
    if (m.tier === "free") return true;
    if (m.tier === "pro") return userPlan === "pro" || userPlan === "agency";
    if (m.tier === "agency") return userPlan === "agency";
    return false;
  };

  // Close on outside click
  useEffect(() => {
    if (!modelOpen) return;
    const h = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setModelOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [modelOpen]);

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit?.(value, showSearch);
      setValue("");
      adjustHeight(true);
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-2xl w-full mx-auto">
        <div className="relative flex flex-col rounded-2xl overflow-visible border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
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

          <div className="h-12 flex items-center justify-between px-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              {/* File attach */}
              <label className="cursor-pointer rounded-lg p-2 hover:bg-white/5 transition-colors">
                <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect?.(f); }} />
                <Paperclip className="w-4 h-4 text-white/30 hover:text-white transition-colors" />
              </label>

              {/* Search toggle */}
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={cn(
                  "rounded-full transition-all flex items-center gap-1.5 px-2 py-1 border h-8",
                  showSearch
                    ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-400"
                    : "bg-white/5 border-transparent text-white/30 hover:text-white"
                )}
              >
                <motion.div
                  animate={{ rotate: showSearch ? 180 : 0, scale: showSearch ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  className="w-4 h-4 flex items-center justify-center"
                >
                  <Globe className={cn("w-4 h-4", showSearch ? "text-cyan-400" : "text-inherit")} />
                </motion.div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap text-cyan-400 text-xs font-bold"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Model selector — only shown if models are provided */}
              {models && models.length > 0 && (
                <div ref={modelRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setModelOpen(!modelOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all h-8"
                  >
                    {selectedModel && (
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", DOT_COLOR[selectedModel.tier])} />
                    )}
                    <span className="text-[11px] font-bold text-white/70 max-w-[100px] truncate">
                      {selectedModel?.label ?? "Model"}
                    </span>
                    <ChevronDown className={cn("w-3 h-3 text-white/30 transition-transform shrink-0", modelOpen && "rotate-180")} />
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

            {/* Send */}
            <button
              type="button"
              onClick={handleSubmit}
              className={cn(
                "rounded-xl p-2 transition-all",
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
  );
}
