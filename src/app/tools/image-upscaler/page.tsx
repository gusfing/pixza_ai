"use client";
import { ToolLayout } from "@/components/tools/ToolLayout";

export default function ImageUpscalerPage() {
  return (
    <ToolLayout
      title="Image Upscaler"
      description="Enhance and sharpen your images with AI. Improve resolution and clarity without losing quality."
      badge="Free"
      badgeColor="text-green-400 bg-green-500/10 border-green-500/20"
      apiEndpoint="/api/tools/upscaler"
      buildBody={(imageBase64) => ({ imageBase64 })}
      resultKey="result"
    />
  );
}
