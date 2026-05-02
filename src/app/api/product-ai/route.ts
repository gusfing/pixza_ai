/**
 * Product AI Tools — Free tier using Cloudflare Workers AI
 *
 * Tools:
 *  - scene-gen       : Generate a background scene for a product (FLUX Schnell)
 *  - caption         : Generate marketing captions for a product image (LLaVA → text)
 *  - lighting        : Enhance lighting via SD img2img
 *  - shadow          : Add realistic drop shadow via SD img2img
 *  - describe        : Detailed product description (LLaVA)
 *  - classify        : Detect product category (ResNet-50)
 *  - defect          : Basic defect / quality check (LLaVA with defect prompt)
 *  - style-match     : Match a reference style to the product (SD img2img)
 */
import { NextRequest, NextResponse } from "next/server";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";

// ── Cloudflare AI helper ─────────────────────────────────────
async function cfAI(model: string, body: unknown): Promise<Response> {
  const b = body as Record<string, unknown>;
  const hasImage = b.image !== undefined;

  let fetchBody: BodyInit;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${CF_API_TOKEN}`,
  };

  if (hasImage) {
    const form = new FormData();
    const imgBuf = Buffer.from(b.image as number[]);
    form.append("image", new Blob([imgBuf], { type: "image/png" }), "image.png");
    for (const [k, v] of Object.entries(b)) {
      if (k !== "image") form.append(k, String(v));
    }
    fetchBody = form;
  } else {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`,
    { method: "POST", headers, body: fetchBody }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err?.errors?.[0]?.message || `Cloudflare AI error: ${res.status}`);
  }
  return res;
}

// ── Convert base64 data URI → byte array ────────────────────
function toByteArray(base64: string): number[] {
  const clean = base64.replace(/^data:[^;]+;base64,/, "");
  return Array.from(Buffer.from(clean, "base64"));
}

// ── Convert ArrayBuffer → base64 data URI ───────────────────
function toDataUri(buffer: ArrayBuffer, mime = "image/png"): string {
  return `data:${mime};base64,${Buffer.from(buffer).toString("base64")}`;
}

export async function POST(req: NextRequest) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return NextResponse.json({ error: "Cloudflare credentials not configured" }, { status: 500 });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { tool, imageBase64, prompt, style, brandKit } = body;

  try {
    switch (tool) {

      // ── 1. Scene Generation ──────────────────────────────
      case "scene-gen": {
        // Generate a background scene that matches the product aesthetic
        const scenePrompt = brandKit?.sceneStyle
          ? `${prompt || "product photography background scene"}, ${brandKit.sceneStyle}, professional studio, no product, clean background`
          : `${prompt || "professional product photography background"}, studio quality, clean, commercial`;

        const res = await cfAI("@cf/black-forest-labs/flux-1-schnell", {
          prompt: scenePrompt,
          num_steps: 4,
        });
        const buf = await res.arrayBuffer();
        return NextResponse.json({ result: toDataUri(buf) });
      }

      // ── 2. Caption Generator ─────────────────────────────
      case "caption": {
        if (!imageBase64) return NextResponse.json({ error: "Image required" }, { status: 400 });
        const tone = brandKit?.tone || "professional";
        const captionPrompt = `You are a professional copywriter. Look at this product image and write 3 short marketing captions.
Tone: ${tone}. Format: return ONLY a JSON array of 3 strings, no markdown, no explanation.
Example: ["Caption one.", "Caption two.", "Caption three."]`;

        const res = await cfAI("@cf/llava-hf/llava-1.5-7b-hf", {
          image: toByteArray(imageBase64),
          prompt: captionPrompt,
          max_tokens: 256,
        });
        const data = await res.json() as any;
        const raw: string = data.result?.description || data.result?.response || "";

        // Try to parse JSON array from response
        let captions: string[] = [];
        try {
          const match = raw.match(/\[[\s\S]*\]/);
          if (match) captions = JSON.parse(match[0]);
        } catch { /* fallback */ }

        // Fallback: split by newlines
        if (captions.length === 0) {
          captions = raw.split("\n").map((s: string) => s.replace(/^[-•\d.]+\s*/, "").trim()).filter(Boolean).slice(0, 3);
        }

        return NextResponse.json({ result: captions });
      }

      // ── 3. Lighting Enhancer ─────────────────────────────
      case "lighting": {
        if (!imageBase64) return NextResponse.json({ error: "Image required" }, { status: 400 });
        const lightingPrompt = brandKit?.lightingStyle
          ? `product photography, ${brandKit.lightingStyle}, professional studio lighting, enhanced illumination, commercial quality`
          : "product photography, professional studio lighting, soft box lighting, enhanced illumination, commercial quality, sharp focus";

        const res = await cfAI("@cf/runwayml/stable-diffusion-v1-5-img2img", {
          prompt: lightingPrompt,
          image: toByteArray(imageBase64),
          strength: 0.35, // Low strength = preserve product, just enhance lighting
          num_steps: 20,
        });
        const buf = await res.arrayBuffer();
        return NextResponse.json({ result: toDataUri(buf) });
      }

      // ── 4. Shadow Generator ──────────────────────────────
      case "shadow": {
        if (!imageBase64) return NextResponse.json({ error: "Image required" }, { status: 400 });
        const shadowPrompt = "product photography, realistic drop shadow, soft natural shadow beneath product, white background, professional commercial photography, studio quality";

        const res = await cfAI("@cf/runwayml/stable-diffusion-v1-5-img2img", {
          prompt: shadowPrompt,
          image: toByteArray(imageBase64),
          strength: 0.3,
          num_steps: 20,
        });
        const buf = await res.arrayBuffer();
        return NextResponse.json({ result: toDataUri(buf) });
      }

      // ── 5. Product Description ───────────────────────────
      case "describe": {
        if (!imageBase64) return NextResponse.json({ error: "Image required" }, { status: 400 });
        const res = await cfAI("@cf/llava-hf/llava-1.5-7b-hf", {
          image: toByteArray(imageBase64),
          prompt: "Describe this product in detail for an e-commerce listing. Include: product type, colors, materials, key features, dimensions if visible, and target audience. Be specific and professional.",
          max_tokens: 512,
        });
        const data = await res.json() as any;
        return NextResponse.json({ result: data.result?.description || data.result?.response || "" });
      }

      // ── 6. Product Classifier ────────────────────────────
      case "classify": {
        if (!imageBase64) return NextResponse.json({ error: "Image required" }, { status: 400 });
        const res = await cfAI("@cf/microsoft/resnet-50", {
          image: toByteArray(imageBase64),
        });
        const data = await res.json() as any;
        const labels = (data.result || []).slice(0, 5);
        return NextResponse.json({ result: labels });
      }

      // ── 7. Defect / Quality Check ────────────────────────
      case "defect": {
        if (!imageBase64) return NextResponse.json({ error: "Image required" }, { status: 400 });
        const res = await cfAI("@cf/llava-hf/llava-1.5-7b-hf", {
          image: toByteArray(imageBase64),
          prompt: `You are a quality control inspector. Examine this product image carefully and report:
1. Overall quality score (1-10)
2. Any visible defects, damage, or imperfections
3. Lighting issues (shadows, overexposure, underexposure)
4. Background issues (distracting elements, uneven background)
5. Composition issues (cropping, angle, centering)
6. Recommendations for improvement

Format as JSON: {"score": 8, "defects": [], "lighting": "good", "background": "clean", "composition": "centered", "recommendations": []}`,
          max_tokens: 512,
        });
        const data = await res.json() as any;
        const raw: string = data.result?.description || data.result?.response || "";

        let report: any = { score: null, defects: [], recommendations: [], raw };
        try {
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) report = { ...JSON.parse(match[0]), raw };
        } catch { /* use raw */ }

        return NextResponse.json({ result: report });
      }

      // ── 8. Style Match ───────────────────────────────────
      case "style-match": {
        if (!imageBase64) return NextResponse.json({ error: "Image required" }, { status: 400 });
        const stylePrompt = style
          ? `${style}, product photography, professional, commercial quality, consistent brand aesthetic`
          : (brandKit?.visualStyle || "minimalist clean product photography, white background, professional studio");

        const res = await cfAI("@cf/runwayml/stable-diffusion-v1-5-img2img", {
          prompt: stylePrompt,
          image: toByteArray(imageBase64),
          strength: 0.45,
          num_steps: 20,
        });
        const buf = await res.arrayBuffer();
        return NextResponse.json({ result: toDataUri(buf) });
      }

      default:
        return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
    }
  } catch (err) {
    console.error("[product-ai]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Tool failed" },
      { status: 500 }
    );
  }
}
