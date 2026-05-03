/**
 * AI Background Generator API
 * Uses FLUX.2 Dev to replace background with AI-generated scene
 */
import { NextRequest, NextResponse } from "next/server";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";

function base64ToBuffer(base64: string): Buffer {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  return Buffer.from(clean, "base64");
}

async function flux2Dev(imageBuffer: Buffer, prompt: string): Promise<string> {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("input_image_0", new Blob([imageBuffer], { type: "image/png" }), "image.png");
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
  return `data:image/png;base64,${imageB64}`;
}

async function flux2Text(prompt: string): Promise<string> {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("width", "1024");
  form.append("height", "1024");
  form.append("steps", "4");

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
  return `data:image/png;base64,${imageB64}`;
}

export async function POST(req: NextRequest) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return NextResponse.json({ error: "Cloudflare not configured" }, { status: 500 });
  }
  let imageBase64: string, prompt: string, mode: string;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    prompt = body.prompt || "professional studio background, clean, minimal";
    mode   = body.mode || "generate";
    if (!imageBase64) throw new Error("No image");
  } catch {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }
  try {
    const imgBuf = base64ToBuffer(imageBase64);

    if (mode === "remove-only") {
      // White background removal
      const cutout = await flux2Dev(imgBuf, "remove the background, replace with pure white background, keep subject intact, product photography");
      return NextResponse.json({ cutout, background: null });
    }

    // Generate new background + composite with subject
    const [cutout, background] = await Promise.all([
      flux2Dev(imgBuf, `keep the exact subject from the reference image, place it on: ${prompt}, professional product photography, high quality`),
      flux2Text(`${prompt}, product photography background, no product, no people, professional, high quality, 4k`),
    ]);

    return NextResponse.json({ cutout, background });
  } catch (err) {
    console.error("[ai-background]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
