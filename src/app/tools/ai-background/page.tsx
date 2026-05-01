"use client";
import { ToolLayout } from "@/components/tools/ToolLayout";

export default function AIBackgroundPage() {
  return (
    <ToolLayout
      title="AI Background Generator"
      description="Remove your product background and replace it with an AI-generated scene. Describe any environment."
      badge="Free"
      badgeColor="text-green-400 bg-green-500/10 border-green-500/20"
      apiEndpoint="/api/tools/ai-background"
      buildBody={(imageBase64, opts) => ({ imageBase64, prompt: opts.prompt, mode: "generate" })}
      resultKey="result"
      showPrompt
      promptPlaceholder="e.g. 'marble table, soft studio light' or 'forest at golden hour'…"
      dualResult
    />
  );
}
