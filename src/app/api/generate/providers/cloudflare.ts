/**
 * Cloudflare Workers AI Provider for Generate API Route
 *
 * NOTE: Cloudflare REST API requires multipart/form-data for image inputs.
 * JSON byte arrays and image_b64 are NOT reliably supported across all models.
 */
import { GenerationInput, GenerationOutput } from "@/lib/providers/types";

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

    let fetchBody: BodyInit;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiToken}`,
    };

    if (hasImage) {
      // Cloudflare REST API requires multipart/form-data for image inputs
      const form = new FormData();
      form.append("prompt", input.prompt || "");

      // Convert base64 data URL to binary buffer
      const base64Raw = input.images![0];
      const base64Data = base64Raw.includes(",") ? base64Raw.split(",")[1] : base64Raw;
      const imgBuffer = Buffer.from(base64Data, "base64");
      form.append("image", new Blob([imgBuffer], { type: "image/png" }), "image.png");

      // Add optional parameters
      if (input.parameters) {
        if (input.parameters.num_steps !== undefined) form.append("num_steps", String(Number(input.parameters.num_steps)));
        if (input.parameters.guidance !== undefined) form.append("guidance", String(Number(input.parameters.guidance)));
        if (input.parameters.seed !== undefined && input.parameters.seed !== "") form.append("seed", String(Number(input.parameters.seed)));
        if (input.parameters.strength !== undefined) form.append("strength", String(Number(input.parameters.strength)));
      }

      fetchBody = form;
      // Do NOT set Content-Type — browser/Node sets it automatically with boundary for FormData
    } else {
      // Text-to-image: use JSON (no image input)
      const body: Record<string, unknown> = {
        prompt: input.prompt,
        num_steps: 4, // default for FLUX Schnell
      };

      if (input.parameters) {
        if (input.parameters.num_steps !== undefined) body.num_steps = Number(input.parameters.num_steps);
        if (input.parameters.guidance !== undefined) body.guidance = Number(input.parameters.guidance);
        if (input.parameters.seed !== undefined && input.parameters.seed !== "") body.seed = Number(input.parameters.seed);
      }

      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(body);
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: fetchBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Cloudflare API error: ${response.status}`;
      try {
        const errJson = JSON.parse(errorText);
        const cfMsg = errJson?.errors?.[0]?.message;
        if (cfMsg) errorMsg = `Cloudflare: ${cfMsg}`;
      } catch { /* use raw text */ }
      return { success: false, error: errorMsg };
    }

    // Check content-type — binary image or JSON wrapper
    const contentTypeResponse = response.headers.get("content-type") || "";

    if (contentTypeResponse.includes("image/")) {
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
