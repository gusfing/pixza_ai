/**
 * AI Background Generator API
 * 1. Removes background from product image (Cloudflare rembg)
 * 2. Generates new background from prompt (FLUX Schnell)
 */
import { NextRequest, NextResponse } from "next/server";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";

function base64ToBuffer(base64: string): Buffer {
  const clean = base64.replace(/^data:[^;]+;base64,/, "");
  return Buffer.from(clean, "base64");
}

async function cfAIBinary(model: string, imageBuffer: Buffer): Promise<Response> {
  const form = new FormData();
  form.append("image", new Blob([imageBuffer], { type: "image/png" }), "image.png");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
      body: form,
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err?.errors?.[0]?.message || `CF error ${res.status}`);
  }
  return res;
}

async function cfAIJson(model: string, body: unknown): Promise<Response> {
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
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err?.errors?.[0]?.message || `CF error ${res.status}`);
  }
  return res;
}

export async function POST(req: NextRequest) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return NextResponse.json({ error: "Cloudflare not configured" }, { status: 500 });
  }

  let imageBase64: string, prompt: string, mode: string;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    prompt      = body.prompt || "professional studio background, clean, minimal";
    mode        = body.mode || "generate";
    if (!imageBase64) throw new Error("No image");
  } catch {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  try {
    // Step 1: Remove background (binary multipart)
    const imgBuf = base64ToBuffer(imageBase64);
    const rembgRes = await cfAIBinary("@cf/inspyrenet/rembg", imgBuf);
    const rembgBuf = await rembgRes.arrayBuffer();
    const cutout = `data:image/png;base64,${Buffer.from(rembgBuf).toString("base64")}`;

    if (mode === "remove-only") {
      return NextResponse.json({ cutout, background: null });
    }

    // Step 2: Generate background (JSON — text-to-image, no image input)
    const bgPrompt = `${prompt}, product photography background, no product, no people, professional, high quality`;
    const bgRes = await cfAIJson("@cf/black-forest-labs/flux-1-schnell", {
      prompt: bgPrompt,
      num_steps: 4,
    });
    const bgBuf = await bgRes.arrayBuffer();
    const background = `data:image/png;base64,${Buffer.from(bgBuf).toString("base64")}`;

    return NextResponse.json({ cutout, background });
  } catch (err) {
    console.error("[ai-background]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Background generation failed" },
      { status: 500 }
    );
  }
}
