/**
 * Cloudflare Workers AI Provider for Generate API Route
 *
 * REST API image format: JSON with image as number array (Uint8Array spread)
 * This is different from Workers bindings which accept ArrayBuffer directly.
 */
import { GenerationInput, GenerationOutput } from "@/lib/providers/types";

function base64ToUint8Array(base64: string): number[] {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  const buf = Buffer.from(clean, "base64");
  return Array.from(new Uint8Array(buf));
}

export async function generateWithCloudflare(
  requestId: string,
  accountId: string,
  apiToken: string,
  input: GenerationInput
): Promise<GenerationOutput> {
  const modelId = input.model.id;
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;

  try {
    const hasImage = input.images && input.images.length > 0;

    // Build JSON body — Cloudflare REST API always expects JSON
    const body: Record<string, unknown> = {
      prompt: input.prompt || "",
    };

    // Add optional parameters
    if (input.parameters) {
      if (input.parameters.num_steps !== undefined) body.num_steps = Number(input.parameters.num_steps);
      if (input.parameters.guidance !== undefined) body.guidance = Number(input.parameters.guidance);
      if (input.parameters.seed !== undefined && input.parameters.seed !== "") body.seed = Number(input.parameters.seed);
    }

    if (hasImage) {
      // REST API expects image as a number array (Uint8Array spread)
      body.image = base64ToUint8Array(input.images![0]);
      // Only include strength for img2img models
      if (input.parameters?.strength !== undefined) {
        body.strength = Number(input.parameters.strength);
      }
    } else {
      // Text-to-image default steps
      if (body.num_steps === undefined) body.num_steps = 4;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

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
