import { NextRequest, NextResponse } from "next/server";

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
    const reqBody: Record<string, unknown> = {
      prompt: prompt || "clean background, empty space, seamless fill, professional photo",
      image: toUint8Array(imageBase64),
      strength: 0.99,
      num_steps: 20,
    };
    if (maskBase64) reqBody.mask = toUint8Array(maskBase64);

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
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
