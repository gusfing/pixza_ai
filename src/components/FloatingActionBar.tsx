"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import { useShallow } from "zustand/shallow";
import { NodeType } from "@/types";
import { useReactFlow } from "@xyflow/react";
import { ModelSearchDialog } from "./modals/ModelSearchDialog";
import { 
  Plus, 
  Play, 
  Square, 
  Search, 
  Zap, 
  MoreHorizontal, 
  Image as ImageIcon,
  Video,
  Type,
  Box,
  ChevronUp,
  Spline
} from "lucide-react";

const NODE_CATEGORIES = [
  { label: "Input", nodes: [{ type: "imageInput" as NodeType, label: "Image Input" }, { type: "audioInput" as NodeType, label: "Audio Input" }, { type: "videoInput" as NodeType, label: "Video Input" }, { type: "glbViewer" as NodeType, label: "3D Viewer" }] },
  { label: "Text", nodes: [{ type: "prompt" as NodeType, label: "Prompt" }, { type: "promptConstructor" as NodeType, label: "Prompt Constructor" }, { type: "array" as NodeType, label: "Array" }] },
  { label: "Generate", nodes: [{ type: "nanoBanana" as NodeType, label: "Generate Image" }, { type: "generateVideo" as NodeType, label: "Generate Video" }, { type: "generate3d" as NodeType, label: "Generate 3D" }, { type: "generateAudio" as NodeType, label: "Generate Audio" }, { type: "llmGenerate" as NodeType, label: "LLM Generate" }] },
  { label: "Process", nodes: [{ type: "annotation" as NodeType, label: "Annotate" }, { type: "splitGrid" as NodeType, label: "Split Grid" }, { type: "videoStitch" as NodeType, label: "Video Stitch" }, { type: "videoTrim" as NodeType, label: "Video Trim" }, { type: "easeCurve" as NodeType, label: "Ease Curve" }, { type: "videoFrameGrab" as NodeType, label: "Frame Grab" }, { type: "imageCompare" as NodeType, label: "Image Compare" }] },
  { label: "Route", nodes: [{ type: "router" as NodeType, label: "Router" }, { type: "switch" as NodeType, label: "Switch" }, { type: "conditionalSwitch" as NodeType, label: "Conditional Switch" }] },
  { label: "Output", nodes: [{ type: "output" as NodeType, label: "Output" }, { type: "outputGallery" as NodeType, label: "Output Gallery" }] },
];

function getPaneCenter() {
  const el = document.querySelector(".react-flow");
  if (el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [active, cb, ref]);
}

/* ── Minimal Dropdown Wrapper ── */
function BarDropdown({ trigger, children, icon }: { trigger: string; children: React.ReactNode; icon?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
          open
            ? "bg-white/10 text-white"
            : trigger === "Input"
              ? "text-cyan-400 hover:text-cyan-300 hover:bg-white/8"
              : trigger === "Generate"
                ? "text-violet-400 hover:text-violet-300 hover:bg-white/8"
                : "text-neutral-400 hover:text-white hover:bg-white/8"
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{trigger}</span>
        <ChevronUp className={`w-3 h-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 rounded-xl overflow-hidden p-1.5 shadow-2xl"
          style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.1)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function FloatingActionBar() {
  const {
    nodes, isRunning, currentNodeIds,
    executeWorkflow, stopWorkflow, validateWorkflow,
    edgeStyle, setEdgeStyle, setModelSearchOpen, modelSearchOpen, modelSearchProvider,
    addNode
  } = useWorkflowStore(useShallow((s) => ({
    nodes: s.nodes, isRunning: s.isRunning, currentNodeIds: s.currentNodeIds,
    executeWorkflow: s.executeWorkflow, stopWorkflow: s.stopWorkflow,
    validateWorkflow: s.validateWorkflow, edgeStyle: s.edgeStyle, setEdgeStyle: s.setEdgeStyle,
    setModelSearchOpen: s.setModelSearchOpen, modelSearchOpen: s.modelSearchOpen,
    modelSearchProvider: s.modelSearchProvider,
    addNode: s.addNode
  })));

  const { screenToFlowPosition } = useReactFlow();
  const addAt = (type: NodeType) => { 
    const c = getPaneCenter(); 
    addNode(type, screenToFlowPosition({ x: c.x + Math.random() * 60 - 30, y: c.y + Math.random() * 60 - 30 })); 
  };

  const { valid } = validateWorkflow();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <div className="flex items-center gap-1 px-2 py-2 rounded-2xl shadow-xl"
        style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Quick Add Actions */}
        <BarDropdown trigger="Input" icon={<Plus className="w-3.5 h-3.5" />}>
          {NODE_CATEGORIES[0].nodes.map(n => (
            <button
              key={n.type}
              onClick={() => addAt(n.type)}
              className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/8 rounded-lg transition-all"
            >
              {n.label}
            </button>
          ))}
        </BarDropdown>

        <BarDropdown trigger="Generate" icon={<Zap className="w-3.5 h-3.5" />}>
          {NODE_CATEGORIES[2].nodes.map(n => (
            <button
              key={n.type}
              onClick={() => addAt(n.type)}
              className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/8 rounded-lg transition-all"
            >
              {n.label}
            </button>
          ))}
        </BarDropdown>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <button
          onClick={() => setModelSearchOpen(true)}
          className="p-2.5 text-neutral-400 hover:text-white hover:bg-white/8 rounded-xl transition-all"
          title="Search Models"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={() => setEdgeStyle(edgeStyle === "angular" ? "curved" : "angular")}
          className="p-2.5 text-neutral-400 hover:text-white hover:bg-white/8 rounded-xl transition-all"
          title="Toggle Edge Style"
        >
          <Spline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Run button */}
        <button
          onClick={() => isRunning ? stopWorkflow() : executeWorkflow()}
          disabled={!valid && !isRunning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            isRunning
              ? "bg-red-500 text-white"
              : valid
                ? "bg-white text-black hover:bg-white/90 active:scale-95"
                : "bg-white/8 text-white/25 cursor-not-allowed"
          }`}
        >
          {isRunning ? (
            <><Square className="w-3.5 h-3.5 fill-current" /> Stop</>
          ) : (
            <><Play className="w-3.5 h-3.5 fill-current" /> Run</>
          )}
        </button>

        <button className="p-2.5 text-neutral-400 hover:text-white hover:bg-white/8 rounded-xl transition-all">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <ModelSearchDialog isOpen={modelSearchOpen} onClose={() => setModelSearchOpen(false)} initialProvider={modelSearchProvider} />
    </div>
  );
}



