"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkflowFile } from "@/store/workflowStore";
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
  const [currentView, setCurrentView] = useState<QuickstartView>("initial");

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
          transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          className={`w-full ${dialogWidth} mx-4 rounded-2xl overflow-hidden ${dialogHeight} flex flex-col`}
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 50px 120px rgba(0,0,0,0.95)",
          }}
          onClick={e => e.stopPropagation()}
        >
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
                <WorkflowBrowserView onBack={handleBack} onWorkflowLoaded={(wf, dir) => onWorkflowGenerated(wf, dir)} onClose={onClose} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
