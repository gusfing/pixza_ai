"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkflowFile } from "@/store/workflowStore";
import { QuickstartBackButton } from "./QuickstartBackButton";
import {
  getWorkflowsDirectory,
  setWorkflowsDirectory,
} from "@/store/utils/localStorage";
import { useSession } from "next-auth/react";
import { useWorkflowStore } from "@/store/workflowStore";

interface WorkflowListEntry {
  name: string;
  directoryPath: string;
  relativePath: string;
  lastModified: number;
}

interface WorkflowBrowserViewProps {
  onBack?: () => void;
  onWorkflowLoaded: (workflow: WorkflowFile, directoryPath: string) => void;
  onClose?: () => void;
  showNewWorkflowButton?: boolean;
  onNewWorkflow?: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function dirBasename(dirPath: string): string {
  return dirPath.split("/").filter(Boolean).pop() || dirPath;
}

export function WorkflowBrowserView({
  onBack,
  onWorkflowLoaded,
  onClose,
  showNewWorkflowButton = false,
  onNewWorkflow,
}: WorkflowBrowserViewProps) {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<"local" | "cloud">("local");
  const [defaultDir, setDefaultDir] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowListEntry[]>([]);
  const [cloudWorkflows, setCloudWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingWorkflow, setLoadingWorkflow] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflowFromDb = useWorkflowStore(s => s.loadWorkflowFromDb);
  const loadWorkflowsFromDb = useWorkflowStore(s => s.loadWorkflowsFromDb);

  useEffect(() => {
    setDefaultDir(getWorkflowsDirectory());
  }, []);

  const fetchWorkflows = useCallback(async (dirPath: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/list-workflows?path=${encodeURIComponent(dirPath)}`
      );
      const result = await res.json();
      if (result.success) {
        setWorkflows(result.workflows);
        if (result.workflows.length === 0) {
          setError("No workflows found in this folder");
        }
      } else {
        setError(result.error || "Failed to list workflows");
      }
    } catch {
      setError("Failed to fetch workflows");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === "local" && defaultDir) {
      fetchWorkflows(defaultDir);
    } else if (viewMode === "cloud" && session) {
      setIsLoading(true);
      loadWorkflowsFromDb().then(ws => {
        setCloudWorkflows(ws);
        setIsLoading(false);
        if (ws.length === 0) setError("No cloud workflows found.");
      }).catch(() => {
        setError("Failed to fetch cloud workflows.");
        setIsLoading(false);
      });
    }
  }, [defaultDir, fetchWorkflows, viewMode, session, loadWorkflowsFromDb]);

  const browseAndSetDir = useCallback(async () => {
    try {
      const res = await fetch("/api/browse-directory");
      if (!(res.headers.get("content-type") || "").includes("application/json")) {
        setError("Failed to open directory picker");
        return;
      }
      const result = await res.json();
      if (result.success && !result.cancelled && result.path) {
        setWorkflowsDirectory(result.path);
        setDefaultDir(result.path);
      }
    } catch {
      setError("Failed to open directory picker");
    }
  }, []);

  const handleBrowseOther = useCallback(async () => {
    try {
      const browseRes = await fetch("/api/browse-directory");
      if (!(browseRes.headers.get("content-type") || "").includes("application/json")) {
        setError("Failed to open directory picker");
        return;
      }
      const browseResult = await browseRes.json();

      if (
        !browseResult.success ||
        browseResult.cancelled ||
        !browseResult.path
      ) {
        if (!browseResult.success && !browseResult.cancelled) {
          setError(browseResult.error || "Failed to open directory picker");
        }
        return;
      }

      const dirPath = browseResult.path;

      setLoadingWorkflow(dirPath);
      const loadRes = await fetch(
        `/api/workflow?path=${encodeURIComponent(dirPath)}&load=true`
      );
      const loadResult = await loadRes.json();
      setLoadingWorkflow(null);

      if (!loadResult.success) {
        setError(loadResult.error || "No workflow file found in directory");
        return;
      }

      onWorkflowLoaded(loadResult.workflow as WorkflowFile, dirPath);
      onClose?.();
    } catch {
      setLoadingWorkflow(null);
      setError("Failed to open workflow");
    }
  }, [onWorkflowLoaded, onClose]);

  const handleSelectWorkflow = useCallback(
    async (entry: WorkflowListEntry) => {
      setLoadingWorkflow(entry.directoryPath);
      setError(null);
      try {
        const res = await fetch(
          `/api/workflow?path=${encodeURIComponent(entry.directoryPath)}&load=true`
        );
        const result = await res.json();

        if (!result.success) {
          setError(result.error || "Failed to load workflow");
          setLoadingWorkflow(null);
          return;
        }

        onWorkflowLoaded(
          result.workflow as WorkflowFile,
          entry.directoryPath
        );
        onClose?.();
      } catch {
        setError("Failed to load workflow");
        setLoadingWorkflow(null);
      }
    },
    [onWorkflowLoaded, onClose]
  );

  const handleSelectCloudWorkflow = useCallback(async (id: string) => {
    setLoadingWorkflow(id);
    setError(null);
    try {
      const success = await loadWorkflowFromDb(id);
      if (success) {
        onClose?.();
      } else {
        setError("Failed to load cloud workflow");
      }
    } catch {
      setError("Error loading cloud workflow");
    } finally {
      setLoadingWorkflow(null);
    }
  }, [loadWorkflowFromDb, onClose]);

  // State A: No default directory configured
  if (defaultDir === null) {
    return (
      <div className="p-8 flex flex-col items-center">
        {onBack && (
          <div className="w-full mb-4">
            <QuickstartBackButton onClick={onBack} />
          </div>
        )}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
            </div>
            <h2 id="workflow-browser-title" className="text-lg font-medium text-neutral-700">
              Your Workflows
            </h2>
          </div>
          <p className="text-sm text-neutral-400 max-w-xs text-center">
            Choose the folder that contains your workflow projects. You can change this later.
          </p>
          <button
            onClick={browseAndSetDir}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-gray-100 hover:bg-neutral-600 rounded-lg transition-colors"
          >
            Choose folder
          </button>
        </div>
      </div>
    );
  }

  // State B: Default directory configured — show listing
  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
        {onBack && (
          <div className="mb-2">
            <QuickstartBackButton onClick={onBack} />
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-medium text-neutral-700">
              Your Workflows
            </h2>
          </div>
          {session && (
            <div className="flex p-1 bg-neutral-800 rounded-lg border border-gray-100">
              <button
                onClick={() => setViewMode("local")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === "local" ? "bg-gray-100 text-white" : "text-neutral-400 hover:text-neutral-700"}`}
              >
                Local
              </button>
              <button
                onClick={() => setViewMode("cloud")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === "cloud" ? "bg-gray-100 text-white" : "text-neutral-400 hover:text-neutral-700"}`}
              >
                Cloud
              </button>
            </div>
          )}
        </div>
        {viewMode === "local" && (
          <p
            className="text-xs text-neutral-400 truncate mt-0.5"
            title={defaultDir || ""}
          >
            {defaultDir}
          </p>
        )}
      </div>

      {/* Workflow list */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-neutral-300 rounded-full animate-spin" />
          </div>
        ) : error && workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="w-10 h-10 text-neutral-700 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
            <p className="text-sm text-neutral-400 mb-1">No workflows found</p>
            <p className="text-xs text-neutral-400">
              This folder doesn&apos;t contain any workflow projects
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {viewMode === "local" ? (
              workflows.map((entry) => {
                const isActive = loadingWorkflow === entry.directoryPath;
                return (
                  <button
                    key={entry.directoryPath}
                    onClick={() => handleSelectWorkflow(entry)}
                    disabled={loadingWorkflow !== null}
                    className={`
                      group text-left px-3 py-2.5 rounded-lg transition-all duration-100
                      disabled:opacity-50
                      ${isActive
                        ? "bg-gray-100 border border-gray-200"
                        : "border border-transparent hover:bg-gray-50 hover:border-gray-100"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors
                        ${isActive ? "bg-blue-500/20" : "bg-gray-100 group-hover:bg-gray-100"}
                      `}>
                        {isActive ? (
                          <div className="w-3.5 h-3.5 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
                        ) : (
                          <svg
                            className="w-4 h-4 text-neutral-400 group-hover:text-neutral-400 transition-colors"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors truncate">
                          {entry.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {entry.relativePath || dirBasename(entry.directoryPath)}
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-400 tabular-nums flex-shrink-0">
                        {formatRelativeTime(entry.lastModified)}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              cloudWorkflows.map((entry) => {
                const isActive = loadingWorkflow === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => handleSelectCloudWorkflow(entry.id)}
                    disabled={loadingWorkflow !== null}
                    className={`
                      group text-left px-3 py-2.5 rounded-lg transition-all duration-100
                      disabled:opacity-50
                      ${isActive
                        ? "bg-purple-500/20 border border-purple-500/40"
                        : "border border-transparent hover:bg-purple-500/10 hover:border-purple-500/20"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors
                        ${isActive ? "bg-purple-500/20" : "bg-purple-900/30 group-hover:bg-purple-900/50"}
                      `}>
                         {isActive ? (
                          <div className="w-3.5 h-3.5 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors truncate">
                          {entry.name}
                        </div>
                        <div className="text-[11px] text-purple-400/70 truncate flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-purple-500" />
                          Cloud Project
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-400 tabular-nums flex-shrink-0">
                        {formatRelativeTime(new Date(entry.updatedAt).getTime())}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {error && workflows.length > 0 && (
          <p className="text-xs text-red-400 mt-2 px-3">{error}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBrowseOther}
            disabled={loadingWorkflow !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            Open from directory
          </button>
          <button
            onClick={browseAndSetDir}
            disabled={loadingWorkflow !== null}
            className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-50"
          >
            Change folder
          </button>
        </div>
        {showNewWorkflowButton && onNewWorkflow && (
          <button
            onClick={onNewWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Workflow
          </button>
        )}
      </div>
    </div>
  );
}

