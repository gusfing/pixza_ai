# Pixza Studio — AI Providers, Costs & Features

> Last updated: April 2026  
> All prices are pay-as-you-go API rates in USD. Costs are what Pixza pays the provider per generation.

---

## Overview

Pixza Studio routes generation requests across **6 AI providers** depending on the media type, quality tier, and user plan. Each provider is accessed via its REST API using keys stored in environment variables.

| Provider | Media Types | Plan Required | Env Key |
|---|---|---|---|
| Google Gemini | Image, Video | Free + Pro | `GEMINI_API_KEY` |
| fal.ai | Image, Video, Audio, 3D | Pro | `FAL_API_KEY` |
| Replicate | 3D | Pro | `REPLICATE_API_KEY` |
| WaveSpeed | Image | Pro | `WAVESPEED_API_KEY` |
| Kie.ai | Image | Pro | `KIE_API_KEY` |
| Cloudflare AI | Image | Free | `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` |

---

## 1. Image Generation

### Google Gemini (Imagen)

| Model | Internal ID | Resolution | Cost/Image | Generation Time | Quality |
|---|---|---|---|---|---|
| Gemini Imagen 3 | `nano-banana-pro` | Up to 4K | $0.134 (2K) / $0.24 (4K) | 40–90 sec | ⭐⭐⭐⭐⭐ Photorealistic, best quality |
| Gemini Imagen 4 | `nano-banana-2` | Up to 4K | $0.039 (standard) | 20–50 sec | ⭐⭐⭐⭐ Fast, high quality |

- **Free tier**: Limited daily quota via AI Studio only. No free production tier.
- **Batch discount**: 50% off for batch API calls (Imagen 3: $0.067/image at 2K).
- **Strengths**: Best photorealism, prompt adherence, text rendering in images.
- **Weaknesses**: Slower than FLUX, higher cost at 4K.

---

### fal.ai (FLUX family)

| Model | Internal ID | Resolution | Cost/Image | Generation Time | Quality |
|---|---|---|---|---|---|
| FLUX.1 Pro | `fal-ai/flux-pro` | Up to 2K | ~$0.055 | 8–15 sec | ⭐⭐⭐⭐⭐ Best FLUX quality |
| FLUX.1 Schnell | `fal-ai/flux/schnell` | 1K | ~$0.003 | 1–3 sec | ⭐⭐⭐ Fast, lower detail |
| FLUX Realism | `fal-ai/flux-realism` | 1K | ~$0.025 | 5–10 sec | ⭐⭐⭐⭐ Photorealistic portraits |
| FLUX Dev I2I | `fal-ai/flux/dev/image-to-image` | 1K | ~$0.025 | 5–12 sec | ⭐⭐⭐⭐ Image-to-image |

- **Free tier**: None. Pay-as-you-go only.
- **Strengths**: Fast inference, wide model variety, image-to-image support.
- **Weaknesses**: Lower max resolution than Gemini Imagen 3.

---

### WaveSpeed

| Model | Internal ID | Resolution | Cost/Image | Generation Time | Quality |
|---|---|---|---|---|---|
| FLUX Ultra Fast | `wavespeed-ai/flux-dev-ultra-fast` | 1K | ~$0.003–0.006 | <2 sec | ⭐⭐⭐ Speed-optimised |

- **Strengths**: Fastest image generation available. Good for rapid iteration.
- **Weaknesses**: Lower quality ceiling than FLUX Pro or Imagen.

---

### Cloudflare AI (Free Tier Models)

| Model | Internal ID | Resolution | Cost/Image | Generation Time | Quality |
|---|---|---|---|---|---|
| Stable Diffusion XL | `@cf/stabilityai/stable-diffusion-xl-base-1.0` | 1K | Free* | 5–15 sec | ⭐⭐⭐ |
| SDXL Lightning | `@cf/bytedance/stable-diffusion-xl-lightning` | 1K | Free* | 2–5 sec | ⭐⭐⭐ |
| DreamShaper 8 LCM | `@cf/lykon/dreamshaper-8-lcm` | 1K | Free* | 2–4 sec | ⭐⭐⭐ |
| FLUX.1 Schnell (CF) | `@cf/black-forest-labs/flux-1-schnell` | 1K | Free* | 2–5 sec | ⭐⭐⭐ |
| SD 1.5 Img2Img | `@cf/runwayml/stable-diffusion-v1-5-img2img` | 512px | Free* | 3–8 sec | ⭐⭐ |

*Free within Cloudflare Workers AI free tier limits (10,000 neurons/day). Available to all users including Free plan.

---

### Image Cost Summary

| Use Case | Recommended Model | Cost/Image | Speed |
|---|---|---|---|
| Highest quality | Gemini Imagen 3 (4K) | $0.24 | Slow (40–90s) |
| Best value quality | Gemini Imagen 4 | $0.039 | Medium (20–50s) |
| Fast photorealism | FLUX Realism | $0.025 | Fast (5–10s) |
| Fastest generation | WaveSpeed FLUX | $0.003–0.006 | Very fast (<2s) |
| Free (basic) | Cloudflare SDXL | $0.00 | Medium (5–15s) |

---

## 2. Video Generation

### Google Veo (via Gemini API)

| Model | Internal ID | Resolution | Cost/Second | Duration | Generation Time | Quality |
|---|---|---|---|---|---|---|
| Veo 2 | `veo-2.0-generate-001` | 720p | ~$0.10–0.15/sec | 5–8 sec | 2–5 min | ⭐⭐⭐⭐ |
| Veo 3 | `veo-3.0-generate-preview` | 1080p | $0.15/sec (Fast) / $0.40/sec (Standard) | 5–8 sec | 3–8 min | ⭐⭐⭐⭐⭐ Native audio |

**Example costs (Veo 3, 8-second clip):**
- Fast mode: 8 × $0.15 = **$1.20/video**
- Standard mode: 8 × $0.40 = **$3.20/video**

- **Strengths**: Native audio generation (Veo 3), best motion quality, Google's flagship model.
- **Weaknesses**: Most expensive video option, slow generation, no free tier.
- **Note**: Veo 3 is Pro-only in Pixza.

---

### fal.ai (Kling, Wan, MiniMax)

| Model | Internal ID | Resolution | Cost/Second | Duration | Generation Time | Quality |
|---|---|---|---|---|---|---|
| Kling 1.6 Pro T2V | `fal-ai/kling-video/v1.6/pro/text-to-video` | 1080p | $0.07/sec | 5–10 sec | 2–4 min | ⭐⭐⭐⭐⭐ |
| Kling 1.6 Pro I2V | `fal-ai/kling-video/v1.6/pro/image-to-video` | 1080p | $0.07/sec | 5–10 sec | 2–4 min | ⭐⭐⭐⭐⭐ |
| Wan T2V | `fal-ai/wan-t2v` | 720p | ~$0.04/sec | 3–5 sec | 1–3 min | ⭐⭐⭐ |
| MiniMax Video | `fal-ai/minimax-video` | 1080p | ~$0.05/sec | 6 sec | 2–4 min | ⭐⭐⭐⭐ |

**Example costs (Kling 1.6 Pro, 10-second clip):**
- 10 × $0.07 = **$0.70/video**

**Example costs (Wan T2V, 5-second clip):**
- 5 × $0.04 = **$0.20/video**

- **Strengths**: Kling has best motion quality after Veo, wide model choice, image-to-video support.
- **Weaknesses**: No native audio (except Kling 2.6+, not yet integrated).

---

### Video Cost Summary

| Use Case | Model | Cost (8s clip) | Speed |
|---|---|---|---|
| Best quality + audio | Veo 3 Standard | $3.20 | Slow (3–8 min) |
| Best quality, fast | Veo 3 Fast | $1.20 | Medium (2–4 min) |
| Best value quality | Kling 1.6 Pro | $0.56 | Medium (2–4 min) |
| Budget video | Wan T2V | $0.20 | Fast (1–3 min) |

---

## 3. Audio Generation

### fal.ai (Stable Audio)

| Model | Internal ID | Duration | Cost | Generation Time | Quality |
|---|---|---|---|---|---|
| Stable Audio | `fal-ai/stable-audio` | Up to 90 sec | ~$0.05–0.10/clip | 10–30 sec | ⭐⭐⭐⭐ |

- **Strengths**: High-quality music and sound effects, long duration support.
- **Weaknesses**: No voice/speech generation, limited to music/ambient audio.
- **Pro only** in Pixza.

---

## 4. 3D Generation

### fal.ai

| Model | Internal ID | Output | Cost | Generation Time | Quality |
|---|---|---|---|---|---|
| Trellis | `fal-ai/trellis` | GLB mesh | ~$0.10–0.20 | 30–90 sec | ⭐⭐⭐⭐⭐ Best quality |
| Zero123 | `fal-ai/stable-zero123` | GLB mesh | ~$0.05–0.10 | 20–60 sec | ⭐⭐⭐ Single-view |

### Replicate

| Model | Internal ID | Output | Cost | Generation Time | Quality |
|---|---|---|---|---|---|
| TripoSR | `stability-ai/triposr` | GLB mesh | ~$0.004–0.01 | 10–30 sec | ⭐⭐⭐ Fast, lower detail |

- **Trellis**: Best for high-quality 3D assets from images. Supports multi-view.
- **Zero123**: Single image to 3D, good for simple objects.
- **TripoSR**: Fastest and cheapest, good for prototyping.
- All 3D models are **Pro only** in Pixza.

---

## 5. Cost Per Credit (Pixza Internal)

Pixza charges users in credits, not raw API costs. The markup covers infrastructure, storage, and margin.

| Media Type | Credits Charged | Approx. API Cost | Margin |
|---|---|---|---|
| Image | 1 credit | $0.003–$0.24 | Varies by model |
| Video | 10 credits | $0.20–$3.20 | Varies by model/length |
| Audio | 3 credits | $0.05–$0.10 | ~2–3× |
| 3D | 5 credits | $0.004–$0.20 | ~2–4× |

**Plan credit limits:**
- Free: 50 credits/period
- Pro: 2,000 credits/period
- Agency: 10,000 credits/period

---

## 6. Current Platform Features

### Studio (Create Page)

| Feature | Description | Plan |
|---|---|---|
| Image Generation | Text-to-image across 6 models | Free + Pro |
| Image-to-Image | Upload reference, transform with FLUX | Pro |
| Video Generation | Text-to-video and image-to-video | Pro |
| Audio Generation | Music and sound effects via Stable Audio | Pro |
| 3D Generation | Image-to-3D mesh (GLB) via Trellis/TripoSR | Pro |
| Model Selector | Switch between providers per media type | All |
| Reference Images | Upload composition, subject, lighting refs | All |
| Template Vault | Pre-built prompts for common use cases | All |
| Gallery/Vault | Browse past generations | All |
| Export | Download generated media | All |
| Batch Engine | Multi-node high-volume processing | Pro (coming) |

### Templates (Built-in)

| Template | Model | Type |
|---|---|---|
| Floating Product Shot | FLUX.1 Pro | Image |
| Cinematic Portrait | FLUX Realism | Image |
| Epic Concept Art | Gemini Imagen 4 | Image |
| Product Reveal Video | Kling 1.6 Pro | Video |

### Auth & User System

| Feature | Description |
|---|---|
| WordPress backend | All users stored in WordPress |
| JWT authentication | Secure token-based login |
| Credit system | Per-generation credit deduction via WP |
| Plan management | Free / Pro / Agency tiers |
| Admin dashboard | Edit user plans, credits, limits |
| Settings page | Real-time credit balance, subscription info |

### Infrastructure

| Component | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Auth | WordPress JWT + NextAuth |
| Database | PostgreSQL via Prisma (generation history) |
| Storage | Cloudflare R2 (generated media) |
| Rate limiting | Upstash Redis (20/hr free, 200/hr pro) |
| Deployment | Coolify (self-hosted Docker) |
| CMS / Blog | WordPress REST API |

---

## 7. Provider Comparison at a Glance

| Provider | Best For | Avg Cost | Speed | Free Tier |
|---|---|---|---|---|
| Google Gemini | Highest quality images + video | $0.039–$0.40/s | Slow | No |
| fal.ai | Best variety, video, 3D, audio | $0.003–$0.07/s | Fast | No |
| WaveSpeed | Ultra-fast image iteration | $0.003–0.006 | Very fast | No |
| Replicate | 3D prototyping | $0.004–0.01 | Fast | No |
| Cloudflare AI | Free basic image generation | $0.00 | Medium | Yes |

---

## 8. Monthly Cost Estimates (Platform Level)

Assuming a platform with **1,000 active users** generating an average of **20 images/month** each:

| Scenario | Model Mix | Monthly API Cost |
|---|---|---|
| All free-tier (Cloudflare) | 100% Cloudflare | ~$0 |
| Budget mix | 70% Cloudflare, 30% FLUX Schnell | ~$18 |
| Standard mix | 50% Imagen 4, 50% FLUX Pro | ~$825 |
| Premium mix | 80% Imagen 3, 20% FLUX Pro | ~$2,310 |

For **100 videos/month** (10s each, Kling 1.6 Pro):
- 100 × $0.70 = **$70/month**

For **100 videos/month** (8s each, Veo 3 Standard):
- 100 × $3.20 = **$320/month**

---

*Content was paraphrased and compiled from official provider documentation and pricing pages. Sources: [fal.ai](https://fal.ai), [Google Cloud Vertex AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing), [Replicate Pricing](https://replicate.com/pricing), [aifreeapi.com](https://www.aifreeapi.com).*
