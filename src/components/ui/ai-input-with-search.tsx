"use client";

import { Globe, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";

interface AIInputWithSearchProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onSubmit?: (value: string, withSearch: boolean) => void;
  onFileSelect?: (file: File) => void;
  className?: string;
}

export function AIInputWithSearch({
  id = "ai-input-with-search",
  placeholder = "Describe what you want to create…",
  minHeight = 48,
  maxHeight = 164,
  onSubmit,
  onFileSelect,
  className,
}: AIInputWithSearchProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight, maxHeight });
  const [showSearch, setShowSearch] = useState(false);

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
        <div className="relative flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight}px` }}>
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
                  "rounded-full transition-all flex items-center gap-2 px-2 py-1 border h-8 text-sm",
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
