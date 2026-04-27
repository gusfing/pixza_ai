"use client";

import { useRef, useState, useEffect } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import { useShallow } from "zustand/shallow";
import { NodeType } from "@/types";
import { useReactFlow } from "@xyflow/react";
import { ModelSearchDialog } from "./modals/ModelSearchDialog";
import { Play, Square, ChevronDown, Spline } from "lucide-react";

// ── Quick-add node buttons shown directly in the bar ──────────
const QUICK_NODES: { type: NodeType; label: string }[] = [
  { type: "imageInput",  label: "Image"    },
  { type: "prompt",      label: "Prompt"   },
  { type: "nanoBanana",  label: "Generate" },
  { type: "output",      label: "Output"   },
];

// ── "All nodes" dropdown ──────────────────────────────────────
const ALL_NODES: { type: NodeType; label: string }[] = [
  { type: "imageInput",       label: "Image Input"        },
  { type: "audioInput",       label: "Audio Input"        },
  { type: "videoInput",       label: "Video Input"        },
  { type: "glbViewer",        label: "3D Viewer"          },
  { type: "prompt",           label: "Prompt"             },
  { type: "promptConstructor",label: "Prompt Constructor" },
  { type: "array",            label: "Array"              },
  { type: "nanoBanana",       label: "Generate Image"     },
  { type: "generateVideo",    label: "Generate Video"     },
  { type: "generate3d",       label: "Generate 3D"        },
  { type: "generateAudio",    label: "Generate Audio"     },
  { type: "llmGenerate",      label: "LLM Generate"       },
  { type: "annotation",       label: "Annotate"           },
  { type: "splitGrid",        label: "Split Grid"         },
  { type: "videoStitch",      label: "Video Stitch"       },
  { type: "videoTrim",        label: "Video Trim"         },
  { type: "easeCurve",        label: "Ease Curve"         },
  { type: "videoFrameGrab",   label: "Frame Grab"         },
  { type: "imageCompare",     label: "Image Compare"      },
  { type: "router",           label: "Router"             },
  { type: "switch",           label: "Switch"             },
  { type: "conditionalSwitch",label: "Conditional Switch" },
  { type: "output",           label: "Output"             },
  { type: "outputGallery",    label: "Output Gallery"     },
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

// ── Generic dropdown ──────────────────────────────────────────
function Dropdown({ label, items, onSelect }: {
  label: string;
  items: { type: NodeType; label: string }[];
  onSelect: (type: NodeType) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 h-8 rounded-md text-[13px] font-medium transition-colors ${
          open ? "bg-white/15 text-white" : "text-neutral-300 hover:text-white hover:bg-white/10"
        }`}
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 w-52 rounded-xl overflow-hidden py-1 shadow-2xl"
          style={{ background: "#2a2a2a", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {items.map(n => (
            <button
              key={n.type}
              onClick={() => { onSelect(n.type); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-[13px] text-neutral-300 hover:text-white hover:bg-white/8 transition-colors"
            >
              {n.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Run split button ──────────────────────────────────────────
function RunButton({ isRunning, valid, onRun, onStop, onShowOptions }: {
  isRunning: boolean;
  valid: boolean;
  onRun: () => void;
  onStop: () => void;
  onShowOptions: () => void;
}) {
  if (isRunning) {
    return (
      <button
        onClick={onStop}
        className="flex items-center gap-2 px-4 h-8 rounded-md bg-red-500 text-white text-[13px] font-medium hover:bg-red-400 transition-colors"
      >
        <Square className="w-3.5 h-3.5 fill-current" />
        Stop
      </button>
    );
  }

  return (
    <div className="flex items-center">
      <button
        onClick={onRun}
        disabled={!valid}
        className={`flex items-center gap-1.5 pl-4 pr-3 h-8 rounded-l-md text-[13px] font-medium transition-colors ${
          valid
            ? "bg-white text-black hover:bg-white/90"
            : "bg-white/10 text-white/30 cursor-not-allowed"
        }`}
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        Run
      </button>
      <div className="w-px h-5 bg-black/20" />
      <button
        onClick={onShowOptions}
        disabled={!valid}
        className={`flex items-center justify-center w-7 h-8 rounded-r-md text-[13px] transition-colors ${
          valid
            ? "bg-white text-black hover:bg-white/90"
            : "bg-white/10 text-white/30 cursor-not-allowed"
        }`}
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Main bar ──────────────────────────────────────────────────
export function FloatingActionBar() {
  const {
    isRunning, executeWorkflow, stopWorkflow, validateWorkflow,
    edgeStyle, setEdgeStyle, setModelSearchOpen, modelSearchOpen, modelSearchProvider,
    addNode,
  } = useWorkflowStore(useShallow((s) => ({
    isRunning: s.isRunning,
    executeWorkflow: s.executeWorkflow,
    stopWorkflow: s.stopWorkflow,
    validateWorkflow: s.validateWorkflow,
    edgeStyle: s.edgeStyle,
    setEdgeStyle: s.setEdgeStyle,
    setModelSearchOpen: s.setModelSearchOpen,
    modelSearchOpen: s.modelSearchOpen,
    modelSearchProvider: s.modelSearchProvider,
    addNode: s.addNode,
  })));

  const { screenToFlowPosition } = useReactFlow();
  const { valid } = validateWorkflow();

  const addAt = (type: NodeType) => {
    const c = getPaneCenter();
    addNode(type, screenToFlowPosition({
      x: c.x + Math.random() * 60 - 30,
      y: c.y + Math.random() * 60 - 30,
    }));
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100">
      {/* Bar */}
      <div
        className="flex items-center h-11 px-1.5 gap-0.5 rounded-xl shadow-2xl"
        style={{
          background: "#1e1e1e",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
      >
        {/* Quick-add node buttons */}
        {QUICK_NODES.map(n => (
          <button
            key={n.type}
            onClick={() => addAt(n.type)}
            className="px-3 h-8 rounded-md text-[13px] font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            {n.label}
          </button>
        ))}

        {/* All nodes dropdown */}
        <Dropdown label="All nodes" items={ALL_NODES} onSelect={addAt} />

        {/* Separator */}
        <div className="w-px h-5 bg-white/15 mx-1.5" />

        {/* All models */}
        <button
          onClick={() => setModelSearchOpen(true)}
          className="px-3 h-8 rounded-md text-[13px] font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          All models
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-white/15 mx-1.5" />

        {/* Edge style toggle */}
        <button
          onClick={() => setEdgeStyle(edgeStyle === "angular" ? "curved" : "angular")}
          className="flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title={`Edge style: ${edgeStyle}`}
        >
          <Spline className="w-4 h-4" />
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-white/15 mx-1.5" />

        {/* Run split button */}
        <RunButton
          isRunning={isRunning}
          valid={valid}
          onRun={executeWorkflow}
          onStop={stopWorkflow}
          onShowOptions={() => {}}
        />

        {/* Small right padding */}
        <div className="w-1" />
      </div>

      <ModelSearchDialog
        isOpen={modelSearchOpen}
        onClose={() => setModelSearchOpen(false)}
        initialProvider={modelSearchProvider}
      />
    </div>
  );
}
