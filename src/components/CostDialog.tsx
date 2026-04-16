"use client";

import { useEffect } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import { PredictedCostResult, CostBreakdownItem, formatCost } from "@/utils/costCalculator";
import { ProviderType } from "@/types/providers";

interface CostDialogProps {
  predictedCost: PredictedCostResult;
  incurredCost: number;
  onClose: () => void;
}

/**
 * Provider icon component - colored dot with provider indicator
 */
function ProviderIcon({ provider }: { provider: ProviderType }) {
  const colors: Record<string, { bg: string; text: string }> = {
    standard: { bg: "bg-neutral-500/20", text: "text-neutral-300" },
    premium: { bg: "bg-blue-500/20", text: "text-blue-300" },
    assistant: { bg: "bg-green-500/20", text: "text-green-300" },
    experimental: { bg: "bg-amber-500/20", text: "text-amber-300" },
  };

  const labels: Record<string, string> = {
    standard: "S",
    premium: "P",
    assistant: "A",
    experimental: "E",
  };

  const tier =
    provider === "cloudflare" ? "standard" :
    provider === "fal" ? "premium" :
    provider === "gemini" ? "assistant" : "experimental";

  const color = colors[tier] || colors.standard;

  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${color.bg} ${color.text} text-[10px] font-bold`}>
      {labels[tier]}
    </span>
  );
}

/**
 * Get display name for provider
 */
function getTierDisplayName(provider: ProviderType): string {
  switch (provider) {
    case "gemini": return "Assistant Engine";
    case "fal": return "Premium Engine";
    case "cloudflare": return "Standard Engine";
    case "replicate": return "Experimental Pipeline";
    case "wavespeed": return "Hyper-Speed Engine";
    default: return "Advanced Engine";
  }
}

/**
 * Get model page URL for external providers
 */
function getModelUrl(provider: ProviderType, modelId: string): string | null {
  if (provider === "replicate") {
    // modelId format: "owner/model" or "owner/model:version"
    const baseModelId = modelId.split(":")[0];
    return `https://replicate.com/${baseModelId}`;
  }
  if (provider === "fal") {
    // modelId format: "fal-ai/flux/dev" or similar
    return `https://fal.ai/models/${modelId}`;
  }
  if (provider === "wavespeed") {
    // modelId format: "wavespeed-ai/model-name"
    return `https://wavespeed.ai`;
  }
  return null;
}

/**
 * External link icon component
 */
function ExternalLinkIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

export function CostDialog({ predictedCost, incurredCost, onClose }: CostDialogProps) {
  const resetIncurredCost = useWorkflowStore((state) => state.resetIncurredCost);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleReset = () => {
    if (confirm("Reset incurred usage to 0 Credits?")) {
      resetIncurredCost();
    }
  };

  /**
   * getModelUrl disabled for white-labeling
   */
  const getModelUrl = (_provider: ProviderType, _modelId: string) => null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="glass-modal rounded-lg p-6 w-[400px] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-100">
            Workflow Credits
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Credit Summary */}
          <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg border border-white/5">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Planned Usage</p>
              <p className="text-2xl font-bold text-neutral-100">{formatCost(predictedCost.totalCost)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Session Cost</p>
              <p className="text-lg font-bold text-neutral-400">{formatCost(incurredCost)}</p>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {predictedCost.nodeCount === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8 italic">No active engines in workflow</p>
            ) : (
              (() => {
                const sortedItems = [...predictedCost.breakdown].sort((a, b) => (b.subtotal ?? 0) - (a.subtotal ?? 0));
                return sortedItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-neutral-900 rounded border border-white/5 flex items-center gap-3">
                    <ProviderIcon provider={item.provider} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">
                          {getTierDisplayName(item.provider)}
                        </span>
                        <span className="text-xs font-bold text-neutral-200">
                          {item.subtotal !== null ? formatCost(item.subtotal) : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 truncate">
                        {item.count}x {item.modelName}
                      </p>
                    </div>
                  </div>
                ));
              })()
            )}
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-neutral-600 italic">
              * Calculations are based on internal engine metrics.
            </p>
            {incurredCost > 0 && (
              <button
                onClick={handleReset}
                className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
              >
                Reset Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
