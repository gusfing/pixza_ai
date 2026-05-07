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
      seoContent={`<h2>Free AI Background Remover</h2>
<p>Pixza Studio's background remover uses advanced AI to detect and remove backgrounds from any photo in seconds. Whether you're editing product images for e-commerce, creating profile pictures, or preparing assets for design projects, our tool delivers clean, precise cutouts every time.</p>
<h3>How it works</h3>
<p>Upload your image, click Run, and our AI model — powered by Cloudflare Workers AI — automatically segments the subject from the background. The result is a transparent PNG ready to use in any project.</p>
<h3>Best for</h3>
<ul><li>Product photography for online stores</li><li>Portrait and headshot editing</li><li>Logo and graphic design assets</li><li>Social media content creation</li></ul>`}
    />
  );
}
