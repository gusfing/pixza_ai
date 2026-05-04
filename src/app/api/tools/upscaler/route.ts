import { NextRequest, NextResponse } from "next/server";
import { base64ToNodeBuffer, cfFlux2 } from "@/lib/cf-multipart";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";
const FLUX2_DEV = "@cf/black-forest-labs/flux-2-dev";

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
    const res = await cfFlux2(CF_ACCOUNT_ID, CF_API_TOKEN, FLUX2_DEV,
      { prompt: "enhance this image: increase sharpness, improve clarity, boost detail, professional quality, 4k resolution, maintain original composition and colors", width: "1024", height: "1024", steps: "20" },
      [{ fieldName: "input_image_0", buf: base64ToNodeBuffer(imageBase64), filename: "image.png" }]
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
