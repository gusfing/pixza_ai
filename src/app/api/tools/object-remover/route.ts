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
  let imageBase64: string, prompt: string | undefined;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    prompt = body.prompt;
    if (!imageBase64) throw new Error("No image");
  } catch {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }
  try {
    const fillPrompt = prompt
      ? `${prompt}, seamless fill, natural background, professional photo`
      : "clean background, seamless fill, natural texture, professional photo, no objects";

    const res = await cfJson(CF_ACCOUNT_ID, CF_API_TOKEN,
      "@cf/runwayml/stable-diffusion-v1-5-img2img",
      {
        prompt: fillPrompt,
        image: toUint8Array(imageBase64),
        strength: 0.75,
        num_steps: 20,
        guidance: 7.5,
        disable_safety_checker: true,
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as any;
      throw new Error(err?.errors?.[0]?.message || `CF error ${res.status}`);
    }
    const buf = await res.arrayBuffer();
    return NextResponse.json({ result: `data:image/png;base64,${Buffer.from(buf).toString("base64")}` });
  } catch (err) {
    console.error("[object-remover]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
