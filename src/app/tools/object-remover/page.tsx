"use client";
import { ToolLayout } from "@/components/tools/ToolLayout";

export default function ObjectRemoverPage() {
  return (
    <ToolLayout
      title="Object Remover"
      description="Remove unwanted objects, people, or distractions from your photos with AI inpainting."
      badge="Free"
      badgeColor="text-green-400 bg-green-500/10 border-green-500/20"
      apiEndpoint="/api/tools/object-remover"
      buildBody={(imageBase64, opts) => ({ imageBase64, prompt: opts.prompt })}
      resultKey="result"
      showPrompt
      promptPlaceholder="Describe what to fill in (e.g. 'clean white background', 'grass field')…"
    />
  );
}
