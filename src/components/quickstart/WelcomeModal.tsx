"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkflowFile, useWorkflowStore } from "@/store/workflowStore";
import { QuickstartView } from "@/types/quickstart";
import { QuickstartInitialView } from "./QuickstartInitialView";
import { TemplateExplorerView } from "./TemplateExplorerView";
import { PromptWorkflowView } from "./PromptWorkflowView";
import { WorkflowBrowserView } from "./WorkflowBrowserView";

interface WelcomeModalProps {
  onWorkflowGenerated: (workflow: WorkflowFile, directoryPath?: string) => void;
  onClose: () => void;
  onNewProject: () => void;
}

export function WelcomeModal({ onWorkflowGenerated, onClose, onNewProject }: WelcomeModalProps) {
  // Start with null — show loading until we know which view to show
  const [currentView, setCurrentView] = useState<QuickstartView | null>(null);
  const [hasCheckedWorkflows, setHasCheckedWorkflows] = useState(false);

  const loadWorkflowsFromDb = useWorkflowStore(s => s.loadWorkflowsFromDb);

  // Check if user has any cloud workflows — if none, fall back to initial view
  useEffect(() => {
    if (hasCheckedWorkflows) return;
    setHasCheckedWorkflows(true);
    loadWorkflowsFromDb().then(ws => {
      if (!ws || ws.length === 0) {
        setCurrentView("initial");
      } else {
        setCurrentView("browse");
      }
    }).catch(() => {
      setCurrentView("initial");
    });
  }, [hasCheckedWorkflows, loadWorkflowsFromDb]);

  const handleBack = useCallback(() => setCurrentView("initial"), []);
  const handleWorkflowSelected = useCallback((workflow: WorkflowFile) => onWorkflowGenerated(workflow), [onWorkflowGenerated]);

  const dialogWidth = currentView === "templates" ? "max-w-5xl" : "max-w-xl";
  const dialogHeight = currentView === "templates" || currentView === "browse" ? "h-[82vh]" : "h-auto";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        onWheelCapture={e => e.stopPropagation()}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] }}
          className={`w-full ${dialogWidth} mx-4 rounded-2xl overflow-hidden ${dialogHeight} flex flex-col`}
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Loading state while checking workflows */}
          {currentView === null && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
            </div>
          )}
          <AnimatePresence mode="wait">
            {currentView === "initial" && (
              <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 min-h-0">
                <QuickstartInitialView
                  onNewProject={onNewProject}
                  onSelectTemplates={() => setCurrentView("templates")}
                  onSelectVibe={() => setCurrentView("vibe")}
                  onSelectLoad={() => setCurrentView("browse")}
                />
              </motion.div>
            )}
            {currentView === "templates" && (
              <motion.div key="templates" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="flex-1 min-h-0 flex flex-col">
                <TemplateExplorerView onBack={handleBack} onWorkflowSelected={handleWorkflowSelected} />
              </motion.div>
            )}
            {currentView === "vibe" && (
              <motion.div key="vibe" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="flex-1 min-h-0 flex flex-col">
                <PromptWorkflowView onBack={handleBack} onWorkflowGenerated={handleWorkflowSelected} />
              </motion.div>
            )}
            {currentView === "browse" && (
              <motion.div key="browse" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="flex-1 min-h-0 flex flex-col">
                <WorkflowBrowserView
                  onBack={handleBack}
                  onWorkflowLoaded={(wf, dir) => onWorkflowGenerated(wf, dir)}
                  onClose={onClose}
                  showNewWorkflowButton
                  onNewWorkflow={() => setCurrentView("initial")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

