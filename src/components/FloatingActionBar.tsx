"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import { useShallow } from "zustand/shallow";
import { NodeType } from "@/types";
import { useReactFlow } from "@xyflow/react";
import { ModelSearchDialog } from "./modals/ModelSearchDialog";

const NODE_CATEGORIES = [
  { label: "Input",    nodes: [{ type: "imageInput" as NodeType, label: "Image Input" }, { type: "audioInput" as NodeType, label: "Audio Input" }, { type: "videoInput" as NodeType, label: "Video Input" }, { type: "glbViewer" as NodeType, label: "3D Viewer" }] },
  { label: "Text",     nodes: [{ type: "prompt" as NodeType, label: "Prompt" }, { type: "promptConstructor" as NodeType, label: "Prompt Constructor" }, { type: "array" as NodeType, label: "Array" }] },
  { label: "Generate", nodes: [{ type: "nanoBanana" as NodeType, label: "Generate Image" }, { type: "generateVideo" as NodeType, label: "Generate Video" }, { type: "generate3d" as NodeType, label: "Generate 3D" }, { type: "generateAudio" as NodeType, label: "Generate Audio" }, { type: "llmGenerate" as NodeType, label: "LLM Generate" }] },
  { label: "Process",  nodes: [{ type: "annotation" as NodeType, label: "Annotate" }, { type: "splitGrid" as NodeType, label: "Split Grid" }, { type: "videoStitch" as NodeType, label: "Video Stitch" }, { type: "videoTrim" as NodeType, label: "Video Trim" }, { type: "easeCurve" as NodeType, label: "Ease Curve" }, { type: "videoFrameGrab" as NodeType, label: "Frame Grab" }, { type: "imageCompare" as NodeType, label: "Image Compare" }] },
  { label: "Route",    nodes: [{ type: "router" as NodeType, label: "Router" }, { type: "switch" as NodeType, label: "Switch" }, { type: "conditionalSwitch" as NodeType, label: "Conditional Switch" }] },
  { label: "Output",   nodes: [{ type: "output" as NodeType, label: "Output" }, { type: "outputGallery" as NodeType, label: "Output Gallery" }] },
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

/* ── Chip button in the bar ── */
function Chip({ label, onClick, onDragStart }: { label: string; onClick: () => void; onDragStart?: (e: React.DragEvent) => void }) {
  return (
    <button
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-grab active:cursor-grabbing"
      style={{ color: "var(--text-2)", background: "transparent" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
    >
      {label}
    </button>
  );
}

/* ── Dropdown wrapper ── */
function BarDropdown({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
        style={{ color: open ? "var(--text-1)" : "var(--text-2)", background: open ? "rgba(255,255,255,0.06)" : "transparent" }}
        onMouseEnter={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; } }}
        onMouseLeave={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; } }}
      >
        {trigger}
        <svg className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="dropdown absolute bottom-full left-0 mb-2 anim-slide-up" style={{ minWidth: 160 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Generate dropdown ── */
function GenerateDropdown() {
  const addNode = useWorkflowStore((s) => s.addNode);
  const { screenToFlowPosition } = useReactFlow();
  const add = (type: NodeType) => { const c = getPaneCenter(); addNode(type, screenToFlowPosition({ x: c.x + Math.random() * 60 - 30, y: c.y + Math.random() * 60 - 30 })); };

  const items: { type: NodeType; label: string }[] = [
    { type: "nanoBanana", label: "Image" },
    { type: "generateVideo", label: "Video" },
    { type: "generate3d", label: "3D" },
    { type: "generateAudio", label: "Audio" },
    { type: "llmGenerate", label: "Text (LLM)" },
  ];

  return (
    <BarDropdown trigger="Generate">
      {items.map(i => (
        <button key={i.type} onClick={() => add(i.type)} draggable
          onDragStart={e => { e.dataTransfer.setData("application/node-type", i.type); e.dataTransfer.effectAllowed = "copy"; }}
          className="dropdown-item cursor-grab">{i.label}</button>
      ))}
    </BarDropdown>
  );
}

/* ── All nodes dropdown ── */
function AllNodesDropdown() {
  const addNode = useWorkflowStore((s) => s.addNode);
  const { screenToFlowPosition } = useReactFlow();
  const add = useCallback((type: NodeType) => {
    const c = getPaneCenter();
    addNode(type, screenToFlowPosition({ x: c.x + Math.random() * 60 - 30, y: c.y + Math.random() * 60 - 30 }));
  }, [addNode, screenToFlowPosition]);

  return (
    <BarDropdown trigger="All nodes">
      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        {NODE_CATEGORIES.map((cat, i) => (
          <div key={cat.label}>
            {i > 0 && <div className="dropdown-sep" />}
            <div className="dropdown-label">{cat.label}</div>
            {cat.nodes.map(n => (
              <button key={n.type} onClick={() => add(n.type)} draggable
                onDragStart={e => { e.dataTransfer.setData("application/node-type", n.type); e.dataTransfer.effectAllowed = "copy"; }}
                className="dropdown-item cursor-grab">{n.label}</button>
            ))}
          </div>
        ))}
      </div>
    </BarDropdown>
  );
}

/* ── Separator ── */
const Sep = () => <div className="w-px h-4 mx-1 shrink-0" style={{ background: "var(--border)" }} />;

export function FloatingActionBar() {
  const {
    nodes, isRunning, currentNodeIds,
    executeWorkflow, regenerateNode, executeSelectedNodes, stopWorkflow, validateWorkflow,
    edgeStyle, setEdgeStyle, setModelSearchOpen, modelSearchOpen, modelSearchProvider,
  } = useWorkflowStore(useShallow((s) => ({
    nodes: s.nodes, isRunning: s.isRunning, currentNodeIds: s.currentNodeIds,
    executeWorkflow: s.executeWorkflow, regenerateNode: s.regenerateNode,
    executeSelectedNodes: s.executeSelectedNodes, stopWorkflow: s.stopWorkflow,
    validateWorkflow: s.validateWorkflow, edgeStyle: s.edgeStyle, setEdgeStyle: s.setEdgeStyle,
    setModelSearchOpen: s.setModelSearchOpen, modelSearchOpen: s.modelSearchOpen,
    modelSearchProvider: s.modelSearchProvider,
  })));

  const [runMenuOpen, setRunMenuOpen] = useState(false);
  const runMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(runMenuRef, () => setRunMenuOpen(false), runMenuOpen);

  const { valid, errors } = validateWorkflow();
  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes]);
  const selectedNode = useMemo(() => selectedNodes.length === 1 ? selectedNodes[0] : null, [selectedNodes]);

  const addNode = useWorkflowStore((s) => s.addNode);
  const { screenToFlowPosition } = useReactFlow();
  const addAt = (type: NodeType) => { const c = getPaneCenter(); addNode(type, screenToFlowPosition({ x: c.x + Math.random() * 60 - 30, y: c.y + Math.random() * 60 - 30 })); };

  const runLabel = useMemo(() => {
    if (!isRunning) return "Run";
    if (currentNodeIds.length === 0) return "Running…";
    if (currentNodeIds.length === 1) { const n = nodes.find(n => n.id === currentNodeIds[0]); return (n?.data?.customTitle as string || n?.type || "node") + "…"; }
    return `${currentNodeIds.length} nodes…`;
  }, [isRunning, currentNodeIds, nodes]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 anim-slide-up">
      {/* Main bar */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 rounded-2xl"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-md)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
        }}
      >
        {/* Quick-add chips */}
        <Chip label="Image" onClick={() => addAt("imageInput")} onDragStart={e => { e.dataTransfer.setData("application/node-type", "imageInput"); e.dataTransfer.effectAllowed = "copy"; }} />
        <Chip label="Video" onClick={() => addAt("videoInput")} onDragStart={e => { e.dataTransfer.setData("application/node-type", "videoInput"); e.dataTransfer.effectAllowed = "copy"; }} />
        <Chip label="Prompt" onClick={() => addAt("prompt")} onDragStart={e => { e.dataTransfer.setData("application/node-type", "prompt"); e.dataTransfer.effectAllowed = "copy"; }} />
        <GenerateDropdown />
        <Chip label="Output" onClick={() => addAt("output")} onDragStart={e => { e.dataTransfer.setData("application/node-type", "output"); e.dataTransfer.effectAllowed = "copy"; }} />
        <AllNodesDropdown />

        <Sep />

        {/* Models */}
        <Chip label="Models" onClick={() => setModelSearchOpen(true)} />

        <Sep />

        {/* Edge style */}
        <button
          onClick={() => setEdgeStyle(edgeStyle === "angular" ? "curved" : "angular")}
          className="btn-icon"
          style={{ width: 28, height: 28 }}
          title={`Switch to ${edgeStyle === "angular" ? "curved" : "angular"} edges`}
        >
          {edgeStyle === "angular"
            ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12h4l4-8 4 8h4" /></svg>
            : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12c0 0 4-8 8-8s8 8 8 8" /></svg>
          }
        </button>

        <Sep />

        {/* Run button group */}
        <div className="relative flex items-center" ref={runMenuRef}>
          <button
            onClick={() => isRunning ? stopWorkflow() : executeWorkflow()}
            disabled={!valid && !isRunning}
            title={!valid ? errors.join("\n") : isRunning ? "Stop" : "Run workflow"}
            className="btn text-xs font-semibold"
            style={{
              padding: "6px 14px",
              borderRadius: valid && !isRunning ? "8px 0 0 8px" : "8px",
              background: isRunning ? "var(--action-dim)" : valid ? "var(--accent)" : "var(--surface-3)",
              color: isRunning ? "var(--action)" : valid ? "#080808" : "var(--text-3)",
              border: isRunning ? "1px solid rgba(214,73,51,0.3)" : "none",
              boxShadow: valid && !isRunning ? "0 2px 12px rgba(146,220,229,0.2)" : "none",
            }}
          >
            {isRunning ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="max-w-[110px] truncate">{runLabel}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Run
              </span>
            )}
          </button>

          {/* Chevron */}
          {!isRunning && valid && (
            <button
              onClick={() => setRunMenuOpen(!runMenuOpen)}
              title="Run options"
              className="flex items-center self-stretch px-1.5 rounded-r-lg transition-colors"
              style={{
                background: "var(--accent)",
                borderLeft: "1px solid rgba(8,8,8,0.2)",
                color: "#080808",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#aae8f0"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--accent)"}
            >
              <svg className={`w-2.5 h-2.5 transition-transform ${runMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {/* Run menu */}
          {runMenuOpen && !isRunning && (
            <div className="dropdown absolute bottom-full right-0 mb-2 anim-slide-up" style={{ minWidth: 200 }}>
              <button onClick={() => { executeWorkflow(); setRunMenuOpen(false); }} className="dropdown-item">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Run entire workflow
              </button>
              <button onClick={() => { if (selectedNode) { executeWorkflow(selectedNode.id); setRunMenuOpen(false); } }} disabled={!selectedNode} className="dropdown-item">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                Run from selected
              </button>
              <button onClick={() => { if (selectedNode) { regenerateNode(selectedNode.id); setRunMenuOpen(false); } }} disabled={!selectedNode} className="dropdown-item">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /></svg>
                Run selected only
              </button>
              <button onClick={() => { if (selectedNodes.length > 0) { executeSelectedNodes(selectedNodes.map(n => n.id)); setRunMenuOpen(false); } }} disabled={selectedNodes.length === 0} className="dropdown-item">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V9.653z" /></svg>
                {selectedNodes.length > 0 ? `Run ${selectedNodes.length} selected` : "Run selected nodes"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ModelSearchDialog isOpen={modelSearchOpen} onClose={() => setModelSearchOpen(false)} initialProvider={modelSearchProvider} />
    </div>
  );
}
