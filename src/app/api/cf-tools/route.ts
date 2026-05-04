import { NextRequest, NextResponse } from "next/server";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN ?? "";

async function cfAI(model: string, body: any) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.errors?.[0]?.message || `Cloudflare AI error: ${res.status}`);
  }
  return res;
}

export async function POST(req: NextRequest) {
  const { tool, imageBase64, prompt } = await req.json();

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return NextResponse.json({ error: "Cloudflare credentials not configured" }, { status: 500 });
  }

  try {
    switch (tool) {
      case "image-to-prompt": {
        // LLaVA: describe an image
        if (!imageBase64) return NextResponse.json({ error: "Image required" }, { status: 400 });
        const base64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
        const res = await cfAI("@cf/llava-hf/llava-1.5-7b-hf", {
          image: Array.from(Buffer.from(base64, "base64")),
          prompt: prompt || "Describe this image in detail. Include style, colors, composition, and subject matter. Write it as a prompt that could be used to recreate this image with an AI image generator.",
          max_tokens: 512,
        });
        const data = await res.json() as any;
        return NextResponse.json({ result: data.result?.description || data.result?.response || "" });
      }

      case "classify": {
        // ResNet-50: classify image
        if (!imageBase64) return NextResponse.json({ error: "Image required" }, { status: 400 });
        const base64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
        const res = await cfAI("@cf/microsoft/resnet-50", {
          image: Array.from(Buffer.from(base64, "base64")),
        });
        const data = await res.json() as any;
        const labels = (data.result || []).slice(0, 5);
        return NextResponse.json({ result: labels });
      }

      case "img2img": {
        // SD 1.5 img2img: style transfer
        if (!imageBase64 || !prompt) return NextResponse.json({ error: "Image and prompt required" }, { status: 400 });
        const base64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
        const res = await cfAI("@cf/runwayml/stable-diffusion-v1-5-img2img", {
          prompt,
          image: Array.from(Buffer.from(base64, "base64")),
          disable_safety_checker: true,
        strength: 0.99,
        num_steps: 20,
        });
        // Returns image bytes
        const buffer = await res.arrayBuffer();
        const resultBase64 = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
        return NextResponse.json({ result: resultBase64 });
      }

      case "text-to-image-free": {
        // FLUX Schnell via Cloudflare
        if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });
        const res = await cfAI("@cf/black-forest-labs/flux-1-schnell", {
          prompt,
          num_steps: 4,
        });
        const buffer = await res.arrayBuffer();
        const resultBase64 = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
        return NextResponse.json({ result: resultBase64 });
      }

      default:
        return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Tool failed" },
      { status: 500 }
    );
  }
}
