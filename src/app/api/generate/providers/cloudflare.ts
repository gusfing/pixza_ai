/**
 * Cloudflare Workers AI Provider for Generate API Route
 *
 * Three API formats:
 * - FLUX.2 models (klein-4b, klein-9b, flux-2-dev): multipart/form-data
 *   - flux-2-dev supports image-to-image via input_image_0..3 fields
 * - Legacy img2img (SD v1.5 img2img, inpainting): JSON + Uint8Array image field
 * - Legacy text-to-image (FLUX Schnell, SDXL, etc.): JSON
 */
import { GenerationInput, GenerationOutput } from "@/lib/providers/types";
import { base64ToNodeBuffer, buildMultipart, cfJson } from "@/lib/cf-multipart";

// FLUX.2 models — use multipart/form-data
const FLUX2_MODELS = new Set([
  "@cf/black-forest-labs/flux-2-klein-4b",
  "@cf/black-forest-labs/flux-2-klein-9b",
  "@cf/black-forest-labs/flux-2-dev",
]);

// Legacy img2img models — JSON with Uint8Array image field
const LEGACY_IMG2IMG_MODELS = new Set([
  "@cf/runwayml/stable-diffusion-v1-5-img2img",
  "@cf/runwayml/stable-diffusion-v1-5-inpainting",
]);

function base64ToUint8Array(base64: string): number[] {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  return Array.from(new Uint8Array(Buffer.from(clean, "base64")));
}

export async function generateWithCloudflare(
  requestId: string,
  accountId: string,
  apiToken: string,
  input: GenerationInput
): Promise<GenerationOutput> {
  const modelId = input.model.id;
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;
  const isFlux2 = FLUX2_MODELS.has(modelId);
  const isLegacyImg2Img = LEGACY_IMG2IMG_MODELS.has(modelId);
  const hasImage = !!(input.images && input.images.length > 0);

  try {
    let fetchBody: BodyInit;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiToken}`,
    };

    if (isFlux2) {
      // ── FLUX.2 models: multipart/form-data (manual, no Blob) ─
      const fields: Record<string, string> = {
        prompt: input.prompt || "",
        width: "1024",
        height: "1024",
      };
      if (input.parameters) {
        if (input.parameters.num_steps !== undefined) fields.steps = String(Number(input.parameters.num_steps));
        if (input.parameters.seed !== undefined && input.parameters.seed !== "") fields.seed = String(Number(input.parameters.seed));
      }
      if (hasImage && input.parameters?.strength !== undefined) {
        fields.strength = String(Number(input.parameters.strength));
      }

      const files: { fieldName: string; buf: Buffer; mime?: string; filename?: string }[] = [];
      if (hasImage) {
        input.images!.slice(0, 4).forEach((img, i) => {
          files.push({ fieldName: `input_image_${i}`, buf: base64ToNodeBuffer(img), filename: `image_${i}.png` });
        });
      }

      const { body, contentType } = buildMultipart(fields, files);
      fetchBody = body as unknown as BodyInit;
      headers["Content-Type"] = contentType;

    } else if (isLegacyImg2Img && hasImage) {
      // ── Legacy img2img: JSON with Uint8Array ─────────────────
      const body: Record<string, unknown> = {
        prompt: input.prompt || "",
        image: Array.from(new Uint8Array(base64ToNodeBuffer(input.images![0]))),
        num_steps: 20,
        strength: 0.75,
      };
      if (input.parameters) {
        if (input.parameters.num_steps !== undefined) body.num_steps = Number(input.parameters.num_steps);
        if (input.parameters.strength !== undefined) body.strength = Number(input.parameters.strength);
        if (input.parameters.guidance !== undefined) body.guidance = Number(input.parameters.guidance);
        if (input.parameters.seed !== undefined && input.parameters.seed !== "") body.seed = Number(input.parameters.seed);
      }
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(body);

    } else {
      // ── Text-to-image: JSON (no image input) ─────────────────
      const body: Record<string, unknown> = {
        prompt: input.prompt || "",
        num_steps: 4,
      };
      if (input.parameters) {
        if (input.parameters.num_steps !== undefined) body.num_steps = Number(input.parameters.num_steps);
        if (input.parameters.guidance !== undefined) body.guidance = Number(input.parameters.guidance);
        if (input.parameters.seed !== undefined && input.parameters.seed !== "") body.seed = Number(input.parameters.seed);
      }
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(body);
    }

    const response = await fetch(url, { method: "POST", headers, body: fetchBody });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Cloudflare API error: ${response.status}`;
      try {
        const errJson = JSON.parse(errorText);
        const cfMsg = errJson?.errors?.[0]?.message;
        if (cfMsg) errorMsg = `Cloudflare: ${cfMsg}`;
      } catch { /* use raw */ }
      return { success: false, error: errorMsg };
    }

    const contentTypeResponse = response.headers.get("content-type") || "";

    if (contentTypeResponse.includes("image/")) {
      // Binary image response
      const arrayBuffer = await response.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString("base64");
      return {
        success: true,
        outputs: [{ type: "image", data: `data:${contentTypeResponse};base64,${base64String}` }],
      };
    }

    // JSON response
    const result = await response.json();

    if (!result.success) {
      const cfMsg = result.errors?.[0]?.message || JSON.stringify(result.errors);
      return { success: false, error: `Cloudflare AI Error: ${cfMsg}` };
    }

    // FLUX.2 returns base64 in result.image
    const imageBase64 = result.result?.image;
    if (!imageBase64) {
      return { success: false, error: "No image data in Cloudflare response" };
    }

    return {
      success: true,
      outputs: [{ type: "image", data: `data:image/png;base64,${imageBase64}` }],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Cloudflare generation failed",
    };
  }
}
