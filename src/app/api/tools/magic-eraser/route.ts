/**
 * Magic Eraser API
 * Uses Cloudflare SD v1.5 Inpainting — free, no cost
 * Accepts: image + mask (painted area = what to erase)
 * Returns: image with erased area filled naturally
 */
import { NextRequest, NextResponse } from "next/server";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";

function base64ToUint8Array(base64: string): number[] {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  return Array.from(new Uint8Array(Buffer.from(clean, "base64")));
}

export async function POST(req: NextRequest) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return NextResponse.json({ error: "Cloudflare not configured" }, { status: 500 });
  }

  let imageBase64: string, maskBase64: string, fillPrompt: string;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    maskBase64  = body.maskBase64;
    fillPrompt  = body.fillPrompt || "seamless background fill, natural texture, clean";
    if (!imageBase64) throw new Error("imageBase64 required");
    if (!maskBase64)  throw new Error("maskBase64 required");
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid body" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fillPrompt,
          image: base64ToUint8Array(imageBase64),
          mask:  base64ToUint8Array(maskBase64),
          strength: 0.99,
          num_steps: 20,
          guidance: 7.5,
          disable_safety_checker: true,
        }),
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
    console.error("[magic-eraser]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Magic eraser failed" },
      { status: 500 }
    );
  }
}
