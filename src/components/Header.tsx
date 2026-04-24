"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useWorkflowStore } from "@/store/workflowStore";
import { useShallow } from "zustand/shallow";
import { ProjectSetupModal } from "./ProjectSetupModal";
import { CostIndicator } from "./CostIndicator";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { WorkflowBrowserModal } from "./WorkflowBrowserModal";
import { ProfileDropdown } from "./ProfileDropdown";
import { QuotaIndicator } from "./QuotaIndicator";
import { 
  FolderOpen, 
  Save, 
  Settings, 
  ChevronRight, 
  Command,
  MessageSquare,
  ExternalLink,
  RotateCcw
} from "lucide-react";

function CommentsBtn() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const getNodesWithComments = useWorkflowStore((s) => s.getNodesWithComments);
  const viewedCommentNodeIds = useWorkflowStore((s) => s.viewedCommentNodeIds);
  const markCommentViewed = useWorkflowStore((s) => s.markCommentViewed);
  const setNavigationTarget = useWorkflowStore((s) => s.setNavigationTarget);

  const nodesWithComments = useMemo(() => getNodesWithComments(), [getNodesWithComments, nodes]);
  const unviewed = useMemo(
    () => nodesWithComments.filter((n) => !viewedCommentNodeIds.has(n.id)).length,
    [nodesWithComments, viewedCommentNodeIds]
  );

  const handleClick = useCallback(() => {
    const target = nodesWithComments.find((n) => !viewedCommentNodeIds.has(n.id)) ?? nodesWithComments[0];
    if (target) { markCommentViewed(target.id); setNavigationTarget(target.id); }
  }, [nodesWithComments, viewedCommentNodeIds, markCommentViewed, setNavigationTarget]);

  if (nodesWithComments.length === 0) return null;

  return (
    <button onClick={handleClick} className="relative p-2 text-white/70 hover:text-white transition-colors" title={`${unviewed} unviewed comments`}>
      <MessageSquare className="w-4 h-4" />
      {unviewed > 0 && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full border border-[#0A0A0A]" />
      )}
    </button>
  );
}

export function Header() {
  const {
    workflowName, workflowId, saveDirectoryPath,
    hasUnsavedChanges, lastSavedAt, isSaving,
    setWorkflowMetadata, saveToFile, loadWorkflow,
    previousWorkflowSnapshot, revertToSnapshot,
    shortcutsDialogOpen, setShortcutsDialogOpen, setShowQuickstart,
  } = useWorkflowStore(useShallow((s) => ({
    workflowName: s.workflowName, workflowId: s.workflowId,
    saveDirectoryPath: s.saveDirectoryPath, hasUnsavedChanges: s.hasUnsavedChanges,
    lastSavedAt: s.lastSavedAt, isSaving: s.isSaving,
    setWorkflowMetadata: s.setWorkflowMetadata, saveToFile: s.saveToFile,
    loadWorkflow: s.loadWorkflow, previousWorkflowSnapshot: s.previousWorkflowSnapshot,
    revertToSnapshot: s.revertToSnapshot, shortcutsDialogOpen: s.shortcutsDialogOpen,
    setShortcutsDialogOpen: s.setShortcutsDialogOpen, setShowQuickstart: s.setShowQuickstart,
  })));

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<"new" | "settings">("new");
  const [showWorkflowBrowser, setShowWorkflowBrowser] = useState(false);

  const configured = !!workflowName;
  const canSave = !!(workflowId && workflowName && saveDirectoryPath);

  const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const saveStatus = configured
    ? isSaving ? "Saving..." : lastSavedAt ? `Saved ${fmtTime(lastSavedAt)}` : "Unsaved"
    : "Untitled Project";

  const handleProjectSave = async (id: string, name: string, path: string) => {
    setWorkflowMetadata(id, name, path);
    setShowProjectModal(false);
    setTimeout(() => saveToFile().catch(() => {}), 50);
  };

  const handleOpenDir = async () => {
    if (!saveDirectoryPath) return;
    try {
      const r = await fetch("/api/open-directory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: saveDirectoryPath }) });
      const d = await r.json();
      if (!r.ok || !d.success) alert(`Failed: ${d.error}`);
    } catch { alert("Failed to open folder."); }
  };

  const handleRevert = useCallback(() => {
    if (window.confirm("Restore workflow from before AI changes?")) revertToSnapshot();
  }, [revertToSnapshot]);

  return (
    <>
      <ProjectSetupModal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} onSave={handleProjectSave} mode={projectModalMode} />
      <WorkflowBrowserModal isOpen={showWorkflowBrowser} onClose={() => setShowWorkflowBrowser(false)}
        onWorkflowLoaded={async (wf, dir) => { setShowWorkflowBrowser(false); await loadWorkflow(wf, dir); }} />

      <header className="h-16 flex items-center justify-between px-6 bg-[#0A0A0A] border-b border-white/5 shrink-0 z-50">
        {/* ── Left ── */}
        <div className="flex items-center gap-6">
          <Link href="/landing" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-violet-500 to-fuchsia-500 flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <img src="/pixza-logo.png" alt="" className="w-4 h-4 invert brightness-200" />
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold tracking-tight ${configured ? "text-white" : "text-white/60"}`}>
              {configured ? workflowName : "Untitled Studio"}
            </span>
            {configured && <CostIndicator />}
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">
              {saveStatus}
            </span>
          </div>
        </div>

        {/* ── Center Actions (Minimalist Pill) ── */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full glass-panel">
          <button 
            onClick={() => canSave ? saveToFile() : (setProjectModalMode("settings"), setShowProjectModal(true))}
            className="p-2 hover:bg-white/5 rounded-full text-white/70 hover:text-white transition-all relative"
            title="Save Project"
          >
            <Save className="w-4 h-4" />
            {hasUnsavedChanges && !isSaving && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </button>
          <button 
            onClick={() => setShowWorkflowBrowser(true)}
            className="p-2 hover:bg-white/5 rounded-full text-white/70 hover:text-white transition-all"
            title="Open Project"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          {saveDirectoryPath && (
            <button 
              onClick={handleOpenDir}
              className="p-2 hover:bg-white/5 rounded-full text-white/70 hover:text-white transition-all"
              title="Open Directory"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => { setProjectModalMode(configured ? "settings" : "new"); setShowProjectModal(true); }}
            className="p-2 hover:bg-white/5 rounded-full text-white/70 hover:text-white transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-4">
          {previousWorkflowSnapshot && (
            <button 
              onClick={handleRevert} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Revert AI
            </button>
          )}

          <CommentsBtn />
          
          <div className="h-4 w-px bg-white/10 mx-2" />
          
          <QuotaIndicator />
          <ProfileDropdown />

          <button 
            onClick={() => setShortcutsDialogOpen(true)}
            className="p-2 text-white/70 hover:text-white transition-colors"
            title="Shortcuts"
          >
            <Command className="w-4 h-4" />
          </button>
        </div>
      </header>

      <KeyboardShortcutsDialog isOpen={shortcutsDialogOpen} onClose={() => setShortcutsDialogOpen(false)} />
    </>
  );
}
