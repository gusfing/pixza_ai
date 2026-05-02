/**
 * Background Remover API
 * Uses Cloudflare AI (free) — no external cost
 * Returns image with transparent background as PNG base64
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
    const imgBuf = base64ToBuffer(imageBase64);
    const res = await cfAIBinary("@cf/inspyrenet/rembg", imgBuf);
    const buf = await res.arrayBuffer();
    const result = `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[bg-remover]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Background removal failed" },
      { status: 500 }
    );
  }
}
