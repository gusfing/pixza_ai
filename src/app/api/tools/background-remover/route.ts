/**
 * Background Remover
 * Uses SD v1.5 img2img to replace background with white
 * Falls back to FLUX Schnell text-to-image if no image provided
 */
import { NextRequest, NextResponse } from "next/server";
import { cfJson } from "@/lib/cf-multipart";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";

function toUint8Array(base64: string): number[] {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  return Array.from(new Uint8Array(Buffer.from(clean, "base64")));
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
    // Use SD img2img with very low strength to preserve subject, change background to white
    const res = await cfJson(CF_ACCOUNT_ID, CF_API_TOKEN,
      "@cf/runwayml/stable-diffusion-v1-5-img2img",
      {
        prompt: "pure white background, product photography, clean studio, white backdrop, isolated subject",
        image: toUint8Array(imageBase64),
        strength: 0.45,
        num_steps: 20,
        guidance: 8,
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as any;
      throw new Error(err?.errors?.[0]?.message || `CF error ${res.status}`);
    }
    const buf = await res.arrayBuffer();
    return NextResponse.json({ result: `data:image/png;base64,${Buffer.from(buf).toString("base64")}` });
  } catch (err) {
    console.error("[bg-remover]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
