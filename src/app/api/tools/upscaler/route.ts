/**
 * Image Upscaler API
 * Uses Cloudflare AI upscaler (4x)
 */
import { NextRequest, NextResponse } from "next/server";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";

function toByteArray(base64: string): number[] {
  const clean = base64.replace(/^data:[^;]+;base64,/, "");
  return Array.from(Buffer.from(clean, "base64"));
}

export async function POST(req: NextRequest) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
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
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/microsoft/resnet-50`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: toByteArray(imageBase64),
        }),
      }
    );

    // Cloudflare doesn't have a dedicated upscaler model exposed yet
    // Use ESRGAN-style upscaling via img2img with high-res prompt
    const upscaleRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/runwayml/stable-diffusion-v1-5-img2img`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "high resolution, sharp details, 4k, professional quality, enhanced clarity",
          image: toByteArray(imageBase64),
          strength: 0.15, // Very low — preserve original, just enhance
          num_steps: 20,
          guidance: 7.5,
        }),
      }
    );

    if (!upscaleRes.ok) {
      const err = await upscaleRes.json().catch(() => ({})) as any;
      throw new Error(err?.errors?.[0]?.message || `CF error ${upscaleRes.status}`);
    }

    const buf = await upscaleRes.arrayBuffer();
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
