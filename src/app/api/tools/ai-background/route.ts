/**
 * AI Background Generator API
 * 1. Removes background from product image (Cloudflare rembg)
 * 2. Generates new background from prompt (FLUX Schnell)
 * 3. Returns both separately so client can composite them
 */
import { NextRequest, NextResponse } from "next/server";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";

function toByteArray(base64: string): number[] {
  const clean = base64.replace(/^data:[^;]+;base64,/, "");
  return Array.from(Buffer.from(clean, "base64"));
}

async function cfAI(model: string, body: unknown): Promise<Response> {
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
    mode        = body.mode || "generate"; // "generate" | "remove-only" | "solid"
    if (!imageBase64) throw new Error("No image");
  } catch {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  try {
    // Step 1: Remove background
    const rembgRes = await cfAI("@cf/inspyrenet/rembg", {
      image: toByteArray(imageBase64),
    });
    const rembgBuf = await rembgRes.arrayBuffer();
    const cutout = `data:image/png;base64,${Buffer.from(rembgBuf).toString("base64")}`;

    if (mode === "remove-only") {
      return NextResponse.json({ cutout, background: null });
    }

    // Step 2: Generate background
    const bgPrompt = `${prompt}, product photography background, no product, no people, professional, high quality`;
    const bgRes = await cfAI("@cf/black-forest-labs/flux-1-schnell", {
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
