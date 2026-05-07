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
      seoContent={`<h2>AI Background Generator — Replace Any Background Instantly</h2>
<p>Transform your product photos with AI-generated backgrounds. Simply upload your image, describe the scene you want, and our AI removes the original background and replaces it with a photorealistic environment — all in one step.</p>
<h3>How it works</h3>
<p>Our tool first removes the existing background, then uses a text-to-image AI model to generate a new scene based on your description. You get both the clean cutout and the composited result.</p>
<h3>Popular background ideas</h3>
<ul><li>Studio lighting on marble or wood surfaces</li><li>Outdoor scenes: forests, beaches, cityscapes</li><li>Abstract gradients and color washes</li><li>Seasonal and holiday settings</li></ul>`}
    />
  );
}
