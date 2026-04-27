"use client";

import { WorkflowFile } from "@/store/workflowStore";
import { WorkflowBrowserView } from "./quickstart/WorkflowBrowserView";

interface WorkflowBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowLoaded: (workflow: WorkflowFile, directoryPath: string) => void;
}

export function WorkflowBrowserModal({
  isOpen,
  onClose,
  onWorkflowLoaded,
}: WorkflowBrowserModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
      onWheelCapture={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workflow-browser-title"
        className="w-full max-w-2xl mx-4 rounded-2xl overflow-clip max-h-[85vh] flex flex-col"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <WorkflowBrowserView
          onWorkflowLoaded={onWorkflowLoaded}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

