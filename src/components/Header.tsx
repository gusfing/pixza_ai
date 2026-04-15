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
    <button onClick={handleClick} className="btn-icon relative" title={`${unviewed} unviewed comments`}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
      </svg>
      {unviewed > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold text-white bg-[var(--action)] rounded-full px-0.5 leading-none">
          {unviewed > 9 ? "9+" : unviewed}
        </span>
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
    ? isSaving ? "Saving…" : lastSavedAt ? `Saved ${fmtTime(lastSavedAt)}` : "Unsaved"
    : "Unsaved";

  const handleProjectSave = async (id: string, name: string, path: string) => {
    setWorkflowMetadata(id, name, path);
    setShowProjectModal(false);
    setTimeout(() => saveToFile().catch(console.error), 50);
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

      <header
        className="surface-panel h-12 flex items-center justify-between px-3 shrink-0 z-50 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {/* ── Left ── */}
        <div className="flex items-center gap-1">
          {/* Brand */}
          <button
            onClick={() => setShowQuickstart(true)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
            title="Home"
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--accent-dim)", border: "1px solid rgba(146,220,229,0.2)" }}>
              <img src="/pixza-logo.png" alt="" className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
              Pixza Studio
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-4 mx-1" style={{ background: "var(--border)" }} />

          {/* Project name */}
          <span className="text-sm px-1" style={{ color: configured ? "var(--text-2)" : "var(--text-3)" }}>
            {configured ? workflowName : "Untitled"}
          </span>

          {configured && <CostIndicator />}

          {/* Divider */}
          <div className="w-px h-4 mx-1" style={{ background: "var(--border)" }} />

          {/* File actions */}
          <button
            onClick={() => canSave ? saveToFile() : (setProjectModalMode("settings"), setShowProjectModal(true))}
            disabled={isSaving}
            className="btn-icon relative"
            title={isSaving ? "Saving…" : canSave ? "Save (⌘S)" : "Set save location"}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9Z" />
            </svg>
            {hasUnsavedChanges && !isSaving && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--action)" }} />
            )}
          </button>

          <button onClick={() => setShowWorkflowBrowser(true)} className="btn-icon" title="Open project">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </button>

          {saveDirectoryPath && (
            <button onClick={handleOpenDir} className="btn-icon" title="Open folder">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </button>
          )}

          <button
            onClick={() => { setProjectModalMode(configured ? "settings" : "new"); setShowProjectModal(true); }}
            className="btn-icon"
            title="Settings"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-1">
          {previousWorkflowSnapshot && (
            <button onClick={handleRevert} className="btn btn-ghost text-xs gap-1.5 mr-1" style={{ color: "var(--action)", fontSize: "11px" }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Revert AI
            </button>
          )}

          <CommentsBtn />

          <span className="text-xs px-2" style={{ color: "var(--text-3)" }}>{saveStatus}</span>

          <div className="w-px h-3.5 mx-1" style={{ background: "var(--border)" }} />

          <Link href="/create"
            className="text-xs px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--accent)", border: "1px solid rgba(146,220,229,0.2)", background: "rgba(146,220,229,0.06)", textDecoration: "none" }}
          >
            Create
          </Link>

          <button onClick={() => setShortcutsDialogOpen(true)} className="btn-icon" title="Keyboard shortcuts (?)">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
            </svg>
          </button>

          <div className="w-px h-3.5 mx-1" style={{ background: "var(--border)" }} />
          
          <QuotaIndicator />
          <ProfileDropdown />
        </div>
      </header>

      <KeyboardShortcutsDialog isOpen={shortcutsDialogOpen} onClose={() => setShortcutsDialogOpen(false)} />
    </>
  );
}
