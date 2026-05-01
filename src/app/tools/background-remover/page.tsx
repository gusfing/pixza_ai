"use client";
import { ToolLayout } from "@/components/tools/ToolLayout";

export default function BackgroundRemoverPage() {
  return (
    <ToolLayout
      title="Background Remover"
      description="Instantly remove backgrounds from any image with AI precision. Free, no sign-in required."
      badge="Free"
      badgeColor="text-green-400 bg-green-500/10 border-green-500/20"
      apiEndpoint="/api/tools/background-remover"
      buildBody={(imageBase64) => ({ imageBase64 })}
      resultKey="result"
    />
  );
}
