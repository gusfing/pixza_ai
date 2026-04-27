"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useWorkflowStore } from "@/store/workflowStore";
import { useShallow } from "zustand/shallow";
import { ProjectSetupModal } from "./ProjectSetupModal";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { WorkflowBrowserModal } from "./WorkflowBrowserModal";
import { ProfileDropdown } from "./ProfileDropdown";
import { QuotaIndicator } from "./QuotaIndicator";
import { CostIndicator } from "./CostIndicator";
import {
  FolderOpen, Save, Settings, ExternalLink,
  RotateCcw, MessageSquare, Keyboard, ArrowLeft,
} from "lucide-react";

// ── Comments navigation button ────────────────────────────────
function CommentsBtn() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const getNodesWithComments = useWorkflowStore((s) => s.getNodesWithComments);
  const viewedCommentNodeIds = useWorkflowStore((s) => s.viewedCommentNodeIds);
  const markCommentViewed = useWorkflowStore((s) => s.markCommentViewed);
  const setNavigationTarget = useWorkflowStore((s) => s.setNavigationTarget);

  const nodesWithComments = useMemo(
    () => getNodesWithComments(),
    [getNodesWithComments, nodes]
  );
  const unviewed = useMemo(
    () => nodesWithComments.filter((n) => !viewedCommentNodeIds.has(n.id)).length,
    [nodesWithComments, viewedCommentNodeIds]
  );

  const handleClick = useCallback(() => {
    const target =
      nodesWithComments.find((n) => !viewedCommentNodeIds.has(n.id)) ??
      nodesWithComments[0];
    if (target) { markCommentViewed(target.id); setNavigationTarget(target.id); }
  }, [nodesWithComments, viewedCommentNodeIds, markCommentViewed, setNavigationTarget]);

  if (nodesWithComments.length === 0) return null;

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center justify-center w-7 h-7 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-black/5 transition-colors"
      title={`${unviewed} unviewed comment${unviewed !== 1 ? "s" : ""}`}
    >
      <MessageSquare className="w-4 h-4" />
      {unviewed > 0 && (
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
}

// ── Icon button helper ────────────────────────────────────────
function IconBtn({
  onClick, title, children, dot = false, disabled = false,
}: {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
  dot?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="relative flex items-center justify-center w-7 h-7 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-black/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
      {dot && (
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
}

// ── Main Header ───────────────────────────────────────────────
export function Header() {
  const {
    workflowName, workflowId, saveDirectoryPath,
    hasUnsavedChanges, lastSavedAt, isSaving,
    setWorkflowMetadata, saveToFile, loadWorkflow,
    previousWorkflowSnapshot, revertToSnapshot,
    shortcutsDialogOpen, setShortcutsDialogOpen, setShowQuickstart,
  } = useWorkflowStore(useShallow((s) => ({
    workflowName: s.workflowName,
    workflowId: s.workflowId,
    saveDirectoryPath: s.saveDirectoryPath,
    hasUnsavedChanges: s.hasUnsavedChanges,
    lastSavedAt: s.lastSavedAt,
    isSaving: s.isSaving,
    setWorkflowMetadata: s.setWorkflowMetadata,
    saveToFile: s.saveToFile,
    loadWorkflow: s.loadWorkflow,
    previousWorkflowSnapshot: s.previousWorkflowSnapshot,
    revertToSnapshot: s.revertToSnapshot,
    shortcutsDialogOpen: s.shortcutsDialogOpen,
    setShortcutsDialogOpen: s.setShortcutsDialogOpen,
    setShowQuickstart: s.setShowQuickstart,
  })));

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<"new" | "settings">("new");
  const [showWorkflowBrowser, setShowWorkflowBrowser] = useState(false);

  const configured = !!workflowName;
  const canSave = !!(workflowId && workflowName && saveDirectoryPath);

  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const saveLabel = isSaving
    ? "Saving…"
    : lastSavedAt
    ? `Saved ${fmtTime(lastSavedAt)}`
    : hasUnsavedChanges
    ? "Unsaved changes"
    : "";

  const handleProjectSave = async (id: string, name: string, path: string) => {
    setWorkflowMetadata(id, name, path);
    setShowProjectModal(false);
    setTimeout(() => saveToFile().catch(() => {}), 50);
  };

  const handleOpenDir = async () => {
    if (!saveDirectoryPath) return;
    try {
      const r = await fetch("/api/open-directory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: saveDirectoryPath }),
      });
      const d = await r.json();
      if (!r.ok || !d.success) alert(`Failed: ${d.error}`);
    } catch { alert("Failed to open folder."); }
  };

  const handleRevert = useCallback(() => {
    if (window.confirm("Restore workflow from before AI changes?")) revertToSnapshot();
  }, [revertToSnapshot]);

  return (
    <>
      <ProjectSetupModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSave={handleProjectSave}
        mode={projectModalMode}
      />
      <WorkflowBrowserModal
        isOpen={showWorkflowBrowser}
        onClose={() => setShowWorkflowBrowser(false)}
        onWorkflowLoaded={async (wf, dir) => {
          setShowWorkflowBrowser(false);
          await loadWorkflow(wf, dir);
        }}
      />

      {/* ── Header bar ── */}
      <header className="h-11 shrink-0 z-50 flex items-center justify-between px-3 border-b"
        style={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.08)" }}>

        {/* ── Left: logo + workflow name ── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Back to create */}
          <Link
            href="/create"
            className="flex items-center justify-center w-7 h-7 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-black/5 transition-colors shrink-0"
            title="Back to Create"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Logo */}
          <button
            onClick={() => setShowQuickstart(true)}
            className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
            title="Open welcome screen"
          >
            <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center">
              <img src="/pixza-logo.png" alt="" className="w-3.5 h-3.5 invert" />
            </div>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-black/10 shrink-0" />

          {/* Workflow name — click to rename */}
          <button
            onClick={() => { setProjectModalMode(configured ? "settings" : "new"); setShowProjectModal(true); }}
            className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors truncate max-w-[200px]"
            title={configured ? "Rename project" : "Set up project"}
          >
            {configured ? workflowName : "Untitled"}
          </button>

          {/* Save status */}
          {saveLabel && (
            <span className="text-[11px] text-neutral-400 shrink-0 hidden sm:block">
              {saveLabel}
            </span>
          )}

          {/* Cost indicator */}
          {configured && <CostIndicator />}
        </div>

        {/* ── Center: file actions ── */}
        <div className="flex items-center gap-0.5">
          <IconBtn
            onClick={() => canSave ? saveToFile() : (setProjectModalMode("settings"), setShowProjectModal(true))}
            title={canSave ? "Save project" : "Configure save location"}
            dot={hasUnsavedChanges && !isSaving}
            disabled={isSaving}
          >
            <Save className="w-3.5 h-3.5" />
          </IconBtn>

          <IconBtn onClick={() => setShowWorkflowBrowser(true)} title="Open project">
            <FolderOpen className="w-3.5 h-3.5" />
          </IconBtn>

          {saveDirectoryPath && (
            <IconBtn onClick={handleOpenDir} title="Open project folder">
              <ExternalLink className="w-3.5 h-3.5" />
            </IconBtn>
          )}

          <IconBtn
            onClick={() => { setProjectModalMode(configured ? "settings" : "new"); setShowProjectModal(true); }}
            title="Project settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </IconBtn>
        </div>

        {/* ── Right: status + tools + profile ── */}
        <div className="flex items-center gap-1">
          {/* Revert AI changes */}
          {previousWorkflowSnapshot && (
            <button
              onClick={handleRevert}
              className="flex items-center gap-1.5 px-2.5 h-7 rounded-md text-[11px] font-medium text-neutral-500 hover:text-neutral-800 hover:bg-black/5 transition-colors border border-black/8"
              title="Restore workflow from before AI changes"
            >
              <RotateCcw className="w-3 h-3" />
              Revert AI
            </button>
          )}

          <CommentsBtn />

          <IconBtn onClick={() => setShortcutsDialogOpen(true)} title="Keyboard shortcuts">
            <Keyboard className="w-3.5 h-3.5" />
          </IconBtn>

          <div className="w-px h-4 bg-black/10 mx-1" />

          <QuotaIndicator />
          <ProfileDropdown />
        </div>
      </header>

      <KeyboardShortcutsDialog
        isOpen={shortcutsDialogOpen}
        onClose={() => setShortcutsDialogOpen(false)}
      />
    </>
  );
}
