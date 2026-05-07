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
      seoContent={`<h2>Free AI Image Upscaler — Enhance Resolution & Clarity</h2>
<p>Upscale and sharpen your images with AI. Our image upscaler uses deep learning to increase resolution, recover fine details, and reduce noise — giving you crisp, high-quality results from low-resolution source images.</p>
<h3>How it works</h3>
<p>Upload your image and click Run. The AI analyzes the image content and intelligently adds detail, sharpens edges, and enhances textures to produce a higher-resolution output.</p>
<h3>Best for</h3>
<ul><li>Upscaling old or low-resolution photos</li><li>Enhancing product images for print or large displays</li><li>Improving AI-generated image quality</li><li>Restoring compressed or blurry images</li></ul>`}
    />
  );
}
