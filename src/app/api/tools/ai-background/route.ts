import { NextRequest, NextResponse } from "next/server";
import { base64ToNodeBuffer, cfFlux2, cfJson } from "@/lib/cf-multipart";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN  ?? "";
const FLUX2_DEV = "@cf/black-forest-labs/flux-2-dev";

async function flux2WithImage(imageBase64: string, prompt: string, steps = "20"): Promise<string> {
  const res = await cfFlux2(CF_ACCOUNT_ID, CF_API_TOKEN, FLUX2_DEV,
    { prompt, width: "1024", height: "1024", steps },
    [{ fieldName: "input_image_0", buf: base64ToNodeBuffer(imageBase64), filename: "image.png" }]
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

async function flux2TextOnly(prompt: string): Promise<string> {
  const res = await cfFlux2(CF_ACCOUNT_ID, CF_API_TOKEN, FLUX2_DEV,
    { prompt, width: "1024", height: "1024", steps: "4" }
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
    if (mode === "remove-only") {
      const cutout = await flux2WithImage(imageBase64, "remove the background, replace with pure white background, keep subject intact, product photography");
      return NextResponse.json({ cutout, background: null });
    }
    const [cutout, background] = await Promise.all([
      flux2WithImage(imageBase64, `keep the exact subject from the reference image, place it on: ${prompt}, professional product photography, high quality`),
      flux2TextOnly(`${prompt}, product photography background, no product, no people, professional, high quality, 4k`),
    ]);
    return NextResponse.json({ cutout, background });
  } catch (err) {
    console.error("[ai-background]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
