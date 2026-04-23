/**
 * Cloudflare Workers AI Provider for Generate API Route
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
    // Build request body
    const body: Record<string, any> = {
      prompt: input.prompt,
    };

    // Add optional parameters if they exist
    // Add optional parameters if they exist
    if (input.parameters) {
      if (input.parameters.num_steps !== undefined) body.num_steps = Number(input.parameters.num_steps);
      if (input.parameters.guidance !== undefined) body.guidance = Number(input.parameters.guidance);
      if (input.parameters.seed !== undefined && input.parameters.seed !== "") body.seed = Number(input.parameters.seed);
    }

    const hasImage = input.images && input.images.length > 0;

    // Only include strength if we actually have an image (otherwise Cloudflare throws AiError 3043)
    if (hasImage && input.parameters?.strength !== undefined) {
      body.strength = Number(input.parameters.strength);
    }

    // Handle image input for img2img if present
    if (hasImage) {
      // Cloudflare REST API (which uses Pydantic backend) expects base64 strings for 'bytes' fields
      const base64Data = input.images![0].split(",").pop() || input.images![0];
      // The REST API expects 'image_b64' parameter for base64 encoded strings
      // rather than the 'image' parameter which expects raw arrays in bindings
      body.image_b64 = base64Data;
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
      return {
        success: false,
        error: `Cloudflare API error: ${response.status} - ${errorText}`,
      };
    }

    // Check the response content-type to see if it's a binary image or a JSON object
    const contentTypeResponse = response.headers.get("content-type") || "";

    if (contentTypeResponse.includes("image/")) {
      // Success! Cloudflare returned a raw binary image blob
      const arrayBuffer = await response.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString("base64");
      return {
        success: true,
        outputs: [
          {
            type: "image",
            data: `data:${contentTypeResponse};base64,${base64String}`,
          },
        ],
      };
    }

    // Otherwise, expect a JSON response (like an error or a wrapped base64 string)
    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: `Cloudflare AI Error: ${JSON.stringify(result.errors)}`,
      };
    }

    // Some models do return the image wrapped inside JSON
    const imageBase64 = result.result?.image;

    if (!imageBase64) {
      return {
        success: false,
        error: "No image data in Cloudflare JSON response",
      };
    }
    return {
      success: true,
      outputs: [
        {
          type: "image",
          data: `data:image/png;base64,${imageBase64}`,
        },
      ],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Cloudflare generation failed",
    };
  }
}

