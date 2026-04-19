"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReactFlowProvider } from "@xyflow/react";
import { Header } from "@/components/Header";
import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { FloatingActionBar } from "@/components/FloatingActionBar";
import { AnnotationModal } from "@/components/AnnotationModal";
import { useWorkflowStore } from "@/store/workflowStore";
import { Monitor, ArrowRight, Zap } from "lucide-react";

function MobileGate({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center animate-obsidian">
      {/* Cinematic Icon */}
      <div className="w-20 h-20 glass-panel rounded-[32px] flex items-center justify-center mb-10">
        <Monitor className="w-10 h-10 text-white" />
      </div>

      <h1 className="text-3xl font-black text-white tracking-tighter mb-4">
        Optimized for <br/> Large Screens
      </h1>
      <p className="text-white/40 text-sm font-medium leading-relaxed max-w-[280px] mb-12">
        The Pixza Studio workflow engine requires a desktop environment for precise node manipulation.
      </p>

      <div className="w-full max-w-sm p-8 rounded-[32px] glass-panel mb-8 text-left">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-white/50" />
          </div>
          <div>
            <p className="text-white text-sm font-bold tracking-tight">Simple Mode Available</p>
            <p className="text-white/30 text-xs">A mobile-first generation experience.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-sm gap-4">
        <Link href="/create" className="btn-minimal btn-minimal-primary py-4 text-lg">
          Switch to Simple Mode
        </Link>
        <button 
          onClick={onContinue}
          className="text-white/30 hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
        >
          Continue to Studio Anyway
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function StudioPage() {
  const initializeAutoSave = useWorkflowStore((state) => state.initializeAutoSave);
  const cleanupAutoSave = useWorkflowStore((state) => state.cleanupAutoSave);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileGate, setShowMobileGate] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setShowMobileGate(mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    initializeAutoSave();
    return () => cleanupAutoSave();
  }, [initializeAutoSave, cleanupAutoSave]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useWorkflowStore.getState().hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <ReactFlowProvider>
      {showMobileGate && <MobileGate onContinue={() => setShowMobileGate(false)} />}
      <div className="h-screen flex flex-col bg-[#0A0A0A] overflow-hidden relative">
        <Header />
        <WorkflowCanvas />
        <FloatingActionBar />
        <AnnotationModal />
      </div>
    </ReactFlowProvider>
  );
}
