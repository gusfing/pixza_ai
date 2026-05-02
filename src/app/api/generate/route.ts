/**
 * Generate API Route
 * 
 * TIMEOUT CONFIGURATION:
 * - maxDuration: Only applies on Vercel, not locally
 * - AbortSignal.timeout: Controls outgoing fetch to providers
 * - For local development, server.requestTimeout must be set in server.js (Node.js default is 5 minutes)
 * 
 * FAL.AI QUEUE API NOTE:
 * Uses generateWithFalQueue with async queue submission + polling.
 * Images are uploaded to fal CDN before submission to avoid payload size issues.
 */
import { NextRequest, NextResponse } from "next/server";
import { GenerateRequest, GenerateResponse, ModelType, SelectedModel, ProviderType } from "@/types";
import { GenerationInput, ModelCapability } from "@/lib/providers/types";
import { generateWithGemini, generateWithGeminiVideo } from "./providers/gemini";
import { generateWithReplicate } from "./providers/replicate";
import { clearFalInputMappingCache as _clearFalInputMappingCache, generateWithFalQueue } from "./providers/fal";
import { generateWithKie } from "./providers/kie";
import { generateWithWaveSpeed } from "./providers/wavespeed";
import { generateWithCloudflare } from "./providers/cloudflare";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { freeLimiter, proLimiter, checkRateLimit } from "@/lib/ratelimit";
import { uploadToStorage, contentTypeForOutput } from "@/lib/storage";
import { wpGetMe, wpDeductCredits, CREDIT_COSTS } from "@/lib/wordpress";
// Re-export for backward compatibility (test file imports from route)
export const clearFalInputMappingCache = _clearFalInputMappingCache;

export const maxDuration = 300; // 5 minute timeout (Vercel hobby plan limit)
export const dynamic = 'force-dynamic'; // Ensure this route is always dynamic


/**
 * Extended request format that supports both legacy and multi-provider requests
 */
interface MultiProviderGenerateRequest {
  images: string[];
  prompt: string;
  aspectRatio?: any;
  resolution?: any;
  model?: any;
  useGoogleSearch?: boolean;
  useImageSearch?: boolean;
  mediaType?: "image" | "video" | "3d" | "audio";
  selectedModel?: SelectedModel;
  parameters?: Record<string, unknown>;
  dynamicInputs?: Record<string, string | string[]>;
}


function buildMediaResponse(output: { type: string; data: string; url?: string }): NextResponse {
  if (output.type === "3d") {
    return NextResponse.json<GenerateResponse>({
      success: true,
      model3dUrl: output.url,
      contentType: "3d",
    });
  }

  if (output.type === "video") {
    const isLarge = !output.data && output.url;
    return NextResponse.json<GenerateResponse>({
      success: true,
      video: isLarge ? undefined : output.data,
      videoUrl: isLarge ? output.url : undefined,
      contentType: "video",
    });
  }

  if (output.type === "audio") {
    const isLarge = !output.data && output.url;
    return NextResponse.json<GenerateResponse>({
      success: true,
      audio: isLarge ? undefined : output.data,
      audioUrl: isLarge ? output.url : undefined,
      contentType: "audio",
    });
  }

  return NextResponse.json<GenerateResponse>({
    success: true,
    image: output.data,
    contentType: "image",
  });
}

async function buildMediaResponseWithStorage(
  output: { type: string; data: string; url?: string },
  generationId: string | null,
  userId: string | null,
  wpUserId?: number | null,
  creditCost?: number,
  mediaType?: string,
  modelId?: string,
  provider?: string,
): Promise<NextResponse> {
  let storedUrl: string | undefined = output.url;

  // If we have base64 data and R2 is configured, upload it
  if (process.env.R2_BUCKET_NAME && output.data?.startsWith("data:")) {
    try {
      const ext = output.type === "video" ? "mp4" : output.type === "audio" ? "mp3" : output.type === "3d" ? "glb" : "png";
      const key = `generations/${userId ?? "anon"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      storedUrl = await uploadToStorage(output.data, key, contentTypeForOutput(output.type));
    } catch (e) {
    }
  }

  // Update record in database
  if (generationId && userId) {
    try {
      await db.generation.update({
        where: { id: generationId },
        data: { 
          status: "done", 
          outputUrl: storedUrl ?? output.url ?? null,
        },
      });
    } catch (e) {
    }
  }

  // ── Deduct WP credits on success ─────────────────────────
  if (wpUserId && process.env.WP_API_SECRET) {
    try {
      const cost = creditCost ?? CREDIT_COSTS[mediaType ?? "image"] ?? 1;
      await wpDeductCredits(wpUserId, cost, mediaType ?? "image", modelId, provider);
    } catch (e) {
      // Non-fatal — generation already succeeded, just log
      console.warn("[credits] deduction failed:", e instanceof Error ? e.message : e);
    }
  }

  return buildMediaResponse({ ...output, url: storedUrl });
}

function capabilitiesForMediaType(mediaType?: string): ModelCapability[] {
  const map: Record<string, ModelCapability[]> = {
    audio: ["text-to-audio"],
    video: ["text-to-video"],
    "3d": ["text-to-3d"],
  };
  return map[mediaType ?? ""] ?? ["text-to-image"];
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  // ── Auth & rate limiting ──────────────────────────────────
  const session = await auth();
  let userId = session?.user?.id ?? null;
  let plan = (session?.user as { plan?: string })?.plan ?? "FREE";
  let wpUserId: number | null = null; // WP numeric user ID for credit deduction

  if (!userId) {
    const wpToken = request.cookies.get("pixza_token")?.value;
    if (wpToken) {
      try {
        const me = await wpGetMe(wpToken);
        if (me) {
          userId = me.id.toString();
          wpUserId = me.id;
          plan = me.meta?.plan?.toUpperCase() || "FREE";
          if (plan === "AGENCY") plan = "PRO";
        }
      } catch (e) {
      }
    }
  }

  // Allow unauthenticated requests but apply strict rate limit by IP
  const identifier = userId ?? (request.headers.get("x-forwarded-for") ?? "anon");
  const limiter = plan === "PRO" ? proLimiter : freeLimiter;
  const { success: rateLimitOk, remaining } = await checkRateLimit(limiter, `gen:${identifier}`);

  if (!rateLimitOk) {
    return NextResponse.json<GenerateResponse>(
      { success: false, error: `Rate limit exceeded. ${plan === "FREE" ? "Upgrade to Pro for more generations." : "Try again later."}` },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  // ── Parse request body once ──────────────────────────────
  let body: MultiProviderGenerateRequest;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json<GenerateResponse>({ success: false, error: "Invalid JSON in request body" }, { status: 400 });
  }

  // ── Create pending generation record ─────────────────────
  let generationId: string | null = null;
  if (userId) {
    try {
      const gen = await db.generation.create({
        data: {
          userId,
          prompt: body.prompt ?? "",
          mode: body.mediaType ?? "image",
          model: body.selectedModel?.modelId ?? body.model ?? "unknown",
          provider: body.selectedModel?.provider ?? "gemini",
          outputType: body.mediaType ?? "image",
          status: "pending",
          metadata: { aspectRatio: body.aspectRatio, parameters: body.parameters } as any,
        },
      });
      generationId = gen.id;
    } catch (e) {
    }
  }

  try {
    const {
      images,
      prompt,
      model = "nano-banana-pro",
      aspectRatio,
      resolution,
      useGoogleSearch,
      useImageSearch,
      selectedModel,
      parameters,
      dynamicInputs,
      mediaType,
    } = body;

    // Prompt is required unless:
    // - Provided via dynamicInputs
    // - Images are provided (image-to-video/image-to-image models)
    // - Dynamic inputs contain image frames (first_frame, last_frame, etc.)
    const hasPrompt = prompt || (dynamicInputs && (
      typeof dynamicInputs.prompt === 'string'
        ? dynamicInputs.prompt
        : Array.isArray(dynamicInputs.prompt) && dynamicInputs.prompt.length > 0
    ));
    const hasImages = (images && images.length > 0);
    const hasImageInputs = dynamicInputs && Object.keys(dynamicInputs).some(key =>
      key.includes('frame') || key.includes('image')
    );

    if (!hasPrompt && !hasImages && !hasImageInputs) {
      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: "Prompt or image input is required",
        },
        { status: 400 }
      );
    }

    // Determine which provider to use
    const provider: ProviderType = selectedModel?.provider || "gemini";
    const resolvedModelId = selectedModel?.modelId || model;
    // Premium Model Guard - Restrict expensive APIs to PRO / AGENCY plans
    // We allow models marked as 'isFree' to be used by everyone.
    const FREE_MODELS = [
      "z-image",
      "nano-banana",
      "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      "@cf/bytedance/stable-diffusion-xl-lightning",
      "@cf/lykon/dreamshaper-8-lcm",
      "@cf/black-forest-labs/flux-1-schnell",
      "@cf/runwayml/stable-diffusion-v1-5-img2img",
    ];

    // WaveSpeed is a premium provider but these specific models are allowed on Pro
    const PREMIUM_PROVIDERS = ["replicate", "fal", "kie"];
    // wavespeed is allowed for Pro+ — remove from premium providers, add specific models to premium list
    const PREMIUM_MODELS = [
      // Gemini premium
      "nano-banana-pro",
      "nano-banana-2",
      "veo-2.0-generate-001",
      "veo-3.0-generate-preview",
      "veo-3.1/text-to-video",
      "veo-3.1/image-to-video",
      // WaveSpeed premium (Pro+)
      "wavespeed-ai/flux-dev-ultra-fast",
      "wavespeed-ai/flux-dev/fp8",
      "wavespeed-ai/wan-2.1-t2v-480p",
      "wavespeed-ai/seedance-1.5-lite-t2v-480p",
      "wavespeed-ai/seedance-1.5-pro-t2v-720p",
      // Agency only
      "wavespeed-ai/seedance-2.0-t2v-720p",
    ];

    const isFreeModel = FREE_MODELS.includes(resolvedModelId);
    const isPremiumProvider = PREMIUM_PROVIDERS.includes(provider) && !isFreeModel;
    const isPremiumModel = PREMIUM_MODELS.includes(resolvedModelId);

    if ((isPremiumProvider || isPremiumModel) && plan !== "PRO" && plan !== "AGENCY") {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: "This premium model requires a PRO subscription. Please upgrade your plan to unlock." },
        { status: 403 }
      );
    }

    // Route to appropriate provider
    // Note: replicate and fal are disabled — their blocks below use `if (false && ...)` guards

    if (false && provider === "replicate") {
      if (!selectedModel?.modelId || !selectedModel?.displayName) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "selectedModel with modelId and displayName is required for Replicate" },
          { status: 400 }
        );
      }

      const replicateApiKey = process.env.REPLICATE_API_KEY;
      if (!replicateApiKey) {
        return NextResponse.json<GenerateResponse>(
          {
            success: false,
            error: "Replicate API key not configured. Platform administrator must configure REPLICATE_API_KEY.",
          },
          { status: 500 }
        );
      }

      // Keep Data URIs as-is since localhost URLs won't work (provider can't reach them)
      const processedImages: string[] = images ? [...images] : [];

      // Process dynamicInputs: filter empty values, keep Data URIs
      let processedDynamicInputs: Record<string, string | string[]> | undefined = undefined;

      if (dynamicInputs) {
        processedDynamicInputs = {};
        for (const key of Object.keys(dynamicInputs)) {
          const value = dynamicInputs[key];

          // Skip empty/null/undefined values (arrays pass through)
          if (value === null || value === undefined || value === '') {
            continue;
          }

          // Keep the value as-is (Data URIs work with Replicate)
          processedDynamicInputs[key] = value;
        }
      }

      // Build generation input
      const genInput: GenerationInput = {
        model: {
          id: selectedModel.modelId,
          name: selectedModel.displayName,
          provider: "replicate",
          capabilities: capabilitiesForMediaType(mediaType),
          description: null,
        },
        prompt: prompt || "",
        images: processedImages,
        parameters,
        dynamicInputs: processedDynamicInputs,
      };

      const result = await generateWithReplicate(requestId, replicateApiKey, genInput);

      if (!result.success) {
        return NextResponse.json<GenerateResponse>(
          {
            success: false,
            error: result.error || "Generation failed",
          },
          { status: 500 }
        );
      }

      // Return first output
      const output = result.outputs?.[0];
      if (!output?.data && !output?.url) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "No output in generation result" },
          { status: 500 }
        );
      }

      return buildMediaResponseWithStorage(output, generationId, userId, wpUserId, CREDIT_COSTS[mediaType ?? "image"] ?? 1, mediaType, resolvedModelId, provider);
    }

    if (false && provider === "fal") {
      if (!selectedModel?.modelId || !selectedModel?.displayName) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "selectedModel with modelId and displayName is required for fal.ai" },
          { status: 400 }
        );
      }

      const falApiKey = process.env.FAL_API_KEY || null;

      if (!falApiKey) {
      }

      // Pass images as-is; generateWithFalQueue uploads base64 to CDN internally
      const processedImages: string[] = images ? [...images] : [];

      // Process dynamicInputs: filter empty values
      let processedDynamicInputs: Record<string, string | string[]> | undefined = undefined;

      if (dynamicInputs) {
        processedDynamicInputs = {};
        for (const key of Object.keys(dynamicInputs)) {
          const value = dynamicInputs[key];

          // Skip empty/null/undefined values (arrays pass through)
          if (value === null || value === undefined || value === '') {
            continue;
          }

          // Keep the value as-is; CDN upload happens in generateWithFalQueue
          processedDynamicInputs[key] = value;
        }
      }

      // Build generation input
      const genInput: GenerationInput = {
        model: {
          id: selectedModel.modelId,
          name: selectedModel.displayName,
          provider: "fal",
          capabilities: capabilitiesForMediaType(mediaType),
          description: null,
        },
        prompt: prompt || "",
        images: processedImages,
        parameters,
        dynamicInputs: processedDynamicInputs,
      };

      const result = await generateWithFalQueue(requestId, falApiKey, genInput);

      if (!result.success) {
        return NextResponse.json<GenerateResponse>(
          {
            success: false,
            error: result.error || "Generation failed",
          },
          { status: 500 }
        );
      }

      // Return first output
      const output = result.outputs?.[0];
      if (!output?.data && !output?.url) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "No output in generation result" },
          { status: 500 }
        );
      }

      return buildMediaResponseWithStorage(output, generationId, userId, wpUserId, CREDIT_COSTS[mediaType ?? "image"] ?? 1, mediaType, resolvedModelId, provider);
    }

    if (provider === "kie") {
      if (!selectedModel?.modelId || !selectedModel?.displayName) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "selectedModel with modelId and displayName is required for Kie.ai" },
          { status: 400 }
        );
      }

      const kieApiKey = process.env.KIE_API_KEY;
      if (!kieApiKey) {
        return NextResponse.json<GenerateResponse>(
          {
            success: false,
            error: "Kie.ai API key not configured. Platform administrator must configure KIE_API_KEY.",
          },
          { status: 500 }
        );
      }

      // Process images - Kie requires URLs, we'll upload base64 images in generateWithKie
      const processedImages: string[] = images ? [...images] : [];

      // Process dynamicInputs: filter empty values
      let processedDynamicInputs: Record<string, string | string[]> | undefined = undefined;

      if (dynamicInputs) {
        processedDynamicInputs = {};
        for (const key of Object.keys(dynamicInputs)) {
          const value = dynamicInputs[key];

          // Skip empty/null/undefined values
          if (value === null || value === undefined || value === '') {
            continue;
          }

          processedDynamicInputs[key] = value;
        }
      }

      // Build generation input
      const genInput: GenerationInput = {
        model: {
          id: selectedModel.modelId,
          name: selectedModel.displayName,
          provider: "kie",
          capabilities: capabilitiesForMediaType(mediaType),
          description: null,
        },
        prompt: prompt || "",
        images: processedImages,
        parameters,
        dynamicInputs: processedDynamicInputs,
      };

      const result = await generateWithKie(requestId, kieApiKey, genInput);

      if (!result.success) {
        return NextResponse.json<GenerateResponse>(
          {
            success: false,
            error: result.error || "Generation failed",
          },
          { status: 500 }
        );
      }

      // Return first output
      const output = result.outputs?.[0];
      if (!output?.data && !output?.url) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "No output in generation result" },
          { status: 500 }
        );
      }

      return buildMediaResponseWithStorage(output, generationId, userId, wpUserId, CREDIT_COSTS[mediaType ?? "image"] ?? 1, mediaType, resolvedModelId, provider);
    }

    if (provider === "wavespeed") {
      if (!selectedModel?.modelId || !selectedModel?.displayName) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "selectedModel with modelId and displayName is required for WaveSpeed" },
          { status: 400 }
        );
      }

      const wavespeedApiKey = process.env.WAVESPEED_API_KEY;
      if (!wavespeedApiKey) {
        return NextResponse.json<GenerateResponse>(
          {
            success: false,
            error: "WaveSpeed API key not configured. Platform administrator must configure WAVESPEED_API_KEY.",
          },
          { status: 500 }
        );
      }

      // Keep Data URIs as-is since localhost URLs won't work
      const processedImages: string[] = images ? [...images] : [];

      // Process dynamicInputs: filter empty values
      let processedDynamicInputs: Record<string, string | string[]> | undefined = undefined;

      if (dynamicInputs) {
        processedDynamicInputs = {};
        for (const key of Object.keys(dynamicInputs)) {
          const value = dynamicInputs[key];

          // Skip empty/null/undefined values
          if (value === null || value === undefined || value === '') {
            continue;
          }

          processedDynamicInputs[key] = value;
        }
      }

      // Build generation input
      const genInput: GenerationInput = {
        model: {
          id: selectedModel.modelId,
          name: selectedModel.displayName,
          provider: "wavespeed",
          capabilities: capabilitiesForMediaType(mediaType),
          description: null,
        },
        prompt: prompt || "",
        images: processedImages,
        parameters,
        dynamicInputs: processedDynamicInputs,
      };

      const result = await generateWithWaveSpeed(requestId, wavespeedApiKey, genInput);

      if (!result.success) {
        return NextResponse.json<GenerateResponse>(
          {
            success: false,
            error: result.error || "Generation failed",
          },
          { status: 500 }
        );
      }

      // Return first output
      const output = result.outputs?.[0];
      if (!output?.data && !output?.url) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "No output in generation result" },
          { status: 500 }
        );
      }

      return buildMediaResponseWithStorage(output, generationId, userId, wpUserId, CREDIT_COSTS[mediaType ?? "image"] ?? 1, mediaType, resolvedModelId, provider);
    }

    if (provider === "cloudflare") {
      if (!selectedModel?.modelId || !selectedModel?.displayName) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "selectedModel with modelId and displayName is required for Cloudflare" },
          { status: 400 }
        );
      }

      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = process.env.CLOUDFLARE_API_TOKEN;

      if (!accountId || !apiToken) {
        return NextResponse.json<GenerateResponse>(
          {
            success: false,
            error: "Cloudflare credentials not configured. Platform administrator must configure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.",
          },
          { status: 500 }
        );
      }

      // Build generation input
      const genInput: GenerationInput = {
        model: {
          id: selectedModel.modelId,
          name: selectedModel.displayName,
          provider: "cloudflare",
          capabilities: capabilitiesForMediaType(mediaType),
          description: null,
        },
        prompt: prompt || "",
        images: images || [],
        parameters,
        dynamicInputs,
      };

      const result = await generateWithCloudflare(requestId, accountId, apiToken, genInput);

      if (!result.success) {
        return NextResponse.json<GenerateResponse>(
          {
            success: false,
            error: result.error || "Generation failed",
          },
          { status: 500 }
        );
      }

      // Return first output
      const output = result.outputs?.[0];
      if (!output?.data) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "No output in generation result" },
          { status: 500 }
        );
      }

      return buildMediaResponseWithStorage(output, generationId, userId, wpUserId, CREDIT_COSTS[mediaType ?? "image"] ?? 1, mediaType, resolvedModelId, provider);
    }

    // Default: Use Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: "Gemini API key not configured. Platform administrator must configure GEMINI_API_KEY.",
        },
        { status: 500 }
      );
    }

    // Use selectedModel.modelId if available (new format), fallback to legacy model field
    const geminiModel = (selectedModel?.modelId as ModelType) || model;

    // Resolve prompt: use top-level prompt, fall back to dynamicInputs.prompt
    // This handles cases where the prompt arrives via dynamicInputs instead of top-level
    let resolvedPrompt = prompt;
    if (!resolvedPrompt && dynamicInputs?.prompt) {
      resolvedPrompt = Array.isArray(dynamicInputs.prompt)
        ? dynamicInputs.prompt[0]
        : dynamicInputs.prompt;
    }
    // Validate: if a prompt was provided but isn't a string (corrupted data), return clear error
    // If no prompt provided but images exist, that's valid (image-to-image)
    if (resolvedPrompt !== undefined && resolvedPrompt !== null && typeof resolvedPrompt !== 'string') {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: "prompt must be a string" },
        { status: 400 }
      );
    }

    // Check if this is a Veo video model request
    if (selectedModel?.modelId?.startsWith("veo-")) {
      // Merge negative prompt from dynamic inputs (connected handle) into parameters
      const veoParams = { ...(parameters || {}) };
      if (dynamicInputs?.negative_prompt) {
        const neg = Array.isArray(dynamicInputs.negative_prompt)
          ? dynamicInputs.negative_prompt[0]
          : dynamicInputs.negative_prompt;
        if (neg) veoParams.negativePrompt = neg;
      }
      const result = await generateWithGeminiVideo(
        requestId,
        geminiApiKey,
        selectedModel.modelId,
        resolvedPrompt || "",
        images || [],
        veoParams,
      );

      if (!result.success) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: result.error || "Video generation failed" },
          { status: 500 }
        );
      }

      const output = result.outputs?.[0];
      if (!output?.data && !output?.url) {
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "No output in video generation result" },
          { status: 500 }
        );
      }

      return buildMediaResponse(output);
    }

    const geminiResult = await generateWithGemini(
      requestId,
      geminiApiKey,
      resolvedPrompt,
      images || [],
      geminiModel,
      aspectRatio,
      resolution,
      useGoogleSearch,
      useImageSearch
    );

    // Final wrapping for Gemini result (ensuring DB/Storage sync)
    if (geminiResult.status === 200) {
      try {
        const geminiData = await geminiResult.clone().json();
        if (geminiData.success && geminiData.image) {
          // Trigger storage in background or wait? Better wait to ensure DB consistency
          await buildMediaResponseWithStorage({ type: "image", data: geminiData.image }, generationId, userId, wpUserId, CREDIT_COSTS["image"], "image", geminiModel as string, "gemini");
        }
      } catch (e) {
      }
    }

    return geminiResult;

  } catch (error) {
    // Mark generation as failed
    if (generationId && userId) {
      try {
        const msg = error instanceof Error ? error.message : "Unknown error";
        await db.generation.update({ where: { id: generationId }, data: { status: "failed", error: msg } });
      } catch { /* non-fatal */ }
    }

    let errorMessage = "Generation failed";
    let errorDetails = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      if ("cause" in error && error.cause) {
        errorDetails = JSON.stringify(error.cause);
      }
    }

    if (error && typeof error === "object") {
      const apiError = error as Record<string, unknown>;
      if (apiError.status) errorDetails += ` Status: ${apiError.status}`;
      if (apiError.statusText) errorDetails += ` ${apiError.statusText}`;
    }

    if (errorMessage.includes("429")) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: "Rate limit reached. Please wait and try again." },
        { status: 429 }
      );
    }
    return NextResponse.json<GenerateResponse>({ success: false, error: errorMessage }, { status: 500 });
  }
}



