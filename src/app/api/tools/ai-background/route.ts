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
    const cutoutRes = await cfJson(CF_ACCOUNT_ID, CF_API_TOKEN,
      "@cf/runwayml/stable-diffusion-v1-5-img2img",
      {
        prompt: `${prompt}, product photography, professional, high quality, clean background`,
        image: toUint8Array(imageBase64),
        strength: 0.6,
        num_steps: 20,
        guidance: 8,
        disable_safety_checker: true,
      }
    );
    if (!cutoutRes.ok) {
      const err = await cutoutRes.json().catch(() => ({})) as any;
      throw new Error(err?.errors?.[0]?.message || `CF error ${cutoutRes.status}`);
    }
    const cutoutBuf = await cutoutRes.arrayBuffer();
    const cutout = `data:image/png;base64,${Buffer.from(cutoutBuf).toString("base64")}`;

    if (mode === "remove-only") return NextResponse.json({ cutout, background: null });

    const bgRes = await cfJson(CF_ACCOUNT_ID, CF_API_TOKEN,
      "@cf/black-forest-labs/flux-1-schnell",
      {
        prompt: `${prompt}, product photography background, no product, no people, professional, high quality`,
        num_steps: 4,
      }
    );
    if (!bgRes.ok) return NextResponse.json({ cutout, background: null });

    const bgBuf = await bgRes.arrayBuffer();
    return NextResponse.json({ cutout, background: `data:image/png;base64,${Buffer.from(bgBuf).toString("base64")}` });
  } catch (err) {
    console.error("[ai-background]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
