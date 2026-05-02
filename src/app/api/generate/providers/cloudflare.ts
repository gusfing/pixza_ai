/**
 * Cloudflare Workers AI Provider for Generate API Route
 *
 * Two API formats depending on model generation:
 * - Legacy models (FLUX Schnell, SDXL, SD img2img): JSON with image as Uint8Array number[]
 * - FLUX.2 models (klein-4b, klein-9b, flux-2-dev): multipart/form-data
 */
import { GenerationInput, GenerationOutput } from "@/lib/providers/types";

// FLUX.2 models require multipart/form-data
const FLUX2_MODELS = new Set([
  "@cf/black-forest-labs/flux-2-klein-4b",
  "@cf/black-forest-labs/flux-2-klein-9b",
  "@cf/black-forest-labs/flux-2-dev",
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
  const hasImage = !!(input.images && input.images.length > 0);

  try {
    let fetchBody: BodyInit;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiToken}`,
    };

    if (isFlux2) {
      // FLUX.2 models: multipart/form-data
      const form = new FormData();
      form.append("prompt", input.prompt || "");
      if (input.parameters?.num_steps !== undefined) form.append("num_steps", String(Number(input.parameters.num_steps)));
      if (input.parameters?.seed !== undefined && input.parameters.seed !== "") form.append("seed", String(Number(input.parameters.seed)));
      // width/height defaults
      form.append("width", "1024");
      form.append("height", "1024");
      if (hasImage) {
        const base64Raw = input.images![0];
        const base64Data = base64Raw.includes(",") ? base64Raw.split(",")[1] : base64Raw;
        const imgBuffer = Buffer.from(base64Data, "base64");
        form.append("image", new Blob([imgBuffer], { type: "image/png" }), "image.png");
        if (input.parameters?.strength !== undefined) form.append("strength", String(Number(input.parameters.strength)));
      }
      fetchBody = form;
      // Do NOT set Content-Type — let fetch set it with boundary
    } else {
      // Legacy models: JSON with image as Uint8Array number[]
      const body: Record<string, unknown> = {
        prompt: input.prompt || "",
        num_steps: 4,
      };
      if (input.parameters) {
        if (input.parameters.num_steps !== undefined) body.num_steps = Number(input.parameters.num_steps);
        if (input.parameters.guidance !== undefined) body.guidance = Number(input.parameters.guidance);
        if (input.parameters.seed !== undefined && input.parameters.seed !== "") body.seed = Number(input.parameters.seed);
      }
      if (hasImage) {
        body.image = base64ToUint8Array(input.images![0]);
        if (input.parameters?.strength !== undefined) body.strength = Number(input.parameters.strength);
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
      const arrayBuffer = await response.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString("base64");
      return {
        success: true,
        outputs: [{ type: "image", data: `data:${contentTypeResponse};base64,${base64String}` }],
      };
    }

    const result = await response.json();

    if (!result.success) {
      const cfMsg = result.errors?.[0]?.message || JSON.stringify(result.errors);
      return { success: false, error: `Cloudflare AI Error: ${cfMsg}` };
    }

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
