/**
 * Object Remover API
 * Uses Cloudflare SD inpainting to remove objects from images
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

  let imageBase64: string, maskBase64: string | undefined, prompt: string | undefined;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    maskBase64  = body.maskBase64;
    prompt      = body.prompt;
    if (!imageBase64) throw new Error("No image");
  } catch {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  try {
    // Use SD inpainting — fill masked area with background
    const inpaintPrompt = prompt || "clean background, empty space, seamless fill, professional photo";

    const reqBody: any = {
      prompt: inpaintPrompt,
      image: toByteArray(imageBase64),
      strength: 0.99,
      num_steps: 20,
    };

    if (maskBase64) {
      reqBody.mask = toByteArray(maskBase64);
    }

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
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
    console.error("[object-remover]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Object removal failed" },
      { status: 500 }
    );
  }
}
