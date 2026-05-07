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
      seoContent={`<h2>AI Object Remover — Clean Up Any Photo</h2>
<p>Remove unwanted objects, people, watermarks, or distractions from your photos using AI inpainting. Our object remover intelligently fills the removed area with realistic content that matches the surrounding scene.</p>
<h3>How it works</h3>
<p>Upload your photo and describe what you want removed. The AI identifies the object and fills the area seamlessly using context from the rest of the image. Optionally describe what you'd like to fill the space with.</p>
<h3>Common use cases</h3>
<ul><li>Remove tourists or bystanders from travel photos</li><li>Clean up product shots by removing props or labels</li><li>Erase watermarks and text overlays</li><li>Remove power lines, signs, or clutter from landscapes</li></ul>`}
    />
  );
}
