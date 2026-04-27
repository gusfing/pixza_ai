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
import { motion } from "framer-motion";

function MobileGate({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] bg-[#0d1117] flex flex-col items-center justify-center p-8 text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-10"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Monitor className="w-9 h-9 text-white/60" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      >
        <h1 className="text-3xl font-black text-white tracking-tighter mb-3">
          Built for<br />Large Screens
        </h1>
        <p className="text-white/35 text-sm leading-relaxed max-w-[260px] mx-auto mb-10">
          The node workflow editor needs a desktop environment for precise canvas manipulation.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-xs space-y-3"
      >
        <div className="p-4 rounded-2xl flex items-center gap-3 text-left"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <Zap className="w-4 h-4 text-white/40" />
          </div>
          <div>
            <p className="text-white/70 text-sm font-bold">Simple Mode Available</p>
            <p className="text-white/25 text-xs">Mobile-first generation experience</p>
          </div>
        </div>

        <Link href="/create"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all">
          Switch to Simple Mode
          <ArrowRight className="w-4 h-4" />
        </Link>

        <button onClick={onContinue}
          className="w-full text-white/25 hover:text-white/60 text-sm font-bold flex items-center justify-center gap-2 transition-colors py-2">
          Continue to Studio
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </motion.div>
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
      <div className="h-screen flex flex-col bg-[#0d1117] overflow-hidden relative">
        <Header />
        <WorkflowCanvas />
        <FloatingActionBar />
        <AnnotationModal />
      </div>
    </ReactFlowProvider>
  );
}
