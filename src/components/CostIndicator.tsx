"use client";

import { useState, useMemo } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import { calculatePredictedCost, formatCost, shouldHideCost } from "@/utils/costCalculator";
import { CostDialog } from "./CostDialog";

export function CostIndicator() {
  const [showDialog, setShowDialog] = useState(false);
  const nodes = useWorkflowStore((state) => state.nodes);
  const incurredCost = useWorkflowStore((state) => state.incurredCost);
  const modelPricingMap = useWorkflowStore((state) => state.modelPricingMap);

  const predictedCost = useMemo(() => {
    return calculatePredictedCost(nodes, modelPricingMap);
  }, [nodes, modelPricingMap]);

  const hidden = useMemo(() => shouldHideCost(nodes), [nodes]);
  const hasIncurred = incurredCost > 0;

  if (hidden && !hasIncurred) {
    return null;
  }

  // Always show dollar format (external provider costs not included in total)
  const displayCost = formatCost(predictedCost.totalCost);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="px-2 py-0.5 rounded text-xs text-[#6f6767] hover:text-neutral-900 hover:bg-black/5 transition-colors"
        title="View cost details"
      >
        {displayCost}
      </button>

      {showDialog && (
        <CostDialog
          predictedCost={predictedCost}
          incurredCost={incurredCost}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
