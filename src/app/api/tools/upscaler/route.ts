/**
 * Image Upscaler / Enhancer API
 * Uses FLUX.2 Dev to enhance and sharpen images
 */
import { NextRequest, NextResponse } from "next/server";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";

function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  return new Uint8Array(Buffer.from(clean, "base64"));
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
    const imgBuf = base64ToBytes(imageBase64);
    const form = new FormData();
    form.append("prompt", "enhance this image: increase sharpness, improve clarity, boost detail, professional quality, 4k resolution, maintain original composition and colors");
    form.append("input_image_0", new Blob([imgBuf], { type: "image/png" }), "image.png");
    form.append("width", "1024");
    form.append("height", "1024");
    form.append("steps", "20");

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-2-dev`,
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

    const data = await res.json();
    const imageB64 = data?.result?.image;
    if (!imageB64) throw new Error("No image in response");

    return NextResponse.json({ result: `data:image/png;base64,${imageB64}` });
  } catch (err) {
    console.error("[upscaler]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
