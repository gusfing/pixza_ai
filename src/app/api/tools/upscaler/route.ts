/**
 * Image Upscaler API
 * Uses Cloudflare SD img2img with low strength to enhance/sharpen
 */
import { NextRequest, NextResponse } from "next/server";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_API_TOKEN ? process.env.CLOUDFLARE_ACCOUNT_ID ?? "" : "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";

function base64ToBuffer(base64: string): Buffer {
  const clean = base64.replace(/^data:[^;]+;base64,/, "");
  return Buffer.from(clean, "base64");
}

export async function POST(req: NextRequest) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
  const apiToken  = process.env.CLOUDFLARE_API_TOKEN  ?? "";

  if (!accountId || !apiToken) {
    return NextResponse.json({ error: "Cloudflare not configured" }, { status: 500 });
  }

  let imageBase64: string;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    if (!imageBase64) throw new Error("No image");
  } catch {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  try {
    const imgBuf = base64ToBuffer(imageBase64);

    // Use multipart form for img2img
    const form = new FormData();
    form.append("prompt", "high resolution, sharp details, 4k, professional quality, enhanced clarity");
    form.append("image", new Blob([imgBuf], { type: "image/png" }), "image.png");
    form.append("strength", "0.15");
    form.append("num_steps", "20");

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/runwayml/stable-diffusion-v1-5-img2img`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiToken}` },
        body: form,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as any;
      throw new Error(err?.errors?.[0]?.message || `CF error ${res.status}`);
    }

    const buf = await res.arrayBuffer();
    const result = `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[upscaler]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upscaling failed" },
      { status: 500 }
    );
  }
}
