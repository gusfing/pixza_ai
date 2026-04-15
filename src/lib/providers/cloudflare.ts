import {
  ProviderInterface,
  ProviderModel,
  ModelCapability,
  GenerationInput,
  GenerationOutput,
  registerProvider,
} from "@/lib/providers";

const PROVIDER_SETTINGS_KEY = "node-banana-provider-settings";

const CLOUDFLARE_MODELS: ProviderModel[] = [
  {
    id: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    name: "SDXL Base",
    description: "Stable Diffusion XL Base 1.0 by Stability AI. High-quality image generation.",
    provider: "cloudflare",
    capabilities: ["text-to-image", "image-to-image"],
    coverImage: undefined,
  },
  {
    id: "@cf/bytedance/stable-diffusion-xl-lightning",
    name: "SDXL Lightning",
    description: "Ultra-fast text-to-image generation from ByteDance. Generates images in 1-4 steps.",
    provider: "cloudflare",
    capabilities: ["text-to-image"],
    coverImage: undefined,
  },
  {
    id: "@cf/lykon/dreamshaper-8-lcm",
    name: "DreamShaper 8 (LCM)",
    description: "Artistic and versatile image model optimized with Latent Consistency Models (LCM).",
    provider: "cloudflare",
    capabilities: ["text-to-image"],
    coverImage: undefined,
  },
  {
    id: "@cf/black-forest-labs/flux-1-schnell",
    name: "FLUX.1 Schnell",
    description: "High-performance text-to-image model by Black Forest Labs. Excellent prompt adherence.",
    provider: "cloudflare",
    capabilities: ["text-to-image"],
    coverImage: undefined,
  },
  {
    id: "@cf/runwayml/stable-diffusion-v1-5-img2img",
    name: "SD 1.5 Img2Img",
    description: "Image-to-image transformations using Stable Diffusion v1.5.",
    provider: "cloudflare",
    capabilities: ["image-to-image"],
    coverImage: undefined,
  }
];

function getSettingsFromStorage(): any {
  if (typeof window === "undefined") return null;
  try {
    const settingsJson = localStorage.getItem(PROVIDER_SETTINGS_KEY);
    return settingsJson ? JSON.parse(settingsJson) : null;
  } catch {
    return null;
  }
}

const cloudflareProvider: ProviderInterface = {
  id: "cloudflare",
  name: "Cloudflare",

  async listModels(): Promise<ProviderModel[]> {
    return CLOUDFLARE_MODELS;
  },

  async searchModels(query: string): Promise<ProviderModel[]> {
    const lowerQuery = query.toLowerCase();
    return CLOUDFLARE_MODELS.filter(m => 
      m.name.toLowerCase().includes(lowerQuery) || 
      m.id.toLowerCase().includes(lowerQuery)
    );
  },

  async getModel(modelId: string): Promise<ProviderModel | null> {
    return CLOUDFLARE_MODELS.find(m => m.id === modelId) || null;
  },

  async generate(_input: GenerationInput): Promise<GenerationOutput> {
    // Generation is handled by the API route on the server
    throw new Error("Generation should be handled server-side via API route");
  },

  isConfigured(): boolean {
    const settings = getSettingsFromStorage();
    // For Cloudflare we need both the account ID and token
    return !!(settings?.providers?.cloudflare?.apiKey && settings?.providers?.cloudflare?.accountId);
  },

  getApiKey(): string | null {
    const settings = getSettingsFromStorage();
    return settings?.providers?.cloudflare?.apiKey ?? null;
  }
};

// Self-register
if (typeof window !== "undefined") {
  registerProvider(cloudflareProvider);
}

export default cloudflareProvider;
