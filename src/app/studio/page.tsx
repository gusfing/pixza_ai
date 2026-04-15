"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReactFlowProvider } from "@xyflow/react";
import { Header } from "@/components/Header";
import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { FloatingActionBar } from "@/components/FloatingActionBar";
import { AnnotationModal } from "@/components/AnnotationModal";
import { useWorkflowStore } from "@/store/workflowStore";

function MobileGate() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#080808",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 28, fontFamily: "'Inter', system-ui, sans-serif",
      textAlign: "center",
    }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 20, marginBottom: 28,
        background: "linear-gradient(135deg, #92dce5, #d64933)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img src="/pixza-logo.png" alt="" style={{ width: 38, height: 38 }} />
      </div>

      {/* Headline */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.03em" }}>
        Better on desktop
      </h1>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "0 0 36px", maxWidth: 300 }}>
        The node workflow editor is designed for large screens. Open Pixza Studio on your laptop or desktop for the best experience.
      </p>

      {/* Desktop hint */}
      <div style={{
        width: "100%", maxWidth: 320, padding: "16px 20px", borderRadius: 16,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>💻</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Open on desktop</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              pixzastudio.com/studio
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <Link href="/create" style={{
        display: "block", width: "100%", maxWidth: 320,
        padding: "14px 0", borderRadius: 14, marginBottom: 12,
        background: "#92dce5", color: "#080808",
        fontSize: 15, fontWeight: 700, textDecoration: "none",
        textAlign: "center",
      }}>
        Use Simple Mode instead
      </Link>

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.3)",
          fontSize: 13, cursor: "pointer", padding: "8px 0",
        }}
      >
        Continue anyway →
      </button>
    </div>
  );
}

export default function StudioPage() {
  const initializeAutoSave = useWorkflowStore((state) => state.initializeAutoSave);
  const cleanupAutoSave = useWorkflowStore((state) => state.cleanupAutoSave);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
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
      {isMobile && <MobileGate />}
      <div className="h-screen flex flex-col">
        <Header />
        <WorkflowCanvas />
        <FloatingActionBar />
        <AnnotationModal />
      </div>
    </ReactFlowProvider>
  );
}
