"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { WorkflowFile } from "@/store/workflowStore";
import { QuickstartBackButton } from "./QuickstartBackButton";

interface PromptWorkflowViewProps {
  onBack: () => void;
  onWorkflowGenerated: (workflow: WorkflowFile) => void;
}

export function PromptWorkflowView({ onBack, onWorkflowGenerated }: PromptWorkflowViewProps) {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!description || description.trim().length < 3) {
      setError("Please describe your workflow (at least 3 characters)");
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const response = await fetch("/api/quickstart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), contentLevel: "full" }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to generate workflow");
      if (result.workflow) onWorkflowGenerated(result.workflow);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate workflow");
    } finally {
      setIsGenerating(false);
    }
  }, [description, onWorkflowGenerated]);

  const canGenerate = description.trim().length >= 3 && !isGenerating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      className="flex flex-col h-full"
      style={{ background: "#111111" }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <QuickstartBackButton onClick={onBack} disabled={isGenerating} />
        <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.08)" }} />
        <h2 className="text-sm font-black text-white/80">Prompt a Workflow</h2>
        <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md bg-white/8 text-white/30 ml-1">Beta</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
            Describe your workflow
          </label>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setError(null); }}
            placeholder="e.g., Create product photography with consistent lighting and style from reference images..."
            disabled={isGenerating}
            rows={6}
            className="w-full px-4 py-3 rounded-2xl text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: isGenerating ? 0.5 : 1,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          <p className="text-xs text-white/25 leading-relaxed">
            Be specific about inputs, outputs, and transformations. Currently works with Gemini models.
          </p>
        </div>

        {/* Example prompts */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Examples</p>
          <div className="flex flex-col gap-1.5">
            {[
              "Generate product shots with white background and soft shadows",
              "Create style variations of an image using different color palettes",
              "Build a portrait enhancement pipeline with lighting correction",
            ].map(ex => (
              <button key={ex} onClick={() => setDescription(ex)}
                className="text-left px-3 py-2 rounded-xl text-xs text-white/35 hover:text-white/70 transition-colors"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                "{ex}"
              </button>
            ))}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-3 rounded-xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-xs text-red-400">{error}</p>
              <button onClick={() => setError(null)} className="text-[11px] text-red-400/50 hover:text-red-400 mt-1 transition-colors">Dismiss</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex justify-end"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
        <motion.button
          onClick={handleGenerate}
          disabled={!canGenerate}
          whileHover={canGenerate ? { scale: 1.02 } : {}}
          whileTap={canGenerate ? { scale: 0.98 } : {}}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all"
          style={{
            background: canGenerate ? "#ffffff" : "rgba(255,255,255,0.06)",
            color: canGenerate ? "#000000" : "rgba(255,255,255,0.2)",
            cursor: canGenerate ? "pointer" : "not-allowed",
          }}
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate Workflow
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
